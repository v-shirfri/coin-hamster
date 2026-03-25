import type { CoinMarketApiItem, CoinSummary } from '../types/coin'

const COINS_ENDPOINT = 'https://api.coingecko.com/api/v3/coins/markets'
const COINGECKO_API_KEY = import.meta.env.VITE_COINGECKO_API_KEY as string | undefined

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function mapCoinSummary(item: CoinMarketApiItem): CoinSummary | null {
  if (
    typeof item.id !== 'string' ||
    typeof item.symbol !== 'string' ||
    typeof item.name !== 'string' ||
    typeof item.image !== 'string'
  ) {
    return null
  }

  return {
    id: item.id,
    symbol: item.symbol,
    name: item.name,
    image: item.image,
  }
}

export async function fetchPopularCoins(): Promise<CoinSummary[]> {
  const url = new URL(COINS_ENDPOINT)

  url.searchParams.set('vs_currency', 'usd')
  url.searchParams.set('order', 'market_cap_desc')
  url.searchParams.set('per_page', '100')
  url.searchParams.set('page', '1')
  url.searchParams.set('sparkline', 'false')
  if (COINGECKO_API_KEY) url.searchParams.set('x_cg_demo_api_key', COINGECKO_API_KEY)

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error('Failed to fetch crypto coins.')
  }

  const data: unknown = await response.json()

  if (!Array.isArray(data)) {
    throw new Error('Unexpected coin list response.')
  }

  return data
    .map((item) => {
      if (!isRecord(item)) {
        return null
      }

      return mapCoinSummary(item)
    })
    .filter((item): item is CoinSummary => item !== null)
}