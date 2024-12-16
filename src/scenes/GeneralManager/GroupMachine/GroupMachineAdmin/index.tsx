
import { ExportOutlined, PlusCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { isGranted, L } from '@src/lib/abpUtility';
import { GroupMachineDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Input, Modal, Row, message } from 'antd';
import confirm from 'antd/lib/modal/confirm';
import * as React from 'react';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan } from '@src/lib/appconst';
import TableGroupMachineAdmin from './components/TableGroupMachine';
import CreateOrUpdateGroupMachineAdmin from './components/CreateOrUpdateGroupMachineAdmin';
import ModalExportGroupMahineAdmin from './components/ModalExportGroupMachine';
import Machine from '../../Machine';


export default class GroupMachineAdmin extends React.Component<any> {
	state = {
		isLoadDone: false,
		visibleModalCreateUpdate: false,
		visibleModalViewMachine: false,
		visibleModalExcel: false,
		ma_search: undefined,
		skipCount: 0,
		maxResultCount: 10,
		pageSize: 10,
		currentPage: 1,
	}
	groupMachineSelected: GroupMachineDto = new GroupMachineDto();
	async componentDidMount() {
		await this.getAll();
	}

	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.groupMachineStore.getAllByAdmin(this.state.ma_search, undefined, this.state.skipCount, this.state.pageSize);
		this.setState({ isLoadDone: true });
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
	createOrUpdateModalOpen = async (input: GroupMachineDto) => {
		if (input !== undefined && input !== null) {
			this.groupMachineSelected.init(input);
			await this.setState({ visibleModalCreateUpdate: true });
		}
		this.setState({ visibleModalCreateUpdate: true })
	}
	actionTable = (item: GroupMachineDto, event: EventTable) => {
		let self = this;
		if (event === EventTable.Edit || event === EventTable.RowDoubleClick) {
			this.createOrUpdateModalOpen(item);
		}
		if (event === EventTable.View) {
			const machineListResult = stores.sessionStore.getAllMachines();
			if (machineListResult.some(item => item.gr_ma_id === item.gr_ma_id)) {
				this.groupMachineSelected = item;
				this.setState({ visibleModalViewMachine: true })
			}
		}
		if (event === EventTable.Delete) {
			confirm({
				title: "Bạn có muốn xóa vùng  " + item.gr_ma_area + "?",
				okText: L('Xác nhận'),
				cancelText: L('Hủy'),
				async onOk() {
					self.setState({ isLoadDone: false });
					await stores.groupMachineStore.delete(item);
					message.success("Xóa thành công !")
					await self.getAll();
					stores.sessionStore.getCurrentLoginInformations();
					self.setState({ isLoadDone: true });
				},
			});
		}
	}

	createSuccess = () => {
		this.setState({ isLoadDone: false });
		this.getAll();
		this.setState({ isLoadDone: true, visibleModalCreateUpdate: false });
	}
	render() {
		let self = this;
		const left = this.state.visibleModalCreateUpdate ? cssCol(12) : cssCol(24);
		const right = this.state.visibleModalCreateUpdate ? cssCol(12) : cssCol(0);
		const { groupMachineListResult, totalMachine } = stores.groupMachineStore;

		return (
			<Card>
				<Row gutter={[8, 8]}>
					<Col {...cssColResponsiveSpan(24, 24, 12, 16, 16, 16)} style={{ display: 'flex' }}>
						<Input style={{ width: '90%', height: "32px" }} placeholder={"Nhập tìm kiếm nhóm máy..."} allowClear onChange={(e) => this.setState({ ma_search: e.target.value })}></Input> &nbsp;
						<Button type='primary' onClick={() => this.handleSubmitSearch()}><SearchOutlined />Tìm kiếm</Button>
					</Col>
					<Col {...cssColResponsiveSpan(24, 24, 12, 8, 8, 8)} style={{ textAlign: 'right', gap: 8 }}>
						{isGranted(AppConsts.Permission.Pages_Manager_General_GroupMachine_Create) &&
							<Button type='primary' icon={<PlusCircleOutlined />} onClick={() => this.createOrUpdateModalOpen(new GroupMachineDto())}> Thêm mới</Button>
						}
						{isGranted(AppConsts.Permission.Pages_Manager_General_GroupMachine_Export) &&
							<Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleModalExcel: true })}>Xuất dữ liệu</Button>
						}
					</Col>

				</Row>
				<Row>
					<Col {...left}>
						<TableGroupMachineAdmin
							groupMachineListResult={groupMachineListResult}
							hasAction={true}
							actionTable={this.actionTable}
							pagination={{
								pageSize: this.state.pageSize,
								total: totalMachine,
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
					{
						this.state.visibleModalCreateUpdate &&
						<Col {...right}>
							<CreateOrUpdateGroupMachineAdmin groupMachineSelected={this.groupMachineSelected} onCancel={() => this.setState({ visibleModalCreateUpdate: false })} createSuccess={this.createSuccess} />
						</Col>
					}
				</Row>
				{
					this.state.visibleModalExcel &&
					<ModalExportGroupMahineAdmin groupMachineList={groupMachineListResult} onCancel={() => this.setState({ visibleModalExcel: false })} visible={this.state.visibleModalExcel} />
				}

				{
					this.state.visibleModalViewMachine &&
					<Modal visible={this.state.visibleModalViewMachine} onCancel={() => this.setState({ visibleModalViewMachine: false })}
						footer={false}
						title={"Danh sách máy của nhóm máy " + this.groupMachineSelected.gr_ma_area}
						width={"80%"}>
						<Machine gr_ma_id={this.groupMachineSelected.gr_ma_id}></Machine>
					</Modal>
				}

			</Card >
		)
	}
}
