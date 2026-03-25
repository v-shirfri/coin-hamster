import { useEffect, useState } from 'react'

import { useAppDispatch, useAppSelector } from '../app/hooks'
import CoinCard from '../Components/coins/CoinCard'
import SelectionLimitModal from '../Components/selection/SelectionLimitModal'
import { fetchCoins } from '../store/coins/coinsSlice'
import {
  addSelectedCoin,
  removeSelectedCoin,
  replaceSelectedCoin,
} from '../store/selection/selectionSlice'
import { fetchCoinMoreInfo } from '../services/moreInfoService'
import type { AsyncStatus, CoinPriceInfo, CoinSummary, SelectedCoin } from '../types/coin'

interface MoreInfoState {
  coinId: string | null
  error: string | null
  prices: CoinPriceInfo | null
  status: AsyncStatus
}

function toSelectedCoin(coin: CoinSummary): SelectedCoin {
  return {
    id: coin.id,
    symbol: coin.symbol,
    name: coin.name,
  }
}

function HomePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const dispatch = useAppDispatch()
  const { items, status, error } = useAppSelector((state) => state.coins)
  const selectedCoins = useAppSelector((state) => state.selection.selectedCoins)
  const [pendingCoin, setPendingCoin] = useState<SelectedCoin | null>(null)
  const [coinToRemoveId, setCoinToRemoveId] = useState('')
  const [expandedCoinId, setExpandedCoinId] = useState<string | null>(null)
  const [moreInfoState, setMoreInfoState] = useState<MoreInfoState>({
    coinId: null,
    error: null,
    prices: null,
    status: 'idle',
  })

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchCoins())
    }
  }, [dispatch, status])

  useEffect(() => {
    if (!expandedCoinId) {
      setMoreInfoState({
        coinId: null,
        error: null,
        prices: null,
        status: 'idle',
      })
      return
    }

    let isActive = true

    setMoreInfoState({
      coinId: expandedCoinId,
      error: null,
      prices: null,
      status: 'loading',
    })

    void fetchCoinMoreInfo(expandedCoinId)
      .then((prices) => {
        if (!isActive) {
          return
        }

        setMoreInfoState({
          coinId: expandedCoinId,
          error: null,
          prices,
          status: 'succeeded',
        })
      })
      .catch((fetchError: unknown) => {
        if (!isActive) {
          return
        }

        setMoreInfoState({
          coinId: expandedCoinId,
          error:
            fetchError instanceof Error
              ? fetchError.message
              : 'Failed to load coin details.',
          prices: null,
          status: 'failed',
        })
      })

    return () => {
      isActive = false
    }
  }, [expandedCoinId])

  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const selectedCoinIds = new Set(selectedCoins.map((coin) => coin.id))

  const filteredCoins = items.filter((coin) => {
    if (!normalizedSearchTerm) {
      return true
    }

    return (
      coin.name.toLowerCase().includes(normalizedSearchTerm) ||
      coin.symbol.toLowerCase().includes(normalizedSearchTerm)
    )
  })

  const showNoSearchResults = status === 'succeeded' && items.length > 0 && filteredCoins.length === 0

  const handleToggleCoin = (coin: CoinSummary, nextChecked: boolean) => {
    const selectedCoin = toSelectedCoin(coin)

    if (!nextChecked) {
      dispatch(removeSelectedCoin(coin.id))
      return
    }

    if (selectedCoinIds.has(coin.id)) {
      return
    }

    if (selectedCoins.length < 5) {
      dispatch(addSelectedCoin(selectedCoin))
      return
    }

    setPendingCoin(selectedCoin)
    setCoinToRemoveId(selectedCoins[0]?.id ?? '')
  }

  const handleCancelReplace = () => {
    setPendingCoin(null)
    setCoinToRemoveId('')
  }

  const handleConfirmReplace = () => {
    if (!pendingCoin || !coinToRemoveId) {
      return
    }

    dispatch(
      replaceSelectedCoin({
        removedCoinId: coinToRemoveId,
        newCoin: pendingCoin,
      }),
    )

    handleCancelReplace()
  }

  const handleMoreInfoToggle = (coinId: string) => {
    setExpandedCoinId((currentCoinId) =>
      currentCoinId === coinId ? null : coinId,
    )
  }

  return (
    <section className="page-section">
      <div className="page-section__header">
        <h2>Popular Crypto Coins</h2>
        <p>Browse the top 100 coins and filter them locally by name.</p>
      </div>

      <div className="app-search">
        <label className="app-search__label" htmlFor="coin-search">
          Search coins
        </label>
        <input
          className="app-search__input"
          id="coin-search"
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name"
        />
      </div>

      <div className="selection-summary state-card">
        <p>
          Selected coins: <strong>{selectedCoins.length}</strong> / 5
        </p>
      </div>

      {status === 'loading' && (
        <div className="state-card">
          <p>Loading coins...</p>
        </div>
      )}

      {status === 'failed' && (
        <div className="state-card state-card--error">
          <p>{error ?? 'Failed to load coins.'}</p>
          <button className="state-card__button" onClick={() => void dispatch(fetchCoins())} type="button">
            Try Again
          </button>
        </div>
      )}

      {status === 'succeeded' && items.length === 0 && (
        <div className="state-card">
          <p>No coins were returned from the API.</p>
        </div>
      )}

      {showNoSearchResults && (
        <div className="state-card">
          <p>No coins match "{searchTerm}".</p>
        </div>
      )}

      {filteredCoins.length > 0 && (
        <div className="coin-grid">
          {filteredCoins.map((coin) => (
            <CoinCard
              coin={coin}
              isSelected={selectedCoinIds.has(coin.id)}
              isMoreInfoOpen={expandedCoinId === coin.id}
              key={coin.id}
              moreInfoError={
                moreInfoState.coinId === coin.id ? moreInfoState.error : null
              }
              moreInfoPrices={
                moreInfoState.coinId === coin.id ? moreInfoState.prices : null
              }
              moreInfoStatus={
                moreInfoState.coinId === coin.id ? moreInfoState.status : 'idle'
              }
              onMoreInfoToggle={handleMoreInfoToggle}
              onToggle={handleToggleCoin}
            />
          ))}
        </div>
      )}

      {pendingCoin && (
        <SelectionLimitModal
          coinToRemoveId={coinToRemoveId}
          onCancel={handleCancelReplace}
          onConfirm={handleConfirmReplace}
          onSelectCoinToRemove={setCoinToRemoveId}
          pendingCoin={pendingCoin}
          selectedCoins={selectedCoins}
        />
      )}
    </section>
  )
}

export default HomePage