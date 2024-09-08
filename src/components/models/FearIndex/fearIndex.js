import React, { useEffect, useState } from 'react';

export default function FearIndex() {
  const [indexData, setIndexData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFearIndex = async () => {
      try {
        const response = await fetch('https://api.alternative.me/fng/');
        const data = await response.json();
        if (data && data.data && data.data.length > 0) {
          setIndexData(data.data[0]);
        }
      } catch (error) {
        setError('Error fetching the Fear and Greed Index');
        console.error(error);
      }
    };

    fetchFearIndex();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  if (!indexData) {
    return <div>Loading...</div>;
  }

  const { value, value_classification, timestamp } = indexData;
  const classColor = {
    'Extreme Fear': 'blue',
    'Fear': 'blue',
    'Neutral': 'black',
    'Greed': 'red',
    'Extreme Greed': 'red'
  }[value_classification] || 'black';
  const classDescription = {
    'Extreme Fear': '価値が上がる可能性が高いです。',
    'Fear': '価値が上がる可能性があります。',
    'Neutral': '価値の変動はしばらく判断できません。',
    'Greed': '価値が下がる可能性があります。',
    'Extreme Greed': '価値が下がる可能性が高いです。'
  }[value_classification] || '';  

  return (
    <div style={{ border: '1px solid gray', padding: '0 15px' }}>
      <h3>
        <div style={{ color: classColor }}>{classDescription}</div>
        <div>{new Date(timestamp * 1000).toLocaleDateString()}の暗号通貨のFear度: {value} ({value_classification})</div>
      </h3>
    </div>
  );
}