
import { EnvironmentOutlined } from "@ant-design/icons";
import GoogleMap from "@src/components/MapComponent";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import AppConsts, { EventTable } from "@src/lib/appconst";
import { eMachineNetworkStatus, valueOfeMachineNetworkStatus } from "@src/lib/enumconst";
import { BillingOfMachineDto } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import { Modal, Table, Tag, message, } from "antd";
import { ColumnsType, TablePaginationConfig } from "antd/lib/table";
import React from "react";
import { Link } from "react-router-dom";
import MapComponent from "@src/components/MapComponent";
import HistoryHelper from "@src/lib/historyHelper";
export interface IProps {
	billingOfMachine?: BillingOfMachineDto[];
	pagination: TablePaginationConfig | false;
	actionTable?: (item: BillingOfMachineDto, event: EventTable) => void;
	is_printed?: boolean;
	start_date?: any;
	end_date?: any;
}
export default class TableSaleMonitoring extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		visibleModalCreateUpdate: false,
		key_selected: undefined,
		clicked: false,
		key: undefined,
		visibleModalGoogleMap: false,
		ma_gps_lat: 0,
		ma_gps_lng: 0,
		ma_name: undefined,
	};
	onAction = (item: BillingOfMachineDto, action: EventTable) => {
		const { actionTable } = this.props;
		if (actionTable !== undefined) {
			actionTable(item, action);
		}
	}

	isValidLocation = (item: BillingOfMachineDto) => {
		if (item.ma_gps_lat == "0.0" && item.ma_gps_lng == "0.0") {
			message.warning("Chưa có dữ liệu về vị trí máy bán nước này")
			return false;
		}
		if (isNaN(+item.ma_gps_lat!) || isNaN(+item.ma_gps_lng!) || +item.ma_gps_lat! < 0 || +item.ma_gps_lng! < 0) {
			message.warning("Dữ liệu map không hợp lệ");
			return false;
		}
		this.setState({ visibleModalGoogleMap: true, ma_name: item.ten_may, ma_gps_lat: +item.ma_gps_lat!, ma_gps_lng: +item.ma_gps_lng! })
	};

	render() {
		const { billingOfMachine, pagination, is_printed } = this.props
		const columns: ColumnsType<BillingOfMachineDto> = [
			{
				title: "STT", key: "stt_machine_index", width: 50, fixed: 'left',
				render: (text: string, item: BillingOfMachineDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div>,
			},
			{
				title: "Nhóm máy", key: "stt_machine_index",
				render: (text: string, item: BillingOfMachineDto, index: number) => <div>{stores.sessionStore.getNameGroupMachinesStatistic(item.ten_nhom)}</div>
			},
			{
				title: "Mã máy ", key: "stt_machine_index",
				render: (text: string, item: BillingOfMachineDto, index: number) => <div>{item.ma_may}</div>
			},
			{
				title: "Tên máy", key: "stt_machine_index",
				render: (text: string, item: BillingOfMachineDto, index: number) => <div>{item.ten_may}</div>
			},
			{
				title: "Người sở hữu", key: "stt_machine_index",
				render: (text: string, item: BillingOfMachineDto, index: number) => <div>
					{is_printed ? stores.sessionStore.getUserNameById(item.us_id_owner) :
						<Link to={"/general/machine/?us_id_list=" + (item.us_id_owner)} onDoubleClick={() => this.onAction(item, EventTable.View)} >
							{stores.sessionStore.getUserNameById(item.us_id_owner)}
						</Link>
					}
				</div>
			},

			{
				title: "Tình trạng máy", key: "stt_machine_index",
				render: (text: string, item: BillingOfMachineDto, index: number) => {
					if (this.props.is_printed == true) {
						return <div>{item.ma_networkStatus == eMachineNetworkStatus.ONLINE.num ? valueOfeMachineNetworkStatus(item.ma_networkStatus) : valueOfeMachineNetworkStatus(item.ma_networkStatus)}</div>
					} else {
						return <div>{item.ma_networkStatus == eMachineNetworkStatus.ONLINE.num ? <Tag color="success" >{valueOfeMachineNetworkStatus(item.ma_networkStatus)}</Tag> : <Tag color="error">{valueOfeMachineNetworkStatus(item.ma_networkStatus)}</Tag>}</div>
					}
				}
			},
			{
				title: "Tổng tiền sản phẩm (VNĐ)",dataIndex:"tong_tien_san_pham", key: "tong_tien_san_pham",sorter: (a, b) => a.tong_tien_san_pham - b.tong_tien_san_pham,
				render: (text: string, item: BillingOfMachineDto, index: number) => <div>{AppConsts.formatNumber(item.tong_tien_san_pham)}</div>
			},
			{
				title: "Tổng tiền được nhận (VNĐ)",dataIndex:"tong_tien_duoc_nhan", key: "stt_machine_index",sorter: (a, b) => a.tong_tien_duoc_nhan - b.tong_tien_duoc_nhan,
				render: (text: string, item: BillingOfMachineDto, index: number) => <div>{AppConsts.formatNumber(item.tong_tien_duoc_nhan)}</div>
			},
			{
				title: "Số đơn hàng đã bán",dataIndex:"so_luong_ban", key: "stt_machine_index",sorter: (a, b) => a.so_luong_ban - b.so_luong_ban,
				render: (text: string, item: BillingOfMachineDto, index: number) => <div>{AppConsts.formatNumber(item.so_luong_ban)}</div>
			},
			{
				title: "Tổng tiền giảm giá (VNĐ)",dataIndex:"tong_tien_giam_gia", key: "stt_machine_index",sorter: (a, b) => a.tong_tien_giam_gia - b.tong_tien_giam_gia,
				render: (text: string, item: BillingOfMachineDto, index: number) => <div>{AppConsts.formatNumber(item.tong_tien_giam_gia)}</div>
			},
			{
				title: "Số mã giảm giá đã dùng",dataIndex:"so_luong_ma_giam_gia", key: "stt_machine_index",sorter: (a, b) => a.so_luong_ma_giam_gia - b.so_luong_ma_giam_gia,
				render: (text: string, item: BillingOfMachineDto, index: number) => <div>{AppConsts.formatNumber(item.so_luong_ma_giam_gia)}</div>
			},
			...(is_printed
				? []
				: [
					{
						title: 'Vị trí', key: 'ma_located', className: "hoverCell", width: 60,
						onCell: (item: BillingOfMachineDto) => {
							return {
								onClick: () => { this.isValidLocation(item) }
							}
						},
						render: (text: string, item: BillingOfMachineDto) => <img  width={35}  src={process.env.PUBLIC_URL + "/location.png"}></img>

					},
				]),
		];

		return (
			<>
				<Table
					onRow={(record, rowIndex) => {
						return {
							onClick: () => {
								const { start_date, end_date } = this.props;
								const machineId = Number(stores.sessionStore.getIdMachine(record.ma_may!));
								const groupId = stores.sessionStore.getIDGroupUseName(record.ten_nhom!);
								const url = `/history/transaction_detail?startDate=${start_date}&endDate=${end_date}&gr_id=${groupId}&ma_list_id=${machineId}`;
								HistoryHelper.redirect(url);
							}
						};
					}}
					className='centerTable'
					rowClassName={(record, index) => (this.state.key_selected === record.key) ? "bg-click" : "bg-white"}
					scroll={this.props.is_printed ? { x: undefined, y: undefined } : { x: 1000, y: 600 }}
					loading={!this.state.isLoadDone}
					rowKey={record => "quanlymaybannuoc_index__" + JSON.stringify(record)}
					size={'middle'}
					bordered={true}
					locale={{ "emptyText": 'Không có dữ liệu' }}
					columns={columns}
					dataSource={billingOfMachine != undefined && billingOfMachine!.length > 0 ? billingOfMachine : []}
					pagination={this.props.pagination}

				/>
				<Modal
					centered
					visible={this.state.visibleModalGoogleMap}
					onCancel={() => this.setState({ visibleModalGoogleMap: false })}
					title={<h3>{"Vị trí máy " + this.state.ma_name}</h3>}
					width={'70vw'}
					//closable={false}
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