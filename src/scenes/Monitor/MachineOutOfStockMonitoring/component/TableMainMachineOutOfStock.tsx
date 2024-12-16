import React from "react";
import GoogleMap from "@src/components/MapComponent";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import AppConsts, { EventTable } from "@src/lib/appconst";
import { MachineOutOfStockQueryDto, ProductDailyMonitoringDto, ProductDto } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import { Button, Modal, Popover, Table, message } from "antd";
import { ColumnsType, TablePaginationConfig } from "antd/lib/table";
import { TableRowSelection } from "antd/lib/table/interface";
import { EnvironmentOutlined, EyeOutlined, } from "@ant-design/icons";
import { Link } from "react-router-dom";
import DetailProductOfMachine from "./DetailProductOfMachine";
import MapComponent from "@src/components/MapComponent";
export interface IProps {
	machineOutOfStockQueryDto?: MachineOutOfStockQueryDto[];
	pagination: TablePaginationConfig | false;
	hasAction?: boolean;
	actionTable?: (item: MachineOutOfStockQueryDto, event: EventTable) => void;
	rowSelection?: TableRowSelection<MachineOutOfStockQueryDto>
	is_printed?: boolean;
}
export default class TableMainMachineOutOfStock extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		key_selected: undefined,
		visibleModalGoogleMap: false,
		ma_gps_lat: 0,
		ma_gps_lng: 0,
		ma_name: undefined,
		visibleDetailProduct: false,
	};
	productResult: ProductDailyMonitoringDto[] = [];
	onAction = (item: MachineOutOfStockQueryDto, action: EventTable) => {
		this.setState({ key_selected: item.key });
		const { actionTable } = this.props;
		if (actionTable !== undefined) {
			actionTable(item, action);
		}
	}
	isValidLocation = (item: MachineOutOfStockQueryDto) => {
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
		const contentSPSapHetHang = <h3 style={{ color: "orange" }}>Khay còn dưới <strong>3</strong> sản phẩm là khay sắp hết hàng</h3>
		const contentBinhChuaSapHetHang = <h3 style={{ color: "orange" }}>Bình chứa còn dưới <strong>2000</strong> ml là Bình chứa sắp hết hàng</h3>

		const { machineOutOfStockQueryDto, hasAction, pagination, rowSelection, is_printed } = this.props
		const columns: ColumnsType<MachineOutOfStockQueryDto> = [
			{
				title: "STT", key: "stt_machine_index", width: 50, fixed: "left",
				render: (text: string, item: MachineOutOfStockQueryDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div>
			},
			{
				title: 'Nhóm máy', key: 'ma_name', width: 150,
				render: (text: string, item: MachineOutOfStockQueryDto) => <div>
					{this.props.is_printed ? stores.sessionStore.getNameGroupMachinesStatistic(item.ten_nhom) :
						<Link target="_blank" to={"/general/machine/?gr_id=" + stores.sessionStore.getIdGroupMachinesStatistic(item.ten_nhom)} onDoubleClick={() => this.onAction(item, EventTable.View)} >
							{stores.sessionStore.getNameGroupMachinesStatistic(item.ten_nhom)}
						</Link>
					}
				</div>
			},
			{
				title: 'Mã máy', dataIndex: '', key: 'ma_code', width: 150,
				render: (text: string, item: MachineOutOfStockQueryDto, index: number) => <div>
					{this.props.is_printed ? item.ma_may :
						<Link target="_blank" to={"/general/machine/?machine=" + item.ma_may} onDoubleClick={() => this.onAction(item, EventTable.View)}>
							{item.ma_may}
						</Link>
					}
				</div>
			},
			{
				title: 'Tên máy', key: 'ma_name', width: 150,
				render: (text: string, item: MachineOutOfStockQueryDto) => <div>
					{this.props.is_printed ? item.ten_may :
						<Link target="blank" to={"/general/machine/?machine=" + item.ma_may} onDoubleClick={() => this.onAction(item, EventTable.View)}>
							{item.ten_may}
						</Link>
					}
				</div>
			},
			
			{
				title: 'Người sở hữu', key: 'us_id_owner', width: 150,
				render: (text: string, item: MachineOutOfStockQueryDto) => <div>
					{this.props.is_printed ? stores.sessionStore.getUserNameById(item.us_id_owner) :
						<Link target="_blank" to={"/general/machine/?us_id_list=" + (item.us_id_owner)} onDoubleClick={() => this.onAction(item, EventTable.View)} >
							{stores.sessionStore.getUserNameById(item.us_id_owner)}
						</Link>
					}
				</div>
			},
			{
				title: 'Sản phẩm có bao bì', key: 'ma_name', children: [
					{
						title: 'Số lượng khay sắp hết hàng', key: 'ma_money', width: 110,
						onCell: (item: MachineOutOfStockQueryDto) => {
							return {
								onClick: (e) => {
									this.productResult = item.vending_so_luong_sap_het_hang!;
									if (this.productResult.length > 0) {
										this.setState({ visibleDetailProduct: true })
									}
									else message.error("Không có sản phẩm")
								}
							}
						},
						render: (text: string, item: MachineOutOfStockQueryDto) => <div style={{ color: "orange" }}><Popover content={contentSPSapHetHang}>{AppConsts.formatNumber(item.vending_so_luong_sap_het_hang?.length)}</Popover> </div>
					},
					{
						title: 'Số lượng khay hết hàng', key: 'ma_money', width: 110,
						onCell: (item: MachineOutOfStockQueryDto) => {
							return {
								onClick: (e) => {
									this.productResult = item.vending_so_luong_het_hang!;
									if (this.productResult.length > 0) {
										this.setState({ visibleDetailProduct: true })
									}
									else message.error("Không có sản phẩm")
								}
							}
						},
						render: (text: string, item: MachineOutOfStockQueryDto) => <div style={{ color: "red" }}>{AppConsts.formatNumber(item.vending_so_luong_het_hang?.length)} </div>
					},
					{
						title: 'Số lượng khay chưa có hàng', key: 'ma_money', width: 110,
						onCell: (item: MachineOutOfStockQueryDto) => {
							return {
								onClick: (e) => {
									this.productResult = item.vending_so_luong_chua_co_hang!;
									if (this.productResult.length > 0) {
										this.setState({ visibleDetailProduct: true })
									}
									else message.error("Không có sản phẩm")
								}
							}
						},
						render: (text: string, item: MachineOutOfStockQueryDto) => <div>{AppConsts.formatNumber(item.vending_so_luong_chua_co_hang?.length)} </div>
					},
				]
			},
			{
				title: 'Sản phẩm không có bao bì', key: 'ma_name', children: [
					{
						title: 'Số bình chứa sắp hết hàng', key: 'ma_money', width: 110,
						onCell: (item: MachineOutOfStockQueryDto) => {
							return {
								onClick: (e) => {
									this.productResult = item.refill_so_luong_sap_het_hang!;
									if (this.productResult.length > 0) {
										this.setState({ visibleDetailProduct: true })
									}
									else message.error("Không có sản phẩm")
								}
							}
						},
						render: (text: string, item: MachineOutOfStockQueryDto) => <div style={{ color: "orange" }}><Popover content={contentBinhChuaSapHetHang}>{AppConsts.formatNumber(item.refill_so_luong_sap_het_hang?.length)}</Popover> </div>
					},
					{
						title: 'Số bình chứa hết hàng', key: 'ma_money', width: 110,
						onCell: (item: MachineOutOfStockQueryDto) => {
							return {
								onClick: (e) => {
									this.productResult = item.refill_so_luong_het_hang!;
									if (this.productResult.length > 0) {
										this.setState({ visibleDetailProduct: true })
									}
									else message.error("Không có sản phẩm")
								}
							}
						},
						render: (text: string, item: MachineOutOfStockQueryDto) => <div style={{ color: "red" }}>{AppConsts.formatNumber(item.refill_so_luong_het_hang?.length)} </div>
					},
					{
						title: 'Số bình chứa chưa có hàng', key: 'ma_money', width: 110,
						onCell: (item: MachineOutOfStockQueryDto) => {
							return {
								onClick: (e) => {
									this.productResult = item.refill_so_luong_chua_co_hang!;

								}
							}
						},
						render: (text: string, item: MachineOutOfStockQueryDto) => <div>{AppConsts.formatNumber(item.refill_so_luong_chua_co_hang?.length)} </div>
					},
				]
			},
			...(is_printed
				? []
				: [
					{
						title: 'Vị trí', key: 'ma_name', className: "hoverCell", width: 100,
						onCell: (item: MachineOutOfStockQueryDto) => {
							return { onClick: () => this.isValidLocation(item) }
						},


						// render: (text: string, item: MachineOutOfStockQueryDto) => <img  width={35}  src={process.env.PUBLIC_URL + "/location.png"} ></img>
						render: (text: string, item: MachineOutOfStockQueryDto) => <div><EnvironmentOutlined style={{ fontSize: 20 }}></EnvironmentOutlined> </div>
					},
					{
						title: 'Chức năng', key: 'ma_name', className: "hoverCell", width: 100,
						render: (text: string, item: MachineOutOfStockQueryDto) =>
							<Button
								type="primary"
								size="small"
								icon={<EyeOutlined />}
								title={'Xem chi tiết'}
								onClick={() => this.onAction(item, EventTable.ViewDetail)}
							>
							</Button>
					},
				]),
		];

		return (
			<>
				<Table
					className='centerTable'
					onRow={(record, rowIndex) => {
						return {
							onDoubleClick: (event: any) => { this.onAction(record!, EventTable.View) }
						};
					}}
					scroll={this.props.is_printed ? { x: undefined } : { x: 1500 }}
					loading={!this.state.isLoadDone}
					rowKey={record => "quanlymaybannuoc_index__" + JSON.stringify(record)}
					size={'small'}
					bordered={true}
					locale={{ "emptyText": 'Không có dữ liệu' }}
					columns={columns}
					rowSelection={hasAction != undefined ? rowSelection : undefined}
					dataSource={machineOutOfStockQueryDto != undefined && machineOutOfStockQueryDto!.length > 0 ? machineOutOfStockQueryDto : []}
					pagination={this.props.pagination}
				/>
				<Modal
					centered
					visible={this.state.visibleModalGoogleMap}
					onCancel={() => this.setState({ visibleModalGoogleMap: false })}
					title={<h3>{"Vị trí máy " + this.state.ma_name}</h3>}
					footer={null}
					width={"70vw"}
				>
					<MapComponent
						centerMap={{ lat: this.state.ma_gps_lat, lng: this.state.ma_gps_lng }}
						zoom={15}
						positionList={[{ lat: this.state.ma_gps_lat, lng: this.state.ma_gps_lng, title: "Vị trí máy" }]}
					/>
				</Modal>
				<Modal
					centered
					visible={this.state.visibleDetailProduct}
					onCancel={() => this.setState({ visibleDetailProduct: false })}
					title={<h3>{"Chi tiết sản phẩm"}</h3>}
					footer={null}
					width={"70vw"}
				>
					<DetailProductOfMachine
						productList={this.productResult}
					></DetailProductOfMachine>
				</Modal>
			</>
		)
	}
}