import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import * as React from 'react';
import { StatisticBillingOfMachineDto } from '@src/services/services_autogen';
import { Button, Col, Row } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

export interface IProps {
    billingStatisticListResult: StatisticBillingOfMachineDto[],
    onCancelChart: () => void,
    title: string,
}

export default class BarChartDrink extends React.Component<IProps> {
    render() {

        const { billingStatisticListResult } = this.props;
        const sliceData = billingStatisticListResult.slice(0, -1);

        return (
            <>
                <Row>
                    <Col span={22}>
                        <h2>{"BIỂU ĐỒ THỐNG KÊ SẢN PHẨM CÓ BAO BÌ " + this.props.title}</h2>
                    </Col>
                    <Col span={2} style={{ alignItems: 'right' }}>
                        <Button icon={<CloseOutlined />} type="primary" style={{ margin: '0 10px' }} danger onClick={() => this.props.onCancelChart()}>Hủy</Button>
                    </Col>
                </Row>
                <Row justify='center'>
                    <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
                        <BarChart width={1100} height={350} data={sliceData} margin={{ top: 20, right: 60, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nameMachine" interval={0} textAnchor="middle" />
                            <YAxis yAxisId="left" orientation="left" stroke="#8884d8"  label={{ value: 'Chai/lon', angle: 0, position: 'insideLeft', offset: -20 }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d"  label={{ value: 'VNĐ', angle: 0, position: 'insideRight', offset: -10 }}/>
                            <Tooltip />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar yAxisId="left" dataKey="drink.length" fill="#8884d8" name={"Sản phẩm có bao bì"} barSize={20} />
                            <Bar yAxisId="right" dataKey="moneyDrink" fill="#82ca9d" name={"Giá tiền"} barSize={20} />
                        </BarChart>
                    </div>
                </Row>
            </>
        );
    }
}


