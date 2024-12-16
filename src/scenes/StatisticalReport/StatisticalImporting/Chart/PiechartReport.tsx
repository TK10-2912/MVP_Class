import { Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as React from 'react';
import { Col, Row } from 'antd';

export interface IProps {
    data?: DataPiechart[];
    label1?: string;
    label2?: string;
    nameColumg1_1?: string;
    nameColumg1_2?: string;
    nameColumg1_3?: string;
    nameColumg2_1?: string;
    nameColumg2_2?: string;
    nameColumg2_3?: string;
}
export class DataPiechart {
    public name = '';
    public pie1 = 0;
    public pie2 = 0;

    constructor(name, pie1, pie2) {
        this.name = name;
        this.pie1 = pie1;
        this.pie2 = pie2;
    }
}

class PiechartReport extends React.Component<IProps> {
    COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

    RADIAN = Math.PI / 180;
    renderCustomizedLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
        index
    }: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * this.RADIAN);
        const y = cy + radius * Math.sin(-midAngle * this.RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
            >
                {`${(percent * 100).toFixed(2)}%`}
            </text>
        );
    };
    render() {
        return (
            <>
                <Row>
                    <Col span={12}>
                        <div style={{ justifyContent: 'center' }}>
                            <h3 style={{ display: "flex", justifyContent: "center" }}>Biểu đồ doanh thu theo hình thức thanh toán</h3>
                            <ResponsiveContainer width={"100%"} height={window.innerHeight * 2 / 3}>
                                <PieChart >
                                    <Pie
                                        data={this.props.data!.filter(entry => entry.pie1 !== 0)}
                                        labelLine={false}
                                        label={this.renderCustomizedLabel}
                                        outerRadius={window.innerHeight * 2 / 7}
                                        fill="#8884d8"
                                        dataKey="pie1"
                                    >
                                        {this.props.data!.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={this.COLORS[index % this.COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Col>
                    <Col span={12}>
                        <div style={{ justifyContent: "center" }}>
                            <h3 style={{ display: "flex", justifyContent: "center" }}>Biểu đồ số đơn hàng theo hình thức thanh toán</h3>
                            <ResponsiveContainer width={"100%"} height={window.innerHeight * 2 / 3}>
                                <PieChart >
                                    <Pie
                                        data={this.props.data!.filter(entry => entry.pie1 !== 0)}
                                        labelLine={false}
                                        label={this.renderCustomizedLabel}
                                        outerRadius={window.innerHeight * 2 / 7}
                                        fill="#8884d8"
                                        dataKey="pie2"
                                    >
                                        {this.props.data!.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={this.COLORS[index % this.COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer >
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
                        <Legend
                            align="center"
                            verticalAlign="bottom"
                            layout="horizontal"
                            iconType="circle"
                            iconSize={10}
                            payload={this.props.data!.map((entry, index) => ({
                                id: `legend-${index}`,
                                value: entry.name,
                                type: 'circle',
                                color: this.COLORS[index % this.COLORS.length],
                            }))}
                        />
                    </Col>
                </Row>
                </>
        )
    }
};

export default PiechartReport;