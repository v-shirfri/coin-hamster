import type { CoinAiMarketData } from '../types/ai'

const COIN_DETAILS_ENDPOINT = 'https://api.coingecko.com/api/v3/coins'
const COINGECKO_API_KEY = import.meta.env.VITE_COINGECKO_API_KEY as string | undefined

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function mapCoinAiMarketData(item: Record<string, unknown>): CoinAiMarketData | null {
  if (
    typeof item.id !== 'string' ||
    typeof item.symbol !== 'string' ||
    typeof item.name !== 'string' ||
    !isRecord(item.market_data)
  ) {
    return null
  }

  const md = item.market_data
  const asNum = (val: unknown) => typeof val === 'number' ? val : null
  const nestedUsd = (key: string) => isRecord(md[key]) ? asNum((md[key] as Record<string, unknown>).usd) : null

  return {
    id: item.id,
    symbol: item.symbol,
    name: item.name,
    currentPriceUsd: nestedUsd('current_price'),
    marketCapUsd: nestedUsd('market_cap'),
    totalVolumeUsd: nestedUsd('total_volume'),
    priceChange24h: asNum(md.price_change_percentage_24h),
    priceChange7d: asNum(md.price_change_percentage_7d),
    priceChange30d: asNum(md.price_change_percentage_30d),
  }
}

export async function fetchCoinAiMarketData(coinId: string): Promise<CoinAiMarketData> {
  const url = new URL(`${COIN_DETAILS_ENDPOINT}/${coinId}`)
  url.searchParams.set('market_data', 'true')
  if (COINGECKO_API_KEY) url.searchParams.set('x_cg_demo_api_key', COINGECKO_API_KEY)
  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error('Failed to fetch coin market data.')
  }

  const data: unknown = await response.json()

  if (!isRecord(data)) {
    throw new Error('Unexpected AI market data response.')
  }

  const mappedData = mapCoinAiMarketData(data)

  if (!mappedData) {
    throw new Error('Missing required market data for this coin.')
  }

  return mappedData
}