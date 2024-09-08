import React from 'react'

// HistoryButtonsコンポーネント
export default function HistoryButtons({ onFetchHistory }) {
  const periods = [
    { label: '1 Day', value: '1d' },
    { label: '1 Week', value: '1w' },
    { label: '1 Month', value: '1m' },
    { label: '3 Months', value: '3m' },
    { label: '6 Months', value: '6m' },
    { label: '1 Year', value: '1y' },
  ];

  return (
    <div>
      {periods.map(period => (
        <button
          key={period.value}
          onClick={() => onFetchHistory(period.value)}
          style={{ margin: '5px' }}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
