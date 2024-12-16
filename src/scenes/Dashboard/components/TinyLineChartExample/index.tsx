import * as React from 'react';
import { LineChart, Line, Legend, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import './index.less';

export interface IProps {
	data: any;
}



export default class TinyLineChartExample extends React.Component<IProps> {

	customTooltip = ({ active, payload, label }) => {
		if (active && payload && payload.length) {
			return (
				<div className="custom-tooltip">
					<p className="label">{`${payload[0].payload.title} : ${payload[0].value}`}</p>
				</div>
			);
		}
		return null;
	};
	render() {
		return (
			// <LineChart width={300} height={100} data={this.props.data}>
			// 	<XAxis dataKey='title' hide/>
			// 	<YAxis hide/>
			// 	<Tooltip />
			// 	<Line type="monotone" dataKey='body' stroke="#fff" strokeWidth={2} activeDot={{r:12}}/>
			// </LineChart>
			<div style={{ position: "relative" }}>
			<LineChart  width={300} height={200} data={this.props.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
				<XAxis dataKey="name" hide />
				<YAxis hide />
				<Tooltip content={this.customTooltip} cursor={{ stroke: "transparent" }}/>
				{/* <Legend /> */}
				<Line type="monotone" dataKey="body"  stroke="#fff" activeDot={{ r: 12 }} />
			</LineChart>
			</div>
		)
	}
}