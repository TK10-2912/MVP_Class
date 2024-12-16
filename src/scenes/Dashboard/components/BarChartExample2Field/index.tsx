import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label, Line, ComposedChart } from 'recharts';
import * as React from 'react';
import { Row, Space } from 'antd';
import AppConsts from '@src/lib/appconst';
import { ItemChartDashBoardCombination } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';

export interface IProps {
	data?: ItemChartDashBoardCombination[];
	legend?: string[];
	label?: string;
	label2?: string;
	label3?: string;
}

class CustomLegend extends React.Component<IProps> {
	render() {
		const { legend } = this.props;
		return (
			<Row justify='center'>
				<Space>
					<>
						<div style={{ height: 10, width: 20, backgroundColor: '#8884d8' }}></div>
						<span>{legend && legend[0]}</span>
					</>
					{legend && legend[1] &&
						<>
							<div style={{ height: 10, width: 20, backgroundColor: '#ff7300' }}></div>
							<span>{legend[1]}</span>
						</>
					}
					{legend && legend[2] &&
						<>
							<div style={{ height: 10, width: 20, backgroundColor: '#ff708f' }}></div>
							<span>{legend[2]}</span>
						</>
					}
				</Space>
			</Row>
		)
	}
}

class BarChartExample2Field extends React.Component<IProps> {
	state = {
		isLoadDone: false,
	}
	DataFormater = (number) => {
		return AppConsts.formatNumber(number);
	}
	colors = '#8884D8';

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
		const { legend, label, label2, label3 } = this.props;
		return (
			<>
				<ResponsiveContainer height={500}>
					<ComposedChart data={this.props.data} margin={{ left: 20, right: 20 }}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis
							dataKey="name"
							tickFormatter={(tick) => {
								return tick.length > 10 ? `${tick.substring(0, 15)}...` : tick;
							}}
						/>
						<YAxis yAxisId="left" orientation="left" stroke="#969696" tickFormatter={this.DataFormater} width={90}>
							<Label
								value={label ?? ""}
								angle={-90}
								position="insideLeft"
								style={{ textAnchor: 'middle', fill: '#808080' }}
								dx={-20}
							/>
						</YAxis>
						{!!label2 &&
							<YAxis yAxisId="right" orientation="right" stroke="#969696" tickFormatter={this.DataFormater}>
								<Label
									value={label2}
									angle={-90}
									position="insideRight"
									style={{ textAnchor: 'middle', fill: '#808080' }}
									dx={10}
								/>
							</YAxis>
						}
						
						<Tooltip formatter={(value) => new Intl.NumberFormat('en').format(Number(value))} />
						<Bar yAxisId="left" dataKey="valueColumn1" fill="#8884D8" name={legend ? legend[0] : "Total Money"} barSize={50}></Bar>
						{!!label2 ?
							<Line
								yAxisId="right"
								type="monotone"
								dataKey="valueColumn2"
								stroke="#FF7300"
								name={legend ? legend[1] : "valueColumn2"}
								activeDot={{ r: 8 }}
							/>
							:
							<Bar yAxisId={!!label2 ? "right" : "left"} dataKey="valueColumn2" fill="#ff7300" name={legend ? legend[1] : "Total Money"} barSize={50}></Bar>
						}
						{
							label3 &&
							<Bar yAxisId={"left"} dataKey="valueColumn3" fill="#ff708f" name={legend ? legend[2] : "Tổng tiền hoàn trả"} barSize={50}></Bar>
						}
					</ComposedChart>
				</ResponsiveContainer>
				<Legend content={<CustomLegend legend={legend} />} />
			</>
		);
	}
}

export default BarChartExample2Field;
