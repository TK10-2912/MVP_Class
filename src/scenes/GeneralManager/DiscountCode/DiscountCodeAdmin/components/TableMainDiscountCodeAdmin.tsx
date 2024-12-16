import { DeleteFilled, EditOutlined, EyeFilled, MinusCircleOutlined } from "@ant-design/icons";
import { isGranted } from "@src/lib/abpUtility";
import AppConsts from "@src/lib/appconst";
import { DiscountCodeDto, } from "@src/services/services_autogen";
import { Button, Switch, Table, Tag } from "antd";
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from "antd/lib/table";
import { SorterResult, TableRowSelection } from "antd/lib/table/interface";
import moment from "moment";
import React from "react";
export interface IProps {
	discountListResult?: DiscountCodeDto[];
	pagination?: TablePaginationConfig | false;
	hasAction?: boolean;
	disIdSelected?: number;
	export?: boolean;
	rowSelection?: TableRowSelection<DiscountCodeDto>
	onDoubleClickRow?: (item: DiscountCodeDto) => void;
	editDiscountCode?: (item: DiscountCodeDto) => void;
	deleteDiscountCode?: (item: DiscountCodeDto) => void;
	activateOrDeActive?: (item: DiscountCodeDto) => void;
	changeColumnSort?: (fieldSort: SorterResult<DiscountCodeDto> | SorterResult<DiscountCodeDto>[]) => void;

}
export default class TableMainDiscountCodeAdmin extends React.Component<IProps> {
	state = {
		isLoadDone: true,
		visibleModalCreateUpdate: false,
	};
	current = new Date(moment().format());
	discountSelected: DiscountCodeDto = new DiscountCodeDto();
	editDiscountCode = (item: DiscountCodeDto) => {
		if (!!this.props.editDiscountCode) { this.props.editDiscountCode(item); }
	}
	deleteDiscountCode = (item: DiscountCodeDto) => {
		if (!!this.props.deleteDiscountCode) { this.props.deleteDiscountCode(item); }
	}
	onDoubleClickRow = (item: DiscountCodeDto) => {
		if (!!this.props.onDoubleClickRow) {
			this.props.onDoubleClickRow(item);
		}
	}
	activateOrDeActive = (item: DiscountCodeDto) => {
		if (!!this.props.activateOrDeActive) {
			this.props.activateOrDeActive(item);
		}
	}
	render() {
		const { discountListResult, hasAction, disIdSelected, rowSelection } = this.props;
		let action: ColumnGroupType<DiscountCodeDto> = {
			title: 'Chức năng', children: [], key: 'action_member_index', className: "no-print center", fixed: 'right', width: 100,
			render: (text: string, item: DiscountCodeDto) => (
				<div >

					{isGranted(AppConsts.Permission.Pages_Manager_General_Discount_Update) &&
						<Button
							type="primary" icon={(new Date(item.di_end_at!) < this.current) ? <EyeFilled /> : <EditOutlined />} title={(new Date(item.di_end_at!) < this.current) ? "Xem" : "Chỉnh sửa"}
							size='small'
							style={{ marginLeft: '10px', marginTop: '5px' }}
							onClick={() => this.editDiscountCode(item)}
						></Button>
					}

					{isGranted(AppConsts.Permission.Pages_Manager_General_Discount_Delete) &&
						<Button
							danger
							icon={<DeleteFilled />} title={"Xoá"}
							size='small'
							style={{ marginLeft: '10px', marginTop: '5px' }}
							onClick={() => this.deleteDiscountCode(item)}
						></Button>
					}
				</div >
			)
		}
		const columns: ColumnsType<DiscountCodeDto> = [
			{
				title: 'STT', dataIndex: '', key: 'stt', fixed: "left", width: 50,
				render: (text: string, item: DiscountCodeDto, index: number) => <div>{this.props.pagination !== false ? this.props.pagination?.pageSize! * (this.props.pagination?.current! - 1) + (index + 1) : index + 1}</div>
			},
			{
				title: 'Mã giảm giá', key: 'di_code',
				render: (text: string, item: DiscountCodeDto) => <div>{item.di_code}</div>
			},
			{
				title: 'Mệnh giá (VNĐ)', dataIndex: 'di_price', sorter: true, key: 'di_price',
				render: (text: string, item: DiscountCodeDto) => <div>{AppConsts.formatNumber(item.di_price)}</div>
			},
			{
				title: 'Số lượng mã đã dùng', dataIndex: 'di_quantity_use', key: 'di_quantity_use', sorter: true,
				render: (text: string, item: DiscountCodeDto) => <div>{AppConsts.formatNumber(item.di_quantity_use)}</div>
			},
			{
				title: 'Số lượng mã tối đa', dataIndex: 'di_quantity_max', key: 'di_quantity_max', sorter: true,
				render: (text: string, item: DiscountCodeDto) => <div>{AppConsts.formatNumber(item.di_quantity_max)}</div>
			},
			{
				title: ('Mô tả'), key: 'di_desc', width: 150, render: (text: string, item: DiscountCodeDto) => <div style={{ marginTop: "14px" }} dangerouslySetInnerHTML={{ __html: item.di_desc! }}></div>
			},

			{
				title: 'Kích hoạt', key: 'di_active', width: this.props.hasAction === true ? 200 : 0,
				render: (text: string, item: DiscountCodeDto) => <>

					{this.props.export ?
						item.di_active !== true ? "Chưa kích hoạt" : (new Date(item.di_end_at!) < this.current) ? "Mã giảm giá hết hạn" : "Đang kích hoạt"
						:
						<>
							{
								item.di_active && (new Date(item.di_end_at!) < this.current) ?
									<Tag icon={<MinusCircleOutlined />} color="default">
										Mã giảm giá đã quá hạn
									</Tag>
									:
									<Switch checked={item.di_active} onClick={() => this.activateOrDeActive(item)}></Switch>
							}</>

					}
				</>
			}
		];

		if (hasAction != undefined && hasAction === true) {
			columns.push(action);
		}

		return (
			<>
				<Table
					scroll={this.props.hasAction ? { x: 1000, y: 600 } : { x: undefined, y: undefined }}
					className="centerTable"
					loading={!this.state.isLoadDone}
					rowClassName={(record, index) => (disIdSelected == record.di_id) ? "bg-click" : "bg-white"}
					rowKey={record => "quanlymaybannuoc_index__" + JSON.stringify(record)}
					size={'middle'}
					bordered={true}
					locale={{ "emptyText": 'Không có dữ liệu' }}
					columns={columns}
					onChange={(a, b, sort: SorterResult<DiscountCodeDto> | SorterResult<DiscountCodeDto>[]) => {
						if (!!this.props.changeColumnSort) {
							this.props.changeColumnSort(sort);
						}
					}}
					rowSelection={hasAction != undefined ? rowSelection : undefined}
					dataSource={discountListResult != undefined && discountListResult!.length > 0 ? discountListResult : []}
					pagination={this.props.pagination}

				/>
			</>
		)
	}
}