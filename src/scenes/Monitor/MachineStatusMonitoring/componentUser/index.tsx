
import { DeleteOutlined, ExportOutlined, SearchOutlined } from '@ant-design/icons';
import SelectEnum from '@src/components/Manager/SelectEnum';
import SelectedGroupMachine from '@src/components/Manager/SelectedGroupMachine';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import { eMachineNetworkStatus, eMachineStatusMonitor, eSort } from '@src/lib/enumconst';
import { MachineDto, MachineDtoListResultDto, } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Badge, Button, Card, Col, Modal, Row } from 'antd';
import { SorterResult, TableRowSelection } from 'antd/lib/table/interface';
import * as React from 'react';
import ModalExportMachineStatusMonitoringUser from './ModalExportMachineStatusMonitoringUser';
import ModalViewStatusMachineUser from './ModalViewStatusMachineUser';
import TableMainMachineUser from './TableMainMachineUser';
import { isGranted } from '@src/lib/abpUtility';
import MachineDetailReport from '../../MachineDetailReport';

export default class MachineStatusMonitoringUser extends React.Component {
	state = {
		isLoadDone: false,
		visibleModalCreateUpdate: false,
		visibleModalStatusMachine: false,
		visibleExportMachine: false,
		skipCount: 0,
		pageSize: AppConsts.PAGESIZE,
		currentPage: 1,
		clicked: false,
		select: false,
		ma_id_list: undefined,
		gr_ma_id: undefined,
		ma_networkStatus: undefined,
		us_id_list: undefined,
		us_id: undefined,
		fieldSort: undefined,
		sort: undefined,
		visibleMachineDetail: false,
		numberSelected: 0,
		ma_status: undefined,
	}
	machineSelected: MachineDto = new MachineDto();
	listMachine: MachineDto[] = [];
	listNumber: number[] = [];
	machineDtoListResult: MachineDtoListResultDto = new MachineDtoListResultDto();
	// searchStatusMonitorInput: any
	// SearchStatusMonitorInput = new SearchStatusMonitorInput();
	async componentDidMount() {
		const urlParams = new URLSearchParams(window.location.search);
		const ma_networkStatus = urlParams.get('ma_networkStatus');
		await this.setState({ ma_networkStatus: Number(ma_networkStatus) == 0 ? undefined : Number(ma_networkStatus) });
		await this.getAll();
	}
	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.machineStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined, undefined);
		this.machineDtoListResult = await stores.dailyMonitorStore.statusMonitoring(this.state.ma_networkStatus, this.state.ma_status, this.state.fieldSort, this.state.sort, this.state.gr_ma_id, this.state.ma_id_list, this.state.skipCount, this.state.pageSize);
		this.setState({ isLoadDone: true })
	}


	onChangePage = async (page: number, pagesize?: number) => {
		if (pagesize !== undefined) {
			await this.setState({ pageSize: pagesize! });
		}
		this.setState({ skipCount: page, currentPage: page })
	}
	changeColumnSort = async (sort: SorterResult<MachineDto> | SorterResult<MachineDto>[]) => {
		this.setState({ isLoadDone: false });
		await this.setState({ fieldSort: sort["field"], sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
		await this.getAll();
		this.setState({ isLoadDone: true });
	}
	handleSubmitSearch = async () => {
		this.onChangePage(1, this.state.pageSize);
	}
	createOrUpdateModalOpen = async (input: MachineDto) => {
		if (input !== undefined && input !== null) {
			this.machineSelected.init(input);
			await this.setState({ visibleModalCreateUpdate: true });
		}
	}

	actionTable = (machine: MachineDto, event: EventTable) => {
		if (event == EventTable.View) {
			this.machineSelected.init(machine);
			this.setState({ visibleModalStatusMachine: true });
		}
		if (event == EventTable.ViewDetail) {
			this.machineSelected.init(machine);
			this.setState({ visibleMachineDetail: true });
		}
	}

	onCancel = () => {
		this.setState({ visibleModalCreateUpdate: false });
	}
	handleVisibleChange = (visible) => {
		this.setState({ clicked: visible });
	}
	hide = () => {
		this.setState({ clicked: false });
	}
	rowSelection: TableRowSelection<MachineDto> = {

		onChange: (listIdMember: React.Key[], listItem: MachineDto[]) => {
			this.setState({ isLoadDone: false });
			this.listMachine = listItem;
			this.listNumber = this.listMachine.map(item => item.ma_id);
			this.setState({ isLoadDone: true, select: true, numberSelected: this.listNumber.length });
		}
	}

	clearSearch = async () => {
		await this.setState({
			gr_ma_id: undefined,
			ma_id_list: undefined,
			ma_networkStatus: undefined,
			ma_status: undefined,
		})
		this.getAll();
	}
	render() {
		let self = this;
		const left = this.state.visibleModalCreateUpdate ? cssCol(0) : cssCol(24);
		const right = this.state.visibleModalCreateUpdate ? cssCol(24) : cssCol(0);
		const { total} = stores.dailyMonitorStore;
			return(
				<Card>
					{this.state.visibleModalCreateUpdate == false &&
						<Row align='middle' gutter={[8, 8]} className='alighItemFlexEnd-col-1600px'>
							<Col {...cssColResponsiveSpan(18, 17, 12, 12, 12, 5)} xxl={{ order: 1, span: 5 }}><h2 style={{margin:0}}>Trạng thái máy hôm nay ({new Date().toLocaleDateString('vi-VN')})</h2></Col>
							{isGranted(AppConsts.Permission.Pages_DailyMonitoring_MachineMonitor_Export) &&
								<Col {...cssColResponsiveSpan(6, 7, 12, 12, 12, 3)} xxl={{ order: 3, span: 3 }} style={{ textAlign: "right" }}>
									{this.listNumber.length < 1 ?
										<Button title='Xuất dữ liệu' type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportMachine: true, select: false })}>{(window.innerWidth > 650) && 'Xuất dữ liệu'}</Button>
										:
										<Badge count={this.state.numberSelected}>
											<Button title='Xuất dữ liệu' type='primary' icon={<ExportOutlined />} onClick={async () => { this.setState({ visibleExportMachine: true, select: true }) }}
											>{(window.innerWidth > 650) && 'Xuất dữ liệu'}</Button>
										</Badge>
									}
								</Col>
							}
							<Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 16)} style={{ display: "flex", flexWrap: "wrap", padding: 0 }} xxl={{ order: 2, span: 16 }}>
								<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 4)}>
									<strong>Nhóm máy</strong>
									<SelectedGroupMachine groupmachineId={this.state.gr_ma_id} onChangeGroupMachine={async (value) => { await this.setState({ gr_ma_id: value }); this.onChangePage(1, this.state.pageSize) }}></SelectedGroupMachine>
								</Col>
								<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 5)}>
									<strong>Máy bán nước</strong>
									<SelectedMachineMultiple
										onChangeMachine={async (value) => { await this.setState({ ma_id_list: value }); this.onChangePage(1, this.state.pageSize) }} groupMachineId={this.state.gr_ma_id} listMachineId={this.state.ma_id_list} onClear={() => this.clearSearch()}
									></SelectedMachineMultiple>
								</Col>
								<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 4)}>
									<strong>Tình trạng máy</strong>
									<SelectEnum
										placeholder='Tình trạng'
										eNum={eMachineNetworkStatus}
										onChangeEnum={async (e) => { await this.setState({ ma_networkStatus: e }); this.handleSubmitSearch() }}
										enum_value={this.state.ma_networkStatus}
									></SelectEnum>
								</Col>
								<Col {...cssColResponsiveSpan(24, 12, 12, 6, 4, 4)}>
								<strong>Trạng thái máy</strong>
								<SelectEnum
									placeholder='Trạng thái'
									eNum={eMachineStatusMonitor}
									onChangeEnum={async (e) => { await this.setState({ ma_status: e }); this.handleSubmitSearch() }}
									enum_value={this.state.ma_status}
								></SelectEnum>
							</Col>
								<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 7)} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }}>
									<Button placeholder='Tìm kiếm' type='primary' onClick={() => this.handleSubmitSearch()}><SearchOutlined />Tìm kiếm</Button>
									{(this.state.gr_ma_id != undefined || this.state.ma_id_list != undefined || this.state.ma_networkStatus != undefined || this.state.ma_status != undefined) &&
										<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >{(window.innerWidth >= 576 && window.innerWidth <= 1381) ? 'Xóa' : 'Xóa tìm kiếm'}</Button>
									}
								</Col>
							</Col>
						</Row>}
					<Row style={{ marginTop: 10 }}>
						<Col {...left}>
							<TableMainMachineUser
								machineListResult={this.machineDtoListResult.items}
								hasAction={this.listNumber.length > 0 ? false : true}
								rowSelection={this.rowSelection}
								changeColumnSort={this.changeColumnSort}
								actionTable={this.actionTable}
								is_printed={false}
								pagination={{
									position: ['topRight'],
									pageSize: this.state.pageSize,
									total:total ,
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

						{this.state.visibleModalStatusMachine &&
							<ModalViewStatusMachineUser machineSelected={this.machineSelected} visible={this.state.visibleModalStatusMachine} onCancel={() => this.setState({ visibleModalStatusMachine: false })}></ModalViewStatusMachineUser>
						}

						{this.state.visibleExportMachine &&
							<ModalExportMachineStatusMonitoringUser pageSize={this.state.pageSize} skipCount={this.state.skipCount} machineListResult={this.state.select ? this.listMachine : this.machineDtoListResult.items!} onCancel={() => this.setState({ visibleExportMachine: false })} visible={this.state.visibleExportMachine} />
						}
						<Modal
							className='centerModal'
							centered
							visible={this.state.visibleMachineDetail}
							cancelButtonProps={{ style: { display: "none" } }}
							onCancel={() => { this.setState({ visibleMachineDetail: false }) }}
							footer={null}
							width={"80%"}
							maskClosable={true}
							title={
								<Row gutter={8} align='bottom'>
									<Col span={24} style={{ display: "flex", justifyContent: "center" }}>
										<h2>{"Xem chi tiết bố cục máy "}<strong style={{ color: '#237804' }}>{this.machineSelected.ma_display_name}</strong>{" của người vận hành "}{stores.sessionStore.getUserNameById(this.machineSelected.us_id_operator)}</h2>
									</Col>
								</Row>
							}

						>
							{
								this.state.visibleMachineDetail &&
								<MachineDetailReport machineSelected={this.machineSelected}
									onCancel={() => this.setState({ visibleMachineDetail: false })}
								/>
							}
						</Modal>
						
					</Row>
				</Card >
			)
	}
}
