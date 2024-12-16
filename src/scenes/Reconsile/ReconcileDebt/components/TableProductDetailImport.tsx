import React from "react";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { ReconcileProductSupplierDebtInput, ProductDailyMonitoringDto } from "@src/services/services_autogen";
import { Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import AppConsts, { pageSizeOptions } from "@src/lib/appconst";
export interface IProps {
	productDetail?: ReconcileProductSupplierDebtInput[];
}
export default class TableProductDetailImport extends AppComponentBase<IProps> {
	state = {
		key_selected: undefined,
		currentPage: 1,
		pageSize: 10,
	};
	productResult: ProductDailyMonitoringDto[] = [];
	machineOutOfSelected: ReconcileProductSupplierDebtInput = new ReconcileProductSupplierDebtInput();


	render() {
		const { productDetail, } = this.props;
		const self = this;
		const columns: ColumnsType<ReconcileProductSupplierDebtInput> = [
			{
				title: "STT", key: "stt_machine_index", width: 50, fixed: "left",
				render: (text: string, item: ReconcileProductSupplierDebtInput, index: number) => <div>{this.state.pageSize! * (this.state.currentPage! - 1) + (index + 1)}</div>
			},
			{
				title: "Mã sản phẩm", key: "pr_code", width: 50, fixed: "left",
				render: (text: string, item: ReconcileProductSupplierDebtInput, index: number) => <div>{item.pr_code}</div>
			},
			{
				title: "Tên sản phẩm", key: "pr_name", width: 50, fixed: "left",
				render: (text: string, item: ReconcileProductSupplierDebtInput, index: number) => <div>{item.pr_name}</div>
			},
			{
				title: "Số lượng", key: "pr_name", width: 50, fixed: "left",
				render: (text: string, item: ReconcileProductSupplierDebtInput, index: number) => <div>{AppConsts.formatNumber(item.pr_quantity)}</div>
			},
			{
				title: "Giá sản phẩm", key: "pr_name", width: 50, fixed: "left",
				render: (text: string, item: ReconcileProductSupplierDebtInput, index: number) => <div>{AppConsts.formatNumber(item.pr_total_money / item.pr_quantity)}</div>
			},
			{
				title: "Tổng thành tiền", key: "pr_name", width: 50, fixed: "left",
				render: (text: string, item: ReconcileProductSupplierDebtInput, index: number) => <div>{AppConsts.formatNumber(item.pr_total_money)}</div>
			},
		];

		return (
			<>
				<Table
					className='centerTable'
					rowKey={record => "quanlymaybannuoc_index__" + JSON.stringify(record)}
					size={'small'}
					bordered={true}

					columns={columns}
					pagination={{
						position: ['topRight'],
						total: productDetail != undefined && productDetail!.length > 0 ? productDetail.length : 0,
						showTotal: (tot) => 'Tổng: ' + tot,
						showQuickJumper: true,
						showSizeChanger: true,
						pageSizeOptions: pageSizeOptions,
						onChange(page: number, pageSize?: number) {
							self.setState({ pageSize: pageSize, currentPage: page })
						}
					}}
					dataSource={productDetail != undefined && productDetail!.length > 0 ? productDetail : []}
				/>

			</>
		)
	}
}