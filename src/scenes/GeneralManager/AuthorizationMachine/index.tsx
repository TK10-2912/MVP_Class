import { DeleteFilled, DeleteOutlined, ExportOutlined, ImportOutlined, PlusOutlined, SearchOutlined, WarningOutlined } from '@ant-design/icons';
import SelectEnum from '@src/components/Manager/SelectEnum';
import SelectedSupplier from '@src/components/Manager/SelectedSupplier';
import { L } from '@src/lib/abpUtility';
import { EventTable, cssCol, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import { eMoney, eSort } from '@src/lib/enumconst';
import { AuthorizationMachineDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Badge, Button, Card, Col, Input, Modal, Popover, Row, Space, message } from 'antd';
import { SorterResult, TableRowSelection } from 'antd/lib/table/interface';
import * as React from 'react';
import CreateOrUpdateDrink from './component/CreateOrUpdateAuthorizationMachine';
import DrinkTable from './component/AuthorizationMachineTable';
import ImportSampleExcelDataDrink from './component/ImportSampleExcelDataDrink';
import ModalExportDrink from './component/ModalExportAuthorizationMachine';
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
		skipCount: 0,
		maxResultCount: 10,
		onChangePage: 1,
		pageSize: 10,
		currentPage: 1,
		sort: undefined,
		clicked: false,
		numberSelected: 0,
		select: false,
	}
	authorizationMachineSelected: AuthorizationMachineDto = new AuthorizationMachineDto();
	listItemDrink: AuthorizationMachineDto[] = [];
	selectedField: string;
	keySelected: number[] = [];
	listItemSelected: AuthorizationMachineDto[] = [];
	async componentDidMount() {
		await this.getAll();
	}

	async getAll() {
		await stores.authorizationMachineStore.getAll(this.state.ma_id_list, this.state.us_id_list, this.selectedField, this.state.sort, this.state.skipCount, this.state.pageSize);
		this.setState({ isLoadDone: !this.state.isLoadDone });
	}

	handleSubmitSearch = async () => {
		this.onChangePage(1, this.state.pageSize);
	}
	handleVisibleChange = (visible) => {
		this.setState({ clicked: visible });
	}

	createOrUpdateModalOpen = async (input: AuthorizationMachineDto) => {
		this.authorizationMachineSelected.init(input);
		await this.setState({ visibleModalCreateUpdate: true, isLoadDone: !this.state.isLoadDone });
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
				title:
					(<>Bạn có chắc muốn xóa uỷ quyền: <b>{stores.sessionStore.getCodeMachines(authorizationMachine.ma_id)}</b> -  <b>{stores.sessionStore.getNameMachines(authorizationMachine.ma_id)}?</b> </>),
				okText: "Xác nhận",
				cancelText: "Hủy",
				async onOk() {
					await stores.authorizationMachineStore.delete(authorizationMachine.au_ma_id);
					await self.getAll();
					message.success("Xóa thành công !");
					stores.sessionStore.getCurrentLoginInformations();
					self.setState({ isLoadDone: true });
				},
				onCancel() {
				},
			});
		}
	}
	onChangePage = async (page: number, pagesize?: number) => {
		const { authorizationMachineListResult, totalCount } = stores.authorizationMachineStore;
		if (pagesize === undefined || isNaN(pagesize)) {
			pagesize = authorizationMachineListResult.length;
			page = 1;
		}
		await this.setState({ pageSize: pagesize! });
		await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
			this.getAll();
		});
	}

	onCreateUpdateSuccess = () => {
		this.getAll();
		this.setState({ isLoadDone: !this.state.isLoadDone, visibleModalCreateUpdate: false });
	}

	clearSearch = async () => {
		await this.setState({
			ma_id_list: undefined,
			us_id_list: undefined,
		})
		this.onChangePage(1, this.state.pageSize);
	}
	onRefreshData = () => {
		this.getAll();
		this.setState({ isLoadDone: !this.state.isLoadDone, visibleModalImport: false });
	}
	shouldChangeText = () => {
		const isChangeText = window.innerWidth <= 768;
		return !isChangeText;
	}
	changeColumnSort = async (sort: SorterResult<AuthorizationMachineDto> | SorterResult<AuthorizationMachineDto>[]) => {
		this.setState({ isLoadDone: false });
		this.selectedField = sort['field'];
		await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
		await this.getAll();
		this.setState({ isLoadDone: true });
	}
	rowSelection: TableRowSelection<AuthorizationMachineDto> = {
		onChange: (listKeyDictionaryType: React.Key[], listItem: AuthorizationMachineDto[]) => {
			this.setState({ isLoadDone: false });
			this.listItemSelected = listItem;
			this.keySelected = listItem.map(item => item.au_ma_id);
			this.setState({ isLoadDone: true });
		}
	}
	deleteMulti = async (listIdDictionaryType: number[]) => {
		if (listIdDictionaryType.length < 1) {
			await message.warning(L("Hãy chọn 1 hàng trước khi xoá"));
		}
		else {
			const self = this;
			const { totalCount } = stores.authorizationMachineStore;
			confirm({
				icon: false,
				title: <span><WarningOutlined style={{ fontSize: "23px", color: "orange" }} /> Bạn có muốn <span style={{ color: "red" }}>xóa hàng loạt</span> {listIdDictionaryType.length} dữ liệu ? Thao tác này khi xác nhận <span style={{ color: "red" }}>không thể hoàn tác</span>.</span>,
				okText: L('Xác nhận'),
				cancelText: L('Huỷ'),
				async onOk() {
					if (self.state.currentPage > 1 && (totalCount - self.keySelected.length) % 10 == 0) self.onChangePage(self.state.currentPage - 1, self.state.pageSize)
					await stores.authorizationMachineStore.deleteMulti(listIdDictionaryType);
					self.keySelected = [];
					await self.handleSubmitSearch();
					self.setState({ isLoadDone: true, numberSelected: 0 });
					message.success(L("Xoá thành công") + "!")
				},
				onCancel() {
				},
			});
		}
	}
	deleteAll() {
		let self = this;
		let titleConfirm = (
			<div>
				<div style={{ color: "orange", textAlign: "center", fontSize: "23px" }} ><WarningOutlined style={{}} /> Cảnh báo</div> <br />
				<span> Bạn có muốn <span style={{ color: "red" }}>xóa tất cả</span> dữ liệu ? Thao tác này khi xác nhận <span style={{ color: "red" }}>không thể hoàn tác</span>.</span>
			</div>
		)
		let cancelText = (
			<div style={{ color: "red" }}>Hủy</div>
		)
		this.setState({ isLoadDone: false });
		confirm({
			icon: false,
			title: titleConfirm,
			okText: ("Xoá"),
			cancelText: cancelText,
			async onOk() {
				await stores.authorizationMachineStore.deleteAll();
				self.keySelected = [];
				await self.getAll();
				message.success(("Xóa thành công"));
			},
			onCancel() {

			},
		});
		this.setState({ isLoadDone: true });
	}
	hide = () => {
		this.setState({ clicked: false });
	}
	render() {
		let self = this;
		const { authorizationMachineListResult, totalCount } = stores.authorizationMachineStore;
		const list_ma_id = authorizationMachineListResult.map((item) => item.ma_id)
		const left = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 12, 14, 14, 14) : cssCol(24);
		const right = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 12, 10, 10, 10) : cssCol(0);
		return (
			<Card>
				<Row gutter={[8, 8]} align='bottom' style={{ display: "flex", }}>
					<Col
						xs={{ span: 24, order: 1 }}
						sm={{ span: 12, order: 1 }}
						md={{ span: 12, order: 1 }}
						lg={{ span: 12, order: 1 }}
						xl={{ span: 4, order: 1 }}
						xxl={{ span: 4, order: 1 }}>
						<h2>Ủy quyền vận hành</h2>
					</Col>
					<Col
						xs={{ span: 24, order: 3 }}
						sm={{ span: 12, order: 3 }}
						md={{ span: 8, order: 3 }}
						lg={{ span: 8, order: 3 }}
						xl={{ span: 4, order: 2 }}
						xxl={{ span: 4, order: 2 }}>
						<strong>Người được uỷ quyền</strong>
						<SelectUserMultiple
							us_id_list={this.state.us_id_list}
							onChangeUser={async (value) => { await this.setState({ us_id_list: value }); this.onChangePage(1, this.state.pageSize) }}
						></SelectUserMultiple>
					</Col>
					<Col
						xs={{ span: 24, order: 4 }}
						sm={{ span: 12, order: 4 }}
						md={{ span: 8, order: 4 }}
						lg={{ span: 8, order: 4 }}
						xl={{ span: 4, order: 3 }}
						xxl={{ span: 4, order: 3 }}
					>
						<strong>Máy bán nước</strong>
						<SelectedMachineMultiple
							listMachineId={this.state.ma_id_list}
							onChangeMachine={async (value) => { await this.setState({ ma_id_list: value }); this.onChangePage(1, this.state.pageSize) }}
						></SelectedMachineMultiple>
					</Col>
					<Col
						xs={{ span: 24, order: 5 }}
						sm={{ span: 24, order: 5 }}
						md={{ span: 16, order: 5 }}
						lg={{ span: 8, order: 5 }}
						xl={{ span: 6, order: 4 }}
						xxl={{ span: 6, order: 4 }}>
						<Space>
							<Button type="primary" icon={<SearchOutlined />} title="Tìm kiếm" onClick={() => this.handleSubmitSearch()} >Tìm kiếm</Button>
							{(!!this.state.ma_id_list || !!this.state.us_id_list) &&
								<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >Xóa tìm kiếm</Button>
							}
						</Space>
					</Col>
					<Col
						xs={{ span: 24, order: 2 }}
						sm={{ span: 12, order: 2 }}
						md={{ span: 12, order: 2 }}
						lg={{ span: 12, order: 2 }}
						xl={{ span: 6, order: 5 }}
						xxl={{ span: 6, order: 5 }}
						style={{ textAlign: 'end' }}>
						<Space>
							<Button title='Thêm mới' type="primary" icon={<PlusOutlined />} onClick={() => this.createOrUpdateModalOpen(new AuthorizationMachineDto())}>{this.shouldChangeText() && 'Thêm mới'}</Button>
							<Button title='Xuất dữ liệu' type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcelDrink: true, select: false })}>{this.shouldChangeText() && 'Xuất dữ liệu'}</Button>
						</Space>
					</Col>
				</Row>
				<Row gutter={[8, 8]}>
					<Col span={12} >
						<Badge count={this.keySelected.length}>
							<Popover style={{ width: "200px" }} visible={this.state.clicked} onVisibleChange={(e) => this.handleVisibleChange(e)} placement="right" content={
								<>
									<Row style={{ alignItems: "center", marginTop: this.keySelected.length > 0 ? "5px" : "" }}>
										{this.keySelected.length > 0 ?
											<>
												<Button
													style={{ marginLeft: '10px' }}
													danger icon={<DeleteFilled />} title={"Xóa hàng loạt"}
													size='small'
													onClick={() => { this.deleteMulti(this.keySelected); this.hide() }}
												>
												</Button>
												<a style={{ paddingLeft: "10px", color: "red" }} onClick={() => { this.deleteMulti(this.keySelected); this.hide() }}>{L('Xóa hàng loạt')}</a>
											</>
											: <>
												<Button
													danger icon={<DeleteOutlined />} title={'Xóa tất cả'}
													style={{ marginLeft: '10px' }}
													size='small'
													type='primary'
													onClick={() => { this.deleteAll(); this.hide() }}
												></Button>
												<a style={{ paddingLeft: "10px", color: "red" }} onClick={() => { this.deleteAll(); this.hide() }}>{'Xóa tất cả'}</a>
											</>
										}
									</Row>
									<Row style={{ alignItems: "center", marginTop: "10px" }}>
										<Button
											type='primary'
											icon={<ExportOutlined />} title={L("Xuất dữ liệu")}
											style={{ marginLeft: '10px' }}
											size='small'
											onClick={async () => {
												if (this.listItemSelected.length < 1) {
													await message.warning(L("Hãy chọn một hàng muốn xuất dữ liệu"));
												}
												else {
													this.setState({ visibleExportExcelDrink: true, select: true })
												}
											}}
										></Button>
										<a style={{ paddingLeft: "10px" }} onClick={async () => {
											if (this.listItemSelected.length < 1) {
												await message.warning(L("Hãy chọn một hàng muốn xuất dữ liệu"));
											}
											else {
												this.setState({ visibleExportExcelDrink: true, select: true })
											};
										}}>{L('Xuất dữ liệu')}</a>

									</Row>

								</>
							} trigger={['hover']} >
								<Button type='primary'>Thao tác hàng loạt</Button>
							</Popover >
						</Badge>
					</Col>


				</Row>
				<Row>
					<Col {...left} >
						<AuthorizationMachineTable
							rowSelection={this.rowSelection}
							changeColumnSort={this.changeColumnSort}
							actionTable={this.actionTable}
							hasAction={true}
							authorizationMachineListResult={authorizationMachineListResult}
							isLoadDone={this.state.isLoadDone}
							pagination={{
								position: ['topRight'],
								pageSize: this.state.pageSize,
								total: totalCount,
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
					<Col  {...right}>
						{this.state.visibleModalCreateUpdate &&
							<CreateOrUpdateAuthorizationMachine
								ma_id_list={list_ma_id}
								authorizationMachineSelected={this.authorizationMachineSelected}
								onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
								onCreateUpdateSuccess={this.onCreateUpdateSuccess}
							/>
						}
					</Col>
				</Row>
				<ModalExportAuthorizationMachine
					authorizationMachineListResult={this.state.select ? this.listItemSelected : authorizationMachineListResult}
					visible={this.state.visibleExportExcelDrink}
					onCancel={() => this.setState({ visibleExportExcelDrink: false })}
				/>
			</Card>
		)
	}
}
