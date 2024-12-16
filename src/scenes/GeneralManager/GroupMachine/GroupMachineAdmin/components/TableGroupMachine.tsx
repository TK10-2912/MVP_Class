import { ClusterOutlined, DeleteFilled, EditOutlined } from "@ant-design/icons";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { isGranted } from "@src/lib/abpUtility";
import AppConsts, { EventTable } from "@src/lib/appconst";
import { GroupMachineDto } from "@src/services/services_autogen";
import { Button, Table } from "antd";
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from "antd/lib/table";
import React from "react";
export interface IProps {
	groupMachineListResult?: GroupMachineDto[];
	pagination: TablePaginationConfig | false;
	hasAction?: boolean;
	actionTable?: (item: GroupMachineDto, event: EventTable) => void;
}
export default class TableGroupMachineAdmin extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		visibleModalCreateUpdate: false,
		gr_ma_id_selected: undefined,

	};
	machineSelected: GroupMachineDto = new GroupMachineDto();

	onAction = (item: GroupMachineDto, action: EventTable) => {
		this.setState({ ma_id_selected: item.gr_ma_id });
		const { actionTable } = this.props;
		if (actionTable !== undefined) {
			actionTable(item, action);
		}
	}

	render() {
		const { groupMachineListResult, hasAction, pagination } = this.props;
		let action: ColumnGroupType<GroupMachineDto> = {
			title: 'Chức năng', children: [], key: 'action_member_index', className: "no-print center", width: 150,
			render: (text: string, item: GroupMachineDto) => (
				<div >
					{isGranted(AppConsts.Permission.Pages_Manager_General_GroupMachine_Update) &&
						<Button
							type="primary" icon={<EditOutlined />} title={"Chỉnh sửa"}
							size='small'
							style={{ marginLeft: '10px', marginTop: '5px' }}
							onClick={() => this.onAction(item, EventTable.Edit)}
						></Button>
					}
					<Button
						type="primary" icon={<ClusterOutlined />} title={"Danh sách máy thuộc nhóm máy  " + item.gr_ma_area}
						size='small'
						style={{ marginLeft: '10px', marginTop: '5px' }}
						onClick={() => this.onAction(item, EventTable.View)}
					></Button>
					{isGranted(AppConsts.Permission.Pages_Manager_General_GroupMachine_Delete) &&
						<Button
							danger
							icon={<DeleteFilled />} title={"Xoá"}
							size='small'
							style={{ marginLeft: '10px', marginTop: '5px' }}
							onClick={() => this.onAction(item, EventTable.Delete)}
						></Button>
					}
				</div >
			)
		}
		const columns: ColumnsType<GroupMachineDto> = [
			{
				title: "STT", key: "stt_machine_index", width: 50, fixed: "left",
				render: (text: string, item: GroupMachineDto, index: number) => <div>{pagination !== false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div>
			},
			{
				title: 'Vùng', dataIndex: '', key: 'gr_ma_area',
				render: (text: string, item: GroupMachineDto, index: number) => <div>{item.gr_ma_area}</div>
			},
			{
				title: 'Mô tả', key: 'ma_passcode',
				render: (text: string, item: GroupMachineDto) => <div dangerouslySetInnerHTML={{ __html: item.gr_ma_desc! }}></div>
			},
		];

		if (hasAction !== undefined && hasAction === true) {
			columns.push(action);
		}

		return (
			<>
				<Table
					// sticky
					className='centerTable'
					onRow={(record, rowIndex) => {
						return {
							onDoubleClick: (event: any) => { this.onAction(record!, EventTable.RowDoubleClick) }
						};
					}}
					rowClassName={(record, index) => (record.gr_ma_id) ? "text-black" : "text-red"}
					loading={!this.state.isLoadDone}
					rowKey={record => "quanlymaybannuoc_index__" + JSON.stringify(record)}
					size={'middle'}
					bordered={true}
					locale={{ "emptyText": 'Không có dữ liệu' }}
					columns={columns}
					dataSource={groupMachineListResult !== undefined && groupMachineListResult!.length > 0 ? groupMachineListResult : []}
					pagination={this.props.pagination}

				/>
			</>
		)
	}
}