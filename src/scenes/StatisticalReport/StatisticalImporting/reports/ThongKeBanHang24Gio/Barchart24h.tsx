import { Card, Col, Row, Space, Tag } from 'antd';
import React from 'react';
import { BarChart, Tooltip, Bar, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Legend, Label, Cell } from 'recharts';

export class DataBarchart {
    public hour: string;
    public money: Number;

    constructor(hour, money) {
        this.hour = hour;
        this.money = money;
    }
}
export interface Iprops {
    static: DataBarchart[];
}

export default class Barchart24h extends React.Component<Iprops> {

    state = {
        isLoadDone: false,
    }
    maxMoney: Number = 0;
    minMoney: Number = 0;
    componentDidMount() {
        this.setState({ isLoadDone: false })
        const listMoney = this.props.static != undefined ? this.props.static.map(item => Number(item.money)) : [];
        this.maxMoney = this.props.static != undefined ? Math.max(...listMoney) : 0;
        this.minMoney = this.props.static != undefined ? Math.min(...listMoney) : 0;
        this.setState({ isLoadDone: true })

    }

    render() {
        const customLegend = () => (
            <Row justify='center' style={{ paddingBottom: 10 }}>
                <Space>
                    <Col>
                        <Tag style={{ height: 7 }} color="#b30000" /> Thời gian bán được nhiều nhất
                    </Col>
                    <Col>
                        <Tag style={{ height: 7 }} color="#00cc66" /> Thời gian bán được ít nhất
                    </Col>
                </Space>
            </Row>
        );
        return (
            <Card bordered={false}>

                <ResponsiveContainer width={'100%'} height={(window.innerHeight * 2) / 3}>
                    <BarChart width={150} height={40} data={this.props.static != undefined ? this.props.static : []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour">
                            <Label
                                value={`Thời gian`}
                                dy={15}
                                position="center"
                                style={{ textAnchor: 'middle', fill: '#808080', }}

                            />
                        </XAxis>
                        <YAxis
                            width={90}
                            yAxisId="left"
                            orientation="left"
                            stroke="#808080"
                            scale={'auto'}
                            tickFormatter={(value) => {
                                return new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                }).format(value);
                                // return AppConsts.formatNumber(value)
                            }}
                        >

                            <Label
                                value={`Tổng tiền`}
                                angle={-90}
                                position="insideLeft"
                                style={{ textAnchor: 'middle', fill: '#808080', }}

                            />
                        </YAxis>
                        <Tooltip
                            labelFormatter={(label) => `Giờ: ${label}`}
                            formatter={(value: any) => [

                                new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                }).format(value),
                                "Tổng tiền"
                            ]
                            } />
                        <Legend content={customLegend} />
                        <Bar dataKey="money"
                            yAxisId="left" >
                            {this.props.static.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.money === this.maxMoney ? '#b30000' : entry.money === this.minMoney ? "#00cc66" : '#8884d8'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        );
    }
}
