import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { L } from "@src/lib/abpUtility";
import { cssColResponsiveSpan, EventTable, pageSizeOptions } from "@src/lib/appconst";
import { MachineDto, MachineLocationLogDto, } from "@src/services/services_autogen";
import { Button, Card, Col, DatePicker, Input, Modal, Row, Select, Space } from "antd";
import { TablePaginationConfig } from "antd/lib/table";
import React from "react";
import { DeleteOutlined, ExportOutlined, SearchOutlined } from "@ant-design/icons";
import { stores } from "@src/stores/storeInitializer";
import moment from "moment";
import TableLocationLogMachine from "./component/TableLocationLogMachine";
import { SorterResult } from "antd/lib/table/interface";
import { eSort } from "@src/lib/enumconst";
import ThongKeDoanhThuTheoMayAdmin from "@src/scenes/StatisticalReport/StatisticalImporting/reports/ThongKeDoanhThuTheoMay/ThongKeDoanhThuTheoMayAdmin";
import ModalExportLocation from "./component/ModalExportLocation";

export interface IProps {
	is_printed?: boolean;
	pagination?: TablePaginationConfig | false;
	machineSelected: MachineDto;
}
const { confirm } = Modal;
const { RangePicker } = DatePicker;
export const eFormatPicker = {
	date: "date",
	month: "month",
	year: "year",
}
export default class LocationLogMachine extends AppComponentBase<IProps> {
	private fileInput: any = React.createRef();
	state = {
		isLoadDone: true,
		ma_id_selected: undefined,
		skipCount: 0,
		currentPage: 1,
		pageSize: 10,
		visibleExportExcel: false,
		visibleModalStatisticsMachine: false,
		modalCreate: false,
		ma_lo_log_mapName: undefined,
		ma_lo_log_from: undefined,
		ma_lo_log_to: undefined,
		sort: undefined,
		rangeDatetime: undefined,
		selectedOption: "date",
		visibleExportLocation: false,

	};
	selectedField: string;
	locationLogMachine: MachineLocationLogDto = new MachineLocationLogDto();
	async componentDidMount() {
		await this.getAll();
	}
	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.machineStore.getAllLocationLogs(this.props.machineSelected.ma_id!, this.state.ma_lo_log_mapName, this.state.ma_lo_log_from, this.state.ma_lo_log_to, this.selectedField, this.state.sort, this.state.skipCount, this.state.pageSize);
		this.setState({ isLoadDone: true });
	}
	actionTable = async (item: MachineLocationLogDto, event: EventTable) => {
		if (event == EventTable.View) {
			this.locationLogMachine.init(item);
			this.setState({ visibleModalStatisticsMachine: true });
		}
	}
	handleSubmitSearch = async () => {
		let start_date = !!this.state.rangeDatetime ? moment(this.state.rangeDatetime![0]).startOf(this.state.selectedOption as any).toDate() : undefined;
		let end_date = !!this.state.rangeDatetime?.[1] ?
			moment(this.state.rangeDatetime?.[1]).endOf(this.state.selectedOption as any).toDate() :
			undefined
		this.setState({ ma_lo_log_from: start_date, ma_lo_log_to: end_date })

		this.onChangePage(1, this.state.pageSize);
	}
	onChangePage = async (page: number, pagesize?: number) => {
		if (pagesize !== undefined) {
			await this.setState({ pageSize: pagesize! });
		}
		await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
			this.getAll();
		})
	}
	handleClearSearch = async () => {
		await this.setState({
			rangeDatetime: undefined,
			ma_lo_log_from: undefined,
			ma_lo_log_to: undefined,
			ma_lo_log_mapName: undefined,
		})
		this.handleSubmitSearch();
	}

	onSuccess = async () => {
		await this.getAll();
		this.setState({
			modalCreate: false
		});
	}

	changeColumnSort = async (sort: SorterResult<MachineLocationLogDto> | SorterResult<MachineLocationLogDto>[]) => {
		this.setState({ isLoadDone: false });
		this.selectedField = sort['field'];
		await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
		await this.getAll();
		this.setState({ isLoadDone: true });

	}
	render() {
		let self = this;
		const { totalCount, machineLogLocationListResult } = stores.machineStore;
		return (
			<Card>
				<Row gutter={[8, 8]} align="bottom">
					<Col {...cssColResponsiveSpan(24, 24, 24, 12, 12, 12)}>
						<p style={{ fontSize: 20 }}>Lịch sử đặt máy của: <strong> {this.props.machineSelected.ma_display_name}-{this.props.machineSelected.ma_code}</strong></p>
					</Col>
					<Col {...cssColResponsiveSpan(24, 24, 24, 12, 12, 12)} style={{ textAlign: "right" }}>
						<Space>
							<Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportLocation: true })}>Xuất dữ liệu</Button>
						</Space>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 2, 2, 2)}>
						<strong>Loại</strong>
						<Select
							onChange={async (value) => await this.setState({ selectedOption: value })}
							value={this.state.selectedOption}
							style={{ width: '100%' }}
						>
							<Select.Option value={eFormatPicker.date}>Ngày</Select.Option>
							<Select.Option value={eFormatPicker.month}>Tháng</Select.Option>
							<Select.Option value={eFormatPicker.year}>Năm</Select.Option>
						</Select>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 5)}>
						<strong>Khoảng thời gian</strong>
						<RangePicker
							style={{ width: "100%" }}
							placeholder={this.state.selectedOption === "date" ? ['Từ ngày', 'Đến ngày'] : (this.state.selectedOption === "month" ? ['Từ tháng', 'Đến tháng'] : ['Từ năm', 'Đến năm'])}
							onChange={async value => { await this.setState({ rangeDatetime: value }); this.handleSubmitSearch() }}
							picker={this.state.selectedOption as any}
							format={this.state.selectedOption === "date" ? 'DD/MM/YYYY' : (this.state.selectedOption === "month" ? 'MM/YYYY' : 'YYYY')}
							value={this.state.rangeDatetime as any}
							allowEmpty={[false, true]}
							disabledDate={current => current > moment()}
						/>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 9, 3, 3, 3)}>
						<strong>{L("Tên địa điểm")}</strong>
						<Input value={this.state.ma_lo_log_mapName} allowClear onChange={async (e) => { await this.setState({ ma_lo_log_mapName: e.target.value }); this.handleSubmitSearch() }}
							onPressEnter={this.handleSubmitSearch}
							placeholder={'Nhập tìm kiếm'} />
					</Col>
					<Col {...cssColResponsiveSpan(12, 12, 6, 5, 5, 5)}>
						<Space>
							<Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={this.handleSubmitSearch} >{"Tìm kiếm"}</Button>
							{(!!this.state.ma_lo_log_mapName || !!this.state.rangeDatetime || this.state.ma_lo_log_from || !!this.state.ma_lo_log_to || !!this.state.ma_lo_log_mapName) &&
								<Button danger title="Xoá tìm kiếm" icon={<DeleteOutlined />} onClick={this.handleClearSearch}>Xoá tìm kiếm</Button>
							}
						</Space>
					</Col>
				</Row>
				<Row>
					<TableLocationLogMachine
						listResult={machineLogLocationListResult}
						actionTable={this.actionTable}
						hasAction={true}
						changeColumnSort={this.changeColumnSort}
						pagination={{
							position: ['topRight'],
							pageSize: this.state.pageSize,
							total: totalCount,
							current: this.state.currentPage,
							showTotal: (tot) => ("Tổng: ") + tot + "",
							showQuickJumper: true,
							showSizeChanger: true,
							pageSizeOptions: pageSizeOptions,
							onShowSizeChange(current: number, size: number) {
								self.onChangePage(current, size)
							},
							onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
						}} />

				</Row>
				<Modal
					centered
					visible={this.state.visibleModalStatisticsMachine}
					onCancel={() => this.setState({ visibleModalStatisticsMachine: false })}
					width={'90vw'}
					footer={null}
				>
					<ThongKeDoanhThuTheoMayAdmin ma_id={this.locationLogMachine.ma_id!} ma_lo_log_from={this.locationLogMachine.ma_lo_log_from} ma_lo_log_to={this.locationLogMachine.ma_lo_log_to} />
				</Modal>
				{
					this.state.visibleExportLocation &&
					<ModalExportLocation listResult={machineLogLocationListResult}visible={this.state.visibleExportLocation}  onCancel={()=>this.setState({visibleExportLocation:false})}/>
				}
			</Card >

		)
	}
}