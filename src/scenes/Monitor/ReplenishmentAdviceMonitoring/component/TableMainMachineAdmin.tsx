
import { EyeOutlined } from "@ant-design/icons";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import AppConsts, { EventTable } from "@src/lib/appconst";
import { MachineDto } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import { Button, Image, Table, Tag } from "antd";
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from "antd/lib/table";
import { TableRowSelection } from "antd/lib/table/interface";
import React from "react";
export interface IProps {
	machineListResult?: MachineDto[];
	pagination: TablePaginationConfig | false;
	hasAction?: boolean;
	actionTable?: (item: MachineDto, event: EventTable) => void;
	rowSelection?: TableRowSelection<MachineDto>
	is_printed?: boolean;
}
export default class TableMainMachineAdmin extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		visibleModalCreateUpdate: false,
		ma_id_selected: undefined,
		clicked: false,
		ma_id: undefined,
	};

	onAction = (item: MachineDto, action: EventTable) => {
		this.setState({ ma_id_selected: item.ma_id });
		const { actionTable } = this.props;
		if (actionTable !== undefined) {
			actionTable(item, action);
		}
	}
	handleVisibleChange = (visible, item: MachineDto) => {
		this.setState({ clicked: visible, ma_id: item.ma_id });
	}
	render() {
		const { machineListResult, hasAction, pagination, rowSelection } = this.props
		let action: ColumnGroupType<MachineDto> = {
			title: '', children: [], key: 'action_member_index', className: "no-print center", fixed: 'right', width: 50,
			render: (text: string, item: MachineDto) => (
				<div >
					<Button
						type="primary" icon={<EyeOutlined />} title={"Chi tiết trạng thái máy"}
						size='small'
						style={{ marginLeft: '10px', marginTop: '5px' }}
						onClick={() => this.onAction(item, EventTable.View)}
					></Button>
				</div >
			)
		}
		const columns: ColumnsType<MachineDto> = [
			{
				title: "STT", key: "stt_machine_index", width: 50, fixed: "left",
				render: (text: string, item: MachineDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div>
			},
			{
				title: 'Mã máy', dataIndex: '', key: 'ma_code', width: '5%',
				render: (text: string, item: MachineDto, index: number) => <div>{item.ma_code}</div>
			},
			{
				title: "Ảnh minh họa",
				key: "dr_id_drink_index",
				width: '7%',
				render: (text: string, item: MachineDto, index: number) => (
					<div style={{ textAlign: "center" }}>
						{(item.ma_bg_image < 1) ?
							<Image src={AppConsts.appBaseUrl + "/image/no_image.jpg"} height={100} width={100} />
							:
							<Image src={this.getFile(item.ma_bg_image)} height={100} width={100} />
						}
					</div>
				)
			},
			{
				title: 'Tên máy', key: 'ma_name', width: '6%',
				render: (text: string, item: MachineDto) => <div>{item.ma_display_name}</div>
			},
			{
				title: 'Nhóm máy', key: 'ma_name', width: '4%',
				render: (text: string, item: MachineDto) => <div>{stores.sessionStore.getNameGroupMachines(item.gr_ma_id)}</div>
			},
			{
				title: 'Người sở hữu', key: 'us_id_owner', width: '5%',
				render: (text: string, item: MachineDto) => <div>{stores.sessionStore.getUserNameById(item.us_id_owner)}</div>
			},
			{
				title: 'Số tiền SPCBB đã giao dịch (VNĐ)', key: 'ma_money',
				render: (text: string, item: MachineDto) => <div>{AppConsts.formatNumber(item.ma_money_drink)} </div>
			},
			{
				title: 'Số tiền SPKCBB đã giao dịch (VNĐ)', key: 'ma_fr_money',
				render: (text: string, item: MachineDto) => <div>{AppConsts.formatNumber(item.ma_money_freshdrink)}</div>
			},
			{
				title: 'Số lượng SPCBB đã được mua (chai/lon)', key: 'ma_no_drink',
				render: (text: string, item: MachineDto) => <div>{AppConsts.formatNumber(item.ma_no_drink)}</div>
			},
			{
				title: 'Dung tích SPKCBB đã được mua (ml)', key: 'ma_no_fr_drink',
				render: (text: string, item: MachineDto) => <div>{AppConsts.formatNumber(item.ma_no_fr_drink)}</div>
			},
			{
				title: 'Số lượng SPCBB đã được thêm vào (chai/lon)', key: 'ma_no_drink_change',
				render: (text: string, item: MachineDto) => <div>{AppConsts.formatNumber(item.ma_no_drink_change)}</div>
			},
			{
				title: 'Dung tích SPKCBB đã được thêm vào (ml)', key: 'ma_no_frdrink_change',
				render: (text: string, item: MachineDto) => <div>{AppConsts.formatNumber(item.ma_no_frdrink_change)}</div>
			},
			{
				title: 'Máy được phép sử dụng', key: 'ma_is_active',
				render: (text: string, item: MachineDto) => {
					if (this.props.is_printed == true) {
						return <div>{item.ma_is_active == true ? "Đang sử dụng" : "Không sử dụng"}</div>
					} else {
						return <div>{item.ma_is_active == true ? <Tag color="success" >Đang sử dụng</Tag> : <Tag color="error">Không sử dụng</Tag>}</div>
					}
				}
			},

		];

		if (hasAction != undefined && hasAction === true) {
			columns.push(action);
		}

		return (
			<>
				<Table
					className='centerTable'
					onRow={(record, rowIndex) => {
						return {
							onDoubleClick: (event: any) => { this.onAction(record!, EventTable.View) }
						};
					}}
					rowClassName={(record, index) => (record.ma_is_active) ? "text-black" : "text-red"}
					scroll={this.props.is_printed ? { x: undefined, y: undefined } : { x: 1500, y: 600 }}
					loading={!this.state.isLoadDone}
					rowKey={record => "quanlymaybannuoc_index__" + JSON.stringify(record)}
					size={'middle'}
					bordered={true}
					locale={{ "emptyText": 'Không có dữ liệu' }}
					columns={columns}
					rowSelection={hasAction != undefined ? rowSelection : undefined}
					dataSource={machineListResult != undefined && machineListResult!.length > 0 ? machineListResult : []}
					pagination={this.props.pagination}

				/>
			</>
		)
	}
}