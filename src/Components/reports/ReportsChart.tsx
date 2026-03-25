import React from 'react'
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis,YAxis,
} from 'recharts'

import type { ReportsPricePoint, SelectedCoin } from '../../types/coin'

interface ReportsChartProps {
  data: ReportsPricePoint[]
  selectedCoins: SelectedCoin[]
}

const LINE_COLORS = ['#da8319', '#1a43e6', '#0bbd85', '#f51bdb', '#8c1aef']

function formatTooltipValue(
  value: number | string | ReadonlyArray<number | string> | undefined,
) {
  if (typeof value === 'number') {
    return `$${value.toFixed(2)}`
  }
  return value ?? 'N/A'
}

function ReportsChart({ data, selectedCoins }: ReportsChartProps) {
  const latestPoint = data[data.length - 1]

  return (
    <div className="reports-chart">
      <div className="reports-chart__header">
        <div>
          <p className="reports-chart__eyebrow">Live USD Prices</p>
          <h3>Selected coins overview</h3>
        </div>
      </div>

      <div className="reports-chart__badges">
        {selectedCoins.map((coin, index) => {
          const symbol = coin.symbol.toUpperCase()
          const latestValue = latestPoint?.[symbol]

          return (
            <div className="reports-chart__badge" key={coin.id}>
              <span
                className="reports-chart__badge-dot"
                style={{ '--badge-color': LINE_COLORS[index % LINE_COLORS.length] } as React.CSSProperties}
              />
              <span className="reports-chart__badge-symbol">{symbol}</span>
              <strong>
                {typeof latestValue === 'number' ? `$${latestValue.toFixed(2)}` : 'N/A'}
              </strong>
            </div>
          )
        })}
      </div>

      <div className="reports-chart__canvas">
        <ResponsiveContainer height="100%" width="100%">
        <LineChart data={data} margin={{ top: 12, right: 18, left: 6, bottom: 4 }}>
          <CartesianGrid stroke="#d8e3ef" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="timestamp" minTickGap={24} stroke="#6b7f92" tickLine={false} />
          <YAxis
            axisLine={false}
            stroke="#6b7f92"
            tickLine={false}
            tickFormatter={(value: number) => `$${value.toFixed(0)}`}
            width={80}
          />
          <Tooltip formatter={formatTooltipValue} />
          <Legend iconSize={10} formatter={(value) => value.toUpperCase()} />
          {selectedCoins.map((coin, index) => {
            const symbol = coin.symbol.toUpperCase()

            return (
              <Line
                activeDot={{ r: 5, strokeWidth: 0 }}
                dataKey={symbol}
                dot={false}
                key={coin.id}
                name={symbol}
                stroke={LINE_COLORS[index % LINE_COLORS.length]}
                strokeLinecap="round"
                strokeWidth={3}
                type="monotone"
              />
            )
          })}
        </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ReportsChart