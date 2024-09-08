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

  useEffect(() => {
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
  
    fetchPrices();

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

		// ***! 1. history fetch -> history data (graph data)
		fetchDailyHistory('bitcoin', 1);
  }, []);  

	var chart1 = '';
	var chart2 = '';
	var chart3 = '';
	var chart4 = '';
	var chart5 = '';
		
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
		var indigoColor = (getComputedStyle(document.body).getPropertyValue('--bs-indigo')).trim();
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
			const minPrice = Math.min(...bitcoinPricesFromHistory) - 1000;
			const maxPrice = Math.max(...bitcoinPricesFromHistory) + 1000;
	
			// Bitcoin 가격 데이터를 저장할 배열
			const bitcoinPrices = new Array(labels.length).fill(0); // 처음엔 0으로 채워놓습니다.
			
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
									data: [100, 100, 100, 500, 120, 100]
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

		// #chart3
		var chart3Container = document.getElementById('chart-3');
		if (chart3) {
			chart3.destroy();
		}
		if (chart3Container) {
			chart3Container.innerHTML = '<canvas id="chart3" className="w-100" height="190"></canvas>';
			chart3 = new Chart(document.getElementById('chart3').getContext('2d'), {
				type: 'line',
				data: {
					labels: ['', '4am', '8am', '12pm', '4pm', '8pm', newDate(1)],
					datasets: [{
						color: indigoColor,
						backgroundColor: 'transparent',
						borderColor: indigoColor,
						borderWidth: 2,
						pointBackgroundColor: bodyBg,
						pointBorderWidth: 2,
						pointRadius: 4,
						pointHoverBackgroundColor: bodyBg,
						pointHoverBorderColor: indigoColor,
						pointHoverRadius: 6,
						pointHoverBorderWidth: 2,
						data: [0, 0, 5, 18, 9]
					},{
						color: themeColor,
						backgroundColor: 'rgba('+ themeColor +', .2)',
						borderColor: themeColor,
						borderWidth: 2,
						pointBackgroundColor: bodyBg,
						pointBorderWidth: 2,
						pointRadius: 4,
						pointHoverBackgroundColor: bodyBg,
						pointHoverBorderColor: themeColor,
						pointHoverRadius: 6,
						pointHoverBorderWidth: 2,
						data: [0, 0, 10, 26, 13]
					}]
				}
			});
		}

		// #chart4
		var chart4Container = document.getElementById('chart-4');
		if (chart4) {
			chart4.destroy();
		}
		if (chart4Container) {
			chart4Container.innerHTML = '<canvas id="chart4" className="w-100" height="190"></canvas>';
			chart4 = new Chart(document.getElementById('chart4').getContext('2d'), {
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
						data: [0, 0, 0, 24, 39]
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
						data: [0, 0, 0, 28, 35, 23, 0, 0]
					}]
				}
			});
		}
	
		// #chart5
		var chart5Container = document.getElementById('chart-5');
		if (chart5) {
			chart5.destroy();
		}
		if (chart5Container) {
			chart5Container.innerHTML = '<canvas id="chart5" className="w-100" height="190"></canvas>';
			chart5 = new Chart(document.getElementById('chart5').getContext('2d'), {
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
						data: [0, 0, 0, 12, 5]
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
						data: [0, 0, 0, 10, 4, 2, 0, 0]
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
	
			<div className="row" data-masonry='{"percentPosition": true }'>
				<div className="col-lg-6 col-xl-4 mb-4">
					<Card>
						<CardBody>
							<div className="d-flex align-items-center mb-2">
								<div className="flex-fill fw-bold fs-16px">Bitcoin Daily Prices</div>
								<a href="#/" className="text-decoration-none text-inverse text-opacity-50">View report</a>
							</div>
			
							<div className="d-flex align-items-center h4 mb-3">
								{/* ***! 1. pricesコンポーネントからBitcoinの現在の価格を表示 */}
								<div>{prices.bitcoin ? `${prices.bitcoin} USD` : 'Loading...'}</div>
								<small className="fw-400 ms-auto text-theme">+5%</small>
							</div>
						
							<div>
								<div className="fs-12px fw-bold mb-2 text-inverse text-opacity-50">SALES OVER TIME</div>
								<div className="chart mb-2" style={{height: '190px'}}>
									<div id="chart-1"></div>
								</div>
								<div className="d-flex align-items-center justify-content-center fw-bold text-inverse text-opacity-50">
									<i className="fa fa-square text-gray-300 me-2"></i> 
									<span className="fs-12px me-4">{prevDate}</span>
									<i className="fa fa-square text-theme me-2"></i> 
									<span className="fs-12px me-4">{todayDate}</span>
								</div>
							</div>
						</CardBody>
					</Card>
				</div>
			
				<div className="col-lg-6 col-xl-4 mb-4">
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
			
				<div className="col-lg-6 col-xl-4 mb-4">
					<Card>
						<CardBody>
							<div className="d-flex align-items-center mb-3">
								<div className="flex-fill fw-bold fs-16px">Top product by units sold</div>
							</div>
			
							<div>
								<div className="row mb-2">
									<div className="col-6">iPhone 11 Pro Max</div>
									<div className="col-3 text-center">329</div>
									<div className="col-3 text-center"><span className="text-theme">+</span> 25%</div>
								</div>
								<div className="row mb-2">
									<div className="col-6">iPad Pro</div>
									<div className="col-3 text-center">219</div>
									<div className="col-3 text-center"><span className="text-danger">-</span> 5.2%</div>
								</div>
								<div className="row mb-2">
									<div className="col-6">Macbook Pro</div>
									<div className="col-3 text-center">125</div>
									<div className="col-3 text-center"><span className="text-theme">+</span> 2.3%</div>
								</div>
								<div className="row mb-2">
									<div className="col-6">iPhone SE 2</div>
									<div className="col-3 text-center">92</div>
									<div className="col-3 text-center"><span className="text-theme">+</span> 4.9%</div>
								</div>
								<div className="row">
									<div className="col-6">Apple pencil</div>
									<div className="col-3 text-center">52</div>
									<div className="col-3 text-center"><span className="text-theme">+</span> 25%</div>
								</div>
							</div>
						</CardBody>
					</Card>
				</div>
			
				<div className="col-lg-6 col-xl-4 mb-4">
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