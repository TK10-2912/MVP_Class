import { CheckCircleOutlined, EnvironmentOutlined, EyeOutlined, RollbackOutlined, SendOutlined, SyncOutlined } from "@ant-design/icons";
import { isGranted } from "@src/lib/abpUtility";
import AppConsts, { cssColResponsiveSpan, EventTable } from "@src/lib/appconst";
import { eReportStatus, valueOfeReportStatus } from "@src/lib/enumconst";
import { BillingDto, ItemBillingEntity, MachineDto, ReportOfMachineDto } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import { Button, Col, message, Row, Space, Table, Tag } from "antd";
import { ColumnsType, TablePaginationConfig } from "antd/lib/table";
import { ColumnGroupType, SorterResult } from "antd/lib/table/interface";
import moment from "moment";
import * as React from "react";
import { Link } from "react-router-dom";
import UpdateReportOfMachineUser from "./UpdateReportOfMachineUser";
import ModalTableBillingViewUser from "./ModalTableBillingViewUser";

export interface IProps {
	onCreateUpdateSuccess?: () => void;
	onCreateUpdate?: () => void;
	actionTable?: (item: ReportOfMachineDto, event: EventTable) => void;
	reportOfMachineListResult: ReportOfMachineDto[],
	pagination: TablePaginationConfig | false;
	is_Printed?: boolean
	noScrool?: boolean;
	onCancel?: () => void;
	checkExpand?: boolean;
	changeColumnSort?: (fieldSort: SorterResult<ReportOfMachineDto> | SorterResult<ReportOfMachineDto>[]) => void;
}

export default class TableReportOfMachineUser extends React.Component<IProps> {
	state = {
		isLoadDone: true,
		ma_id_selected: undefined,
		visibleModalBillProduct: false,
		expandedRowKey: undefined,
	}
	listItemProduct: ItemBillingEntity[] = [];
	billingSelected: BillingDto = new BillingDto();
	machineSelected: MachineDto;
	onAction = (item: ReportOfMachineDto, action: EventTable) => {
		this.setState({ ma_id_selected: item.re_id });
		const { actionTable } = this.props;
		if (actionTable !== undefined) {
			actionTable(item, action);
		}
	}
	handleExpand = (expanded, item: ReportOfMachineDto) => {
		if (expanded) {
			// this.onCancel();
			this.setState({ expandedRowKey: [item.re_id], ma_id_selected: item.re_id });
		} else {
			this.setState({ expandedRowKey: undefined });
		}
	};
	onCreateUpdateSuccess = () => {
		if (!!this.props.onCreateUpdateSuccess) {
			this.props.onCreateUpdateSuccess();
		}
		this.setState({ expandedRowKey: [] });
	}
	onCreateUpdate = () => {
		if (!!this.props.onCreateUpdate) {
			this.props.onCreateUpdate();
		}
		this.setState({ expandedRowKey: [] });
	}
	onCancel = () => {
		if (!!this.props.onCancel) {
			this.props.onCancel();
		}
		this.setState({ expandedRowKey: [] });
	}
	render() {
		const { actionTable, reportOfMachineListResult, pagination, is_Printed } = this.props;
		const { expandedRowKey } = this.state;
		let action: ColumnGroupType<ReportOfMachineDto> = {
			title: "Chức năng", key: "action_reportmachine_index", className: "no-print", fixed: "right", width: 60, children: [],
			render: (text: string, item: ReportOfMachineDto) => {
				const { machineListResult } = stores.machineStore;
				const maSelected = machineListResult.find(machine => machine.ma_id == item.ma_id)!;
				return (
					<Space>
						{isGranted(AppConsts.Permission.Pages_Manager_General_ReportOfMachine_Update) &&
							<Button
								type="primary"
								title="Xem chi tiết"
								icon={<EyeOutlined />}
								size='small'
								onClick={() => this.onAction(item!, EventTable.View)}
							></Button>

						}
						{
							maSelected!= undefined && maSelected.ma_id != undefined ?

							AppConsts.isValidLocation(maSelected.ma_gps_lat, maSelected.ma_gps_lng) ?
								<>
									<Button
										type="primary" icon={<EnvironmentOutlined />} title={"Vị trí máy"}
										size='small'
										onClick={(e) => {
											e.stopPropagation();
											this.onAction(item!, EventTable.ViewMap);
										}}
									></Button>

									<Button
										type="primary" icon={<SendOutlined />} title={"Chỉ đường"}
										size='small'
										onClick={() =>
											AppConsts.actionDirection(maSelected.ma_gps_lat!, maSelected.ma_gps_lng!)
										}
									></Button>
								</>
								:
								maSelected.ma_mapUrl ?
									<Button
										type="primary" icon={<EnvironmentOutlined />} title={"Vị trí máy"}
										size='small'
										onClick={(e) => {
											e.stopPropagation();
											this.onAction(item!, EventTable.ViewMap);
										}}
									></Button> : ""
									:<></>
						}
					</Space>
				)
			}
		};
		const columns: ColumnsType<ReportOfMachineDto> = [
			{ title: "STT", key: "stt_drink_index", width: 50, render: (text: string, item: ReportOfMachineDto, index: number) => <div>{pagination !== false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
			{
				title: "Mã đơn hàng",
				key: "list_product",
				className: "hoverCell",
				onCell: (record) => {
					return {
						onClick: (e) => {
							e.stopPropagation();
							if (record.billing && record.billing.entities_id_arr) {
								this.listItemProduct = record.billing.entities_id_arr;
								this.billingSelected.init(record.billing);
								this.setState({ visibleModalBillProduct: true });
							} else {
								message.error('Không có đơn hàng cho mã này.');
							}
						}
					}
				},
				render: (text: string, item: ReportOfMachineDto) => (
					<div title="Xem chi tiết">
						{item.re_code!.split("report_")}
					</div>
				)
			},
			{
				title: "Nhóm máy", sorter: false, dataIndex: "ma_gr_id", key: "ma_gr_id", render: (text: number, item: ReportOfMachineDto) => <div title="Chi tiết nhóm máy">
					{this.props.is_Printed ? stores.sessionStore.displayGroupMachineUseMaIdTable(item.ma_id) :
						<Link target='_blank' to={"/general/machine/?gr_id=" + (stores.sessionStore.getIDGroupUseMaId(item.ma_id))}  >
							{stores.sessionStore.displayGroupMachineUseMaIdTable(item.ma_id)}
						</Link>
					}
				</div>
			},
			{
				title: "Máy bán nước", sorter: false, dataIndex: "ma_id", key: "ma_id", render: (text: number, item: ReportOfMachineDto) => <div title="Chi tiết máy">
					{this.props.is_Printed ? `${stores.sessionStore.getCodeMachines(item.ma_id)} - ${stores.sessionStore.getNameMachines(item.ma_id)}` :
						<Link target='_blank' to={"/general/machine/?machine=" + stores.sessionStore.getCodeMachines(item.ma_id)} >
							<p>{stores.sessionStore.getCodeMachines(item.ma_id)}</p>
							<p title={stores.sessionStore.getNameMachines(item.ma_id)} style={{
								textOverflow: "ellipsis",
								overflow: "hidden",
								display: "-webkit-box",
								WebkitLineClamp: 2,
								WebkitBoxOrient: "vertical",
								margin: 0,
								color: 'gray',
								fontSize: 11
							}}>{stores.sessionStore.getNameMachines(item.ma_id)}</p>
						</Link>
					}
				</div>
			},

			{ title: "Mô tả báo cáo", sorter: false, dataIndex: "re_display", key: "re_display_index", render: (text: string, item: ReportOfMachineDto) => <div>{item.re_display}</div> },
			{
				title: "Trạng thái", sorter: false, dataIndex: "re_status", key: "re_status_index", render: (text: number, item: ReportOfMachineDto) => {
					if (is_Printed === false) {
						return <div>
							{item.re_status === eReportStatus.DA_HOAN_THANH.num ? <Tag icon={<CheckCircleOutlined />} color="green">Đã xử lý</Tag> : ""}
							{item.re_status === eReportStatus.KHOI_TAO.num ? <Tag color="#FFB266" style={{ color: 'black' }}>Khởi tạo</Tag> : ""}
						</div>
					} else {
						return <div>
							{valueOfeReportStatus(item.re_status)}
						</div>
					}
				}
			},

			{ title: "Ghi chú", ellipsis: { showTitle: false }, key: "re_note_index", render: (text: string, item: ReportOfMachineDto) => <div style={{ marginTop: "14px", overflow: 'hidden', textOverflow: 'ellipsis' }} dangerouslySetInnerHTML={{ __html: item.re_note! }}></div> },
			{ title: "Ngày tạo", width: '12%', sorter: true, dataIndex: "re_created_at", key: "re_created_at", render: (text: number, item: ReportOfMachineDto) => <div>{moment(item.re_created_at).format("DD/MM/YYYY - HH:mm:ss")}</div> },
			{
				title: "Thời gian xử lý",
				width: 100,
				sorter: true,
				dataIndex: "re_updated_at",
				key: "re_updated_at",
				render: (_: number, item: ReportOfMachineDto) => (
					<div>
						{item.re_status === eReportStatus.DA_HOAN_THANH.num
							? moment(item.re_updated_at).format("DD/MM/YYYY HH:mm:ss")
							: <Tag color="#FFB266" style={{ color: 'black' }}>Chưa xử lý</Tag>
						}
					</div>
				),
			},

		];
		if (actionTable !== undefined && isGranted(AppConsts.Permission.Pages_Manager_General_ReportOfMachine_Export)) {
			columns.push(action);
		}
		return (
			<>
				<Table
					scroll={this.props.is_Printed === true ? { x: undefined, y: undefined } : { x: 1500, y: window.innerHeight }}
					className='centerTable'
					columns={columns}
					size={'middle'}
					bordered={true}
					dataSource={reportOfMachineListResult.length > 0 ? reportOfMachineListResult : []}
					pagination={this.props.pagination}
					rowClassName={(record) => (this.state.ma_id_selected === record.re_id) ? "bg-click" : "bg-white"}
					onChange={(_a, _b, sort: SorterResult<ReportOfMachineDto> | SorterResult<ReportOfMachineDto>[]) => {
						if (!!this.props.changeColumnSort) {
							this.props.changeColumnSort(sort);
						}
					}}
					rowKey={record => record.re_id}
					expandable={
						this.props.is_Printed
							? {}
							: {
								expandedRowRender: (record) => (
									<>
										<UpdateReportOfMachineUser
											expandedRowKey={this.state.expandedRowKey}
											layoutDetail={true}
											reportOfMachineSelected={record}
											onCancel={async () => { await this.setState({ expandedRowKey: [] }) }}
											onCreateUpdateSuccess={() => this.onCreateUpdate()}
										/>
									</>
								),
								expandRowByClick: true,
								expandIconColumnIndex: -1,
								expandedRowKeys: this.props.checkExpand == true ? [] : expandedRowKey,
								onExpand: this.handleExpand,
							}
					}
					footer={(record) => {
						const list = [...record];
						const totalMachine = new Set(list.map(item => item.ma_id)).size;
						const totalDone = record.filter(item => item.re_status == eReportStatus.DA_HOAN_THANH.num);
						const totalError = list.filter(item => item.re_status == eReportStatus.KHOI_TAO.num);
						return (
							<Row>
								<Col {...cssColResponsiveSpan(24, 6, 6, 6, 6, 6)}>Tổng số máy lỗi:<span style={{ color: "#1DA57A" }}><b> {totalMachine}</b></span></Col>
								<Col {...cssColResponsiveSpan(24, 6, 6, 6, 6, 6)}>Tổng số lỗi:<span style={{ color: "#1DA57A" }}><b> {totalDone.length + totalError.length}</b></span></Col>
								<Col {...cssColResponsiveSpan(24, 6, 6, 6, 6, 6)}>Lỗi đã sửa: <span style={{ color: "#1DA57A" }}><b>{totalDone.length}</b></span></Col>
								<Col {...cssColResponsiveSpan(24, 6, 6, 6, 6, 6)}>Lỗi chưa sửa: <span style={{ color: "orange" }}><b>{totalError.length}</b></span></Col>
							</Row>
						)
					}}
				/>
				<ModalTableBillingViewUser billSelected={this.billingSelected}
					visibleModalBillProduct={this.state.visibleModalBillProduct}
					onCancel={() => this.setState({ visibleModalBillProduct: false })}
					listItem={this.listItemProduct}
				/>

			</>
		)
	}
}