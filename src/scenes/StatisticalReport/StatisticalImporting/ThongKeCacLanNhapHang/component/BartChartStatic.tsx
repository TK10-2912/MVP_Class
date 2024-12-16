import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label } from 'recharts';
import * as React from 'react';
import { StatisticImportOfMachineDto } from '@src/services/services_autogen';
import { Button, Col, Row } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

export interface IProps {
    importingStatisticListResult: StatisticImportOfMachineDto[],
    onCancelChart: () => void,
    title: string,
}

export default class BarChartStatic extends React.Component<IProps> {
    render() {

        const { importingStatisticListResult } = this.props;
        const sliceData = importingStatisticListResult.slice(0, -1);
        return (
            <>
                <Row>
                    <Col span={22}>
                        <h2>{"BIỂU ĐỒ THỐNG KÊ CÁC LẦN NHẬP HÀNG " + this.props.title}</h2>
                    </Col>
                    <Col span={2} style={{ alignItems: 'right' }}>
                        <Button icon={<CloseOutlined />} type="primary" style={{ margin: '0 10px' }} danger onClick={() => this.props.onCancelChart()}>Hủy</Button>
                    </Col>
                </Row>
                <Row justify='center'>
                    <BarChart width={1100} height={350} data={sliceData} margin={{ top: 20, right: 60, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nameMachine" interval={0} textAnchor="middle" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" >
                            <Label
                                value={"Chai/lon"}
                                angle={-90}
                                position="insideLeft"
                                style={{ textAnchor: 'middle', fill: '#808080' }}
                            />
                        </YAxis>
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" >
                        <Label
                                value={"ml"}
                                angle={-90}
                                position="insideRight"
                                style={{ textAnchor: 'middle', fill: '#808080' }}
                            />
                        </YAxis>

                        <Tooltip />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar yAxisId="left" dataKey="quantityDrink" fill="#8884d8" name={"Sản phẩm có bao bì "} barSize={30} />
                        <Bar yAxisId="right" dataKey="quantityFreshDrink" fill="#82ca9d" name={"Sản phẩm không bao bì"} barSize={30} />
                    </BarChart>
                </Row>
            </>
        );
    }
}


