
import * as React from 'react';
import { DeleteOutlined, ExportOutlined, SearchOutlined } from '@ant-design/icons';
import { L, isGranted } from '@src/lib/abpUtility';
import { MachineDto, MachineOutOfStockQueryDto, MachineOutOfStockQueryDtoListResultDto, SearchDailyMonitoringAdminInput, SearchDailyMonitoringInput } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Badge, Button, Card, Col, Modal, Row, Space } from 'antd';
import AppConsts, { EventTable, cssColResponsiveSpan } from '@src/lib/appconst';
import SelectedGroupMachine from '@src/components/Manager/SelectedGroupMachine';
import { TableRowSelection } from 'antd/lib/table/interface';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';
import TableMainMachineOutOfStock from './component/TableMainMachineOutOfStock';
import ModalExportMachineOutOfStock from './component/ModalExportMachineOutOfStock';
import SelectUserMultiple from '@src/components/Manager/SelectUserMultiple';
import MachineDetailReport from '../MachineDetailReport';
import ModalExportProductToImportInToMachine from './component/ModalExportProductToImportInToMachine';

export default class MachineOutOfStockMonitoring extends React.Component {
	state = {
		isLoadDone: false,
		visibleModalStatusMachine: false,
		visibleExportMachine: false,
		visibleMachineDetail: false,
		visibleExportProductToImportInToMachine: false,
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
	machineSelected: MachineOutOfStockQueryDto = new MachineOutOfStockQueryDto();
	machineDetailSelected: MachineDto = new MachineDto();
	listMachine: MachineOutOfStockQueryDto[] = [];
	listKey: string[] = [];
	machineOutOfStockQueryDtoListResultDto: MachineOutOfStockQueryDtoListResultDto = new MachineOutOfStockQueryDtoListResultDto();
	searchDailyMonitoringInput: SearchDailyMonitoringInput = new SearchDailyMonitoringInput();
	searchDailyMonitoringAdminInput: SearchDailyMonitoringAdminInput = new SearchDailyMonitoringAdminInput();
	async componentDidMount() {
		await this.getAll();
	}

	getAllAdmin = async () => {
		this.setState({ isLoadDone: false });
		this.searchDailyMonitoringAdminInput.gr_ma_id = this.state.gr_ma_id;
		this.searchDailyMonitoringAdminInput.ma_id_list = this.state.ma_id_list;
		this.searchDailyMonitoringAdminInput.us_id = this.state.us_id_list;
		this.machineOutOfStockQueryDtoListResultDto = await stores.dailyMonitorStore.machineOutOfStockQueryAdmin(this.searchDailyMonitoringAdminInput);
		await stores.machineStore.getAllByAdmin(undefined, undefined, undefined, undefined, undefined, undefined, undefined);
		this.setState({ isLoadDone: true })
	}
	async getAllUser() {
		this.setState({ isLoadDone: false });
		this.searchDailyMonitoringInput.gr_ma_id = this.state.gr_ma_id;
		this.searchDailyMonitoringInput.ma_id_list = this.state.ma_id_list;
		this.machineOutOfStockQueryDtoListResultDto = await stores.dailyMonitorStore.machineOutOfStockQuery(this.searchDailyMonitoringInput);
		await stores.machineStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined);
		this.setState({ isLoadDone: true })
	}
	getAll = () => {
		isGranted(AppConsts.Permission.Pages_DailyMonitoring_Admin_OutOfStock) ? this.getAllAdmin() : this.getAllUser()
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
	actionTable = (machine: MachineOutOfStockQueryDto, event: EventTable) => {
		if (event === EventTable.View) {
			this.machineSelected.init(machine);
			this.setState({ visibleModalStatusMachine: true });
		}
		if (event === EventTable.ViewDetail) {
			const { machineListResult } = stores.machineStore;
			this.machineDetailSelected = machineListResult.filter(item => item.ma_code?.includes(machine.ma_may!))[0];
			this.setState({
				visibleMachineDetail: true,
			});
		}
	}

	handleVisibleChange = (visible) => {
		this.setState({ clicked: visible });
	}
	hide = () => {
		this.setState({ clicked: false });
	}
	rowSelection: TableRowSelection<MachineOutOfStockQueryDto> = {
		onChange: (listIdMember: React.Key[], listItem: MachineOutOfStockQueryDto[]) => {
			this.setState({ isLoadDone: false });
			this.listMachine = listItem;
			this.listKey = this.listMachine.map(item => item.key!);
			this.setState({ isLoadDone: true });
		}
	}

	clearSearch = async () => {
		await this.setState({
			gr_ma_id: undefined,
			ma_id_list: undefined,
			us_id_list: undefined,
		})
		this.getAll();
	}

	render() {
		let self = this;
		return (
			<Card>
				<Row>
					<Col {...cssColResponsiveSpan(18, 17, 12, 12, 12, 12)} ><h2>Giám sát máy hết hàng</h2></Col>
					{isGranted(AppConsts.Permission.Pages_DailyMonitoring_OutOfStock_Export) &&
						<>

							<Col {...cssColResponsiveSpan(6, 7, 12, 12, 12, 12)} style={{ display: "flex", justifyContent: "end" }}>
								<Space>

									<Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportProductToImportInToMachine: true })}>{(window.innerWidth > 650) && 'Xuất dữ liệu nhập hàng'}</Button>
									{this.listKey.length < 1 ?
										<Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportMachine: true, select: false })}>{(window.innerWidth > 650) && 'Xuất dữ liệu'}</Button>
										:
										<Badge count={this.listKey.length}>
											<Button type='primary' icon={<ExportOutlined />} title={L("Xuất dữ liệu")}
												onClick={async () => { this.setState({ visibleExportMachine: true, select: true }) }}
											>{(window.innerWidth > 650) && 'Xuất dữ liệu'}</Button>
										</Badge>
									}
								</Space>
							</Col>
						</>
					}
				</Row>
				<Row align='bottom' gutter={[8, 8]} className='alighItemFlexEnd-col-1600px'>
					<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)}>
						<strong>Nhóm máy</strong>
						<SelectedGroupMachine groupmachineId={this.state.gr_ma_id} onChangeGroupMachine={(value) => { this.setState({ gr_ma_id: value }); this.getAll() }}></SelectedGroupMachine>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)}>
						<strong>Máy bán nước</strong>
						<SelectedMachineMultiple
							onChangeMachine={(value) => { this.setState({ ma_id_list: value }); this.getAll() }} groupMachineId={this.state.gr_ma_id} listMachineId={this.state.ma_id_list}
						></SelectedMachineMultiple>
					</Col>

					{isGranted(AppConsts.Permission.Pages_DailyMonitoring_Admin_DailySale) ?
						<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)}>
							<strong>Người sở hữu</strong>
							<SelectUserMultiple us_id_list={this.state.us_id_list} onChangeUser={async value => { await this.setState({ us_id_list: value }); this.getAll() }} ></SelectUserMultiple>
						</Col>
						:
						""
					}
					<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)}>
						<Space>
							<Button placeholder='Tìm kiếm' type='primary' onClick={() => this.handleSubmitSearch()}><SearchOutlined />Tìm kiếm</Button>
							{(this.state.gr_ma_id !== undefined || this.state.ma_id_list !== undefined || !!this.state.us_id_list) &&
								<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >{(window.innerWidth >= 576 && window.innerWidth <= 1393) ? 'Xóa' : 'Xóa tìm kiếm'}</Button>
							}
						</Space>
					</Col>
				</Row>

				<Row >
					<Col span={24} style={{ width: "100%" }}>
						<TableMainMachineOutOfStock
							machineOutOfStockQueryDto={this.machineOutOfStockQueryDtoListResultDto.items}
							hasAction={this.listKey.length > 0 ? false : true}
							rowSelection={this.rowSelection}
							actionTable={this.actionTable}
							pagination={{
								pageSize: this.state.pageSize,
								total: !!this.machineOutOfStockQueryDtoListResultDto.items ? this.machineOutOfStockQueryDtoListResultDto.items.length : 0,
								current: this.state.currentPage,
								showTotal: (tot) => ("Tổng: ") + tot + "",
								showQuickJumper: true,
								showSizeChanger: true,
								pageSizeOptions: ['10', '20', '50', '100'],
								onShowSizeChange(current: number, size: number) {
									self.onChangePage(current, size)
								},
								onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
							}} />
					</Col>
					{this.state.visibleExportMachine &&
						<ModalExportMachineOutOfStock machineOutOfStockQueryDto={this.state.select ? this.listMachine : this.machineOutOfStockQueryDtoListResultDto.items!} onCancel={() => this.setState({ visibleExportMachine: false })} visible={this.state.visibleExportMachine} />
					}
				</Row>
				<Modal
					centered
					visible={this.state.visibleMachineDetail}
					cancelButtonProps={{ style: { display: "none" } }}
					onCancel={() => { this.setState({ visibleMachineDetail: false }) }}
					footer={null}
					width={880}
					maskClosable={true}

				>
					{
						this.state.visibleMachineDetail &&
						<MachineDetailReport machineSelected={this.machineDetailSelected}
							onCancel={() => this.setState({ visibleMachineDetail: false })}
						/>
					}
				</Modal>

				<ModalExportProductToImportInToMachine
					machineOutOfStockQueryDto={this.machineOutOfStockQueryDtoListResultDto.items!}
					visible={this.state.visibleExportProductToImportInToMachine}
					onCancel={() => { this.setState({ visibleExportProductToImportInToMachine: false }) }}
					getAll={this.handleSubmitSearch}
				></ModalExportProductToImportInToMachine>
			</Card >
		)
	}
}
