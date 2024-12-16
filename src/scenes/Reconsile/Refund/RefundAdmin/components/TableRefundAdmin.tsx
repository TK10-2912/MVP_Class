import * as React from 'react';
import { EditOutlined, EyeOutlined, StopOutlined } from '@ant-design/icons';
import { L, isGranted } from '@lib/abpUtility';
import { Button, Col, Modal, Row, Space, Table, Tabs, Tag, message } from 'antd';
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';
import { BillingDto, BillMethod, ERefundStatus, RefundDto } from '@src/services/services_autogen';
import AppConsts, { cssColResponsiveSpan, EventTable } from '@src/lib/appconst';
import { stores } from '@src/stores/storeInitializer';
import { eBillMethod, eRefundStatus, valueOfeBillMethod, valueOfeRefundReasonType } from '@src/lib/enumconst';
import { Link } from 'react-router-dom';
import ModalTableBillingViewAdmin from '@src/scenes/StatisticalReport/TabPayment/BankingPayment/componentAdmin/ModalTableBillingViewAdmin';
import { SorterResult } from 'antd/lib/table/interface';
import UpdateRefundAdmin from './UpdateRefundAdmin';
import DetailRefundAdmin from './DetailRefundAdmin';

const { confirm } = Modal;
export interface IProps {
	actionTable?: (item: RefundDto, event: EventTable, checked?) => void;
	refundResult: RefundDto[],
	billingResult?: BillingDto[],
	pagination: TablePaginationConfig | false;
	hasAction?: boolean;
	doId?: number;
	export?: boolean;
	activateOrDeActive?: (item: RefundDto) => void;
	changeColumnSort?: (fieldSort: SorterResult<RefundDto> | SorterResult<RefundDto>[]) => void;
	checkExpand?: boolean;
	onCancel?: () => void;
	onCreateUpdateSuccess?: () => void;
	isPrinted?: boolean;
	onChangePage?: (page: number, pagesize?: number) => void;
	parent?:string;
}

export const tabManager = {
	tab_1: L("Chi tiết hoàn tiền"),
}
export default class TableRefundAdmin extends React.Component<IProps> {
	state = {
		isLoadDone: false,
		rf_id_selected: undefined,
		visibleModalBillProduct: false,
		expandedRowKey: [],
		visibleUpdateRefund: false,
		pagesize: 10,
		currentPage: 1,
		isSetError: false,
	};
	billingSelected: BillingDto = new BillingDto;
	refundSelected: RefundDto = new RefundDto();

	onAction = async (item: RefundDto, action: EventTable, checked?: boolean) => {
		this.setState({ rf_id_selected: item.ref_id });
		const { hasAction, actionTable } = this.props;
		if (hasAction != undefined && hasAction === true && actionTable !== undefined) {
			actionTable(item, action, checked);
		}
	}
	activateOrDeActive = (item: RefundDto) => {
		if (!!this.props.activateOrDeActive) {
			this.props.activateOrDeActive(item);
		}
	}
	onCancelExpland = () => {
		this.setState({ expandedRowKey: [] });
	}
	handleExpand = (expanded, record) => {
		if (expanded) {
			this.onCancel();
			this.refundSelected.init(record);
			this.setState({ expandedRowKey: record.billing !== undefined ? [record.ref_id] : undefined, rf_id_selected: record.ref_id });
		} else {
			this.setState({ rf_id_selected: undefined, expandedRowKey: undefined });
		}
	};

	onCancel = () => {
		if (!!this.props.onCancel) {
			this.props.onCancel();
		}
		this.setState({ expandedRowKey: [] });
	}
	getFile(fi_id: number) {
		let fi_id_modified = encodeURI(fi_id + "");
		return AppConsts.remoteServiceBaseUrl + "download/file?path=" + fi_id_modified;
	}
	onCreateUpdateSuccess = () => {
		if (!!this.props.onCreateUpdateSuccess) {
			this.props.onCreateUpdateSuccess();
		}
	}
	getTotalMoneyAndBill = (re_type: ERefundStatus, type: string) => {
		const { refundListDto } = stores.refundStore;
		const {parent,refundResult}=this.props
		switch (type) {
			case "bills": {
				const total =parent=="today"?refundResult.filter(item => item.ref_status == re_type)
				: refundListDto.filter(item => item.ref_status == re_type);
				return total.length;
			}
			case "totalMoney": {
				const result = parent=="today"
				?refundResult.filter(item => item.ref_status == re_type)
				:refundListDto.filter(item => item.ref_status == re_type);
				const totalMoney = result.reduce((totalMoney, record) => (
					totalMoney + record.ref_money
				), 0)
				return totalMoney;
			}
		}
	}
	getTotalRefundMoney = (re_type: BillMethod, ref_status: ERefundStatus) => {
		const { refundListDto } = stores.refundStore;
		const {parent,refundResult}=this.props
		const refFilter = parent=="today"
		? refundResult.filter(item => item.ref_refund_type == re_type && item.ref_status == ref_status)
		:refundListDto.filter(item => item.ref_refund_type == re_type && item.ref_status == ref_status);
		const totalMoney = refFilter.reduce((totalMoney, record) => (
			totalMoney + record.ref_money), 0)
		return AppConsts.formatNumber(totalMoney);
	}
	onChangePage = (page: number, pagesize?: number) => {
		if (!!this.props.onChangePage) {
			this.setState({ pagesize: pagesize, currentPage: page });
			this.props.onChangePage(page, pagesize);
		}
	};
	onShowSizeChange = (current, size) => {
		this.onChangePage(current, size);
	};

	handleConfirmSetError = async (item: RefundDto) => {
		let self = this;
		var message = 
		confirm({
			title: 'Thông báo',
			content: <span>Bạn có chắc chắn muốn chuyển trạng thái hoàn tiền đơn hàng thành <span style={{color:'#fa8c16'}}>không hợp lệ</span> không? Vui lòng kiểm tra kỹ trước khi xác nhận!</span>,
			cancelText: 'Hủy',
			okText:"Xác nhận",
			async onOk() {
				self.onAction(item!, EventTable.SetErrorStatus);
				self.onCreateUpdateSuccess();
			},
		});
	}
	render() {
		const { hasAction, pagination } = this.props;
		const { refundListDto } = stores.refundStore;
		let action: ColumnGroupType<RefundDto> = {
			title: 'Chức năng', children: [], key: 'action_Supplier_index', fixed: "right", width: 100,
			render: (_: string, item: RefundDto) => (
				<>
					{isGranted(AppConsts.Permission.Pages_Reconcile_Refund_Update) &&
						<Space>
							<Button
								type="primary" icon={item.ref_refund_at != null || item.ref_status === eRefundStatus.ERROR.num ? <EyeOutlined title={L('Xem chi tiết')}/> : <EditOutlined title={L('Hoàn tiền đơn hàng')}/>} 
								size='small'
								onClick={() => this.onAction(item!, EventTable.Edit)}
							/>
							{item.ref_status === eRefundStatus.NOTREFUND.num &&
								<Button
									type="primary"
									danger
									icon={<StopOutlined />}
									title={'Không hợp lệ'}
									size='small'
									onClick={(e) => {this.handleConfirmSetError(item); e.stopPropagation()}}
								/>
							}
						</Space>
					}
				</>
			)
		};
		const columns: ColumnsType<RefundDto> = [
			{ title: L('STT'), fixed: "left", width: 50, key: 'stt', render: (_: string, item: RefundDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
			{
				title: "Mã đơn hàng",
				width: "7%",
				key: "im_code",
				className: "hoverCell",
				onCell: (record) => {
					return {
						onClick: (e) => {
							e.stopPropagation();
							this.billingSelected = record.billing;
							this.refundSelected = record;
							this.setState({ visibleModalBillProduct: true })
						}
					}
				},
				render: (_: string, item: RefundDto) => (
					<b style={{ margin: 0, fontSize: 12 }} title="Chi tiết đơn hàng">{item.bi_code}</b>
				),
			},
			{ title: L('Phương thức hoàn tiền'), dataIndex: 'ref_refund_type', key: 'su_desc', render: (_: string, item: RefundDto) => <b> {valueOfeBillMethod(item.ref_refund_type)}</b> },
			{
				title: L('Nhóm máy'), width: 90, dataIndex: 'rf_code', key: 'rf_code', render: (_: string, item: RefundDto) => <div style={{ width: "70px" }}>
					{this.props.isPrinted ? stores.sessionStore.getNameGroupUseMaId(item.ma_id) :

						< Link onClick={(e) => e.stopPropagation()} target='_blank' to={"/general/machine/?gr_id=" + stores.sessionStore.getIDGroupUseMaId(item.ma_id)} onDoubleClick={() => this.onAction(item, EventTable.View)}>
							<div title='Chi tiết nhóm máy'>
								{stores.sessionStore.displayGroupMachineUseMaIdTable(item.ma_id)}
							</div>
						</Link>
					}
				</div >
			},
			{
				title: 'Máy bán nước', width: 150, key: "ma_may", render: (_: string, item: RefundDto) => <div>
					{this.props.isPrinted ? stores.sessionStore.getCodeMachines(item.ma_id) :
						<div title={`Chi tiết máy ${stores.sessionStore.getNameMachines(item.ma_id)}`}>
							<Link to={"/general/machine/?machine=" + stores.sessionStore.getCodeMachines(item.ma_id)} target="_blank">
								<div>{stores.sessionStore.getMachineCode(item.ma_id)}</div>
								<div style={{ fontSize: 11, color: 'gray' }}>{stores.sessionStore.getNameMachines(item.ma_id)}</div>
							</Link>
						</div>
					}
				</div>
			},
			{
				title: L('Người vận hành'), dataIndex: 'us_id_owner', key: 'su_desc', render: (_: string, item: RefundDto) => <div>
					{stores.sessionStore.getUserNameById(item.machine.us_id_operator)}
				</div>
			},
			{ title: L('Số tiền hoàn trả'), dataIndex: 'ref_money', key: 'ref_money', sorter: true, render: (_: string, item: RefundDto) => <b> {AppConsts.formatNumber(item.ref_money)}</b> },
			{
				title: L('Trạng thái hoàn tiền'), dataIndex: 'ref_refund_at', key: 'su_desc', render: (_: string, item: RefundDto) => <div>
					{hasAction == true ?
						<>
							{item.ref_status === eRefundStatus.REFUNDED.num ? <Tag color='success'>{eRefundStatus.REFUNDED.name}</Tag> : ""}
							{item.ref_status === eRefundStatus.ERROR.num ? <Tag color='warning'>{eRefundStatus.ERROR.name}</Tag> : ""}
							{item.ref_status === eRefundStatus.NOTREFUND.num ? <Tag color='error'>{eRefundStatus.NOTREFUND.name}</Tag> : ""}
						</>
						:
						<>
							{item.ref_status === eRefundStatus.REFUNDED.num && eRefundStatus.REFUNDED.name}
							{item.ref_status === eRefundStatus.ERROR.num && eRefundStatus.ERROR.name}
							{item.ref_status === eRefundStatus.NOTREFUND.num && eRefundStatus.NOTREFUND.name}
						</>
					}
				</div>
			},
			{ title: L('Lý do hoàn tiền'), dataIndex: 'ref_reason_type', key: 'su_desc', render: (_: string, item: RefundDto) => <div> {valueOfeRefundReasonType(item.ref_reason_type)}</div> },
			{ title: L('Ngày tạo hoàn trả'), sorter: true, dataIndex: 'ref_created_at', key: 'ref_created_at', render: (_: string, item: RefundDto) => <b style={{ fontSize: 12 }}> {moment(item.ref_created_at).format("DD/MM/YYYY - HH:mm:ss")}</b> },
			{ title: L('Ngày hoàn trả'), sorter: true, dataIndex: 'ref_refund_at', key: 'ref_refund_at', render: (_: string, item: RefundDto) => <b style={{ fontSize: 12 }}> {item.ref_refund_at != null ? moment(item.ref_refund_at).format("DD/MM/YYYY - HH:mm:ss") : ""}</b> },
		];
		if (hasAction != undefined && hasAction === true) {
			columns.push(action);
		}
		return (
			<>
				<Table
					scroll={hasAction == true ? { x: 1700, y: 600 } : { x: undefined }}
					className='centerTable'
					style={{ width: "100%" }}
					expandable={
						 !this.props.hasAction
							? {}
							: {
								expandedRowRender: (record) => (
									<Tabs defaultActiveKey={tabManager.tab_1}>
										<Tabs.TabPane tab={tabManager.tab_1} key={tabManager.tab_1}>
											{
												record.ref_status !== eRefundStatus.NOTREFUND.num ?
													<DetailRefundAdmin billingSelected={record.billing} refundSelected={record} />
													:
													<UpdateRefundAdmin
														billingSelected={record.billing}
														onCancelExpand={this.onCancelExpland}
														onCreateUpdateSuccess={this.onCreateUpdateSuccess}
														refundSelected={record}
													/>
											}
										</Tabs.TabPane>
									</Tabs>
								),
								expandRowByClick: true,
								expandIconColumnIndex: -1,
								expandedRowKeys: this.props.checkExpand == true ? [] : this.state.expandedRowKey,
								onExpand: (expand, record) => {
									if (record.billing === undefined) {
										this.setState({ expandedRowKey: [] });
										message.warning("Đơn hàng đã bị xóa");
										return;
									}
									else {
										this.handleExpand(expand, record);
									}
								}
							}
					}
					loading={this.state.isLoadDone}
					rowClassName={(record) => `pointHover ${(this.state.rf_id_selected === record.ref_id) ? "bg-lightGreen" : "bg-white"}`}
					size={'middle'}
					bordered={true}
					
					columns={columns}
					dataSource={this.props.refundResult.length > 0 ? this.props.refundResult : refundListDto}
					pagination={this.props.pagination}
					onChange={(_a, _b, sort: SorterResult<RefundDto> | SorterResult<RefundDto>[]) => {
						if (!!this.props.changeColumnSort) {
							this.props.changeColumnSort(sort);
						}
					}}
					rowKey={record => record.ref_id}
					footer={
						() =>
							<Row style={{ marginTop: "8px", fontSize: 14 }} id='TableRefundAdminID'>
								<Col {...cssColResponsiveSpan(24, 24, 8, 8, 8, 8)} style={{ border: '1px solid #e4e1e1', padding: 15, }}>
									<span><strong style={{ color: '#52c41a' }}>Đã hoàn tiền</strong></span>
									<br />
									<span>Số đơn hàng: <strong style={{ color: '#1DA57A' }}>{AppConsts.formatNumber(this.getTotalMoneyAndBill(eRefundStatus.REFUNDED.num, "bills"))}</strong></span>
									<br />
									<span>Tổng số tiền mặt: <strong style={{ color: '#1DA57A' }}>{this.getTotalRefundMoney(eBillMethod.TIEN_MAT.num, eRefundStatus.REFUNDED.num)}đ</strong></span>
									<br />
									<span>Tổng số tiền ngân hàng: <strong style={{ color: '#1DA57A' }}>{this.getTotalRefundMoney(eBillMethod.MA_QR.num, eRefundStatus.REFUNDED.num)}đ</strong></span>
									<br />
									<span>Tổng số tiền RFID: <strong style={{ color: '#1DA57A' }}>{this.getTotalRefundMoney(eBillMethod.RFID.num, eRefundStatus.REFUNDED.num)}đ</strong></span>
								</Col>
								<Col {...cssColResponsiveSpan(24, 24, 8, 8, 8, 8)} style={{ border: '1px solid #e4e1e1', padding: 15, }}>
									<span><strong style={{ color: '#f5222d' }}>Chưa hoàn tiền</strong></span>
									<br />
									<span>Số đơn hàng: <strong style={{ color: '#1DA57A' }}>{AppConsts.formatNumber(this.getTotalMoneyAndBill(0, "bills"))}</strong></span>
									<br />
									<span>Tổng số tiền mặt: <strong style={{ color: '#1DA57A' }}>{this.getTotalRefundMoney(eBillMethod.TIEN_MAT.num, eRefundStatus.NOTREFUND.num)}đ</strong></span>
									<br />
									<span>Tổng số tiền ngân hàng: <strong style={{ color: '#1DA57A' }}>{this.getTotalRefundMoney(eBillMethod.MA_QR.num, eRefundStatus.NOTREFUND.num)}đ</strong></span>
									<br />
									<span>Tổng số tiền RFID: <strong style={{ color: '#1DA57A' }}>{this.getTotalRefundMoney(eBillMethod.RFID.num, eRefundStatus.NOTREFUND.num)}đ</strong></span>
								</Col>
								<Col {...cssColResponsiveSpan(24, 24, 8, 8, 8, 8)} style={{ border: '1px solid #e4e1e1', padding: 15, }}>
									<span><strong style={{ color: '#fa8c16' }}>Không hợp lệ</strong></span>
									<br />
									<span>Số đơn hàng: <strong style={{ color: '#1DA57A' }}>{AppConsts.formatNumber(this.getTotalMoneyAndBill(1, "bills"))}</strong></span>
									<br />
									<span>Tổng số tiền mặt: <strong style={{ color: '#1DA57A' }}>{this.getTotalRefundMoney(eBillMethod.TIEN_MAT.num, eRefundStatus.ERROR.num)}đ</strong></span>
									<br />
									<span>Tổng số tiền ngân hàng: <strong style={{ color: '#1DA57A' }}>{this.getTotalRefundMoney(eBillMethod.MA_QR.num, eRefundStatus.ERROR.num)}đ</strong></span>
									<br />
									<span>Tổng số tiền RFID: <strong style={{ color: '#1DA57A' }}>{this.getTotalRefundMoney(eBillMethod.RFID.num, eRefundStatus.ERROR.num)}đ</strong></span>
								</Col>
							</Row>
					}
				/>

				<ModalTableBillingViewAdmin
					billSelected={this.billingSelected}
					refundSelected={this.refundSelected}
					visibleModalBillProduct={this.state.visibleModalBillProduct}
					onCancel={() => this.setState({ visibleModalBillProduct: false })}
					listItem={this.billingSelected?.entities_id_arr} />
			</>

		)
	}
}