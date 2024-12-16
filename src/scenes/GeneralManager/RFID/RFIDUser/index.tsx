import { CloseCircleOutlined, DeleteFilled, DeleteOutlined, ExportOutlined, ImportOutlined, PlusOutlined, SearchOutlined, WarningOutlined } from '@ant-design/icons';
import { L } from '@lib/abpUtility';
import { ChangeMoneyRfidInput, RfidDto, UpdateStatusRfidInput } from '@services/services_autogen';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import SelectEnum from '@src/components/Manager/SelectEnum';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import { eActive, eRFIDTypeRecharge, eRIFDAction, eSort } from '@src/lib/enumconst';
import { stores } from '@stores/storeInitializer';
import { AutoComplete, Badge, Button, Card, Col, DatePicker, Input, InputNumber, Modal, Popover, Row, Select, Space, Tabs, Tag, message } from 'antd';
import { SorterResult, TableRowSelection } from 'antd/lib/table/interface';
import moment, { Moment } from 'moment';
import * as React from 'react';
import LogsRFIDUser from '../../LogsRFID/componentsUser';
import CreateOrUpdateRFID from './components/CreateOrUpdateRFIDUser';
import ImportLSCFromExcelRFIDUser from './components/ImportExcelRFIDUser';
import ModalExportRFIDUser from './components/ModalExportRFIDUser';
import TableRFIDUser from './components/TableRFIDUser';

const { confirm } = Modal;
export const eFormatPicker = {
	date: "date",
	month: "month",
	year: "year",
}
const { RangePicker } = DatePicker;
export default class RFIDUser extends AppComponentBase {
	state = {
		isLoadDone: true,
		visibleModalCreateUpdate: false,
		visibleModalChangeMoney: false,
		visibleModalLog: false,
		visibleExportExcelRFID: false,
		visibleImportExcel: false,
		skipCount: 0,
		currentPage: 1,
		pageSize: 10,
		rf_code: undefined,
		rf_is_active: undefined,
		moneyRFID: undefined,
		clicked: false,
		selectExport: false,
		sort: undefined,
		fieldSort: undefined,
		is_recharge: eRFIDTypeRecharge.RechargeMoney.name,
		options: [],
		selectedOption: "date",
		rangeDatetime: undefined,
		start_date: undefined,
		end_date: undefined,
	};
	RFIDSelected: RfidDto = new RfidDto();
	keySelected: number[] = [];
	listItemSelected: RfidDto[] = [];

	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.RFIDStore.getAll(this.state.rf_code, this.state.rf_is_active, undefined, undefined, this.state.fieldSort, this.state.sort, this.state.skipCount, undefined);
		this.setState({ isLoadDone: true, visibleModalCreateUpdate: false, visibleExportExcelRFID: false, });
	}
	async componentDidMount() {
		this.setState({ isLoadDone: false });
		await this.setState({ selectedOption: eFormatPicker.date, });
		await this.getAll();
		await this.setState({ isLoadDone: true });
	}
	handleSubmitSearch = async () => {
		this.onChangePage(1, 10);
	}
	handleChangeDate = async () => {
		let start_date = !!this.state.rangeDatetime ? moment(this.state.rangeDatetime![0]).startOf(this.state.selectedOption as any).toDate() : undefined;
		let end_date = !!this.state.rangeDatetime?.[1] ?
			moment(this.state.rangeDatetime?.[1]).endOf(this.state.selectedOption as any).toDate() :
			undefined
		this.setState({ start_date: start_date, end_date: end_date })
	}
	createOrUpdateModalOpen = async (input: RfidDto) => {
		if (input === undefined) {
			message.error(L('NotFound'));
			return;
		}
		this.RFIDSelected.init(input);
		await this.setState({ visibleModalCreateUpdate: true, });

	}
	openModalChangeMoney = async (input: RfidDto) => {
		if (input === undefined) {
			message.error(L('NotFound'));
			return;
		}
		this.RFIDSelected.init(input);
		await this.setState({ moneyRFID: undefined, visibleModalChangeMoney: true, });

	}
	openModalLog = async (input: RfidDto) => {
		if (input === undefined) {
			message.error(L('NotFound'));
			return;
		}
		this.RFIDSelected.init(input);
		await this.setState({ visibleModalLog: true, });

	}
	onCreateUpdateSuccess = async () => {
		await this.getAll();
	}

	onChangePage = async (page: number, pagesize?: number) => {
		const { RFIDListResult, } = stores.RFIDStore;
		if (pagesize === undefined || isNaN(pagesize)) {
			pagesize = RFIDListResult.length;
			page = 1;
		}
		await this.setState({ pageSize: pagesize! });
		await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
			this.getAll();
		});
	}
	changeStatus = async (input: RfidDto, checked: boolean) => {
		this.setState({ isLoadDone: false });
		let item = new UpdateStatusRfidInput();
		item.rf_id = input.rf_id;
		item.rf_is_active = checked;
		await stores.RFIDStore.changeStatus(item);
		await this.getAll();
		message.success("Đổi trạng thái thành công")
		this.setState({ isLoadDone: true });
	}
	changeMoney = async (input: RfidDto, money: number | undefined) => {
		this.setState({ isLoadDone: false });
		if (money === 0) {
			message.warning("Vui lòng nhập số tiền");
			return;
		}
		else {
			let item = new ChangeMoneyRfidInput();
			item.rf_id = input.rf_id;
			item.rf_money_current = money!;
			if (this.state.is_recharge == eRFIDTypeRecharge.RechargeMoney.name) {

				item.type_recharge = eRFIDTypeRecharge.RechargeMoney.num;
			}
			else if (this.state.is_recharge == eRFIDTypeRecharge.ChangeMoney.name) { item.type_recharge = eRFIDTypeRecharge.ChangeMoney.num; }
			else item.type_recharge = eRFIDTypeRecharge.ChangeSaleMoney.num;
			await stores.RFIDStore.changeMoney(item);
			this.state.is_recharge == eRFIDTypeRecharge.RechargeMoney.name ? message.success("Nạp tiền thành công") : message.success("Đổi tiền thành công");
			this.setState({ isLoadDone: true, visibleModalChangeMoney: false });
		}

	}
	actionTable = (RFID: RfidDto, event: EventTable, checked?: boolean) => {
		let self = this;
		if (event === EventTable.Edit || event === EventTable.RowDoubleClick) {
			this.openModalChangeMoney(RFID);
		}
		else if (event === EventTable.ChangeStatus) {
			this.changeStatus(RFID, checked!);
		}
		else if (event === EventTable.History) {
			this.openModalLog(RFID);
		}
		else if (event === EventTable.Delete) {
			confirm({
				title: ('Bạn chắc chắn muốn xoá thẻ') + " " + ("RFID" + ": ") + RFID.rf_code + "?",
				okText: ('Xác nhận'),
				cancelText: ('Huỷ'),
				async onOk() {
					await stores.RFIDStore.delete(RFID);
					message.success("Xóa thành công");
					await self.getAll();
				},
				onCancel() {

				},
			});
		}
	}
	onChangeDatePickerStart(date: Moment | null | undefined) {
		if (date === null) {
			date = undefined;
		}
		this.setState({ rf_created_at: date });
	}
	onRefreshData = async () => {
		this.setState({ visibleImportExcel: false, });
		this.getAll();
	}
	deleteMulti = async (listIdDictionaryType: number[]) => {
		if (listIdDictionaryType.length < 1) {
			await message.warning(L("Hãy chọn 1 hàng trước khi xoá"));
		}
		else {
			const self = this;
			const { totalRFID } = stores.RFIDStore;
			confirm({
				title: L('Bạn có muốn xoá hàng loạt') + "?",
				okText: L('Xác nhận'),
				cancelText: L('Huỷ'),
				async onOk() {
					if (self.state.currentPage > 1 && (totalRFID - self.keySelected.length) % 10 === 0) self.onChangePage(self.state.currentPage - 1, self.state.pageSize)
					await stores.RFIDStore.deleteMulti(listIdDictionaryType);
					await self.getAll();

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
			title: titleConfirm,
			okText: L("Delete"),
			cancelText: cancelText,
			async onOk() {
				await stores.RFIDStore.deleteAllForUser();
				await self.getAll();
				message.success(L("Xóa thành công"));
			},
			onCancel() {

			},
		});
		this.setState({ isLoadDone: true });
	}
	handleVisibleChange = (visible) => {
		this.setState({ clicked: visible });
	}
	rowSelection: TableRowSelection<RfidDto> = {
		onChange: (listKeyDictionaryType: React.Key[], listItem: RfidDto[]) => {
			this.setState({ isLoadDone: false });
			this.listItemSelected = listItem;
			this.keySelected = listItem.map(item => item.rf_id);
			if (this.keySelected.length > 0) {
				this.setState({ visibleModalCreateUpdate: false });
			}
			this.setState({ isLoadDone: true });
		}
	}
	clearSearch = async () => {
		this.setState({ isLoadDone: true });
		await this.setState({
			rf_code: '',
			us_id_list: [],
			start_date: undefined,
			end_date: undefined,
			rangeDatetime: undefined,
			rf_is_active: undefined,
		})
		this.setState({ isLoadDone: false });
		this.getAll();
	}
	changeColumnSort = async (sort: SorterResult<RfidDto> | SorterResult<RfidDto>[]) => {
		this.setState({ isLoadDone: false });
		await this.setState({ fieldSort: sort['field'] });
		await this.setState({ sort: sort['order'] === undefined ? undefined : (sort['order'] === "descend" ? eSort.DES.num : eSort.ASC.num) });
		await this.getAll();
		this.setState({ isLoadDone: true });
	}

	shouldChangeText = () => {
		const isChangeText = window.innerWidth >= 768 && window.innerWidth <= 905;
		return !isChangeText;
	}

	shouldChangeText3BtnData1 = () => {
		const isChangeText = window.innerWidth >= 500 && window.innerWidth <= 720;
		return !isChangeText;
	}
	shouldChangeText3BtnData2 = () => {
		const isChangeText = window.innerWidth <= 600;
		return !isChangeText;
	}
	handleSearch = (value) => {
		const { RFIDListResult } = stores.RFIDStore;
		const filteredOptions = RFIDListResult
			.filter(item => item.rf_code && item.rf_code.includes(value))
			.map(item => ({ value: item.rf_code }));
		this.setState({ options: filteredOptions });
	}
	render() {
		const self = this;
		const left = this.state.visibleModalCreateUpdate ? cssCol(16) : cssCol(24);
		const right = this.state.visibleModalCreateUpdate ? cssCol(8) : cssCol(0);
		const { RFIDListResult, totalRFID } = stores.RFIDStore;
		const listcoderfid = RFIDListResult.map(item => item.rf_code);

		return (
			<Card>
				<Row align='bottom' gutter={[8, 8]}>
					<Col {...cssColResponsiveSpan(24, 12, 4, 2, 2, 2)}>
						<strong>Loại</strong>
						<Select
							onChange={async (value) => await this.setState({ selectedOption: value })}
							value={this.state.selectedOption}
							style={{ width: '100%' }}
						>
							<Select.Option value={eFormatPicker.date}>Ngày</Select.Option>
							<Select.Option value={eFormatPicker.month}>Tháng</Select.Option>
							<Select.Option value={eFormatPicker.year}>Năm</Select.Option>
						</Select>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)}>
						<strong>Khoảng thời gian tạo</strong>
						<RangePicker
							style={{ width: "100%" }}
							placeholder={this.state.selectedOption === "date" ? ['Từ ngày', 'Đến ngày'] : (this.state.selectedOption === "month" ? ['Từ tháng', 'Đến tháng'] : ['Từ năm', 'Đến năm'])}
							onChange={async value => {
								await this.setState({ rangeDatetime: value });
								this.handleChangeDate();
								this.handleSubmitSearch();
							}}
							picker={this.state.selectedOption as any}
							format={this.state.selectedOption === "date" ? 'DD/MM/YYYY' : (this.state.selectedOption === "month" ? 'MM/YYYY' : 'YYYY')}
							value={this.state.rangeDatetime as any}
							allowEmpty={[false, true]}
							disabledDate={current => current > moment()}
						/>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 4)}>
						<strong>{L('Mã RFID')}:</strong>
						<Input
							allowClear={true}
							onChange={async (e) => { this.setState({ rf_code: e.target.value == "" ? undefined : e.target.value }); this.handleSubmitSearch() }} placeholder={L("Nhập tìm kiếm")}
							onPressEnter={this.handleSubmitSearch}
							value={this.state.rf_code}
						/>
						{/* <AutoComplete
							backfill
							value={this.state.rf_code}
							allowClear
							onChange={async (value) => {
								await this.setState({ rf_code: value });
							}}
							style={{ width: "100%" }}
							options={this.state.options}
							onSearch={this.handleSearch}
							placeholder="Nhập RFID"
						/> */}
					</Col>

					<Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 4)}>
						<strong>Trạng thái thẻ RFID</strong><br />
						<SelectEnum
							enum_value={this.state.rf_is_active == undefined ? undefined : (this.state.rf_is_active == true ? 1 : 0)}
							onChangeEnum={async (value) => {
								await this.setState({ rf_is_active: value == 1 ? true : (value == undefined ? undefined : false) });
								await this.onChangePage(1, this.state.pageSize);
							}}
							eNum={eActive}>
						</SelectEnum>
					</Col>
					<Col {...cssColResponsiveSpan(24, 24, 8, 8, 8, 8)}>
						<Space>
							<Button type="primary" icon={<SearchOutlined />} title='Tìm kiếm' onClick={() => this.handleSubmitSearch()} >Tìm kiếm</Button>
							{(this.state.rf_code || !!this.state.rangeDatetime || this.state.rf_is_active != undefined) &&
								<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >Xóa tìm kiếm</Button>
							}
						</Space>
					</Col>
				</Row>
				<Row gutter={[8, 4]} >
					{this.isGranted(AppConsts.Permission.Pages_Manager_General_RFID_BulkAction) &&

						<Col {...cssColResponsiveSpan(12, 5, 5, 12, 12, 12)} >
							{this.isGranted(AppConsts.Permission.Pages_Manager_General_RFID_BulkAction) &&
								<Badge count={this.keySelected.length}>
									<Popover style={{ width: "200px" }} visible={this.state.clicked} onVisibleChange={(e) => this.handleVisibleChange(e)} placement="right" content={
										<>
											{this.isGranted(AppConsts.Permission.Pages_Manager_General_Admin_RFID) &&
												<Row style={{ alignItems: "center" }}>
													<Button
														danger icon={<DeleteOutlined />} title={L("Xoá tất cả")}
														style={{ marginLeft: '10px' }}
														size='small'
														onClick={() => { this.deleteAll() }}
														type='primary'
													></Button>
													<a style={{ paddingLeft: "10px", color: "red" }} onClick={() => { this.deleteAll() }}>{L('Xoá tất cả')}</a>
												</Row>
											}
											<Row style={{ alignItems: "center", marginTop: "10px" }}>
												<Button
													danger icon={<DeleteFilled />} title={L("Xoá hàng loạt")}
													style={{ marginLeft: '10px' }}
													size='small'
													onClick={() => { this.deleteMulti(this.keySelected) }}
												></Button>
												<a style={{ paddingLeft: "10px", color: "red" }} onClick={() => { this.deleteMulti(this.keySelected) }}>{L('Xoá hàng loạt')}</a>
											</Row>
											<Row style={{ alignItems: "center", marginTop: "10px" }}>
												<Button
													type='primary'
													icon={<ExportOutlined />} title={'Xuất dữ liệu'}
													style={{ marginLeft: '10px' }}
													size='small'
													onClick={async () => {
														if (this.keySelected.length < 1) {
															await message.warning(L("Hãy chọn một hàng muốn xuất dữ liệu"));
														}
														else {
															this.setState({ visibleExportExcelRFID: true, selectExport: true })
														}
													}}
												></Button>
												<a style={{ paddingLeft: "10px" }} onClick={async () => {
													if (this.keySelected.length < 1) {
														await message.warning(L("Hãy chọn một hàng muốn xuất dữ liệu"));
													}
													else {
														this.setState({ visibleExportExcelRFID: true, selectExport: true })
													};
												}}>Xuất dữ liệu</a>

											</Row>
										</>
									} trigger={['hover']} >
										<Button type='primary'>Thao tác hàng loạt</Button>
									</Popover >
								</Badge>
							}
						</Col>
					}
					<Col className='ant-col-xs-no-maxwidth' {...cssColResponsiveSpan(12, 19, 19, 12, 12, 12)} style={{ justifyContent: "end", display: "flex", gap: 8 }} >
						{this.isGranted(AppConsts.Permission.Pages_Manager_General_RFID_Create) &&
							<Button type="primary" icon={<PlusOutlined />} onClick={() => this.createOrUpdateModalOpen(new RfidDto())}>{this.shouldChangeText3BtnData1() ? 'Thêm mới' : (this.shouldChangeText3BtnData2() && 'Thêm')}</Button>
						}
						{this.isGranted(AppConsts.Permission.Pages_Manager_General_RFID_Export) &&
							<Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcelRFID: true, select: false })}>{this.shouldChangeText3BtnData1() ? 'Xuất dữ liệu' : (this.shouldChangeText3BtnData2() && 'Xuất')}</Button>
						}
						{this.isGranted(AppConsts.Permission.Pages_Manager_General_RFID_Import) &&
							<Button type="primary" icon={<ImportOutlined />} onClick={() => this.setState({ visibleImportExcel: true })}>{this.shouldChangeText3BtnData1() ? 'Nhập dữ liệu' : (this.shouldChangeText3BtnData2() && 'Nhập')}</Button>
						}
					</Col>
				</Row>
				<Row style={{ marginTop: '10px' }}>
					<Col {...left} style={{ overflowY: "auto" }}>
						<TableRFIDUser
							actionTable={this.actionTable}
							changeColumnSort={this.changeColumnSort}
							RFIDListResult={RFIDListResult}
							hasAction={this.keySelected.length > 0 ? false : true}
							rowSelection={this.rowSelection}
							pagination={{
                                position: ['topRight'],
								pageSize: this.state.pageSize,
								total: totalRFID,
								current: this.state.currentPage,
								showTotal: (tot) => "Tổng" + ": " + tot + "",
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
					<Col {...right}>
						<CreateOrUpdateRFID
							rfidListResult={RFIDListResult}
							onCreateUpdateSuccess={this.onCreateUpdateSuccess}
							onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
							RFIDSelected={this.RFIDSelected}
						/>
					</Col>
				</Row>

				<ModalExportRFIDUser
					RFIDListResult={this.state.selectExport ? this.listItemSelected : RFIDListResult}
					visible={this.state.visibleExportExcelRFID}
					onCancel={() => this.setState({ visibleExportExcelRFID: false })}
				/>
				<Modal
					visible={this.state.visibleModalChangeMoney}
					onCancel={() => this.setState({ visibleModalChangeMoney: false, is_recharge: eRFIDTypeRecharge.RechargeMoney.name })}
					closable={true}
					maskClosable={false}
					footer={null}
				>
					<Row justify='center'>
						<h3 style={{ textAlign: 'center' }}>{this.state.is_recharge == eRFIDTypeRecharge.RechargeMoney.name ? "Nạp thẻ RFID" : (this.state.is_recharge == eRFIDTypeRecharge.ChangeSaleMoney.name ? "Đổi tiền khuyến mãi thẻ RFID" : "Điều chỉnh số dư thẻ RFID")}</h3>
					</Row>
					<Tabs onChange={(key) => {
						this.setState({ is_recharge: key, moneyRFID: null });
					}}>
						<Tabs.TabPane tab="Nạp thẻ" key={eRFIDTypeRecharge.RechargeMoney.name}></Tabs.TabPane>
						<Tabs.TabPane tab="Điều chỉnh số dư" key={eRFIDTypeRecharge.ChangeMoney.name}></Tabs.TabPane>
						<Tabs.TabPane tab="Đổi tiền khuyến mãi" key={eRFIDTypeRecharge.ChangeSaleMoney.name}></Tabs.TabPane>
					</Tabs>
					<Row justify='center'>
						<Col span={19} style={{ borderRadius: 15, boxShadow: "rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px", textAlign: "center" }}>
							{/* <h3>{stores.sessionStore.getUserNameById(this.RFIDSelected.us_id_owner)}</h3> */}
							<span>Thẻ RFID: <b> {this.RFIDSelected.rf_code}</b></span>
							{/* { */}
							{/* this.state.is_recharge == eRFIDTypeRecharge.ChangeSaleMoney.name ? */}
							<div>Số số dư hiện tại: <b>{AppConsts.formatNumber(this.RFIDSelected.rf_money_current)} VNĐ</b></div>
							<div>Số dư khuyến mãi hiện tại: <b>{AppConsts.formatNumber(this.RFIDSelected.rf_money_current_sale)} VNĐ</b></div>
							{/* : */}
							{/* } */}
						</Col>
					</Row>
					<Row justify='center' style={{ marginTop: 20 }} gutter={[16, 16]}>
						<InputNumber
							step={1000}
							placeholder={this.state.is_recharge == eRFIDTypeRecharge.RechargeMoney.name ? 'Nhập số dư cần nạp' : (this.state.is_recharge == eRFIDTypeRecharge.ChangeSaleMoney.name ? "Nhập số tiền khuyến mãi cần đổi" : 'Nhập số dư cần đổi')}
							style={{ width: '77%', boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px " }}
							onChange={(e) => this.setState({ moneyRFID: e })}
							value={this.state.moneyRFID}
							min={0}
							max={9999999}
							maxLength={7}  // Giới hạn số không vượt quá 7 chữ số
							formatter={value => value ? AppConsts.numberWithCommas(value.toString().slice(0, 7)) : ''}
							parser={value => value!.replace(/\D/g, '').slice(0, 7)}  // Chỉ cho phép tối đa 7 chữ số
						/>
					</Row>
					{this.state.moneyRFID == 9999999 ?
						<Row justify='center' style={{ marginBottom: 5 }}>
							<Tag icon={<CloseCircleOutlined />} color="error">Đã đến giới hạn 1 lần nạp</Tag>
						</Row>
						: <></>
					}
					<Row justify='center' >
						<Button
							type='primary'
							onClick={() => this.changeMoney(this.RFIDSelected, this.state.moneyRFID != undefined ? (this.state.moneyRFID!) : 0)}
							style={{ width: "80%", borderRadius: '6px', marginBottom: "5px" }}
						>
							Lưu
						</Button>
					</Row>
					<Row justify='center'>
						{this.state.is_recharge == eRFIDTypeRecharge.RechargeMoney.name ?
							<div style={{ fontSize: 15 }}>
								Số số dư sau khi nạp: <b>{AppConsts.formatNumber(this.RFIDSelected.rf_money_current + (!!this.state.moneyRFID ? this.state.moneyRFID! : 0))} VNĐ </b>
							</div>
							:
							this.state.is_recharge == eRFIDTypeRecharge.ChangeMoney.name ?
								<div style={{ fontSize: 15 }}>
									Số số dư sẽ đổi từ: <b>{AppConsts.formatNumber(this.RFIDSelected.rf_money_current)}</b> thành <b>{AppConsts.formatNumber(this.state.moneyRFID!)}  VNĐ</b>
								</div> :
								<div style={{ fontSize: 15 }}>
									Tiền khuyến mãi sẽ đổi từ: <b>{AppConsts.formatNumber(this.RFIDSelected.rf_money_current_sale)}</b> thành <b>{AppConsts.formatNumber(this.state.moneyRFID!)}  VNĐ</b>
								</div>
						}
					</Row>
				</Modal>
				{this.state.visibleModalLog &&
					<Modal
						visible={this.state.visibleModalLog}
						onCancel={() => this.setState({ visibleModalLog: false })}
						closable={false}
						footer={null}
						width='90vw'
						title={
							<Row justify='space-between' gutter={[16, 16]}>
								<Col>
									<h3>Lịch sử giao dịch thẻ: {this.RFIDSelected.rf_code}</h3>
								</Col>
								<Col>
									<Button danger onClick={() => this.setState({ visibleModalLog: false })}>Hủy</Button>
								</Col>
							</Row>
						}
					>
						<LogsRFIDUser rf_code={this.RFIDSelected.rf_code!} isModal={true} search={true}></LogsRFIDUser>
					</Modal>}
				<Modal visible={this.state.visibleImportExcel}
					closable={false}
					footer={false}
					width={"70%"}>
					<ImportLSCFromExcelRFIDUser onRefreshData={this.onRefreshData} onCancel={() => this.setState({ visibleImportExcel: false })} />
				</Modal>
			</Card >
		)
	}
}