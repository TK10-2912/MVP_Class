import * as React from 'react';
import AppComponentBase from "../AppComponentBase";
import { Button, Col, DatePicker, Row, Select } from "antd";
import moment from 'moment';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import SelectedGroupMachine from '../SelectedGroupMachine';
import { MachineAbstractDto } from '@src/services/services_autogen';
import { cssColResponsiveSpan } from '@src/lib/appconst';
import SelectEnum from '../SelectEnum';
import { eMoney } from '@src/lib/enumconst';
import SelectedMachineMultiple from '../SelectedMachineMultiple';
import SelectUserMultiple from '../SelectUserMultiple';
import { SearchPriceUnitInputAdmin } from '@src/stores/statisticStore';

export interface IProps {
	onSearchStatistic: (input: SearchPriceUnitInputAdmin) => void;
	getTypeDate?: (type: any) => void;
}
const { RangePicker } = DatePicker;

export const eFormatPicker = {
	date: "date",
	month: "month",
	year: "year",
}
export default class StatisticSearchByPriceUnitInputAdmin extends AppComponentBase<IProps> {
	state = {
		isLoadDone: false,
		groupMachineId: undefined,
		listMachineId: undefined,
		product_key: undefined,
		low_price: undefined,
		high_price: undefined,
		us_id_list: undefined,
		selectedOption: "date",
		rangeDatetime: undefined,
	};
	inputSearch: SearchPriceUnitInputAdmin = new SearchPriceUnitInputAdmin(undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined);
	machineListResult: MachineAbstractDto[] = [];
	async componentDidMount() {
		await this.setState({ selectedOption: eFormatPicker.date, });
		this.handleSubmitSearch();
	}

	handleSubmitSearch = async () => {
		this.setState({ isLoadDone: false });
		this.inputSearch.start_date = !!this.state.rangeDatetime ? moment(this.state.rangeDatetime![0]).startOf(this.state.selectedOption as any).toDate() : undefined;
		this.inputSearch.end_date = !!this.state.rangeDatetime?.[1] ?
			moment(this.state.rangeDatetime?.[1]).endOf(this.state.selectedOption as any).toDate() :undefined;
		this.inputSearch.ma_id_list = this.state.listMachineId;
		this.inputSearch.gr_ma_id = this.state.groupMachineId;
		this.inputSearch.high_price = this.state.high_price;
		this.inputSearch.low_price = this.state.low_price;
		this.inputSearch.us_id = this.state.us_id_list;

		const { onSearchStatistic } = this.props;
		if (onSearchStatistic != undefined) {
			onSearchStatistic(this.inputSearch);
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
			rangeDatetime: undefined,
			low_price: undefined,
			high_price: undefined,
		})
		this.handleSubmitSearch();
	}
	shouldChangeText = () => {
		const isChangeText = window.innerWidth >= 576 && window.innerWidth <= 1200 || window.innerWidth >= 1600 && window.innerWidth <= 1895;
		return !!isChangeText;
	}
	render() {
		return (
			<div style={{ width: "100%" }}>
				<Row gutter={[8, 8]}>
					<Col {...cssColResponsiveSpan(24, 12, 8, 6, 3, 3)}>
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
					<Col {...cssColResponsiveSpan(24, 12, 8, 6, 6, 6)}>
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
					<Col {...cssColResponsiveSpan(24, 12, 8, 6, 3, 3)}>
						<SelectEnum
							placeholder='Giá từ...'
							eNum={eMoney}
							onChangeEnum={(e) => this.setState({ low_price: e })}
							enum_value={this.state.low_price}
							disableHighPrice={this.state.high_price}
						></SelectEnum>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 6, 3, 3)}>
						<SelectEnum
							placeholder='Đến...'
							eNum={eMoney}
							disableLowPrice={this.state.low_price}
							onChangeEnum={(e) => this.setState({ high_price: e })}
							enum_value={this.state.high_price}
						></SelectEnum>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 6, 3, 3)}>
						<SelectUserMultiple
							onChangeUser={(value) => this.setState({ us_id_list: value })} us_id_list={this.state.us_id_list} />
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 6, 3, 3)}>
						<SelectedGroupMachine groupmachineId={this.state.groupMachineId} onChangeGroupMachine={async (value) => await this.setState({ groupMachineId: value })} />
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 6, 3, 3)}>
						<SelectedMachineMultiple
							onChangeMachine={(value) => this.setState({ listMachineId: value })} groupMachineId={this.state.groupMachineId} listMachineId={this.state.listMachineId} />
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 12, 6, 24, 24)} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
						<Button type="primary" icon={<SearchOutlined />} title={this.L('Search')} onClick={this.handleSubmitSearch} >Tìm kiếm</Button>
						{
							(!!this.state.rangeDatetime || !!this.state.groupMachineId || !!this.state.listMachineId || !!this.state.low_price || !!this.state.high_price) &&
							<Button danger icon={<DeleteOutlined />} title={"Xóa tìm kiếm"} onClick={this.onClearSearch} >{this.shouldChangeText() ? <span>Xóa</span> : <span>Xóa tìm kiếm</span>}</Button>
						}
					</Col>

				</Row>
			</div>
		)
	}

}


