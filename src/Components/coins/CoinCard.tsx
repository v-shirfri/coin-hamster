import type { AsyncStatus, CoinPriceInfo, CoinSummary } from '../../types/coin'
import MoreInfoPanel from '../moreInfo/MoreInfoPanel'

interface CoinCardProps {
  coin: CoinSummary
  isSelected: boolean
  isMoreInfoOpen: boolean
  moreInfoError: string | null
  moreInfoPrices: CoinPriceInfo | null
  moreInfoStatus: AsyncStatus
  onMoreInfoToggle: (coinId: string) => void
  onToggle: (coin: CoinSummary, nextChecked: boolean) => void
}

function CoinCard({
  coin,
  isSelected,
  isMoreInfoOpen,
  moreInfoError,
  moreInfoPrices,
  moreInfoStatus,
  onMoreInfoToggle,
  onToggle,
}: CoinCardProps) {
  return (
    <article className={`coin-card ${isSelected ? 'coin-card--selected' : ''}`}>
      <div className="coin-card__meta">
        <span className="coin-card__rank-badge">Coin</span>
        <span className={`coin-card__selection-badge ${isSelected ? 'coin-card__selection-badge--active' : ''}`}>
          {isSelected ? 'Tracked' : 'Available'}
        </span>
      </div>
      <img
        className="coin-card__image"
        src={coin.image}
        alt={`${coin.name} icon`}
        loading="lazy"
      />
      <div className="coin-card__body">
        <p className="coin-card__symbol">{coin.symbol.toUpperCase()}</p>
        <h3 className="coin-card__name">{coin.name}</h3>
      </div>
      <div className="coin-card__actions">
        <button
          className="coin-card__button"
          onClick={() => onMoreInfoToggle(coin.id)}
          type="button"
        >
          {isMoreInfoOpen ? 'Hide Info' : 'More Info'}
        </button>
      </div>

      {isMoreInfoOpen && (
        <MoreInfoPanel
          error={moreInfoError}
          prices={moreInfoPrices}
          status={moreInfoStatus}
        />
      )}

      <label className="coin-card__toggle" htmlFor={`coin-toggle-${coin.id}`}>
        <span>{isSelected ? 'Selected' : 'Select coin'}</span>
        <span className="coin-card__switch">
          <input
            checked={isSelected}
            className="coin-card__checkbox"
            id={`coin-toggle-${coin.id}`}
            onChange={(event) => onToggle(coin, event.target.checked)}
            type="checkbox"
          />
          <span className="coin-card__slider" aria-hidden="true" />
        </span>
      </label>
    </article>
  )
}

export default CoinCard