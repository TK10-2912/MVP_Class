
import { DeleteFilled, DeleteOutlined, ExportOutlined, ImportOutlined, PlusOutlined, SearchOutlined, WarningOutlined } from '@ant-design/icons';
import { L, isGranted } from '@src/lib/abpUtility';
import AppConsts, { cssCol, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import { DiscountCodeDto, Int64EntityDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Badge, Button, Card, Col, Input, InputNumber, Modal, Popover, Row, message } from 'antd';
import confirm from 'antd/lib/modal/confirm';
import * as React from 'react';
import SelectEnum from '@src/components/Manager/SelectEnum';
import { eMoney, eSort } from '@src/lib/enumconst';
import ModalExportDiscountCode from './components/ModalExportDiscountCode';
import TableMainDiscountCode from './components/TableMainDiscountCode';
import CreateOrUpdateDiscountCode from './components/CreateOrUpdateDiscountCode';
import moment from 'moment';
import { SorterResult, TableRowSelection } from 'antd/lib/table/interface';
import ImportExcelDiscountCode from './components/ImportExcelDiscountCode';

export default class DiscountCodeUser extends React.Component<any> {
	state = {
		isLoadDone: false,
		visibleModalCreateUpdate: false,
		visibleModalExcel: false,
		di_code: undefined,
		skipCount: 0,
		maxResultCount: 10,
		pageSize: 10,
		currenPage: 1,
		currentPage: 1,
		di_quantity_max: undefined,
		di_price_down: undefined,
		di_price_up: undefined,
		di_desc: undefined,
		di_start_at: undefined,
		di_end_at: undefined,
		ma_id: undefined,
		clicked: false,
		sort: undefined,
		isButtonMultiExportClick: false,
		visibleImportExcel: false,
	}
	disCountCodeSelected: DiscountCodeDto = new DiscountCodeDto();
	listDiscound: DiscountCodeDto[] = [];
	listNumber: number[] = [];
	selectedField: string;

	current = new Date(moment().format());

	async componentDidMount() {
		await this.getAll();
	}

	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.discountCodeStore.getAll(this.state.di_code, this.state.di_quantity_max, this.state.di_start_at, this.state.di_end_at, this.state.di_price_down, this.state.di_price_up, this.state.ma_id, this.selectedField, this.state.sort, this.state.skipCount, this.state.pageSize);
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
	changeColumnSort = async (sort: SorterResult<DiscountCodeDto> | SorterResult<DiscountCodeDto>[]) => {
		this.setState({ isLoadDone: false });
		this.selectedField = sort['field'];
		await this.setState({ sort: sort['order'] === undefined ? undefined : (sort['order'] === "descend" ? eSort.DES.num : eSort.ASC.num) });
		await this.getAll();
		this.setState({ isLoadDone: true });

	}
	handleSubmitSearch = async () => {
		await this.onChangePage(1, this.state.pageSize);
	}
	createOrUpdateModalOpen = async (input: DiscountCodeDto) => {
		this.disCountCodeSelected.init(input);
		await this.setState({ visibleModalCreateUpdate: true });
	}
	deleteDiscountCode = (discountCode: DiscountCodeDto) => {
		let self = this;
		confirm({
			title: "Bạn có muốn xóa mã giảm giá " + discountCode.di_code + "?",
			okText: L('Xác nhận'),
			cancelText: L('Hủy'),
			async onOk() {
				self.setState({ isLoadDone: false });
				await stores.discountCodeStore.delete(discountCode)
				message.success("Xóa mã giảm giá thành công !")
				await self.getAll();
				self.setState({ isLoadDone: true, visibleModalCreateUpdate: false });
			},
		});
	}

	createSuccess = () => {
		this.setState({ isLoadDone: false });
		this.getAll();
		this.setState({ isLoadDone: true, visibleModalCreateUpdate: false });
	}

	onCancel = () => {
		this.setState({ visibleModalCreateUpdate: false });
	}

	onDoubleClickRow = (value: DiscountCodeDto) => {
		if (value == undefined || value.di_id == undefined) {
			message.error(L('Không thể tìm thấy'));
			return;
		}
		this.disCountCodeSelected.init(value);
		this.createOrUpdateModalOpen(value);
	};
	onChangeQuantity = (value: string | number | undefined) => {
		let quantity: number | undefined | string = undefined;
		if (value != undefined) {
			quantity = value;
		}
		this.setState({ di_quantity_max: quantity })
	};

	async activateOrDeActive(item: DiscountCodeDto) {
		this.setState({ isLoadDone: false });
		let item_id = new Int64EntityDto();
		item_id.id = item.di_id;
		if (item.di_active) {
			await stores.discountCodeStore.deActivate(item_id);
			message.success("Thay đổi trạng thái thành công !")
		} else {
			await stores.discountCodeStore.activate(item_id);
			message.success("Thay đổi trạng thái thành công !")
		}
		this.setState({ isLoadDone: true, visibleModalCreateUpdate: false });
	}
	clearSearch = async () => {
		await this.setState({
			di_code: undefined,
			di_quantity_max: undefined,
			di_price_down: undefined,
			di_price_up: undefined,
			di_desc: undefined,
		})
		this.getAll();
	}
	handleVisibleChange = (visible) => {
		this.setState({ clicked: visible });
	}
	hide = () => {
		this.setState({ clicked: false });
	}
	rowSelection: TableRowSelection<DiscountCodeDto> = {

		onChange: (listIdMember: React.Key[], listItem: DiscountCodeDto[]) => {
			this.setState({ isLoadDone: false });
			this.listDiscound = listItem;
			this.listNumber = this.listDiscound.map(item => item.di_id);
			if (this.listNumber.length > 0) {
				this.setState({ visibleModalCreateUpdate: false });
			}
			this.setState({ isLoadDone: true });
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
			title: titleConfirm,
			okText: L("Delete"),
			cancelText: cancelText,
			async onOk() {
				await stores.discountCodeStore.deleteAll();
				await self.getAll();
				message.success(L("Xóa thành công"));
			},
			onCancel() {

			},
		});
		this.setState({ isLoadDone: true });
	}
	deleteMulti = async (listIdDiscound: number[]) => {
		this.setState({ isLoadDone: false })
		if (this.listNumber.length < 1) {
			await message.error(L("Hãy chọn 1 hàng trước khi xóa"));
		}
		else {
			let self = this;
			const { totalCount } = stores.discountCodeStore
			confirm({
				title: <span><WarningOutlined style={{ fontSize: "23px", color: "orange" }} /> Bạn có muốn <span style={{ color: "red" }}>xóa hàng loạt</span> {this.listNumber.length} dữ liệu ? Thao tác này khi xác nhận <span style={{ color: "red" }}>không thể hoàn tác</span>.</span>,
				okText: L('Xác nhận'),
				cancelText: L('Hủy'),
				async onOk() {
					if (self.state.currentPage > 1 && (totalCount - self.listNumber.length) % 10 == 0) self.onChangePage(self.state.currentPage - 1, self.state.pageSize)
					await stores.discountCodeStore.deleteMulti(self.listNumber);
					await self.getAll();
					self.listNumber = []
					self.listDiscound = []
					self.setState({ isLoadDone: true });
					message.success(L("Xóa thành công" + "!"))
				},
				onCancel() {
				},
			});
		}
	}
	onRefreshData = async () => {
		this.setState({ visibleImportExcel: false, });
		this.getAll();
	}

	shouldChangeText = () => {
		const isChangeText = window.innerWidth >= 576 && window.innerWidth <= 960;
		return !isChangeText;
	}

	shouldChangeText3BtnData1 = () => {
		const isChangeText = window.innerWidth <= 717;
		return !isChangeText;
	}

	shouldChangeText3BtnData2 = () => {
		const isChangeText = window.innerWidth <= 580;
		return !isChangeText;
	}

	render() {

		const left = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 12, 14, 14, 14) : cssCol(24);
		const right = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 12, 10, 10, 10) : cssCol(0);
		const { discountCodeListResult, totalCount } = stores.discountCodeStore;
		const self = this
		return (
			<Card>
				<Row>
					<Col {...cssColResponsiveSpan(13, 7, 6, 8, 8, 8)}>
						<h2>Mã giảm giá</h2>
					</Col>
					<Col {...cssColResponsiveSpan(11, 17, 18, 16, 16, 16)} style={{ display: "flex", flexWrap: "wrap", justifyContent: "end", gap: 8 }}>
						{isGranted(AppConsts.Permission.Pages_Manager_General_Discount_Create) &&
							<Button title='Thêm mới' type='primary' icon={<PlusOutlined />} onClick={() => this.createOrUpdateModalOpen(new DiscountCodeDto())}>{this.shouldChangeText3BtnData1() ? 'Thêm mới' : (this.shouldChangeText3BtnData2() && 'Thêm')}</Button>
						}
						{isGranted(AppConsts.Permission.Pages_Manager_General_Discount_Export) &&
							<Button title='Xuất dữ liệu' type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleModalExcel: true })}>{this.shouldChangeText3BtnData1() ? 'Xuất dữ liệu' : (this.shouldChangeText3BtnData2() && 'Xuất')}</Button>
						}
						{isGranted(AppConsts.Permission.Pages_Manager_General_Discount_Import) &&
							<Button title='Nhập dữ liệu' type="primary" icon={<ImportOutlined />} onClick={() => this.setState({ visibleImportExcel: true })}>{this.shouldChangeText3BtnData1() ? 'Nhập dữ liệu' : (this.shouldChangeText3BtnData2() && 'Nhập')}</Button>
						}
					</Col>
				</Row>
				<Row gutter={[8, 8]} align='bottom'>
					<Col {...cssColResponsiveSpan(24, 12, 8, 8, 6, 3)}>
						<strong>Mã giảm giá</strong>
						<Input style={{ width: "100%" }} allowClear
							onChange={(e) => this.setState({ di_code: e.target.value })} placeholder={"Nhập mã giảm giá..."}
							onPressEnter={this.handleSubmitSearch}
							value={this.state.di_code}
						/>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 8, 6, 3)}>
						<strong>Số lượng mã tối đa</strong>
						<InputNumber
							style={{ width: "100%" }}
							min={0}
							formatter={a => AppConsts.numberWithCommas(a)}
							parser={a => a!.replace(/\$\s?|(,*)/g, '')}
							onChange={(e) => this.onChangeQuantity(e)}
							placeholder={"Nhập số lượng..."}
							onPressEnter={this.handleSubmitSearch}
							value={this.state.di_quantity_max}
						/>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 8, 6, 3)}>
						<strong>Giá từ</strong>
						<SelectEnum
							eNum={eMoney}
							onChangeEnum={(e) => this.setState({ di_price_down: e })}
							enum_value={this.state.di_price_down}
							disableHighPrice={this.state.di_price_up}
						></SelectEnum>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 8, 6, 3)}>
						<strong>Đến</strong>
						<SelectEnum
							eNum={eMoney}
							disableLowPrice={this.state.di_price_down}
							onChangeEnum={(e) => this.setState({ di_price_up: e })}
							enum_value={this.state.di_price_up}
						></SelectEnum>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 8, 6, 3)}>
						<strong>Mô tả</strong>
						<Input style={{ width: "100%" }} allowClear
							onChange={(e) => this.setState({ di_desc: e.target.value })} placeholder={"Nhập mô tả..."}
							onPressEnter={this.handleSubmitSearch}
							value={this.state.di_desc}
						></Input>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 8, 8, 8)} style={{ display: "flex", flexWrap: "wrap", padding: 0 }}>
						<Col>
							<Button type="primary" icon={<SearchOutlined />} title="Tìm kiếm" onClick={() => this.handleSubmitSearch()} >{this.shouldChangeText() ? 'Tìm kiếm' : 'Tìm'}</Button>
						</Col>
						<Col>
							{(this.state.di_code != undefined || this.state.di_quantity_max != undefined || this.state.di_price_down != undefined || this.state.di_price_up != undefined || this.state.di_desc != undefined) &&
								<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >{this.shouldChangeText() ? 'Xóa tìm kiếm' : 'Xóa'}</Button>
							}
						</Col>
					</Col>

				</Row>
				{isGranted(AppConsts.Permission.Pages_Manager_General_Discount_BulkAction) &&
					<Row>
						<Badge count={this.listNumber.length}>
							<Popover style={{ width: "200px" }} visible={this.state.clicked} onVisibleChange={(e) => this.handleVisibleChange(e)} placement="right" content={
								<>
									{this.listNumber.length > 0 ?
										<>
											<Row style={{ alignItems: "center", marginTop: "10px" }}>
												<Button
													danger icon={<DeleteFilled />} title={L("Delete")}
													style={{ marginLeft: '10px' }}
													size='small'
													onClick={() => { this.deleteMulti(this.listNumber); this.hide() }}
												></Button>
												<a style={{ paddingLeft: "10px", color: "red" }} onClick={() => { this.deleteMulti(this.listNumber); this.hide() }}>{L('Xóa hàng loạt')}</a>
											</Row>
										</>
										:
										<>
											<Row style={{ alignItems: "center" }}>
												<Button
													danger icon={<DeleteOutlined />} title={'Xóa tất cả'}
													style={{ marginLeft: '10px' }}
													size='small'
													type='primary'
													onClick={() => { this.deleteAll(); this.hide() }}
												></Button>
												<a style={{ paddingLeft: "10px", color: "red" }} onClick={() => { this.deleteAll(); this.hide() }}>{'Xóa tất cả'}</a>
											</Row>
										</>
									}
									<Row style={{ alignItems: "center", marginTop: "10px" }}>
										<Button
											type='primary'
											icon={<ExportOutlined />} title={L("Xuất dữ liệu")}
											style={{ marginLeft: '10px' }}
											size='small'
											onClick={() => !!this.listDiscound.length ? this.setState({ isButtonMultiExportClick: true, visibleModalExcel: true }) : message.warning(L("hay_chon_hang_muon_xuat_du_lieu"))}

										></Button>
										<a style={{ paddingLeft: "10px" }}
											onClick={() => !!this.listDiscound.length ? this.setState({ isButtonMultiExportClick: true, visibleModalExcel: true }) : message.warning(L("hay_chon_hang_muon_xuat_du_lieu"))}
										>
											{L('Xuất dữ liệu')}
										</a>
									</Row>
								</>
							} trigger={['hover']} >
								<Button style={{ marginBottom: '10px' }} type='primary'>Thao tác hàng loạt</Button>
							</Popover >
						</Badge>
					</Row>}
				<Row>
					<Col {...left}>
						<TableMainDiscountCode
							export={false}
							disIdSelected={this.disCountCodeSelected.di_id}
							deleteDiscountCode={this.deleteDiscountCode}
							rowSelection={this.rowSelection}
							discountListResult={discountCodeListResult}
							onDoubleClickRow={this.onDoubleClickRow}
							editDiscountCode={this.createOrUpdateModalOpen}
							activateOrDeActive={(item: DiscountCodeDto) => this.activateOrDeActive(item)}
							hasAction={this.listNumber.length > 0 ? false : true}
							pagination={{
								position: ['topRight'],
								pageSize: this.state.pageSize,
								total: totalCount,
								current: this.state.currentPage,
								showTotal: (tot) => "Tổng: " + tot + "",
								showQuickJumper: true,
								showSizeChanger: true,
								pageSizeOptions: pageSizeOptions,
								onShowSizeChange(current: number, size: number) {
									self.onChangePage(current, size)
								},
								onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
							}} />
					</Col>
					{this.state.visibleModalCreateUpdate &&
						<Col {...right}>
							<CreateOrUpdateDiscountCode createSuccess={this.createSuccess} discountCodeSelected={this.disCountCodeSelected} onCancel={this.onCancel} disable={(new Date(this.disCountCodeSelected.di_end_at!) < this.current) ? true : false} />
						</Col>
					}
				</Row>
				<ModalExportDiscountCode
					discountListResult={this.state.isButtonMultiExportClick ? this.listDiscound : discountCodeListResult}
					visible={this.state.visibleModalExcel}
					onCancel={() => this.setState({ visibleModalExcel: false })}
				/>
				<Modal visible={this.state.visibleImportExcel}
					closable={false}
					footer={false}
					width={"70%"}>
					<ImportExcelDiscountCode onRefreshData={this.onRefreshData} onCancel={() => this.setState({ visibleImportExcel: false })} />
				</Modal>
			</Card>
		)
	}
}
