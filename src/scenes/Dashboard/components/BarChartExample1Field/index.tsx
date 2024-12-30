import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, Label } from 'recharts';
import * as React from 'react';
import { DashboardDto } from '@src/services/services_autogen';
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


const BarChartExample1Field = (props: IProps) => {
	const colors = ['#a5dfdf', '#9ad0f5', '#ccb2ff', '#ffcf9f', '#ffb1c1', '#ff708f'];
	return (
		<BarChart width={500} height={500} data={props.data} margin={{}}>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="name" hide />
				<YAxis yAxisId="left" orientation="left" stroke="#969696">
				</YAxis>
				<Tooltip />
				<Bar yAxisId="left" dataKey="quantity" fill="#8884d8" name={props.legend} barSize={50} label={{ position: 'top' }}>
					{props.data?.map((entry, index) => (
						<Cell key={`cell-${index}`} fill={colors[index]} />
					))}
				</Bar>
			</BarChart>
	)
}


// class BarChartExample1Field extends React.Component<IProps> {
// 	colors = ['#a5dfdf', '#9ad0f5', '#ccb2ff', '#ffcf9f', '#ffb1c1', '#ff708f'];
// 	render() {
// 		return (
// 			<BarChart width={500} height={500} data={this.props.data} margin={{}}>
// 				<CartesianGrid strokeDasharray="3 3" />
// 				<XAxis dataKey="name" hide />
// 				<YAxis yAxisId="left" orientation="left" stroke="#969696">
// 				</YAxis>
// 				<Tooltip />
// 				<Bar yAxisId="left" dataKey="quantity" fill="#8884d8" name={this.props.legend} barSize={50} label={{ position: 'top' }}>
// 					{this.props.data?.map((entry, index) => (
// 						<Cell key={`cell-${index}`} fill={this.colors[index]} />
// 					))}
// 				</Bar>
// 			</BarChart>
// 		);
// 	}
// };

export default BarChartExample1Field;
