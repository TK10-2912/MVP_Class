import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts from '@src/lib/appconst';
// import { ItemMachineTransaction } from '@src/services/services_autogen';

import { stores } from '@src/stores/storeInitializer';
import Table, { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import * as React from 'react';

export interface Iprops{
	pagination: TablePaginationConfig | false;
	// itemMachineList:  ItemMachineTransaction[];
}
export default class TableWatervendingmachine extends AppComponentBase<Iprops> {
    state = {
		isLoadDone: true,
		visibleModalCreateUpdate: false,
	};
    render() {
	// // 	ma_id!: number;
    // // ma_code!: string | undefined;
    // // gr_ma_area!: string | undefined;// nhóm may
    // // ma_discount_code_used!: number;//sl mã
    // // ma_transaction_success!: number;// 
    // // ma_transaction_not_success!: number;
    // // cash_count!: number;
    // // qr_count!: number;
    // // rfid_count!: number;
    // // ma_is_active!: boolean;
    // // ma_gps_lat!: string | undefined;
    // // ma_gps_lng!: string | undefined;//
    // // us_id!: number;
	// 	const {pagination,itemMachineList} = this.props
    //     const columns: ColumnsType<ItemMachineTransaction> = [
	// 		{
	// 			title: "STT", key: "stt_machine_index", width: '3%', fixed: 'left',
	// 			render: (text: string, item: ItemMachineTransaction, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div>,
	// 		},
	// 		{
	// 			title: "Nhóm máy", key: "gr_ma_area",
	// 			render: (text: string, item: ItemMachineTransaction, index: number) => <div>{item.gr_ma_area}</div>
	// 		},
	// 		{
	// 			title: "Mã máy", key: "ma_code",
	// 			render: (text: string, item: ItemMachineTransaction, index: number) => <div>{item.ma_code}</div>
	// 		},
	// 		{
	// 			title: "Tên máy", key: "ma_discount_code_used",
	// 			render: (text: string, item: ItemMachineTransaction, index: number) => <div>{item.ma_discount_code_used}</div>
	// 		},// chưa có item
	// 		{
	// 			title: "RFID", key: "rfid_count",
	// 			render: (text: string, item: ItemMachineTransaction, index: number) => <div>{item.rfid_count}</div>
	// 		},
	// 		{
	// 			title: "Nhiệt độ", key: "ma_transaction_success",
	// 			render: (text: string, item: ItemMachineTransaction, index: number) => <div>{item.ma_transaction_success}</div>
	// 		},//
			
	// 		{
	// 			title: "Tình trạng", key: "cash_count",
	// 			render: (text: string, item: ItemMachineTransaction, index: number) => <div>{item.cash_count}</div>
	// 		},//
	// 		{
	// 			title: "Tổng tiền sản phẩm", key: "cash_count",
	// 			render: (text: string, item: ItemMachineTransaction, index: number) => <div>{item.cash_count}</div>
	// 		},
	// 		{
	// 			title: "Tổng tiền nhận được", key: "qr_count",
	// 			render: (text: string, item: ItemMachineTransaction, index: number) => <div>{item.qr_count}</div>
	// 		},

	// 		{
	// 			title: "Tiền giảm giá", key: "qr_count",
	// 			render: (text: string, item: ItemMachineTransaction, index: number) => <div>{item.qr_count}</div>
	// 		},//
	// 		{
	// 			title: "Số lượng mã giảm giá", key: "qr_count",
	// 			render: (text: string, item: ItemMachineTransaction, index: number) => <div>{item.ma_discount_code_used}</div>
	// 		},
	// 		{
	// 			title: "Số đơn hàng đã bán", key: "ma_transaction_success",
	// 			render: (text: string, item: ItemMachineTransaction, index: number) => <div>{item.ma_transaction_success}</div>
	// 		},
			
	// 		{
	// 			title: "Số đơn hàng thất bại", key: "ma_transaction_not_success",
	// 			render: (text: string, item: ItemMachineTransaction, index: number) => <div>{item.ma_transaction_not_success}</div>
	// 		},
	// 		{
	// 			title: "Số tiền thất bại", key: "ma_transaction_not_success",
	// 			render: (text: string, item: ItemMachineTransaction, index: number) => <div>{item.ma_transaction_not_success}</div>
	// 		},//
	// 		{
	// 			title: "Thời gian", key: "qr_count",
	// 			render: (text: string, item: ItemMachineTransaction, index: number) => <div>{item.qr_count}</div>
	// 		},//
	// 		{
	// 			title: "Vị trí máy", key: "ma_gps_lat",
	// 			render: (text: string, item: ItemMachineTransaction, index: number) => <div>{item.ma_gps_lat}</div>
	// 		},
	// 		{
	// 			title: "Người sở hữu", key: "us_id",
	// 			render: (text: string, item: ItemMachineTransaction, index: number) => <div>{item.us_id}</div>
	// 		},

			
	// 	];

		return (
			<>
				<Table
					className='centerTable'
					//scroll={this.props.is_printed ? { x: undefined, y: undefined } : { x: 1800, y: 500 }}
					loading={!this.state.isLoadDone}
					rowKey={record => "quanlymaybannuoc_index__" + JSON.stringify(record)}
					size={'middle'}
					bordered={true}
					locale={{ "emptyText": 'Không có dữ liệu' }}
					// columns={columns}
					// dataSource={itemMachineList != undefined && itemMachineList!.length > 0 ? itemMachineList : []}
					pagination={this.props.pagination}

				/>
			</>
		)

    }
}
