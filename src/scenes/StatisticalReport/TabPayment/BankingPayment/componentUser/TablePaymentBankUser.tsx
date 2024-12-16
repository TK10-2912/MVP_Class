import AppConsts, { EventTable } from '@src/lib/appconst';
import { colorOfePaymentStatus, valueOfeBank, valueOfePaymentStatus } from '@src/lib/enumconst';
import { BillingDto, ItemBillingEntity, PaymentBankDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Table, Tag, message } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import { Link } from 'react-router-dom';
import ModalTableBillingViewUser from './ModalTableBillingViewUser';
import { SorterResult } from 'antd/lib/table/interface';

export interface IProps {
	actionTable?: (item: PaymentBankDto, event: EventTable) => void;
	pagination: TablePaginationConfig | false;
	isLoadDone?: boolean;
	importingListResult: PaymentBankDto[];
	isPrinted?: boolean;
	changeColumnSort?: (fieldSort: SorterResult<PaymentBankDto> | SorterResult<PaymentBankDto>[]) => void;
}

export default class TablePaymentBankUser extends React.Component<IProps> {
	state = {
		im_id_selected: undefined,
		visibleModalBillProduct: false,
	}
	listItemProduct: ItemBillingEntity[] = [];
	billingSelected: BillingDto = new BillingDto();
	onAction = (item: PaymentBankDto, action: EventTable) => {
		this.setState({ im_id_selected: item.pa_ba_id });
		const { actionTable } = this.props;
		if (actionTable !== undefined) {
			actionTable(item, action);
		}
	}
	checkChuoi = (text: string) => {
		const string = text.split("-");
		return string[string.length - 1]
	}

	render() {
		const { pagination, actionTable, importingListResult, isPrinted } = this.props;

		const columns: ColumnsType<PaymentBankDto> = [
			{ title: "STT", key: "stt_importing_index", width: 50, render: (text: string, item: PaymentBankDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
			{
				title: "Mã giao dịch", key: "im_code", className: "hoverCell",

				onCell: (record) => {
					 
						return {
							onClick: () => {
								if (this.checkChuoi(record.bi_code!) !== "rf"){

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
				render: (text: string, item: PaymentBankDto) => <div>{item.bi_code}</div>
			},
			{
				title: ('Nhóm máy'), width: "8%", key: 'su_name', render: (text: string, item: PaymentBankDto) => <div>
					{this.props.isPrinted ? stores.sessionStore.getNameGroupUseMaId(item.ma_id) :
						<Link target='_blank' to={"/general/machine/?gr_id=" + (stores.sessionStore.getIDGroupUseMaId(item.ma_id))}>
							{stores.sessionStore.getNameGroupUseMaId(item.ma_id)}
						</Link>
					}
				</div>
			},
			{
				title: 'Mã máy', key: 'gr_name', render: (text: string, item: PaymentBankDto) => <div>
					{this.props.isPrinted ? stores.sessionStore.getCodeMachines(item.ma_id) :
						<Link target='_blank' to={"/general/machine/?machine=" + stores.sessionStore.getCodeMachines(item.ma_id)} >
							{stores.sessionStore.getCodeMachines(item.ma_id)}
						</Link>
					}
				</div>
			},
			{
				title: 'Tên máy', key: 'ma_name', width: 150, 
				render: (text: string, item: PaymentBankDto) => <div>
					{this.props.actionTable != undefined ?
						<Link target="blank" to={"/general/machine/?machine=" + stores.sessionStore.getCodeMachines(item.ma_id)} onDoubleClick={() => this.onAction(item, EventTable.View)}>
							{stores.sessionStore.getNameMachines(item.ma_id)}
						</Link> :
						<div>
							{stores.sessionStore.getNameMachines(item.ma_id)}
						</div>
					}
				</div>
			},
		
			{ title: "Số tiền", key: "", render: (text: string, item: PaymentBankDto) => <div>{AppConsts.formatNumber(item.pa_ba_money)}</div> },
			{
				title: "Trạng thái", key: "im_code", render: (text: string, item: PaymentBankDto) => {
					if (isPrinted == false) {
						return (
							<>
								{item.pa_ba_status == 0 &&
									<Tag color={colorOfePaymentStatus(item.pa_ba_status)}>{valueOfePaymentStatus(item.pa_ba_status)}</Tag>
								}
								{item.pa_ba_status == 1 &&
									<Tag color={colorOfePaymentStatus(item.pa_ba_status)}>{valueOfePaymentStatus(item.pa_ba_status)}</Tag>
								}
								{item.pa_ba_status == 2 &&
									<Tag color={colorOfePaymentStatus(item.pa_ba_status)}>{valueOfePaymentStatus(item.pa_ba_status)}</Tag>
								}
								{item.pa_ba_status == 3 &&
									<Tag color={colorOfePaymentStatus(item.pa_ba_status)}>{valueOfePaymentStatus(item.pa_ba_status)}</Tag>
								}
							</>
						)
					} else {
						return (
							<>
								{item.pa_ba_status == 0 &&
									<div color={colorOfePaymentStatus(item.pa_ba_status)}>{valueOfePaymentStatus(item.pa_ba_status)}</div>
								}
								{item.pa_ba_status == 1 &&
									<div color={colorOfePaymentStatus(item.pa_ba_status)}>{valueOfePaymentStatus(item.pa_ba_status)}</div>
								}
								{item.pa_ba_status == 2 &&
									<div color={colorOfePaymentStatus(item.pa_ba_status)}>{valueOfePaymentStatus(item.pa_ba_status)}</div>
								}
								{item.pa_ba_status == 3 &&
									<div color={colorOfePaymentStatus(item.pa_ba_status)}>{valueOfePaymentStatus(item.pa_ba_status)}</div>
								}
							</>
						)
					}
				}
			},
			{ title: "Ngân hàng", key: "im_code", render: (text: string, item: PaymentBankDto) => <div>{valueOfeBank(item.pa_ba_bankId)}</div> },
			// { title: "Người thanh toán", key: "id_us_index", render: (text: number, item: PaymentBankDto) => <div> {stores.sessionStore.getUserNameById(item.us_id)} </div> },
			{ title: "Thời gian giao dịch",dataIndex: 'pa_ba_payment_at', key: "pa_ba_payment_at",sorter: true, render: (text: string, item: PaymentBankDto) => <div> {moment(item.pa_ba_payment_at).format("DD/MM/YYYY - HH:mm:ss")}</div> },

		];

		return (
			<>
				<Table
					className='centerTable'
					loading={!this.props.isLoadDone}
					scroll={this.props.isPrinted ? { x: undefined, y: undefined } : { x: 600, y: 500 }}
					columns={columns}
					size={'middle'}
					bordered={true}
					locale={{ "emptyText": "Không có dữ liệu" }}
					dataSource={importingListResult.length > 0 ? importingListResult : []}
					pagination={this.props.pagination}
					rowClassName={(record, index) => (this.state.im_id_selected === record.pa_ba_id) ? "bg-click" : "bg-white"}
					rowKey={record => "importing_table" + JSON.stringify(record)}
					onChange={(a, b, sort: SorterResult<PaymentBankDto> | SorterResult<PaymentBankDto>[]) => {
                        if (!!this.props.changeColumnSort) {
                            this.props.changeColumnSort(sort);
                        }
                    }}
				/>
				<ModalTableBillingViewUser billSelected={this.billingSelected}
					visibleModalBillProduct={this.state.visibleModalBillProduct}
					onCancel={() => this.setState({ visibleModalBillProduct: false })}
					listItem={this.listItemProduct}
				/></>

		)
	}
}
