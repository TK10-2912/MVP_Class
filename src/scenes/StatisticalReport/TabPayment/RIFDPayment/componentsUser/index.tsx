import * as React from 'react';
import { Col, Row, Card, Button, Input, DatePicker, Select, Space } from 'antd';
import { stores } from '@stores/storeInitializer';
import { RfidLogDto } from '@services/services_autogen';
import { L } from '@lib/abpUtility';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { DeleteOutlined, ExportOutlined, SearchOutlined } from '@ant-design/icons';
import TableHistoryRFIDUser from './TableHistoryRFIDUser';
import ModalExportHistoryRFIDUser from './ModalExportHistoryRFIDUser';
import { cssColResponsiveSpan } from '@src/lib/appconst';
import moment from 'moment';
import SelectedGroupMachine from '@src/components/Manager/SelectedGroupMachine';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';
import { SorterResult } from 'antd/lib/table/interface';
import { eSort } from '@src/lib/enumconst';
export interface IProps {
	status?: number;
	rf_code?: string;
}

const { RangePicker } = DatePicker;

export const eFormatPicker = {
	date: "date",
	month: "month",
	year: "year",
}

export default class HistoryPaymentRFIDUser extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		visibleModalExport: false,
		us_id: undefined,
		skipCount: 0,
		maxResult: 10,
		pageSize: 10,
		currentPage: 1,
		rfCode: undefined,
		rf_lo_created_from: undefined,
		rf_lo_created_to: undefined,
		groupMachineId: undefined,
		listMachineId: undefined,
		selectedOption: "date",
		rangeDatetime: undefined,
		sort: undefined,

	};
	RFIDSelected: RfidLogDto = new RfidLogDto();
    selectedField: string;

	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.rfidLogStore.getAllLogs(
			[2],
			this.state.rfCode,
			this.state.groupMachineId,
			this.state.listMachineId,
			this.state.rf_lo_created_from,
			this.state.rf_lo_created_to,
			this.selectedField,
			this.state.sort,
			this.state.skipCount,
			this.state.pageSize,
		);
		this.setState({ isLoadDone: true, visibleModalCreateUpdate: false, visibleExportExcelRFID: false, });
	}
	async componentDidMount() {
		await this.getAll();

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
		this.setState({ rf_lo_created_from: !!this.state.rangeDatetime && moment(this.state.rangeDatetime?.[0]).startOf(this.state.selectedOption as any).add(7, 'hour').toDate() })
		this.setState({
			rf_lo_created_to: !!this.state.rangeDatetime?.[1] ?
				moment(this.state.rangeDatetime?.[1]).endOf(this.state.selectedOption as any).add(7, 'hour').toDate() :
				moment().endOf(this.state.selectedOption as any).add(7, 'hour').toDate()
		})
	}
	clearSearch = async () => {
		await this.setState({
			rfCode: undefined,
			rf_lo_created_from: undefined,
			rf_lo_created_to: undefined,
			rangeDatetime: undefined,
			listMachineId: undefined,
			groupMachineId: undefined,
			isLoadDone: false,
		})
		this.getAll();
	}
	shouldChangeText = () => {
		const isChangeText = window.innerWidth < 960;
		return !isChangeText;
	}
	changeColumnSort = async (sort: SorterResult<RfidLogDto> | SorterResult<RfidLogDto>[]) => {
        this.setState({ isLoadDone: false });
        this.selectedField = sort["field"];
        await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
        await this.getAll();
        this.setState({ isLoadDone: true });

    }
	render() {

		const self = this;
		const { logRFIDListResult, totalLogRFID } = stores.rfidLogStore;

		return (
			<Card>
				<Row gutter={[8, 8]} align='bottom'>
					<Col {...cssColResponsiveSpan(24, 12, 8, 4, 3, 3)}>
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
					<Col {...cssColResponsiveSpan(24, 12, 8, 5, 6, 6)}>
						<strong>Khoảng thời gian</strong><br />
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
					<Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 5)}>
						<strong>Nhóm máy</strong>
						<SelectedGroupMachine groupmachineId={this.state.groupMachineId}
							onChangeGroupMachine={async (value) => await this.setState({ groupMachineId: value })}
						/>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 5)}>
						<strong>Máy bán nước</strong>
						<SelectedMachineMultiple onChangeMachine={(value) => this.setState({ listMachineId: value })} groupMachineId={this.state.groupMachineId} listMachineId={this.state.listMachineId} />
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 5)}>
						<strong>Mã thẻ</strong>
						<Input onPressEnter={async () => await this.getAll()} value={this.state.rfCode} placeholder='Mã thẻ' onChange={(e) => this.setState({ rfCode: e.target.value == "" ? undefined : e.target.value })} allowClear></Input>
					</Col>
					<Col {...cssColResponsiveSpan(14, 12, 8, 12, 12, 12)} >
						<Space>
							<Button type='primary' icon={<SearchOutlined />} onClick={() => this.handleSubmitSearch()}>{this.shouldChangeText() ? 'Tìm kiếm' : 'Tìm'}</Button>
							{(this.state.rfCode != undefined || this.state.rangeDatetime != undefined || this.state.groupMachineId != undefined || this.state.listMachineId != undefined) &&
								<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >{this.shouldChangeText() ? 'Xóa tìm kiếm' : 'Xóa'}</Button>
							}
						</Space>
					</Col>
					<Col className='ant-col-xs-no-maxwidth'{...cssColResponsiveSpan(10, 24, 24, 12, 12, 12)} style={{ textAlign: "right" }}>
						<Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleModalExport: true })}>{L('Xuất dữ liệu')}</Button>
					</Col>
				</Row>

				<TableHistoryRFIDUser
					changeColumnSort={this.changeColumnSort}
					isPrinted={false}
					pagination={{
						pageSize: this.state.pageSize,
						total: totalLogRFID,
						current: this.state.currentPage,
						showTotal: (tot) => "Tổng" + ": " + tot + "",
						showQuickJumper: true,
						showSizeChanger: true,
						pageSizeOptions: ['10', '20', '50', '100'],
						onShowSizeChange(current: number, size: number) {
							self.onChangePage(current, size)
						},
						onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
					}}
					logsRFIDListResult={logRFIDListResult}></TableHistoryRFIDUser>
				{
					this.state.visibleModalExport &&
					<ModalExportHistoryRFIDUser visible={this.state.visibleModalExport} logsRFIDListResult={logRFIDListResult} onCancel={() => this.setState({ visibleModalExport: false })} ></ModalExportHistoryRFIDUser>
				}
			</Card >
		)
	}
}