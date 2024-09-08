import React from 'react'

// CryptoItemコンポーネント
export default function CryptoItem({ id, name, price, onClick }) {
  return (
    <div onClick={() => onClick(id)} style={{ cursor: 'pointer', margin: '20px 0' }}>
      <h2>{name}: {price ? `${price} USD` : 'Loading...'}</h2>
    </div>
  );
}