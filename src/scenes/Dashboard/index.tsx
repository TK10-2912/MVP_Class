import { CloudOutlined, GlobalOutlined, InsertRowBelowOutlined, ShoppingCartOutlined, ToolOutlined } from '@ant-design/icons';
import AppConsts, { RouterPath, cssColResponsiveSpan } from '@src/lib/appconst';
import { DashboardCombinationDto, DashboardDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Card, Col, Row, Space } from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';
import BarChartExample2Field from './components/BarChartExample2Field';
import { Data } from './components/PieChartExample';
import './index.less';
import moment from 'moment';
import PieChartPaymentType from './components/PieChartExample';
import BarChartExample1Field3 from './components/BarChartExample1Field3';
import SelectEnum from '@src/components/Manager/SelectEnum';
import { eKindOfDay, valueOfeKindOfDay } from '@src/lib/enumconst';
import BarChartExample1Field4 from './components/BarChartExample1Field4';
import signalRAspNetCoreHelper from '@src/lib/signalRAspNetCoreHelper';

export class Dashboard extends React.PureComponent<any> {
	state = {
		cardLoading: true,
		lineChartLoading: true,
		barChartLoading: true,
		pieChartLoading: true,
		currentIndex: 0,
		month_current: undefined,
		date_current: undefined,
		kindOfDay: 1,
		isLoadDone: false,
	};
	dashboard: DashboardDto = new DashboardDto();
	dashboardPMaQ: DashboardCombinationDto = new DashboardCombinationDto();
	interval: any;
	async componentDidMount() {
		this.setState({ isLoadDone: false });
		this.setState({ month_current: moment().format("M"), date_current: moment().format("D") })
		setTimeout(() => this.setState({ cardLoading: false }), 1000);
		setTimeout(() => this.setState({ lineChartLoading: false }), 1500);
		setTimeout(() => this.setState({ barChartLoading: false }), 2000);
		setTimeout(() => this.setState({ pieChartLoading: false }), 1000);
		this.dashboardPMaQ = await stores.dashboardStore.getAllDashboardChartProductMoneyAndQuantity(this.state.kindOfDay);
		this.dashboard = await stores.dashboardStore.getAll(undefined);
		await signalRAspNetCoreHelper.registerNotificationHandler(['createRefund', 'createReport', 'createBilling'], [this.getAll.bind(this), this.getAllDashboardChartProductMoneyAndQuantity.bind(this)]);
		this.setState({ isLoadDone: true });

	}
	async getAllDashboardChartProductMoneyAndQuantity() {
		this.setState({ isLoadDone: false });
		this.dashboardPMaQ = await stores.dashboardStore.getAllDashboardChartProductMoneyAndQuantity(this.state.kindOfDay);
		this.setState({ isLoadDone: true });
	}
	async getAll() {
		this.setState({ isLoadDone: false });

		this.dashboard = await stores.dashboardStore.getAll(undefined);
		this.setState({ isLoadDone: true });

	}
	componentWillUnmount() {
		clearInterval(this.interval);
	}

	render() {
		const { dashbroadListResult, total_money, totalBilling, totalRefund } = stores.dashboardStore;
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
		const { dashboard } = this;
		return (
			<div className='dashbroad'>
				<Row gutter={[16, 16]}>
					<Col
						title='Xem chi tiết'
						{...cssColResponsiveSpan(24, 24, 12, 12, 8, 8)}
					>
						<Link to={RouterPath.admin_statistic + "/turnover_by_machine_report" + "?date=day"} target='blank' >
							<Card className={'dashbroad__card -bg-green -size-large'} loading={cardLoading} bordered={false}>
								<p className={'dashbroad__card-name'}>Doanh thu hôm nay ({moment().format('DD/MM/YYYY')})</p>
								<Row>
									<p className='dashbroad__card-title -text-strong'>Tổng doanh thu</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong><u>{AppConsts.formatNumber(dashboard.totalMoneyToDay)}</u></strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng tiền mặt</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalMoneyCashToDay)}</strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng tiền bằng QR</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalMoneyQrToDay)}</strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng tiền bằng RFID</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalMoneyRfidToDay)}</strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng tiền khuyến mãi</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalValueOfDiscountToDay)}</strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
								<Row >
									<p className='dashbroad__card-title'>Tổng tiền hoàn trả</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalMoneyRefundToday)}</strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
							</Card>
						</Link>
					</Col>
					<Col
						title='Xem chi tiết'
						{...cssColResponsiveSpan(24, 24, 12, 12, 8, 8)}
					>
						<Link to={RouterPath.admin_statistic + "/turnover_by_machine_report" + "?date=yesterday"} target='blank'>
							<Card className={'dashbroad__card -bg-blue -size-large'} loading={cardLoading} bordered={false}>
								<p className={'dashbroad__card-name'}>
									Doanh thu hôm qua ({moment().subtract(1, 'day').format('DD/MM/YYYY')})
								</p>

								<Row>
									<p className='dashbroad__card-title -text-strong'>Tổng doanh thu</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong><u>{AppConsts.formatNumber(dashboard.totalMoneyYesterday)}</u></strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng tiền mặt</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalMoneyCashYesterday)}</strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng tiền bằng QR</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalMoneyQrYesterday)}</strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng tiền bằng RFID</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalMoneyRfidYesterday)}</strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng tiền khuyến mãi</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalValueOfDiscountYesterday)}</strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
								<Row >
									<p className='dashbroad__card-title'>Tổng tiền hoàn trả</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalMoneyRefundYesterday)}</strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
							</Card>
						</Link>
					</Col>
					<Col

						title='Xem chi tiết'
						{...cssColResponsiveSpan(24, 24, 12, 12, 8, 8)}>
						<Link to={RouterPath.admin_statistic + "/turnover_by_machine_report" + "?date=week"} target='blank'>
							<Card className={'dashbroad__card -bg-orange -size-large'} loading={cardLoading} bordered={false}>
								<p className={'dashbroad__card-name'} >Doanh thu tuần này</p>
								<Row>
									<p className='dashbroad__card-title -text-strong'>Tổng doanh thu</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong><u>{AppConsts.formatNumber(dashboard.totalMoneyToWeek)}</u></strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng tiền mặt</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalMoneyCashToWeek)}</strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng tiền bằng QR</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalMoneyQrToWeek)}</strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng tiền bằng RFID</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalMoneyRfidToWeek)}</strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng tiền khuyến mãi</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalValueOfDiscountToWeek)}</strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng tiền hoàn trả</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalMoneyRefundWeek)}</strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
							</Card>
						</Link>
					</Col>
					<Col
						title='Xem chi tiết'
						{...cssColResponsiveSpan(24, 24, 12, 12, 8, 8)}
					>
						<Link to={RouterPath.admin_statistic + "/turnover_by_machine_report" + "?date=month"} target='blank'>
							<Card className={'dashbroad__card -bg-orange -size-large'} loading={cardLoading} bordered={false}>
								<p className={'dashbroad__card-name'}>Doanh thu tháng này ({moment().format('MM/YYYY')})</p>
								<Row>
									<p className='dashbroad__card-title -text-strong'>Tổng doanh thu</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong><u>{AppConsts.formatNumber(dashboard.totalMoneyToMonth)}</u></strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng tiền mặt</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalMoneyCashToMonth)}</strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng tiền bằng QR</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalMoneyQrToMonth)}</strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng tiền bằng RFID</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalMoneyRfidToMonth)}</strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng tiền khuyến mãi</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalValueOfDiscountToMonth)}</strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng tiền hoàn trả</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalMoneyRefundMonth)}</strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
							</Card>
						</Link>
					</Col>
					<Col
						title='Xem chi tiết'
						{...cssColResponsiveSpan(24, 24, 12, 12, 8, 8)}
					>
						<Link to={RouterPath.admin_statistic + "/turnover_by_machine_report" + "?date=lastMonth"} target='blank'>
							<Card className={'dashbroad__card -bg-green -size-large'} loading={cardLoading} bordered={false}>
								<p className={'dashbroad__card-name'}>Doanh thu tháng trước ({moment().subtract(1, 'month').format('MM/YYYY')})</p>
								<Row>
									<p className='dashbroad__card-title -text-strong'>Tổng doanh thu</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong><u>{AppConsts.formatNumber(dashboard.totalMoneyToLastMonth)}</u></strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng tiền mặt</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalMoneyCashToLastMonth)}</strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng tiền bằng QR</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalMoneyQrToLastMonth)}</strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng tiền bằng RFID</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalMoneyRfidToLastMonth)}</strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng tiền khuyến mãi</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalValueOfDiscountToLastMonth)}</strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng tiền hoàn trả</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalMoneyRefundLastMonth)}</strong></div>
										<div className='dashbroad__card-unit'>VNĐ</div>
									</div>
								</Row>
							</Card>
						</Link>
					</Col>
					<Col
						title='Xem chi tiết'
						{...cssColResponsiveSpan(24, 24, 12, 12, 8, 8)}
					>
						<Link to={RouterPath.admin_general + "/trashbin"} target='blank'>
							<Card className={'dashbroad__card -bg-blue -size-large'} style={{ height: "100%" }} loading={cardLoading} bordered={false}>
								<p className={'dashbroad__card-name'}>Khối lượng rác</p>
								<Row>
									<p className='dashbroad__card-title -text-strong'>Tổng rác hôm nay</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong><u>{AppConsts.formatNumber(dashboard.totalTrashToday / 1000)}</u></strong></div>
										<div className='dashbroad__card-unit'>KG</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng rác hôm qua</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalTrashYesterday / 1000)}</strong></div>
										<div className='dashbroad__card-unit'>KG</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng rác tuần này</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalTrashWeek / 1000)}</strong></div>
										<div className='dashbroad__card-unit'>KG</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng rác tháng này</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalTrashMonth / 1000)}</strong></div>
										<div className='dashbroad__card-unit'>KG</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng tín chỉ Carbon</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalCarbonCredit)}</strong></div>
										<div className='dashbroad__card-unit'>TÍN CHỈ</div>
									</div>
								</Row>
								<Row>
									<p className='dashbroad__card-title'>Tổng tín chỉ Nhựa</p>
									<div className='dashbroad__card-money'>
										<div>:</div>
										<div className='dashbroad__value'><strong>{AppConsts.formatNumber(dashboard.totalPlasticCredit)}</strong></div>
										<div className='dashbroad__card-unit'>TÍN CHỈ</div>
									</div>
								</Row>
							</Card>
						</Link>
					</Col>
				</Row>
				<Row gutter={[16, 16]} className='dashbroad__row'>
					<Col
						title='Xem chi tiết'
						{...cssColResponsiveSpan(12, 12, 12, 12, 6, 6)}
					>
						<Link to={RouterPath.admin_monitor + "/machine_status_monitor"} target='blank'>
							<Card className={'dashbroad__card -bg-green -size-small'} loading={cardLoading} bordered={false}>
								<Row className='dashbroad__row2'>
									<Col span={20}>
										<p className={'dashbroad__card-name'} >Tổng máy</p>
									</Col>
									<Col span={4}>
										<InsertRowBelowOutlined className='dashbroad__icon' />
									</Col>
								</Row>
								<Row className='dashbroad__row-total'>
									<label>Tổng: <strong>{AppConsts.formatNumber(dashboard.totalMachine)}</strong></label><br />
								</Row>
							</Card>
						</Link>
					</Col>
					<Col

						title='Xem chi tiết'
						{...cssColResponsiveSpan(12, 12, 12, 12, 6, 6)}
					>
						<Link to={RouterPath.admin_monitor + "/machine_status_monitor" + "?ma_networkStatus=2"} target='blank'>
							<Card className={'dashbroad__card -bg-blue -size-small'} loading={cardLoading} bordered={false}>
								<Row className='dashbroad__row2'>
									<Col span={20}>
										<p className={'dashbroad__card-name'} >Máy trực tuyến</p>
									</Col>
									<Col span={4}>
										<CloudOutlined className='dashbroad__icon' />
									</Col>
								</Row>
								<Row className='dashbroad__row-total'>
									<label>Tổng: <strong>{AppConsts.formatNumber(dashboard.totalMachineOnline)}</strong></label><br />
								</Row>
							</Card>
						</Link>
					</Col>
					<Col

						title='Xem chi tiết'
						{...cssColResponsiveSpan(12, 12, 12, 12, 6, 6)}
					>
						<Link to={RouterPath.admin_monitor + "/machine_status_monitor" + "?ma_networkStatus=1"} target='blank'>
							<Card className={'dashbroad__card -bg-gold -size-small'} loading={cardLoading} bordered={false}>
								<Row className='dashbroad__row2'>
									<Col span={20}>
										<p className={'dashbroad__card-name'} >Máy ngoại tuyến</p>
									</Col>
									<Col span={4}>
										<GlobalOutlined className='dashbroad__icon' />
									</Col>
								</Row>
								<Row className='dashbroad__row-total'>
									<label>Tổng: <strong>{AppConsts.formatNumber(dashboard.totalMachineOffline)}</strong></label><br />
								</Row>
							</Card>
						</Link>
					</Col>
					<Col

						title='Xem chi tiết'
						{...cssColResponsiveSpan(12, 12, 12, 12, 6, 6)}
					>
						<Link to={RouterPath.admin_monitor + "/machine_out_of_stock"} target='blank'>
							<Card className={'dashbroad__card -bg-orange -size-small'} loading={cardLoading} bordered={false}>
								<Row className='dashbroad__row2'>
									<Col span={20}>
										<p className={'dashbroad__card-name'} >Máy hết hàng</p>
									</Col>
									<Col span={4}>
										<ShoppingCartOutlined className='dashbroad__icon' />
									</Col>
								</Row>
								<Row className='dashbroad__row-total'>
									<label>Tổng: <strong>{AppConsts.formatNumber(dashboard.totalMachineOutOfStock)}</strong></label>
								</Row>
							</Card>
						</Link>
					</Col>
					<Col

						title='Xem chi tiết'
						{...cssColResponsiveSpan(12, 12, 12, 12, 6, 6)}
					>
						<Link to={RouterPath.admin_monitor + "/reportmachine"} target='blank'>
							<Card className={'dashbroad__card -bg-red -size-small'} loading={cardLoading} bordered={false}>
								<Row className='dashbroad__row2'>
									<Col span={20}>
										<p className={'dashbroad__card-name'} >Máy bất thường</p>
									</Col>
									<Col span={4}>
										<ToolOutlined className='dashbroad__icon' />
									</Col>
								</Row>
								<Row className='dashbroad__row-total'>
									<label>Tổng: <strong>{AppConsts.formatNumber(dashboard.totalMachineAbnormality_Error)}</strong></label><br />
								</Row>
							</Card>
						</Link>
					</Col>
				</Row>
				<Row justify='center'>
					<Col span={24}>
						<Card
							title={
								<Row>
									<Col span={21}>
										<strong>{"Top 10 máy có doanh thu cao nhất và lượt mua cao nhất "}</strong> <strong style={{ textTransform: "lowercase" }}>{valueOfeKindOfDay(this.state.kindOfDay!)}</strong>
									</Col>
									<Col span={3} style={{ zIndex: 1 }}>
										<SelectEnum
											placeholder='Trạng thái'
											eNum={eKindOfDay}
											enum_value={this.state.kindOfDay}
											onChangeEnum={async (e) => {
												await this.setState({ kindOfDay: e }); await this.getAllDashboardChartProductMoneyAndQuantity();
											}}
										></SelectEnum>
									</Col>
									<Col span={24}>
										<Space size={'large'}>
											<span>Tổng doanh thu: <strong style={{color:"#8884d8"}}>{AppConsts.formatNumber(total_money)}</strong> VND</span>
											<span>Tổng đơn hàng: <strong style={{color:"#ff7300"}}>{AppConsts.formatNumber(totalBilling)}</strong></span>
											<span>Tổng hoàn trả: <strong style={{color:"#ff708f"}}>{AppConsts.formatNumber(totalRefund)}</strong> VND</span>
										</Space>
									</Col>
								</Row>
							}
							loading={pieChartLoading}
							bordered={false}
						>
							{stickySection}
							<BarChartExample2Field
								data={dashbroadListResult?.top10ProductOfMoneyAndQuantity}
								legend={["Doanh thu", "Số lượng đơn hàng", "Hoàn trả"]}
								label='Tổng tiền (VND)'
								label2='Số lượng'
								label3='Tổng tiền hoàn trả'
							/>
						</Card>
					</Col>
				</Row>

				<Row gutter={[16, 16]} justify='center'>
					<Col {...cssColResponsiveSpan(24, 24, 24, 8, 8, 8)}>
						<Card
							className={'dashbroad__chart'}
							loading={barChartLoading}
							bordered={false}
							title={<strong>{"Top 5 hàng hoá có doanh thu cao nhất "}<span style={{ textTransform: "lowercase" }}>{valueOfeKindOfDay(this.state.kindOfDay!)}</span></strong>}
						>
							<Row justify='center'>
								{stickySection}
								<BarChartExample1Field3
									data={dashbroadListResult?.top5ProductOfMoneyToday?.map(item => new Data(item.name!, item?.value))}
									legend={"Doanh thu"}
								/>
							</Row>
						</Card>
					</Col>
					<Col {...cssColResponsiveSpan(24, 24, 24, 8, 8, 8)}>
						<Card title={<strong>{"Top 5 hàng hoá bán nhiều nhất "}<span style={{ textTransform: "lowercase" }}>{valueOfeKindOfDay(this.state.kindOfDay!)}</span></strong>} className={'dashbroad__chart'} loading={barChartLoading} bordered={false}>
							<Row justify='center'>
								{stickySection}
								<BarChartExample1Field4
									data={dashbroadListResult?.top5ProductOfQuantityToday?.map(item => new Data(item.name!, item?.value))}
									legend={"Số lượng"} />
							</Row>
						</Card>
					</Col>
					<Col {...cssColResponsiveSpan(24, 24, 24, 8, 8, 8)}>
						<Card title={<strong>{"Số lượng đơn hàng theo hình thức "}<span style={{ textTransform: "lowercase" }}>{valueOfeKindOfDay(this.state.kindOfDay!)}</span></strong>} className={'dashbroad__chart'} loading={barChartLoading} bordered={false}>
							<Row justify='center'>
								{stickySection}
								<PieChartPaymentType totalBillingPayment={dashbroadListResult?.numberOfBillingByPaymentToday} />
							</Row>
						</Card>
					</Col>
				</Row>
				<Row justify='center' gutter={16}>
					<Col {...cssColResponsiveSpan(24, 24, 24, 12, 12, 12)}>
						<Card>
							<BarChartExample2Field
								data={dashbroadListResult?.top5RefundMoneyMachine}
								legend={["Tổng tiền hoàn trả", "Tiền đã hoàn trả"]}
								label='Tổng tiền (VND)'
							/>
						</Card>
					</Col>
					<Col {...cssColResponsiveSpan(24, 24, 24, 12, 12, 12)}>
						<Card>
							<BarChartExample2Field
								data={dashbroadListResult?.top5ReportErrorMachine}
								legend={["Báo cáo lỗi", "Báo cáo lỗi chưa xử lý"]}
								label='Số lượng báo cáo'
							/>
						</Card>
					</Col>
				</Row>
			</div>
		);
	}
}

export default Dashboard;
