import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { L } from "@src/lib/abpUtility";
import { cssColResponsiveSpan, pageSizeOptions } from "@src/lib/appconst";
import { MachineDto, MachineSoftLogsDto } from "@src/services/services_autogen";
import { Button, Card, Col, Input, InputNumber, Row, Space } from "antd";
import { TablePaginationConfig } from "antd/lib/table";
import React from "react";
import TableHistoryUpdate from "./TableHistoryUpdate";
import { DeleteOutlined, ExportOutlined, SearchOutlined } from "@ant-design/icons";
import { stores } from "@src/stores/storeInitializer";
import ModalExportHistoryUpdate from "./ModalExportHistoryUpdate";
import { SorterResult } from "antd/lib/table/interface";
import { eMachineSoftLogsStatus, eSort } from "@src/lib/enumconst";
import SelectEnum from "@src/components/Manager/SelectEnum";
export interface IProps {
	is_printed?: boolean;
	pagination?: TablePaginationConfig | false;
	ma_id?: number;
	machineSelected: MachineDto;

}
export default class HistoryUpdate extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		ma_id_selected: undefined,
		skipCount: 0,
		currentPage: 1,
		pageSize: 10,
		ma_hardware_version_name: undefined,
		ma_hardware_version_code: undefined,
		visibleExportExcel: false,
		sort: undefined,
		selectedField: undefined,
		ma_status_soft: undefined,
	};
	async componentDidMount() {
		await this.getAll();

	}
	async getAll() {
		await this.setState({ isLoadDone: false });
		await stores.machineSoftStore.getAllMachineSoftLogs(this.props.ma_id, this.state.ma_hardware_version_name, this.state.ma_hardware_version_code ? this.state.ma_hardware_version_code : -1,this.state.ma_status_soft, this.state.selectedField, this.state.sort, this.state.skipCount, this.state.pageSize)
		await this.setState({ isLoadDone: true, visibleModalCreateUpdate: false, visiblePassWordLevel2ModalOpen: false });
	}

	handleSubmitSearch = async () => {
		this.onChangePage(1, this.state.pageSize);
	}
	handleVisibleChange = (visible) => {
		this.setState({ clicked: visible });
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
			ma_hardware_version_code: undefined,
			ma_hardware_version_name: undefined,
			ma_status_soft:undefined,
		})
		this.getAll();
	}
	changeColumnSort = async (sort: SorterResult<MachineSoftLogsDto> | SorterResult<MachineSoftLogsDto>[]) => {
		await this.setState({
			sort: sort['order'] === undefined ? undefined : (sort['order'] === "descend" ? eSort.DES.num : eSort.ASC.num),
			selectedField: sort['field']
		});
		await this.getAll();
	}
	render() {
		const { machineSoftLogsServiceListResult, totalMachineSoftLogs } = stores.machineSoftStore;
		let self = this;
		return (
			<Card>
				<Row gutter={[8, 8]} align="bottom">
					<Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 24)}>
						<p style={{ fontSize: 20 }}>Lịch sử cập nhật phần mềm của máy: <strong> {this.props.machineSelected.ma_display_name}-{this.props.machineSelected.ma_code}</strong></p>
					</Col>
					
					<Col {...cssColResponsiveSpan(24, 12, 9, 5, 5,5)}>
						<strong>{L("Phiên bản cập nhật")}</strong>
						<InputNumber min={0} maxLength={9} style={{ width: '100%' }} value={this.state.ma_hardware_version_code} onChange={async (e) => { await this.setState({ ma_hardware_version_code: e }); this.handleSubmitSearch() }}
							onPressEnter={this.handleSubmitSearch}
							placeholder={'Nhập tìm kiếm'} />
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 9, 4, 4, 4)}>
						<strong>{L("Mã phiên bản cập nhật")}</strong>
						<Input value={this.state.ma_hardware_version_name} allowClear onChange={async (e) => { await this.setState({ ma_hardware_version_name: e.target.value }); this.handleSubmitSearch() }}
							onPressEnter={this.handleSubmitSearch}
							placeholder={'Nhập tìm kiếm'} />
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 9, 5, 5, 5)}>
						<strong>{L("Trạng thái cập nhật")}</strong>
                            <SelectEnum
								placeholder='Trạng thái'
								eNum={eMachineSoftLogsStatus}
								onChangeEnum={async (e) => { await this.setState({ ma_status_soft: e }); this.handleSubmitSearch() }}
								enum_value={this.state.ma_status_soft}
							></SelectEnum>
					</Col>
					<Col {...cssColResponsiveSpan(12, 12, 6, 5, 5, 5)}>
						<Space>
							<Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={this.handleSubmitSearch} >{"Tìm kiếm"}</Button>
							{(!!this.state.ma_hardware_version_name || !!this.state.ma_hardware_version_code||this.state.ma_status_soft != undefined )&& 
								<Button danger title="Xoá tìm kiếm" icon={<DeleteOutlined />} onClick={this.handleClearSearch}>Xoá tìm kiếm</Button>
							}
						</Space>
					</Col>
					<Col {...cssColResponsiveSpan(12, 12, 24, 5, 5, 5)} style={{ textAlign: "right" }}>
						<Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcel: true })}>Xuất dữ liệu</Button>
					</Col>
				</Row>
				<TableHistoryUpdate
					is_printed={false}
					changeColumnSort={this.changeColumnSort}
					machineSoftLogsServiceListResult={machineSoftLogsServiceListResult}
					isLoadDone={this.state.isLoadDone}
					pagination={{
						position: ['topRight'],
						pageSize: this.state.pageSize,
						total: totalMachineSoftLogs,
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
				<ModalExportHistoryUpdate
					machineSelected={this.props.machineSelected!}
					machineSoftLogsServiceListResult={machineSoftLogsServiceListResult}
					visible={this.state.visibleExportExcel}
					onCancel={() => this.setState({ visibleExportExcel: false })}
				/>
			</Card >

		)
	}
}