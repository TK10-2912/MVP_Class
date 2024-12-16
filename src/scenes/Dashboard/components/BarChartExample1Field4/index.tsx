import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import * as React from 'react';
import { Data } from '../PieChartExample';
import { Row } from 'antd';

export interface IProps {
    data?: Data[];
    legend?: string;
}
class CustomLegend extends React.Component<IProps> {
    render() {
        return (

            <Row justify='center' >
                <div style={{ height: '10px', width: '20px', backgroundColor: '#82ca9d', marginTop: '6px' }}></div>
                <div>{this.props.legend}</div>
            </Row>

        )
    }
}
class BarChartExample1Field4 extends React.Component<IProps> {
    COLORS = ['#a5dfdf', '#9ad0f5', '#ccb2ff', '#ffcf9f', '#ffb1c1'];


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
                    />
                    <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fill: '#555', fontSize: 10 }}
                        axisLine={{ stroke: '#aaa' }}
                        tickLine={false}
                        tickFormatter={(tick) => {
                            return tick.length > 10 ? `${tick.substring(0, 15)}...` : tick;
                        }}
                    />
                    <Tooltip
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
                        label={{ position: 'top', fill: '#333', fontSize: 12 }}
                    >
                        {this.props.data?.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={this.COLORS[index]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        );
    }
};

export default BarChartExample1Field4;
