import AppComponentBase from "@src/components/Manager/AppComponentBase";
import AppConsts from "@src/lib/appconst";
import { valueOfeBillMethod } from "@src/lib/enumconst";
import { DailySaleMonitoringDto, PaymentMethodDto } from "@src/services/services_autogen";
import { Table, message } from "antd";
import { ColumnsType } from "antd/lib/table";
import { TableRowSelection } from "antd/lib/table/interface";
import moment from "moment";
import React from "react";
export interface IProps {
	dailySaleMonitoringDto?: DailySaleMonitoringDto;
	rowSelection?: TableRowSelection<PaymentMethodDto>
	is_printed?: boolean;
	start_date?: any;
	end_date?: any;
	parent?: string;
}
export default class TablePaymentOfSaleMonitoring extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		key_selected: undefined,
	};

	onAction = (item: PaymentMethodDto) => {
		this.setState({ key_selected: item.key });
	}
	render() {
		const { dailySaleMonitoringDto, rowSelection, start_date, end_date } = this.props
		const columns: ColumnsType<PaymentMethodDto> = [
			{
				title: "STT", key: "stt_machine_index", width: 50, fixed: "left",
				render: (text: string, item: PaymentMethodDto, index: number) => <div>
					<div>
						{index + 1}
					</div>
				</div>
			},
			{
				title: 'Loại thanh toán', dataIndex: '', key: 'ma_code',
				render: (text: string, item: PaymentMethodDto, index: number) => <div>
					<div>
						{!!item && valueOfeBillMethod(item.hinh_thuc_thanh_toan)}
					</div>
				</div>
			},
			{
				title: "Tổng tiền sản phẩm (VNĐ)", key: "stt_machine_index",
				render: (text: string, item: PaymentMethodDto, index: number) => <div>
					<div>
						{AppConsts.formatNumber(!!item && item.tong_tien_san_pham)}
					</div>
				</div>
			},
			{
				title: "Tổng tiền nhận được (VNĐ)", key: "stt_machine_index",
				render: (text: string, item: PaymentMethodDto, index: number) => <div>
					<div>

						{AppConsts.formatNumber(!!item && item.tong_tien_duoc_nhan)}
					</div>
				</div>
			},
			{
				title: "Tổng tiền hoàn trả", key: "tong_tien_hoan_tra",
				render: (text: string, item: PaymentMethodDto, index: number) => <div>
					<div title="Xem chi tiết giao dịch">
						{AppConsts.formatNumber(!!item && item.tong_tien_hoan_tra)}
					</div>
				</div>
			},
			{
				title: "Số đơn hàng đã bán", key: "stt_machine_index",
				render: (text: string, item: PaymentMethodDto, index: number) => <div>
					<div>
						{AppConsts.formatNumber(!!item && item.so_luong_ban)}
					</div>
				</div>
			},
			{
				title: "Tổng tiền giảm giá (VNĐ)", key: "stt_machine_index",
				render: (text: string, item: PaymentMethodDto, index: number) => <div>
					<div>

						{AppConsts.formatNumber(!!item && item.tong_tien_giam_gia)}
					</div>
				</div>
			},
			{
				title: "Số mã giảm giá đã dùng", key: "stt_machine_index",
				render: (text: string, item: PaymentMethodDto, index: number) => <div>
					<div>
						{AppConsts.formatNumber(!!item && item.so_luong_ma_giam_gia)}
					</div>
				</div>
			},
		];
		return (
			<>
				<Table
					className='centerTable'
					onRow={(record) => {
						return {
							title: !!record && record.tong_tien_san_pham !== record.tong_tien_duoc_nhan
								? "Chênh lệch có thể xảy ra do giao dịch thất bại hoặc quá trình trả hàng bị lỗi"
								: "Xem chi tiết giao dịch",
							onClick: async () => {
								if (!this.props.is_printed) {
									const today = new Date().toISOString().split('T')[0];
									let url = this.props.parent === "sale_detail"
										? `/history/transaction_detail?paymentType=${record.hinh_thuc_thanh_toan}`
										: `/history/transaction_detail?paymentType=${record.hinh_thuc_thanh_toan}&date=${today}`;
									if (start_date !== undefined && end_date !== undefined) {
										url = `/history/transaction_detail?paymentType=${record.hinh_thuc_thanh_toan}&start_date=${moment(start_date).format("MM/DD/YYYY")}&end_date=${moment(end_date).format("MM/DD/YYYY")}`
									}
									if (record.tong_tien_san_pham > 0) {
										window.open(url, '_blank');
									}
									else {
										message.warning("Không có đơn hàng nào")
									}
								}
							},
							style: { cursor: this.props.is_printed ? '' : 'pointer' }
						};

					}}

					rowClassName={(record, index) => (this.state.key_selected === record.key) ? "bg-click" : "bg-white"}
					loading={!this.state.isLoadDone}
					rowKey={record => "quanlymaybannuoc_index__" + JSON.stringify(record)}
					size={'middle'}
					bordered={true}

					columns={columns}
					rowSelection={this.props.is_printed !== undefined ? rowSelection : undefined}
					dataSource={(dailySaleMonitoringDto?.dicPaymentMethod !== undefined && Object.keys(dailySaleMonitoringDto.dicPaymentMethod!).length > 0) ? Object.values(dailySaleMonitoringDto.dicPaymentMethod!) : []}
					pagination={false}
				/>
			</>
		)
	}
}