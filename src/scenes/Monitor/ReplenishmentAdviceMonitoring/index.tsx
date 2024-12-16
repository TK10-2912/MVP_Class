
import { DeleteFilled, DeleteOutlined, ExportOutlined, PlusCircleOutlined, SearchOutlined, WarningOutlined } from '@ant-design/icons';
import { L, isGranted } from '@src/lib/abpUtility';
import { MachineDto, MachineDtoListResultDto, SearchDailyMonitoringInput, SearchStatusMonitorInput } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Badge, Button, Card, Col, Input, Modal, Popover, Row, message } from 'antd';
import confirm from 'antd/lib/modal/confirm';
import * as React from 'react';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan } from '@src/lib/appconst';
import SelectedGroupMachine from '@src/components/Manager/SelectedGroupMachine';
import { TableRowSelection } from 'antd/lib/table/interface';
import TableMainMachineAdmin from './component/TableMainMachineAdmin';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';
import ViewStatusMachine from './component/ViewStatusMachine';
import ModalExportMachineStatusMonitoring from './component/ModalExportMachineStatusMonitoring';
import { eMachineNetworkStatus } from '@src/lib/enumconst';
import SelectEnum from '@src/components/Manager/SelectEnum';

export default class MachineStatusMonitoring extends React.Component {
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
	}
	machineSelected: MachineDto = new MachineDto();
	listMachine: MachineDto[] = [];
	listNumber: number[] = [];
	machineDtoListResult: MachineDtoListResultDto = new MachineDtoListResultDto();
	searchStatusMonitorInput: SearchStatusMonitorInput = new SearchStatusMonitorInput();
	async componentDidMount() {
		await this.getAll();
	}

	async getAll() {
		this.setState({ isLoadDone: false });
		this.searchStatusMonitorInput.gr_ma_id = this.state.gr_ma_id;
		this.searchStatusMonitorInput.ma_id_list = this.state.ma_id_list;
		this.searchStatusMonitorInput.ma_networkStatus = this.state.ma_networkStatus!;
		// await stores.machineStore.getAllByAdmin(undefined, undefined, undefined, undefined, undefined);
		this.machineDtoListResult = await stores.dailyMonitorStore.statusMonitoring(this.searchStatusMonitorInput);
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
	deleteMachine = (machine: MachineDto) => {
		let self = this;
		confirm({
			title: "Bạn có muốn xóa máy bán nước " + machine.ma_display_name + "?",
			okText: L('Xác nhận'),
			cancelText: L('Hủy'),
			async onOk() {
				self.setState({ isLoadDone: false });
				await stores.machineStore.delete(machine);
				message.success("Xóa thành công !")
				await self.getAll();
				self.setState({ isLoadDone: true });
			},
		});
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
					<Row align='bottom' gutter={[8, 8]}>
						<Col {...cssColResponsiveSpan(24, 24, 24, 6, 7, 5)}><h2>Giám sát trạng thái bán nước</h2></Col>
						<Col {...cssColResponsiveSpan(24, 24, 12, 4, 4, 4)}>
							<strong>Nhóm máy</strong>
							<SelectedGroupMachine groupmachineId={this.state.gr_ma_id} onChangeGroupMachine={(value) => { this.setState({ gr_ma_id: value }); this.getAll() }}></SelectedGroupMachine>
						</Col>
						<Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 4)}>
							<strong>Máy bán nước:</strong><br />
							<SelectedMachineMultiple
								onChangeMachine={(value) => this.setState({ ma_id_list: value })} listMachineId={this.state.ma_id_list}
							></SelectedMachineMultiple>
						</Col>
						<Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 4)}>
							<strong>Trạng thái:</strong><br />
							<SelectEnum
								placeholder='Trạng thái'
								eNum={eMachineNetworkStatus}
								onChangeEnum={(e) => this.setState({ ma_networkStatus: e })}
								enum_value={this.state.ma_networkStatus}
							></SelectEnum>
						</Col>
						<Col {...cssColResponsiveSpan(24, 24, 12, 8, 8, 4)} style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "start" }}>
							<Button placeholder='Tìm kiếm' type='primary' onClick={() => this.handleSubmitSearch()}><SearchOutlined />Tìm kiếm</Button>
							{(this.state.gr_ma_id != undefined || this.state.ma_id_list != undefined) &&
								<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >Xóa tìm kiếm</Button>
							}
						</Col>
						{this.state.visibleModalCreateUpdate == false &&
							<Col {...cssColResponsiveSpan(24, 12, 12, 12, 12, 12)} >
								<Badge count={this.listNumber.length}>
									<Popover style={{ width: "200px" }} visible={this.state.clicked} onVisibleChange={(e) => this.handleVisibleChange(e)} placement="right" content={
										<>
											<Row style={{ alignItems: "center", marginTop: "10px" }}>
												<Button
													type='primary'
													icon={<ExportOutlined />} title={"Xuất dữ liệu"}
													style={{ marginLeft: '10px' }}
													size='small'
													onClick={async () => {
														if (this.listNumber.length < 1) {
															await message.warning(L("Hãy chọn một hàng muốn xuất dữ liệu"));
														}
														else {
															this.setState({ visibleExportMachine: true, select: true })
														}
													}}
												></Button>
												<a style={{ paddingLeft: "10px" }} onClick={async () => {
													if (this.listNumber.length < 1) {
														await message.warning(L("Hãy chọn một hàng muốn xuất dữ liệu"));
													}
													else {
														this.setState({ visibleExportMachine: true, select: true })
													};
												}}>{"Xuất dữ liệu"}</a>
											</Row>
										</>
									} trigger={['hover']} >
										<Button type='primary'>{L("Thao tác hàng loạt")}</Button>
									</Popover >
								</Badge>
							</Col>
						}
						<Col className='textAlign-col-576' {...cssColResponsiveSpan(24, 12, 12, 12, 12, 12)}>
							<Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportMachine: true, select: false })}>Xuất dữ liệu</Button>
						</Col>
					</Row>}
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

					<Modal
						visible={this.state.visibleModalStatusMachine}
						onCancel={() => this.setState({ visibleModalStatusMachine: false })}
						closable={true}
						maskClosable={false}
						footer={false}
						width={!!this.machineSelected ? "80vw" : "40vw"}
					>
						<ViewStatusMachine machineSelected={this.machineSelected}></ViewStatusMachine>
					</Modal>
					{this.state.visibleExportMachine &&
						<ModalExportMachineStatusMonitoring machineListResult={this.state.select ? this.listMachine : this.machineDtoListResult.items!} onCancel={() => this.setState({ visibleExportMachine: false })} visible={this.state.visibleExportMachine} />
					}
				</Row>
			</Card >
		)
	}
}
