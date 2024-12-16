import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { L } from "@src/lib/abpUtility";
import { MachineSoftLogsDto } from "@src/services/services_autogen";
import { Table, } from "antd";
import { TablePaginationConfig } from "antd/lib/table";
import moment from "moment";
import React from "react";
export interface IProps {
	is_printed?: boolean;
	pagination?: TablePaginationConfig | false;
	machineSoftLogsServiceListResult?: MachineSoftLogsDto[];
	isLoadDone?: boolean;
}
export default class TableHistoryUpdate extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		ma_id_selected: undefined,
	};

	render() {
		const { machineSoftLogsServiceListResult, pagination } = this.props;
		const columns = [
			{ title: L('N.O'), key: 'ma_index', render: (text: number, item: MachineSoftLogsDto, index: number) => <div>{index + 1}</div>, },
			{ title: "Phiên bản", key: 'version_update', render: (text: string, item: MachineSoftLogsDto) => <div>{item.ma_so_lo_preversion_name}</div> },
			{ title: "Mã phiên bản", key: 'version_update', render: (text: string, item: MachineSoftLogsDto) => <div>{item.ma_so_lo_preversion_code}</div> },
			{ title: "Thời gian cập nhật", key: 'version_update_at', render: (text: string, item: MachineSoftLogsDto) => <div>{moment(item.ma_so_lo_upgrade_at).format("DD/MM/YYYY - HH:mm:ss")}</div> },
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
					locale={{ "emptyText": 'Không có dữ liệu' }}
					columns={columns}
					dataSource={machineSoftLogsServiceListResult !== undefined && machineSoftLogsServiceListResult!.length > 0 ? machineSoftLogsServiceListResult : []}
					pagination={this.props.pagination}

				/>
			</>
		)
	}
}