import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined, ExclamationCircleOutlined, EyeOutlined, SyncOutlined } from "@ant-design/icons";
import { isGranted } from "@src/lib/abpUtility";
import AppConsts, { EventTable } from "@src/lib/appconst";
import { eReportLevel, eReportStatus } from "@src/lib/enumconst";
import ModalInvoiceDetail from "@src/scenes/HistoryMVP/LichSuChiTietGiaoDichTungMay/component/ModalInvoiceDetail";
import ModalTableBillingViewAdmin from "@src/scenes/StatisticalReport/TabPayment/BankingPayment/componentAdmin/ModalTableBillingViewAdmin";
import { BillingDto, ItemBillingEntity, ItemBillingHistory, MachineDto, ReportOfMachineDto } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import { Button, Table, Tag } from "antd";
import { ColumnsType, TablePaginationConfig } from "antd/lib/table";
import { SorterResult } from "antd/lib/table/interface";
import moment from "moment";
import * as React from "react";
import { Link } from "react-router-dom";

export interface IProps {
	actionTable?: (item: ReportOfMachineDto, event: EventTable) => void;
	isLoadDone?: boolean;
	reportOfMachineListResult: ReportOfMachineDto[],
	pagination: TablePaginationConfig | false;
	is_Printed?: boolean
	noScrool?: boolean;

	changeColumnSort?: (fieldSort: SorterResult<ReportOfMachineDto> | SorterResult<ReportOfMachineDto>[]) => void;
}

export default class TableReportOfMachineAdmin extends React.Component<IProps> {
	state = {
		isLoadDone: true,
		ma_id_selected: undefined,
		visibleModalBillProduct: false,
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

	render() {
		const { actionTable, reportOfMachineListResult, pagination, is_Printed } = this.props;

		let action: any = {
			title: "Chức năng", key: "action_reportmachine_index", className: "no-print", dataIndex: '', fixed: "right", width: 60, children: [],
			render: (text: string, item: ReportOfMachineDto) => (
				<div>
					{isGranted(AppConsts.Permission.Pages_Manager_General_ReportOfMachine_Export) &&

						<Button
							type="primary" icon={item.re_status === eReportStatus.DA_HOAN_THANH.num ? <EyeOutlined /> : <EditOutlined />} title="Chỉnh sửa"
							style={{ marginLeft: '10px' }}
							size='small'
							onClick={() => this.onAction(item!, EventTable.Edit)}
						></Button>
					}
				</div>
			)
		};
		const columns: ColumnsType<ReportOfMachineDto> = [
			{ title: "STT", key: "stt_drink_index", fixed: "left", width: 50, render: (text: string, item: ReportOfMachineDto, index: number) => <div>{pagination !== false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
			{ title: "Mã báo cáo", sorter: true, dataIndex: "re_code", key: "re_code_index", render: (text: string, item: ReportOfMachineDto) => <div>{item.re_code}</div> },
			{
				title: "Mã đơn hàng", key: "list_product", render: (text: string, item: ReportOfMachineDto) => <div>{item.re_code!.split("report_")} </div>
			},
			{ title: "Mô tả báo cáo", sorter: true, dataIndex: "re_display", key: "re_display_index", render: (text: string, item: ReportOfMachineDto) => <div>{item.re_display}</div> },
			{
				title: "Trạng thái", sorter: true, dataIndex: "re_status", key: "re_status_index", render: (text: number, item: ReportOfMachineDto) => {
					if (is_Printed === false) {
						return <div>
							{item.re_status === eReportStatus.DANG_XU_LY.num ? <Tag icon={<SyncOutlined spin />} color="blue" >Đang xử lý</Tag> : ""}
							{item.re_status === eReportStatus.DA_HOAN_THANH.num ? <Tag icon={<CheckCircleOutlined />} color="green">Hoàn thành</Tag> : ""}
							{item.re_status === eReportStatus.KHOI_TAO.num ? <Tag color="#FFB266" style={{ color: 'black' }}>Khởi tạo</Tag> : ""}
						</div>
					} else {
						return <div>
							{item.re_status === eReportStatus.DANG_XU_LY.num ? <div>Đang xử lý</div> : ""}
							{item.re_status === eReportStatus.DA_HOAN_THANH.num ? <div>Hoàn thành</div> : ""}
							{item.re_status === eReportStatus.KHOI_TAO.num ? <div>Khởi tạo</div> : ""}
						</div>
					}
				}
			},
			{
				title: "Mức nghiêm trọng", sorter: true, dataIndex: "re_level", key: "re_status_indexs", render: (text: number, item: ReportOfMachineDto) => {
					if (is_Printed === false) {
						return <div>
							{item.re_level === eReportLevel.CANH_BAO.num ? <Tag icon={<ExclamationCircleOutlined />} color="warning" >Cảnh báo</Tag> : <Tag icon={<CloseCircleOutlined />} color="error">Có lỗi</Tag>}
						</div>
					} else {
						return <div>
							{item.re_level === eReportLevel.CANH_BAO.num ? <div>Cảnh báo</div> : <div>Có lỗi</div>
							}
						</div>
					}
				}
			},
			{
				title: "Nhóm máy", sorter: true, dataIndex: "gr_ma_id", key: "ma_id_index", render: (text: number, item: ReportOfMachineDto) => <div>
					{!this.props.actionTable ? (item.machine.gr_ma_id) :
						<Link target='_blank' to={"/general/machine/?gr_ma_id=" + stores.sessionStore.getNameGroupUseMaId(item.ma_id)} onDoubleClick={() => this.onAction(item, EventTable.View)}>
							{stores.sessionStore.getNameGroupUseMaId(item.ma_id)}
						</Link>
					}
				</div>
			},
			{
				title: "Mã máy", sorter: true, dataIndex: "ma_code", key: "ma_id_index", render: (text: number, item: ReportOfMachineDto) => <div>
					{!this.props.actionTable ? (item.machine.ma_code) :
						<Link target='_blank' to={"/general/machine/?ma_code=" + stores.sessionStore.getCodeMachines(item.ma_id)} onDoubleClick={() => this.onAction(item, EventTable.View)}>
							{stores.sessionStore.getCodeMachines(item.ma_id)}

						</Link>
					}
				</div>
			},
			{
				title: "Tên máy", sorter: true, dataIndex: "ma_id", key: "ma_id_index", render: (text: number, item: ReportOfMachineDto) => <div>
					{!this.props.actionTable ? (item.ma_id) :
						<Link target='_blank' to={"/general/machine/?machine=" + stores.sessionStore.getMachineCode(item.ma_id)} onDoubleClick={() => this.onAction(item, EventTable.View)}>
							{stores.sessionStore.getNameMachines(item.ma_id)}
						</Link>
					}
				</div>
			},

			{ title: "Ngày tạo", key: "re_created_at", render: (text: number, item: ReportOfMachineDto) => <div>{moment(item.re_created_at).format("DD/MM/YYYY - HH:mm:ss")}</div> },
			{ title: "Người báo cáo", sorter: true, dataIndex: "us_id_report", key: "us_id_report_index", render: (text: number, item: ReportOfMachineDto) => <div>{stores.sessionStore.getUserNameById(item.us_id_report)}</div> },
			{ title: "Ghi chú", key: "re_note_index", width: 120, render: (text: string, item: ReportOfMachineDto) => <div style={{ marginTop: "14px" }} dangerouslySetInnerHTML={{ __html: item.re_note! }}></div> },
		];
		if (actionTable !== undefined && isGranted(AppConsts.Permission.Pages_Manager_General_ReportOfMachine_Export)) {
			columns.push(action);
		}
		return (
			<>
				<Table
					scroll={this.props.is_Printed === true ? { x: undefined, y: undefined } : { x: 1500, y: window.innerHeight }}
					className='centerTable'
					onRow={(record) => {
						return {
							onDoubleClick: (event: any) => { this.onAction(record!, EventTable.RowDoubleClick) }
						};
					}}
					loading={!this.props.isLoadDone}

					columns={columns}
					size={'middle'}
					bordered={true}
					locale={{ "emptyText": "Không có dữ liệu" }}
					dataSource={reportOfMachineListResult.length > 0 ? reportOfMachineListResult : []}
					pagination={this.props.pagination}
					rowClassName={(record, index) => (this.state.ma_id_selected === record.re_id) ? "bg-click" : "bg-white"}
					rowKey={record => "report_machine" + JSON.stringify(record)}
					onChange={(a, b, sort: SorterResult<ReportOfMachineDto> | SorterResult<ReportOfMachineDto>[]) => {
						if (!!this.props.changeColumnSort) {
							this.props.changeColumnSort(sort);
						}
					}}


				/>
				{/* <ModalTableBillingViewAdmin billSelected={this.billingSelected}
					visibleModalBillProduct={this.state.visibleModalBillProduct}
					onCancel={() => this.setState({ visibleModalBillProduct: false })}
					listItem={this.listItemProduct}
				/> */}

			</>
		)
	}
}