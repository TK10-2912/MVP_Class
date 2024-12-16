import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { L } from "@src/lib/abpUtility";
import { eMachineSoftLogsStatus, valueOfeMachineSoftLogsStatus } from "@src/lib/enumconst";
import { MachineSoftLogsDto } from "@src/services/services_autogen";
import { Table, Tag, } from "antd";
import { TablePaginationConfig } from "antd/lib/table";
import { SorterResult } from "antd/lib/table/interface";
import moment from "moment";
import React from "react";
export interface IProps {
	is_printed?: boolean;
	pagination?: TablePaginationConfig | false;
	machineSoftLogsServiceListResult?: MachineSoftLogsDto[];
	isLoadDone?: boolean;
	changeColumnSort?: (fieldSort: SorterResult<MachineSoftLogsDto> | SorterResult<MachineSoftLogsDto>[]) => void;
}
export default class TableHistoryUpdate extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		ma_id_selected: undefined,
	};

	render() {
		const { machineSoftLogsServiceListResult, pagination, is_printed } = this.props;
		const columns = [
			{ title: L('STT'), key: 'ma_index', render: (text: number, item: MachineSoftLogsDto, index: number) => <div>{index + 1}</div>, },
			{ title: "Phiên bản cập nhật", key: 'version_update', render: (text: string, item: MachineSoftLogsDto) => <div>{item.ma_so_lo_preversion_code}</div> },
			{ title: "Mã phiên bản cập nhật", key: 'version_update', render: (text: string, item: MachineSoftLogsDto) => <div>{item.ma_so_lo_preversion_name}</div> },
			{
				title: "Trạng thái", key: 'version_update', render: (text: string, item: MachineSoftLogsDto) => <div>
					{is_printed == true ? (
						valueOfeMachineSoftLogsStatus(item.ma_so_lo_status)
					) : (
						eMachineSoftLogsStatus.NOT_UPDATED.num === item.ma_so_lo_status ? (
							<Tag color="warning">
								{valueOfeMachineSoftLogsStatus(item.ma_so_lo_status)}
							</Tag>
						) : eMachineSoftLogsStatus.UPDATED.num === item.ma_so_lo_status ? (
							<Tag color="success">
								{valueOfeMachineSoftLogsStatus(item.ma_so_lo_status)}
							</Tag>
						) : null
					)}
				</div>
			},
			{ title: "Thời gian cập nhật", sorter: (a, b) => moment(a.ma_so_lo_upgrade_at).unix() - moment(b.ma_so_lo_upgrade_at).unix(), dataIndex: "ma_so_lo_upgrade_at", key: 'version_update_at', render: (text: string, item: MachineSoftLogsDto) => <div>{!!item.ma_so_lo_upgrade_at ? moment(item.ma_so_lo_upgrade_at).format("DD/MM/YYYY - HH:mm:ss") : "Máy chưa được cập nhật phiên bản này!"}</div> },
		];
		return (
			<>
				<Table
					className='centerTable'
					rowClassName={(record, index) => (record.ma_so_id) ? "text-black" : "text-red"}
					loading={!this.state.isLoadDone}
					rowKey={record => "quanlymaybannuoc_index__" + JSON.stringify(record)}
					size={'small'}
					bordered={true}

					columns={columns}
					dataSource={machineSoftLogsServiceListResult !== undefined && machineSoftLogsServiceListResult!.length > 0 ? machineSoftLogsServiceListResult : []}
					pagination={this.props.pagination}
					onChange={(a, b, sort: SorterResult<MachineSoftLogsDto> | SorterResult<MachineSoftLogsDto>[]) => {
						if (!!this.props.changeColumnSort) {
							this.props.changeColumnSort(sort);
						}
					}}
				/>
			</>
		)
	}
}