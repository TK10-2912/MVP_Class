
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { ColumnsDisplayType } from "@src/components/Manager/SelectedColumnDisplay/ColumnsDisplayType";
import { EventTable } from "@src/lib/appconst";
import { MachineDto } from "@src/services/services_autogen";
import { Table, } from "antd";
import { TablePaginationConfig } from "antd/lib/table";
import { SorterResult, TableRowSelection } from "antd/lib/table/interface";
import * as React from 'react';

export interface IProps {
	machineListResult?: MachineDto[];
	pagination: TablePaginationConfig | false;
	hasAction?: boolean;
	rowSelection?: TableRowSelection<MachineDto>
	editMachine?: (item: MachineDto) => void;
	deleteMachine?: (item: MachineDto) => void;
	actionTable?: (item: MachineDto, event: EventTable) => void;
	listNumberLength?: boolean;
	is_printed?: boolean;
	listColumnDisplay: ColumnsDisplayType<any>;
	changeColumnSort?: (fieldSort: SorterResult<MachineDto> | SorterResult<MachineDto>[]) => void;

}
export default class TableMainMachineUser extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		ma_id_selected: undefined,
	};

	onAction = (item: MachineDto, action: EventTable) => {
		this.setState({ ma_id_selected: item.ma_id });
		const { actionTable } = this.props;
		if (actionTable !== undefined) {
			actionTable(item, action);
		}
	}
	render() {
		const { machineListResult, hasAction, rowSelection, listColumnDisplay } = this.props

		return (
			<>
				<Table
					className='centerTable'
					onRow={(record, rowIndex) => {
						return {
							onDoubleClick: (event: any) => { this.onAction(record!, EventTable.RowDoubleClick) }
						};
					}}
					onChange={(a, b, sort: SorterResult<MachineDto> | SorterResult<MachineDto>[]) => {
						if (!!this.props.changeColumnSort) {
							this.props.changeColumnSort(sort);
						}
					}}
					rowClassName={(record, index) => (record.ma_is_active) ? "text-black" : "text-red"}
					scroll={this.props.is_printed ? { x: undefined, y: undefined } : { x: 1500, y: 500 }}
					loading={!this.state.isLoadDone}
					rowKey={record => "quanlymaybannuoc_index__" + JSON.stringify(record)}
					size={'middle'}
					bordered={true}
					locale={{ "emptyText": 'Không có dữ liệu' }}
					columns={listColumnDisplay}
					rowSelection={hasAction !== undefined ? rowSelection : undefined}
					dataSource={machineListResult || []}
					pagination={this.props.pagination}

				/>
			</>
		)
	}
}