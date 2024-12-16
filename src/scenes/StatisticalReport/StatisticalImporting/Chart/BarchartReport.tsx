import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	Label,
	Line,
	Brush,
} from 'recharts';
import * as React from 'react';
import AppConsts from '@src/lib/appconst';
import { Button, Row, Space } from 'antd';

export interface IProps {
	data?: DataBarchart[];
	label1?: string;
	label2?: string;
	nameColumg1_1?: string;
	nameColumg1_2?: string;
	nameColumg1_3?: string;
	nameColumg2_1?: string;
	nameColumg2_2?: string;
	nameColumg2_3?: string;
}
export class DataBarchart {
	public name = '';
	public column1_1 = 0;
	public column1_2 = 0;
	public column1_3 = 0;
	public column2_1 = 0;
	public column2_2 = 0;
	public column2_3 = 0;
	public totalMoney = 0;

	constructor(name, column1_1, column1_2, column1_3, column2_1, column2_2, column2_3, totalMoney) {
		this.name = name;
		this.column1_1 = column1_1;
		this.column1_2 = column1_2;
		this.column1_3 = column1_3;
		this.column2_1 = column2_1;
		this.column2_2 = column2_2;
		this.column2_3 = column2_3;
		this.totalMoney = totalMoney;
	}
}

class BarchartReport extends React.Component<IProps> {
	state = {
		isLoadDone: false,
		isAscending: 1,
	}
	dataDisplay: DataBarchart[] = [];
	componentDidMount() {
		this.setState({ isLoadDone: false });
		this.dataDisplay = this.props.data != undefined ? this.props.data : [];
		this.setState({ isLoadDone: true });
	}
	compareNumbersAsc = (a, b) => {
		this.setState({ isAscending: 0 });
		return a - b;
	}

	compareNumbersDesc = (a, b) => {
		this.setState({ isAscending: 1 });
		return b - a;
	}
	sortData = () => {
		this.setState({ isLoadDone: false });
		this.dataDisplay.sort((a, b) => this.state.isAscending == 1 ? this.compareNumbersAsc(a.totalMoney, b.totalMoney) : this.compareNumbersDesc(a.totalMoney, b.totalMoney));
		this.setState({ isLoadDone: true });
	}
	render() {
		return (

			<div style={{ marginBottom: 20 }}>
				<Row>
					<Space>
						<Button title='Sắp xếp' style={{ marginLeft: 20 }} type='primary' onClick={() => this.sortData()} >
							{this.state.isAscending == 1 ? "Sắp xếp tăng dần" : "Sắp xếp giảm dần"}
						</Button>
					</Space>
				</Row>
				<ResponsiveContainer width={'100%'} height={(window.innerHeight * 2) / 3}>
					<BarChart data={this.dataDisplay} margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="name" />
						<YAxis
							width={90}
							yAxisId="left"
							orientation="left"
							stroke="#808080"
							tickFormatter={(value) => {
								return new Intl.NumberFormat('vi-VN', {
									style: 'currency',
									currency: 'VND',
								}).format(value);
								// return AppConsts.formatNumber(value)
							}}
						>
							<Label
								value={this.props.label1}
								angle={-90}
								position="insideLeft"
								style={{ textAnchor: 'middle', fill: '#808080', }}
								dx={-28}
							/>
						</YAxis>
						<YAxis yAxisId="right" orientation="right" stroke="#808080">
							<Label
								value={this.props.label2}
								angle={90}
								position="insideRight"
								style={{ textAnchor: 'middle', fill: '#808080' }}
							/>
						</YAxis>
						<Tooltip />
						<Legend />
						<Bar
							yAxisId="left"
							dataKey="column1_1"
							name={this.props.nameColumg1_1}
							stackId="left"
							fill="#ff9c6e"
							barSize={50}
						/>
						<Bar
							yAxisId="left"
							dataKey="column1_2"
							name={this.props.nameColumg1_2}
							stackId="left"
							fill="#1677ff"
							barSize={50}
						/>
						<Bar
							yAxisId="left"
							dataKey="column1_3"
							name={this.props.nameColumg1_3}
							stackId="left"
							fill="#95de64"
							barSize={50}
						/>
						<Bar
							yAxisId="right"
							dataKey="column2_1"
							name={this.props.nameColumg2_1}
							stackId="right"
							fill="#5cdbd3"
							barSize={50}
						/>
						<Bar
							yAxisId="right"
							dataKey="column2_2"
							name={this.props.nameColumg2_2}
							stackId="right"
							fill="#b37feb"
							barSize={50}
						/>
						<Bar
							yAxisId="right"
							dataKey="column2_3"
							name={this.props.nameColumg2_3}
							stackId="right"
							fill="#69b1ff"
							barSize={50}
						/>
						<Brush dataKey="name" height={30} stroke="#8884d8" />
					</BarChart>
				</ResponsiveContainer>
			</div>
		);
	}
}

export default BarchartReport;
