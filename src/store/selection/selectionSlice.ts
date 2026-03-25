import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { SelectedCoin } from '../../types/coin'
import { loadSelectedCoinsFromStorage } from '../../utils/localStorage'

export interface SelectionState {
  selectedCoins: SelectedCoin[]
}

const initialState: SelectionState = {
  selectedCoins: loadSelectedCoinsFromStorage(),
}

const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    addSelectedCoin(state, action: PayloadAction<SelectedCoin>) {
      const exists = state.selectedCoins.some(
        (coin) => coin.id === action.payload.id,
      )

      if (!exists && state.selectedCoins.length < 5) {
        state.selectedCoins.push(action.payload)
      }
    },
    removeSelectedCoin(state, action: PayloadAction<string>) {
      state.selectedCoins = state.selectedCoins.filter(
        (coin) => coin.id !== action.payload,
      )
    },
    replaceSelectedCoin(
      state,
      action: PayloadAction<{ removedCoinId: string; newCoin: SelectedCoin }>,
    ) {
      const { removedCoinId, newCoin } = action.payload
      const nextCoins = state.selectedCoins.filter((coin) => coin.id !== removedCoinId)
      const exists = nextCoins.some((coin) => coin.id === newCoin.id)

      if (!exists) {
        nextCoins.push(newCoin)
      }

      state.selectedCoins = nextCoins
    },
  },
})

export const {
  addSelectedCoin,
  removeSelectedCoin,
  replaceSelectedCoin,
} = selectionSlice.actions

export const selectionReducer = selectionSlice.reducer