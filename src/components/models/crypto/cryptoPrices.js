import { useEffect, useState } from 'react';

export default function useCryptoPrices(interval = 2) {
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    const fetchPrices = async () => {
      const apiUrl = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1&interval=hourly`;
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const filteredPrices = data.prices.filter((_, index) => index % interval === 0);
        const priceList = filteredPrices.map(item => item[1]);
        setPrices(priceList);
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };

    fetchPrices();

    const updateInterval = setInterval(fetchPrices, 300000); // 5分毎にアップデート
    return () => clearInterval(updateInterval);
  }, [interval]);

  return prices;
}
