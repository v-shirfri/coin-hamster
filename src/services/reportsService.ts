import type { RealtimePriceApiMap, SelectedCoin } from '../types/coin'

const REPORTS_ENDPOINT = 'https://min-api.cryptocompare.com/data/pricemulti'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export async function fetchRealtimePrices(
  selectedCoins: SelectedCoin[],
): Promise<Record<string, number>> {
  const symbols = selectedCoins.map((coin) => coin.symbol.toUpperCase())

  if (symbols.length === 0) {
    return {}
  }

  const url = new URL(REPORTS_ENDPOINT)

  url.searchParams.set('tsyms', 'USD')
  url.searchParams.set('fsyms', symbols.join(','))

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error('Failed to fetch realtime prices.')
  }

  const data: unknown = await response.json()

  if (!isRecord(data)) {
    throw new Error('Unexpected realtime response.')
  }

  const prices: Record<string, number> = {}

  for (const symbol of symbols) {
    const entry = (data as RealtimePriceApiMap)[symbol]
    if (isRecord(entry) && typeof entry.USD === 'number') {
      prices[symbol] = entry.USD
    }
  }

  return prices
}