import { CloudOutlined, GlobalOutlined, ShoppingCartOutlined, ToolOutlined } from '@ant-design/icons';
import AppConsts, { RouterPath, cssColResponsiveSpan } from '@src/lib/appconst';
import { DashboardDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Card, Col, Row } from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';
import BarChartExample1Field from './components/BarChartExample1Field';
import BarChartExample2Field from './components/BarChartExample2Field';
import { Data2Field } from './components/LineChartExample';
import { Data } from './components/PieChartExample';
import './index.less';
import moment from 'moment';

export class Dashboard extends React.Component<any> {
	state = {
		cardLoading: true,
		lineChartLoading: true,
		barChartLoading: true,
		pieChartLoading: true,
		currentIndex: 0,
		month_current: undefined,
	};
	dashboard: DashboardDto = new DashboardDto();
	interval: any;
	async componentDidMount() {
		this.setState({ month_current: moment().format("M") })
		setTimeout(() => this.setState({ cardLoading: false }), 1000);
		setTimeout(() => this.setState({ lineChartLoading: false }), 1500);
		setTimeout(() => this.setState({ barChartLoading: false }), 2000);
		setTimeout(() => this.setState({ pieChartLoading: false }), 1000);
		this.interval = setInterval(() => {
			const nextIndex = (this.state.currentIndex + 1) % this.dashboard.top5BillingMachineOfQuantityMonth!.length;
			this.setState({ currentIndex: nextIndex });
		}, 5000); // 5 giây
		this.dashboard = await stores.dashboardStore.getAll(undefined);
	}

	componentWillUnmount() {
		clearInterval(this.interval);
	}

	render() {
		const stickySection = (
			<section className="sticky">
				<div className="bubbles">
					{[...Array(10)].map((_, index) => (
						<div key={index} className="bubble"></div>
					))}
				</div>
			</section>
		);
		const { cardLoading, barChartLoading, pieChartLoading } = this.state;
		const billStatisticList = [
			{ title: 'Sản phẩm có bao bì', body: 3 },
			{ title: 'Sản phẩm không có bao bì', body: 3 },
			{ title: 'Tổng tiền', body: 3 + 3 + 3 },
		];

		const importStatisticList = [
			{ title: 'Số lượng sản phẩm có bao bì', body: 3 },
			{ title: 'Số lượng sản phẩm không bao bì', body: 3 },
			{ title: 'Tổng', body: 3 + 3 + 3 },
		];

		return (
			<React.Fragment>
				<Row gutter={[16, 16]}>
					<Col
						className={'dashboardCard'}
						{...cssColResponsiveSpan(24, 24, 12, 12, 6, 6)}
					>
						<Link to={RouterPath.admin_statistic + "/turnover_by_machine_report" + "?date=day"} target='blank' >
							<Card className={'dasboardCard-ticket'} bodyStyle={{ padding: 10 }} loading={cardLoading} bordered={false}>
								<Row align='middle'>
									<Col span={24}>
										<p className={'dashboardCardName'}>Doanh thu hôm nay</p>
										<div style={{ display: 'flex' }}>
											<strong className='dashbroadCardTitle'>TỔNG DOANH THU</strong>
											<p className='dashbroadCardMoney'>: <strong><u>{AppConsts.formatNumber(this.dashboard.totalMoneyToDay)}</u></strong> VNĐ</p>
										</div>
										<div style={{ display: 'flex' }}>
											<p className='dashbroadCardTitle'>Tổng tiền mặt</p>
											<p className='dashbroadCardMoney'>: <strong>{AppConsts.formatNumber(this.dashboard.totalMoneyCashToDay )}</strong> VNĐ</p>
										</div>
										<div style={{ display: 'flex' }}>
											<p className='dashbroadCardTitle'>Tổng tiền bằng QR</p>
											<p className='dashbroadCardMoney'>: <strong>{AppConsts.formatNumber(this.dashboard.totalMoneyQrToDay )}</strong> VNĐ</p>
										</div>
										<div style={{ display: 'flex' }}>
											<p className='dashbroadCardTitle'>Tổng tiền bằng RFID</p>
											<p className='dashbroadCardMoney'>: <strong>{AppConsts.formatNumber(this.dashboard.totalMoneyRfidToDay )}</strong> VNĐ</p>
										</div>
										<div style={{ display: 'flex' }}>
											<p className='dashbroadCardTitle'>Tổng tiền khuyến mãi</p>
											<p className='dashbroadCardMoney'>: <strong>{AppConsts.formatNumber(this.dashboard.totalValueOfDiscountToDay )}</strong> VNĐ</p>
										</div>
										<div style={{ display: 'flex' }}>
											<p className='dashbroadCardTitle'>Tổng tiền hoàn trả</p>
											<p className='dashbroadCardMoney'>: <strong>{AppConsts.formatNumber(this.dashboard.totalMoneyRefundToday)}</strong> VNĐ</p>
										</div>
									</Col>
								</Row>
							</Card>
						</Link>
					</Col>
					<Col
						className={'dashboardCard'}
						{...cssColResponsiveSpan(24, 24, 12, 12, 6, 6)}
					>
						<Link to={RouterPath.admin_statistic + "/turnover_by_machine_report" + "?date=yesterday"} target='blank'>

							<Card className={'dasboardCard-task'} bodyStyle={{ padding: 10 }} loading={cardLoading} bordered={false}>
								<Row align='middle'>
									<Col span={24}>
										<p className={'dashboardCardName'} >Doanh thu hôm qua</p>
										<div style={{ display: 'flex' }}>
											<strong className='dashbroadCardTitle'>TỔNG DOANH THU</strong>
											<p className='dashbroadCardMoney'>: <strong><u>{AppConsts.formatNumber(this.dashboard.totalMoneyYesterday )}</u></strong> VNĐ</p>
										</div>
										<div style={{ display: 'flex' }}>
											<p className='dashbroadCardTitle'>Tổng tiền mặt</p>
											<p className='dashbroadCardMoney'>: <strong>{AppConsts.formatNumber(this.dashboard.totalMoneyCashYesterday)}</strong> VNĐ</p>
										</div>
										<div style={{ display: 'flex' }}>
											<p className='dashbroadCardTitle'>Tổng tiền bằng QR</p>
											<p className='dashbroadCardMoney'>: <strong>{AppConsts.formatNumber(this.dashboard.totalMoneyQrYesterday )}</strong> VNĐ</p>
										</div>
										<div style={{ display: 'flex' }}>
											<p className='dashbroadCardTitle'>Tổng tiền bằng RFID</p>
											<p className='dashbroadCardMoney'>: <strong>{AppConsts.formatNumber(this.dashboard.totalMoneyRfidYesterday )}</strong> VNĐ</p>
										</div>
										<div style={{ display: 'flex' }}>
											<p className='dashbroadCardTitle'>Tổng tiền khuyến mãi</p>
											<p className='dashbroadCardMoney'>: <strong>{AppConsts.formatNumber(this.dashboard.totalValueOfDiscountYesterday )}</strong> VNĐ</p>
										</div>
										<div style={{ display: 'flex' }}>
											<p className='dashbroadCardTitle'>Tổng tiền hoàn trả</p>
											<p className='dashbroadCardMoney'>: <strong>{AppConsts.formatNumber(this.dashboard.totalMoneyRefundYesterday)}</strong> VNĐ</p>
										</div>
									</Col>
								</Row>
							</Card>
						</Link>
					</Col>
					<Col
						className={'dashboardCard'}
						{...cssColResponsiveSpan(24, 24, 12, 12, 6, 6)}
					>
						<Link to={RouterPath.admin_statistic + "/turnover_by_machine_report" + "?date=week"} target='blank'>
							<Card className={'dasboardCard-visitor'} bodyStyle={{ padding: 10 }} loading={cardLoading} bordered={false}>
								<Row align='middle'>
									<Col span={24}>
										<p className={'dashboardCardName'} >Doanh thu tuần này</p>
										<div style={{ display: 'flex' }}>
											<strong className='dashbroadCardTitle'>TỔNG DOANH THU</strong>
											<p className='dashbroadCardMoney'>: <strong><u>{AppConsts.formatNumber(this.dashboard.totalMoneyToWeek)}</u></strong> VNĐ</p>
										</div>
										<div style={{ display: 'flex' }}>
											<p className='dashbroadCardTitle'>Tổng tiền mặt</p>
											<p className='dashbroadCardMoney'>: <strong>{AppConsts.formatNumber(this.dashboard.totalMoneyCashToWeek )}</strong> VNĐ</p>
										</div>
										<div style={{ display: 'flex' }}>
											<p className='dashbroadCardTitle'>Tổng tiền bằng QR</p>
											<p className='dashbroadCardMoney'>: <strong>{AppConsts.formatNumber(this.dashboard.totalMoneyQrToWeek )}</strong> VNĐ</p>
										</div>
										<div style={{ display: 'flex' }}>
											<p className='dashbroadCardTitle'>Tổng tiền bằng RFID</p>
											<p className='dashbroadCardMoney'>: <strong>{AppConsts.formatNumber(this.dashboard.totalMoneyRfidToWeek )}</strong> VNĐ</p>
										</div>
										<div style={{ display: 'flex' }}>
											<p className='dashbroadCardTitle'>Tổng tiền khuyến mãi</p>
											<p className='dashbroadCardMoney'>: <strong>{AppConsts.formatNumber(this.dashboard.totalValueOfDiscountToWeek)}</strong> VNĐ</p>
										</div>
										<div style={{ display: 'flex' }}>
											<p className='dashbroadCardTitle'>Tổng tiền hoàn trả</p>
											<p className='dashbroadCardMoney'>: <strong>{AppConsts.formatNumber(this.dashboard.totalMoneyRefundWeek)}</strong> VNĐ</p>
										</div>
									</Col>
								</Row>
							</Card>
						</Link>
					</Col>
					<Col
						className={'dashboardCard'}
						{...cssColResponsiveSpan(24, 24, 12, 12, 6, 6)}
					>
						<Link to={RouterPath.admin_statistic + "/turnover_by_machine_report" + "?date=month"} target='blank'>
							<Card className={'dasboardCard-task'} bodyStyle={{ padding: 10 }} loading={cardLoading} bordered={false}>
								<Row align='middle'>
									<Col span={24}>
										<p className={'dashboardCardName'}>Doanh thu tháng này</p>
										<div style={{ display: 'flex' }}>
											<strong className='dashbroadCardTitle'>TỔNG DOANH THU</strong>
											<p className='dashbroadCardMoney'>: <strong><u>{AppConsts.formatNumber(this.dashboard.totalMoneyToMonth)}</u></strong> VNĐ</p>
										</div>
										<div style={{ display: 'flex' }}>
											<p className='dashbroadCardTitle'>Tổng tiền mặt</p>
											<p className='dashbroadCardMoney'>: <strong>{AppConsts.formatNumber(this.dashboard.totalMoneyCashToMonth )}</strong> VNĐ</p>
										</div>
										<div style={{ display: 'flex' }}>
											<p className='dashbroadCardTitle'>Tổng tiền bằng QR</p>
											<p className='dashbroadCardMoney'>: <strong>{AppConsts.formatNumber(this.dashboard.totalMoneyQrToMonth )}</strong> VNĐ</p>
										</div>
										<div style={{ display: 'flex' }}>
											<p className='dashbroadCardTitle'>Tổng tiền bằng RFID</p>
											<p className='dashbroadCardMoney'>: <strong>{AppConsts.formatNumber(this.dashboard.totalMoneyRfidToMonth)}</strong> VNĐ</p>
										</div>
										<div style={{ display: 'flex' }}>
											<p className='dashbroadCardTitle'>Tổng tiền khuyến mãi</p>
											<p className='dashbroadCardMoney'>: <strong>{AppConsts.formatNumber(this.dashboard.totalValueOfDiscountToMonth)}</strong> VNĐ</p>
										</div>
										<div style={{ display: 'flex' }}>
											<p className='dashbroadCardTitle'>Tổng tiền hoàn trả</p>
											<p className='dashbroadCardMoney'>: <strong>{AppConsts.formatNumber(this.dashboard.totalMoneyRefundMonth)}</strong> VNĐ</p>
										</div>
									</Col>
								</Row>
							</Card>
						</Link>
					</Col>
				</Row>
				<Row gutter={[16, 16]}>
					<Col
						className={'dashboardCard'}
						{...cssColResponsiveSpan(24, 24, 12, 12, 6, 6)}
					>
						<Link to={RouterPath.admin_monitor + "/machine_status_monitor" + "?ma_networkStatus=2"} target='blank'>
							<Card className={'dasboardCard-visitor'} bodyStyle={{ padding: 10 }} loading={cardLoading} bordered={false}>
								<Row align='middle'>
									<Col span={24} style={{ textAlign: "center" }}>
										<p className={'dashboardCardName'} >{"Máy trực tuyến"}<CloudOutlined style={{ marginLeft: "30px" }} /></p>
										<label>Tổng: <strong>{AppConsts.formatNumber(this.dashboard.totalMachineOnline)}</strong></label><br />
									</Col>
								</Row>
							</Card>
						</Link>
					</Col>
					<Col
						className={'dashboardCard'}
						{...cssColResponsiveSpan(24, 24, 12, 12, 6, 6)}
					>
						<Link to={RouterPath.admin_monitor + "/machine_status_monitor" + "?ma_networkStatus=1"} target='blank'>
							<Card className={'dasboardCard-ticket'} bodyStyle={{ padding: 10 }} loading={cardLoading} bordered={false}>
								<Row align='middle'>
									<Col style={{ textAlign: "center" }} span={24}>
										<p className={'dashboardCardName'} >{"Máy ngoại tuyến"}<GlobalOutlined style={{ marginLeft: "30px" }} /></p>
										<label>Tổng: <strong>{AppConsts.formatNumber(this.dashboard.totalMachineOffline)}</strong></label><br />
									</Col>
								</Row>
							</Card>
						</Link>

					</Col>
					<Col
						className={'dashboardCard'}
						{...cssColResponsiveSpan(24, 24, 12, 12, 6, 6)}
					>
						<Link to={RouterPath.admin_general + "/reportmachine"} target='blank'>
							<Card className={'dasboardCard-task'} bodyStyle={{ padding: 10 }} loading={cardLoading} bordered={false}>
								<Row align='middle'>
									<Col style={{ textAlign: "center" }} span={24}>
										<p className={'dashboardCardName'} >{"Máy bất thường"}<ToolOutlined style={{ marginLeft: "30px" }} /></p>
										<label>Tổng: <strong>{AppConsts.formatNumber(this.dashboard.totalMachineAbnormality_Warning)}</strong></label><br />
									</Col>
								</Row>
							</Card>
						</Link>
					</Col>
					<Col
						className={'dashboardCard'}
						{...cssColResponsiveSpan(24, 24, 12, 12, 6, 6)}
					>
						<Link to={RouterPath.admin_monitor + "/machine_outofstock"} target='blank'>
							<Card className={'dasboardCard-ticket'} bodyStyle={{ padding: 10 }} loading={cardLoading} bordered={false}>
								<Row align='middle'>
									<Col style={{ textAlign: "center" }} span={24}>
										<p className={'dashboardCardName'} >{"Máy có khay hết hàng"}<ShoppingCartOutlined style={{ marginLeft: "30px" }} /></p>
										<label>Tổng: <strong>{AppConsts.formatNumber(this.dashboard.totalMachineOutOfStock)}</strong></label><br />
									</Col>
								</Row>
							</Card>
						</Link>
					</Col>
				</Row>


				<Row justify='center'>
					<Col span={24}>
						<Card title={"Top 5 máy có doanh thu cao nhất tháng " + this.state.month_current} className={'dashboardBox'} loading={pieChartLoading} bordered={false}>
							<Row justify='center'>
								{stickySection}
								{/* <BarChartExample2Field data={this.dashboard?.top5BillingMachineOfMoneyMonth?.map(item => new Data2Field(item.name, item.id, item.value))} legend={["VNĐ"]} /> */}
							</Row>
						</Card>
					</Col>
				</Row>
				<Row justify='center'>

					<Col span={24}>
						<Card title={"Top 5 máy có nhiều lượt mua nhất tháng " + this.state.month_current} className={'dashboardBox'} loading={barChartLoading} bordered={false}>
							<Row justify='center'>
								{stickySection}
								<BarChartExample2Field data={this.dashboard?.top5BillingMachineOfQuantityMonth?.map(item => new Data2Field(item.name, item.id, item.value))} legend={["Số lượng"]} />
							</Row>
						</Card>
					</Col>
				</Row>
				<Row gutter={[16, 16]} justify='center'>
					<Col {...cssColResponsiveSpan(24, 24, 24, 12, 12, 12)}>
						<Card title={"Top 5 sản phẩm có bao bì bán nhiều nhất tháng " + this.state.month_current} className={'dashboardBox'} loading={pieChartLoading} bordered={false}>
							<Row justify='center'>
								{stickySection}
								<BarChartExample1Field data={this.dashboard?.top5DrinkOfQuantity?.map(item => new Data(item.name, item.value))} legend="Số lượng" />
							</Row>
						</Card>
					</Col>
					<Col {...cssColResponsiveSpan(24, 24, 24, 12, 12, 12)}>
						<Card title={"Top 5 sản phẩm không có bao bì bán nhiều nhất tháng " + this.state.month_current} className={'dashboardBox'} loading={barChartLoading} bordered={false}>
							<Row justify='center'>
								{stickySection}
								<BarChartExample1Field data={this.dashboard?.top5FreshDrinkOfQuantity?.map(item => new Data(item.name, item.value))} legend="Dung tích" />
							</Row>
						</Card>
					</Col>
				</Row>
			</React.Fragment >
		);
	}
}

export default Dashboard;
