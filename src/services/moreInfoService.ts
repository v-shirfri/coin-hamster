import type { CoinPriceInfo } from '../types/coin'

const COIN_DETAILS_ENDPOINT = 'https://api.coingecko.com/api/v3/coins'
const COINGECKO_API_KEY = import.meta.env.VITE_COINGECKO_API_KEY as string | undefined

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function mapCoinPriceInfo(data: Record<string, unknown>): CoinPriceInfo {
  const none: CoinPriceInfo = { usd: null, eur: null, ils: null }
  if (!isRecord(data.market_data)) return none
  const price = data.market_data.current_price
  if (!isRecord(price)) return none
  const num = (key: string) => typeof price[key] === 'number' ? price[key] as number : null
  return { usd: num('usd'), eur: num('eur'), ils: num('ils') }
}

export async function fetchCoinMoreInfo(coinId: string): Promise<CoinPriceInfo> {
  const url = new URL(`${COIN_DETAILS_ENDPOINT}/${coinId}`)
  if (COINGECKO_API_KEY) url.searchParams.set('x_cg_demo_api_key', COINGECKO_API_KEY)
  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error('Failed to fetch coin details.')
  }

  const data: unknown = await response.json()

  if (!isRecord(data)) {
    throw new Error('Unexpected coin details response.')
  }

  return mapCoinPriceInfo(data)
}