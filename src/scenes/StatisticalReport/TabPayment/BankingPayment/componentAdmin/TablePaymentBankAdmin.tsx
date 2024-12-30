import AppConsts, { EventTable, cssColResponsiveSpan } from '@src/lib/appconst';
import { colorOfePaymentStatus, ePaymentStatus, valueOfeBank, valueOfePaymentStatus } from '@src/lib/enumconst';
import { BillingDto, ItemBillingEntity, MachineDto, PaymentBankDto, RefundDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Col, Modal, Row, Table, Tag, message } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import { Link } from 'react-router-dom';
import ModalTableBillingViewAdmin from './ModalTableBillingViewAdmin';
import { SorterResult } from 'antd/lib/table/interface';

export interface IProps {
	actionTable?: (item: PaymentBankDto, event: EventTable) => void;
	pagination: TablePaginationConfig | false;
	isLoadDone?: boolean;
	paymentBankingListResult: PaymentBankDto[];
	isPrinted?: boolean;
	openDetailMachine?: (ma_id: number) => void;
	changeColumnSort?: (fieldSort: SorterResult<PaymentBankDto> | SorterResult<PaymentBankDto>[]) => void;
	totalPaymentBank?: number;
	isOpenModalBilling?: boolean;
}

export default class TablePaymentBankAdmin extends React.Component<IProps> {
	state = {
		im_id_selected: undefined,
		visibleModalBillProduct: false,
		isLoading: false,
		page: 10,
		currentPage: 1,
	}
	listItemProduct: ItemBillingEntity[] = [];
	billingSelected: BillingDto = new BillingDto();
	machineSelected: MachineDto;
	refundSelectd: RefundDto;

	onAction = (item: PaymentBankDto, action: EventTable) => {
		this.setState({ im_id_selected: item.pa_ba_id });
		const { actionTable } = this.props;
		if (actionTable !== undefined) {
			actionTable(item, action);
		}
	}
	openDetailMachine = (ma_id: number) => {
		if (!!this.props.openDetailMachine) {
			this.props.openDetailMachine(ma_id);
		}
	}
	checkChuoi = (text: string) => {
		const string = text.split("-");
		return string[string.length - 1]
	}
	render() {
		const { pagination, paymentBankingListResult, isPrinted, isOpenModalBilling } = this.props;
		const columns: ColumnsType<PaymentBankDto> = [
			...(isOpenModalBilling == true) ? [] :
				[{ title: "STT", key: "stt_importing_index", width: 50, render: (text: string, item: PaymentBankDto, index: number) => <div>{pagination !== false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> }],
			{
				title: "Mã giao dịch", key: "im_code", className: "hoverCell", width: "12%",
				onCell: (record) => {
					return {
						onClick: () => {
							if (this.checkChuoi(record.bi_code!) !== "rf") {
								this.listItemProduct = (!!record.billing && !!record.billing.entities_id_arr) ? record.billing.entities_id_arr : [];
								this.billingSelected.init(record.billing);
								this.setState({ visibleModalBillProduct: true });
							}
							else {
								message.warning("Đây là giao dịch nạp tiền RFID không phải mua hàng!")
							}
						}
					}
				},
				render: (text: string, item: PaymentBankDto) => <div title={"Chi tiết hoá đơn"}>{item.bi_code}</div>
			},
			{
				title: ('Nhóm máy'), width: 120, key: 'su_name', render: (text: string, item: PaymentBankDto) => <div>
					{this.props.isPrinted ? stores.sessionStore.getNameGroupUseMaId(item.ma_id) :
						<div title="Chi tiết nhóm máy">
							<Link target='_blank' to={"/general/machine/?gr_id=" + (stores.sessionStore.getIDGroupUseMaId(item?.ma_id))}>
								{stores.sessionStore.displayGroupMachineUseMaIdTable(item.ma_id)}
							</Link></div>
					}
				</div>
			},
			{
				title: 'Máy bán nước', key: 'ma_name', width: 200,
				render: (text: string, item: PaymentBankDto) => <div style={this.props.isPrinted ? {} : {
					textOverflow: "ellipsis",
					overflow: "hidden",
					display: "-webkit-box",
					WebkitLineClamp: 2,
					WebkitBoxOrient: "vertical"
				}}>
					{this.props.actionTable ?
						<div title={`Chi tiết máy ${stores.sessionStore.getNameMachines(item.ma_id)}`}>
							<Link target="blank" to={"/general/machine/?machine=" + stores.sessionStore.getCodeMachines(item.ma_id)} onDoubleClick={() => this.onAction(item, EventTable.View)}>
								<div>{stores.sessionStore.getCodeMachines(item.ma_id)}</div>
								<div style={{ color: 'gray', fontSize: 11 }}>{stores.sessionStore.getNameMachines(item.ma_id)}</div>
							</Link>
						</div> :
						<div>
							<div>{stores.sessionStore.getCodeMachines(item?.ma_id)}</div>
							<div>{stores.sessionStore.getNameMachines(item?.ma_id)}</div>
						</div>
					}
				</div>
			},
			{
				title: "Số tiền",
				width: 120,
				key: "pa_ba_money",
				sorter: (a, b) => a.pa_ba_money - b.pa_ba_money,
				dataIndex: "pa_ba_money",
				render: (text: string, item: PaymentBankDto) => (
					<div>{AppConsts.formatNumber(item.pa_ba_money)}</div>
				),
			},

			{
				title: "Trạng thái", width: 120, key: "im_code", render: (text: string, item: PaymentBankDto) => {
					if (isPrinted === false) {
						return (
							<>
								{item.pa_ba_status === 0 &&
									<Tag color={colorOfePaymentStatus(item.pa_ba_status)} style={{ color: "black" }}>{valueOfePaymentStatus(item.pa_ba_status)}</Tag>
								}
								{item.pa_ba_status === 1 &&
									<Tag color={colorOfePaymentStatus(item.pa_ba_status)}>{valueOfePaymentStatus(item.pa_ba_status)}</Tag>
								}
								{item.pa_ba_status === 2 &&
									<Tag color={colorOfePaymentStatus(item.pa_ba_status)}>{valueOfePaymentStatus(item.pa_ba_status)}</Tag>
								}
								{item.pa_ba_status === 3 &&
									<Tag color={colorOfePaymentStatus(item.pa_ba_status)}>{valueOfePaymentStatus(item.pa_ba_status)}</Tag>
								}
							</>
						)
					} else {
						return (
							<>
								{item.pa_ba_status === 0 &&
									<div color={colorOfePaymentStatus(item.pa_ba_status)} style={{ color: "black" }}>{valueOfePaymentStatus(item.pa_ba_status)}</div>
								}
								{item.pa_ba_status === 1 &&
									<div color={colorOfePaymentStatus(item.pa_ba_status)}>{valueOfePaymentStatus(item.pa_ba_status)}</div>
								}
								{item.pa_ba_status === 2 &&
									<div color={colorOfePaymentStatus(item.pa_ba_status)}>{valueOfePaymentStatus(item.pa_ba_status)}</div>
								}
								{item.pa_ba_status === 3 &&
									<div color={colorOfePaymentStatus(item.pa_ba_status)}>{valueOfePaymentStatus(item.pa_ba_status)}</div>
								}
							</>
						)
					}
				}
			},
			{ title: "Ngân hàng", width: 150, key: "im_code", render: (text: string, item: PaymentBankDto) => <div>{valueOfeBank(item.pa_ba_bankId)}</div> },
			// {title: "Người thanh toán", key: "id_us_index", render: (text: number, item: PaymentBankDto) => <div> {stores.sessionStore.getUserNameById(item.us_id)} </div> },
			{ title: "Thời gian giao dịch", width: 150, dataIndex: 'pa_ba_payment_at', key: "pa_ba_payment_at", sorter: true, render: (text: string, item: PaymentBankDto) => <div> {moment(item.pa_ba_payment_at).format("DD/MM/YYYY - HH:mm:ss")}</div> },
		];
		return (
			<>
				<Table
					// sticky
					scroll={this.props.isPrinted ? { x: undefined, y: undefined } : { x: 1200, y: 500 }}
					className='centerTable'
					loading={!this.props.isLoadDone}
					columns={columns}
					size={'middle'}
					bordered={true}
					dataSource={paymentBankingListResult.length > 0 ? paymentBankingListResult : []}
					pagination={this.props.pagination}
					rowClassName={(record, index) => (this.state.im_id_selected === record?.pa_ba_id) ? "bg-click" : "bg-white"}
					rowKey={record => "importing_table" + JSON.stringify(record)}
					onChange={(a, b, sort: SorterResult<PaymentBankDto> | SorterResult<PaymentBankDto>[]) => {
						if (!!this.props.changeColumnSort) {
							this.props.changeColumnSort(sort);
						}
					}}
					footer={() => ((isOpenModalBilling == true) ? <></> :
						<Row style={{ fontSize: 14 }}>
							<Col  {...cssColResponsiveSpan(24, 8, 8, 8, 8, 8)} style={{ border: '1px solid #e4e1e1', alignContent: "center" }}>
								<span>
									Tổng số giao dịch:{' '}
									<strong style={{ color: '#1DA57A' }}>
										{paymentBankingListResult?.length || 0}
									</strong>
								</span>
								<br />
							</Col>
							<Col  {...cssColResponsiveSpan(24, 8, 8, 8, 8, 8)} style={{ border: '1px solid #e4e1e1' }}>
								<span>
									Tổng giao dịch <b style={{ color: "green" }}>thành công</b>:{' '}
									<strong style={{ color: '#1DA57A' }}>
										{
											paymentBankingListResult.filter(PaymentBankDto => PaymentBankDto.pa_ba_status === 1)?.length || 0
										}
									</strong>
								</span>
								<br />
								<span>
									Tổng giao dịch <b style={{ color: "orange" }}>khởi tạo</b>:{' '}
									<strong style={{ color: '#1DA57A' }}>
										{
											paymentBankingListResult.filter(PaymentBankDto => PaymentBankDto.pa_ba_status === 0)?.length || 0
										}
									</strong>
								</span>
							</Col>
							<Col  {...cssColResponsiveSpan(24, 8, 8, 8, 8, 8)} style={{ border: '1px solid #e4e1e1' }}>
								<span>
									Tổng số tiền ở trạng thái <b style={{ color: "green" }}>thành công</b>:{' '}
									<strong style={{ color: '#1DA57A' }}>
										{
											AppConsts.formatNumber(
												paymentBankingListResult
													.filter(paymentBankDto => paymentBankDto.pa_ba_status === 1)
													.reduce((sum, paymentBankDto) => sum + (paymentBankDto.pa_ba_money || 0), 0)
											)} đ
									</strong>
								</span>
								<br />
								<span>
									Tổng số tiền ở trạng thái <b style={{ color: "orange" }}>khởi tạo</b>:{' '}
									<strong style={{ color: '#1DA57A' }}>
										{
											AppConsts.formatNumber(
												paymentBankingListResult
													.filter(paymentBankDto => paymentBankDto.pa_ba_status === 0)
													.reduce((sum, paymentBankDto) => sum + (paymentBankDto.pa_ba_money || 0), 0)
											)} đ
									</strong>
								</span>
								<br />
							</Col>

						</Row>
					)}
				/>
				<ModalTableBillingViewAdmin
					billSelected={this.billingSelected}
					refundSelected={this.refundSelectd}
					visibleModalBillProduct={this.state.visibleModalBillProduct}
					onCancel={() => this.setState({ visibleModalBillProduct: false })}
					listItem={this.listItemProduct}
				/>

			</>
		)
	}
}
