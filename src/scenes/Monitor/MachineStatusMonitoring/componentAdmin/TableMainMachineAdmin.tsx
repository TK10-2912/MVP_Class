
import { EnvironmentOutlined, EyeOutlined } from "@ant-design/icons";
import GoogleMap from "@src/components/MapComponent";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { isGranted } from "@src/lib/abpUtility";
import AppConsts, { EventTable } from "@src/lib/appconst";
import { eMachineNetworkStatus, eMachineStatusMonitor, valueOfeMachineNetworkStatus, valueOfeMachineStatusMonitor } from "@src/lib/enumconst";
import { MachineDto } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import { Button, Modal, Table, Tag, message } from "antd";
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from "antd/lib/table";
import { TableRowSelection } from "antd/lib/table/interface";
import React from "react";
import { Link } from "react-router-dom";
import MapComponent from "@src/components/MapComponent";
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
		visibleModalGoogleMap: false,
		ma_gps_lat: 0,
		ma_gps_lng: 0,
		ma_name: undefined,
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

	isValidLocation = (item: MachineDto) => {
		if (item.ma_gps_lat == "0.0" && item.ma_gps_lng == "0.0") {
			message.warning("Chưa có dữ liệu về vị trí máy bán nước này")
			return false;
		}
		if (isNaN(+item.ma_gps_lat!) || isNaN(+item.ma_gps_lng!) || +item.ma_gps_lat! < 0 || +item.ma_gps_lng! < 0) {
			message.warning("Dữ liệu map không hợp lệ");
			return false;
		}
		this.setState({ visibleModalGoogleMap: true, ma_name: item.ma_display_name, ma_gps_lat: +item.ma_gps_lat!, ma_gps_lng: +item.ma_gps_lng! })
	};

	render() {
		const { machineListResult, hasAction, pagination, rowSelection, is_printed } = this.props
		let action: ColumnGroupType<MachineDto> = {
			title: '', children: [], key: 'action_member_index', className: "no-print center", fixed: 'right', width: 50,
			render: (text: string, item: MachineDto) => (
				<div >
					{isGranted(AppConsts.Permission.Pages_DailyMonitoring_MachineMonitor_Detail) &&
						<Button
							type="primary" icon={<EyeOutlined />} title={"Chi tiết trạng thái máy"}
							size='small'
							style={{ marginLeft: '10px', marginTop: '5px' }}
							onClick={() => this.onAction(item, EventTable.View)}
						></Button>
					}
				</div >
			)
		}
		const columns: ColumnsType<MachineDto> = [
			{
				title: "STT", key: "stt_machine_index", width: 50,
				render: (text: string, item: MachineDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div>
			},
			{
				title: 'Nhóm máy', key: 'ma_name',
				render: (text: string, item: MachineDto) => <div>
					{this.props.is_printed ? stores.sessionStore.getNameGroupMachines(item.gr_ma_id) :
						<Link to={"/general/machine/?gr_id=" + (item.gr_ma_id)} onDoubleClick={() => this.onAction(item, EventTable.View)} >
							{stores.sessionStore.getNameGroupMachines(item.gr_ma_id)}
						</Link>
					}
				</div >
			},
			{
				title: 'Mã máy', dataIndex: '', key: 'ma_code',
				render: (text: string, item: MachineDto, index: number) => (
					<div>
						{this.props.is_printed ? item.ma_code :
							<Link to={"/general/machine/?machine=" + item.ma_code} onDoubleClick={() => this.onAction(item, EventTable.View)}>
								{item.ma_code}
							</Link>
						}

					</div>
				)
			},
			{
				title: 'Tên máy', dataIndex: '', key: 'ma_display_name',
				render: (text: string, item: MachineDto, index: number) => (
					<div>
						{this.props.is_printed ? item.ma_display_name :
							<Link to={"/general/machine/?machine=" + item.ma_code} onDoubleClick={() => this.onAction(item, EventTable.View)} >
								{item.ma_display_name}
							</Link>
						}
					</div>
				)
			},
			{
				title: 'Người sở hữu', key: 'us_id_owner',
				render: (text: string, item: MachineDto) => <div>
					{this.props.is_printed ? stores.sessionStore.getUserNameById(item.us_id_owner) :
						<Link to={"/general/machine/?us_id_list=" + (item.us_id_owner)} onDoubleClick={() => this.onAction(item, EventTable.View)} >
							{stores.sessionStore.getUserNameById(item.us_id_owner)}
						</Link>
					}
				</div>
			},
			{
				title: 'Tình trạng máy', width: "10%", key: 'ma_networkStatus',
				render: (text: string, item: MachineDto) => {
					if (this.props.is_printed == true) {
						return <div>{item.ma_networkStatus == eMachineNetworkStatus.ONLINE.num ? valueOfeMachineNetworkStatus(item.ma_networkStatus) : valueOfeMachineNetworkStatus(item.ma_networkStatus)}</div>
					} else {
						return <div>{item.ma_networkStatus == eMachineNetworkStatus.ONLINE.num ? <Tag color="success" >{valueOfeMachineNetworkStatus(item.ma_networkStatus)}</Tag> : <Tag color="error">{valueOfeMachineNetworkStatus(item.ma_networkStatus)}</Tag>}</div>
					}
				}
			},
			{
				title: 'Trạng thái', width: "10%", key: 'ma_targetTempRefrigeration',
				render: (text: string, item: MachineDto) => {
					if (this.props.is_printed == true) {
						return <div>{item.ma_status == eMachineStatusMonitor.NORMAL.num ? valueOfeMachineStatusMonitor(item.ma_status) : valueOfeMachineStatusMonitor(item.ma_status)}</div>
					} else {
						return <div>{item.ma_status == eMachineStatusMonitor.NORMAL.num ? <Tag color="success" >{valueOfeMachineStatusMonitor(item.ma_status)}</Tag> : <Tag color="error">{valueOfeMachineStatusMonitor(item.ma_status)}</Tag>}</div>
					}
				}
			},
			// {
			// 	title: 'Trạng thái cửa', key: 'ma_targetTempRefrigeration',
			// 	render: (text: string, item: MachineDto) => <div>chua co 4P|</div>
			// },
			{
				title: 'Nhiệt độ(°C)', key: 'ma_targetTempRefrigeration',
				render: (text: string, item: MachineDto) => <div>{item.ma_targetTempRefrigeration}</div>
			},
			{
				title: 'Đèn', key: 'ma_turnOnLedVending',
				render: (text: string, item: MachineDto) => {
					if (this.props.is_printed == true) {
						return <div>{item.ma_turnOnLedVending == true ? "Bật" : "Tắt"}</div>
					} else {
						return <div>{item.ma_turnOnLedVending == true ? <Tag color="success" >Bật</Tag> : <Tag color="error">Tắt</Tag>}</div>
					}
				}
			},
			{
				title: 'Cảm biến rơi', key: 'ma_hasDropSensor',
				render: (text: string, item: MachineDto) => {
					if (this.props.is_printed == true) {
						return <div>{item.ma_hasDropSensor == true ? "Bật" : "Tắt"}</div>
					} else {
						return <div>{item.ma_hasDropSensor == true ? <Tag color="success" >Bật</Tag> : <Tag color="error">Tắt</Tag>}</div>
					}
				}
			},
			{
				title: 'Cảm biến lưu lượng', key: 'ma_hasRefillSensor',
				render: (text: string, item: MachineDto) => {
					if (this.props.is_printed == true) {
						return <div>{item.ma_hasRefillSensor == true ? "Bật" : "Tắt"}</div>
					} else {
						return <div>{item.ma_hasRefillSensor == true ? <Tag color="success" >Bật</Tag> : <Tag color="error">Tắt</Tag>}</div>
					}
				}
			},
			...(is_printed
				? []
				: [
					{
						title: 'Vị trí', key: 'ma_located', className: "hoverCell",
						onCell: (item: MachineDto) => {
							return {
								onClick: () => { this.isValidLocation(item) }
							}
						},
						render: (text: string, item: MachineDto) => <img  width={35}  src={process.env.PUBLIC_URL + "/location.png"} />

					},
				]),

		];
		if (hasAction != undefined && hasAction === true && isGranted(AppConsts.Permission.Pages_DailyMonitoring_MachineMonitor_Detail)) {
			columns.push(action);
		}

		return (
			<>
				<Table
					className='centerTable'
					onRow={(record, rowIndex) => {
						return {
							onDoubleClick: (event: any) => {
								isGranted(AppConsts.Permission.Pages_DailyMonitoring_MachineMonitor_Detail) &&
									this.onAction(record!, EventTable.View)
							}
						};
					}}
					scroll={this.props.is_printed ? { x: undefined, y: undefined } : { x: 1000, y: 600 }}
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
				<Modal
					centered
					visible={this.state.visibleModalGoogleMap}
					onCancel={() => this.setState({ visibleModalGoogleMap: false })}
					title={<h3>{"Vị trí máy " + this.state.ma_name}</h3>}
					width={'70vw'}
					footer={null}
				>
					<MapComponent
						centerMap={{ lat: this.state.ma_gps_lat, lng: this.state.ma_gps_lng }}
						zoom={15}
						positionList={[{ lat: this.state.ma_gps_lat, lng: this.state.ma_gps_lng,title:"Vị trí máy" }]}
					/>
				</Modal>
			</>
		)
	}
}