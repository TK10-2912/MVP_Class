import * as React from 'react';
import { Col, Row, Button, Card, Input, DatePicker, Select, Modal, Space } from 'antd';
import { stores } from '@stores/storeInitializer';
import { L, isGranted } from '@lib/abpUtility';
import { DeleteOutlined, ReconciliationOutlined, SearchOutlined } from '@ant-design/icons';
import AppConsts, { EventTable, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import {  eRefundReasonType, eRefundType, eSort } from '@src/lib/enumconst';
import SelectEnum from '@src/components/Manager/SelectEnum';
import moment from 'moment';
import { RefundDto } from '@src/services/services_autogen';
import TableRefundUser from './components/TableRefundUser';
import ModalExportRefundUser from './components/ModalExportRefundUser';
import SelectedGroupMachine from '@src/components/Manager/SelectedGroupMachine';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';
import SelectedBank from '@src/components/Manager/SelectedBank';
import ActionExport from '@src/components/ActionExport';
import { SorterResult } from 'antd/lib/table/interface';
import { eFormatPicker } from '@src/components/Manager/SearchHistoryReportUser';
import CreateRefundUser from './components/CreateRefundUser';

const { RangePicker } = DatePicker;
const { Option } = Select;
export default class RefundUser extends AppComponentBase {
	componentRef: any | null = null;

	state = {
		isLoadDone: true,
		visibleExportRefund: false,
		visibleUpdateRefund: false,
		visibleModalCreateUpdate: false,
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
		sort: undefined,
	};
	refundSelected: RefundDto = new RefundDto();
	selectedField: string;

	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.refundStore.getAll(this.state.ref_reason_type, this.state.ref_refund_type, this.state.ref_status, this.state.bi_code, this.state.ref_nameBank, this.state.ref_from, this.state.ref_to, this.state.gr_ma_id, this.state.ma_id_list, this.selectedField, this.state.sort, this.state.skipCount, this.state.pageSize);
		this.setState({ isLoadDone: true,visibleModalCreateUpdate: false });
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
		await this.handleSubmitSearch();
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
	changeColumnSort = async (sort: SorterResult<RefundDto> | SorterResult<RefundDto>[]) => {
		this.setState({ isLoadDone: false });
		this.selectedField = sort['field'];
		await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
		await this.getAll();
		this.setState({ isLoadDone: true });

	}
	render() {
		const self = this;
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
							<Space>
								<Button type='primary' icon={<ReconciliationOutlined />} title='Khi tạo hoàn tiền, phương thức hoàn tiền sẽ là NGÂN HÀNG' onClick={() => { this.setState({ visibleModalCreateUpdate: true }) }} >Tạo hoàn tiền</Button>
								<ActionExport
									nameFileExport={'Refund' + ' ' + moment().format('DD_MM_YYYY')}
									idPrint="Refund_user_print_id"
									isExcel={true}
									isWord={false}
									isPrint={false}
									isDestroy={false}
									componentRef={this.componentRef}
								/>
							</Space>
						</Col>

					}
				</Row>
				<Row align='bottom' gutter={[12, 12]}>
					<Col xs={24} sm={12} md={8} lg={6} xl={4}>
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
					<Col xs={24} sm={12} md={8} lg={6} xl={4}>
						<strong>Khoảng thời gian tạo hoàn trả</strong>
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
					<Col xs={24} sm={12} md={8} lg={6} xl={4}>
						<strong>Nhóm máy</strong>
						<SelectedGroupMachine 
							groupmachineId={this.state.gr_ma_id} 
							onChangeGroupMachine={async (value) => { 
								await this.setState({ gr_ma_id: value }); 
								this.handleSubmitSearch() 
							}} 
						/>
					</Col>
					<Col xs={24} sm={12} md={8} lg={6} xl={4}>
						<strong>Máy bán nước</strong>
						<SelectedMachineMultiple
							onChangeMachine={async (value) => {
								await this.setState({ ma_id_list: value });
								this.handleSubmitSearch();
							}} 
							groupMachineId={this.state.gr_ma_id} 
							listMachineId={this.state.ma_id_list} 
						/>
					</Col>
					<Col xs={24} sm={12} md={8} lg={6} xl={4}>
						<strong>{L('Mã đơn hàng')}</strong>
						<Input
							allowClear={true}
							onChange={async (e) => { 
								await this.setState({ 
									bi_code: e.target.value == "" ? undefined : e.target.value 
								}); 
								this.handleSubmitSearch() 
							}} 
							placeholder={L("Nhập tìm kiếm")}
							onPressEnter={this.handleSubmitSearch}
							value={this.state.bi_code}
						/>
					</Col>
					<Col xs={24} sm={12} md={8} lg={6} xl={4}>
						<strong>{L('Ngân hàng')}</strong>
						<SelectedBank 
							mode={undefined} 
							bankSelected={this.state.ref_nameBank} 
							onChangeBank={async (value: string) => { 
								await this.setState({ ref_nameBank: value }); 
								this.handleSubmitSearch() 
							}} 
						/>
					</Col>
					<Col xs={24} sm={12} md={8} lg={6} xl={4}>
						<strong>{L('Trạng thái hoàn tiền')}</strong>
						<Select
							allowClear
							showSearch
							style={{ width: "100%" }}
							placeholder="Chọn"
							optionFilterProp="children"
							onChange={async (value) => { 
								await this.setState({ ref_status: value }); 
								this.handleSubmitSearch() 
							}}
							value={this.state.ref_status}
						>
							<Option value="0">Chưa hoàn tiền</Option>
							<Option value="1">Không hợp lệ</Option>
							<Option value="2">Đã hoàn tiền</Option>
						</Select>
					</Col>
					<Col xs={24} sm={12} md={8} lg={6} xl={4}>
						<strong>Lý do hoàn tiền</strong>
						<SelectEnum
							enum_value={this.state.ref_reason_type}
							onChangeEnum={async (value) => {
								await this.setState({ 
									ref_reason_type: value != undefined ? value : undefined 
								});
								this.handleSubmitSearch();
							}}
							eNum={eRefundReasonType}
						/>
					</Col>
					<Col xs={24} sm={12} md={8} lg={6} xl={4}>
						<strong>Phương thức hoàn tiền</strong>
						<SelectEnum
							enum_value={this.state.ref_refund_type}
							onChangeEnum={async (value) => {
								await this.setState({ 
									ref_refund_type: value != undefined ? value : undefined 
								});
								this.handleSubmitSearch();
							}}
							eNum={eRefundType}
						/>
					</Col>
					<Col xs={24} sm={24} md={24} lg={24} xl={24} style={{ display: "flex", justifyContent: "start", alignItems: "center", marginTop: 8 }}>
						<Button 
							style={{ marginRight: "10px" }} 
							type="primary" 
							icon={<SearchOutlined />} 
							title='Tìm kiếm' 
							onClick={() => this.handleSubmitSearch()}
						>
							Tìm kiếm
						</Button>
						{
							(!!this.state.rangeDatetime || !!this.state.gr_ma_id || !!this.state.ma_id_list || !!this.state.bi_code || !!this.state.ref_nameBank || this.state.ref_refund_type !== undefined || this.state.ref_reason_type !== undefined || !!this.state.ref_status) &&
							<Button 
								danger 
								icon={<DeleteOutlined />} 
								title={"Xóa tìm kiếm"} 
								onClick={async () => { 
									await this.clearSearch(); 
									await this.handleSubmitSearch() 
								}}
							>
								{this.shouldChangeText() ? 'Xóa' : 'Xóa tìm kiếm'}
							</Button>
						}
					</Col>
				</Row>
				<Row style={{ marginTop: '10px' }}>
					<Col ref={this.setComponentRef} id='Refund_user_print_id' style={{ overflowY: "auto" }}>
						<TableRefundUser
							onCreateUpdateSuccess={this.onCreateUpdateSuccess}
							onCancel={() => this.setState({ visibleUpdateRefund: false })}
							checkExpand={this.state.visibleUpdateRefund}
							changeColumnSort={this.changeColumnSort}
							actionTable={this.actionTable}
							refundResult={refundListDto}
							hasAction={true}
							onChangePage={this.onChangePage}
							pagination={{
								position: ['topRight'],
								pageSize: this.state.pageSize,
								total: totalRefund,
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
					<Modal
						visible={this.state.visibleModalCreateUpdate}
						centered
						cancelButtonProps={{ style: { display: "none" } }}
						onCancel={() => { this.setState({ visibleMachineDetail: false }) }}
						footer={null}
						title={<h2>Tạo hoàn tiền</h2>}
						width={"45%"}
						closable={false}
						maskClosable={true}
					>
						<CreateRefundUser onCreateUpdateSuccess={() => this.onCreateUpdateSuccess()} onCancel={() => this.setState({ visibleModalCreateUpdate: false })} />
					</Modal>
					{/* {this.state.visibleUpdateRefund &&
						<Col {...right} style={{ overflowY: "auto" }}>
							<UpdateRefundUser
								onCreateUpdateSuccess={this.onCreateUpdateSuccess}
								onCancel={() => this.setState({ visibleUpdateRefund: false })}
								refundSelected={this.refundSelected}
							/>

						</Col>
					} */}
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