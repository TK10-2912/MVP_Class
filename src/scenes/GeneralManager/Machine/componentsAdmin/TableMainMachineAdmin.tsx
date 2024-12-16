import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { ColumnsDisplayType } from "@src/components/Manager/SelectedColumnDisplay/ColumnsDisplayType";
import { EventTable } from "@src/lib/appconst";
import { MachineDto } from "@src/services/services_autogen";
import { Table, } from "antd";
import { TablePaginationConfig } from "antd/lib/table";
import { SorterResult, TableRowSelection } from "antd/lib/table/interface";
import moment from "moment";
import React from "react";
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
export default class TableMainMachineAdmin extends AppComponentBase<IProps> {
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
			<Table
				className='centerTable'
				onRow={(record) => {
					return {
						onDoubleClick: (event: any) => { this.onAction(record!, EventTable.RowDoubleClick) }
					};
				}}
				onChange={(_, __, sort: SorterResult<MachineDto> | SorterResult<MachineDto>[]) => {
					if (!!this.props.changeColumnSort) {
						this.props.changeColumnSort(sort);
					}
				}}
				rowClassName={(record) => (Math.abs(moment(record.ma_lastOnline_at).diff(moment(), 'minutes')) < 5) ? "text-green" : "text-red"}
				scroll={this.props.actionTable ? { x: 1200 } : { x: undefined }}
				loading={!this.state.isLoadDone}
				rowKey={record => "quanlymaybannuoc_index__" + JSON.stringify(record)}
				size={'small'}
				bordered={true}
				
				columns={listColumnDisplay}
				rowSelection={hasAction !== undefined ? rowSelection : undefined}
				dataSource={machineListResult !== undefined && machineListResult!.length > 0 ? machineListResult : []}
				pagination={this.props.pagination}

			/>
		)
	}
}