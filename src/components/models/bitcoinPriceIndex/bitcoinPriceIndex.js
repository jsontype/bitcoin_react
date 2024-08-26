import React, { useEffect, useState } from 'react';

export default function BitcoinPriceIndex() {
  const [movingAverage, setMovingAverage] = useState(null);
  const [dayBeforeYesterdayMaxPrice, setDayBeforeYesterdayMaxPrice] = useState(null);
  const [yesterdayMaxPrice, setYesterdayMaxPrice] = useState(null);
  const [todayMaxPrice, setTodayMaxPrice] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBitcoinData = async () => {
      try {
        // Fetch 120-day data for moving average
        const movingAverageResponse = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=120');
        const movingAverageData = await movingAverageResponse.json();
        if (movingAverageData && movingAverageData.prices) {
          const prices = movingAverageData.prices.map(price => price[1]); // Extract only the price values
          const average = calculateMovingAverage(prices, 120);
          setMovingAverage(average);
        }

        // Fetch data for the last 3 days for daily max prices
        const today = new Date();
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3);

        const fromTimestamp = Math.floor(threeDaysAgo.getTime() / 1000);
        const toTimestamp = Math.floor(today.getTime() / 1000);

        const dailyMaxResponse = await fetch(
          `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from=${fromTimestamp}&to=${toTimestamp}`
        );
        const dailyMaxData = await dailyMaxResponse.json();
        if (dailyMaxData && dailyMaxData.prices) {
          const dayBeforeYesterdayPrices = [];
          const yesterdayPrices = [];
          const todayPrices = [];
          const dayBeforeYesterdayDate = new Date();
          dayBeforeYesterdayDate.setDate(today.getDate() - 2);
          const yesterdayDate = new Date();
          yesterdayDate.setDate(today.getDate() - 1);

          dailyMaxData.prices.forEach(([timestamp, price]) => {
            const date = new Date(timestamp);
            if (date.getDate() === dayBeforeYesterdayDate.getDate()) {
              dayBeforeYesterdayPrices.push(price);
            } else if (date.getDate() === yesterdayDate.getDate()) {
              yesterdayPrices.push(price);
            } else if (date.getDate() === today.getDate()) {
              todayPrices.push(price);
            }
          });

          const highestDayBeforeYesterdayPrice = Math.max(...dayBeforeYesterdayPrices);
          const highestYesterdayPrice = Math.max(...yesterdayPrices);
          const highestTodayPrice = Math.max(...todayPrices);

          setDayBeforeYesterdayMaxPrice(highestDayBeforeYesterdayPrice);
          setYesterdayMaxPrice(highestYesterdayPrice);
          setTodayMaxPrice(highestTodayPrice);

          // Determine analysis based on price comparisons
          const prices = [highestDayBeforeYesterdayPrice, highestYesterdayPrice, highestTodayPrice];
          const above1000 = prices.some(price => price > movingAverage + 1000);
          const aboveAverage = prices.some(price => price > movingAverage);

          if (above1000) {
            setAnalysis('価格が上昇する可能性があります。');
          } else if (aboveAverage) {
            setAnalysis('価格は現状を維持する可能性があります。');
          } else {
            setAnalysis('価格が下落する可能性があります。');
          }
        }
      } catch (error) {
        setError('ビットコインデータの取得中にエラーが発生しました。');
        console.error(error);
      }
    };

    fetchBitcoinData();
  }, [movingAverage]);

  const calculateMovingAverage = (prices, days) => {
    if (prices.length < days) return null;
    const sum = prices.slice(-days).reduce((acc, price) => acc + price, 0);
    return sum / days;
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (movingAverage === null || dayBeforeYesterdayMaxPrice === null || yesterdayMaxPrice === null || todayMaxPrice === null) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ border: '1px solid gray', padding: '0 15px' }}>
      <h3>
        <div style={{ color: analysis.includes('上昇') ? 'blue' : analysis.includes('維持') ? 'orange' : 'red' }}>{analysis}</div>
        <div>ビットコインの120日移動平均: ${movingAverage.toFixed(2)}</div>
        <div>一昨日の最高値: ${dayBeforeYesterdayMaxPrice.toFixed(2)}</div>
        <div>昨日の最高値: ${yesterdayMaxPrice.toFixed(2)}</div>
        <div>本日の最高値: ${todayMaxPrice.toFixed(2)}</div>
      </h3>
    </div>
  );
}