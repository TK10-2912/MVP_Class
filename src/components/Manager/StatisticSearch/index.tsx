import * as React from 'react';
import AppComponentBase from "../AppComponentBase";
import { Button, Col, DatePicker, Row, Select } from "antd";
import moment from 'moment';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import SelectedGroupMachine from '../SelectedGroupMachine';
import { MachineAbstractDto } from '@src/services/services_autogen';
import { cssColResponsiveSpan } from '@src/lib/appconst';
import SelectedMachineMultiple from '../SelectedMachineMultiple';
import { SearchInputUser } from '@src/stores/statisticStore';

export interface IProps {
	onSearchStatistic: (input: SearchInputUser) => void;
	getTypeDate?: (type: any) => void;
	defaultStartDate?: Date;
	defaultEndDate?: Date;
}

const { RangePicker } = DatePicker;

export const eFormatPicker = {
	date: "date",
	month: "month",
	year: "year",
}
export default class StatisticSearch extends AppComponentBase<IProps> {
	state = {
		isLoadDone: false,
		selectedOption: "date",
		rangeDatetime: undefined,
		groupMachineId: undefined,
		listMachineId: undefined,
		datePick: '',
	};
	inputSearch: SearchInputUser = new SearchInputUser(undefined, undefined, undefined, undefined, undefined, undefined);
	machineListResult: MachineAbstractDto[] = [];

	async componentDidMount() {
		await this.setState({ selectedOption: eFormatPicker.date, rangeDatetime: undefined });
		await this.handleSubmitSearch();

	}

	componentDidUpdate = async (prevProps) => {
		if (prevProps.defaultStartDate !== this.props.defaultStartDate || prevProps.defaultEndDate !== this.props.defaultEndDate) {
			this.setState({ rangeDatetime: [moment(this.props.defaultStartDate), moment(this.props.defaultEndDate).subtract(7,"hour")] });			
			
		}
	}

	handleSubmitSearch = async () => {
		this.setState({ isLoadDone: false });
		this.inputSearch.start_date = !!this.state.rangeDatetime ? moment(this.state.rangeDatetime![0]).startOf(this.state.selectedOption as any).toDate() : undefined;
		this.inputSearch.end_date = !!this.state.rangeDatetime?.[1] ?
			moment(this.state.rangeDatetime?.[1]).endOf(this.state.selectedOption as any).toDate() : undefined;
		this.inputSearch.ma_id_list = this.state.listMachineId;
		this.inputSearch.gr_ma_id = this.state.groupMachineId;
		const { onSearchStatistic } = this.props;
		if (onSearchStatistic !== undefined) {
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
			
		})
		await this.handleSubmitSearch();
		await this.setState({
			rangeDatetime: undefined,
		})
		await this.handleSubmitSearch();

	}
	shouldChangeText = () => {
		const isChangeText = window.innerWidth >= 991 && window.innerWidth <= 1234;
		return !!isChangeText;
	}

	render() {
		return (
			<Row gutter={[8, 8]} align='bottom'>
				<Col {...cssColResponsiveSpan(24, 12, 3, 3, 3, 3)}>
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
				<Col {...cssColResponsiveSpan(24, 12, 7, 6, 6, 6)}>
					<RangePicker
						style={{ width: "100%" }}
						placeholder={this.state.selectedOption === "date" ? ['Từ ngày', 'Đến ngày'] : (this.state.selectedOption === "month" ? ['Từ tháng', 'Đến tháng'] : ['Từ năm', 'Đến năm'])}
						onChange={async value => await this.setState({ rangeDatetime: value != undefined ? value : undefined })}
						picker={this.state.selectedOption as any}
						format={this.state.selectedOption === "date" ? 'DD/MM/YYYY' : (this.state.selectedOption === "month" ? 'MM/YYYY' : 'YYYY')}
						value={this.state.rangeDatetime != undefined ? this.state.rangeDatetime : undefined}
						allowEmpty={[false, true]}
					/>
				</Col>
				<Col {...cssColResponsiveSpan(24, 12, 7, 5, 4, 4)}>
					<SelectedGroupMachine groupmachineId={this.state.groupMachineId} onChangeGroupMachine={async (value) => await this.setState({ groupMachineId: value })} />
				</Col>
				<Col {...cssColResponsiveSpan(24, 12, 7, 5, 4, 4)}>
					<SelectedMachineMultiple
						onChangeMachine={(value) => this.setState({ listMachineId: value })} groupMachineId={this.state.groupMachineId} listMachineId={this.state.listMachineId} />
				</Col>
				<Col  {...cssColResponsiveSpan(24, 24, 24, 5, 7, 7)} style={{ display: "flex", gap: 8 }}>
					<Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={this.handleSubmitSearch} >{this.shouldChangeText() ? 'Tìm' : 'Tìm kiếm'}</Button>
					{
						(!!this.state.rangeDatetime || !!this.state.groupMachineId || !!this.state.listMachineId) &&
						<Button danger icon={<DeleteOutlined />} title={"Xóa tìm kiếm"} onClick={async () => await this.onClearSearch()} >{this.shouldChangeText() ? 'Xóa' : 'Xóa tìm kiếm'}</Button>
					}
				</Col>

			</Row>
		)
	}

}

