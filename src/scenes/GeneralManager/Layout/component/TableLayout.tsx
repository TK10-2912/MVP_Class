import { DeleteFilled, EditOutlined } from '@ant-design/icons';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { isGranted } from '@src/lib/abpUtility';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { LayoutDto } from '@src/services/services_autogen';
import { Button, Space, Table } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { TableRowSelection } from 'antd/lib/table/interface';
import * as React from 'react';

export interface IProps {
	actionTable?: (item: LayoutDto, event: EventTable) => void;
	pagination: TablePaginationConfig | false;
	hasAction?: boolean;
	layoutListResult: LayoutDto[],
	rowSelection?: TableRowSelection<LayoutDto>
	noScroll?: boolean;
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
					{isGranted(AppConsts.Permission.Pages_Manager_General_Layout_Update) &&
					<Button
						type="primary" icon={<EditOutlined />} title="Chỉnh sửa"
						size='small'
						onClick={() => this.onAction(item!, EventTable.Edit)}
					></Button>}
					{isGranted(AppConsts.Permission.Pages_Manager_General_Layout_Delete) &&
					<Button
						danger icon={<DeleteFilled />} title="Xóa"
						size='small'
						onClick={() => this.onAction(item!, EventTable.Delete)}
					></Button>}
				</Space>
			)
		};

		const columns: ColumnsType<LayoutDto> = [
			{ title: "STT", key: "stt_fresh_drink_index", width: 50, render: (text: string, item: LayoutDto, index: number) => <div>{pagination ? pagination!.pageSize! * (pagination!.current! - 1) + (index + 1) : index + 1}</div> },
			{ title: "Tên bố cục", dataIndex: 'la_name', ellipsis: true, key: "la_name", render: (text: string, item: LayoutDto) => <div> {item.la_name} </div> },
			{ title: "Kiểu bố cục", dataIndex: "la_type", key: "la_type", render: (text: string, item: LayoutDto) => <div> {item.la_type} </div> },
			{ title: "Ghi chú", key: "dr_desc", ellipsis: true, render: (text: string, item: LayoutDto) => <div>{item.la_desc}</div> },
		];
		if (!!hasAction && hasAction == true) columns.push(action);

		return (
			<Table
				scroll={this.props.noScroll == true ? { x: undefined, y: undefined } : { x: 800, y: 600 }}
				className='centerTable'
				onRow={(record, rowIndex) => {
					return {
						onDoubleClick: (event: any) => { this.onAction(record!, EventTable.RowDoubleClick) }
					};
				}}
				rowSelection={this.props.actionTable ? rowSelection : undefined}
				columns={columns}
				size={'middle'}
				bordered={true}
				
				dataSource={layoutListResult!.length > 0 ? layoutListResult : []}
				pagination={this.props.pagination}
				rowClassName={(record, index) => (this.state.la_id_selected === record.la_id) ? "bg-click" : "bg-white"}
				rowKey={record => "layout_table" + JSON.stringify(record)}
			/>
		)
	}
}