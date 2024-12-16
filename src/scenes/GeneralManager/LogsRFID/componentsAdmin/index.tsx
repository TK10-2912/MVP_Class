import * as React from 'react';
import { Col, Row, Card, Modal, Button, Input, DatePicker, Select } from 'antd';
import { stores } from '@stores/storeInitializer';
import { ERIFDAction, RfidLogDto } from '@services/services_autogen';
import { L } from '@lib/abpUtility';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { DeleteOutlined, ExportOutlined, SearchOutlined } from '@ant-design/icons';
import { eRIFDAction, eSort } from '@src/lib/enumconst';
import TableLogsRFIDAdmin from './TableLogsRFIDAdmin';
import ModalExportLogsRFIDAdmin from './ModalExportRFIDAdmin';
import SelectUserMultiple from '@src/components/Manager/SelectUserMultiple';
import SelectEnumMulti from '@src/components/Manager/SelectEnumMulti';
import { cssColResponsiveSpan } from '@src/lib/appconst';
import { SorterResult } from 'antd/lib/table/interface';
import moment from 'moment';
import SelectedGroupMachine from '@src/components/Manager/SelectedGroupMachine';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';
const { confirm } = Modal;
const { RangePicker } = DatePicker;

export const eFormatPicker = {
	date: "date",
	month: "month",
	year: "year",
}
export interface IProps {
	status?: number;
	rf_code?: string;
	tab?: string;
}
export default class LogsRFIDAdmin extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		visibleModalExport: false,
		skipCount: 0,
		maxResult: 10,
		pageSize: 10,
		currentPage: 1,
		us_id_list: undefined,
		rf_action_id: undefined,
		rf_code: undefined,
		sort: undefined,
		fieldSort: undefined,
		rf_lo_action: undefined,
		rf_lo_created_from: undefined,
		rf_lo_created_to: undefined,
		selectedOption: "date",
		groupMachineId: undefined,
		listMachineId: undefined,
		rangeDatetime: undefined,

	};
	RFIDSelected: RfidLogDto = new RfidLogDto();
	rf_action_id: ERIFDAction[] = [];
	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.rfidLogStore.getAllLogsByAdmin(
			this.state.us_id_list,
			this.state.rf_lo_action,
			this.state.rf_code,
			this.state.groupMachineId,
			this.state.listMachineId,
			this.state.rf_lo_created_from,
			this.state.rf_lo_created_to,
			this.state.fieldSort,
			this.state.sort,
			this.state.skipCount,
			this.state.pageSize
		);
		this.setState({ isLoadDone: true, visibleModalCreateUpdate: false, visibleExportExcelRFID: false, });
	}
	async componentDidMount() {
		this.setState({ isLoadDone: false });
		if (!!this.props.status) {
			this.setState({ rf_lo_action: this.props.status });
		}
		if (!!this.props.rf_code) {
			this.setState({ rf_code: this.props.rf_code });
		}
		await this.getAll();
		this.setState({ isLoadDone: true });
	}
	componentDidUpdate(prevProps) {
		if (prevProps.tab != this.props.tab) {
			this.onChangePage(1, 10);
		}
	}
	handleSubmitSearch = async () => {
		await this.setDatetime();
		this.onChangePage(1, 10);
	}
	onChangePage = async (page: number, pagesize?: number) => {
		if (pagesize !== undefined) {
			await this.setState({ pageSize: pagesize! });
		}
		this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
			this.getAll();
		})
	}
	setDatetime = () => {
		this.setState({ rf_lo_created_from: !!this.state.rangeDatetime && moment(this.state.rangeDatetime?.[0]).startOf(this.state.selectedOption as any).toDate() })
		this.setState({
			rf_lo_created_to: !!this.state.rangeDatetime?.[1] ?
				moment(this.state.rangeDatetime?.[1]).endOf(this.state.selectedOption as any).toDate() :
				moment().endOf(this.state.selectedOption as any).toDate()
		})
	}
	shouldChangeText = () => {
		const isChangeText = window.innerWidth <= 667;
		return !isChangeText;
	}
	clearSearch = async () => {
		await this.setState({
			us_id_list: undefined,
			rf_lo_action: undefined,
			rf_code: undefined,
			rf_lo_created_from: undefined,
			rf_lo_created_to: undefined,
			rangeDatetime: undefined,
		})
		await this.getAll();
	}
	changeColumnSort = async (sort: SorterResult<RfidLogDto> | SorterResult<RfidLogDto>[]) => {
		this.setState({ isLoadDone: false });
		await this.setState({ fieldSort: sort['field'] });
		await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
		await this.getAll();
		this.setState({ isLoadDone: true });
	}
	render() {
		const self = this;
		const { logRFIDListResult, totalLogRFID } = stores.rfidLogStore;

		return (
			<Card>
				{
					this.props.status == undefined ?
						<>
							<Row gutter={[8, 8]} align='bottom'>
								<Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 3)}>
									<strong>Loại</strong><br />
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
								<Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 4)}>
									<strong>Khoảng thời gian</strong>
									<RangePicker
										style={{ width: "100%" }}
										placeholder={this.state.selectedOption === "date" ? ['Từ ngày', 'Đến ngày'] : (this.state.selectedOption === "month" ? ['Từ tháng', 'Đến tháng'] : ['Từ năm', 'Đến năm'])}
										onChange={async value => await this.setState({ rangeDatetime: value })}
										picker={this.state.selectedOption as any}
										format={this.state.selectedOption === "date" ? 'DD/MM/YYYY' : (this.state.selectedOption === "month" ? 'MM/YYYY' : 'YYYY')}
										value={this.state.rangeDatetime as any}
										allowEmpty={[false, true]}
										disabledDate={current => current > moment()}
									/>
								</Col>
								<Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 3)} style={{ fontSize: '16px' }}>
									<strong>Người sở hữu</strong><br />
									<SelectUserMultiple
										us_id_list={this.state.us_id_list}
										onChangeUser={async (value) => {
											await this.setState({ us_id_list: value }); this.getAll();
										}}
									></SelectUserMultiple>
								</Col>
								<Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 3)} >
									<strong>{L('Mã RFID')}</strong>
									<Input placeholder='Mã RFID' value={this.state.rf_code} onPressEnter={()=> this.getAll()} onChange={e => { this.setState({ rf_code: e.target.value }) }} allowClear />
								</Col>
								<Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 3)} >
									<strong>{L('Hoạt động')}</strong>
									<SelectEnumMulti eNum={eRIFDAction} enum_value={this.state.rf_lo_action} onChangeEnum={async (value) => await this.setState({ rf_lo_action: value })} />
								</Col>
								
								<Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 3)}>
									<strong>Nhóm máy</strong>
									<SelectedGroupMachine groupmachineId={this.state.groupMachineId}
										onChangeGroupMachine={async (value) => await this.setState({ groupMachineId: value })}
									/>
								</Col>
								<Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 3)}>
									<strong>Máy bán nước</strong>
									<SelectedMachineMultiple onChangeMachine={(value) => this.setState({ listMachineId: value })} groupMachineId={this.state.groupMachineId} listMachineId={this.state.listMachineId} />
								</Col>
								<Col {...cssColResponsiveSpan(13, 12, 8, 12, 12, 5)} style={{ display: "flex", flexWrap: "wrap", justifyContent: "start", gap: 8 }}>
									<Button type='primary' icon={<SearchOutlined />} onClick={() => this.handleSubmitSearch()}>{(window.innerWidth >= 953) ? "Tìm kiếm" : "Tìm"}</Button>
									{(this.state.us_id_list != undefined || !!this.state.rf_lo_action || !!this.state.rf_code || !!this.state.rangeDatetime || !!this.state.groupMachineId || !!this.state.listMachineId) &&
										<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >{(window.innerWidth >= 953) ? "Xóa tìm kiếm" : "Xóa"}</Button>
									}
								</Col>
							</Row>
							<Row>
								<Col className='ant-col-xs-no-maxwidth' span={24} style={{ textAlign: "right" }}>
									<Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleModalExport: true })}>Xuất dữ liệu</Button>
								</Col>
							</Row>
						</>
						:
						<>
							<Row gutter={[8, 8]} align='bottom'>
								<Col span={24} style={{ textAlign: "right" }}>
									<Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleModalExport: true })}>Xuất dữ liệu</Button>
								</Col>
							</Row>
						</>
				}
				<TableLogsRFIDAdmin
					noPrint={false}
					changeColumnSort={this.changeColumnSort}
					pagination={{
						pageSize: this.state.pageSize,
						total: totalLogRFID,
						current: this.state.currentPage,
						showTotal: (tot) => "Tổng" + ": " + tot + "",
						showQuickJumper: true,
						showSizeChanger: true,
						pageSizeOptions: ['10', '20', '50', '100', '500'],
						onShowSizeChange(current: number, size: number) {
							self.onChangePage(current, size)
						},
						onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
					}}

					logsRFIDListResult={logRFIDListResult}></TableLogsRFIDAdmin>
				{
					this.state.visibleModalExport &&
					<ModalExportLogsRFIDAdmin visible={this.state.visibleModalExport} logsRFIDListResult={logRFIDListResult} onCancel={() => this.setState({ visibleModalExport: false })} ></ModalExportLogsRFIDAdmin>
				}
			</Card >
		)
	}
}