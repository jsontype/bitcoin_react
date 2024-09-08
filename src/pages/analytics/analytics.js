// ***! mvpからのデータを用いて、グラフを実際のbitcoin価格で表示する

import React, { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import Masonry from 'masonry-layout';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import Moment from 'moment';
import { Card, CardBody } from '../../components/card/card.jsx';
import 'bootstrap-daterangepicker/daterangepicker.css';

function Analytics() {
	const [prices, setPrices] = useState({ bitcoin: null, ethereum: null });
	const [dailyHistory, setDailyHistory] = useState(null);
	const [indexData, setIndexData] = useState(null);

  useEffect(() => {
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

    fetchPrices();
		fetchDailyHistory('bitcoin', 1);
		fetchFearIndex();
  }, []);  

	var chart1 = '';
	var chart2 = '';
		
	var dateRange = {
		currentWeek: Moment().subtract(7, 'days').format('D MMM YYYY') + ' - ' + Moment().format('D MMM YYYY'),
		prevWeek: Moment().subtract(15, 'days').format('D MMM') + ' - ' + Moment().subtract(8, 'days').format('D MMM YYYY')
	};
	
	var startDate = '';
	var endDate = '';
	var prevDate = Moment().add(-1, 'd').format('D MMM YYYY');
	var todayDate = Moment().add(-1, 'd').format('D MMM YYYY');
		
	function handleDateApplyEvent(event, picker) {
		var startDate = picker.startDate;
		var endDate = picker.endDate;
		var gap = endDate.diff(startDate, 'days');
		
		var currentWeek = startDate.format('D MMM YYYY') + ' - ' + endDate.format('D MMM YYYY');
		var prevWeek = Moment(startDate).subtract(gap, 'days').format('D MMM') + ' - ' + Moment(startDate).subtract(1, 'days').format('D MMM YYYY');
		
		dateRange.currentWeek = currentWeek;
		dateRange.prevWeek = prevWeek;
	}
	
	function renderChart() {
		function newDate(days) {
			return Moment().add(days, 'd').format('D MMM');
		}
		
		// color & font variable
		var gray300Color = (getComputedStyle(document.body).getPropertyValue('--bs-gray-300')).trim();
		var gray300RgbColor = (getComputedStyle(document.body).getPropertyValue('--bs-gray-300-rgb')).trim();
		var bodyColor = (getComputedStyle(document.body).getPropertyValue('--bs-body-color')).trim();
		var bodyBg = (getComputedStyle(document.body).getPropertyValue('--bs-body-bg')).trim();
		var borderColor = (getComputedStyle(document.body).getPropertyValue('--bs-border-color')).trim();
		var bodyFontFamily = (getComputedStyle(document.body).getPropertyValue('--bs-body-font-family')).trim();
		var bodyFontWeight = (getComputedStyle(document.body).getPropertyValue('--bs-body-font-weight')).trim();
		var inverse = (getComputedStyle(document.body).getPropertyValue('--bs-dark')).trim();
		var themeColor = (getComputedStyle(document.body).getPropertyValue('--bs-theme')).trim();
		
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
		var chart1Container = document.getElementById('chart-1');
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
		var chart2Container = document.getElementById('chart-2');
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
				Analytics <small>stats, overview & performance</small>
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
								<div className="row mb-2">
									<span className={ 
										indexData && indexData.value_classification === 'Fear' | 'Extreme Fear' 
										? 'text-theme' 
										: indexData && indexData.value_classification === 'Neutral' 
										? 'text-warning' 
										: 'text-danger'
									}>
										{/* ***! 3. */}
										<div className="col-12">There is a possibility that the value will increase.</div>
									</span>
								</div>
								<div className="row mb-2">
										{/* ***! 3. */}
										<div className="col-12">The index is gradually falling. As the volatility of prices increases, trading volume is rising. Short-term lows may form.</div>
								</div>
								<div className="row mb-2">
									<a href="https://www.ubcindex.com/feargreed" target="_blank" className="col-12" rel="noreferrer">Show Detail</a>
								</div>
							</div>
						</CardBody>
					</Card>
				</div>
			
				<div className="col-lg-12 col-xl-6 mb-4">
					<Card>
						<CardBody>
							<div className="d-flex align-items-center mb-3">
								<div className="flex-fill fw-bold fs-16px">Top pages by sessions</div>
							</div>
			
							<div className="row mb-2">
								<div className="col-6"><div><a href="#/" className="text-decoration-none text-inverse text-opacity-50">/phone/apple-11-pro-max</a></div></div>
								<div className="col-3 text-center">15</div>
								<div className="col-3 text-center"><span className="text-theme">+</span> 15%</div>
							</div>
							<div className="row mb-2">
								<div className="col-6"><div><a href="#/" className="text-decoration-none text-inverse text-opacity-50">/tablet/apple-ipad-pro-128gb</a></div></div>
								<div className="col-3 text-center">12</div>
								<div className="col-3 text-center"><span className="text-theme">+</span> 8%</div>
							</div>
							<div className="row">
								<div className="col-6"><div><a href="#/" className="text-decoration-none text-inverse text-opacity-50">/desktop/apple-mac-pro</a></div></div>
								<div className="col-3 text-center">4</div>
								<div className="col-3 text-center"><span className="text-danger">-</span> 3%</div>
							</div>
						</CardBody>
					</Card>
				</div>
			
			</div>
		</div>
	)
}

export default Analytics;