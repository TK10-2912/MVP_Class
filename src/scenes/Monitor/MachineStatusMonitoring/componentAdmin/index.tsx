import * as React from 'react';
import { DeleteOutlined, ExportOutlined, SearchOutlined } from '@ant-design/icons';
import { MachineDto, MachineDtoListResultDto, SearchStatusMonitorAdminInput } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Badge, Button, Card, Col, Row } from 'antd';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan } from '@src/lib/appconst';
import SelectedGroupMachine from '@src/components/Manager/SelectedGroupMachine';
import { TableRowSelection } from 'antd/lib/table/interface';
import TableMainMachineAdmin from './TableMainMachineAdmin';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';
import ModalExportMachineStatusMonitoring from './ModalExportMachineStatusMonitoringAdmin';
import ModalViewStatusMachine from './ModalViewStatusMachineAdmin';
import SelectEnum from '@src/components/Manager/SelectEnum';
import { eMachineNetworkStatus } from '@src/lib/enumconst';
import SelectUserMultiple from '@src/components/Manager/SelectUserMultiple';
import { isGranted } from '@src/lib/abpUtility';

export default class MachineStatusMonitoringAdmin extends React.Component {
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
		ma_networkStatus: undefined,
		us_id_list: undefined,
	}
	machineSelected: MachineDto = new MachineDto();
	listMachine: MachineDto[] = [];
	listNumber: number[] = [];
	machineDtoListResult: MachineDtoListResultDto = new MachineDtoListResultDto();
	searchStatusMonitorInput: SearchStatusMonitorAdminInput = new SearchStatusMonitorAdminInput();
	async componentDidMount() {
		const urlParams = new URLSearchParams(window.location.search);
		const ma_networkStatus = urlParams.get('ma_networkStatus');
		await this.setState({ ma_networkStatus: Number(ma_networkStatus) == 0 ? undefined : Number(ma_networkStatus) });
		await this.getAll();
	}
	async getAll() {
		this.setState({ isLoadDone: false });
		this.searchStatusMonitorInput.gr_ma_id = this.state.gr_ma_id;
		this.searchStatusMonitorInput.ma_id_list = this.state.ma_id_list;
		this.searchStatusMonitorInput.us_id = this.state.us_id_list;
		this.searchStatusMonitorInput.ma_networkStatus = this.state.ma_networkStatus!;
		this.machineDtoListResult = await stores.dailyMonitorStore.statusMonitoringAdmin(this.searchStatusMonitorInput);
		this.setState({ isLoadDone: true })
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
			this.setState({ isLoadDone: true });
		}
	}

	clearSearch = async () => {
		await this.setState({
			gr_ma_id: undefined,
			ma_id_list: undefined,
			ma_networkStatus: undefined,
			us_id_list: undefined,
		})
		this.getAll();
	}
	render() {
		let self = this;
		const left = this.state.visibleModalCreateUpdate ? cssCol(0) : cssCol(24);
		const right = this.state.visibleModalCreateUpdate ? cssCol(24) : cssCol(0);

		return (
			<Card>
				{this.state.visibleModalCreateUpdate == false &&
					<Row align='middle' gutter={[8, 8]} className='alighItemFlexEnd-col-1600px'>
						<Col {...cssColResponsiveSpan(18, 17, 12, 12, 12, 12)} ><h2>Giám sát trạng thái máy</h2></Col>
						{isGranted(AppConsts.Permission.Pages_DailyMonitoring_MachineMonitor_Export) &&
							<Col {...cssColResponsiveSpan(6, 7, 12, 12, 12, 12)} style={{ textAlign: "right" }}>
								{this.listNumber.length < 1 ?
									<Button title='Xuất dữ liệu' type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportMachine: true, select: false })}>{(window.innerWidth > 650) && 'Xuất dữ liệu'}</Button>
									:
									<Badge count={this.listNumber.length}>
										<Button title='Xuất dữ liệu' type='primary' icon={<ExportOutlined />} onClick={async () => { this.setState({ visibleExportMachine: true, select: true }) }}
										>{(window.innerWidth > 650) && 'Xuất dữ liệu'}</Button>
									</Badge>
								}
							</Col>
						}
					</Row>}
				<Row gutter={[8, 8]} align='bottom'>
					<Col {...cssColResponsiveSpan(24, 12, 12, 8, 4, 4)}>
						<strong>Nhóm máy</strong>
						<SelectedGroupMachine groupmachineId={this.state.gr_ma_id} onChangeGroupMachine={(value) => { this.setState({ gr_ma_id: value }); this.getAll() }}></SelectedGroupMachine>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 12, 8, 4, 4)}>
						<strong>Máy bán nước</strong>
						<SelectedMachineMultiple
							onChangeMachine={(value) => { this.setState({ ma_id_list: value }); this.getAll() }} groupMachineId={this.state.gr_ma_id} listMachineId={this.state.ma_id_list} onClear={() => this.clearSearch()}
						></SelectedMachineMultiple>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 12, 8, 4, 4)}>
						<strong>Tình trạng máy</strong>
						<SelectEnum
							placeholder='Trạng thái'
							eNum={eMachineNetworkStatus}
							onChangeEnum={async (e) => { this.setState({ ma_networkStatus: e }); await this.handleSubmitSearch() }}
							enum_value={this.state.ma_networkStatus}
						></SelectEnum>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 12, 8, 4, 4)}>
						<strong>Người sở hữu</strong>
						<SelectUserMultiple us_id_list={this.state.us_id_list} onChangeUser={async (value) => { await this.setState({ us_id_list: value }); this.getAll() }} ></SelectUserMultiple>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 7)} style={{ display: "flex", gap: 8 }}>
						<Button placeholder='Tìm kiếm' type='primary' onClick={() => this.handleSubmitSearch()}><SearchOutlined />Tìm kiếm</Button>
						{(this.state.gr_ma_id != undefined || this.state.ma_id_list != undefined || this.state.ma_networkStatus != undefined || this.state.us_id_list != undefined) &&
							<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >{(window.innerWidth >= 576 && window.innerWidth <= 1381) ? 'Xóa' : 'Xóa tìm kiếm'}</Button>
						}
					</Col>
				</Row>
				<Row style={{ marginTop: 10 }}>
					<Col {...left}>
						<TableMainMachineAdmin
							machineListResult={this.machineDtoListResult.items}
							hasAction={this.listNumber.length > 0 ? false : true}
							rowSelection={this.rowSelection}
							actionTable={this.actionTable}
							pagination={{
								pageSize: this.state.pageSize,
								total: !!this.machineDtoListResult.items ? this.machineDtoListResult.items.length : 0,
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

					{this.state.visibleModalStatusMachine &&
						<ModalViewStatusMachine machineSelected={this.machineSelected} visible={this.state.visibleModalStatusMachine} onCancel={() => this.setState({ visibleModalStatusMachine: false })}></ModalViewStatusMachine>
					}

					{this.state.visibleExportMachine &&
						<ModalExportMachineStatusMonitoring machineListResult={this.state.select ? this.listMachine : this.machineDtoListResult.items!} onCancel={() => this.setState({ visibleExportMachine: false })} visible={this.state.visibleExportMachine} />
					}
				</Row>
			</Card >
		)
	}
}
