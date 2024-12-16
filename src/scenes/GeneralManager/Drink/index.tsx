import { DeleteFilled, DeleteOutlined, ExportOutlined, ImportOutlined, PlusOutlined, SearchOutlined, WarningOutlined } from '@ant-design/icons';
import SelectEnum from '@src/components/Manager/SelectEnum';
import SelectedSupplier from '@src/components/Manager/SelectedSupplier';
import { L } from '@src/lib/abpUtility';
import { EventTable, cssCol, cssColResponsiveSpan } from '@src/lib/appconst';
import { eMoney, eSort } from '@src/lib/enumconst';
import { DrinkDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Badge, Button, Card, Col, Input, Modal, Popover, Row, message } from 'antd';
import { SorterResult, TableRowSelection } from 'antd/lib/table/interface';
import * as React from 'react';
import CreateOrUpdateDrink from './component/CreateOrUpdateDrink';
import DrinkTable from './component/DrinkTable';
import ImportSampleExcelDataDrink from './component/ImportSampleExcelDataDrink';
import ModalExportDrink from './component/ModalExportDrink';
const { confirm } = Modal;

export default class Drink extends React.Component {
	state = {
		isLoadDone: true,
		visibleModalCreateUpdate: false,
		visibleExportExcelDrink: false,
		visibleModalImport: false,
		visibleInfoDrink: false,
		dr_name: undefined,
		dr_price_down: undefined,
		dr_price_up: undefined,
		skipCount: 0,
		maxResultCount: 10,
		su_id: undefined,
		onChangePage: 1,
		pageSize: 10,
		currentPage: 1,
		clicked: false,
		sort: undefined,
		select: false,
	}
	drinkSelected: DrinkDto = new DrinkDto();
	listItemDrink: DrinkDto[] = [];
	keySelected: number[] = [];
	selectedField: string;

	async componentDidMount() {
		await this.getAll();
	}

	async getAll() {
		this.setState({ isLoadDone: false })
		await stores.drinkStore.getAll(this.state.dr_name, this.state.su_id, this.state.dr_price_down, this.state.dr_price_up, this.selectedField, this.state.sort, this.state.skipCount, undefined);
		this.setState({ isLoadDone: true, });
	}

	handleSubmitSearch = async () => {
		this.onChangePage(1, this.state.pageSize);
	}
	handleVisibleChange = (visible) => {
		this.setState({ clicked: visible });
	}

	createOrUpdateModalOpen = async (input: DrinkDto) => {
		this.setState({ isLoadDone: false })
		const self = this;
		if (this.keySelected.length > 0) {
			confirm({
				title: L("Sẽ bỏ tất cả lựa chọn để thực hiện thao tác bạn có muốn tiếp tục ?"),
				okText: L('Confirm'),
				cancelText: L('Cancel'),
				async onOk() {
					self.rowSelection.selectedRowKeys = [];
					if (input !== undefined && input !== null) {
						self.drinkSelected.init(input);
						await self.setState({ visibleModalCreateUpdate: true, isLoadDone: true });
					}
					self.setState({ isLoadDone: true })
				},
				onCancel() {

				},
			});
		}
		else {
			self.drinkSelected.init(input);
			await self.setState({ visibleModalCreateUpdate: true, isLoadDone: true });
		}
	}

	actionTable = (drink: DrinkDto, event: EventTable) => {
		let self = this;
		if (this.keySelected.length > 0) {
			return
		} else {
			if (drink === undefined || drink.dr_id === undefined) {
				message.error("Không tìm thấy !");
				return;
			}
			if (event === EventTable.Edit || event === EventTable.RowDoubleClick) {
				this.createOrUpdateModalOpen(drink);
			}
			else if (event === EventTable.Delete) {
				confirm({
					title: 'Bạn có chắc muốn xóa sản phẩm' + ": " + drink.dr_name + "?",
					okText: "Xác nhận",
					cancelText: "Hủy",
					async onOk() {
						await stores.drinkStore.deleteDrink(drink);
						await self.getAll();
						message.success("Xóa thành công !")
						self.setState({ isLoadDone: true });
					},
					onCancel() {
					},
				});
			}
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
			dr_name: undefined,
			su_id: undefined,
			dr_price_down: undefined,
			dr_price_up: undefined,
		})
		this.getAll();
	}
	hide = () => {
		this.setState({ clicked: false });
	}
	deleteMulti = async (listIdDrink: number[]) => {
		if (listIdDrink.length < 1) {
			await message.error(L("Hãy chọn 1 hàng trước khi xóa"));
		}
		else {
			let self = this;
			const { totalDrink } = stores.drinkStore;
			confirm({
				icon: false,
				title: <span><WarningOutlined style={{ fontSize: "23px", color: "orange" }} /> Bạn có muốn <span style={{ color: "red" }}>xóa hàng loạt</span> {listIdDrink.length} dữ liệu ? Thao tác này khi xác nhận <span style={{ color: "red" }}>không thể hoàn tác</span>.</span>,
				okText: L('Xác nhận'),
				cancelText: L('Hủy'),
				async onOk() {
					if (self.state.currentPage > 1 && (totalDrink - self.keySelected.length) % 10 == 0) self.onChangePage(self.state.currentPage - 1, self.state.pageSize)
					await stores.drinkStore.deleteMulti(listIdDrink);
					self.keySelected = [];
					await self.getAll();
					message.success(L("Xóa thành công" + "!"));
					self.keySelected = []
					self.setState({ isLoadDone: true, });
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
				<div style={{ color: "orange", textAlign: "center", fontSize: "23px" }} ><WarningOutlined /> Cảnh báo</div> <br />
				<span> Bạn có muốn <strong style={{ color: "red" }}>xóa tất cả</strong> dữ liệu ? Thao tác này khi xác nhận <strong style={{ color: "red" }}>không thể hoàn tác</strong>.</span>
			</div>
		)
		let cancelText = (
			<div style={{ color: "red" }}>Hủy</div>
		)
		this.setState({ isLoadDone: false });
		confirm({
			title: titleConfirm,
			okText: L("Delete"),
			cancelText: cancelText,
			icon: false,
			async onOk() {
				await stores.drinkStore.deleteAll();
				self.keySelected = [];
				await self.getAll();
				message.success(L("Xóa thành công"));
			},
			onCancel() {

			},
		});
		this.setState({ isLoadDone: true });
	}
	onRefreshData = () => {
		this.setState({ visibleModalImport: false });
		this.getAll();
	}
	rowSelection: TableRowSelection<DrinkDto> = {
		onChange: (listIdDrink: React.Key[], listItem: DrinkDto[]) => {
			this.setState({ isLoadDone: false })
			this.listItemDrink = listItem;
			this.keySelected = listItem.map(item => item.dr_id);
			this.setState({ isLoadDone: true })

		}
	}

	shouldChangeText = () => {
		const isChangeText = window.innerWidth <= 768;
		return !isChangeText;
	}
	changeColumnSort = async (sort: SorterResult<DrinkDto> | SorterResult<DrinkDto>[]) => {
		this.setState({ isLoadDone: false });
		this.selectedField = sort['field'];
		await this.setState({ sort: sort['order'] === undefined ? undefined : (sort['order'] === "descend" ? eSort.DES.num : eSort.ASC.num) });
		await this.getAll();
		this.setState({ isLoadDone: true });

	}
	render() {
		let self = this;
		const { drinkListResult, totalDrink } = stores.drinkStore;
		const left = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 12, 14, 14, 14) : cssCol(24);
		const right = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 12, 10, 10, 10) : cssCol(0);
		return (
			<Card>
				<Row gutter={[8, 8]}>
					<Col {...cssColResponsiveSpan(15, 12, 8, 8, 8, 8)}>
						<h2>Sản phẩm có bao bì</h2>
					</Col>
					<Col {...cssColResponsiveSpan(9, 12, 16, 16, 16, 16)} style={{ display: "flex", flexWrap: "wrap", justifyContent: "end", gap: 8 }}>
						<Button title='Thêm mới' type="primary" icon={<PlusOutlined />} onClick={() => this.createOrUpdateModalOpen(new DrinkDto())}>{this.shouldChangeText() && 'Thêm mới'}</Button>
						<Button title='Xuất dữ liệu' type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcelDrink: true, select: false })}>{this.shouldChangeText() && 'Xuất dữ liệu'}</Button>
						<Button title='Nhập dữ liệu' type="primary" icon={<ImportOutlined />} onClick={() => this.setState({ visibleModalImport: true, select: false })}>{this.shouldChangeText() && 'Nhập dữ liệu'}</Button>
					</Col>
				</Row>
				<Row gutter={[8, 8]} align='bottom'>
					<Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 4)}>
						<strong>Tên sản phẩm</strong>
						<Input allowClear
							onChange={(e) => this.setState({ dr_name: e.target.value })} placeholder={"Nhập tìm kiếm..."}
							onPressEnter={this.handleSubmitSearch}
							value={this.state.dr_name}
						/>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 4)}>
						<strong>Nhà cung cấp</strong>
						<SelectedSupplier
							supplierID={this.state.su_id}
							onChangeSupplier={(e) => this.setState({ su_id: e })}
						></SelectedSupplier>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 4)}>
						<strong>Giá từ</strong>
						<SelectEnum
							eNum={eMoney}
							onChangeEnum={(e) => this.setState({ dr_price_down: e })}
							enum_value={this.state.dr_price_down}
							disableHighPrice={this.state.dr_price_up}
						></SelectEnum>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 4)}>
						<strong>Đến</strong>
						<SelectEnum
							eNum={eMoney}
							disableLowPrice={this.state.dr_price_down}
							onChangeEnum={(e) => this.setState({ dr_price_up: e })}
							enum_value={this.state.dr_price_up}
						></SelectEnum>
					</Col>
					<Col {...cssColResponsiveSpan(24, 24, 16, 8, 8, 8)} style={{ display: "flex", flexWrap: "wrap", gap: 8 }} >
						<Button type="primary" icon={<SearchOutlined />} title="Tìm kiếm" onClick={() => this.handleSubmitSearch()} >Tìm kiếm</Button>
						{(this.state.dr_name != undefined || this.state.su_id != undefined || this.state.dr_price_down != undefined || this.state.dr_price_up != undefined) &&
							<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >Xóa tìm kiếm</Button>
						}
					</Col>
					<Col span={24} >
						<Badge count={this.keySelected.length}>
							<Popover style={{ width: "200px" }} visible={this.state.clicked} onVisibleChange={(e) => this.handleVisibleChange(e)} placement="right" content={
								<>
									{this.keySelected.length > 0 ?
										<>
											<Row style={{ alignItems: "center", marginTop: "10px" }}>
												<Button
													danger icon={<DeleteFilled />} title={L("Delete")}
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
													danger icon={<DeleteOutlined />} title={L("xoa_tat_ca")}
													style={{ marginLeft: '10px' }}
													size='small'
													type='primary'
													onClick={() => { this.deleteAll(); this.hide() }}
												></Button>
												<a style={{ paddingLeft: "10px", color: "red" }} onClick={() => { this.deleteAll(); this.hide() }}>{L('xoa_tat_ca')}</a>
											</Row>
										</>
									}
									<Row style={{ alignItems: "center", marginTop: "10px" }}>
										<Button
											type='primary'
											icon={<ExportOutlined />} title={"Xuất dữ liệu"}
											style={{ marginLeft: '10px' }}
											size='small'
											onClick={async () => {
												if (this.keySelected.length < 1) {
													await message.warning(L("Hãy chọn một hàng muốn xuất dữ liệu"));
												}
												else {
													this.setState({ visibleExportExcelDrink: true, select: true, })
												}
											}}
										></Button>
										<a style={{ paddingLeft: "10px" }} onClick={async () => {
											if (this.keySelected.length < 1) {
												await message.warning(L("Hãy chọn một hàng muốn xuất dữ liệu"));
											}
											else {
												this.setState({ visibleExportExcelDrink: true, select: true, })
											};
										}}>{"Xuất dữ liệu"}</a>

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
						<DrinkTable
							rowSelection={this.rowSelection}
							actionTable={this.actionTable}
							changeColumnSort={this.changeColumnSort}
							hasAction={this.keySelected.length > 0 ? false : true}
							drinkListResult={drinkListResult}
							isLoadDone={this.state.isLoadDone}
							// pagination={{
							// 	pageSize: this.state.pageSize,
							// 	total: totalDrink,
							// 	current: this.state.currentPage,
							// 	showTotal: (tot) => ("Tổng: ") + tot + "",
							// 	showQuickJumper: true,
							// 	showSizeChanger: true,
							// 	pageSizeOptions: ['10', '20', '50', '100'],
							// 	onShowSizeChange(current: number, size: number) {
							// 		self.onChangePage(current, size)
							// 	},
							// 	onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
							// }}
							pagination={false}
						/>
					</Col>
					<Col  {...right}>
						{this.state.visibleModalCreateUpdate &&
							<CreateOrUpdateDrink
								drinkSelected={this.drinkSelected}
								onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
								onCreateUpdateSuccess={this.onCreateUpdateSuccess}
							/>
						}
					</Col>
				</Row>
				<ModalExportDrink
					drinkListResult={this.state.select ? this.listItemDrink : drinkListResult}
					visible={this.state.visibleExportExcelDrink}
					onCancel={() => this.setState({ visibleExportExcelDrink: false })}
				/>
				<Modal
					visible={this.state.visibleModalImport}
					closable={false}
					maskClosable={false}
					onCancel={() => { this.setState({ visibleModalImport: false }); }}
					footer={null}
					width={"60vw"}
					title="NHẬP DỮ LIỆU SẢN PHẨM CÓ BAO BÌ"
				>
					<ImportSampleExcelDataDrink
						onRefreshData={this.onRefreshData}
						onCancel={() => this.setState({ visibleModalImport: false })}
					/>
				</Modal>
			</Card>
		)
	}
}
