import React, { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import Masonry from 'masonry-layout';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import Moment from 'moment';
import { Card, CardBody } from '../../components/card/card.jsx';
import 'bootstrap-daterangepicker/daterangepicker.css';

function Ethereum() {
	const [prices, setPrices] = useState({ bitcoin: null, ethereum: null });
	const [dailyHistory, setDailyHistory] = useState(null);
	const [indexData, setIndexData] = useState(null);
	const [movingAverage, setMovingAverage] = useState(0);
  const [dayBeforeYesterdayMaxPrice, setDayBeforeYesterdayMaxPrice] = useState(0);
  const [yesterdayMaxPrice, setYesterdayMaxPrice] = useState(0);
  const [todayMaxPrice, setTodayMaxPrice] = useState(0);
	const [averageAnalysisText, setAverageAnalysisText] = useState('');
	const [averageAnalysis, setAverageAnalysis] = useState('');

  useEffect(() => {
		// Bitcoin 120 Days Average Price Data Analysis
		const fetchPriceAnalysis = async () => {
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

					const average = getAveragePriceSummary("high");
					console.log('average:', average);

          if (above1000) {
            setAverageAnalysisText(getAveragePriceSummary("high"));
						setAverageAnalysis('high');
          } else if (aboveAverage) {
            setAverageAnalysisText(getAveragePriceSummary("neutral"));
						setAverageAnalysis('neutral');
          } else {
            setAverageAnalysisText(getAveragePriceSummary("low"));
						setAverageAnalysis('low');
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

		// ビットコインの価格を取得する関数
    const fetchPrices = async () => {
      const apiUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd';
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        setPrices({
          bitcoin: data.bitcoin.usd,
          ethereum: data.ethereum.usd,
        });
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };
  
		// ビットコインの本日の価格の履歴を取得する関数
		const fetchDailyHistory = async (cryptoId, days) => {
			const apiUrl = `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=usd&days=${days}`;
			try {
				const response = await fetch(apiUrl);
				if (!response.ok) {
					throw new Error('CORS error or request blocked');
				}
				const data = await response.json();
	
				if (data.prices && data.prices.length > 0) {
					setDailyHistory(data.prices);
				} else {
					alert(`No data available for ${cryptoId} for the selected period.`);
				}
			} catch (error) {
				console.error('Error fetching history:', error);
				alert('Please wait. The request is blocked or there is an issue with the server.');
			}
		};

    const fetchFearIndex = async () => {
      try {
        const response = await fetch('https://api.alternative.me/fng/');
        const data = await response.json();
        if (data && data.data && data.data.length > 0) {
          setIndexData(data.data[0]);
        }
      } catch (error) {
        console.error(error);
      }
    };

		const calculateMovingAverage = (prices, days) => {
			if (prices.length < days) return null;
			const sum = prices.slice(-days).reduce((acc, price) => acc + price, 0);
			return sum / days;
		};

		fetchPriceAnalysis().then(() => {
			fetchPrices();
			fetchDailyHistory('bitcoin', 1);
			fetchFearIndex();
		})
  }, [movingAverage]);  

	let chart1 = '';
	let chart2 = '';
		
	let dateRange = {
		currentWeek: Moment().subtract(7, 'days').format('D MMM YYYY') + ' - ' + Moment().format('D MMM YYYY'),
		prevWeek: Moment().subtract(15, 'days').format('D MMM') + ' - ' + Moment().subtract(8, 'days').format('D MMM YYYY')
	};
	
	let startDate = '';
	let endDate = '';
	let prevDate = Moment().add(-1, 'd').format('D MMM YYYY');
	let todayDate = Moment().add(-1, 'd').format('D MMM YYYY');

	const getFearSummary = (value_classification) => {
		const result = {
			"Extreme Fear": "The price will rise.",
			"Fear": "The price can rise.",
			"Neutral": "We can't judge the fluctuation of price for a while.",
			"Greed": "The prices can fall.",
			"Extreme Greed": "The prices will fall."
		}[value_classification] || '';  
		return result;
	}

	const getFearDescription = (value_classification) => {
		const result = {
			"Extreme Fear": "Market is falling with high volatility and high trading volume. Panic-selling continues.",
			"Fear": "Market goes down gradually. As volatility increases, trading volume is increasing.",
			"Neutral": "Currently, the market is receiving psychological resistance and support from participants.",
			"Greed": "Market goes up gradually. Volatility and trading volume are also increasing.",
			"Extreme Greed": "Market rises with high trading volume and strong volatility. Be aware of the strong volatility."
		}[value_classification] || '';  
		return result;
	}

	// ***! 4. getPriceSummary関数を作成
	const getAveragePriceSummary = (value_classification) => {
		const result = {
			"low": "It can be less valuable.",
			"neutral": "We can't judge the fluctuation of value for a while.",
			"high": "It can be more valuable.",
		}[value_classification] || '';  
		return result;
	}	

	function handleDateApplyEvent(event, picker) {
		let startDate = picker.startDate;
		let endDate = picker.endDate;
		let gap = endDate.diff(startDate, 'days');
		
		let currentWeek = startDate.format('D MMM YYYY') + ' - ' + endDate.format('D MMM YYYY');
		let prevWeek = Moment(startDate).subtract(gap, 'days').format('D MMM') + ' - ' + Moment(startDate).subtract(1, 'days').format('D MMM YYYY');
		
		dateRange.currentWeek = currentWeek;
		dateRange.prevWeek = prevWeek;
	}
	
	function renderChart() {
		function newDate(days) {
			return Moment().add(days, 'd').format('D MMM');
		}
		
		// color & font variable
		let gray300Color = (getComputedStyle(document.body).getPropertyValue('--bs-gray-300')).trim();
		let gray300RgbColor = (getComputedStyle(document.body).getPropertyValue('--bs-gray-300-rgb')).trim();
		let bodyColor = (getComputedStyle(document.body).getPropertyValue('--bs-body-color')).trim();
		let bodyBg = (getComputedStyle(document.body).getPropertyValue('--bs-body-bg')).trim();
		let borderColor = (getComputedStyle(document.body).getPropertyValue('--bs-border-color')).trim();
		let bodyFontFamily = (getComputedStyle(document.body).getPropertyValue('--bs-body-font-family')).trim();
		let bodyFontWeight = (getComputedStyle(document.body).getPropertyValue('--bs-body-font-weight')).trim();
		let inverse = (getComputedStyle(document.body).getPropertyValue('--bs-dark')).trim();
		let themeColor = (getComputedStyle(document.body).getPropertyValue('--bs-theme')).trim();
		
		// chart global options
		Chart.defaults.font.family = bodyFontFamily;
		Chart.defaults.font.size = 12;
		Chart.defaults.color = bodyColor;
		Chart.defaults.borderColor = borderColor;
		Chart.defaults.plugins.legend.display = false;
		Chart.defaults.plugins.tooltip.padding = { left: 8, right: 12, top: 8, bottom: 8 };
		Chart.defaults.plugins.tooltip.cornerRadius = 8;
		Chart.defaults.plugins.tooltip.titleMarginBottom = 6;
		Chart.defaults.plugins.tooltip.color = bodyBg;
		Chart.defaults.plugins.tooltip.multiKeyBackground = inverse;
		Chart.defaults.plugins.tooltip.backgroundColor = inverse;
		Chart.defaults.plugins.tooltip.titleFont.family = bodyFontFamily;
		Chart.defaults.plugins.tooltip.titleFont.weight = bodyFontWeight;
		Chart.defaults.plugins.tooltip.footerFont.family = bodyFontFamily;
		Chart.defaults.plugins.tooltip.displayColors = true;
		Chart.defaults.plugins.tooltip.boxPadding = 6;
		Chart.defaults.scale.grid.color = borderColor;
		Chart.defaults.scale.beginAtZero = true;
		Chart.defaults.maintainAspectRatio = false;
		
		// chart 1
		let chart1Container = document.getElementById('chart-1');
		if (chart1) {
			chart1.destroy();
		}

		// ***! 1. Daily History
		// console.log('prices:', prices.bitcoin);
		// console.log('history datetime:', new Date(history[0][0]).toLocaleTimeString('en-US', {
		// 	hour: 'numeric',
		// 	hour12: true
		// }).toString().replace(/\s?(AM|PM)/i, (match) => match.toLowerCase()).replace(/\s/g, '').replace(/:00/, ''));
		// console.log('history usd bitcoin price:', history[0][1]);

		const labels = ['12am', '4am', '8am', '12pm', '4pm', '8pm']

		if (chart1Container && dailyHistory) {
			// history 배열에서 비트코인 가격을 추출한 배열 생성
			const bitcoinPricesFromHistory = dailyHistory.map(([_, bitcoinPrice]) => bitcoinPrice);
	
			// 최소값과 최대값을 history에서 계산하고, +-1000의 여유를 줌
			const minPrice = Math.min(...bitcoinPricesFromHistory) - 2000;
			const maxPrice = Math.max(...bitcoinPricesFromHistory) + 2000;
	
			// Bitcoin 가격 데이터를 저장할 배열
			const bitcoinPrices = new Array(labels.length).fill(0); // 처음엔 0으로 채워놓습니다.
			const bitcoinPricesWithCommission = new Array(labels.length).fill(0); // 처음엔 0으로 채워놓습니다.

			// history 배열을 탐색하여 labels에 맞는 시간을 찾아 bitcoinPrices에 업데이트
			dailyHistory.forEach(([unixTime, bitcoinPrice]) => {
					const timeString = new Date(unixTime).toLocaleTimeString('en-US', {
							hour: 'numeric',
							hour12: true
					}).toString().replace(/\s?(AM|PM)/i, (match) => match.toLowerCase()).replace(/\s/g, '').replace(/:00/, '');
	
					// labels 배열과 시간 문자열을 비교하여 일치하는 인덱스를 찾음
					const labelIndex = labels.indexOf(timeString);
					if (labelIndex !== -1) {
							bitcoinPrices[labelIndex] = bitcoinPrice; // 해당 시간의 비트코인 가격을 업데이트
							bitcoinPricesWithCommission[labelIndex] = bitcoinPrice * 1.02; // 해당 시간의 비트코인 가격을 업데이트
					}
			});
	
			// 차트를 렌더링
			chart1Container.innerHTML = '<canvas id="chart1" className="w-100" height="190"></canvas>';
			chart1 = new Chart(document.getElementById('chart1').getContext('2d'), {
					type: 'line',
					data: {
							labels,
							datasets: [{
									color: themeColor,
									backgroundColor: 'transparent',
									borderColor: themeColor,
									borderWidth: 2,
									pointBackgroundColor: bodyBg,
									pointBorderWidth: 2,
									pointRadius: 4,
									pointHoverBackgroundColor: bodyBg,
									pointHoverBorderColor: themeColor,
									pointHoverRadius: 6,
									pointHoverBorderWidth: 2,
									data: bitcoinPrices
							},{
									color: gray300Color,
									backgroundColor: 'rgba('+ gray300RgbColor + ', .2)',
									borderColor: gray300Color,
									borderWidth: 2,
									pointBackgroundColor: bodyBg,
									pointBorderWidth: 2,
									pointRadius: 4,
									pointHoverBackgroundColor: bodyBg,
									pointHoverBorderColor: gray300Color,
									pointHoverRadius: 6,
									pointHoverBorderWidth: 2,
									data: bitcoinPricesWithCommission
							}]
					},
					options: {
							scales: {
									y: {
											min: minPrice,  // 최소값 - 2000
											max: maxPrice,  // 최대값 + 2000
											ticks: {
													stepSize: 1000, // 각 눈금 간격을 1000 단위로 설정
													callback: function(value) {
															return value.toFixed(0); // 소숫점을 제거하여 정수로 표시
													}
											}
									}
							}
					}
			});
		}
	
		// #chart2
		let chart2Container = document.getElementById('chart-2');
		if (chart2) {
			chart2.destroy();
		}
		if (chart2Container) {
			chart2Container.innerHTML = '<canvas id="chart2" className="w-100" height="190"></canvas>';
			chart2 = new Chart(document.getElementById('chart2').getContext('2d'), {
				type: 'line',
				data: {
					labels: ['', '4am', '8am', '12pm', '4pm', '8pm', newDate(1)],
					datasets: [{
						color: themeColor,
						backgroundColor: 'transparent',
						borderColor: themeColor,
						borderWidth: 2,
						pointBackgroundColor: bodyBg,
						pointBorderWidth: 2,
						pointRadius: 4,
						pointHoverBackgroundColor: bodyBg,
						pointHoverBorderColor: themeColor,
						pointHoverRadius: 6,
						pointHoverBorderWidth: 2,
						data: [0, 20, 50, 100, 120]
					},{
						color: gray300Color,
						backgroundColor: 'rgba('+ gray300RgbColor + ', .2)',
						borderColor: gray300Color,
						borderWidth: 2,
						pointBackgroundColor: bodyBg,
						pointBorderWidth: 2,
						pointRadius: 4,
						pointHoverBackgroundColor: bodyBg,
						pointHoverBorderColor: gray300Color,
						pointHoverRadius: 6,
						pointHoverBorderWidth: 2,
						data: [0, 30, 44, 130, 34, 15, 43, 22]
					}]
				}
			});
		}
	}

	useEffect(() => {
		renderChart();
		new Masonry('[data-masonry]');
		
		document.addEventListener('theme-reload', () => {
			renderChart();
		});
	});
	
	return (
		<div>
			<h1 className="page-header">
				Ethereum <small>stats, overview & performance</small>
			</h1>
			
			<div className="d-sm-flex align-items-center mb-3">
				<DateRangePicker startDate={startDate} endDate={endDate} onApply={handleDateApplyEvent}>
					<button className="btn btn-outline-theme text-truncate me-3 mb-2 mb-sm-0">
						<i className="fa fa-fw fa-calendar me-1"></i> 
						<span>{dateRange.currentWeek}</span>
						<i className="fa fa-fw fa-caret-down me-n1"></i> 
					</button>
				</DateRangePicker>
				<div>compared to <span>{dateRange.prevWeek}</span></div>
			</div>
	
			{/* Bitcoin Daily Prices */}
			<div className="row" data-masonry='{"percentPosition": true }'>
				<div className="col-lg-12 col-xl-6 mb-4">
					<Card>
						<CardBody>
							<div className="d-flex align-items-center mb-2">
								<div className="flex-fill fw-bold fs-16px">Bitcoin Daily Prices</div>
								<a href="https://www.investtech.com/main/market.php?CompanyID=99400001&product=241" target="_blank" className="text-decoration-none text-inverse text-opacity-50" rel="noreferrer">View report</a>
							</div>
			
							<div className="d-flex align-items-center h4 mb-3">
								{/* ***! 1. pricesコンポーネントからBitcoinの現在の価格を表示 */}
								<div>{prices.bitcoin ? `${prices.bitcoin} USD` : 'Loading...'}</div>
								<small className="fw-400 ms-auto text-theme">+5%</small>
							</div>
						
							<div>
								<div className="fs-12px fw-bold mb-2 text-inverse text-opacity-50">Daily Prices</div>
								<div className="chart mb-2" style={{height: '190px'}}>
									<div id="chart-1"></div>
								</div>
								<div className="d-flex align-items-center justify-content-center fw-bold text-inverse text-opacity-50">
									<i className="fa fa-square text-gray-300 me-2"></i> 
									<span className="fs-12px me-4">With 2% Commission</span>
									<i className="fa fa-square text-theme me-2"></i> 
									<span className="fs-12px me-4">Currunt Prices</span>
								</div>
							</div>
						</CardBody>
					</Card>
				</div>
			
				<div className="col-lg-12 col-xl-6 mb-4">
					<Card>
						<CardBody>
							<div className="d-flex align-items-center mb-2">
								<div className="flex-fill fw-bold fs-16px">Bitcoin Weekly Prices</div>
								<a href="#/" className="text-decoration-none text-inverse text-opacity-50">View report</a>
							</div>
			
							<div className="d-flex align-items-center h3 mb-3">
								<div>{prices.bitcoin ? `${prices.bitcoin} USD` : 'Loading...'}</div>
								<small className="fw-400 ms-auto text-danger">-2.5%</small>
							</div>
						
							<hr className="opacity-3 my-2 mx-n3" />
						
							<div className="row">
								<div className="col-6">Visitors</div>
								<div className="col-3 text-center">2</div>
								<div className="col-3 text-end">
									<span className="text-danger">-</span> 50%
								</div>
							</div>
						
							<hr className="opacity-3 my-2 mx-n3" />
						
							<div className="mt-3">
								<div className="fs-12px fw-bold mb-2 text-inverse text-opacity-50">SESSIONS OVER TIME</div>
								<div className="chart mb-2" style={{height: '190px'}}>
									<div id="chart-2"></div>
								</div>
								<div className="d-flex align-items-center justify-content-center text-inverse text-opacity-50 fw-bold">
									<i className="fa fa-square text-gray-300 me-2"></i> 
									<span className="fs-12px me-4">{prevDate}</span>
									<i className="fa fa-square text-theme me-2"></i> 
									<span className="fs-12px me-4">{todayDate}</span>
								</div>
							</div>
						</CardBody>
					</Card>
				</div>

				{/* 120 Days Average */}
				<div className="col-lg-12 col-xl-6 mb-4">
					<Card>
						<CardBody>
							<div className="d-flex align-items-center mb-3">
								<div className="flex-fill fw-bold fs-16px">120 Days Average</div>
							</div>
			
							{/* ***! 4. */}
							<div className="row mb-2">
								<span className={ 
										averageAnalysis === 'high' 
										? 'text-theme' 
										: averageAnalysis === 'neutral' 
										? 'text-warning' 
										: 'text-danger'
								}>								
									<div className="col-12">{ averageAnalysisText }</div>
								</span>
							</div>

							<div className="row mb-2">
								<div className="col-6">
									<div>
										<a href="#/" className="text-decoration-none text-inverse text-opacity-50">
											Bitcoin
										</a>
									</div>
								</div>
							</div>

							<div className="row mb-2">
								<div className="col-6">
									<div>
										<a href="#/" className="text-decoration-none text-inverse text-opacity-50">
											120 Days Average
										</a>
									</div>
								</div>
								<div className="col-3 text-end"><span className="text-theme">$</span> </div>
								<div className="col-3 text-start">{ movingAverage.toFixed(2).toString() }</div>
							</div>

							<div className="row mb-2">
								<div className="col-6">
									<div>
										<a href="#/" className="text-decoration-none text-inverse text-opacity-50">
											The Day Before Yesterday's High
										</a>
									</div>
								</div>
								<div className="col-3 text-end"><span className="text-theme">$</span> </div>
								<div className="col-3 text-start">{ dayBeforeYesterdayMaxPrice.toFixed(2).toString() }</div>
							</div>
						
							<div className="row mb-2">
								<div className="col-6">
									<div>
										<a href="#/" className="text-decoration-none text-inverse text-opacity-50">
											Yesterday's High
										</a>
									</div>
								</div>
								<div className="col-3 text-end"><span className="text-theme">$</span> </div>
								<div className="col-3 text-start">{ yesterdayMaxPrice.toFixed(2).toString() }</div>
							</div>

							<div className="row">
								<div className="col-6">
									<div>
										<a href="#/" className="text-decoration-none text-inverse text-opacity-50">
											Today's High
										</a>
									</div>
								</div>
								<div className="col-3 text-end"><span className="text-theme">$</span> </div>
								<div className="col-3 text-start">{ todayMaxPrice.toFixed(2).toString() }</div>
							</div>							

						</CardBody>
					</Card>
				</div>				
			
				{/* Fear Index */}
				<div className="col-lg-12 col-xl-6 mb-4">
					<Card>
						<CardBody>
							<div className="d-flex align-items-center mb-3">
								<div className="flex-fill fw-bold fs-16px">Fear Index</div>
								<a href="https://www.ubcindex.com/feargreed" target="_blank" className="text-decoration-none text-inverse text-opacity-50" rel="noreferrer">View report</a>
							</div>			
							<div>
								<div className="row mb-2">
									<span className={ 
										indexData && indexData.value_classification === 'Fear' | 'Extreme Fear' 
										? 'text-theme' 
										: indexData && indexData.value_classification === 'Neutral' 
										? 'text-warning' 
										: 'text-danger'
									}>
										<div className="col-12">{ indexData && getFearSummary(indexData.value_classification) }</div>
									</span>
								</div>
								<div className="row mb-2">
										<div className="col-12">{ indexData && getFearDescription(indexData.value_classification) }</div>
								</div>

								<div className="row mb-2">
									<div className="col-6">{ indexData && new Date(indexData.timestamp * 1000).toLocaleDateString() }</div>
									<div className="col-3 text-center">{indexData && indexData.value }</div>									
									<div className="col-3 text-center">
										<span className={ 
											indexData && indexData.value_classification === 'Fear' | 'Extreme Fear' 
											? 'text-danger' 
											: indexData && indexData.value_classification === 'Neutral' 
											? 'text-warning' 
											: 'text-theme'
										}>
											{ indexData && indexData.value_classification }
										</span>
									</div>
								</div>
							</div>
						</CardBody>
					</Card>
				</div>
			
			</div>
		</div>
	)
}

export default Ethereum;