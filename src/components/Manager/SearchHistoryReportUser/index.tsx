import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { L, isGranted } from '@src/lib/abpUtility';
import AppConsts, { cssColResponsiveSpan } from '@src/lib/appconst';
import { eReportLevel, eReportStatus } from '@src/lib/enumconst';
import { MachineAbstractDto } from '@src/services/services_autogen';
import { Button, Col, DatePicker, Input, Row, Select } from "antd";
import moment from 'moment';
import AppComponentBase from "../AppComponentBase";
import SelectEnum from '../SelectEnum';
import SelectUserMultiple from '../SelectUserMultiple';
import SelectedGroupMachine from '../SelectedGroupMachine';
import SelectedMachineMultiple from '../SelectedMachineMultiple';
import * as React from 'react';

export interface IProps {
	onSearchHistoryReport: (input: SearchHistoryReportInputUser) => void;
	getTypeDate?: (type: any) => void;
}
export class SearchHistoryReportInputUser {
	public re_status;
	public re_level;
	public bi_code;
	public start_date;
	public end_date;
	public gr_ma_id;
	public ma_id_list;
	public skipCount;
	public maxResultCount;
	public fieldSort;
	public sort;

	constructor(re_status, re_level, bi_code, start_date, end_date, gr_ma_id, ma_id_list, fieldSort, sort, skipCount, maxResultCount) {
		this.re_status = re_status;
		this.re_level = re_level;
		this.start_date = start_date;
		this.bi_code = bi_code;
		this.end_date = end_date;
		this.gr_ma_id = gr_ma_id;
		this.ma_id_list = ma_id_list;
		this.skipCount = skipCount;
		this.maxResultCount = maxResultCount;
		this.fieldSort = fieldSort;
		this.sort = sort;
	}


}
const { RangePicker } = DatePicker;


export const eFormatPicker = {
	date: "date",
	month: "month",
	year: "year",
}
export default class SearchHistoryReportUser extends AppComponentBase<IProps> {
	state = {
		isLoadDone: false,
		groupMachineId: undefined,
		listMachineId: undefined,
		re_status: undefined,
		re_level: undefined,
		us_id: undefined,
		selectedOption: "date",
		rangeDatetime: undefined,
		bi_code: undefined,
	};
	inputSearch: SearchHistoryReportInputUser = new SearchHistoryReportInputUser(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
	machineListResult: MachineAbstractDto[] = [];
	async componentDidMount() {
		const urlParams = new URLSearchParams(window.location.search);
		let bi_code = urlParams.get('bi_code') == null || urlParams.get('bi_code') == "undefined" ? undefined : urlParams.get('bi_code');
		this.setState({ bi_code: bi_code });
		this.inputSearch.bi_code = bi_code;
		await this.setState({ selectedOption: eFormatPicker.date, });
		this.handleSubmitSearch();
	}

	handleSubmitSearch = async () => {
		this.setState({ isLoadDone: false });
		this.inputSearch.start_date = !!this.state.rangeDatetime ? moment(this.state.rangeDatetime![0]).startOf(this.state.selectedOption as any).toDate() : undefined;
		this.inputSearch.end_date = !!this.state.rangeDatetime?.[1] ?
			moment(this.state.rangeDatetime?.[1]).endOf(this.state.selectedOption as any).toDate() : undefined;
		this.inputSearch.ma_id_list = this.state.listMachineId;
		this.inputSearch.gr_ma_id = this.state.groupMachineId;
		this.inputSearch.re_status = this.state.re_status!;
		this.inputSearch.re_level = this.state.re_level!;


		const { onSearchHistoryReport } = this.props;
		if (onSearchHistoryReport !== undefined) {
			onSearchHistoryReport(this.inputSearch);
		}

		this.getTypeDate();
		this.setState({ isLoadDone: true });
	}

	getTypeDate = () => {
		if (!!this.props.getTypeDate) {
			this.props.getTypeDate(this.state.selectedOption);
		}
	}

	onClearSearch = async () => {
		await this.setState({
			groupMachineId: undefined,
			listMachineId: undefined,
			re_status: undefined,
			re_level: undefined,
			us_id: undefined,
			bi_code: undefined,
			rangeDatetime: undefined,
		})
		this.handleSubmitSearch();
	}
	shouldChangeText = () => {
		const isMdOrLg = window.innerWidth >= 576 && window.innerWidth <= 955;
		return !isMdOrLg;
	}
	render() {

		return (
			<div style={{ width: "100%" }}>
				<Row gutter={[8, 8]} align='bottom'>
					<Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 2)}>
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
					<Col {...cssColResponsiveSpan(24, 12, 8, 8, 8, 4)}>
						<strong>Khoảng thời gian cảnh báo</strong>
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
					<Col {...cssColResponsiveSpan(24, 12, 8, 6, 6, 3)}>
						<strong>Nhóm máy</strong>
						<SelectedGroupMachine groupmachineId={this.state.groupMachineId} onChangeGroupMachine={async (value: number) => { await this.setState({ groupMachineId: value }); this.handleSubmitSearch() }} />
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 6, 6, 4)}>

						<strong>Máy bán nước</strong>
						<SelectedMachineMultiple groupMachineId={this.state.groupMachineId} listMachineId={this.state.listMachineId} onChangeMachine={async (value: number[] | undefined) => { await this.setState({ listMachineId: value }); this.handleSubmitSearch() }} />
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 6, 6, 3)}>
						<strong>Mã hóa đơn</strong>
						<Input
							placeholder='Nhập mã'
							onChange={async (e) => { await this.setState({ bi_code: e.target.value != "" ? e.target.value : undefined }); this.handleSubmitSearch() }}
							value={this.state.bi_code}
						></Input>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 6, 6, 3)}>

						<strong>Trạng thái</strong>
						<SelectEnum
							placeholder='Trạng thái'
							eNum={eReportStatus}
							onChangeEnum={async (e) => { await this.setState({ re_status: e }); this.handleSubmitSearch() }}
							enum_value={this.state.re_status}
						></SelectEnum>
					</Col>

					<Col {...cssColResponsiveSpan(24, 12, 16, 12, 12, 5)} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
						<Button type="primary" icon={<SearchOutlined />} title={L('Search')} onClick={this.handleSubmitSearch} >{(window.innerWidth >= 576 && window.innerWidth <= 688) ? 'Tìm' : 'Tìm kiếm'}</Button>
						{
							(!!this.state.rangeDatetime || !!this.state.groupMachineId || !!this.state.listMachineId || this.state.re_level != undefined || this.state.re_status != undefined || this.state.us_id != undefined) &&
							<Button danger icon={<DeleteOutlined />} title={"Xóa tìm kiếm"} onClick={this.onClearSearch} >{(window.innerWidth >= 576 && window.innerWidth <= 688) ? 'Xóa' : 'Xóa tìm kiếm'}</Button>
						}
					</Col>
				</Row>
			</div>
		)
	}

}


