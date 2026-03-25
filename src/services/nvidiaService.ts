import type {
  AiRecommendationResult,
  CoinAiMarketData,
  NvidiaChoice,
  NvidiaResponseBody,
  RecommendationDecision,
} from '../types/ai'

const NVIDIA_ENDPOINT = '/api/nvidia/v1/chat/completions'
const RATE_LIMIT_MSG = 'NVIDIA API usage limit was reached. Please wait and try again later or check your API quota.'

export type NvidiaErrorCode = 'RATE_LIMIT' | 'REQUEST_FAILED'

export class NvidiaRequestError extends Error {
  code: NvidiaErrorCode

  constructor(message: string, code: NvidiaErrorCode) {
    super(message)
    this.name = 'NvidiaRequestError'
    this.code = code
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function sanitize(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null
  return value.trim()
}

function buildApiFailureMessage(status: number, errorBody: unknown) {
  const fallback = `NVIDIA API request failed with status ${status}. Check the browser console for details.`
  if (!isRecord(errorBody) || !isRecord(errorBody.error)) return fallback
  const msg = (errorBody.error as Record<string, unknown>).message
  return typeof msg === 'string' && msg.trim() ? msg.trim() : fallback
}

export function getNvidiaApiKey() {
  return sanitize(import.meta.env.VITE_NVIDIA_API_KEY)
}

export function getNvidiaApiKeyHelpText() {
  return 'Missing NVIDIA API key. Create a .env file in the project root, add VITE_NVIDIA_API_KEY=your_key, and restart the Vite dev server.'
}

export function isNvidiaRateLimitError(error: unknown): error is NvidiaRequestError {
  return error instanceof NvidiaRequestError && error.code === 'RATE_LIMIT'
}

function toDecision(text: string): RecommendationDecision | null {
  const v = text.trim().toLowerCase()
  if (
    v.includes('not buy') || v.includes('do not buy') ||
    v.includes("don't buy") || v.includes('dont buy') ||
    v.includes('not recommend') || v.includes('avoid') ||
    v === 'sell' || v === 'hold'
  ) return 'not buy'
  if (v.includes('buy')) return 'buy'
  return null
}

function buildPrompt(coin: CoinAiMarketData) {
  return [
    'You are a strict crypto analyst. Respond with ONLY a valid JSON object, nothing else.',
    'Format: {"decision":"buy","explanation":"one sentence reason"}',
    'OR: {"decision":"not buy","explanation":"one sentence reason"}',
    'The decision field must be exactly "buy" or "not buy". Keep explanation under 20 words.',
    'Base your decision ONLY on the numbers below. If price is falling or highly speculative, say "not buy".',
    '',
    `Coin: ${coin.name} (${coin.symbol.toUpperCase()})`,
    `Price: $${coin.currentPriceUsd ?? 'N/A'}`,
    `Market Cap: $${coin.marketCapUsd ?? 'N/A'}`,
    `24h Volume: $${coin.totalVolumeUsd ?? 'N/A'}`,
    `24h Change: ${coin.priceChange24h ?? 'N/A'}%`,
    `7d Change: ${coin.priceChange7d ?? 'N/A'}%`,
    `30d Change: ${coin.priceChange30d ?? 'N/A'}%`,
  ].join('\n')
}

function extractJsonContent(content: string): string {
  const stripped = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
  const start = stripped.indexOf('{')
  const end = stripped.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    return stripped.slice(start, end + 1)
  }
  return stripped
}

function parseRecommendation(content: string): AiRecommendationResult {
  try {
    const jsonStr = extractJsonContent(content)
    const parsed: unknown = JSON.parse(jsonStr)
    if (isRecord(parsed)) {
      const decision = toDecision(typeof parsed.decision === 'string' ? parsed.decision : '')
      const explanation = typeof parsed.explanation === 'string' ? parsed.explanation.trim() : null
      if (decision && explanation) return { decision, explanation }
    }
  } catch { /* fall through to text analysis */ }

  // Fallback: extract decision from raw text
  const decision = toDecision(content)
  if (decision) {
    // Try to get a clean explanation by removing JSON syntax noise
    const cleaned = content
      .replace(/[{}"]/g, '')
      .replace(/decision\s*:\s*(buy|not buy)/gi, '')
      .replace(/explanation\s*:/gi, '')
      .replace(/```/g, '')
      .trim()
    const explanation = cleaned.length > 10 ? cleaned.slice(0, 200) : 'Based on current market data.'
    return { decision, explanation }
  }

  throw new Error(`Could not interpret AI response. Raw: "${content.slice(0, 120)}"`)
}

function isQuotaOrRateLimitError(status: number, errorBody: unknown) {
  if (status !== 429 || !isRecord(errorBody) || !isRecord(errorBody.error)) return false
  const err = errorBody.error as Record<string, unknown>
  const code = String(err.code ?? '').toLowerCase()
  const type = String(err.type ?? '').toLowerCase()
  return (
    code === 'insufficient_quota' || code === 'rate_limit_exceeded' ||
    type === 'insufficient_quota' || type === 'rate_limit_error'
  )
}

export async function fetchAiRecommendation(coin: CoinAiMarketData): Promise<AiRecommendationResult> {
  const apiKey = getNvidiaApiKey()
  const model = sanitize(import.meta.env.VITE_NVIDIA_MODEL) ?? 'meta/llama-3.1-8b-instruct'

  if (!apiKey) throw new Error(getNvidiaApiKeyHelpText())

  const response = await fetch(NVIDIA_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [
        { role: 'system', content: 'You are an objective crypto analyst. You must return ONLY a JSON object. Be critical — say "not buy" when data shows negative trends.' },
        { role: 'user', content: buildPrompt(coin) },
      ],
      max_tokens: 300,
      top_p: 1,
    }),
  })

  if (!response.ok) {
    let errorBody: unknown = null
    try {
      errorBody = await response.json()
    } catch {
      try { errorBody = await response.text() } catch { /* empty */ }
    }

    if (isQuotaOrRateLimitError(response.status, errorBody)) {
      throw new NvidiaRequestError(RATE_LIMIT_MSG, 'RATE_LIMIT')
    }
    throw new NvidiaRequestError(buildApiFailureMessage(response.status, errorBody), 'REQUEST_FAILED')
  }

  const data: unknown = await response.json()
  if (!isRecord(data)) throw new Error('Unexpected NVIDIA API response.')

  const choices = (data as NvidiaResponseBody).choices
  if (!Array.isArray(choices) || choices.length === 0) throw new Error('NVIDIA API returned no choices.')

  const firstChoice = choices[0] as NvidiaChoice
  if (!isRecord(firstChoice.message) || typeof firstChoice.message.content !== 'string') {
    throw new Error('NVIDIA API returned an invalid message.')
  }

  return parseRecommendation(firstChoice.message.content)
}
