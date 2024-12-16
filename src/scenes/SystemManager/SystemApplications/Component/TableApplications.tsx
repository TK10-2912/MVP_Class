import * as React from 'react';
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { Button, Card, Table } from "antd";
import { ApplicationExtDto } from '@src/services/services_autogen';
import { EventTable } from '@src/lib/appconst';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { L } from '@src/lib/abpUtility';
import { DeleteFilled, EditOutlined } from '@ant-design/icons';

export interface IProps {
	actionTable?: (item: ApplicationExtDto, event: EventTable) => void;
	pagination: TablePaginationConfig | false;
	isLoadDone?: boolean;
	applicationListResult?: ApplicationExtDto[];

}

export default class TableApplications extends AppComponentBase<IProps> {
	state = {
		ap_id_selected: undefined,
	}

	onAction = (item: ApplicationExtDto, action: EventTable) => {
		this.setState({ ap_id_selected: item.ap_id });
		const { actionTable } = this.props;
		if (actionTable !== undefined) {
			actionTable(item, action);
		}
	}

	render() {
		const { actionTable, applicationListResult, pagination } = this.props;

		let action = {
			title: <b>{L("chuc_nang")}</b>, dataIndex: "", key: "action",
			render: (text: string, item: ApplicationExtDto) => (
				<div style={{ textAlign: "center" }}>
					<Button size='small' icon={<EditOutlined />}
						type="primary"
						title={L("chinh_sua")}
						onClick={() => this.onAction(item!, EventTable.Edit)}
					></Button>
					<Button
						style={{ marginLeft: '10px', }}
						danger icon={<DeleteFilled />}
						size='small'
						title={L("xoa")}
						onClick={() => this.onAction(item!, EventTable.Delete)}
					></Button>
				</div>
			)
		}
		const columns: ColumnsType<ApplicationExtDto> = [
			{ key: "no_application_index", title: <b>{L("stt")}</b>, render: (text: string, item: ApplicationExtDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
			{ key: "code ", title: <b>{L("ma")}</b>, render: (text: string, item: ApplicationExtDto) => <div>{item.ap_code}</div> },
			{ key: "ap_callback_url", title: <b> {L("duong_dan_url")}</b>, render: (text: string, item: ApplicationExtDto) => <div>{item.ap_callback_url}</div> },
			{ key: "ap_secret", title: <b>{L("ma_bao_mat")}</b>, render: (text: string, item: ApplicationExtDto) => <div>{item.ap_secret}</div> },
			{ key: "ap_trust", title: <b>{L("tin_tuong")}</b>, render: (text: string, item: ApplicationExtDto) => <div>{item.ap_trust == true ? (L('true')) : (L('false'))}</div> },
			{ key: "ap_confidential", title: <b>{L("cong_khai")}</b>, render: (text: string, item: ApplicationExtDto) => <div>{item.ap_confidential == true ? (L('true')) : (L('false'))}</div> },
		]
		if (actionTable != undefined) {
			columns.push(action);
		}
		return (

			<Card>
				<Table
					// sticky
					className='centerTable'
					bordered={true}
					onRow={(record, rowIndex) => {
						return {
							onDoubleClick: (event: any) => { this.onAction(record!, EventTable.RowDoubleClick) }
						};
					}}
					rowClassName={(record, index) => (this.state.ap_id_selected === record.ap_id) ? "bg-click" : "bg-white"}
					loading={!this.props.isLoadDone}
					size={'middle'}
					locale={{ "emptyText": L('khong_co_du_lieu') }}
					pagination={this.props.pagination}
					rowKey={record => "application_table_" + JSON.stringify(record)}
					columns={columns}
					dataSource={applicationListResult!.length > 0 ? applicationListResult : []}
				/>
			</Card>


		)
	}
}