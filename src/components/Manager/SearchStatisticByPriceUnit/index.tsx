import * as React from 'react';
import { stores } from "@src/stores/storeInitializer";
import AppComponentBase from "../AppComponentBase";
import { Button, Col, DatePicker, Row, Select } from "antd";
import moment, { Moment } from 'moment';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { L } from '@src/lib/abpUtility';
import SelectedGroupMachine from '../SelectedGroupMachine';
import { MachineDto } from '@src/services/services_autogen';
import { cssColResponsiveSpan } from '@src/lib/appconst';
import SelectedMachineStatistic from '../SelectedMachineStatistic';
import SelectEnum from '../SelectEnum';
import { eMoney } from '@src/lib/enumconst';
import { SearchPriceUnitInput } from '@src/stores/statisticStore';
import SelectedMachineMultiple from '../SelectedMachineMultiple';

export interface IProps {
	onSearchStatistic: (input: SearchPriceUnitInput) => void;
	getTypeDate?: (type: any) => void;
}
export const eFormatPicker = {
	date: "date",
	month: "month",
	year: "year",
}
export default class SearchStatisticByPriceUnit extends AppComponentBase<IProps> {
	state = {
		isLoadDone: false,
		selectedOption: undefined,
		groupMachineId: undefined,
		listMachineId: undefined,
		start_date: undefined,
		end_date: undefined,
		low_price: undefined,
		high_price: undefined,
	};
	inputSearch: SearchPriceUnitInput = new SearchPriceUnitInput(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
	machineListResult: MachineDto[] = [];
	async componentDidMount() {
		await this.setState({ selectedOption: eFormatPicker.date, });
		this.handleSubmitSearch();
	}

	handleSubmitSearch = async () => {
		this.setState({ isLoadDone: false });
		if (!!this.state.start_date) {
			if (this.state.selectedOption == eFormatPicker.month) {
				const monthSelected = Number(moment(this.state.start_date).format("MM")) - 1;
				const yearSelected = Number(moment(this.state.start_date).format("YYYY"));
				this.inputSearch.start_date = moment().month(monthSelected).year(yearSelected).startOf('month').toDate();
				this.inputSearch.end_date = moment().month(monthSelected).year(yearSelected).endOf('month').toDate();
			}
			if (this.state.selectedOption == eFormatPicker.year) {
				const yearSelected = Number(moment(this.state.start_date).format("YYYY"));
				this.inputSearch.start_date = moment().year(yearSelected).startOf('year').toDate();
				this.inputSearch.end_date = moment().year(yearSelected).endOf('year').toDate();
			}
		} else {
			this.inputSearch.start_date = undefined;
			this.inputSearch.end_date = undefined;
		}
		if (this.state.selectedOption == eFormatPicker.date) {
			this.inputSearch.start_date = this.state.start_date ? moment(this.state.start_date).toDate() : undefined;
			this.inputSearch.end_date = this.state.end_date ? moment(this.state.end_date).toDate() : undefined;
		}
		this.inputSearch.ma_id_list = this.state.listMachineId;
		this.inputSearch.gr_ma_id = this.state.groupMachineId!;
		this.inputSearch.low_price = this.state.low_price!;
		this.inputSearch.high_price = this.state.high_price!;

		const { onSearchStatistic } = this.props;
		if (onSearchStatistic != undefined) {
			onSearchStatistic(this.inputSearch);
		}
		this.getTypeDate();
		this.setState({ isLoadDone: true });
	}
	handleOptionChange = async (value) => {
		await this.setState({ selectedOption: value, start_date: moment(), end_date: moment() });
	};
	getTypeDate = () => {
		if (!!this.props.getTypeDate) {
			this.props.getTypeDate(this.state.selectedOption);
		}
	}
	onChangeStartDate(date: Moment | null) {
		if (date == null) {
			this.setState({ end_date: undefined })
		}
		const formattedDate = date ? date.startOf('day') : null;
		this.setState({ start_date: formattedDate });
	}

	onChangeEndDate = async (date: moment.Moment | null) => {
		const formattedDate = date ? date.endOf('day') : null;
		this.setState({ end_date: formattedDate });
	}
	onChangeGroupMachine = async (value: number) => {
		this.setState({ isLoadDone: true });
		this.setState({ groupMachineId: value, listMachineId: undefined });
		// await stores.machineStore.getAll(undefined, this.state.groupMachineId, undefined, undefined, undefined, undefined);
		const { machineListResult } = stores.machineStore;
		this.machineListResult = machineListResult;
		this.setState({ isLoadDone: false });
	}
	onClearSearch = async () => {
		await this.setState({
			groupMachineId: undefined,
			listMachineId: undefined,
			start_date: undefined,
			end_date: undefined,
			high_price: undefined,
			low_price: undefined,
		})
		this.handleSubmitSearch();
	}
	render() {

		return (
			<>
				<Row gutter={[8, 8]} align='bottom'>
					<Col {...cssColResponsiveSpan(24, 12, 5, 4, 4, 3)}>
						<strong>{this.state.selectedOption == eFormatPicker.date ? "Ngày" : (this.state.selectedOption == eFormatPicker.month ? "Tháng" : "Năm")}</strong>
						<Select
							value={this.state.selectedOption}
							onChange={this.handleOptionChange}
							style={{ width: '100%' }}
						>
							<Select.Option value={eFormatPicker.date}>Ngày</Select.Option>
							<Select.Option value={eFormatPicker.month}>Tháng</Select.Option>
							<Select.Option value={eFormatPicker.year}>Năm</Select.Option>
						</Select>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 3)}>
						<strong>Nhóm máy bán nước</strong>
						<SelectedGroupMachine groupmachineId={this.state.groupMachineId} onChangeGroupMachine={(value: number) => this.onChangeGroupMachine(value)} />
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 3)}>
						<strong>Máy bán nước</strong>
						<SelectedMachineMultiple listMachineId={this.state.listMachineId} onChangeMachine={(value) => this.setState({ listMachineId: value })} groupMachineId={this.state.groupMachineId} />
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 3)}>
						<strong>{this.state.selectedOption == eFormatPicker.date ? "Từ ngày" : (this.state.selectedOption == eFormatPicker.month ? "Tháng" : "Năm")}</strong>
						<DatePicker
							placeholder={this.state.selectedOption == eFormatPicker.date ? "Từ ngày" : (this.state.selectedOption == eFormatPicker.month ? "Tháng" : "Năm")}
							style={{ width: '100%' }}
							onChange={(date: Moment | null, dateString: string) => this.onChangeStartDate(date)}
							value={this.state.start_date}
							picker={this.state.selectedOption}
							format={this.state.selectedOption == eFormatPicker.date ? "DD/MM/YYYY" : (this.state.selectedOption == eFormatPicker.month ? "MM/YYYY" : "YYYY")}
						/>
					</Col>
					{
						this.state.selectedOption == eFormatPicker.date &&
						<Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 3)}>
							<strong>Đến ngày</strong>
							<DatePicker
								placeholder='Đến ngày'
								style={{ width: '100%' }}
								onChange={(date: Moment | null, dateString: string) => this.onChangeEndDate(date)}
								value={this.state.end_date}
								picker={this.state.selectedOption}
								format={this.state.selectedOption == eFormatPicker.date ? "DD/MM/YYYY" : (this.state.selectedOption == eFormatPicker.month ? "MM/YYYY" : "YYYY")}
								disabledDate={(current => current ? current <= moment(this.state.start_date).add(1, 'day') : false)}
							/>
						</Col>
					}
					<Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 4)}>
						<strong>Giá từ</strong>
						<SelectEnum
							eNum={eMoney}
							onChangeEnum={(e) => { this.setState({ low_price: e }) }}
							enum_value={this.state.low_price}
							disableHighPrice={this.state.low_price}
						></SelectEnum>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 4)}>
						<strong>đến</strong>
						<SelectEnum
							eNum={eMoney}
							disableLowPrice={this.state.low_price}
							onChangeEnum={(e) => this.setState({ high_price: e })}
							enum_value={this.state.high_price}
						></SelectEnum>
					</Col>
					{this.state.low_price! > this.state.high_price! ?
						"" :
						<Col {...cssColResponsiveSpan(24, 5, 5, 4, 3, 2)}>
							<Button type="primary" icon={<SearchOutlined />} title={this.L('Search')} onClick={this.handleSubmitSearch} >{L('Search')}</Button>
						</Col>
					}
					{
						(!!this.state.end_date || !!this.state.start_date || !!this.state.groupMachineId || !!this.state.listMachineId || !!this.state.low_price || !!this.state.high_price) &&
						<Col {...cssColResponsiveSpan(24, 5, 5, 5, 4, 3)}>
							<Button danger icon={<DeleteOutlined />} title={"Xóa tìm kiếm"} onClick={this.onClearSearch} >Xóa tìm kiếm</Button>
						</Col>
					}
				</Row>
			</>
		)
	}

}

