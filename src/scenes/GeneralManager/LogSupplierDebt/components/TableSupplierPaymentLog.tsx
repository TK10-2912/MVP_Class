import * as React from 'react';
import { Button, Table, Tag, } from 'antd';
import { DeleteFilled, DollarOutlined, MobileOutlined, } from '@ant-design/icons';
import { SupplierDto, SupplierPaymentLogs, } from '@services/services_autogen';
import { isGranted, L } from '@lib/abpUtility';
import AppConsts, { EventTable, pageSizeOptions } from '@src/lib/appconst';
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { SorterResult, TableRowSelection } from 'antd/lib/table/interface';
import Tabs from 'antd/lib/tabs';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { stores } from '@src/stores/storeInitializer';
import { ePaymentDebt, eSupplierPaymentStatus, valueOfeBillRequiredFund, valueOfePaymentDebt, valueOfeSupplierPaymentStatus } from '@src/lib/enumconst';
import moment from 'moment';

export interface IProps {
	supplierResult: SupplierDto,
	isPrint: boolean;
	changeColumnSort?: (fieldSort: SorterResult<SupplierPaymentLogs> | SorterResult<SupplierPaymentLogs>[]) => void;

}
export const tabManager = {
	tab_1: L("Thông tin"),
	tab_2: L('Lịch sử nhập hàng'),
	tab_3: L("Nợ cần trả NCC"),
}
export default class TableSupplierPaymentLog extends AppComponentBase<IProps> {
	state = {
		isLoadDone: false,
		su_id_selected: undefined,
		expandedRowKey: [],
		selectedRowKey: null,
	};

	supplierSelected: SupplierPaymentLogs = new SupplierPaymentLogs();
	render() {
		const {  supplierResult } = this.props
		const columns: ColumnsType<SupplierPaymentLogs> = [
			{ title: L('STT'), key: 'stt', width: 50, render: (text: string, item: SupplierPaymentLogs, index: number) => <div>{index + 1}</div> },
			{ title: L('Nhà cung cấp'),  dataIndex: 'su_name', key: 'su_name', width: 150, render: (text: string, item: SupplierPaymentLogs) => <div>{stores.sessionStore.getNameSupplier(item.su_id)}</div> },
			{ title: L('Số tiền đã trả'), sorter: (a,b)=>a.su_pa_lo_paid - b.su_pa_lo_paid, dataIndex: 'su_name', key: 'su_name', width: 150, render: (text: string, item: SupplierPaymentLogs) => <div>{AppConsts.formatNumber(item.su_pa_lo_paid)}</div> },
			{
				title: L('Trạng thái'),   key: 'su_phone', width: 150, render: (text: string, item: SupplierPaymentLogs) => <div>
					{item.su_pa_lo_status == eSupplierPaymentStatus.NOTPAID.num && <Tag>{valueOfeSupplierPaymentStatus(item.su_pa_lo_status)}</Tag>}
					{item.su_pa_lo_status == eSupplierPaymentStatus.PAID_ONEPART.num && <Tag color='blue'>{valueOfeSupplierPaymentStatus(item.su_pa_lo_status)}</Tag>}
					{item.su_pa_lo_status == eSupplierPaymentStatus.PAID.num && <Tag color='success'>{valueOfeSupplierPaymentStatus(item.su_pa_lo_status)}</Tag>}
				</div>
			},
			{
				title: L('Phương thức thanh toán'),  key: 'su_address', width: 150, render: (text: string, item: SupplierPaymentLogs) => <div>
					{item.payment_method == ePaymentDebt.CASH.num && <Tag icon={<DollarOutlined />}>{valueOfePaymentDebt(item.payment_method)}</Tag>}
					{item.payment_method == ePaymentDebt.QR.num && <Tag icon={<MobileOutlined />}>{valueOfePaymentDebt(item.payment_method)}</Tag>}

				</div>
			},
			{ title: L('Chú thích'),  key: 'su_email', width: 150, render: (text: string, item: SupplierPaymentLogs) => <div>{item.su_pa_lo_note}</div> },
			{ title: L('Thời gian thanh toán'),  key: 'su_contact_person', width: 150, render: (text: string, item: SupplierPaymentLogs) => <div>{moment(item.su_pa_lo_created_at).format('DD/MM/YYYY HH:mm')}</div> },
		];

		return (
			<Table
				scroll={this.props.isPrint == true ? { x: undefined, y: undefined } : { x: 1000, y: 500 }}
				className='centerTable'
				loading={this.state.isLoadDone}
				rowClassName={(record) => this.state.selectedRowKey === record.su_pa_lo_id ? "bg-click" : "bg-white"}
				rowKey={record => record.su_pa_lo_id}
				size={'middle'}
				bordered={true}
				
				columns={columns}
				pagination={{
					position: ['topRight'],
					total: supplierResult.supplierPaymentLogs!.length,
					showTotal: (tot) => "Tổng" + ": " + tot + "",
					showQuickJumper: true,
					showSizeChanger: true,
					pageSizeOptions: pageSizeOptions,
				}} 
				dataSource={supplierResult.supplierPaymentLogs!.length > 0 ? supplierResult.supplierPaymentLogs : []}
			/>

		)
	}
}