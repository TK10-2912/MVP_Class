import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { L } from "@src/lib/abpUtility";
import { cssColResponsiveSpan } from "@src/lib/appconst";
import { MachineDto } from "@src/services/services_autogen";
import { Button, Card, Col, Input, InputNumber, Row } from "antd";
import { TablePaginationConfig } from "antd/lib/table";
import React from "react";
import TableHistoryUpdate from "./TableHistoryUpdate";
import { ExportOutlined, SearchOutlined } from "@ant-design/icons";
import { stores } from "@src/stores/storeInitializer";
import ModalExportHistoryUpdate from "./ModalExportHistoryUpdate";
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
	};
	async componentDidMount() {
		await this.getAll();

	}
	async getAll() {
		await this.setState({ isLoadDone: false });
		await stores.machineSoftStore.getAllMachineSoftLogs(this.props.ma_id, this.state.ma_hardware_version_name, this.state.ma_hardware_version_code ? this.state.ma_hardware_version_code : -1, this.state.skipCount, this.state.pageSize)
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

	render() {
		const { machineSoftLogsServiceListResult, totalMachineSoftLogs } = stores.machineSoftStore;
		let self = this;
		return (
			<Card>
				<Row gutter={[8, 8]} align="bottom">
					<Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 24)}>
						<p style={{ fontSize: 20 }}>Lịch sử cập nhật phần mềm của máy: <strong> {this.props.machineSelected.ma_display_name}-{this.props.machineSelected.ma_code}</strong></p>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 9, 6, 6, 6)}>
						<strong>{L("Phiên bản")}</strong>
						<Input value={this.state.ma_hardware_version_name} allowClear onChange={(e) => this.setState({ ma_hardware_version_name: e.target.value })}
							onPressEnter={this.handleSubmitSearch}
							placeholder={'Nhập tìm kiếm'} />
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 9, 6, 6, 6)}>
						<strong>{L("Mã phiên bản")}</strong>
						<InputNumber style={{ width: '100%' }} value={this.state.ma_hardware_version_code} onChange={(e) => this.setState({ ma_hardware_version_code: e })}
							onPressEnter={this.handleSubmitSearch}
							placeholder={'Nhập tìm kiếm'} />
					</Col>
					<Col {...cssColResponsiveSpan(12, 12, 6, 5, 5, 5)}>
						<Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={this.handleSubmitSearch} >{"Tìm kiếm"}</Button>
					</Col>
					<Col {...cssColResponsiveSpan(12, 12, 24, 7, 7, 7)} style={{ textAlign: "right" }}>
						<Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcel: true })}>Xuất dữ liệu</Button>
					</Col>
				</Row>
				<TableHistoryUpdate
					machineSoftLogsServiceListResult={machineSoftLogsServiceListResult}
					isLoadDone={this.state.isLoadDone}
					pagination={{
						pageSize: this.state.pageSize,
						total: totalMachineSoftLogs,
						current: this.state.currentPage,
						showTotal: (tot) => ("Tổng: ") + tot + "",
						showQuickJumper: true,
						showSizeChanger: true,
						pageSizeOptions: ['10', '20', '50', '100'],
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
			</Card>

		)
	}
}