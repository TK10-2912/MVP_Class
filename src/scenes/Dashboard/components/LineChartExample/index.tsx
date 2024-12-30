import { DashboardDto } from '@src/services/services_autogen';
import * as React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
// export class IProps {
// 	data: DashboardDto;
// }
export interface IProps{
	data: DashboardDto;
}
export class Data2Field {
	public name = '';
	public id = 0;
	public value = 0;
	constructor(name, id, value) {
		this.name = name;
		this.id = id;
		this.value = value;
	}
}
export default class LineChartExample extends React.Component<IProps> {
	// data = [
	// 	{ name: 'Tháng 1', visit: 4000, session: 2400, amt: 2400 },
	// 	{ name: 'Tháng 2', visit: 3000, session: 1398, amt: 2210 },
	// 	{ name: 'Tháng 3', visit: 2000, session: 9800, amt: 2290 },
	// 	{ name: 'Tháng 4', visit: 2780, session: 3908, amt: 2000 },
	// 	{ name: 'Tháng 5', visit: 1890, session: 4800, amt: 2181 },
	// 	{ name: 'Tháng 6', visit: 2390, session: 3800, amt: 2500 },
	// 	{ name: 'Tháng 7', visit: 3490, session: 4300, amt: 2400 },
	// 	{ name: 'Tháng 8', visit: 2490, session: 5300, amt: 2200 },
	// 	{ name: 'Tháng 9', visit: 3490, session: 6000, amt: 2300 },
	// 	{ name: 'Tháng 10', visit: 5000, session: 6100, amt: 2100 },
	// 	{ name: 'Tháng 11', visit: 4000, session: 4300, amt: 2000 },
	// 	{ name: 'Tháng 12', visit: 3200, session: 3300, amt: 1900 },
	// ];
	// data = this.props.data.top5DrinkOfQuantity?.map(item => new Data2Field(item., item., item.ma_no_fr_drink));

	render() {
		return (
			// <LineChart width={1100} height={300} data={this.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
			// 	<XAxis dataKey="name" />
			// 	<YAxis />
			// 	<CartesianGrid strokeDasharray="3 3" />
			// 	<Tooltip />
			// 	<Legend />
			// 	<Line type="monotone" dataKey="ma_no_drink" stroke="#8884d8" activeDot={{ r: 12 }} />
			// 	<Line type="monotone" dataKey="ma_no_fr_drink" stroke="#82ca9d" />
			// </LineChart>
			<></>
		);
	}
};


