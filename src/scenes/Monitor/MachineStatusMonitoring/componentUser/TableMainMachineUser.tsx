
import { CaretDownOutlined, EnvironmentOutlined, EyeOutlined, SendOutlined, UnorderedListOutlined } from "@ant-design/icons";
import GoogleMap from "@src/components/MapComponent";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { isGranted } from "@src/lib/abpUtility";
import AppConsts, { cssColResponsiveSpan, EventTable } from "@src/lib/appconst";
import { eMachineNetworkStatus, eMachineStatusMonitor, valueOfeMachineNetworkStatus, valueOfeMachineStatusMonitor, valueOfeMainBoard } from "@src/lib/enumconst";
import { MachineDto } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import { Button, Col, Image, Modal, Popover, Row, Space, Table, Tag, Tooltip, message } from "antd";
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from "antd/lib/table";
import { SorterResult, TableRowSelection } from "antd/lib/table/interface";
import React from "react";
import { Link } from "react-router-dom";
import MapComponent from "@src/components/MapComponent";
import moment from "moment";
import ReportOfMachine from "@src/scenes/GeneralManager/ReportOfMachine";
export interface IProps {
	machineListResult?: MachineDto[];
	pagination: TablePaginationConfig | false;
	hasAction?: boolean;
	actionTable?: (item: MachineDto, event: EventTable) => void;
	rowSelection?: TableRowSelection<MachineDto>
	is_printed?: boolean;
	changeColumnSort?: (fieldSort: SorterResult<MachineDto> | SorterResult<MachineDto>[]) => void;
}

export default class TableMainMachineUser extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		visibleModalCreateUpdate: false,
		ma_id_selected: undefined,
		clicked: false,
		ma_id: undefined,
		visibleModalGoogleMap: false,
		ma_gps_lat: 0,
		ma_gps_lng: 0,
		ma_mapUrl: '',
		ma_name: undefined,
		clickedAction: true,
		ma_id_hover: undefined,
		modalReportMachine: false,
	};

	onAction = async (item: MachineDto, action: EventTable) => {
		await this.setState({ ma_id_selected: item.ma_id });
		const { actionTable } = this.props;
		if (actionTable !== undefined) {
			actionTable(item, action);
		}
	}
	handleVisibleChange = (visible, item: MachineDto) => {
		this.setState({ clicked: visible, ma_id: item.ma_id });
	}

	isValidLocation = async (item: MachineDto, hasUrlMap: boolean) => {
		if (hasUrlMap) {
			await this.setState({ visibleModalGoogleMap: true, ma_mapUrl: item.ma_mapUrl, ma_name: item.ma_display_name, ma_gps_lat: 0, ma_gps_lng: 0 })
			return;
		}

		await this.setState({ visibleModalGoogleMap: true, ma_name: item.ma_display_name, ma_gps_lat: +item.ma_gps_lat!, ma_gps_lng: +item.ma_gps_lng! })
	};
	customTimeToDateAndHour = (time: number) => {
		if (time < 60) {
			return time + " phút";
		} else if (time < 1440) { // 1440 phút = 24 giờ
			return Math.floor(time / 60) + " giờ " + (time % 60) + " phút";
		} else {
			const days = Math.floor(time / 1440);
			const hours = Math.floor((time % 1440) / 60);
			return days + " ngày " + (hours ? hours + " giờ" : "");
		}
	};
	handleVisibleChangeAction = (visible, item: MachineDto) => {
		this.setState({ clickedAction: visible, ma_id_hover: item.ma_id });
	}
	render() {
		const { machineListResult, hasAction, pagination, rowSelection, is_printed } = this.props
		let action: ColumnGroupType<MachineDto> = {
			title: 'Chức năng', children: [], key: 'action_member_index', className: "no-print center", fixed: 'right', width: 100,
			render: (_: string, item: MachineDto) => (
				// <Popover style={{ width: 200 }} visible={this.state.clickedAction && this.state.ma_id_hover == item.ma_id} onVisibleChange={(e) => this.handleVisibleChangeAction(e, item)} placement="bottom" content={
				<Space>
					{isGranted(AppConsts.Permission.Pages_DailyMonitoring_MachineMonitor_Detail) &&
						<Button
							type="primary" icon={<EyeOutlined />}
							title={"Chi tiết trạng thái máy"}
							size='small'
							onClick={() => this.onAction(item, EventTable.View)}
						></Button>
					}
					{
						AppConsts.isValidLocation(item.ma_gps_lat, item.ma_gps_lng) ?
							<>
								<Button title='Vị trí'  size='small' icon={<EnvironmentOutlined />} onClick={(event) => {
									event.stopPropagation();
									this.isValidLocation(item, false);
								}}>
								</Button>
								<Button
									icon={<SendOutlined />} title={"Chỉ đường"}
									size='small'
									onClick={(e) => {
										AppConsts.actionDirection(item.ma_gps_lat!, item.ma_gps_lng!);
										e.stopPropagation();
									}}
								></Button>
							</>
							:
							item.ma_mapUrl ?
								<Button
									size='small'
									icon={<EnvironmentOutlined />} title={"Vị trí máy"}
									onClick={(e) => {
										e.stopPropagation();
										this.isValidLocation(item, true);
									}}
								></Button>
								: ""
					}
				</Space >
				// } trigger={"hover"} >
				// <Button size='small' icon={this.state.clickedAction && this.state.ma_id_hover == item.ma_id ? <CaretDownOutlined /> : <UnorderedListOutlined />}></Button>
				// </Popover>
			)
		}
		const columns: ColumnsType<MachineDto> = [
			{
				title: "STT", key: "stt_machine_index", width: 50,
				render: (text: string, item: MachineDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div>
			},
			{
				title: 'Nhóm máy', key: 'ma_name',
				render: (text: string, item: MachineDto) =>
					<div>

						{this.props.is_printed ? stores.sessionStore.getNameGroupMachines(item.gr_ma_id) :
							<div title="Chi tiết nhóm máy">
								<Link to={"/general/machine/?gr_id=" + (item.gr_ma_id)}
									target="_blank"
									rel="noopener noreferrer" onDoubleClick={() => this.onAction(item, EventTable.View)} >
									{stores.sessionStore.displayGroupMachineDisplayTable(item.gr_ma_id)}
								</Link>
							</div>
						}
					</div >
			},
			{
				title: 'Máy bán nước', dataIndex: '', key: 'ma_code',
				render: (text: string, item: MachineDto, index: number) => (
					<div>
						{this.props.is_printed ?
							<>
								<p style={{ margin: 0 }}>{item.ma_code}</p>
								<p style={{ margin: 0 }}>{item.ma_display_name}</p>
							</> :
							<div title="Thông tin máy">
								<Link to={"/general/machine/?machine=" + item.ma_code} target="_blank"
									rel="noopener noreferrer" onDoubleClick={() => this.onAction(item, EventTable.View)}>
									<p style={{ margin: 0 }}>{item.ma_code}</p>
									<p style={{
										textOverflow: "ellipsis",
										overflow: "hidden",
										display: "-webkit-box",
										WebkitLineClamp: 2,
										WebkitBoxOrient: "vertical",
										margin: 0,
										color: "gray",
									}}>{item.ma_display_name}</p>
								</Link>
							</div>
						}
					</div>
				)
			},
			{
				title: 'Người vận hành', key: 'us_id_operator',
				render: (text: string, item: MachineDto) => <div>{stores.sessionStore.getUserNameById(item.us_id_operator)}</div>
			},
			{
				title: 'Tình trạng máy', width: "10%", key: 'ma_networkStatus',
				dataIndex: 'ma_lastOnline_at', sorter: true,
				render: (text: string, item: MachineDto) => {
					const time = Math.abs(moment(item.ma_lastOnline_at).diff(moment(), 'minutes'));
					return (
						this.props.is_printed == false ?
							<>
								{time <= 5 && <Tag color="green" >{`${time == 0 ? "Trực tuyến" : `${time} phút trước`}`} </Tag>}
								{time > 5 && time <= 10 && <Tag color="orange">{this.customTimeToDateAndHour(time)} trước</Tag>}
								{time > 10 && <Tag color="red">{this.customTimeToDateAndHour(time)} trước</Tag>}
							</>
							:
							<>
								{time <= 5 && `${time == 0 ? "Trực tuyến" : `${time} phút trước`}`}
								{time > 5 && time <= 10 && `${this.customTimeToDateAndHour(time)} trước`}
								{time > 10 && `${this.customTimeToDateAndHour(time)} trước`}
							</>
					)
				}
			},
			{
				title: 'Trạng thái máy', width: 100, key: 'ma_targetTempRefrigeration',
				className: 'hoverCell',
				onCell: record => {
					return {
						onClick: () => { this.onAction(record, EventTable.Accept); this.setState({ modalReportMachine: true }) }
					}
				},
				render: (_: string, item: MachineDto) => <div title="Xem chi tiết">
					{this.props.is_printed == true ?
						<div>{item.ma_status == eMachineStatusMonitor.NORMAL.num ? valueOfeMachineStatusMonitor(item.ma_status) : valueOfeMachineStatusMonitor(item.ma_status)}</div>
						:
						<div>{item.ma_status == eMachineStatusMonitor.NORMAL.num ? <Tag style={{ cursor: "pointer" }} color="success" >{valueOfeMachineStatusMonitor(item.ma_status)}</Tag> : <Tag style={{ cursor: "pointer" }} color="error">{valueOfeMachineStatusMonitor(item.ma_status)}</Tag>}</div>
					}
				</div>
			},
			{
				title: 'Phiên bản', width: "10%", key: 'ma_targetTempRefrigeration',
				render: (text: string, item: MachineDto) => <>{item.ma_hardware_version_name}</>
			},
			// {
			// 	title: 'Trạng thái cửa', key: 'ma_targetTempRefrigeration',
			// 	render: (text: string, item: MachineDto) => <div>chua co 4P|</div>
			// },
			{
				title: 'Nhiệt độ (°C)', key: 'ma_targetTempRefrigeration',
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
				title: 'Mainboard Vending', key: 'ma_commandVending',
				render: (text: string, item: MachineDto) => <div>{valueOfeMainBoard(item.ma_commandVending)}</div>
			},
			{
				title: 'Mainboard Refill', key: 'ma_commandRefill',
				render: (text: string, item: MachineDto) => <div>{valueOfeMainBoard(item.ma_commandRefill)}</div>
			},
			{
				title: 'Bố cục', key: 'ma_layout',
				className: "hoverCell",
				onCell: (record) => {
					return {
						onClick: async () => {
							this.onAction(record, EventTable.ViewDetail)
						}
					}
				},
				render: (text: string, item: MachineDto) => <div title="Chi tiết bố cục">{item.ma_layout}</div>
			},
			{
				title: 'Lần cuối truy cập', key: 'ma_lastOnline_at', dataIndex: 'ma_lastOnline_at', sorter: true,
				render: (text: string, item: MachineDto) => <div>{moment(item.ma_lastOnline_at).format("DD/MM/YYYY HH:mm:ss")}</div>
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
					
					sortDirections={['ascend', 'descend']}
					columns={columns}
					onChange={(a, b, sort: SorterResult<MachineDto> | SorterResult<MachineDto>[]) => {
						if (!!this.props.changeColumnSort) {
							this.props.changeColumnSort(sort);
						}
					}}
					footer={() => (<>
						<Row gutter={8}>
							<Col {...cssColResponsiveSpan(24, 24, 24, 8, 8, 8)} style={{ border: '1px solid #e4e1e1', textAlign: 'center', fontSize: 14 }}>
								<span>Tổng số máy : <strong style={{ color: '#1DA57A' }}>{machineListResult != undefined ? machineListResult.length : 0}</strong></span>
								<br />
								<span>Số máy đang hoạt động: <strong style={{ color: '#1DA57A' }}>{machineListResult != undefined ? machineListResult.filter(item => item.ma_networkStatus == eMachineNetworkStatus.ONLINE.num).length : 0}</strong></span>
							</Col>
							<Col {...cssColResponsiveSpan(24, 24, 24, 8, 8, 8)} style={{ border: '1px solid #e4e1e1', textAlign: 'center', fontSize: 14 }} >
								<span>Số máy cảnh báo: <strong style={{ color: '#1DA57A' }}>{machineListResult != undefined ? machineListResult.filter(item => item.ma_networkStatus == eMachineNetworkStatus.Warning.num).length : 0}</strong></span>
								<br />
								<span>Số máy ngoại tuyến: <strong style={{ color: '#1DA57A' }}>{machineListResult != undefined ? machineListResult.filter(item => item.ma_networkStatus == eMachineNetworkStatus.OFFLINE.num).length : 0}</strong></span>
							</Col>
							<Col {...cssColResponsiveSpan(24, 24, 24, 8, 8, 8)} style={{ border: '1px solid #e4e1e1', textAlign: 'center', fontSize: 14 }} >
								<span>Số máy bình thường: <strong style={{ color: '#1DA57A' }}>{machineListResult != undefined ? machineListResult.filter(item => item.ma_status == eMachineStatusMonitor.NORMAL.num).length : 0}</strong></span>
								<br />
								<span>Số máy bất thường: <strong style={{ color: '#1DA57A' }}>{machineListResult != undefined ? machineListResult.filter(item => item.ma_status == eMachineStatusMonitor.ABNORMAL.num).length : 0}</strong></span>
							</Col>
						</Row>
					</>)}
					rowSelection={hasAction != undefined ? rowSelection : undefined}
					dataSource={machineListResult != undefined && machineListResult!.length > 0 ? machineListResult : []}
					pagination={this.props.pagination}
				/>
				<Modal
					centered
					visible={this.state.visibleModalGoogleMap}
					onCancel={() => this.setState({ visibleModalGoogleMap: false })}
					title={<h3>{"Vị trí máy: " + this.state.ma_name}</h3>}
					width={'70vw'}
					footer={null}
				>
					{(this.state.ma_gps_lat && this.state.ma_gps_lng) ?
						<MapComponent
							centerMap={{ lat: this.state.ma_gps_lat, lng: this.state.ma_gps_lng }}
							zoom={15}
							positionList={[{ lat: this.state.ma_gps_lat, lng: this.state.ma_gps_lng, title: "Vị trí máy" }]}
						/>
						:
						<div dangerouslySetInnerHTML={{ __html: this.state.ma_mapUrl! }} />
					}
				</Modal>
				<Modal
					centered
					visible={this.state.modalReportMachine}
					onCancel={() => this.setState({ modalReportMachine: false })}
					width={'90vw'}
					footer={null}
					destroyOnClose
				>
					<ReportOfMachine ma_id={this.state.ma_id_selected!} />
				</Modal>
			</>
		)
	}
}