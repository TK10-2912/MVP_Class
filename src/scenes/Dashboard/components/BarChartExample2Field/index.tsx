import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Cell } from 'recharts';
import * as React from 'react';
import { Row } from 'antd';
import { Data2Field } from '../LineChartExample';
import AppConsts from '@src/lib/appconst';

export interface IProps {
	data?: Data2Field[];
	legend?: string[];
}
class CustomLegend extends React.Component<IProps> {
	render() {
		const { legend } = this.props;
		return (

			<Row justify='center' >
				<div style={{ height: '10px', width: '20px', backgroundColor: '#8884d8', marginTop: '6px' }}></div>
				<div>{legend != undefined && legend[0]}</div>
				&nbsp; &nbsp;
				{legend != undefined && legend[1] ?
					<>
						<div style={{ height: '10px', width: '20px', backgroundColor: '#82ca9d', marginTop: '6px' }}></div>
						<div>{legend != undefined && legend[1]}</div>
					</>
					: ""
				}
			</Row>

		)
	}
}
class BarChartExample2Field extends React.Component<IProps> {
	DataFormater = (number) => {
		return AppConsts.formatNumber(number);
	};
	colors = ['#9ad0f5', '#ffb1c1', '#a5dfdf', '#ccb2ff', '#ffe6aa', '#e4e5e7'];

	render() {
		const { legend } = this.props;
		return (
			<Row style={{ display: "flex", justifyContent: "center" }}>
				<ResponsiveContainer width={1300} height={500}>
					<BarChart
						data={this.props.data}
						layout="vertical"
						margin={{ top: 5, bottom: 5, left: 50, right: 50 }}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis

							type="number"
							stroke="#969696"
							tickFormatter={this.DataFormater}
						>
							<Label
								value={legend != undefined ? legend[0] : ""}
								angle={0}
								position="insideTopRight"
								style={{ textAnchor: 'middle', fill: '#808080' }}
								dx={20}
								dy={-10}
							/>
						</XAxis>

						<YAxis
							type="category"
							dataKey="name"
						>
						</YAxis>
						<Tooltip formatter={(value) => new Intl.NumberFormat('en').format(Number(value))} />
						<Bar
							dataKey="value"
							fill="#8884d8"
							name={legend != undefined ? legend[0] : ""}
							barSize={50}
							label={{ position: 'top' }}
						>
							{this.props.data?.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={this.colors[index]} />
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</Row>
		);
	}
};


export default BarChartExample2Field;
