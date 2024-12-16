import * as React from 'react';
import { Button, Card, Col, DatePicker, Input, Modal, Row, Select, Space, Tabs, message, } from 'antd';
import { GroupTrashbinDto, TrashBinDto, TrashBinLogsDto } from '@services/services_autogen';
import { isGranted, L } from '@lib/abpUtility';
import AppConsts, { cssCol, cssColResponsiveSpan, EventTable, pageSizeOptions } from '@src/lib/appconst';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { ExpandableConfig, SorterResult, TableRowSelection } from 'antd/lib/table/interface';
import { stores } from '@src/stores/storeInitializer';
import {BarChartOutlined, DeleteOutlined, ExportOutlined, PlusOutlined, SearchOutlined,} from '@ant-design/icons';
import TableTrashBin from './components/TableTrashBin';
import CreateOrUpdateTrashBin from './components/CreateOrUpdateTrashBin';
import ImportSampleExcelDataTrashBin from './components/ImportSampleExcelDataTrashBin';
import ModalExportTrashBin from './components/ModalExportTrashBin';
import { eFileType, eSort, eTrashType } from '@src/lib/enumconst';
import TrashBinLog from './components/TrashBinLog';
import BarChartTrashBin from './components/BarChartTrashBin';
import SelectedGroupTrashBin from '@src/components/Manager/SelectedGroupTrashBin';
import moment from 'moment';
import BarChartCarbonCredit from './components/BarChartCarbonCredit';
import TrashBinCreditLog from './components/TrashBinCreditLog';
import { DatePickerProps } from 'antd/lib/date-picker';
import SelectEnumMulti from '@src/components/Manager/SelectEnumMulti';
import debounce from "lodash.debounce";

const { RangePicker } = DatePicker;
const { confirm } = Modal;

export const tabManager = {
	tab_1: 'Quy đổi rác',
	tab_2: 'Quy đổi tín chỉ',
};
export const eFormatPicker = {
	date: 'date',
	week: 'week',
	month: 'month',
	year: 'year',
};
interface IProps {
	GroupTrashBinSelected?: GroupTrashbinDto;
	isModal?: boolean;
}
export default class TrashBin extends AppComponentBase<IProps> {
	debouncedSearch: () => void;
    constructor(props) {
        super(props);
        this.debouncedSearch = debounce(this.handleSubmitSearch, 500);
    }
	state = {
		isLoadDone: true,
		visibleModalCreateUpdate: false,
		visibleImportExcelTrashBin: false,
		visibleExportTrashBinModal: false,
		visibleBarChartTrashBinModal: false,
		visibleBarChartCarbonCredit: false,
		tr_name: undefined,
		deviceMAC: undefined,
		tr_type: undefined,
		skipCount: 0,
		currentPage: 1,
		pageSize: 10,
		su_desc: undefined,
		expandedRowKey: undefined,
		clicked: false,
		sort: undefined,
		selectedField: undefined,
		tr_id_selected: undefined,
		currentPageLog: 1,
		pageSizeLog: 10,
		rangerDateTime: undefined,
		selectedOption: eFormatPicker.date,
		rangeDatetime: undefined,
		start_date: undefined,
		end_date: undefined,
		gr_tr_id: undefined,
	};
	trashBinSelected: TrashBinDto = new TrashBinDto();
	trashBinExpand: TrashBinDto = new TrashBinDto();
	keySelected: number[] = [];
	listItemSelected: TrashBinDto[] = [];

	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.trashBinStore.getAll(
			this.state.tr_name,
			this.props.isModal == undefined ? this.state.gr_tr_id : this.props.GroupTrashBinSelected!.gr_tr_id,
			this.state.deviceMAC,
			this.state.start_date,
			this.state.end_date,
			this.state.tr_type,
			undefined,
			undefined
		);
		this.setState({
			visibleModalCreateUpdate: false,
			visibleExportExcelSupplier: false,
			isLoadDone: true,
		});
	}
	async getAllLog() {
		await stores.trashBinStore.getAllTrashBinLog(
			this.trashBinExpand.tr_id,
			this.state.gr_tr_id,
			this.state.start_date,
			this.state.end_date,
			this.state.selectedField,
			this.state.sort,
			this.state.pageSizeLog,
			undefined
		);
		this.setState({ isLoadDone: !this.state.isLoadDone });
	}
	componentDidMount() {
		this.getAll();

	}
	handleSubmitSearch = async () => {
		await this.onChangePage(1, 10);
	};

	handleClearSearch = async () => {
		await this.setState({
			tr_name: undefined,
			deviceMAC: undefined,
			tr_type: undefined,
			rangeDatetime: undefined,
			start_date: undefined,
			end_date: undefined,
			gr_tr_id: undefined,
		});
		await this.getAll();
	};

	createOrUpdateModalOpen = async (input: TrashBinDto) => {
		if (input === undefined) {
			message.error(L('NotFound'));
			return;
		}
		this.trashBinSelected.init(input);
		await this.setState({ visibleModalCreateUpdate: true, expandedRowKey: undefined });
	};
	onCreateUpdateSuccess = async () => {
		this.onChangePage(1, this.state.pageSize);
	};

	onChangePageLog = async (page: number, pagesize?: number) => {
		if (pagesize !== undefined) {
			await this.setState({ pageSizeLog: pagesize! });
		}
		this.setState(
			{ skipCount: (page - 1) * this.state.pageSize, currentPageLog: page },
			async () => {
				this.getAllLog();
			}
		);
	};

	onChangePage = async (page: number, pagesize?: number) => {
		if (pagesize !== undefined) {
			await this.setState({ pageSize: pagesize! });
		}
		this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
			this.getAll();
		});
	};

	actionTable = async (trashBin: TrashBinDto, event: EventTable) => {
		let self = this;
		this.setState({ tr_id_selected: trashBin.tr_id });
		if (trashBin === undefined || trashBin.tr_id === undefined) {
			message.error('Không tìm thấy !');
			return;
		} else if (
			event === EventTable.Edit &&
			isGranted(AppConsts.Permission.Pages_Manager_General_Trashbin_Update)
		) {
			this.trashBinSelected.init(trashBin);
			await this.setState({ visibleModalCreateUpdate: true });
		} else if (event === EventTable.Delete) {
			this.trashBinSelected.init(trashBin);
			confirm({
				title: (
					<span>
						<span>{'Bạn có chắc muốn xoá trạm '}</span>
						<b>{this.trashBinSelected.tr_name}</b>?
					</span>
				),
				okText: 'Xác nhận',
				cancelText: 'Hủy',
				async onOk() {
					await stores.trashBinStore.delete(trashBin);
					await self.getAll();
					message.success('Xóa thành công !');
				},
				onCancel() { },
			});
		}
		this.setState({ isLoadDone: !this.state.isLoadDone });
	};

	rowSelection: TableRowSelection<TrashBinDto> = {
		onChange: (listKeyDictionaryType: React.Key[], listItem: TrashBinDto[]) => {
			this.listItemSelected = listItem;
			this.keySelected = this.listItemSelected.map((item) => item.tr_id);
			if (this.keySelected.length > 0) {
				this.setState({ visibleModalCreateUpdate: false });
			}
			this.setState({ isLoadDone: !this.state.isLoadDone });
		},
	};

	onRefreshData = () => {
		this.setState({ visibleImportExcelTrashBin: false });
		this.getAll();
	};

	shouldHideText = () => {
		const isChangeText = window.innerWidth < 768;
		return isChangeText;
	};
	handleExpand = async (expanded: boolean, record: TrashBinDto) => {
		if (expanded) {
			await this.setState({ pageSizeLog: 10, currentPageLog: 1 });
			this.setState({
				isLoadDone: true,
				visibleModalCreateUpdate: false,
				expandedRowKey: [record.tr_id],
				tr_id_selected: record.tr_id,
			});
			this.trashBinExpand = record;
			this.getAllLog();
			this.setState({ isLoadDone: false });
		} else {
			this.setState({ expandedRowKey: undefined, tr_id_selected: undefined });
		}
	};
	changeColumnSort = async (
		sort: SorterResult<TrashBinLogsDto> | SorterResult<TrashBinLogsDto>[]
	) => {
		await this.setState({
			selectedField: sort['columnKey'],
			sort:
				sort['order'] == undefined
					? undefined
					: sort['order'] == 'descend'
						? eSort.DES.num
						: eSort.ASC.num,
		});
		await this.getAllLog();
		this.setState({ isLoadDone: !this.state.isLoadDone });
	};

	handleChangeDate = async () => {
		let start_date = !!this.state.rangeDatetime
			? moment(this.state.rangeDatetime![0])
				.startOf(this.state.selectedOption as any)
				.toDate()
			: undefined;
		let end_date = !!this.state.rangeDatetime?.[1]
			? moment(this.state.rangeDatetime?.[1])
				.endOf(this.state.selectedOption as any)
				.toDate()
			: undefined;
		this.setState({ start_date: start_date, end_date: end_date });
	};
	customWeekStartEndFormat: DatePickerProps['format'] = (value) =>
		`${moment(value).startOf('week').format('DD/MM')} ~ ${moment(value)
			.endOf('week')
			.format('DD/MM')}`;
	searchName = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({ tr_name: e.target.value })
		this.debouncedSearch();
	}
	render() {
		let self = this;
		const {
			totalTrashBin,
			trashBinListResult,
			trashBinLogListResult,
			totalTrashBinLogs,
		} = stores.trashBinStore;
		const left = this.state.visibleModalCreateUpdate
			? cssColResponsiveSpan(24, 24, 12, 14, 14, 14)
			: cssCol(24);
		const right = this.state.visibleModalCreateUpdate
			? cssColResponsiveSpan(24, 24, 12, 10, 10, 10)
			: cssCol(0);
		let expandable: ExpandableConfig<TrashBinDto> = {
			expandedRowRender: (record) => (
				<Tabs defaultActiveKey={tabManager.tab_1}>
					<Tabs.TabPane tab={tabManager.tab_1} key={tabManager.tab_1}>
						<TrashBinLog
							pagination={{
								position: ['topRight'],
								pageSize: this.state.pageSizeLog,
								total: totalTrashBinLogs,
								current: this.state.currentPageLog,
								showTotal: (tot) => 'Tổng: ' + tot + '',
								showQuickJumper: true,
								showSizeChanger: true,
								pageSizeOptions: pageSizeOptions,
								onShowSizeChange(current: number, size: number) {
									self.onChangePageLog(current, size);
								},
								onChange: (page: number, pagesize?: number) => self.onChangePageLog(page, pagesize),
							}}
							changeColumnSort={this.changeColumnSort}
							trashBinLogs={trashBinLogListResult}
						/>
					</Tabs.TabPane>
					{(record.tr_type === eTrashType.CHAI_NHUA.num ||
						record.tr_type === eTrashType.NHUA_CUNG.num ||
						record.tr_type === eTrashType.NHUA_DEO.num) && (
							<Tabs.TabPane tab={tabManager.tab_2} key={tabManager.tab_2}>
								<TrashBinCreditLog
									pagination={{
										position: ['topRight'],
										pageSize: this.state.pageSizeLog,
										total: totalTrashBinLogs,
										current: this.state.currentPageLog,
										showTotal: (tot) => 'Tổng: ' + tot + '',
										showQuickJumper: true,
										showSizeChanger: true,
										pageSizeOptions: pageSizeOptions,
										onShowSizeChange(current: number, size: number) {
											self.onChangePageLog(current, size);
										},
										onChange: (page: number, pagesize?: number) =>
											self.onChangePageLog(page, pagesize),
									}}
									changeColumnSort={this.changeColumnSort}
									trashBinCreditLog={trashBinLogListResult}
								/>
							</Tabs.TabPane>
						)}
				</Tabs>
			),
			expandRowByClick: true,
			expandIconColumnIndex: -1,
			expandedRowKeys:
				this.state.visibleExportTrashBinModal || this.state.visibleModalCreateUpdate
					? []
					: this.state.expandedRowKey,
			onExpand: this.handleExpand,
		};
		let groupTrashBinText = '';
		if (!!this.state.gr_tr_id) {
			groupTrashBinText =
				'của nhóm ' + stores.sessionStore.getNameGroupTrashBin(this.state.gr_tr_id!);
			groupTrashBinText = groupTrashBinText.toUpperCase();
		}
		let dateRangeText = '';
		const { start_date, end_date } = this.state;
		if (start_date && end_date) {
			const type = this.state.selectedOption;
			if (type === 'date' || type === 'week') {
				dateRangeText =
					moment(start_date).format('DD/MM/YYYY') ===
						moment(end_date).subtract(7, 'hour').format('DD/MM/YYYY')
						? `TRONG NGÀY ${moment(start_date).format('DD/MM/YYYY')}`
						: `TỪ NGÀY ${moment(start_date).format('DD/MM/YYYY')} ĐẾN NGÀY ${moment(end_date)
							.subtract(7, 'hour')
							.format('DD/MM/YYYY')}`;
			} else if (type === 'month') {
				dateRangeText =
					moment(start_date).format('MM/YYYY') ===
						moment(end_date).subtract(7, 'hour').format('MM/YYYY')
						? `TRONG THÁNG ${moment(start_date).format('MM/YYYY')}`
						: `TỪ THÁNG ${moment(start_date).format('MM/YYYY')} ĐẾN THÁNG ${moment(end_date)
							.subtract(7, 'hour')
							.format('MM/YYYY')}`;
			} else if (type === 'year') {
				dateRangeText =
					moment(start_date).format('YYYY') === moment(end_date).subtract(7, 'hour').format('YYYY')
						? `TRONG NĂM ${moment(start_date).format('YYYY')}`
						: `TỪ NĂM ${moment(start_date).format('YYYY')} ĐẾN NĂM ${moment(end_date)
							.subtract(7, 'hour')
							.format('YYYY')}`;
			}
		}

		return (
			<Card>
				<Row gutter={[8, 8]} align="bottom">
					{
						this.props.isModal == undefined ?
							<>
								<Col {...cssColResponsiveSpan(24, 24, 24, 12, 12, 12)}>
									<h2>Thùng rác</h2>
								</Col>
								<Col {...cssColResponsiveSpan(24, 24, 24, 12, 12, 12)} style={{ display: 'flex', justifyContent: 'right' }}>
									<Space>
										<Button
											type="primary"
											icon={<BarChartOutlined />}
											onClick={() => this.setState({ visibleBarChartCarbonCredit: true })}
										>
											TK tín chỉ
										</Button>
										<Button
											type="primary"
											icon={<BarChartOutlined />}
											onClick={() => this.setState({ visibleBarChartTrashBinModal: true })}
										>
											Thống kê lượng rác
										</Button>
										{isGranted(AppConsts.Permission.Pages_Manager_General_Trashbin_Create) && (
											<Button
												title="Thêm mới"
												type="primary"
												icon={<PlusOutlined />}
												onClick={() => this.createOrUpdateModalOpen(new TrashBinDto())}
											>
												{this.shouldHideText() || 'Thêm mới'}
											</Button>
										)}
										<Button
											title="Xuất dữ liệu"
											type="primary"
											icon={<ExportOutlined />}
											onClick={() => this.setState({ visibleExportTrashBinModal: true })}
										>
											{this.shouldHideText() || 'Xuất dữ liệu'}
										</Button>
									</Space>
								</Col>
								<Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 24)}>
									<Row gutter={[8, 8]} align="bottom">
										<Col {...cssColResponsiveSpan(24, 12, 12, 3, 2, 2)}>
											<strong>Loại</strong>
											<Select
												onChange={async (value) => await this.setState({ selectedOption: value })}
												value={this.state.selectedOption}
												style={{ width: '100%' }}
											>
												<Select.Option value={eFormatPicker.date}>Ngày</Select.Option>
												<Select.Option value={eFormatPicker.week}>Tuần</Select.Option>
												<Select.Option value={eFormatPicker.month}>Tháng</Select.Option>
												<Select.Option value={eFormatPicker.year}>Năm</Select.Option>
											</Select>
										</Col>
										<Col {...cssColResponsiveSpan(24, 12, 12, 7, 6, 4)}>
											<strong>Khoảng thời gian quy đổi</strong>
											<RangePicker
												style={{ width: '100%' }}
												placeholder={
													this.state.selectedOption === 'date'
														? ['Từ ngày', 'Đến ngày']
														: this.state.selectedOption === 'month'
															? ['Từ tháng', 'Đến tháng']
															: this.state.selectedOption === 'week'
																? ['Từ tuần', 'Đến tuần']
																: ['Từ năm', 'Đến năm']
												}
												onChange={async (value) => {
													await this.setState({ rangeDatetime: value });
													this.handleChangeDate();
													this.handleSubmitSearch();
												}}
												picker={this.state.selectedOption as any}
												format={
													this.state.selectedOption === 'date'
														? 'DD/MM/YYYY'
														: this.state.selectedOption === 'month'
															? 'MM/YYYY'
															: this.state.selectedOption === 'week'
																? 'wo-YYYY'
																: 'YYYY'
												}
												value={this.state.rangeDatetime as any}
												allowEmpty={[false, true]}
												disabledDate={(current) => current > moment()}
											/>
										</Col>
										<Col {...cssColResponsiveSpan(24, 12, 12, 7, 8, 3)}>
											<strong>Nhóm thùng rác</strong>
											<SelectedGroupTrashBin
												onChangeGroupTrashBin={(value) => {
													this.setState({ gr_tr_id: value });
													this.handleSubmitSearch();
												}}
												getAll={this.handleSubmitSearch}
												groupTrashBinID={this.state.gr_tr_id}
											/>
										</Col>
										<Col {...cssColResponsiveSpan(24, 12, 12, 7, 8, 3)}>
											<strong>Tên trạm</strong>
											<Input
												allowClear
												onChange={async (e) => this.searchName(e)}
												placeholder={'Tên trạm...'}
												onPressEnter={this.handleSubmitSearch}
												value={this.state.tr_name}
											/>
										</Col>
										<Col {...cssColResponsiveSpan(24, 12, 12, 8, 8, 3)}>
											<strong>Địa chỉ MAC</strong>
											<Input
												allowClear
												onChange={async (e) => {
													await this.setState({ deviceMAC: e.target.value });
													await this.handleSubmitSearch();
												}}
												placeholder={'Địa chỉ MAC...'}
												value={this.state.deviceMAC}
											/>
										</Col>
										<Col {...cssColResponsiveSpan(24, 12, 12, 8, 8, 4)}>
											<strong>Loại rác</strong>
											<SelectEnumMulti
												onChangeEnum={async (value) => {
													await this.setState({ tr_type: value });
													this.handleSubmitSearch();
												}}
												eNum={eTrashType}
												enum_value={this.state.tr_type}
											></SelectEnumMulti>
										</Col>
										<Col {...cssColResponsiveSpan(24, 24, 12, 8, 8, 5)}>
											<Space>
												<Button
													type="primary"
													icon={<SearchOutlined />}
													title="Tìm kiếm"
													onClick={this.handleSubmitSearch}
												>
													Tìm kiếm
												</Button>
												{(!!this.state.rangeDatetime ||
													!!this.state.gr_tr_id ||
													!!this.state.tr_name ||
													!!this.state.deviceMAC ||
													this.state.tr_type != undefined) && (
														<Button
															danger
															title="Xoá tìm kiếm"
															icon={<DeleteOutlined />}
															onClick={this.handleClearSearch}
														>
															Xoá tìm kiếm
														</Button>
													)}
											</Space>
										</Col>
									</Row>
								</Col>
							</> : <></>}
				</Row>

				<Row>
					<Col {...left}>
						<TableTrashBin
							tr_id_selected={this.state.tr_id_selected}
							actionTable={this.actionTable}
							hasAction={this.keySelected.length > 0 ? false : true}
							trashListResult={trashBinListResult}
							expandable={expandable}
							onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
							isPrint={false}
							checkExpand={this.state.visibleModalCreateUpdate}
							pagination={{
								position: ['topRight'],
								pageSize: this.state.pageSize,
								total: totalTrashBin,
								current: this.state.currentPage,
								showTotal: (tot) => 'Tổng: ' + tot + '',
								showQuickJumper: true,
								showSizeChanger: true,
								pageSizeOptions: pageSizeOptions,
								onShowSizeChange(current: number, size: number) {
									self.onChangePage(current, size);
								},
								onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize),
							}}
						/>
					</Col>
					{this.state.visibleModalCreateUpdate && (
						<Col {...right}>
							<CreateOrUpdateTrashBin
								trashBinSelected={this.trashBinSelected}
								onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
								onCreateUpdateSuccess={() => {
									this.handleSubmitSearch();
									this.setState({ visibleModalCreateUpdate: false });
								}}
							/>
						</Col>
					)}
				</Row>
				<ModalExportTrashBin
					visible={this.state.visibleExportTrashBinModal}
					trashBinListResult={trashBinListResult}
					onCancel={() => {
						this.setState({ visibleExportTrashBinModal: false });
					}}
				/>
				<Modal
					centered
					visible={this.state.visibleImportExcelTrashBin}
					closable={true}
					maskClosable={false}
					onCancel={() => {
						this.setState({ visibleImportExcelTrashBin: false });
					}}
					footer={null}
					width={'60vw'}
					title={<strong>NHẬP DỮ LIỆU THÙNG RÁC</strong>}
				>
					{this.state.visibleImportExcelTrashBin && (
						<ImportSampleExcelDataTrashBin
							onCancel={() => this.setState({ visibleImportExcelTrashBin: false })}
							onRefreshData={this.onRefreshData}
						/>
					)}
				</Modal>

				<Modal
					centered
					visible={this.state.visibleBarChartTrashBinModal}
					onCancel={() => this.setState({ visibleBarChartTrashBinModal: false })}
					footer={null}
					width={'90vw'}
					title={
						<strong>
							THỐNG KÊ LƯỢNG RÁC {dateRangeText} {groupTrashBinText}
						</strong>
					}
				>
					<BarChartTrashBin trashBinListResult={trashBinListResult} />
				</Modal>
				<Modal
					centered
					visible={this.state.visibleBarChartCarbonCredit}
					onCancel={() => this.setState({ visibleBarChartCarbonCredit: false })}
					footer={null}
					width={'90vw'}
					title={
						<strong title="Chỉ áp dụng với những loại rác là nhựa" style={{ cursor: 'pointer' }}>
							THỐNG KÊ TÍN CHỈ CARBON VÀ NHỰA{dateRangeText} {groupTrashBinText}
						</strong>
					}
				>
					<BarChartCarbonCredit />
				</Modal>
			</Card>
		);
	}
}
