import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, Label, ResponsiveContainer, LabelList } from 'recharts';
import * as React from 'react';
import { DashboardDto } from '@src/services/services_autogen';
import { Data } from '../PieChartExample';
import { Row } from 'antd';

export interface IProps {
	data?: Data[];
	legend?: string;
}

class BarChartExample1Field3 extends React.Component<IProps> {
	COLORS = ['#a5dfdf', '#9ad0f5', '#ccb2ff', '#ffcf9f', '#ffb1c1', '#ff708f', '#b3e3e3', '#8bc3ff', '#d1b3ff', '#ff8fa5'];
	formatCurrency = (value) => {
		return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0, maximumFractionDigits: 0 });
	}

	renderCustomBarLabel = (props) => {
		const { x, y, width, value } = props;
		return (
			<text x={x + width / 2} y={y} fill="#666" textAnchor="middle" dy={-6}>
				{this.formatCurrency(value)}
			</text>
		);
	}

	render() {
		return (
			<ResponsiveContainer width="100%" height={450}>
				<BarChart
					layout="vertical"
					data={this.props.data}
					margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
				>
					<CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
					<XAxis
						type="number"
						tick={{ fill: '#555', fontSize: 12 }}
						axisLine={{ stroke: '#aaa' }}
						tickFormatter={this.formatCurrency}
					/>
					<YAxis
						dataKey="name"
						type="category"
						tick={{ fill: '#555', fontSize: 10 }}
						axisLine={{ stroke: '#aaa' }}
						tickFormatter={(tick) => {
							return tick.length > 10 ? `${tick.substring(0, 15)}...` : tick;
						  }}
					/>
					<Tooltip formatter={this.formatCurrency}
						contentStyle={{
							backgroundColor: '#fff',
							borderColor: '#ccc',
							borderRadius: 5,
							boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.1)',
						}}
						cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
					/>
					<Bar

						dataKey="quantity"
						name={this.props.legend}
						barSize={10}
					>
						<LabelList dataKey="quantity" content={this.renderCustomBarLabel} position="top" />
						{this.props.data?.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={this.COLORS[index]} />
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		);
	}
};

export default BarChartExample1Field3;
