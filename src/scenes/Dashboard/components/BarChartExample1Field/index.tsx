import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import * as React from 'react';
import { Data } from '../PieChartExample';
import { Row } from 'antd';

export interface IProps {
	data?: Data[];
	legend?: string;
}
class CustomLegend extends React.Component<IProps>{
	render() {
		return (
			<Row justify='center' >
				<div style={{ height: '10px', width: '20px', backgroundColor: '#82ca9d', marginTop: '6px' }}></div>
				<div>{this.props.legend}</div>
			</Row>
		)
	}
}
class BarChartExample1Field extends React.Component<IProps> {
	colors = ['#9ad0f5', '#ffb1c1', '#a5dfdf', '#ccb2ff', '#ffe6aa', '#e4e5e7'];

	render() {
		return (
			<BarChart width={500} height={300} data={this.props.data} margin={{}}>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="name" hide />
				<YAxis yAxisId="left" orientation="left" stroke="#969696">
				</YAxis>
				<Tooltip />
				<Bar yAxisId="left" dataKey="quantity" fill="#8884d8" name={this.props.legend} barSize={50} label={{ position: 'top' }}>
					{this.props.data?.map((entry, index) => (
						<Cell key={`cell-${index}`} fill={this.colors[index]} />
					))}
				</Bar>
			</BarChart>
		);
	}
};

export default BarChartExample1Field;
