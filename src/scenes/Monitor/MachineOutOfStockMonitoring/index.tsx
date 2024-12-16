
import * as React from 'react';
import { DeleteOutlined, ExportOutlined, SearchOutlined } from '@ant-design/icons';
import { L, isGranted } from '@src/lib/abpUtility';
import { MachineDto, MachineOutOfStockQueryDto, SearchDailyMonitoringInput } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Badge, Button, Card, Col, Modal, Row, Space } from 'antd';
import AppConsts, { EventTable, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
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
		skipCount: 0,
		pageSize: AppConsts.PAGESIZE,
		currentPage: 1,
		clicked: false,
		select: false,
		ma_id_list: undefined,
		gr_ma_id: undefined,
		us_id_list: undefined,
		us_id: undefined,
		visibleExportProductToImportInToMachine: false,
	}
	machineSelected: MachineOutOfStockQueryDto = new MachineOutOfStockQueryDto();
	machineDetailSelected: MachineDto = new MachineDto();
	listMachine: MachineOutOfStockQueryDto[] = [];
	listKey: string[] = [];
	searchDailyMonitoringInput: SearchDailyMonitoringInput = new SearchDailyMonitoringInput();
	searchDailyMonitoringAdminInput: any
	async componentDidMount() {
		await this.getAll();
		await this.setState({ isLoadDone: !this.state.isLoadDone })
	}

	getAllAdmin =async () => {
		await Promise.all([
			stores.repositoryStore.getAllByAdmin(this.state.us_id_list, undefined, undefined, undefined, undefined),
			stores.machineStore.getAllByAdmin(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined),
			stores.dailyMonitorStore.machineOutOfStockQueryAdmin(this.state.us_id_list, this.state.gr_ma_id, this.state.ma_id_list, undefined, undefined),
		]);
		this.setState({ visibleExportProductToImportInToMachine: false, isLoadDone: !this.state.isLoadDone })
	}

	getAllUser = async() => {
		await Promise.all([
			stores.repositoryStore.getAllByAdmin(undefined, undefined, undefined, undefined, undefined),
			stores.machineStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined, undefined),
			stores.dailyMonitorStore.machineOutOfStockQuery(this.state.gr_ma_id, this.state.ma_id_list, undefined, undefined),
		]);
		this.setState({ visibleExportProductToImportInToMachine: false, isLoadDone: !this.state.isLoadDone })

	}

	getAll = async () => {
		isGranted(AppConsts.Permission.Pages_DailyMonitoring_Admin_OutOfStock) ? await this.getAllAdmin() : await this.getAllUser()
		this.setState({ isLoadDone: !this.state.isLoadDone });

	}

	onChangePage = async (page: number, pagesize?: number) => {
		if (pagesize !== undefined) {
			await this.setState({ pageSize: pagesize! });
		}
		this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
			await this.getAll();
		})
	}

	handleSubmitSearch = async () => {
		this.onChangePage(1, this.state.pageSize);
	}
	actionTable = async (machine: MachineOutOfStockQueryDto, event: EventTable) => {
		if (event === EventTable.View) {
			this.machineSelected.init(machine);
			await stores.repositoryStore.getAllByAdmin([machine.us_id_operator], undefined, undefined, undefined, undefined);
			this.setState({ visibleModalStatusMachine: true });
		}
		if (event === EventTable.ViewDetail) {
			const { machineListResult } = stores.machineStore;
			this.machineDetailSelected = machineListResult.filter(item => item.ma_code?.includes(machine.ma_may!))[0];
			this.setState({ visibleMachineDetail: true });
		}
	}

	handleVisibleChange = (visible) => {
		this.setState({ clicked: visible });
	}
	hide = () => {
		this.setState({ clicked: false });
	}
	rowSelection: TableRowSelection<MachineOutOfStockQueryDto> = {
		onChange: (_listIdMember: React.Key[], listItem: MachineOutOfStockQueryDto[]) => {
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
		const { listMachineOutOfStockQueryDto, total } = stores.dailyMonitorStore;
		let self = this;
		return (
			<Card>
				<Row>
					<Col {...cssColResponsiveSpan(18, 17, 12, 12, 12, 12)} ><h2>Máy hết hàng hôm nay ({new Date().toLocaleDateString('vi-VN')})</h2></Col>
					<Col {...cssColResponsiveSpan(6, 7, 12, 12, 12, 12)} style={{ display: "flex", justifyContent: "end" }}>
						<Space>
							{isGranted(AppConsts.Permission.Pages_DailyMonitoring_OutOfStock_ExportRepository) &&
								<Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportProductToImportInToMachine: true })}>{(window.innerWidth > 650) && 'Nạp hàng'}</Button>
							}
							{isGranted(AppConsts.Permission.Pages_DailyMonitoring_OutOfStock_Export) &&
								<>
									{this.listKey.length < 1 ?
										<Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportMachine: true, select: false })}>{(window.innerWidth > 650) && 'Xuất dữ liệu'}</Button>
										:
										<Badge count={this.listKey.length}>
											<Button type='primary' icon={<ExportOutlined />} title={L("Xuất dữ liệu")}
												onClick={async () => { this.setState({ visibleExportMachine: true, select: true }) }}
											>{(window.innerWidth > 650) && 'Xuất dữ liệu'}</Button>
										</Badge>
									}
								</>
							}
						</Space>
					</Col>
				</Row>
				<Row align='bottom' gutter={[8, 8]} className='alighItemFlexEnd-col-1600px'>
					<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)}>
						<strong>Nhóm máy</strong>
						<SelectedGroupMachine groupmachineId={this.state.gr_ma_id} onChangeGroupMachine={(value) => { this.setState({ gr_ma_id: value }); this.onChangePage(1, this.state.pageSize) }}></SelectedGroupMachine>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)}>
						<strong>Máy bán nước</strong>
						<SelectedMachineMultiple
							onChangeMachine={(value) => { this.setState({ ma_id_list: value }); this.onChangePage(1, this.state.pageSize) }} groupMachineId={this.state.gr_ma_id} listMachineId={this.state.ma_id_list}
						></SelectedMachineMultiple>
					</Col>

					{isGranted(AppConsts.Permission.Pages_DailyMonitoring_Admin_DailySale) ?
						<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)}>
							<strong>Người vận hành</strong>
							<SelectUserMultiple us_id_list={this.state.us_id_list} onChangeUser={async value => { await this.setState({ us_id_list: value }); this.onChangePage(1, this.state.pageSize) }} ></SelectUserMultiple>
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
					<Col span={24}>
						<TableMainMachineOutOfStock
							machineOutOfStockQueryDto={listMachineOutOfStockQueryDto}
							hasAction={this.listKey.length > 0 ? false : true}
							rowSelection={this.rowSelection}
							actionTable={this.actionTable}
							is_printed={false}
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
							}} />
					</Col>
					{this.state.visibleExportMachine &&
						<ModalExportMachineOutOfStock machineOutOfStockQueryDto={this.state.select ? this.listMachine : listMachineOutOfStockQueryDto!} onCancel={() => this.setState({ visibleExportMachine: false })} visible={this.state.visibleExportMachine} />
					}
				</Row>
				<Modal
					className='centerModal'
					centered
					visible={this.state.visibleMachineDetail}
					cancelButtonProps={{ style: { display: "none" } }}
					onCancel={() => { this.setState({ visibleMachineDetail: false }) }}
					footer={null}
					width={"80%"}
					maskClosable={true}
					destroyOnClose={true}
					title={
						<Row gutter={8} align='bottom'>
							<Col span={24} style={{ display: "flex", justifyContent: "center" }}>
								<h2>{"Xem chi tiết bố cục máy "}<strong style={{ color: '#237804' }}>{stores.sessionStore.getNameMachines(this.machineDetailSelected.ma_id)}</strong>{" của người vận hành "}{stores.sessionStore.getUserNameById(this.machineDetailSelected.us_id_operator)}</h2>
							</Col>
						</Row>
					}
				>
					<MachineDetailReport machineSelected={this.machineDetailSelected} />
				</Modal>
				{this.state.visibleExportProductToImportInToMachine &&
					<ModalExportProductToImportInToMachine
						machineOutOfStockQueryDto={listMachineOutOfStockQueryDto}
						visible={this.state.visibleExportProductToImportInToMachine}
						onCancel={() => { this.setState({ visibleExportProductToImportInToMachine: false }) }}
						getAll={() => this.handleSubmitSearch()}
						onSuccess={this.handleSubmitSearch}
					/>
				}
			</Card >
		)
	}
}
