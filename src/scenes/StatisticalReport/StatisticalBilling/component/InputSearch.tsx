import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import SelectedGroupMachine from '@src/components/Manager/SelectedGroupMachine';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';
import { L } from '@src/lib/abpUtility';
import { SearchInputUser } from '@src/stores/statisticStore';
import { Button, DatePicker, Row, Select, Col } from 'antd';
import moment, { Moment } from 'moment';
import React from 'react';

export const eFormatPicker = {
	date: "date",
	month: "month",
	year: "year",
}
export interface IProps {
	onDataChanged: (inputSearchData: SearchInputUser) => void;
}
export default class InputSearch extends React.Component<IProps> {
	state = {
		isLoadDone: false,
		selectedOption: undefined,
		startDate: moment(),
		endDate: moment(),
		groupMachineId: undefined,
		listMachineId: undefined,
		typeOfTime: "DD/MM/YYYY",
		clearSearch: false,
	};
	inputSearch: SearchInputUser = new SearchInputUser(undefined,undefined,undefined,undefined,undefined,undefined);

	async componentDidMount() {
		await this.setState({ selectedOption: eFormatPicker.date, isLoadDone: true });
	}

	handleSubmitSearch = async () => {
		this.setState({ isLoadDone: false });
		const { onDataChanged } = this.props;
		if (onDataChanged != undefined) {
			onDataChanged(this.inputSearch);
		}
		this.setState({ isLoadDone: true });
	}
	handleOptionChange = async (event) => {
		this.setState({ isLoadDone: false });
		if (event == "date") {
			this.setState({ typeOfTime: "DD/MM/YYYY" });
		}
		if (event == "month") {
			this.setState({ typeOfTime: "MM/YYYY" });
		}
		if (event == "year") {
			this.setState({ typeOfTime: "YYYY" });
		}
		this.setState({ isLoadDone: true, selectedOption: event });
	};

	handleSetValueDateTime = async (date: Moment) => {
		if (this.state.selectedOption == "date") {
			await this.setState({ startDate: date });
		}
		else if (this.state.selectedOption == "month") {
			await this.setState({ startDate: date.clone().date(1) });
			await this.setState({ endDate: date.clone().add(1, 'months').date(0) });
		}
		else {
			await this.setState({ startDate: date.clone().month(0).date(1) });
			await this.setState({ endDate: date.clone().add(1, 'years').date(0) });
		}
	}

	onClearSearch = () => {
		this.setState({
			startDate: undefined,
			endDate: undefined,
			groupMachineId: undefined,
			listMachineId: undefined,
			clearSearch: true,
		})
	}

	render() {
		return (
			<Row gutter={[8, 8]}>
				<Col span={2}>
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
				<Col span={4}>
					<DatePicker
						disabledDate={(current) => current ? current >= moment().endOf('day') : false}
						style={{ width: '100%', height: 32 }}
						onChange={(e) => this.handleSetValueDateTime(e!)}
						//value={this.state.startDate}
						picker={this.state.selectedOption}
						format={this.state.typeOfTime}
					/>
				</Col>
				{this.state.selectedOption == "date" &&
					<Col span={4}>
						<DatePicker
							disabledDate={(current) => current ? current >= moment().endOf('day') : false}
							style={{ width: '100%', height: 32 }}
							onChange={(date) => this.setState({ endDate: date })}
							//value={this.state.endDate}
							picker={this.state.selectedOption}
							format={this.state.typeOfTime}
						/>
					</Col>
				}

				<Col span={4}>
					<SelectedGroupMachine groupmachineId={this.state.groupMachineId} onChangeGroupMachine={(item) => this.setState({ groupMachineId: item })} />
				</Col>
				<Col span={7}>
					<SelectedMachineMultiple listMachineId={this.state.listMachineId} groupMachineId={this.state.groupMachineId} onChangeMachine={(item) => this.setState({ listMachineId: item })} />
				</Col>
				<Col span={3}>
					<Button type="primary" icon={<SearchOutlined />} title={L('Search')} onClick={this.handleSubmitSearch} >{L('Search')}</Button>
				</Col>
				{/* <Col span={24}>
					<Button
						danger
						icon={<DeleteOutlined />}
						title={L('Xóa tìm kiếm')}
						onClick={this.onClearSearch}			
					>
						{L('Xóa tìm kiếm')}
					</Button>
				</Col> */}
			</Row >
		);
	}
}
