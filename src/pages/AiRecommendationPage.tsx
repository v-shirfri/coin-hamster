import { useCallback, useEffect, useRef, useState } from 'react'

import { useAppSelector } from '../app/hooks'
import { fetchCoinAiMarketData } from '../services/aiDataService'
import {
  fetchAiRecommendation,
  isNvidiaRateLimitError,
} from '../services/nvidiaService'
import type {
  AiRecommendationResult,
  AiRecommendationStatus,
  CoinAiMarketData,
} from '../types/ai'

const REQUEST_COOLDOWN_MS = 3000

function formatCurrency(value: number | null) {
  if (value === null) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatPercentage(value: number | null) {
  if (value === null) return 'N/A'
  return `${value.toFixed(2)}%`
}

function AiRecommendationPage() {
  const selectedCoins = useAppSelector((state) => state.selection.selectedCoins)
  const [selectedCoinId, setSelectedCoinId] = useState('')
  const [status, setStatus] = useState<AiRecommendationStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [hasRateLimitError, setHasRateLimitError] = useState(false)
  const [marketData, setMarketData] = useState<CoinAiMarketData | null>(null)
  const [recommendation, setRecommendation] = useState<AiRecommendationResult | null>(null)
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState(0)
  const resultRef = useRef<HTMLDivElement>(null)

  const hasCoins = selectedCoins.length > 0
  const isCoolingDown = cooldownRemainingMs > 0
  const cooldownSeconds = Math.ceil(cooldownRemainingMs / 1000)
  const isBuy = recommendation?.decision === 'buy'

  const clearResult = useCallback(() => {
    setStatus('idle')
    setError(null)
    setHasRateLimitError(false)
    setMarketData(null)
    setRecommendation(null)
  }, [])

  useEffect(() => {
    if (selectedCoins.length === 0) {
      setSelectedCoinId('')
      clearResult()
      return
    }
    const coinStillExists = selectedCoins.some((coin) => coin.id === selectedCoinId)
    if (!coinStillExists) setSelectedCoinId(selectedCoins[0].id)
  }, [selectedCoinId, selectedCoins, clearResult])

  useEffect(() => {
    clearResult()
  }, [selectedCoinId, clearResult])

  useEffect(() => {
    if (cooldownRemainingMs <= 0) return
    const intervalId = window.setInterval(() => {
      setCooldownRemainingMs((prev) => Math.max(prev - 250, 0))
    }, 250)
    return () => window.clearInterval(intervalId)
  }, [cooldownRemainingMs])

  const handleGenerateRecommendation = async () => {
    if (!selectedCoinId) {
      setError('Choose one selected coin first.')
      return
    }
    if (isCoolingDown) return

    setStatus('loading')
    setError(null)
    setHasRateLimitError(false)
    setRecommendation(null)

    try {
      const coinMarketData = await fetchCoinAiMarketData(selectedCoinId)
      const aiResult = await fetchAiRecommendation(coinMarketData)
      setMarketData(coinMarketData)
      setRecommendation(aiResult)
      setStatus('succeeded')
    } catch (requestError) {
      setStatus('failed')
      setMarketData(null)
      setRecommendation(null)
      if (isNvidiaRateLimitError(requestError)) {
        setHasRateLimitError(true)
        setError('NVIDIA API usage limit was reached. Please wait and try again later or check your API quota.')
      } else {
        setError(requestError instanceof Error ? requestError.message : 'Failed to generate the AI recommendation.')
      }
    } finally {
      setCooldownRemainingMs(REQUEST_COOLDOWN_MS)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    }
  }

  const buttonLabel =
    status === 'loading' ? 'Generating...' :
    isCoolingDown       ? `Wait ${cooldownSeconds}s` :
                          'Generate Recommendation'

  return (
    <section className="page-section">
      <div className="page-section__header">
        <h2>AI Recommendation</h2>
        <p>Choose one selected coin, load its market data, and get a short AI recommendation.</p>
      </div>

      {!hasCoins && (
        <div className="state-card">
          <p>Select at least one coin on the Home page to use the AI recommendation feature.</p>
        </div>
      )}

      {hasCoins && (
        <div className="ai-panel state-card">
          <fieldset className="ai-selector">
            <legend>Selected coins</legend>
            <div className="ai-selector__options">
              {selectedCoins.map((coin) => (
                <label className="ai-selector__option" htmlFor={`ai-coin-${coin.id}`} key={coin.id}>
                  <input
                    checked={selectedCoinId === coin.id}
                    disabled={status === 'loading'}
                    id={`ai-coin-${coin.id}`}
                    name="selected-ai-coin"
                    onChange={() => setSelectedCoinId(coin.id)}
                    type="radio"
                  />
                  <span>{coin.name} ({coin.symbol.toUpperCase()})</span>
                </label>
              ))}
            </div>
          </fieldset>

          <button
            className="state-card__button ai-panel__button"
            disabled={status === 'loading' || isCoolingDown || !selectedCoinId}
            onClick={() => void handleGenerateRecommendation()}
            type="button"
          >
            {buttonLabel}
          </button>
        </div>
      )}

      {hasCoins && status === 'loading' && (
        <div className="state-card" ref={resultRef}>
          <p>Fetching market data and generating recommendation...</p>
        </div>
      )}

      {hasCoins && status === 'failed' && (
        <div className="state-card state-card--error" ref={resultRef}>
          {hasRateLimitError ? (
            <div className="ai-error-state">
              <p className="ai-error-state__eyebrow">NVIDIA API Request Blocked</p>
              <h3 className="ai-error-state__title">The recommendation could not be generated right now.</h3>
              <p className="ai-error-state__message">
                The NVIDIA API usage or quota is currently blocking this request.
              </p>
              <p className="ai-error-state__detail">
                {error ?? 'NVIDIA API usage limit was reached. Please wait and try again later or check your API quota.'}
              </p>
              <p className="ai-error-state__helper">You can try again later after the usage limit resets.</p>
            </div>
          ) : (
            <p>{error ?? 'Failed to generate the AI recommendation.'}</p>
          )}
        </div>
      )}

      {status === 'succeeded' && marketData && recommendation && (
        <div ref={resultRef}>
          {/* Hamster verdict image (yes / no) */}
          <img
            className="ai-result-side-image"
            src={isBuy ? `${import.meta.env.BASE_URL}yes.png` : `${import.meta.env.BASE_URL}no.png`}
            alt={isBuy ? 'Hamster recommends buying' : 'Hamster does not recommend buying'}
          />

          <div className={`ai-result state-card ${isBuy ? 'ai-result--buy' : 'ai-result--not-buy'}`}>
            <p className="ai-result__label">Recommendation</p>
            <h3 className="ai-result__decision">{isBuy ? 'Buy' : 'Do Not Buy'}</h3>
            <p>{recommendation.explanation}</p>
          </div>

          <div className="ai-metrics state-card">
            <h3>Market data used</h3>
            <dl className="ai-metrics__grid">
              <div><dt>Current price</dt><dd>{formatCurrency(marketData.currentPriceUsd)}</dd></div>
              <div><dt>Market cap</dt>  <dd>{formatCurrency(marketData.marketCapUsd)}</dd></div>
              <div><dt>24h volume</dt>  <dd>{formatCurrency(marketData.totalVolumeUsd)}</dd></div>
              <div><dt>24h change</dt>  <dd>{formatPercentage(marketData.priceChange24h)}</dd></div>
              <div><dt>7d change</dt>   <dd>{formatPercentage(marketData.priceChange7d)}</dd></div>
              <div><dt>30d change</dt>  <dd>{formatPercentage(marketData.priceChange30d)}</dd></div>
            </dl>
          </div>
        </div>
      )}
    </section>
  )
}

export default AiRecommendationPage