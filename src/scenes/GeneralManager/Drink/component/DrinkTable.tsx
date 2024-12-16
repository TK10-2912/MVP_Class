import { DeleteFilled, EditOutlined } from '@ant-design/icons';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { DrinkDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Image, Space, Table } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { SorterResult, TableRowSelection } from 'antd/lib/table/interface';
import * as React from 'react';

export interface IProps {
	actionTable?: (item: DrinkDto, event: EventTable) => void;
	pagination: TablePaginationConfig | false;
	isLoadDone?: boolean;
	hasAction?: boolean;
	drinkListResult: DrinkDto[],
	rowSelection?: TableRowSelection<DrinkDto>
	noScrool?: boolean;
	changeColumnSort?: (fieldSort: SorterResult<DrinkDto> | SorterResult<DrinkDto>[]) => void;
}

export default class DrinkTable extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		dr_id_selected: undefined,
	}

	onAction = (item: DrinkDto, action: EventTable) => {
		if (!!this.props.hasAction && this.props.hasAction == true) {

			this.setState({ dr_id_selected: item.dr_id });
			const { actionTable } = this.props;
			if (actionTable !== undefined) {
				actionTable(item, action);
			}
		}
	}

	render() {
		const { pagination, drinkListResult, rowSelection, hasAction } = this.props
		let action: any = {
			title: "Chức năng", key: "action_drink_index", className: "no-print", dataIndex: '', fixed: "right", width: 100,
			render: (text: string, item: DrinkDto) => (
				<Space>
					<Button
						type="primary" icon={<EditOutlined />} title="Chỉnh sửa"
						size='small'
						onClick={() => this.onAction(item!, EventTable.Edit)}
					></Button>
					<Button
						danger icon={<DeleteFilled />} title="Xóa"
						size='small'
						onClick={() => this.onAction(item!, EventTable.Delete)}
					></Button>
				</Space>
			)
		};

		const columns: ColumnsType<DrinkDto> = [
			{ title: "STT", key: "stt_fresh_drink_index", width: 50, render: (text: string, item: DrinkDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
			{
				title: "Ảnh minh họa",
				width: 160,
				className: 'no-print',
				key: "fr_dr_id_drink_index",
				render: (text: string, item: DrinkDto, index: number) => (
					<div style={{ textAlign: "center" }}>
						<Image className='no-print' src={(item.dr_image != undefined && item.dr_image.id != undefined) ? this.getFile(item.dr_image.id) : AppConsts.appBaseUrl + "/image/no_image.jpg"} style={{ height: "20vh", width: "100%" }}
							alt='No image available' />
					</div>
				)
			},
			{ title: "Mã sản phẩm", sorter: true, dataIndex: 'dr_code', key: "dr_code", render: (text: string, item: DrinkDto) => <div> {item.dr_code} </div> },
			{ title: "Tên sản phẩm", sorter: true, dataIndex: "dr_name", key: "dr_name", render: (text: string, item: DrinkDto) => <div> {item.dr_name} </div> },
			{ title: "Thông tin sản phẩm", key: "dr_desc", render: (text: string, item: DrinkDto) => <div dangerouslySetInnerHTML={{ __html: item.dr_desc! }}></div> },
			{ title: "Nhà cung cấp", key: "su_id", render: (text: number, item: DrinkDto) => <div> {stores.sessionStore.getNameSupplier(item.su_id)} </div> },
			{ title: "Giá thành (VNĐ)", sorter: true, dataIndex: "dr_price", key: "dr_price", render: (text: number, item: DrinkDto) => <div> {AppConsts.formatNumber(item.dr_price)}</div> },
		];
		if (!!hasAction && hasAction == true) columns.push(action);

		return (
			<Table
				scroll={this.props.noScrool == false ? { x: undefined, y: undefined } : { x: 1100, y: 600 }}
				className='centerTable'
				onRow={(record, rowIndex) => {
					return {
						onDoubleClick: (event: any) => { this.onAction(record!, EventTable.RowDoubleClick) }
					};
				}}
				onChange={(a, b, sort: SorterResult<DrinkDto> | SorterResult<DrinkDto>[]) => {
					if (!!this.props.changeColumnSort) {
						this.props.changeColumnSort(sort);
					}
				}}
				rowSelection={this.props.actionTable != undefined ? rowSelection : undefined}
				loading={!this.props.isLoadDone}
				columns={columns}
				size={'middle'}
				bordered={true}
				locale={{ "emptyText": "Không có dữ liệu" }}
				dataSource={drinkListResult.length > 0 ? drinkListResult : []}
				pagination={this.props.pagination}
				rowClassName={(record, index) => (this.state.dr_id_selected === record.dr_id) ? "bg-click" : "bg-white"}
				rowKey={record => "drink_table" + JSON.stringify(record)}
			/>
		)
	}
}