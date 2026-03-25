export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface CoinMarketApiItem {
  id?: unknown
  symbol?: unknown
  name?: unknown
  image?: unknown
}

export interface CoinPriceInfo {
  usd: number | null
  eur: number | null
  ils: number | null
}

export interface RealtimePriceApiMap {
  [symbol: string]: unknown
}

export interface ReportsPricePoint {
  timestamp: string
  [symbol: string]: number | string
}

export interface CoinSummary {
  id: string
  symbol: string
  name: string
  image: string
}

export interface SelectedCoin {
  id: string
  symbol: string
  name: string
}