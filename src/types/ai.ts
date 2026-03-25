import type { AsyncStatus } from './coin'

export type RecommendationDecision = 'buy' | 'not buy'

export type AiRecommendationStatus = AsyncStatus

export interface CoinAiMarketData {
  id: string
  symbol: string
  name: string
  currentPriceUsd: number | null
  marketCapUsd: number | null
  totalVolumeUsd: number | null
  priceChange24h: number | null
  priceChange7d: number | null
  priceChange30d: number | null
}

export interface AiRecommendationResult {
  decision: RecommendationDecision
  explanation: string
}

export interface NvidiaChoice {
  message?: unknown
}

export interface NvidiaResponseBody {
  choices?: unknown
}