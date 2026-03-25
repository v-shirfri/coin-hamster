import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'

import { store } from './app/store'
import './index.css'
import App from './App.tsx'
import { saveSelectedCoinsToStorage } from './utils/localStorage'

store.subscribe(() => {
  saveSelectedCoinsToStorage(store.getState().selection.selectedCoins)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <HashRouter>
  <App />
</HashRouter>
    </Provider>
  </StrictMode>,
)
