import { DeleteOutlined, ExportOutlined, SearchOutlined } from '@ant-design/icons';
import SelectEnum from '@src/components/Manager/SelectEnum';
import AppConsts, { EventTable, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import { eBank, ePaymentStatus, eSort } from '@src/lib/enumconst';
import ModalViewStatusMachineUser from '@src/scenes/Monitor/MachineStatusMonitoring/componentUser/ModalViewStatusMachineUser';
import { MachineDto, PaymentBankDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, DatePicker, Input, Row, Select, Space, message } from 'antd';
import * as React from 'react';
import ModalExportPaymentBankUser from './ModalExportPaymentBankUser';
import TablePaymentBankUser from './TablePaymentBankUser';
import moment from 'moment';
import SelectedGroupMachine from '@src/components/Manager/SelectedGroupMachine';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';
import { SorterResult } from 'antd/lib/table/interface';
import SelectedBank from '@src/components/Manager/SelectedBank';
import { isGranted } from '@src/lib/abpUtility';

const { RangePicker } = DatePicker;

export interface IProps {
	bi_code?: string;
}

export const eFormatPicker = {
	date: "date",
	month: "month",
	year: "year",
}

export default class BankingPaymentForUser extends React.Component<IProps> {
	state = {
		isLoadDone: true,
		bi_code: undefined,
		ma_id: undefined,
		pa_ba_created_at: undefined,
		pa_ba_created_from: undefined,
		pa_ba_created_to: undefined,
		skipCount: 0,
		maxResultCount: 10,
		viewDetail: false,
		visibleExportExcelImporting: false,
		pageSize: 10,
		currentPage: 1,
		paymentSt: undefined,
		bankID: undefined,
		selectedOption: "date",
		groupMachineId: undefined,
		listMachineId: undefined,
		rangeDatetime: undefined,
		sort: undefined,
	}
	machineSelected: MachineDto = new MachineDto();
	importingSelected: PaymentBankDto = new PaymentBankDto();
	selectedField: string;
	async componentDidMount() {
		stores.billingStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined)
		stores.machineStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined, undefined)
		await this.getAll();
	}

	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.paymentBank.getAll(
			this.props.bi_code != undefined ? this.props.bi_code : this.state.bi_code,
			this.state.groupMachineId,
			this.state.listMachineId,
			this.state.paymentSt,
			this.state.bankID,
			this.state.pa_ba_created_at,
			this.state.pa_ba_created_from,
			this.state.pa_ba_created_to,
			this.selectedField,
			this.state.sort,
			this.state.skipCount,
			this.state.pageSize,
		)
		this.setState({ isLoadDone: true });
	}

	handleSubmitSearch = async () => {
		await this.setDatetime();
		this.onChangePage(1, this.state.pageSize);
	}

	onChangePage = async (page: number, pagesize?: number) => {
		if (pagesize !== undefined) {
			await this.setState({ pageSize: pagesize! });
		}
		await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page, maxResultCount: pagesize }, async () => {
			this.getAll();
		})
	}

	createOrUpdateModalOpen = async (input: PaymentBankDto) => {
		if (input !== undefined && input !== null) {
			this.importingSelected.init(input);
			await this.setState({ viewDetail: true, isLoadDone: true });
		}
	}

	actionTable = (importing: PaymentBankDto, event: EventTable) => {
		if (importing == undefined || importing.us_id == undefined) {
			message.error("Không tìm thấy !");
			return;
		}
		if (event == EventTable.View || event == EventTable.RowDoubleClick) {
			this.createOrUpdateModalOpen(importing);
		}
	}

	onCreateUpdateSuccess = () => {
		this.setState({ isLoadDone: false });
		this.getAll();
		this.setState({ isLoadDone: true, visibleModalCreateUpdate: false, })
	}

	onChangeMachine = async (value: number) => {
		this.setState({ isLoadDone: false });
		await this.setState({ ma_id: value });
		this.setState({ isLoadDone: true });
	}

	setDatetime = () => {
		this.setState({ pa_ba_created_from: !!this.state.rangeDatetime && moment(this.state.rangeDatetime?.[0]).startOf(this.state.selectedOption as any).toDate() })
		this.setState({
			pa_ba_created_to: !!this.state.rangeDatetime?.[1] ?
				moment(this.state.rangeDatetime?.[1]).endOf(this.state.selectedOption as any).toDate() :
				moment().endOf(this.state.selectedOption as any).toDate()
		})
	}

	clearSearch() {
		this.setState({
			bi_code: undefined,
			paymentSt: undefined,
			bankID: undefined,
			ma_id: undefined,
			pa_ba_created_at: undefined,
			pa_ba_created_from: undefined,
			pa_ba_created_to: undefined,
			rangeDatetime: undefined,
			groupMachineId: undefined,
			listMachineId: undefined,
		})
		this.getAll();
	}

	shouldChangeText = () => {
		const isMdOrLg = window.innerWidth < 800;
		return !isMdOrLg;
	}
	changeColumnSort = async (sort: SorterResult<PaymentBankDto> | SorterResult<PaymentBankDto>[]) => {
		this.setState({ isLoadDone: false });
		this.selectedField = sort["columnKey"];
		await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
		await this.getAll();
		this.setState({ isLoadDone: true });

	}
	render() {
		let self = this;
		const { paymentBankListResult, totalPaymentBank } = stores.paymentBank;
		return (
			<Card>
				<Row gutter={[8, 8]} align='bottom'>
					{this.props.bi_code != undefined ?
						<Col span={24} style={{ textAlign: "end" }}>
							{isGranted(AppConsts.Permission.Pages_Statistic_BillingOfPayment_Export) &&
								<Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcelImporting: true })}>Xuất dữ liệu</Button>
							}
						</Col>
						:
						<>
							<Col {...cssColResponsiveSpan(24, 12, 8, 3, 3, 2)}>
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
							<Col {...cssColResponsiveSpan(24, 12, 8, 7, 5, 5)}>
								<strong>Khoảng thời gian thanh toán</strong>
								<RangePicker
									style={{ width: "100%" }}
									placeholder={this.state.selectedOption === "date" ? ['Từ ngày', 'Đến ngày'] : (this.state.selectedOption === "month" ? ['Từ tháng', 'Đến tháng'] : ['Từ năm', 'Đến năm'])}
									onChange={async value => { await this.setState({ rangeDatetime: value }); this.handleSubmitSearch() }}
									picker={this.state.selectedOption as any}
									format={this.state.selectedOption === "date" ? 'DD/MM/YYYY' : (this.state.selectedOption === "month" ? 'MM/YYYY' : 'YYYY')}
									value={this.state.rangeDatetime as any}
									allowEmpty={[false, true]}
									disabledDate={current => current > moment()}
								/>
							</Col>
							<Col {...cssColResponsiveSpan(24, 12, 8, 6, 5, 5)}>
								<strong>Nhóm máy</strong>
								<SelectedGroupMachine groupmachineId={this.state.groupMachineId}
									onChangeGroupMachine={async (value) => { await this.setState({ groupMachineId: value }); this.onChangePage(1, this.state.pageSize) }}
								/>
							</Col>
							<Col {...cssColResponsiveSpan(24, 12, 8, 8, 6, 5)}>
								<strong>Máy bán nước</strong>
								<SelectedMachineMultiple onChangeMachine={(value) => { this.setState({ listMachineId: value }); this.onChangePage(1, this.state.pageSize) }} groupMachineId={this.state.groupMachineId} listMachineId={this.state.listMachineId} />
							</Col>
							<Col {...cssColResponsiveSpan(24, 12, 8, 8, 3, 3)}>
								<strong>Mã đơn hàng</strong>
								<Input onPressEnter={() => this.onChangePage(1, this.state.pageSize)} allowClear placeholder='Mã đơn hàng' value={this.state.bi_code} onChange={async (e) => { await this.setState({ bi_code: e.target.value == "" ? undefined : e.target.value }); await this.onChangePage(1, this.state.pageSize) }}></Input>
							</Col>
							<Col {...cssColResponsiveSpan(24, 12, 8, 8, 4, 4)}>
								<strong>Trạng thái thanh toán</strong>
								<SelectEnum placeholder='Chọn' eNum={ePaymentStatus} onChangeEnum={(value) => { this.setState({ paymentSt: value }); this.onChangePage(1, this.state.pageSize) }} enum_value={this.state.paymentSt}></SelectEnum>
							</Col>
							<Col {...cssColResponsiveSpan(24, 8, 8, 8, 5, 4)}>
								<strong>Ngân hàng</strong>
								<SelectEnum eNum={eBank} enum_value={this.state.bankID} onChangeEnum={(value: number) => { this.setState({ bankID: value }); this.handleSubmitSearch() }} />
							</Col>
							<Col  {...cssColResponsiveSpan(14, 10, 10, 8, 9, 10)}>
								<Space>
									<Button type="primary" icon={<SearchOutlined />} title="Tìm kiếm" onClick={() => this.handleSubmitSearch()} >{this.shouldChangeText() ? 'Tìm kiếm' : 'Tìm'}</Button>
									{(this.state.bi_code !== undefined || this.state.paymentSt !== undefined || this.state.bankID !== undefined || this.state.ma_id !== undefined || this.state.rangeDatetime !== undefined || this.state.groupMachineId !== undefined || this.state.listMachineId !== undefined) &&
										<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >{this.shouldChangeText() ? 'Xóa tìm kiếm' : 'Xóa'}</Button>
									}
								</Space>
							</Col>
							<Col className='ant-col-xs-no-maxwidth' {...cssColResponsiveSpan(10, 6, 6, 8, 10, 10)} style={{ textAlign: "right" }}>
								<Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcelImporting: true })}>Xuất dữ liệu</Button>
							</Col>
						</>
					}
				</Row>
				<Row>
					<Col span={24} style={{ overflowY: "auto" }}>
						<TablePaymentBankUser
							importingListResult={paymentBankListResult}
							totalPaymentBank={this.state.pageSize}
							changeColumnSort={this.changeColumnSort}
							isPrinted={false}
							actionTable={this.actionTable}
							isLoadDone={this.state.isLoadDone}
							pagination={{
								position: ['topRight'],
								pageSize: this.state.pageSize,
								total: totalPaymentBank,
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
				</Row>
				{this.state.viewDetail &&
					<ModalViewStatusMachineUser machineSelected={this.machineSelected} visible={this.state.viewDetail} onCancel={() => this.setState({ visibleMachine: false })}></ModalViewStatusMachineUser>
				}
				{this.state.visibleExportExcelImporting &&
					<ModalExportPaymentBankUser
						pageSize={this.state.pageSize}
						currentPage={this.state.currentPage}
						paymentBankListResult={paymentBankListResult}
						visible={this.state.visibleExportExcelImporting}
						onCancel={() => this.setState({ visibleExportExcelImporting: false })}
					/>
				}
			</Card>
		)
	}
}