import React from "react";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { ReconcileProductSupplierDebtDto, ProductDailyMonitoringDto, ReconcileSupplierDebtDetailDto } from "@src/services/services_autogen";
import { Button, Col, Row, Space, Table, Tag } from "antd";
import { ColumnGroupType, ColumnsType } from "antd/lib/table";
import AppConsts, { EventTable, cssCol, pageSizeOptions } from "@src/lib/appconst";
import { EditOutlined, HistoryOutlined } from "@ant-design/icons";
import { eBillReconcileStatus, valueOfeBillReconcileStatus } from "@src/lib/enumconst";
export interface IProps {
	productDetail?: ReconcileProductSupplierDebtDto[];
	rec_selected?: ReconcileSupplierDebtDetailDto;
	onAction?: (reconcile: ReconcileProductSupplierDebtDto, event: EventTable) => void;
	onSuccess?: () => void;

}
export default class TableProductDetailSupplierHistory extends AppComponentBase<IProps> {
	state = {
		key_selected: undefined,
	};
	productResult: ProductDailyMonitoringDto[] = [];
	productSelected: ReconcileProductSupplierDebtDto = new ReconcileProductSupplierDebtDto();
	onAction = (item: ReconcileProductSupplierDebtDto, action: EventTable) => {
		const { onAction } = this.props;
		if (onAction !== undefined) {
			onAction(item, action);
		}
	}
	onSuccess = async () => {
		if (!!this.props.onSuccess) {
			await this.props.onSuccess();
		}
	}
	render() {
		const { productDetail, } = this.props
		const action: ColumnGroupType<ReconcileProductSupplierDebtDto> = {
			title: "Chức năng",
			width: 40,
			key: "action_billing_reconcile",
			fixed: 'right',
			children: [],
			render: (_: any, record: ReconcileProductSupplierDebtDto) => {
				return (
					<>
						<Space>
							<Button
								type="primary" icon={<HistoryOutlined />} title={'Lịch sử cập nhật'}
								size='small'
								onClick={() => this.onAction(record, EventTable.History)}
							></Button>
						</Space>
					</>
				)
			}
		};
		const columns: ColumnsType<ReconcileProductSupplierDebtDto> = [
			{
				title: "STT", key: "stt_machine_index", width: 50, fixed: "left",
				render: (text: string, item: ReconcileProductSupplierDebtDto, index: number) => <div>{index + 1}</div>
			},
			{
				title: "Mã sản phẩm", key: "pr_code", width: 50,
				render: (text: string, item: ReconcileProductSupplierDebtDto, index: number) => <div>{item.pr_code}</div>
			},
			{
				title: "Tên sản phẩm", key: "pr_name", width: 50,
				render: (text: string, item: ReconcileProductSupplierDebtDto, index: number) => <div>{item.pr_name}</div>
			},
			{
				title: "Số lượng", key: "pr_name", width: 50,
				render: (text: string, item: ReconcileProductSupplierDebtDto, index: number) => <div>{AppConsts.formatNumber(item.pr_quantity)}</div>
			},
			{
				title: "Giá sản phẩm", key: "pr_name", width: 50,
				render: (text: string, item: ReconcileProductSupplierDebtDto, index: number) => <div>{AppConsts.formatNumber(item.pr_unit_price)}</div>
			},
			{
				title: "Tổng thành tiền", key: "pr_name", width: 50,
				render: (text: string, item: ReconcileProductSupplierDebtDto, index: number) => <div>{AppConsts.formatNumber(item.pr_total_money)}</div>
			},
			{
				title: "Trạng thái", key: "pr_name", width: "20%",
				render: (text: string, item: ReconcileProductSupplierDebtDto, index: number) => <div>
					{
						eBillReconcileStatus.DONE.num == item.pr_im_reconcile_status && <Tag color='green'>{valueOfeBillReconcileStatus(item.pr_im_reconcile_status)}</Tag>
					}
					{
						eBillReconcileStatus.DOING.num == item.pr_im_reconcile_status && <Tag color='blue'>{valueOfeBillReconcileStatus(item.pr_im_reconcile_status)}</Tag>
					}
					{
						eBillReconcileStatus.ERROR.num == item.pr_im_reconcile_status && <Tag color='orange'>{valueOfeBillReconcileStatus(item.pr_im_reconcile_status)}</Tag>
					}
					{
						eBillReconcileStatus.NONE.num == item.pr_im_reconcile_status && <Tag color='red'>{valueOfeBillReconcileStatus(item.pr_im_reconcile_status)}</Tag>
					}
				</div>
			},
			{
				title: "Lý do", key: "pr_name", width: 50,
				render: (text: string, item: ReconcileProductSupplierDebtDto, index: number) => <div dangerouslySetInnerHTML={{ __html: item.pr_im_reconcile_reason! }}></div>
			},
		];
		columns.push(action)
		return (
			<Table
				className='centerTable'
				scroll={{ x: 1300, y: 600 }}
				rowKey={record => "quanlymaybannuoc_index__" + JSON.stringify(record)}
				size={'small'}
				bordered={true}
				
				columns={columns}
				pagination={{
					total:productDetail!.length ,
					showTotal: (tot) => "Tổng" + ": " + tot + "",
					showQuickJumper: true,
					showSizeChanger: true,
					pageSizeOptions: pageSizeOptions,
				} }
				dataSource={productDetail != undefined && productDetail!.length > 0 ? productDetail : []}
			/>
		)
	}
}