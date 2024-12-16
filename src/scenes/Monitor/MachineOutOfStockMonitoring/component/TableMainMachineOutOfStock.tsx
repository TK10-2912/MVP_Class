import React from "react";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import AppConsts, { cssColResponsiveSpan, EventTable } from "@src/lib/appconst";
import { MachineOutOfStockQueryDto, ProductDailyMonitoringDto } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import { Button, Col, Modal, Row, Space, Table, Tooltip, message } from "antd";
import { ColumnsType, TablePaginationConfig } from "antd/lib/table";
import { ColumnGroupType, TableRowSelection } from "antd/lib/table/interface";
import { EnvironmentOutlined, EyeOutlined, SendOutlined, } from "@ant-design/icons";
import { Link } from "react-router-dom";
import DetailProductOfMachine from "./DetailProductOfMachine";
import MapComponent from "@src/components/MapComponent";
import { eMainBoard } from "@src/lib/enumconst";
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
		ma_mapUrl: '',
		ma_name: undefined,
		visibleDetailProduct: false,
	};
	productResult: ProductDailyMonitoringDto[] = [];
	machineOutOfSelected: MachineOutOfStockQueryDto = new MachineOutOfStockQueryDto();
	ma_id: number;
	titleModal: string;
	titleModalDetail: string;
	onAction = (item: MachineOutOfStockQueryDto, action: EventTable) => {
		this.setState({ key_selected: item.key });
		const { actionTable } = this.props;
		if (actionTable !== undefined) {
			actionTable(item, action);
		}
	}
	isValidLocation = async (item: MachineOutOfStockQueryDto, hasUrlMap: boolean) => {
		if (hasUrlMap) {
			await this.setState({ visibleModalGoogleMap: true, ma_mapUrl: item.ma_mapUrl, ma_name: item.ten_may, ma_gps_lat: 0, ma_gps_lng: 0 })
			return true;
		}
		await this.setState({ visibleModalGoogleMap: true, ma_name: item.ten_may, ma_gps_lat: +item.ma_gps_lat!, ma_gps_lng: +item.ma_gps_lng! })
	};
	render() {
		const { hostSetting } = stores.settingStore;
		const contentSPSapHetHang = <h3 style={{ color: "orange" }}>Khay còn dưới <strong>{hostSetting.general.soLuongSapHetHangVending}</strong> sản phẩm là khay sắp hết hàng</h3>
		const contentBinhChuaSapHetHang = <h3 style={{ color: "orange" }}>Bình chứa còn dưới <strong>2000</strong> ml là Bình chứa sắp hết hàng</h3>
		const { machineOutOfStockQueryDto, hasAction, pagination, rowSelection, is_printed } = this.props
		
		const action: ColumnGroupType<MachineOutOfStockQueryDto> =
		{
			title: 'Chức năng',
			width: 100,
			fixed: 'right',
			children: [],
			key: 'action_Supplier_index',
			className: 'no-print center',
			
			render: (_: string, item: MachineOutOfStockQueryDto) => (
				<Space>
					<Button
						type="primary"
						size="small"
						icon={<EyeOutlined />}
						title={'Chi tiết bố cục máy'}
						onClick={() => this.onAction(item, EventTable.ViewDetail)}>
					</Button>
					{
						AppConsts.isValidLocation(item.ma_gps_lat, item.ma_gps_lng) ?
							<>
								<Button title='Vị trí' size="small" icon={<EnvironmentOutlined />} onClick={(event) => {
									event.stopPropagation();
									this.isValidLocation(item, false);
								}}>
								</Button>
								<Button
									icon={<SendOutlined />} size="small" title={"Chỉ đường"}
									onClick={(e) => {
										AppConsts.actionDirection(item.ma_gps_lat!, item.ma_gps_lng!);
										e.stopPropagation();
									}}
								></Button>
							</>
							:
							item.ma_mapUrl ?
								<Button
									icon={<EnvironmentOutlined />} size="small" title={"Vị trí máy"}
									onClick={(e) => {
										e.stopPropagation();
										this.isValidLocation(item, true);
									}}
								></Button>
								: ""
					}
				</Space>
			),
		}
			;
		const columns: ColumnsType<MachineOutOfStockQueryDto> = [
			{
				title: "STT", key: "stt_machine_index", width: 50, fixed: "left",
				render: (_: string, item: MachineOutOfStockQueryDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div>
			},
			{
				title: 'Nhóm máy', key: 'ma_name', width: 140,
				render: (_: string, item: MachineOutOfStockQueryDto) => <div>
					{this.props.is_printed ? stores.sessionStore.getNameGroupMachinesReportStatistic(item.ten_nhom) :
						<div title={`Xem chi tiết nhóm máy ${item.ten_nhom}`}>
							<Link target="_blank" to={"/general/machine/?gr_id=" + stores.sessionStore.getIdGroupMachinesStatistic(item.ten_nhom)} onClick={e => { e.stopPropagation() }} >
								{stores.sessionStore.getNameGroupMachinesbyNameDisplayTable(item.ten_nhom)}
							</Link>
						</div>
					}
				</div>
			},
			{
				title: 'Máy bán nước', key: 'ma_name', width: 150,
				render: (_: string, item: MachineOutOfStockQueryDto) => <div style={this.props.is_printed ? {} : {
					textOverflow: "ellipsis",
					overflow: "hidden",
					display: "-webkit-box",
					WebkitLineClamp: 2,
					WebkitBoxOrient: "vertical"
				}}>
					{this.props.is_printed ?
						<>
							<p style={{ margin: 0 }}>{item.ma_may}</p>
							<p style={{ margin: 0 }}>{item.ten_may}</p>
						</> :
						<div title={`Xem chi tiết máy ${item.ten_may}`}>
							<Link to={"/general/machine/?machine=" + item.ma_may} target="_blank"
								rel="noopener noreferrer"
							>
								<p style={{ margin: 0 }}>{item.ma_may}</p>
								<p style={{
									textOverflow: "ellipsis",
									overflow: "hidden",
									display: "-webkit-box",
									WebkitLineClamp: 2,
									WebkitBoxOrient: "vertical",
									color: "gray",
									margin: 0, fontSize: 11,
								}}>{item.ten_may}</p>
							</Link>
						</div>
					}
				</div>
			},
			{
				title: 'Người vận hành', key: 'us_id_owner', width: 150,
				render: (_: string, item: MachineOutOfStockQueryDto) => <div>
					{stores.sessionStore.getUserNameById(item.us_id_operator)}
				</div>
			},
			{
				title: 'Sản phẩm có bao bì', key: 'ma_name', children: [
					{
						title: 'Tổng số khay',
						key: 'vending_so_luong_chua_co_hang',
						className: 'pointHover',
						width: 110,
						sorter: (a, b) => a.vending_so_luong_tong?.length! - b.vending_so_luong_tong?.length!,
						render: (_: string, item: MachineOutOfStockQueryDto) => (
							<div>
								{(item.commandVending != eMainBoard.NONE.num) ?
									AppConsts.formatNumber(
										item.vending_so_luong_tong!.length
									)
									: ""}
							</div>
						),
						onCell: (item: MachineOutOfStockQueryDto) => {
							if (is_printed) {
								return {};
							}
							return {
								onClick: () => {
									if (item.commandVending != eMainBoard.NONE.num) {
										this.productResult = item.vending_so_luong_tong!;
										this.ma_id = item.ma_id; this.machineOutOfSelected = item;
										this.titleModal = "Chi tiết khay tổng";
										this.titleModalDetail = "Tổng số khay";
										if (this.productResult.length > 0) {
											this.setState({ visibleDetailProduct: true })
										}
										else message.error("Không có sản phẩm")
									}
									else message.error("Máy không sử dụng Vending")
								}
							}
						},
					},
					{
						title: <Tooltip title={contentSPSapHetHang}>Số khay sắp hết hàng</Tooltip>,
						key: 'ma_money', width: 110, className: is_printed ? '' : 'pointHover',
						onCell: (item: MachineOutOfStockQueryDto) => {
							if (is_printed) {
								return {};
							}
							return {
								onClick: (e) => {
									if (item.commandVending != eMainBoard.NONE.num) {
										this.productResult = item.vending_so_luong_sap_het_hang!;
										this.ma_id = item.ma_id;
										this.machineOutOfSelected = item;
										this.titleModal = "Chi tiết khay sắp hết hàng";
										this.titleModalDetail = "Số khay sắp hết hàng";
										if (this.productResult.length > 0) {

											this.setState({ visibleDetailProduct: true })
										}
										else message.error("Không có sản phẩm")
									} else message.error("Máy không sử dụng Vending")
								}
							}
						},
						sorter: (a, b) => a.vending_so_luong_sap_het_hang!.length - b.vending_so_luong_sap_het_hang!.length,
						render: (_: string, item: MachineOutOfStockQueryDto) => <div style={{ color: "orange" }}>
							<div title={"Xem chi tiết"}>
								{AppConsts.formatNumber(
									item.commandVending != eMainBoard.NONE.num
										?
										item.vending_so_luong_sap_het_hang?.length
										:
										0
								)}
							</div>
						</div>
					},
					{
						title: 'Số khay hết hàng', key: 'ma_money', width: 110, className: is_printed ? '' : 'pointHover',
						onCell: (item: MachineOutOfStockQueryDto) => {
							if (is_printed) {
								return {};
							}
							return {
								onClick: () => {
									if (item.commandVending != eMainBoard.NONE.num) {
										this.productResult = item.vending_so_luong_het_hang!;
										this.ma_id = item.ma_id; this.machineOutOfSelected = item;
										this.titleModal = "Chi tiết khay hết hàng";
										this.titleModalDetail = "Số khay hết hàng";
										if (this.productResult.length > 0) {
											this.setState({ visibleDetailProduct: true })
										}
										else message.error("Không có sản phẩm")
									}
									else message.error("Máy không sử dụng Vending")
								}
							}
						},
						sorter: (a, b) => a.vending_so_luong_het_hang?.length! - b.vending_so_luong_het_hang?.length!,
						render: (_: string, item: MachineOutOfStockQueryDto) => <div style={{ color: "red" }}>
							{(item.commandVending != eMainBoard.NONE.num) ?
								<div title={"Xem chi tiết"}>
									{AppConsts.formatNumber(item.vending_so_luong_het_hang?.length)}</div>
								: ""}
						</div>
					},
					{
						title: 'Số khay đang lỗi', key: 'ma_money', width: 110, className: is_printed ? '' : 'pointHover',
						onCell: (item: MachineOutOfStockQueryDto) => {
							if (is_printed) {
								return {};
							}
							return {
								onClick: () => {
									if (item.commandVending != eMainBoard.NONE.num) {
										this.ma_id = item.ma_id;
										this.productResult = item.vending_so_luong_loi!;
										this.machineOutOfSelected = item;
										this.titleModal = "Chi tiết khay đang lỗi";
										this.titleModalDetail = "Số khay đang lỗi";
										if (this.productResult.length > 0) {
											this.setState({ visibleDetailProduct: true })
										}
										else message.error("Không có sản phẩm")
									} else message.error("Máy không sử dụng Vending")
								}
							}
						},
						sorter: (a, b) => a.vending_so_luong_loi?.length! - b.vending_so_luong_loi?.length!,
						render: (_: string, item: MachineOutOfStockQueryDto) => <div>
							<div style={{ color: "red" }} title={"Xem chi tiết"}>
								{AppConsts.formatNumber(item.commandVending != eMainBoard.NONE.num
									?
									item.vending_so_luong_loi?.length
									:
									0
								)}
							</div>
						</div>
					},
				]
			},
			{
				title: 'Sản phẩm không có bao bì', key: 'ma_name', children: [
					{
						title: "Tổng bình chứa", key: "ma_total", className: 'pointHover', width: 110, sorter: (a, b) => {
							return a.commandRefill != eMainBoard.NONE.num ? a.refill_so_luong_tong?.length! - b.refill_so_luong_tong?.length! : 0
						},
						render: (_: string, item: MachineOutOfStockQueryDto) => <div style={{ color: "orange" }}>
							<div title={"Xem chi tiết"}>
								{item.commandRefill != eMainBoard.NONE.num ? AppConsts.formatNumber(item.refill_so_luong_tong?.length) : ""}
							</div>
						</div>,
						onCell: (item: MachineOutOfStockQueryDto) => {
							if (is_printed) {
								return {};
							}
							return {
								onClick: (e) => {
									if (item.commandVending != eMainBoard.NONE.num) {
										this.ma_id = item.ma_id;
										this.productResult = item.refill_so_luong_tong!;
										this.machineOutOfSelected = item;
										this.titleModal = "Chi tiết khay đang lỗi";
										this.titleModalDetail = "Số khay đang lỗi";
										if (this.productResult.length > 0) {
											this.setState({ visibleDetailProduct: true })
										}
										else message.error("Không có sản phẩm")
									} else message.error("Máy không sử dụng Vending")
								}
							}
						},
					},
					{
						title: <Tooltip title={contentBinhChuaSapHetHang}>Số bình chứa sắp hết hàng</Tooltip>,
						key: 'ma_money', width: 110, className: is_printed ? '' : 'pointHover',
						onCell: (item: MachineOutOfStockQueryDto) => {
							if (is_printed) {
								return {};
							}
							return {
								onClick: () => {
									if (item.commandRefill != eMainBoard.NONE.num) {
										this.ma_id = item.ma_id;
										this.productResult = item.refill_so_luong_sap_het_hang!;
										this.machineOutOfSelected = item;
										this.titleModal = "Chi tiết bình chứa sắp hết hàng";
										this.titleModalDetail = "Số bình chứa hết hàng";
										if (this.productResult.length > 0) {
											this.setState({ visibleDetailProduct: true })
										}
										else message.error("Không có sản phẩm")
									} else message.error("Máy không sử dụng Refill")
								}
							}
						},
						sorter: (a: MachineOutOfStockQueryDto, b: MachineOutOfStockQueryDto) => {
							const totalA = a.refill_so_luong_sap_het_hang!.length;
							const totalB = b.refill_so_luong_sap_het_hang!.length;
							return totalA - totalB;
						},
						render: (_: string, item: MachineOutOfStockQueryDto) => <div style={{ color: "orange" }}>
							{(item.commandRefill != eMainBoard.NONE.num) ?
								<div title={"Xem chi tiết"}>{AppConsts.formatNumber(item.refill_so_luong_sap_het_hang?.length)}</div>
								: ""}
						</div>
					},
					{
						title: 'Số bình chứa hết hàng', className: is_printed ? '' : 'pointHover', key: 'ma_money', width: 110,
						onCell: (item: MachineOutOfStockQueryDto) => {
							if (is_printed) {
								return {};
							}
							return {
								onClick: () => {
									if (item.commandRefill != eMainBoard.NONE.num) {
										this.ma_id = item.ma_id;
										this.productResult = item.refill_so_luong_het_hang!;
										this.machineOutOfSelected = item;
										this.titleModal = "Chi tiết bình chứa hết hàng";
										this.titleModalDetail = "Số bình chứa hết hàng";
										if (this.productResult.length > 0) {
											this.setState({ visibleDetailProduct: true })
										}
										else message.error("Không có sản phẩm")
									} else message.error("Máy không sử dụng Refill")
								}
							}
						},
						sorter: (a, b) => a.refill_so_luong_het_hang!.length - b.refill_so_luong_het_hang!.length,
						render: (_, item: MachineOutOfStockQueryDto) => <div style={{ color: "red" }}>
							{(item.commandRefill != eMainBoard.NONE.num) ?
								<div title={"Xem chi tiết"}>{AppConsts.formatNumber(item.refill_so_luong_het_hang?.length)} </div>
								: ""}</div>
					},
					{
						title: 'Số bình chứa lỗi', className: is_printed ? '' : 'pointHover', key: 'ma_money', width: 110,
						onCell: (item: MachineOutOfStockQueryDto) => {
							if (is_printed) {
								return {};
							}
							return {
								onClick: () => {
									if (item.commandRefill != eMainBoard.NONE.num) {
										this.productResult = item.refill_so_luong_loi!;
										this.machineOutOfSelected = item;
										this.ma_id = item.ma_id;
										this.titleModal = "Chi tiết bình chứa chưa có hàng";
										this.titleModalDetail = "Số bình chứa chưa có hàng";

										if (this.productResult.length > 0) {
											this.setState({ visibleDetailProduct: true })
										}
										else message.error("Không có sản phẩm")
									}
									else message.error("Máy không sử dụng Refill")
								}
							}
						},
						sorter: (a, b) => a.refill_so_luong_loi!.length - b.refill_so_luong_loi!.length,
						render: (_: string, item: MachineOutOfStockQueryDto) =>
							<div style={{ color: "red" }}>
								{(item.commandRefill != eMainBoard.NONE.num) ?
									<div title={"Xem chi tiết"}>{AppConsts.formatNumber(item.refill_so_luong_loi?.length)}</div>
									: ""}
							</div>
					},
				]
			},
		];
		if (!is_printed) {
			columns.push(action);
		}
		return (
			<>
				<Table
					className='centerTable'
					onRow={(record) => {
						return {
							onDoubleClick: () => { this.onAction(record!, EventTable.View) }
						};
					}}
					scroll={this.props.is_printed ? { x: undefined } : { x: 1500 }}
					loading={!this.state.isLoadDone}
					rowKey={record => "quanlymaybannuoc_index__" + JSON.stringify(record)}
					size={'small'}
					bordered={true}
					
					columns={columns}
					rowSelection={hasAction != undefined ? rowSelection : undefined}
					dataSource={machineOutOfStockQueryDto != undefined && machineOutOfStockQueryDto!.length > 0 ? machineOutOfStockQueryDto : []}
					pagination={this.props.pagination}
					footer={() =>
						<Row gutter={8}>
							<Col {...cssColResponsiveSpan(24, 24, 24, 6, 6, 6)} style={{ border: '1px solid #e4e1e1', textAlign: 'center', fontSize: 14 }} >
								<span>Tổng số máy : <strong style={{ color: '#1DA57A' }}>{machineOutOfStockQueryDto!.length}</strong></span>
							</Col>
							<Col {...cssColResponsiveSpan(24, 24, 24, 6, 6, 6)} style={{ border: '1px solid #e4e1e1', textAlign: 'center', fontSize: 14 }}>
								<span>Tổng số máy có khay sắp hết hàng: <strong style={{ color: '#1DA57A' }}>{machineOutOfStockQueryDto != undefined && machineOutOfStockQueryDto.filter(item => item.vending_so_luong_sap_het_hang!.length > 0 || item.refill_so_luong_sap_het_hang!.length > 0).length} </strong></span>
							</Col>
							<Col {...cssColResponsiveSpan(24, 24, 24, 6, 6, 6)} style={{ border: '1px solid #e4e1e1', textAlign: 'center', fontSize: 14 }}>
								<span>Tổng số máy có khay hết hàng: <strong style={{ color: '#1DA57A' }}>{machineOutOfStockQueryDto != undefined && machineOutOfStockQueryDto.filter(item => item.vending_so_luong_het_hang!.length > 0 || item.refill_so_luong_het_hang!.length > 0).length}</strong></span>
							</Col>
							<Col {...cssColResponsiveSpan(24, 24, 24, 6, 6, 6)} style={{ border: '1px solid #e4e1e1', textAlign: 'center', fontSize: 14 }}>
								<span>Tổng số máy có khay lỗi: <strong style={{ color: '#1DA57A' }}>{machineOutOfStockQueryDto != undefined && machineOutOfStockQueryDto.filter(item => item.vending_so_luong_loi!.length > 0 || item.refill_so_luong_loi!.length > 0).length}</strong></span>
							</Col>
						</Row>
					}
				/>
				<Modal
					centered
					visible={this.state.visibleModalGoogleMap}
					onCancel={() => this.setState({ visibleModalGoogleMap: false })}
					title={<h3>{"Vị trí máy: " + this.state.ma_name}</h3>}
					footer={null}
					width={"70vw"}
				>
					{(this.state.ma_gps_lat && this.state.ma_gps_lng) ?
						<MapComponent
							centerMap={{ lat: this.state.ma_gps_lat, lng: this.state.ma_gps_lng }}
							zoom={15}
							positionList={[
								{ lat: this.state.ma_gps_lat, lng: this.state.ma_gps_lng, title: 'Vị trí máy' },
							]}
						/>
						:
						<div dangerouslySetInnerHTML={{ __html: this.state.ma_mapUrl! }} />
					}
				</Modal>
				<Modal
					centered
					visible={this.state.visibleDetailProduct}
					onCancel={() => this.setState({ visibleDetailProduct: false })}
					title={<h3>{`${this.titleModal} máy bán nước "${this.machineOutOfSelected.ten_may}" của người vận hành "${stores.sessionStore.getUserNameById(this.machineOutOfSelected.us_id_operator)}"`}</h3>}
					footer={null}
					width={"70vw"}
				>
					<DetailProductOfMachine
						titleModalDetail={this.titleModalDetail}
						us_id={this.machineOutOfSelected.us_id_operator}
						productList={this.productResult}
						ma_id={this.ma_id}
					></DetailProductOfMachine>
				</Modal>
			</>
		)
	}
}