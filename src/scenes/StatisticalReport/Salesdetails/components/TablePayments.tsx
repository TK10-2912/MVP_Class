import AppComponentBase from '@src/components/Manager/AppComponentBase';
// import { ItemPaymentMethod, PaymentMethod } from '@src/services/services_autogen';
import Table, { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import * as React from 'react';

export interface Iprops{
    // itemPaymentMethodList?: ItemPaymentMethod[]
    pagination: TablePaginationConfig | false;
}
export default class TablePayments extends AppComponentBase<Iprops> {
    state = {
		isLoadDone: true,
		key_selected: undefined,
	};
    render() {
		// const {itemPaymentMethodList}=this.props;
        // const columns: ColumnsType<ItemPaymentMethod> = [
		// 	{
		// 		title: "STT", key: "stt_machine_index", width: '3%', fixed: "left",
		// 		render: (text: string, item: ItemPaymentMethod, index: PaymentMethod) => <div>{index + 1}</div>
		// 	},
		// 	{
		// 		title: 'Loại thanh toán', dataIndex: '', key: 'payment_type', width: '5%',
		// 		render: (text: string, item: ItemPaymentMethod, index: number) => <div>{item.payment_type}</div>
		// 	},
		// 	{
		// 		title: 'Loại máy không có bao bì', dataIndex: '', key: 'payment_type', width: '5%',
		// 		render: (text: string, item: ItemPaymentMethod, index: number) => <div>{item.quantity_drink}</div>
		// 	},
		// 	{
		// 		title: 'Loại máy có bao bì', dataIndex: '', key: 'payment_type', width: '5%',
		// 		render: (text: string, item: ItemPaymentMethod, index: number) => <div>{item.quantity_fresh_drink}</div>
		// 	},
		// 	{
		// 		title: 'Tổng tiền sản phẩm', dataIndex: '', key: 'quantity_drink', width: '5%',
		// 		render: (text: string, item: ItemPaymentMethod, index: number) => <div>{item.total_money}</div>
		// 	},
		// 	{
		// 		title: 'Tổng tiền nhận được', dataIndex: '', key: 'quantity_fresh_drink', width: '5%',
		// 		render: (text: string, item: ItemPaymentMethod, index: number) => <div>{item.total_money}</div>
		// 	},// chưa có
		// 	{
		// 		title: 'Số đơn hàng đã bán', dataIndex: '', key: 'transaction_success', width: '5%',
		// 		render: (text: string, item: ItemPaymentMethod, index: number) => <div>{item.transaction_success}</div>
		// 	},
		// 	{
		// 		title: 'Tiền giảm giá', dataIndex: '', key: 'discount_code_used', width: '5%',
		// 		render: (text: string, item: ItemPaymentMethod, index: number) => <div>{item.discount_code_used}</div>
		// 	},//
		// 	{
		// 		title: 'Số mã giảm giá', dataIndex: '', key: 'discount_code_used', width: '5%',
		// 		render: (text: string, item: ItemPaymentMethod, index: number) => <div>{item.discount_code_used}</div>
		// 	},
		// 	{
		// 		title: 'Số tiền thất bại', dataIndex: '', key: 'transaction_not_success', width: '5%',
		// 		render: (text: string, item: ItemPaymentMethod, index: number) => <div>{item.transaction_not_success}</div>
		// 	},
		// 	{
		// 		title: 'Số đơn hàng thất bại', dataIndex: '', key: 'total_money', width: '5%',
		// 		render: (text: string, item: ItemPaymentMethod, index: number) => <div>{item.total_money}</div>
		// 	},//

		// ];

		return (
			<>
				<Table
					className='centerTable'
					loading={!this.state.isLoadDone}
					rowKey={record => "quanlymaybannuoc_index__" + JSON.stringify(record)}
					size={'middle'}
					bordered={true}
					locale={{ "emptyText": 'Không có dữ liệu' }}
					// columns={columns}
					// dataSource={itemPaymentMethodList}
					pagination={this.props.pagination}
				/>
			</>
		)

    }
}
