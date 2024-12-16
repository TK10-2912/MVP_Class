import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { cssColResponsiveSpan } from '@src/lib/appconst';
import { eMoney } from '@src/lib/enumconst';
import { MachineAbstractDto } from '@src/services/services_autogen';
import { Button, Col, DatePicker, Row, Select } from "antd";
import moment from 'moment';
import AppComponentBase from "../AppComponentBase";
import SelectEnum from '../SelectEnum';
import SelectedGroupMachine from '../SelectedGroupMachine';
import SelectedMachineMultiple from '../SelectedMachineMultiple';
import * as React from 'react';
import { SearchPriceUnitInput } from '@src/stores/statisticStore';

export interface IProps {
	onSearchStatistic: (input: SearchPriceUnitInput) => void;
	getTypeDate?: (type: any) => void;
}
const { RangePicker } = DatePicker;

export const eFormatPicker = {
	date: "date",
	month: "month",
	year: "year",
}
export default class StatisticSearchByPriceUnitInput extends AppComponentBase<IProps> {
	state = {
		isLoadDone: false,
		selectedOption: "date",
		rangeDatetime: undefined,
		groupMachineId: undefined,
		listMachineId: undefined,
		product_key: undefined,
		low_price: undefined,
		high_price: undefined,
	};
	inputSearch: SearchPriceUnitInput = new SearchPriceUnitInput(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
	machineListResult: MachineAbstractDto[] = [];
	async componentDidMount() {
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
		this.inputSearch.high_price = this.state.high_price;
		this.inputSearch.low_price = this.state.low_price;
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
				<Row gutter={[8, 8]} align='bottom'>
					<Col {...cssColResponsiveSpan(24, 12, 8, 3, 2, 2)}>
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
					<Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 4)}>
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
					<Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 4)}>
						<strong>Nhóm máy</strong>

						<SelectedGroupMachine groupmachineId={this.state.groupMachineId} onChangeGroupMachine={async (value) => await this.setState({ groupMachineId: value })} />
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 4)}>
						<strong>Máy bán nước</strong>
						<SelectedMachineMultiple
							onChangeMachine={(value) => this.setState({ listMachineId: value })} groupMachineId={this.state.groupMachineId} listMachineId={this.state.listMachineId} />
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 2, 2, 2)}>
						<strong>Giá từ</strong>

						<SelectEnum
							placeholder='Giá từ...'
							eNum={eMoney}
							onChangeEnum={(e) => this.setState({ low_price: e })}
							enum_value={this.state.low_price}
							disableHighPrice={this.state.high_price}
						></SelectEnum>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 2, 2, 2)}>
						<strong>Đến</strong>

						<SelectEnum
							placeholder='Đến...'
							eNum={eMoney}
							disableLowPrice={this.state.low_price}
							onChangeEnum={(e) => this.setState({ high_price: e })}
							enum_value={this.state.high_price}
						></SelectEnum>
					</Col>

					<Col {...cssColResponsiveSpan(24, 12, 8, 2, 6, 6)} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
						<Button type="primary" icon={<SearchOutlined />} title={this.L('Search')} onClick={this.handleSubmitSearch} >Tìm kiếm</Button>
						{
							(!!this.state.rangeDatetime || !!this.state.groupMachineId || !!this.state.listMachineId || !!this.state.low_price || !!this.state.high_price) &&
							<Button danger icon={<DeleteOutlined />} title={"Xóa tìm kiếm"} onClick={this.onClearSearch} >{this.shouldChangeText() ? <span>Xóa tìm kiếm</span> : <span>Xóa</span>}</Button>
						}
					</Col>

				</Row>
			</div>
		)
	}

}


