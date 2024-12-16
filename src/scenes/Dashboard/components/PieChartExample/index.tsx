import { DashboardDto } from '@src/services/services_autogen';
import * as React from 'react';
import { PieChart, Pie, Tooltip } from 'recharts';
export class Data {
	public name = '';
	public quantity = 0;
	constructor(name, quantity) {
		this.name = name;
		this.quantity = quantity;
	}
}
export interface IProps {
	data: DashboardDto;
}
class PieChartExample extends React.Component<IProps> {
	state = {
		activeIndex: 0,
	};

	getInitialState() {
		return {
			activeIndex: 0,
		};
	}

	onPieEnter(data: any, index: any) {
		this.setState({
			activeIndex: index,
		});
	}
	data = this.props.data.top5DrinkOfQuantity?.map(item => new Data(item.name, item.name));
	render() {
		return (
			<PieChart width={200} height={200}>
				<Pie dataKey="quantity" data={this.data} cx={100} cy={100} outerRadius={80} fill="#8884d8" label />
				<Tooltip />
			</PieChart>
		);
	}
}

export default PieChartExample;
