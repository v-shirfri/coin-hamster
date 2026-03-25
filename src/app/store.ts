import { configureStore } from '@reduxjs/toolkit'

import { coinsReducer } from '../store/coins/coinsSlice'
import { selectionReducer } from '../store/selection/selectionSlice'

export const store = configureStore({
  reducer: {
    coins: coinsReducer,
    selection: selectionReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch