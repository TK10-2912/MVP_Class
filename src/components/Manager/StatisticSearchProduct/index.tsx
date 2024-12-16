import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { L } from '@src/lib/abpUtility';
import { cssColResponsiveSpan } from '@src/lib/appconst';
import { MachineAbstractDto } from '@src/services/services_autogen';
import { Button, Col, DatePicker, Row, Select } from "antd";
import moment from 'moment';
import AppComponentBase from "../AppComponentBase";
import SelectedGroupMachine from '../SelectedGroupMachine';
import SelectedMachineMultiple from '../SelectedMachineMultiple';
import SelectedProductKey from '../SelectedProductKey';
import * as React from 'react';
import { SearchBillingOfProductWithMachine } from '@src/stores/statisticStore';

export interface IProps {
	onSearchStatistic: (input: SearchBillingOfProductWithMachine) => void;
	getTypeDate?: (type: any) => void;
}
export const eFormatPicker = {
	date: "date",
	month: "month",
	year: "year",
}
const { RangePicker } = DatePicker;
export default class StatisticSearchProduct extends AppComponentBase<IProps> {
	state = {
		isLoadDone: false,
		groupMachineId: undefined,
		listMachineId: undefined,
		product_key: undefined,
		selectedOption: "date",
		rangeDatetime: undefined,
	};
	inputSearch: SearchBillingOfProductWithMachine = new SearchBillingOfProductWithMachine(undefined,undefined,undefined,undefined,undefined,undefined,undefined);
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
		this.inputSearch.product_key = this.state.product_key;
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
			product_key: undefined,
			rangeDatetime: undefined,
		})
		this.handleSubmitSearch();
	}
	shouldChangeText = () => {
		const isMdOrLg = window.innerWidth >= 576 && window.innerWidth <= 991;
		return !isMdOrLg;
	}
	render() {

		return (
			<div style={{ width: "100%" }}>
				<Row gutter={[8, 8]}>
					<Col {...cssColResponsiveSpan(24, 12, 8, 3, 3, 2)}>
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
					<Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 3)}>
						<SelectedGroupMachine groupmachineId={this.state.groupMachineId}
							onChangeGroupMachine={async (value) => await this.setState({ groupMachineId: value })}
						/>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 3)}>
						<SelectedMachineMultiple onChangeMachine={(value) => this.setState({ listMachineId: value })} groupMachineId={this.state.groupMachineId} listMachineId={this.state.listMachineId} />
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 3)}>
						<SelectedProductKey pr_key={this.state.product_key} onChangeProductKey={(value: string) => { this.setState({ product_key: value }) }} />
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 24, 24, 6)} style={{ display: "flex", flexWrap: "wrap", padding: 0 }}>
						<Col><Button type="primary" icon={<SearchOutlined />} title={this.L('Search')} onClick={this.handleSubmitSearch} >{this.shouldChangeText() ? 'Tìm kiếm' : 'Tìm'}</Button></Col>
						<Col>
							{
								(!!this.state.rangeDatetime || !!this.state.groupMachineId || !!this.state.listMachineId || !!this.state.product_key) &&
								<Button danger icon={<DeleteOutlined />} title={"Xóa tìm kiếm"} onClick={this.onClearSearch} >{this.shouldChangeText() ? <span>Xóa tìm kiếm</span> : <span>Xóa</span>}</Button>
							}
						</Col>
					</Col>
				</Row>
			</div>
		)
	}

}

