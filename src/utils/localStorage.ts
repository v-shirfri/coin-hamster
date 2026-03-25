import type { SelectedCoin } from '../types/coin'

const SELECTED_COINS_KEY = 'selectedCoins'

function isSelectedCoin(value: unknown): value is SelectedCoin {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.symbol === 'string' &&
    typeof candidate.name === 'string'
  )
}

export function loadSelectedCoinsFromStorage(): SelectedCoin[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const rawValue = window.localStorage.getItem(SELECTED_COINS_KEY)

    if (!rawValue) {
      return []
    }

    const parsedValue: unknown = JSON.parse(rawValue)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.filter(isSelectedCoin)
  } catch {
    return []
  }
}

export function saveSelectedCoinsToStorage(selectedCoins: SelectedCoin[]) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(SELECTED_COINS_KEY, JSON.stringify(selectedCoins))
  } catch {
    // Ignore storage write failures and keep the app usable.
  }
}