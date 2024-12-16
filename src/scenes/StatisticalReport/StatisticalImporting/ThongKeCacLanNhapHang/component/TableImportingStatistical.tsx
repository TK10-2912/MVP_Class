import * as React from 'react';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { StatisticImportOfMachineDto } from '@src/services/services_autogen';
import { Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';

export interface IProps {
	actionTable?: (item: StatisticImportOfMachineDto, event: EventTable) => void;
	isLoadDone?: boolean;
	importingStatisticListResult: StatisticImportOfMachineDto[],
}

export default class TableImportingStatistical extends React.Component<IProps> {
	state = {
		bill_statistic_selected: undefined,
	}

	onAction = (item: StatisticImportOfMachineDto, action: EventTable) => {
		this.setState({ dr_id_selected: item.key });
		const { actionTable } = this.props;
		if (actionTable !== undefined) {
			actionTable(item, action);
		}
	}

	render() {
		const { importingStatisticListResult } = this.props

		const columns: ColumnsType<StatisticImportOfMachineDto> = [
			{ title: "STT", key: "stt_import_statistic_index", render: (text: string, item: StatisticImportOfMachineDto, index: number) => <div>{index < importingStatisticListResult.length - 1 && index + 1}</div> },
			{ title: "Tên máy", key: "name_machine_import_statistic", render: (text: string, item: StatisticImportOfMachineDto) => <div> {item.nameMachine} </div> },
			{ title: "Số lượng nhập sản phẩm có bao bì (chai/lon)", key: "quantity_drink_import_statistic", render: (text: string, item: StatisticImportOfMachineDto) => <div>{AppConsts.formatNumber(item.quantityDrink)}</div> },
			{ title: "Dung tích nhập sản phẩm không bao bì (ml)", key: "drink_import_statistic", render: (text: string, item: StatisticImportOfMachineDto) => <div>{AppConsts.formatNumber(item.quantityFreshDrink)}</div> },
		];

		return (
			<Table
				// sticky
				className='centerTable'
				onRow={(record, rowIndex) => {
					return {
						onDoubleClick: (event: any) => { this.onAction(record!, EventTable.RowDoubleClick) }
					};
				}}
				loading={!this.props.isLoadDone}
				columns={columns}
				size={'middle'}
				bordered={true}
				locale={{ "emptyText": "Không có dữ liệu" }}
				dataSource={importingStatisticListResult.length > 0 ? importingStatisticListResult : []}
				pagination={false}
				rowClassName={(record, index) => (this.state.bill_statistic_selected === record.key) ? "bg-click" : "bg-white"}
				rowKey={record => "drink_table" + JSON.stringify(record)}
			/>
		)
	}
}