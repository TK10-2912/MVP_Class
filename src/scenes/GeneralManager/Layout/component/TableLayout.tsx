import { DeleteFilled, EditOutlined } from '@ant-design/icons';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { LayoutDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Image, Space, Table } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { SorterResult, TableRowSelection } from 'antd/lib/table/interface';
import * as React from 'react';

export interface IProps {
	actionTable?: (item: LayoutDto, event: EventTable) => void;
	pagination: TablePaginationConfig | false;
	isLoadDone?: boolean;
	hasAction?: boolean;
	layoutListResult: LayoutDto[],
	rowSelection?: TableRowSelection<LayoutDto>
	noScrool?: boolean;
}

export default class TableLayout extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		la_id_selected: undefined,
	}

	onAction = (item: LayoutDto, action: EventTable) => {
		if (!!this.props.hasAction && this.props.hasAction == true) {

			this.setState({ la_id_selected: item.la_id });
			const { actionTable } = this.props;
			if (actionTable !== undefined) {
				actionTable(item, action);
			}
		}
	}

	render() {
		const { pagination, layoutListResult, rowSelection, hasAction } = this.props
		let action: any = {
			title: "Chức năng", key: "action_drink_index", className: "no-print", dataIndex: '', fixed: "right", width: 100,
			render: (text: string, item: LayoutDto) => (
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

		const columns: ColumnsType<LayoutDto> = [
			{ title: "STT", key: "stt_fresh_drink_index", width: 50, render: (text: string, item: LayoutDto, index: number) => <div>{pagination != false ? pagination!.pageSize! * (pagination!.current! - 1) + (index + 1) : index + 1}</div> },
			{ title: "Tên bố cục", dataIndex: 'la_name', key: "la_name", render: (text: string, item: LayoutDto) => <div> {item.la_name} </div> },
			{ title: "Kiểu bố cục", dataIndex: "la_type", key: "la_type", render: (text: string, item: LayoutDto) => <div> {item.la_type} </div> },
			{ title: "Ghi chú", key: "dr_desc", render: (text: string, item: LayoutDto) => <div>{item.la_desc}</div> },
		];
		if (!!hasAction && hasAction == true) columns.push(action);

		return (
			<Table
				scroll={this.props.noScrool == true ? { x: undefined, y: undefined } : { x: 1100, y: 600 }}
				className='centerTable'
				onRow={(record, rowIndex) => {
					return {
						onDoubleClick: (event: any) => { this.onAction(record!, EventTable.RowDoubleClick) }
					};
				}}
				rowSelection={this.props.actionTable != undefined ? rowSelection : undefined}
				loading={!this.props.isLoadDone}
				columns={columns}
				size={'middle'}
				bordered={true}
				locale={{ "emptyText": "Không có dữ liệu" }}
				dataSource={layoutListResult!.length > 0 ? layoutListResult : []}
				pagination={this.props.pagination}
				rowClassName={(record, index) => (this.state.la_id_selected === record.la_id) ? "bg-click" : "bg-white"}
				rowKey={record => "layout_table" + JSON.stringify(record)}
			/>
		)
	}
}