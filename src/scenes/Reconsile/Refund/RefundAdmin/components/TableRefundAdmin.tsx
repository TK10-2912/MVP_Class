import * as React from 'react';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { L, isGranted } from '@lib/abpUtility';
import { Button, Image, Space, Table, Tag } from 'antd';
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';
import { BillingDto, RefundDto } from '@src/services/services_autogen';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { stores } from '@src/stores/storeInitializer';
import { valueOfePaymentMethod, valueOfeRefundReasonType } from '@src/lib/enumconst';
import { Link } from 'react-router-dom';
import ModalTableBillingViewAdmin from '@src/scenes/StatisticalReport/TabPayment/BankingPayment/componentAdmin/ModalTableBillingViewAdmin';

export interface IProps {
	actionTable?: (item: RefundDto, event: EventTable, checked?) => void;
	refundResult: RefundDto[],
	pagination: TablePaginationConfig | false;
	hasAction?: boolean;
	doId?: number;
	export?: boolean;
	activateOrDeActive?: (item: RefundDto) => void;
}
export default class TableRefundAdmin extends React.Component<IProps> {
	state = {
		isLoadDone: false,
		rf_id_selected: undefined,
		visibleModalBillProduct: false,
	};
	billingSelected: BillingDto = new BillingDto();
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
	getFile(fi_id: number) {
		let fi_id_modified = encodeURI(fi_id + "");
		return AppConsts.remoteServiceBaseUrl + "download/file?path=" + fi_id_modified;
	}
	render() {
		const { refundResult, pagination, hasAction } = this.props;
		let action: ColumnGroupType<RefundDto> = {
			title: 'Chức năng', children: [], key: 'action_Supplier_index', fixed: "right", className: "no-print center", width: 100,
			render: (text: string, item: RefundDto) => (
				<Space>
					{isGranted(AppConsts.Permission.Pages_Reconcile_Refund_Update) &&
						<Button
							type="primary" icon={item.ref_refund_at != null ? <EyeOutlined /> : <EditOutlined />} title={L('Hoàn tiền đơn hàng')}
							size='small'
							onClick={() => this.onAction(item!, EventTable.Edit)}
						></Button>
					}
				</Space>
			)
		};
		const columns: ColumnsType<RefundDto> = [
			{ title: L('STT'), key: 'stt', width: 50, render: (text: string, item: RefundDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
			{
				title: "Mã đơn hàng", key: "im_code", className: "hoverCell", width: 150,
				onCell: (record) => {
					return {
						onClick: async () => {
							await stores.billingStore.getAllByAdmin(undefined, record.bi_code, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
							const { billListResult } = stores.billingStore;
							this.billingSelected = billListResult[0];
							this.setState({ visibleModalBillProduct: true });
						}
					}
				},
				render: (text: string, item: RefundDto) => <div>{item.bi_code}</div>
			},
			{
				title: L('Mã máy'), dataIndex: 'rf_code', key: 'rf_code', width: 150, render: (text: string, item: RefundDto) => <div>
					<Link to={"/general/machine/?machine=" + stores.sessionStore.getMachineCode(item.ma_id)} onDoubleClick={() => this.onAction(item, EventTable.View)}>
						{stores.sessionStore.getMachineCode(item.ma_id)}
					</Link>
				</div>
			},
			{
				title: L('Người sở hữu'), dataIndex: 'us_id_owner', key: 'su_desc', width: 150, render: (text: string, item: RefundDto) => <div>
					<Link to={"/general/machine/?us_id_list=" + (item.us_id_owner)} onDoubleClick={() => this.onAction(item, EventTable.View)} >
						{stores.sessionStore.getUserNameById(item.us_id_owner)}
					</Link>
				</div>
			},
			{ title: L('Ảnh giao dịch'), dataIndex: 'ref_reason_type', key: 'su_desc', width: 120, render: (text: string, item: RefundDto) => <div>{item.fi_id_list != undefined && item.fi_id_list!.length > 0 ? <Image src={(this.getFile(item.fi_id_list[0].id))} height={100} width={100}></Image> : <Image src={process.env.PUBLIC_URL + "/image/no_image.jpg"} height={100} width={100} />}</div> },
			{ title: L('Lý do hoàn tiền'), dataIndex: 'ref_reason_type', key: 'su_desc', width: 120, render: (text: string, item: RefundDto) => <div> {valueOfeRefundReasonType(item.ref_reason_type)}</div> },
			{ title: L('Ngân hàng'), dataIndex: 'ref_namebank', key: 'su_desc', width: 120, render: (text: string, item: RefundDto) => <div> {item.ref_namebank}</div> },
			{ title: L('Phương thức thanh toán'), dataIndex: 'ref_refund_type', width: 120, key: 'su_desc', render: (text: string, item: RefundDto) => <div> {valueOfePaymentMethod(item.ref_refund_type)}</div> },
			{ title: L('Trạng thái hoàn tiền'), dataIndex: 'ref_refund_at', key: 'su_desc', render: (text: string, item: RefundDto) => <div> {(item.ref_refund_at != null ? <Tag color='green'>Đã hoàn tiền</Tag> : <Tag color='red'>Chưa hoàn tiền</Tag>)}</div> },
			{ title: L('Số tài khoản'), dataIndex: 'ref_nameAccountBank', key: 'su_desc', width: 150, render: (text: string, item: RefundDto) => <div> {item.ref_codebank}</div> },
			{ title: L('Số tiền hoàn trả'), dataIndex: 'ref_reason_type', key: 'su_desc', render: (text: string, item: RefundDto) => <div> {AppConsts.formatNumber(item.ref_money)}</div> },
			{ title: L('Ngày tạo hoàn trả'), dataIndex: 'rf_created_at', key: 'rf_created_at', render: (text: string, item: RefundDto) => <div> {moment(item.ref_created_at).format("DD/MM/YYYY - HH:mm:ss")}</div> },
			{ title: L('Ngày hoàn trả'), dataIndex: 'rf_money_current', key: 'rf_money_current', render: (text: string, item: RefundDto) => <div> {item.ref_refund_at != null ? moment(item.ref_refund_at).format("DD/MM/YYYY - HH:mm:ss") : ""}</div> },
		];
		if (hasAction != undefined && hasAction === true) {
			columns.push(action);
		}
		return (
			<>
				<Table
					scroll={(hasAction != undefined && hasAction == true) ? { x: 2000, y: 600 } : { x: undefined }}
					className='centerTable'
					loading={this.state.isLoadDone}
					rowClassName={(record, index) => (this.state.rf_id_selected === record.ref_id) ? "bg-click" : "bg-white"}
					rowKey={record => "supplier__" + JSON.stringify(record)}
					size={'middle'}
					bordered={true}
					locale={{ "emptyText": L('No Data') }}
					columns={columns}
					dataSource={refundResult.length > 0 ? refundResult : []}
					pagination={this.props.pagination}
					onRow={(record, rowIndex) => {
						return {
							onDoubleClick: (event: any) => { this.onAction(record!, EventTable.RowDoubleClick) }
						};
					}}
				/>
				<ModalTableBillingViewAdmin
					billSelected={this.billingSelected}
					visibleModalBillProduct={this.state.visibleModalBillProduct}
					onCancel={() => this.setState({ visibleModalBillProduct: false })}
					listItem={this.billingSelected.entities_id_arr}
				/>
			</>

		)
	}
}