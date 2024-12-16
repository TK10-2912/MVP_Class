import * as React from 'react';
import { Col, Row, Button, Card, Input, Modal, message, Popover, Badge, Tabs, } from 'antd';
import { stores } from '@stores/storeInitializer';
import { SupplierDto } from '@services/services_autogen';
import { L } from '@lib/abpUtility';
import { DeleteFilled, DeleteOutlined, ExportOutlined, ImportOutlined, PlusOutlined, SearchOutlined, WarningOutlined } from '@ant-design/icons';
import AppConsts, { EventTable, cssColResponsiveSpan } from '@src/lib/appconst';
import CreateOrUpdateSupplier from './components/CreateOrUpdateSupplier';
import TableSupplier from './components/TableSupplier';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import ModalExportSupplier from './components/ModalExportSupplier';
import ImportSampleExcelDataSupplier from './components/ImportSampleExcelDataSupplier';
import { SorterResult, TableRowSelection } from 'antd/lib/table/interface';
import { eSort } from '@src/lib/enumconst';
const { confirm } = Modal;


export interface IProps {
	visibleModalSupplier?: boolean;
}
export default class Supplier extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		visibleModalCreateUpdate: false,
		visibleExportExcelSupplier: false,
		visibleImportExcelSupplier: false,
		skipCount: 0,
		currentPage: 1,
		pageSize: 10,
		su_search: undefined,
		su_desc: undefined,
		clicked: false,
		numberSelected: 0,
		select: false,
		sort: undefined,
	};
	supplierSelected: SupplierDto = new SupplierDto();
	keySelected: number[] = [];
	listItemSelected: SupplierDto[] = [];
	selectedField: string;

	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.supplierStore.getAll(this.state.su_search, this.selectedField, this.state.sort, this.state.skipCount, this.state.pageSize);
		this.setState({ isLoadDone: true, visibleModalCreateUpdate: false, visibleExportExcelSupplier: false, });
	}
	async componentDidMount() {
		await this.getAll();
	}
	handleSubmitSearch = async () => {
		this.onChangePage(1, 10);
	}

	createOrUpdateModalOpen = async (input: SupplierDto) => {
		if (input === undefined) {
			message.error(L('NotFound'));
			return;
		}
		this.supplierSelected.init(input);
		await this.setState({ visibleModalCreateUpdate: true, });

	}
	onCreateUpdateSuccess = async () => {
		await this.getAll();
	}

	onChangePage = async (page: number, pagesize?: number) => {
		if (pagesize !== undefined) {
			await this.setState({ pageSize: pagesize! });
		}
		this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
			this.getAll();
		})
	}

	actionTableSupplier = (supplier: SupplierDto, event: EventTable) => {
		let self = this;
		if (event === EventTable.Edit || event === EventTable.RowDoubleClick) {
			this.createOrUpdateModalOpen(supplier);
		} else if (event === EventTable.Delete) {
			confirm({
				title: L('Bạn có muốn xóa nhà cung cấp') + ": " + supplier.su_name + "?",
				okText: L('Xác nhận'),
				cancelText: L('Hủy'),
				async onOk() {
					await stores.supplierStore.deleteSupplier(supplier);
					await stores.sessionStore.getCurrentLoginInformations();
					message.success("Xóa thành công");
					await self.getAll();
				},
				onCancel() {

				},
			});
		}
	}
	onRefreshData = async () => {
		this.setState({ visibleImportExcelSupplier: false });
		this.getAll();
	}
	deleteMulti = async (list_sup_id: number[]) => {
		if (list_sup_id.length < 1) {
			await message.warning(L("Hãy chọn 1 hàng trước khi xoá"));
		}
		else {
			const self = this;
			const { totalSupplier } = stores.supplierStore;
			confirm({
				icon: false,
				title: <span><WarningOutlined style={{ fontSize: "23px", color: "orange" }} /> Bạn có muốn <span style={{ color: "red" }}>xóa hàng loạt</span> {list_sup_id.length} dữ liệu ? Thao tác này khi xác nhận <span style={{ color: "red" }}>không thể hoàn tác</span>.</span>,
				okText: ('Xác nhận'),
				cancelText: <div style={{ color: "red" }}>Hủy</div>,
				async onOk() {
					if (self.state.currentPage > 1 && (totalSupplier - self.keySelected.length) % 10 === 0) self.onChangePage(self.state.currentPage - 1, self.state.pageSize)
					await stores.supplierStore.deleteMulti(list_sup_id);
					await self.getAll();
					self.keySelected = [];
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
				<div style={{ color: "orange", textAlign: "center", fontSize: "23px" }} ><WarningOutlined style={{}} />Cảnh báo</div> <br />
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
			okText: L("Delete"),
			cancelText: cancelText,
			async onOk() {
				await stores.supplierStore.deleteAll();
				await self.getAll();
				self.keySelected = [];
				message.success(L("Xoá thành công"));
			},
			onCancel() {

			},
		});
		this.setState({ isLoadDone: true });
	}
	handleVisibleChange = (visible) => {
		this.setState({ clicked: visible });
	}

	rowSelection: TableRowSelection<SupplierDto> = {
		onChange: (listKeyDictionaryType: React.Key[], listItem: SupplierDto[]) => {
			this.setState({ isLoadDone: false });
			this.listItemSelected = listItem;
			this.keySelected = this.listItemSelected.map(item => item.su_id);
			if (this.keySelected.length > 0) {
				this.setState({ visibleModalCreateUpdate: false });
			}
			this.setState({ isLoadDone: true });

		}
	}

	shouldChangeText3BtnData1 = () => {
		const isChangeText = window.innerWidth > 955 && window.innerWidth <= 1222;
		return !!isChangeText;
	}
	shouldChangeText3BtnData2 = () => {
		const isChangeText = window.innerWidth <= 576 || window.innerWidth >= 768 && window.innerWidth <= 955;
		return !!isChangeText;
	}
	hide = () => {
		this.setState({ clicked: false });
	}
	changeColumnSort = async (sort: SorterResult<SupplierDto> | SorterResult<SupplierDto>[]) => {
		this.setState({ isLoadDone: false });
		this.selectedField = sort['field'];
		await this.setState({ sort: sort['order'] === undefined ? undefined : (sort['order'] === "descend" ? eSort.DES.num : eSort.ASC.num) });
		await this.getAll();
		this.setState({ isLoadDone: true });
	}
	getSupplier =async(input : SupplierDto) =>{	
		this.setState({ isLoadDone: false });
		await this.supplierSelected.init(input);	
		this.setState({ isLoadDone: true });
	}
	render() {

		const self = this;

		const left = this.state.visibleModalCreateUpdate ? AppConsts.cssRightMain.left : AppConsts.cssPanelMain.left;
		const right = this.state.visibleModalCreateUpdate ? AppConsts.cssPanelMain.right : AppConsts.cssRightMain.right;
		const { supplierListResult, totalSupplier } = stores.supplierStore;
	
		return (
			<Card>
				<Row gutter={[8, 8]} align='middle'>
					{!!this.props.visibleModalSupplier ?
						""
						:
						<Col {...cssColResponsiveSpan(13, 9, 6, 4, 4, 4)} order={1}>
							<h2>Nhà cung cấp</h2>
						</Col>
					}
					<Col xs={{ span: 14, order: 3 }} sm={{ span: 8, order: 2 }} md={{ span: 6, order: 2 }} lg={{ span: 6, order: 2 }} xl={{ span: 6, order: 2 }} xxl={{ span: 6, order: 2 }}>
						<Input
							allowClear={true}
							onChange={(e) => { this.setState({ su_search: e.target.value }); this.handleSubmitSearch() }} placeholder={'Nhập tìm kiếm'}
						/>
					</Col>
					<Col className='ant-col-xs-no-maxwidth' {...cssColResponsiveSpan(10, 7, 2, 2, 2, 2)} xs={{ span: 10, order: 4 }} sm={{ span: 7, order: 3 }} md={{ span: 2, order: 3 }} lg={{ span: 2, order: 3 }} xl={{ span: 2, order: 3 }} xxl={{ span: 2, order: 3 }}>
						<Button type="primary" icon={<SearchOutlined />} title={L('Tìm kiếm')} onClick={() => this.handleSubmitSearch()} >{(window.innerWidth > 482) && 'Tìm kiếm'}</Button>
					</Col>
					{!!this.props.visibleModalSupplier ?
						<Col xs={{ span: 11, order: 2 }} sm={{ span: 24, order: 4 }} md={{ span: 10, order: 4 }} lg={{ span: 16, order: 4 }} xl={{ span: 16, order: 4 }} xxl={{ span: 16, order: 4 }}
							style={{ display: "flex", flexWrap: "wrap", padding: 0, justifyContent: "right" }}>
							<Col>
								<Button type="primary" title='Thêm mới' icon={<PlusOutlined />} onClick={() => this.createOrUpdateModalOpen(new SupplierDto())}	>{this.shouldChangeText3BtnData1() ? 'Thêm' : (this.shouldChangeText3BtnData2() ? '' : 'Thêm mới')}</Button>
							</Col>
							<Col>
								<Button type="primary" title='Xuất dữ liệu' icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcelSupplier: true, select: false })}>{this.shouldChangeText3BtnData1() ? 'Xuất' : (this.shouldChangeText3BtnData2() ? '' : 'Xuất dữ liệu')}</Button>
							</Col>
							<Col>
								<Button type="primary" title='Nhập dữ liệu' icon={<ImportOutlined />} onClick={() => this.setState({ visibleImportExcelSupplier: true })}>{this.shouldChangeText3BtnData1() ? 'Nhập' : (this.shouldChangeText3BtnData2() ? '' : 'Nhập dữ liệu')}</Button>
							</Col>
						</Col>
						:
						<Col  {...cssColResponsiveSpan(12, 24, 10, 12, 12, 12)} xs={{ span: 11, order: 2 }} sm={{ span: 24, order: 4 }} md={{ span: 10, order: 4 }} lg={{ span: 12, order: 4 }} xl={{ span: 12, order: 4 }} xxl={{ span: 12, order: 4 }}
							style={{ display: "flex", flexWrap: "wrap", padding: 0, justifyContent: "right" }}>
							<Col>
								<Button type="primary" title='Thêm mới' icon={<PlusOutlined />} onClick={() => this.createOrUpdateModalOpen(new SupplierDto())}	>{this.shouldChangeText3BtnData1() ? 'Thêm' : (this.shouldChangeText3BtnData2() ? '' : 'Thêm mới')}</Button>
							</Col>
							<Col>
								<Button type="primary" title='Xuất dữ liệu' icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcelSupplier: true, select: false })}>{this.shouldChangeText3BtnData1() ? 'Xuất' : (this.shouldChangeText3BtnData2() ? '' : 'Xuất dữ liệu')}</Button>
							</Col>
							<Col>
								<Button type="primary" title='Nhập dữ liệu' icon={<ImportOutlined />} onClick={() => this.setState({ visibleImportExcelSupplier: true })}>{this.shouldChangeText3BtnData1() ? 'Nhập' : (this.shouldChangeText3BtnData2() ? '' : 'Nhập dữ liệu')}</Button>
							</Col>
						</Col>

					}
				</Row>
				<Row gutter={[8, 4]}>
					<Col span={12} >
						{/* {this.isGranted(AppConsts.Permission.General_Fields_Delete) && */}
						<Badge count={this.keySelected.length}>
							<Popover style={{ width: "200px" }} visible={this.state.clicked} onVisibleChange={(e) => this.handleVisibleChange(e)} placement="right" content={
								<>
									{this.keySelected.length > 0 ?
										<>
											<Row style={{ alignItems: "center", marginTop: "10px" }}>
												<Button
													danger icon={<DeleteFilled />} title={L("Xóa hàng loạt")}
													style={{ marginLeft: '10px' }}
													size='small'
													onClick={() => { this.deleteMulti(this.keySelected); this.hide() }}
												></Button>
												<a style={{ paddingLeft: "10px", color: "red" }} onClick={() => { this.deleteMulti(this.keySelected); this.hide() }}>{L('Xóa hàng loạt')}</a>
											</Row>
										</>
										:
										<>
											<Row style={{ alignItems: "center" }}>
												<Button
													danger icon={<DeleteOutlined />} title={L("Xóa tất cả")}
													style={{ marginLeft: '10px' }}
													size='small'
													type='primary'
													onClick={() => { this.deleteAll(); this.hide() }}
												></Button>
												<a style={{ paddingLeft: "10px", color: "red" }} onClick={() => { this.deleteAll(); this.hide() }}>{L('Xóa tất cả')}</a>
											</Row>
										</>
									}
									<Row style={{ alignItems: "center", marginTop: "10px" }}>
										<Button
											type='primary'
											icon={<ExportOutlined />} title={L("Xuất dữ liệu")}
											style={{ marginLeft: '10px' }}
											size='small'
											onClick={async () => {
												if (this.keySelected.length < 1) {
													await message.warning(L("Hãy chọn một hàng muốn xuất dữ liệu"));
												}
												else {
													this.setState({ visibleExportExcelSupplier: true, select: true })
												}
											}}
										></Button>
										<a style={{ paddingLeft: "10px" }} onClick={async () => {
											if (this.keySelected.length < 1) {
												await message.warning(L("Hãy chọn một hàng muốn xuất dữ liệu"));
											}
											else {
												this.setState({ visibleExportExcelSupplier: true, select: true })
											};
										}}>{L('Xuất dữ liệu')}</a>

									</Row>
								</>
							} trigger={['hover']} >
								<Button type='primary'>{L("Thao tác hàng loạt")}</Button>
							</Popover >
						</Badge>
						{/* } */}
					</Col>
				</Row>
				<Row>
					<Col {...left} >
						<TableSupplier
							actionTable={this.actionTableSupplier}
							rowSelection={this.rowSelection}
							changeColumnSort={this.changeColumnSort}
							onCreateUpdateSuccess={this.onCreateUpdateSuccess}
							onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
							supplierListResult={supplierListResult}
							checkExpand={this.state.visibleModalCreateUpdate}
							isPrint={false}
							hasAction={this.keySelected.length > 0 ? false : true}
							pagination={{
								pageSize: this.state.pageSize,
								total: totalSupplier,
								current: this.state.currentPage,
								showTotal: (tot) => "Tổng" + ": " + tot + "",
								showQuickJumper: true,
								showSizeChanger: true,
								pageSizeOptions: ['10', '20', '50', '100'],
								onShowSizeChange(current: number, size: number) {
									self.onChangePage(current, size)
								},
								onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
							}}
						// pagination={false}
						/>
					</Col>
					{
						this.state.visibleModalCreateUpdate &&
						<Col {...right}>
							<CreateOrUpdateSupplier
								onCreateUpdateSuccess={this.onCreateUpdateSuccess}
								onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
								supplierSelected={this.supplierSelected}
								layoutDetail= {false}
							/>
						</Col>
					}
				</Row>

				<ModalExportSupplier
					supplierListResult={this.state.select ? this.listItemSelected : supplierListResult}
					visible={this.state.visibleExportExcelSupplier}
					onCancel={() => this.setState({ visibleExportExcelSupplier: false })}
				/>
				<Modal
					visible={this.state.visibleImportExcelSupplier}
					closable={true}
					maskClosable={false}
					onCancel={() => { this.setState({ visibleImportExcelSupplier: false }); }}
					footer={null}
					width={"60vw"}
					title={<strong>NHẬP DỮ LIỆU NHÀ CUNG CẤP</strong>}
				>
					<ImportSampleExcelDataSupplier
						onRefreshData={this.onRefreshData}
						onCancel={() => this.setState({ visibleImportExcelSupplier: false })}
					/>
				</Modal>
			</Card >
		)
	}
}