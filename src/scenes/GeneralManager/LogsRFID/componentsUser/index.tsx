import * as React from 'react';
import { Col, Row, Card, Button, Input, DatePicker, Select } from 'antd';
import { stores } from '@stores/storeInitializer';
import { ERIFDAction, RfidLogDto } from '@services/services_autogen';
import { L } from '@lib/abpUtility';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { DeleteOutlined, ExportOutlined, SearchOutlined } from '@ant-design/icons';
import SelectEnum from '@src/components/Manager/SelectEnum';
import { eRIFDAction, eSort } from '@src/lib/enumconst';
import TableLogsRFIDUser from './TableLogsRFIDUser';
import ModalExportLogsRFIDUser from './ModalExportRFIDUser';
import AppConsts, { cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import { SorterResult } from 'antd/lib/table/interface';
import moment from 'moment';
import SelectedGroupMachine from '@src/components/Manager/SelectedGroupMachine';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';
import SelectEnumMulti from '@src/components/Manager/SelectEnumMulti';
export interface IProps {
	status?: number;
	rf_code?: string;
	tab?: string;
	isModal?: boolean;
	search?: boolean;
}
const { RangePicker } = DatePicker;

export const eFormatPicker = {
	date: "date",
	month: "month",
	year: "year",
}
export default class LogsRFIDUser extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		visibleModalExport: false,
		us_id: undefined,
		skipCount: 0,
		maxResult: 10,
		pageSize: 10,
		currentPage: 1,
		rf_code: undefined,
		sort: undefined,
		fieldSort: undefined,
		rf_lo_created_from: undefined,
		rf_lo_created_to: undefined,
		rf_lo_action: undefined,
		selectedOption: "date",
		groupMachineId: undefined,
		listMachineId: undefined,
		rangeDatetime: undefined,
	};
	RFIDSelected: RfidLogDto = new RfidLogDto();
	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.rfidLogStore.getAllLogs(
			this.state.rf_lo_action,
			this.state.rf_code,
			this.state.groupMachineId,
			this.state.listMachineId,
			this.state.rf_lo_created_from,
			this.state.rf_lo_created_to,
			this.state.fieldSort,
			this.state.sort,
			this.state.skipCount,
			// this.state.pageSize
			undefined
		);
		this.setState({ isLoadDone: true, visibleModalCreateUpdate: false, visibleExportExcelRFID: false, });
	}
	async componentDidMount() {
		this.setState({ isLoadDone: false });
		if (!!this.props.rf_code) {
			await this.setState({ rf_code: this.props.rf_code })
		}
		if (!!this.props.status) {
			await this.setState({ rf_lo_action: [this.props.status] });
		}
		await this.getAll();
		this.setState({ isLoadDone: true });
	}
	handleSubmitSearch = async () => {
		this.onChangePage(1, 10);
	}
	componentDidUpdate(prevProps) {
		if (prevProps.tab != this.props.tab) {
			this.onChangePage(1, 10);
		}
	}
	setDatetime = () => {
		this.setState({ rf_lo_created_from: !!this.state.rangeDatetime && moment(this.state.rangeDatetime?.[0]).startOf(this.state.selectedOption as any).toDate() })
		this.setState({
			rf_lo_created_to: !!this.state.rangeDatetime?.[1] ?
				moment(this.state.rangeDatetime?.[1]).endOf(this.state.selectedOption as any).toDate() :
				moment().endOf(this.state.selectedOption as any).toDate()
		})
	}
	onChangePage = async (page: number, pagesize?: number) => {
		const { logRFIDListResult, } = stores.rfidLogStore;
		if (pagesize === undefined || isNaN(pagesize)) {
			pagesize = logRFIDListResult.length;
			page = 1;
		}
		await this.setState({ pageSize: pagesize! });
		await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
			this.getAll();
		});
	}
	clearSearch = async () => {

		await this.setState({
			rf_code: this.props.search === false ? undefined : this.state.rf_code,
			rf_lo_action: undefined,
			rf_lo_created_from: undefined,
			rf_lo_created_to: undefined,
			rangeDatetime: undefined,
			groupMachineId: undefined,
			listMachineId: undefined,
		})
		await this.getAll();
	}
	changeColumnSort = async (sort: SorterResult<RfidLogDto> | SorterResult<RfidLogDto>[]) => {
		this.setState({ isLoadDone: false, fieldSort: sort['field'] });
		await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
		await this.getAll();
		this.setState({ isLoadDone: true });
	}
	handleKeyPress = (event) => {
		if (event.key === 'Enter') {
			this.setState({ isLoadDone: false });
			this.getAll();
			this.setState({ isLoadDone: true });
		}
	};
	render() {
		const self = this;
		const { logRFIDListResult, totalLogRFID } = stores.rfidLogStore;
		return (
			<Card>
				{
					this.props.isModal === true ?
						<>
							<Row gutter={[8, 8]} align='bottom' onKeyDown={this.handleKeyPress}>
								{
									this.props.search === true ?
										// If search is true, show the specific search elements
										<>
											<Col {...cssColResponsiveSpan(24, 12, 8, 3, 3, 3)}>
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
												<strong>Khoảng thời gian</strong><br />
												<RangePicker
													style={{ width: "100%" }}
													placeholder={this.state.selectedOption === "date" ? ['Từ ngày', 'Đến ngày'] : (this.state.selectedOption === "month" ? ['Từ tháng', 'Đến tháng'] : ['Từ năm', 'Đến năm'])}
													onChange={async value => { await this.setState({ rangeDatetime: value }); this.setDatetime() }}
													picker={this.state.selectedOption as any}
													format={this.state.selectedOption === "date" ? 'DD/MM/YYYY' : (this.state.selectedOption === "month" ? 'MM/YYYY' : 'YYYY')}
													value={this.state.rangeDatetime as any}
													allowEmpty={[false, true]}
													disabledDate={current => current > moment()}
												/>
											</Col>
											<Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 5)} >
												<b style={{ width: "111px" }}>Hoạt động:</b>
												<SelectEnumMulti eNum={eRIFDAction} enum_value={this.state.rf_lo_action} onChangeEnum={async (value) => {
													await this.setState({ rf_lo_action: value }); await this.handleSubmitSearch()
												}} />
											</Col>
											<Col {...cssColResponsiveSpan(24, 12, 8, 11, 11, 8)} style={{ display: "flex", flexWrap: "wrap", justifyContent: "start", gap: 8 }}>
												<Button type='primary' icon={<SearchOutlined />} onClick={() => this.handleSubmitSearch()}>{(window.innerWidth >= 692) ? "Tìm kiếm" : "Tìm"}</Button>
												{(!!this.state.rf_lo_action || !!this.state.rangeDatetime || !!this.state.groupMachineId || !!this.state.listMachineId) &&
													<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >{(window.innerWidth >= 692) ? "Xóa tìm kiếm" : "Xóa"}</Button>
												}
											</Col>
											{this.isGranted(AppConsts.Permission.Pages_Manager_General_RFID_Export) &&
												<Col {...cssColResponsiveSpan(24, 12, 8, 8, 8, 3)} style={{ display: "flex", flexWrap: "wrap", justifyContent: "end", gap: 8 }}>
													<Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleModalExport: true })}>Xuất dữ liệu</Button>
												</Col>
											}
										</>
										:
										// If search is false or null, display all elements
										<>
											<Col {...cssColResponsiveSpan(24, 12, 8, 3, 3, 3)}>
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
												<strong>Khoảng thời gian</strong><br />
												<RangePicker
													style={{ width: "100%" }}
													placeholder={this.state.selectedOption === "date" ? ['Từ ngày', 'Đến ngày'] : (this.state.selectedOption === "month" ? ['Từ tháng', 'Đến tháng'] : ['Từ năm', 'Đến năm'])}
													onChange={async value => { await this.setState({ rangeDatetime: value }); this.setDatetime() }}
													picker={this.state.selectedOption as any}
													format={this.state.selectedOption === "date" ? 'DD/MM/YYYY' : (this.state.selectedOption === "month" ? 'MM/YYYY' : 'YYYY')}
													value={this.state.rangeDatetime as any}
													allowEmpty={[false, true]}
													disabledDate={current => current > moment()}
												/>
											</Col>
											<Col {...cssColResponsiveSpan(24, 12, 8, 6, 6, 6)}>
												<strong>Nhóm máy:</strong>
												<SelectedGroupMachine groupmachineId={this.state.groupMachineId}
													onChangeGroupMachine={async (value) => { await this.setState({ groupMachineId: value }); await this.handleSubmitSearch() }}
												/>
											</Col>
											<Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 5)}>
												<strong>Máy bán nước:</strong>
												<SelectedMachineMultiple onChangeMachine={async (value) => { await this.setState({ listMachineId: value }); await this.handleSubmitSearch() }} groupMachineId={this.state.groupMachineId} listMachineId={this.state.listMachineId} />
											</Col>
											<Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 5)} >
												<strong>{L('Mã RFID')}:</strong>
												<Input placeholder='Mã RFID' value={this.state.rf_code} onChange={async (e) => { await this.setState({ rf_code: e.target.value }); await this.handleSubmitSearch() }} allowClear />
											</Col>
											<Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 5)} >
												<b style={{ width: "111px" }}>Hoạt động:</b>
												<SelectEnumMulti eNum={eRIFDAction} enum_value={this.state.rf_lo_action} onChangeEnum={async (value) => {
													await this.setState({ rf_lo_action: value }); this.handleSubmitSearch()
												}} />
											</Col>
											<Col {...cssColResponsiveSpan(24, 12, 8, 11, 11, 11)} style={{ display: "flex", flexWrap: "wrap", justifyContent: "start", gap: 8 }}>
												<Button type='primary' icon={<SearchOutlined />} onClick={() => this.handleSubmitSearch()}>{(window.innerWidth >= 692) ? "Tìm kiếm" : "Tìm"}</Button>
												{(!!this.state.rf_lo_action || !!this.state.rf_code || !!this.state.rangeDatetime || !!this.state.groupMachineId || !!this.state.listMachineId) &&
													<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >{(window.innerWidth >= 692) ? "Xóa tìm kiếm" : "Xóa"}</Button>
												}
											</Col>
											{this.isGranted(AppConsts.Permission.Pages_Manager_General_RFID_Export) &&
												<Col {...cssColResponsiveSpan(24, 12, 8, 8, 8, 8)} style={{ display: "flex", flexWrap: "wrap", justifyContent: "end", gap: 8 }}>
													<Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleModalExport: true })}>Xuất dữ liệu</Button>
												</Col>
											}
										</>
								}
							</Row>
						</> :
						<Row>
							<Col span={24} style={{ textAlign: "right" }}>
								<Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleModalExport: true })}>Xuất dữ liệu</Button>
							</Col>
						</Row>
				}
				<TableLogsRFIDUser
					noPrint={false}
					changeColumnSort={this.changeColumnSort}
					pagination={{
						position: ['topRight'],
						pageSize: this.state.pageSize,
						total: totalLogRFID,
						current: this.state.currentPage,
						showTotal: (tot) => "Tổng" + ": " + tot + "",
						showQuickJumper: true,
						showSizeChanger: true,
						pageSizeOptions: pageSizeOptions,
						onShowSizeChange(current: number, size: number) {
							self.onChangePage(current, size);
						},
						onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
					}}
					logsRFIDListResult={logRFIDListResult}
				></TableLogsRFIDUser>
				{
					this.state.visibleModalExport &&
					<ModalExportLogsRFIDUser
						visible={this.state.visibleModalExport}
						logsRFIDListResult={logRFIDListResult}
						onCancel={() => this.setState({ visibleModalExport: false })}
					/>
				}
			</Card>


		)
	}
}