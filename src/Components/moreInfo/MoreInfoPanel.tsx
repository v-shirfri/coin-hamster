import type { CoinPriceInfo, AsyncStatus } from '../../types/coin'

interface MoreInfoPanelProps {
  error: string | null
  prices: CoinPriceInfo | null
  status: AsyncStatus
}

function formatPrice(value: number | null, currency: string) {
  if (value === null) {
    return 'N/A'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

function MoreInfoPanel({ error, prices, status }: MoreInfoPanelProps) {
  if (status === 'loading') {
    return (
      <div className="more-info-panel">
        <p>Loading current prices...</p>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="more-info-panel more-info-panel--error">
        <p>{error ?? 'Failed to load coin details.'}</p>
      </div>
    )
  }

  if (status !== 'succeeded' || !prices) {
    return null
  }

  return (
    <div className="more-info-panel">
      <p className="more-info-panel__title">Current prices</p>
      <dl className="more-info-panel__prices">
        <div>
          <dt>USD</dt>
          <dd>{formatPrice(prices.usd, 'USD')}</dd>
        </div>
        <div>
          <dt>EUR</dt>
          <dd>{formatPrice(prices.eur, 'EUR')}</dd>
        </div>
        <div>
          <dt>ILS</dt>
          <dd>{formatPrice(prices.ils, 'ILS')}</dd>
        </div>
      </dl>
    </div>
  )
}

export default MoreInfoPanel