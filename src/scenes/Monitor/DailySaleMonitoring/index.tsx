import * as React from 'react';
import { DeleteOutlined, ExportOutlined, SearchOutlined } from '@ant-design/icons';
import { BillingOfMachineDto, DailySaleMonitoringDto, SearchDailyMonitoringInput } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Row } from 'antd';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import SelectedGroupMachine from '@src/components/Manager/SelectedGroupMachine';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';
import TableSaleMonitoring from './component/TableSaleMonitoring';
import TablePaymentOfSaleMonitoring from './component/TablePaymentOfSaleMonitoring';
import ModalExportDailySaleMonitoring from './component/ModalExportDailySaleMonitoring';
import { isGranted } from '@src/lib/abpUtility';
import CountdownTimer from '@src/components/CountDowntTimer';
import { tupleNum } from 'antd/lib/_util/type';

export default class DailySaleMonitoring extends React.PureComponent {
	state = {
		isLoadDone: false,
		visibleModalCreateUpdate: false,
		visibleModalStatusMachine: false,
		visibleExportMachine: false,
		skipCount: 1,
		maxResultCount: 10,
		pageSize: 10,
		currentPage: 1,
		clicked: false,
		select: false,
		ma_id_list: undefined,
		us_id: undefined,
		gr_ma_id: undefined,
		us_id_list: undefined,
	}
	machineSelected: BillingOfMachineDto = new BillingOfMachineDto();
	listKey: string[] = [];
	dailySaleMonitoringDto: DailySaleMonitoringDto = new DailySaleMonitoringDto();
	searchDailyMonitoringInput: SearchDailyMonitoringInput = new SearchDailyMonitoringInput();
	async componentDidMount() {
		const urlParams = new URLSearchParams(window.location.search);
		let ma_id = urlParams.get("ma_id") == null || urlParams.get("ma_id") == "ma_id" ? undefined : urlParams.get("ma_id")
		if (!!ma_id) {
			await this.setState({ ma_id_list: [Number(ma_id)] });
		}
		await this.getAll();
	}
	getAllAdmin = async () => {
		this.setState({ isLoadDone: false });
		await stores.dailyMonitorStore.dailySaleMonitoringAdmin(this.state.us_id_list, this.state.gr_ma_id, this.state.ma_id_list, undefined, undefined);
		this.setState({ isLoadDone: true });
	}
	async getAllUser() {
		this.setState({ isLoadDone: false });
		await stores.dailyMonitorStore.dailySaleMonitoring(this.state.gr_ma_id, this.state.ma_id_list, undefined, undefined);
		this.setState({ isLoadDone: true });
	}

	getAll = () => {
		if (isGranted(AppConsts.Permission.Pages_DailyMonitoring_Admin_DailySale)) {
			this.getAllAdmin();
		} else {
			this.getAllUser();
		}
	}

	onChangePage = async (page: number, pagesize?: number) => {
		if (pagesize !== undefined) {
			await this.setState({ pageSize: pagesize! });
		}
		this.setState({ skipCount: page, currentPage: page })
		await this.getAll();
	}

	handleSubmitSearch = async () => {
		this.onChangePage(1, this.state.pageSize);
	}

	clearSearch = async () => {
		await this.setState({
			gr_ma_id: undefined,
			ma_id_list: undefined,
			us_id_list: undefined,
		})
		this.getAll();
	}

	shouldChangeText = () => {
		const isChangeText = window.innerWidth >= 576 && window.innerWidth <= 1393;
		return !isChangeText;
	}
	actionTable = (machine: BillingOfMachineDto, event: EventTable) => {
		if (event == EventTable.View) {
			this.machineSelected.init(machine);
			this.setState({ visibleModalStatusMachine: true });
		}
	}
	render() {
		let self = this;
		const left = this.state.visibleModalCreateUpdate ? cssCol(0) : cssCol(24);
		const { dailySaleMonitoringResult, total } = stores.dailyMonitorStore;
		return (
			<Card>
				<Row align='middle' gutter={[8, 8]} className='alighItemFlexEnd-col-1600px'>
					<h2 style={{ textAlign: "start", margin: 0 }}>Trạng thái bán hàng hôm nay ({new Date().toLocaleDateString('vi-VN')})</h2>
					&nbsp;&nbsp;
					<CountdownTimer handleSearch={this.handleSubmitSearch} />
				</Row>
				<Row gutter={10} align='bottom'>
					<Col {...cssColResponsiveSpan(24, 24, 19, 20, 20, 15)} style={{ display: "flex", flexWrap: "wrap", padding: 0 }} >
						<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 8)}>
							<strong>Nhóm máy</strong>
							<SelectedGroupMachine groupmachineId={this.state.gr_ma_id} onChangeGroupMachine={(value) => { this.setState({ gr_ma_id: value }); this.onChangePage(1, this.state.pageSize) }}></SelectedGroupMachine>
						</Col>
						<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 8)}>
							<strong>Máy bán nước</strong>
							<SelectedMachineMultiple
								onChangeMachine={(value) => { this.setState({ ma_id_list: value }); this.onChangePage(1, this.state.pageSize) }} groupMachineId={this.state.gr_ma_id} listMachineId={this.state.ma_id_list}
							></SelectedMachineMultiple>
						</Col>
						<Col {...cssColResponsiveSpan(24, 12, 12, 12, 12, 8)} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }}>
							<Button placeholder='Tìm kiếm' type='primary' onClick={() => this.handleSubmitSearch()}><SearchOutlined />{'Tìm kiếm'}</Button>
							{(this.state.gr_ma_id !== undefined || this.state.ma_id_list !== undefined || !!this.state.us_id_list) &&
								<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >{this.shouldChangeText() ? 'Xóa tìm kiếm' : 'Xóa'}</Button>
							}
						</Col>
					</Col>
					{isGranted(AppConsts.Permission.Pages_DailyMonitoring_DailySale_Export) &&
						<Col {...cssColResponsiveSpan(8, 7, 5, 4, 4, 9)} style={{ textAlign: 'right' }}>
							<Button title='Xuất dữ liệu' type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportMachine: true, select: false })}>{(window.innerWidth > 650) && 'Xuất dữ liệu'}</Button>
						</Col>
					}
				</Row>

				<Row style={{ marginTop: 10 }}>
					<Col {...left}>
						<Row justify='center'>
							<h2 style={{ textAlign: "center" }}>Trạng thái bán hàng theo loại thanh toán</h2>
						</Row>
						<TablePaymentOfSaleMonitoring
							dailySaleMonitoringDto={dailySaleMonitoringResult}
						/>
						<Row justify='center'>
							<h2 style={{ textAlign: "center", marginTop: '10px' }}>Trạng thái bán hàng theo máy</h2>
						</Row>
						<TableSaleMonitoring
							is_printed={false}
							actionTable={this.actionTable}
							billingOfMachine={dailySaleMonitoringResult.listBillingOfMachine?dailySaleMonitoringResult.listBillingOfMachine.slice((this.state.currentPage - 1) * this.state.pageSize, (this.state.currentPage - 1) * this.state.pageSize + this.state.pageSize):[]}
							pagination={{
								position: ['topRight'],
								pageSize: this.state.pageSize,
								total: total,
								current: this.state.currentPage,
								showTotal: (tot) => ("Tổng: ") + tot + "",
								showQuickJumper: true,
								showSizeChanger: true,
								pageSizeOptions: pageSizeOptions,
								onShowSizeChange(current: number, size: number) {
									self.onChangePage(current, size)
								},
								onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
							}}
						/>
					</Col>
					{this.state.visibleExportMachine &&
						<ModalExportDailySaleMonitoring skipCount={this.state.skipCount} pageSize={this.state.pageSize} dailySaleMonitoringDto={dailySaleMonitoringResult} onCancel={() => this.setState({ visibleExportMachine: false })} visible={this.state.visibleExportMachine} />
					}
				</Row>
			</Card >
		)
	}
}
