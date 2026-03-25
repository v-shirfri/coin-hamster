import { useEffect, useState } from 'react'

import { useAppSelector } from '../app/hooks'
import ReportsChart from '../Components/reports/ReportsChart'
import { fetchRealtimePrices } from '../services/reportsService'
import type { AsyncStatus, ReportsPricePoint } from '../types/coin'

const MAX_REPORT_POINTS = 20

function ReportsPage() {
  const selectedCoins = useAppSelector((state) => state.selection.selectedCoins)
  const [chartData, setChartData] = useState<ReportsPricePoint[]>([])
  const [status, setStatus] = useState<AsyncStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedCoins.length === 0) {
      setChartData([])
      setStatus('idle')
      setError(null)
      return
    }

    let isActive = true

    const loadPrices = async () => {
      setStatus((currentStatus) =>
        currentStatus === 'succeeded' ? currentStatus : 'loading',
      )
      setError(null)

      try {
        const prices = await fetchRealtimePrices(selectedCoins)

        if (!isActive) {
          return
        }

        const nextPoint: ReportsPricePoint = {
          timestamp: new Date().toLocaleTimeString(),
        }

        for (const coin of selectedCoins) {
          const symbol = coin.symbol.toUpperCase()

          if (typeof prices[symbol] === 'number') {
            nextPoint[symbol] = prices[symbol]
          }
        }

        setChartData((currentData) => {
          const nextData = [...currentData, nextPoint]

          return nextData.slice(-MAX_REPORT_POINTS)
        })
        setStatus('succeeded')
      } catch (requestError) {
        if (!isActive) {
          return
        }

        setStatus('failed')
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Failed to fetch realtime prices.',
        )
      }
    }

    void loadPrices()

    const intervalId = window.setInterval(() => {
      void loadPrices()
    }, 1000)

    return () => {
      isActive = false
      window.clearInterval(intervalId)
    }
  }, [selectedCoins])

  return (
    <section className="page-section">
      <div className="page-section__header">
        <h2>Live Reports</h2>
        <p>Track the selected coins in one USD chart with a single realtime request every second.</p>
      </div>

      {selectedCoins.length === 0 && (
        <div className="state-card">
          <p>Select at least one coin on the Home page to see the live chart.</p>
        </div>
      )}

      {selectedCoins.length > 0 && (
        <div className="reports-summary state-card">
          <p>Watching: {selectedCoins.map((coin) => coin.symbol.toUpperCase()).join(', ')}</p>
        </div>
      )}

      {selectedCoins.length > 0 && status === 'loading' && chartData.length === 0 && (
        <div className="state-card">
          <p>Loading realtime prices...</p>
        </div>
      )}

      {selectedCoins.length > 0 && status === 'failed' && (
        <div className="state-card state-card--error">
          <p>{error ?? 'Failed to fetch realtime prices.'}</p>
        </div>
      )}

      {selectedCoins.length > 0 && status === 'succeeded' && chartData.length > 0 && (
        <ReportsChart data={chartData} selectedCoins={selectedCoins} />
      )}
    </section>
  )
}

export default ReportsPage