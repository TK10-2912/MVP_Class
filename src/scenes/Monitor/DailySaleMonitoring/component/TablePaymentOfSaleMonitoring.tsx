import AppComponentBase from "@src/components/Manager/AppComponentBase";
import AppConsts, { EventTable } from "@src/lib/appconst";
import { valueOfePaymentMethod } from "@src/lib/enumconst";
import HistoryHelper from "@src/lib/historyHelper";
import { DailySaleMonitoringDto, PaymentMethodDto } from "@src/services/services_autogen";
import { Table } from "antd";
import { ColumnsType, TablePaginationConfig } from "antd/lib/table";
import { TableRowSelection } from "antd/lib/table/interface";
import React from "react";
export interface IProps {
	dailySaleMonitoringDto?: DailySaleMonitoringDto;
	rowSelection?: TableRowSelection<PaymentMethodDto>
	is_printed?: boolean;
	start_date?: any;
	end_date?: any;
}
export default class TablePaymentOfSaleMonitoring extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		key_selected: undefined,
	};

	onAction = (item: PaymentMethodDto, action: EventTable) => {
		this.setState({ key_selected: item.key });
	}
	render() {

		const { dailySaleMonitoringDto, rowSelection } = this.props
		const columns: ColumnsType<PaymentMethodDto> = [
			{
				title: "STT", key: "stt_machine_index", width: 50, fixed: "left",
				render: (text: string, item: PaymentMethodDto, index: number) => <div>{index + 1}</div>
			},
			{
				title: 'Loại thanh toán', dataIndex: '', key: 'ma_code',
				render: (text: string, item: PaymentMethodDto, index: number) => <div>{!!item && valueOfePaymentMethod(item.hinh_thuc_thanh_toan)}</div>
			},
			{
				title: "Tổng tiền sản phẩm (VNĐ)", key: "stt_machine_index",
				render: (text: string, item: PaymentMethodDto, index: number) => <div>{AppConsts.formatNumber(!!item && item.tong_tien_san_pham)}</div>
			},
			{
				title: "Tổng tiền nhận được (VNĐ)", key: "stt_machine_index",
				render: (text: string, item: PaymentMethodDto, index: number) => <div>{AppConsts.formatNumber(!!item && item.tong_tien_duoc_nhan)}</div>
			},
			{
				title: "Số đơn hàng đã bán", key: "stt_machine_index",
				render: (text: string, item: PaymentMethodDto, index: number) => <div>{AppConsts.formatNumber(!!item && item.so_luong_ban)}</div>
			},
			{
				title: "Tổng tiền giảm giá (VNĐ)", key: "stt_machine_index",
				render: (text: string, item: PaymentMethodDto, index: number) => <div>{AppConsts.formatNumber(!!item && item.tong_tien_giam_gia)}</div>
			},
			{
				title: "Số mã giảm giá đã dùng", key: "stt_machine_index",
				render: (text: string, item: PaymentMethodDto, index: number) => <div>{AppConsts.formatNumber(!!item && item.so_luong_ma_giam_gia)}</div>
			},
		];

		return (
			<>
				<Table
					className='centerTable'
					onRow={(record, rowIndex) => {
						return {
							onClick: () => {
								const { start_date, end_date } = this.props;
								const url = `/history/transaction_detail?startDate=${start_date}&endDate=${end_date}&paymentType=${record.hinh_thuc_thanh_toan}`;
								HistoryHelper.redirect(url);
							}
						};
					}}
					rowClassName={(record, index) => (this.state.key_selected === record.key) ? "bg-click" : "bg-white"}
					loading={!this.state.isLoadDone}
					rowKey={record => "quanlymaybannuoc_index__" + JSON.stringify(record)}
					size={'middle'}
					bordered={true}
					locale={{ "emptyText": 'Không có dữ liệu' }}
					columns={columns}
					rowSelection={this.props.is_printed !== undefined ? rowSelection : undefined}
					dataSource={(dailySaleMonitoringDto?.dicPaymentMethod !== undefined && Object.keys(dailySaleMonitoringDto.dicPaymentMethod!).length > 0) ? Object.values(dailySaleMonitoringDto.dicPaymentMethod!) : []}
					pagination={false}
				/>
			</>
		)
	}
}