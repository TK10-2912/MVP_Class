
import * as React from 'react';
import { DeleteOutlined, ExportOutlined, SearchOutlined } from '@ant-design/icons';
import { L, isGranted } from '@src/lib/abpUtility';
import { ExportRepositoryDto, MachineDto, MachineOutOfStockQueryDto, SearchDailyMonitoringInput } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Badge, Button, Card, Col, Modal, Row, Space } from 'antd';
import AppConsts, { EventTable, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import SelectedGroupMachine from '@src/components/Manager/SelectedGroupMachine';
import { SorterResult, TableRowSelection } from 'antd/lib/table/interface';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';
import SelectUserMultiple from '@src/components/Manager/SelectUserMultiple';
import MachineDetailReport from '@src/scenes/Monitor/MachineDetailReport';
import ExportRepositoryTable from './componentAdmin/ExportRepositoryTableAdmin';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import ModalExportRepository from './componentAdmin/ModalExportRepository';
import { eSort } from '@src/lib/enumconst';

export default class ExportRepository extends AppComponentBase {
	state = {
		isLoadDone: false,
		visibleModalStatusMachine: false,
		visibleExportMachine: false,
		visibleMachineDetail: false,
		skipCount: 0,
		maxResultCount: 10,
		pageSize: 10,
		currentPage: 1,
		clicked: false,
		select: false,
		ma_id_list: undefined,
		gr_ma_id: undefined,
		us_id_list: isGranted(AppConsts.Permission.Pages_Manager_General_Admin_ExportRepository) ? undefined : [stores.sessionStore.getUserLogin().id!],
		us_id: undefined,
		sort: undefined,
		visibleExportProductToImportInToMachine: false,
	}
	machineSelected: MachineOutOfStockQueryDto = new MachineOutOfStockQueryDto();
	machineDetailSelected: MachineDto = new MachineDto();
	listMachine: MachineOutOfStockQueryDto[] = [];
	listKey: string[] = [];
	searchDailyMonitoringInput: SearchDailyMonitoringInput = new SearchDailyMonitoringInput();
	searchDailyMonitoringAdminInput: any;
	selectedField: string;
	async componentDidMount() {
		await this.getAll();
	}

	// getAllAdmin = async () => {
	// 	this.setState({ isLoadDone: false });
	// 	await stores.dailyMonitorStore.machineOutOfStockQueryAdmin(this.state.us_id_list, this.state.gr_ma_id, this.state.ma_id_list,);
	// 	await stores.repositoryStore.getAllByAdmin(undefined, undefined, undefined, undefined, undefined);
	// 	await stores.machineStore.getAllByAdmin(undefined, undefined, undefined, undefined, undefined, undefined, undefined);
	// 	await stores.exportRepositoryStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined);
	// 	this.setState({ isLoadDone: true })
	// }
	changeColumnSort = async (sort: SorterResult<ExportRepositoryDto> | SorterResult<ExportRepositoryDto>[]) => {
		this.setState({ isLoadDone: false });
		this.selectedField = sort['columnKey'];
		await this.setState({ sort: sort['order'] === undefined ? undefined : (sort['order'] === "descend" ? eSort.DES.num : eSort.ASC.num) });
		await this.getAll();
		this.setState({ isLoadDone: true });

	}
	// async getAllUser() {
	// 	this.setState({ isLoadDone: false });
	// 	await stores.dailyMonitorStore.machineOutOfStockQuery(this.state.gr_ma_id, this.state.ma_id_list);
	// 	await stores.repositoryStore.getAll(undefined, undefined, undefined, undefined, undefined);
	// 	await stores.machineStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined);
	// 	this.setState({ isLoadDone: true })
	// }

	getAll = async () => {
		this.setState({ isLoadDone: false });
		await stores.exportRepositoryStore.getAll(this.state.gr_ma_id, this.state.ma_id_list, this.state.us_id_list, this.selectedField, this.state.sort, this.state.pageSize, undefined);
		this.setState({ isLoadDone: true });
	}

	onChangePage = async (page: number, pagesize?: number) => {
		if (pagesize !== undefined) {
			await this.setState({ pageSize: pagesize! });
		}
		await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page });
		this.getAll();
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
			us_id_list: isGranted(AppConsts.Permission.Pages_Manager_General_Admin_ExportRepository) ? undefined : [stores.sessionStore.getUserLogin().id!],
		})
		this.getAll();
	}

	render() {
		const { listMachineOutOfStockQueryDto } = stores.dailyMonitorStore
		const { exportRepositoryListResult, totalExportReponsitory } = stores.exportRepositoryStore;
		let self = this;
		return (
			<Card>
				{isGranted(AppConsts.Permission.Pages_Manager_General_Admin_ExportRepository) ?
					<Row align='bottom' gutter={[8, 8]} className='alighItemFlexEnd-col-1600px'>
						<Col {...cssColResponsiveSpan(24, 12, 12, 5, 5, 5)}>
							<strong>Nhóm máy</strong>
							<SelectedGroupMachine groupmachineId={this.state.gr_ma_id} onChangeGroupMachine={(value) => { this.setState({ gr_ma_id: value }); this.onChangePage(1, this.state.pageSize) }}></SelectedGroupMachine>
						</Col>
						<Col {...cssColResponsiveSpan(24, 12, 12, 5, 5, 5)}>
							<strong>Máy bán nước</strong>
							<SelectedMachineMultiple
								onChangeMachine={(value) => { this.setState({ ma_id_list: value }); this.onChangePage(1, this.state.pageSize) }} groupMachineId={this.state.gr_ma_id} listMachineId={this.state.ma_id_list}
							></SelectedMachineMultiple>
						</Col>
						<Col {...cssColResponsiveSpan(24, 12, 12, 4, 5, 5)}>
							<>
								<strong>Người vận hành</strong>
								<SelectUserMultiple us_id_list={this.state.us_id_list} onChangeUser={async (value) => { await this.setState({ us_id_list: value }); this.onChangePage(1, this.state.pageSize) }} ></SelectUserMultiple>
							</>
						</Col>
						<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 5)}>
							<Space>
								<Button placeholder='Tìm kiếm' type='primary' onClick={() => this.handleSubmitSearch()}><SearchOutlined />Tìm kiếm</Button>
								{(this.state.gr_ma_id !== undefined || this.state.ma_id_list !== undefined || !!this.state.us_id_list) &&
									<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >{(window.innerWidth >= 576 && window.innerWidth <= 1393) ? 'Xóa' : 'Xóa tìm kiếm'}</Button>
								}
							</Space>
						</Col>
						{isGranted(AppConsts.Permission.Pages_Manager_General_ExportRepository_Export) &&
							<Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 4)} style={{ display: "flex", justifyContent: "end" }}>
								<Space>
									{this.listKey.length < 1 ?
										<Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportMachine: true, select: false })}>{(window.innerWidth > 650) && 'Xuất dữ liệu'}</Button>
										:
										<>
											<Badge count={this.listKey.length}>
												<Button type='primary' icon={<ExportOutlined />} title={L("Xuất dữ liệu")}
													onClick={async () => { this.setState({ visibleExportMachine: true, select: true }) }}
												>{(window.innerWidth > 650) && 'Xuất dữ liệu'}</Button>
											</Badge>
										</>
									}
								</Space>
							</Col>
						}
					</Row> :
					<Row align='bottom' gutter={[8, 8]} className='alighItemFlexEnd-col-1600px'>
						<Col {...cssColResponsiveSpan(24, 12, 12, 5, 5, 5)}>
							<strong>Nhóm máy</strong>
							<SelectedGroupMachine groupmachineId={this.state.gr_ma_id} onChangeGroupMachine={async (value) => { await this.setState({ gr_ma_id: value }); this.onChangePage(1, this.state.pageSize) }}></SelectedGroupMachine>
						</Col>
						<Col {...cssColResponsiveSpan(24, 12, 12, 5, 5, 5)}>
							<strong>Máy bán nước</strong>
							<SelectedMachineMultiple
								onChangeMachine={(value) => { this.setState({ ma_id_list: value }); this.onChangePage(1, this.state.pageSize) }} groupMachineId={this.state.gr_ma_id} listMachineId={this.state.ma_id_list}
							></SelectedMachineMultiple>
						</Col>
						{/* {isGranted(AppConsts.Permission.Pages_Manager_General_Admin_ExportRepository) &&
							<Col {...cssColResponsiveSpan(24, 12, 12, 4, 5, 5)}>
								<>
									<strong>Người vận hành</strong>
									<SelectUserMultiple us_id_list={this.state.us_id_list} onChangeUser={async value => { await this.setState({ us_id_list: value }); this.getAll() }} ></SelectUserMultiple>
								</>
							</Col>
						} */}
						<Col {...cssColResponsiveSpan(24, 12, 12, 10, 10, 10)}>
							<Space>
								<Button placeholder='Tìm kiếm' type='primary' onClick={() => this.handleSubmitSearch()}><SearchOutlined />Tìm kiếm</Button>
								{(this.state.gr_ma_id !== undefined || this.state.ma_id_list !== undefined || isGranted(AppConsts.Permission.Pages_Manager_General_Admin_ExportRepository) ? this.state.us_id_list != undefined : "") &&
									<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >{(window.innerWidth >= 576 && window.innerWidth <= 1393) ? 'Xóa' : 'Xóa tìm kiếm'}</Button>
								}
							</Space>
						</Col>
						{isGranted(AppConsts.Permission.Pages_Manager_General_ExportRepository_Export) &&
							<Col {...cssColResponsiveSpan(24, 12, 12, 4, 4, 4)} style={{ display: "flex", justifyContent: "end" }}>
								<Space>
									{this.listKey.length < 1 ?
										<Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportMachine: true, select: false })}>{(window.innerWidth > 650) && 'Xuất dữ liệu'}</Button>
										:
										<>
											<Badge count={this.listKey.length}>
												<Button type='primary' icon={<ExportOutlined />} title={L("Xuất dữ liệu")}
													onClick={async () => { this.setState({ visibleExportMachine: true, select: true }) }}
												>{(window.innerWidth > 650) && 'Xuất dữ liệu'}</Button>
											</Badge>
										</>
									}
								</Space>
							</Col>
						}
					</Row>}

				<Row >
					<Col span={24} style={{ width: "100%" }}>
						<ExportRepositoryTable
							currentPage={this.state.currentPage}
							pageSize={this.state.pageSize}
							changeColumnSortExportRepository={this.changeColumnSort}
							repository={exportRepositoryListResult}
							pagination={{
								position: ['topRight'],
								pageSize: this.state.pageSize,
								total: totalExportReponsitory,
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
				</Row>
				{this.state.visibleExportMachine &&
					<ModalExportRepository
						currentPage={this.state.currentPage}
						pageSize={this.state.pageSize}
						repository={exportRepositoryListResult}
						onCancel={() => this.setState({ visibleExportMachine: false })}
						visible={this.state.visibleExportMachine} />
				}
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
			</Card >
		)
	}
}
