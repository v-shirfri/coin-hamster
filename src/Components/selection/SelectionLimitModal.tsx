import { useEffect } from 'react'

import type { SelectedCoin } from '../../types/coin'

interface SelectionLimitModalProps {
  selectedCoins: SelectedCoin[]
  pendingCoin: SelectedCoin
  coinToRemoveId: string
  onSelectCoinToRemove: (coinId: string) => void
  onCancel: () => void
  onConfirm: () => void
}

function SelectionLimitModal({
  selectedCoins,
  pendingCoin,
  coinToRemoveId,
  onSelectCoinToRemove,
  onCancel,
  onConfirm,
}: SelectionLimitModalProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div aria-modal="true" className="modal-backdrop" role="dialog">
      <div className="modal-card">
        <h3>Selection Limit Reached</h3>
        <p>
          You can select up to 5 coins. Choose one selected coin to remove before
          adding {pendingCoin.name} ({pendingCoin.symbol.toUpperCase()}).
        </p>

        <div className="modal-list" role="radiogroup" aria-label="Selected coins">
          {selectedCoins.map((coin) => (
            <label className="modal-option" htmlFor={`replace-${coin.id}`} key={coin.id}>
              <input
                checked={coinToRemoveId === coin.id}
                id={`replace-${coin.id}`}
                name="coin-to-remove"
                onChange={() => onSelectCoinToRemove(coin.id)}
                type="radio"
              />
              <span>
                {coin.name} ({coin.symbol.toUpperCase()})
              </span>
            </label>
          ))}
        </div>

        <div className="modal-actions">
          <button className="modal-button modal-button--secondary" onClick={onCancel} type="button">
            Cancel
          </button>
          <button
            className="modal-button"
            disabled={!coinToRemoveId}
            onClick={onConfirm}
            type="button"
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  )
}

export default SelectionLimitModal