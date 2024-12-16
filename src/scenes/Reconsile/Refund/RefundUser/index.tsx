import * as React from 'react';
import { Col, Row, Button, Card, Input, DatePicker, Select } from 'antd';
import { stores } from '@stores/storeInitializer';
import { L, isGranted } from '@lib/abpUtility';
import { DeleteOutlined, ExportOutlined, SearchOutlined } from '@ant-design/icons';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan } from '@src/lib/appconst';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { ePaymentMethod, eRefundReasonType } from '@src/lib/enumconst';
import SelectEnum from '@src/components/Manager/SelectEnum';
import moment from 'moment';
import { RefundDto } from '@src/services/services_autogen';
import TableRefundUser from './components/TableRefundUser';
import ModalExportRefundUser from './components/ModalExportRefundUser';
import UpdateRefundUser from './components/UpdateRefundUser';
import SelectedGroupMachine from '@src/components/Manager/SelectedGroupMachine';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';
import SelectedBank from '@src/components/Manager/SelectedBank';
import ActionExport from '@src/components/ActionExport';

const { RangePicker } = DatePicker;
const { Option } = Select;
export const eFormatPicker = {
	date: "date",
	month: "month",
	year: "year",
}
export default class RefundUser extends AppComponentBase {
	componentRef: any | null = null;

	state = {
		isLoadDone: true,
		visibleExportRefund: false,
		visibleUpdateRefund: false,
		skipCount: 0,
		currentPage: 1,
		pageSize: 10,
		ref_reason_type: undefined,
		bi_code: undefined,
		ref_nameBank: undefined,
		ref_from: undefined,
		ref_to: undefined,
		selectedOption: "date",
		rangeDatetime: undefined,
		ref_refund_type: undefined,
		gr_ma_id: undefined,
		ma_id_list: undefined,
		ref_status: undefined,
	};
	refundSelected: RefundDto = new RefundDto();

	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.refundStore.getAll(this.state.ref_reason_type, this.state.ref_refund_type, this.state.ref_status, this.state.bi_code, this.state.ref_nameBank, this.state.ref_from, this.state.ref_to, this.state.gr_ma_id, this.state.ma_id_list, this.state.skipCount, this.state.pageSize);
		this.setState({ isLoadDone: true });
	}
	async componentDidMount() {
		const urlParams = new URLSearchParams(window.location.search);
		const bi_code = urlParams.get('bi_code');
		if (!!bi_code) {
			await this.setState({ bi_code: bi_code });
		}
		await this.getAll();

	}
	setComponentRef = (ref) => {
		this.setState({ isLoadDone: false });
		this.componentRef = ref;
		this.setState({ isLoadDone: true });
	}
	handleSubmitSearch = async () => {
		let start_date = !!this.state.rangeDatetime ? moment(this.state.rangeDatetime![0]).startOf(this.state.selectedOption as any).toDate() : undefined;
		let end_date = !!this.state.rangeDatetime?.[1] ?
			moment(this.state.rangeDatetime?.[1]).endOf(this.state.selectedOption as any).toDate() :
			undefined;
		this.setState({ ref_from: start_date, ref_to: end_date })
		this.onChangePage(1, 10);
	}


	onCreateUpdateSuccess = async () => {
		await this.getAll();
		this.setState({ visibleUpdateRefund: false });
	}

	onChangePage = async (page: number, pagesize?: number) => {
		if (pagesize !== undefined) {
			await this.setState({ pageSize: pagesize! });
		}
		this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
			this.getAll();
		})
	}


	clearSearch = async () => {
		await this.setState({
			bi_code: undefined,
			ref_reason_type: undefined,
			ref_nameBank: undefined,
			rangeDatetime: undefined,
			ref_refund_type: undefined,
			gr_ma_id: undefined,
			ma_id_list: undefined,
			ref_status: undefined,

		})
		await this.getAll();
	}

	actionTable = (item: RefundDto, event: EventTable, checked?: boolean) => {
		let self = this;
		if (event === EventTable.Edit || event === EventTable.RowDoubleClick) {
			this.refundSelected.init(item);
			this.setState({ visibleUpdateRefund: true });
		}
	}
	shouldChangeText = () => {
		const isChangeText = window.innerWidth >= 576 && window.innerWidth <= 992;
		return !!isChangeText;
	}

	render() {
		const self = this;
		const left = this.state.visibleUpdateRefund ? cssColResponsiveSpan(24, 24, 12, 12, 12, 12) : cssCol(24);
		const right = this.state.visibleUpdateRefund ? cssColResponsiveSpan(24, 24, 12, 12, 12, 12) : cssCol(0);
		const { refundListDto, totalRefund } = stores.refundStore;

		return (
			<Card>
				<Row align='bottom' gutter={[8, 8]}>
					<Col {...cssColResponsiveSpan(24, 12, 12, 12, 12, 12)}>
						<h2>Hoàn tiền</h2>
					</Col>
					{
						isGranted(AppConsts.Permission.Pages_Reconcile_Refund_Export) &&
						<Col {...cssColResponsiveSpan(24, 12, 12, 12, 12, 12)} style={{ display: "flex", justifyContent: "end" }}>
							<ActionExport
								nameFileExport={'Refund' + ' ' + moment().format('DD_MM_YYYY')}
								idPrint="Refund_user_print_id"
								isExcel={true}
								isWord={false}
								isPrint={false}
								isDestroy={false}
								componentRef={this.componentRef}
							/>
						</Col>

					}
				</Row>
				<Row align='bottom' gutter={[8, 8]}>
					<Col {...cssColResponsiveSpan(24, 12, 8, 2, 2, 2)}>
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
					<Col {...cssColResponsiveSpan(24, 12, 16, 5, 5, 5)}>
						<strong>Khoảng thời gian tạo hoàn trả</strong>
						<RangePicker
							style={{ width: "100%" }}
							placeholder={this.state.selectedOption === "date" ? ['Từ ngày', 'Đến ngày'] : (this.state.selectedOption === "month" ? ['Từ tháng', 'Đến tháng'] : ['Từ năm', 'Đến năm'])}
							onChange={async value => {
								await this.setState({ rangeDatetime: value });
							}}
							picker={this.state.selectedOption as any}
							format={this.state.selectedOption === "date" ? 'DD/MM/YYYY' : (this.state.selectedOption === "month" ? 'MM/YYYY' : 'YYYY')}
							value={this.state.rangeDatetime as any}
							allowEmpty={[false, true]}
							disabledDate={current => current > moment()}
						/>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 16, 5, 5, 5)}>
						<strong>Nhóm máy</strong>
						<SelectedGroupMachine groupmachineId={this.state.gr_ma_id} onChangeGroupMachine={async (value) => await this.setState({ gr_ma_id: value })} />
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)}>
						<strong>Máy bán nước</strong>
						<SelectedMachineMultiple
							onChangeMachine={(value) => {
								this.setState({ ma_id_list: value });
							}} groupMachineId={this.state.gr_ma_id} listMachineId={this.state.ma_id_list} />
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 16, 5, 5, 5)}>

						<strong>{L('Mã đơn hàng')}</strong>
						<Input
							allowClear={true}
							onChange={async (e) => { this.setState({ bi_code: e.target.value == "" ? undefined : e.target.value }) }} placeholder={L("Nhập tìm kiếm")}
							onPressEnter={this.handleSubmitSearch}
							value={this.state.bi_code}
						/>
					</Col>
				</Row>
				<Row align='bottom' gutter={[8, 8]}>

					<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)}>
						<strong>{L('Ngân hàng')}</strong>
						<SelectedBank mode={undefined} bankSelected={this.state.ref_nameBank} onChangeBank={(value: string) => { this.setState({ ref_nameBank: value }); this.handleSubmitSearch() }} />
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 16, 5, 5, 5)}>

						<strong>{L('Trạng thái hoàn tiền')}</strong><br />
						<Select
							allowClear
							showSearch
							style={{ width: "100%" }}
							placeholder="Chọn"
							optionFilterProp="children"
							onChange={async (value) => { this.setState({ ref_status: value }); this.handleSubmitSearch() }}
							value={this.state.ref_status}
						>
							<Option value="0">Chưa hoàn tiền</Option>
							<Option value="1">Đã hoàn tiền</Option>
						</Select>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)}>
						<strong>Lý do hoàn trả</strong><br />
						<SelectEnum
							enum_value={this.state.ref_reason_type}
							onChangeEnum={async (value) => {
								await this.setState({ ref_reason_type: value != undefined ? value : undefined });
								await this.getAll();
							}}
							eNum={eRefundReasonType}>
						</SelectEnum>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)}>
						<strong>Phương thức thanh toán đơn hàng</strong><br />
						<SelectEnum
							enum_value={this.state.ref_refund_type}
							onChangeEnum={async (value) => {
								await this.setState({ ref_refund_type: value != undefined ? value : undefined });
								await this.getAll();
							}}
							eNum={ePaymentMethod}>
						</SelectEnum>
					</Col>

					<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)} style={{ display: "flex", flexWrap: "wrap", padding: 0, justifyContent: "start" }}>
						<Col>
							<Button style={{ marginRight: "10px" }} type="primary" icon={<SearchOutlined />} title='Tìm kiếm' onClick={() => this.handleSubmitSearch()} >Tìm kiếm</Button>
							{
								(!!this.state.rangeDatetime || !!this.state.gr_ma_id || !!this.state.ma_id_list || !!this.state.bi_code || !!this.state.ref_nameBank || this.state.ref_refund_type !== undefined || this.state.ref_reason_type !== undefined || !!this.state.ref_status) &&
								<Button danger icon={<DeleteOutlined />} title={"Xóa tìm kiếm"} onClick={async () => await this.clearSearch()} >{this.shouldChangeText() ? 'Xóa' : 'Xóa tìm kiếm'}</Button>
							}
						</Col>
					</Col>
				</Row>
				<Row style={{ marginTop: '10px' }}>
					<Col ref={this.setComponentRef} id='Refund_user_print_id' {...left} style={{ overflowY: "auto" }}>
						<TableRefundUser
							actionTable={this.actionTable}
							refundResult={refundListDto}
							hasAction={true}
							pagination={{
								pageSize: this.state.pageSize,
								total: totalRefund,
								current: this.state.currentPage,
								showTotal: (tot) => "Tổng" + ": " + tot + "",
								showQuickJumper: true,
								showSizeChanger: true,
								pageSizeOptions: ['10', '20', '50', '100', '200', '300', '400', '500'],
								onShowSizeChange(current: number, size: number) {
									self.onChangePage(current, size)
								},
								onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
							}}
						/>
					</Col>
					{this.state.visibleUpdateRefund &&
						<Col {...right} style={{ overflowY: "auto" }}>
							<UpdateRefundUser
								onCreateUpdateSuccess={this.onCreateUpdateSuccess}
								onCancel={() => this.setState({ visibleUpdateRefund: false })}
								refundSelected={this.refundSelected}
							/>

						</Col>
					}
				</Row>

				<ModalExportRefundUser
					refundList={refundListDto}
					visible={this.state.visibleExportRefund}
					onCancel={() => this.setState({ visibleExportRefund: false })}
				/>

			</Card >
		)
	}
}