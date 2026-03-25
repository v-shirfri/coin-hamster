import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { fetchPopularCoins } from '../../services/coinsService'
import type { AsyncStatus, CoinSummary } from '../../types/coin'

export const fetchCoins = createAsyncThunk<CoinSummary[], void, { rejectValue: string }>(
  'coins/fetchCoins',
  async (_, thunkApi) => {
    try {
      return await fetchPopularCoins()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch crypto coins.'

      return thunkApi.rejectWithValue(message)
    }
  },
)

export interface CoinsState {
  items: CoinSummary[]
  status: AsyncStatus
  error: string | null
}

const initialState: CoinsState = {
  items: [],
  status: 'idle',
  error: null,
}

const coinsSlice = createSlice({
  name: 'coins',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoins.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCoins.fulfilled, (state, action) => {
        state.items = action.payload
        state.status = 'succeeded'
      })
      .addCase(fetchCoins.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Failed to fetch crypto coins.'
      })
  },
})

export const coinsReducer = coinsSlice.reducer