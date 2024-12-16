import { DeleteFilled, DeleteOutlined, ExportOutlined, ImportOutlined, PlusOutlined, SearchOutlined, WarningOutlined } from '@ant-design/icons';
import SelectEnum from '@src/components/Manager/SelectEnum';
import SelectedSupplier from '@src/components/Manager/SelectedSupplier';
import { L } from '@src/lib/abpUtility';
import { EventTable, cssCol, cssColResponsiveSpan } from '@src/lib/appconst';
import { eMoney, eSort } from '@src/lib/enumconst';
import { AuthorizationMachineDto, DrinkDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Badge, Button, Card, Col, Input, Modal, Popover, Row, message } from 'antd';
import * as React from 'react';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';
import AuthorizationMachineTable from './component/AuthorizationMachineTable';
import CreateOrUpdateAuthorizationMachine from './component/CreateOrUpdateAuthorizationMachine';
import ModalExportAuthorizationMachine from './component/ModalExportAuthorizationMachine';
import SelectUserMultiple from '@src/components/Manager/SelectUserMultiple';
const { confirm } = Modal;

export default class AuthorizationMachine extends React.Component {
	state = {
		isLoadDone: true,
		ma_id_list: undefined,
		us_id_list: undefined,
		visibleModalCreateUpdate: false,
		visibleExportExcelDrink: false,
		visibleModalImport: false,
		visibleInfoDrink: false,
		skipCount: 0,
		maxResultCount: 10,
		onChangePage: 1,
		pageSize: 10,
		currentPage: 1,
	}
	authorizationMachineSelected: AuthorizationMachineDto = new AuthorizationMachineDto();
	listItemDrink: AuthorizationMachineDto[] = [];
	async componentDidMount() {
		await this.getAll();
	}

	async getAll() {
		this.setState({ isLoadDone: false })
		await stores.authorizationMachineStore.getAll(this.state.ma_id_list, this.state.skipCount, this.state.maxResultCount);
		await stores.authorizationMachineStore.getAllByAdmin(this.state.us_id_list, this.state.ma_id_list, this.state.skipCount, this.state.maxResultCount);
		this.setState({ isLoadDone: true, });
	}

	handleSubmitSearch = async () => {
		this.onChangePage(1, this.state.pageSize);
	}
	handleVisibleChange = (visible) => {
		this.setState({ clicked: visible });
	}

	createOrUpdateModalOpen = async (input: AuthorizationMachineDto) => {
		this.setState({ isLoadDone: false })
		this.authorizationMachineSelected.init(input);
		await this.setState({ visibleModalCreateUpdate: true, isLoadDone: true });
	}

	actionTable = (authorizationMachine: AuthorizationMachineDto, event: EventTable) => {
		let self = this;
		if (authorizationMachine === undefined || authorizationMachine.au_ma_id === undefined) {
			message.error("Không tìm thấy !");
			return;
		}
		if (event === EventTable.Edit || event === EventTable.RowDoubleClick) {
			this.createOrUpdateModalOpen(authorizationMachine);
		}
		else if (event === EventTable.Delete) {
			confirm({
				title: 'Bạn có chắc muốn xóa uỷ quyền' + ": " + authorizationMachine.au_ma_id + "?",
				okText: "Xác nhận",
				cancelText: "Hủy",
				async onOk() {
					await stores.authorizationMachineStore.delete(authorizationMachine.au_ma_id);
					await self.getAll();
					message.success("Xóa thành công !")
					self.setState({ isLoadDone: true });
				},
				onCancel() {
				},
			});
		}
	}
	onChangePage = async (page: number, pagesize?: number) => {
		if (pagesize !== undefined) {
			await this.setState({ pageSize: pagesize! });
		}
		await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
			this.getAll();
		})
	}

	onCreateUpdateSuccess = () => {
		this.setState({ isLoadDone: false });
		this.getAll();
		this.setState({ isLoadDone: true, visibleModalCreateUpdate: false, })
	}

	clearSearch = async () => {
		await this.setState({
			ma_id_list: undefined,
			us_id_list: undefined,
		})
		this.getAll();
	}
	onRefreshData = () => {
		this.setState({ visibleModalImport: false });
		this.getAll();
	}
	shouldChangeText = () => {
		const isChangeText = window.innerWidth <= 768;
		return !isChangeText;
	}
	render() {
		let self = this;
		const { authorizationMachineListResult, totalCount } = stores.authorizationMachineStore;
		const left = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 12, 14, 14, 14) : cssCol(24);
		const right = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 12, 10, 10, 10) : cssCol(0);
		return (
			<Card>
				<Row gutter={[8, 8]}>
					<Col {...cssColResponsiveSpan(15, 12, 8, 8, 8, 8)}>
						<h2>Uỷ quyền</h2>
					</Col>
					<Col {...cssColResponsiveSpan(9, 12, 16, 16, 16, 16)} style={{ display: "flex", flexWrap: "wrap", justifyContent: "end", gap: 8 }}>
						<Button title='Thêm mới' type="primary" icon={<PlusOutlined />} onClick={() => this.createOrUpdateModalOpen(new AuthorizationMachineDto())}>{this.shouldChangeText() && 'Thêm mới'}</Button>
						<Button title='Xuất dữ liệu' type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcelDrink: true, select: false })}>{this.shouldChangeText() && 'Xuất dữ liệu'}</Button>
					</Col>
				</Row>
				<Row gutter={[8, 8]} align='bottom'>
					<Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 4)}>
						<strong>Người sở hữu</strong>
						<SelectUserMultiple
							us_id_list={this.state.us_id_list}
							onChangeUser={async (value) => { await this.setState({ us_id_list: value }); this.getAll() }}
						></SelectUserMultiple>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 4)}>
						<strong>Máy bán nước</strong>
						<SelectedMachineMultiple
							listMachineId={this.state.ma_id_list}
							onChangeMachine={async (value) => { await this.setState({ ma_id_list: value }); this.getAll() }}
						></SelectedMachineMultiple>
					</Col>
					<Col {...cssColResponsiveSpan(24, 24, 16, 8, 8, 8)} style={{ display: "flex", flexWrap: "wrap", gap: 8 }} >
						<Button type="primary" icon={<SearchOutlined />} title="Tìm kiếm" onClick={() => this.handleSubmitSearch()} >Tìm kiếm</Button>
						{(!!this.state.ma_id_list || !!this.state.us_id_list) &&
							<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >Xóa tìm kiếm</Button>
						}
					</Col>
				</Row>
				<Row>
					<Col {...left} >
						<AuthorizationMachineTable
							actionTable={this.actionTable}
							hasAction={true}
							authorizationMachineListResult={authorizationMachineListResult}
							isLoadDone={this.state.isLoadDone}
							pagination={{
								pageSize: this.state.pageSize,
								total: totalCount,
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
					<Col  {...right}>
						{this.state.visibleModalCreateUpdate &&
							<CreateOrUpdateAuthorizationMachine
								authorizationMachineSelected={this.authorizationMachineSelected}
								onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
								onCreateUpdateSuccess={this.onCreateUpdateSuccess}
							/>
						}
					</Col>
				</Row>
				<ModalExportAuthorizationMachine
					authorizationMachineListResult={authorizationMachineListResult}
					visible={this.state.visibleExportExcelDrink}
					onCancel={() => this.setState({ visibleExportExcelDrink: false })}
				/>
			</Card>
		)
	}
}
