import * as React from 'react';
import { DeleteOutlined, ExportOutlined, SearchOutlined } from '@ant-design/icons';
import { BillingOfMachineDto, DailySaleMonitoringDto, MachineDto, SearchDailyMonitoringAdminInput, SearchDailyMonitoringInput } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Row } from 'antd';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan } from '@src/lib/appconst';
import SelectedGroupMachine from '@src/components/Manager/SelectedGroupMachine';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';
import TableSaleMonitoring from './component/TableSaleMonitoring';
import TablePaymentOfSaleMonitoring from './component/TablePaymentOfSaleMonitoring';
import ModalExportDailySaleMonitoring from './component/ModalExportDailySaleMonitoring';
import { isGranted } from '@src/lib/abpUtility';
import SelectUserMultiple from '@src/components/Manager/SelectUserMultiple';

export default class DailySaleMonitoring extends React.Component {
	state = {
		isLoadDone: false,
		visibleModalCreateUpdate: false,
		visibleModalStatusMachine: false,
		visibleExportMachine: false,
		skipCount: 0,
		maxResultCount: 10,
		pageSize: 10,
		currentPage: 1,
		clicked: false,
		select: false,
		ma_id_list: undefined,
		gr_ma_id: undefined,
		us_id_list: undefined,
	}
	machineSelected: BillingOfMachineDto = new BillingOfMachineDto();
	listKey: string[] = [];
	dailySaleMonitoringDto: DailySaleMonitoringDto = new DailySaleMonitoringDto();
	searchDailyMonitoringAdminInput: SearchDailyMonitoringAdminInput = new SearchDailyMonitoringAdminInput();
	searchDailyMonitoringInput: SearchDailyMonitoringInput = new SearchDailyMonitoringInput();
	async componentDidMount() {
		await this.getAll();
	}
	getAllAdmin = async () => {
		this.setState({ isLoadDone: false });
		this.searchDailyMonitoringAdminInput.gr_ma_id = this.state.gr_ma_id;
		this.searchDailyMonitoringAdminInput.ma_id_list = this.state.ma_id_list;
		this.searchDailyMonitoringAdminInput.us_id = this.state.us_id_list;
		this.dailySaleMonitoringDto = await stores.dailyMonitorStore.dailySaleMonitoringAdmin(this.searchDailyMonitoringAdminInput);
		this.setState({ isLoadDone: true })
	}
	async getAllUser() {
		this.setState({ isLoadDone: false });
		this.searchDailyMonitoringInput.gr_ma_id = this.state.gr_ma_id;
		this.searchDailyMonitoringInput.ma_id_list = this.state.ma_id_list;
		this.dailySaleMonitoringDto = await stores.dailyMonitorStore.dailySaleMonitoring(this.searchDailyMonitoringInput);
		this.setState({ isLoadDone: true })
	}

	getAll = () => {
		if (isGranted(AppConsts.Permission.Pages_DailyMonitoring_Admin_DailySale)) {
			this.getAllAdmin()
		} else {
			this.getAllUser()
		}
	}

	onChangePage = async (page: number, pagesize?: number) => {
		if (pagesize !== undefined) {
			await this.setState({ pageSize: pagesize! });
		}
		this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
			this.getAll();
		})
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
		// const right = this.state.visibleModalCreateUpdate ? cssCol(24) : cssCol(0);
		return (
			<Card>
				<Row align='middle' gutter={[8, 8]} className='alighItemFlexEnd-col-1600px'>
					<Col {...cssColResponsiveSpan(16, 17, 12, 12, 12, 6)} xxl={{ order: 1, span: 6 }}><h2>Giám sát trạng thái bán hàng</h2></Col>
					{isGranted(AppConsts.Permission.Pages_DailyMonitoring_DailySale_Export) &&
						<Col {...cssColResponsiveSpan(8, 7, 12, 12, 12, 3)} xxl={{ order: 3, span: 3 }} style={{ textAlign: "right" }}>
							<Button title='Xuất dữ liệu' type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportMachine: true, select: false })}>{(window.innerWidth > 650) && 'Xuất dữ liệu'}</Button>
						</Col>
					}
					<Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 15)} style={{ display: "flex", flexWrap: "wrap", padding: 0 }} xxl={{ order: 2, span: 15 }}>
						<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 5)}>
							<strong>Nhóm máy</strong>
							<SelectedGroupMachine groupmachineId={this.state.gr_ma_id} onChangeGroupMachine={(value) => { this.setState({ gr_ma_id: value }); this.getAll() }}></SelectedGroupMachine>
						</Col>
						<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 5)}>
							<strong>Máy bán nước</strong>
							<SelectedMachineMultiple
								onChangeMachine={(value) => { this.setState({ ma_id_list: value }); this.getAll() }} groupMachineId={this.state.gr_ma_id} listMachineId={this.state.ma_id_list}
							></SelectedMachineMultiple>
						</Col>
						{isGranted(AppConsts.Permission.Pages_DailyMonitoring_Admin_DailySale) ?
							<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 5)}>
								<strong>Người sở hữu</strong>
								<SelectUserMultiple us_id_list={this.state.us_id_list} onChangeUser={async value => { await this.setState({ us_id_list: value }); this.getAll() }} ></SelectUserMultiple>
							</Col>
							:
							null
						}
						<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 9)} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }}>
							<Button placeholder='Tìm kiếm' type='primary' onClick={() => this.handleSubmitSearch()}><SearchOutlined />{'Tìm kiếm'}</Button>
							{(this.state.gr_ma_id !== undefined || this.state.ma_id_list !== undefined || !!this.state.us_id_list) &&
								<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >{this.shouldChangeText() ? 'Xóa tìm kiếm' : 'Xóa'}</Button>
							}
						</Col>
					</Col>
				</Row>
				<Row style={{ marginTop: 10 }}>
					<Col {...left}>
						<Row justify='center'>
							<h2 style={{ textAlign: "center" }}>Trạng thái bán hàng theo loại thanh toán</h2>
						</Row>
						<TablePaymentOfSaleMonitoring
							dailySaleMonitoringDto={this.dailySaleMonitoringDto}
						/>
						<Row justify='center'>
							<h2 style={{ textAlign: "center", marginTop: '10px' }}>Trạng thái bán hàng theo máy</h2>
						</Row>
						<TableSaleMonitoring
							actionTable={this.actionTable}
							billingOfMachine={this.dailySaleMonitoringDto.listBillingOfMachine}
							pagination={{
								pageSize: this.state.pageSize,
								total: !!this.dailySaleMonitoringDto.listBillingOfMachine ? this.dailySaleMonitoringDto.listBillingOfMachine.length : 0,
								current: this.state.currentPage,
								showTotal: (tot) => ("Tổng: ") + tot + "",
								showQuickJumper: true,
								showSizeChanger: true,
								pageSizeOptions: ['10', '20', '50', '100'],
								onShowSizeChange(current: number, size: number) {
									self.onChangePage(current, size)
								},
								onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
							}}
						/>
					</Col>
					{this.state.visibleExportMachine &&
						<ModalExportDailySaleMonitoring dailySaleMonitoringDto={this.dailySaleMonitoringDto} onCancel={() => this.setState({ visibleExportMachine: false })} visible={this.state.visibleExportMachine} />
					}
				</Row>
			</Card >
		)
	}
}
