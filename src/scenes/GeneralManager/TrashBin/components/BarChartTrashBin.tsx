import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, ResponsiveContainer, Label, ComposedChart, Line, Brush } from 'recharts';
import * as React from 'react';
import { Button, Card, Row, Space } from 'antd';
import AppConsts from '@src/lib/appconst';
import { stores } from '@src/stores/storeInitializer';
import { TrashBinDto } from '@src/services/services_autogen';

export type DataChartType = {
    'name': string,
    'tr_type_0': number,
    'tr_type_1': number,
    'tr_type_2': number,
    'tr_type_3': number,
    'tr_type_4': number,
    'tr_type_5': number,
    'total_money': number,
    'total_trash': number,
}
export interface IProps {
    trashBinListResult: TrashBinDto[];
}

class BarChartTrashBin extends React.Component<IProps> {

    state = {
        isLoadDone: false,
        isAscending: 1,

    }
    dataChart: DataChartType[] = [];

    async componentDidMount() {
        const { trashBinListResult } = this.props;
        trashBinListResult.forEach(trashBin => {
            const { tr_name, tr_type, tr_tong_tien_quy_doi_theo_rac, tr_total_trash } = trashBin;
            const existingItem = this.dataChart.find(item => item.name === tr_name);
            if (existingItem) {
                existingItem.tr_type_0 += tr_type === 0 ? parseFloat((tr_total_trash / 1000).toFixed(3)) : 0;
                existingItem.tr_type_1 += tr_type === 1 ? parseFloat((tr_total_trash / 1000).toFixed(3)) : 0;
                existingItem.tr_type_2 += tr_type === 2 ? parseFloat((tr_total_trash / 1000).toFixed(3)) : 0;
                existingItem.tr_type_3 += tr_type === 3 ? parseFloat((tr_total_trash / 1000).toFixed(3)) : 0;
                existingItem.tr_type_4 += tr_type === 4 ? parseFloat((tr_total_trash / 1000).toFixed(3)) : 0;
                existingItem.tr_type_5 += tr_type === 5 ? parseFloat((tr_total_trash / 1000).toFixed(3)) : 0;
                existingItem.total_money += tr_tong_tien_quy_doi_theo_rac ?? 0;
                existingItem.total_trash = (
                    existingItem.tr_type_0 +
                    existingItem.tr_type_1 +
                    existingItem.tr_type_2 +
                    existingItem.tr_type_3 +
                    existingItem.tr_type_4 +
                    existingItem.tr_type_5
                )
            }
            else {
                const tr_type_0 = tr_type === 0 ? parseFloat((tr_total_trash / 1000).toFixed(3)) : 0;
                const tr_type_1 = tr_type === 1 ? parseFloat((tr_total_trash / 1000).toFixed(3)) : 0;
                const tr_type_2 = tr_type === 2 ? parseFloat((tr_total_trash / 1000).toFixed(3)) : 0;
                const tr_type_3 = tr_type === 3 ? parseFloat((tr_total_trash / 1000).toFixed(3)) : 0;
                const tr_type_4 = tr_type === 4 ? parseFloat((tr_total_trash / 1000).toFixed(3)) : 0;
                const tr_type_5 = tr_type === 5 ? parseFloat((tr_total_trash / 1000).toFixed(3)) : 0;
                this.dataChart.push({
                    name: tr_name!,
                    tr_type_0: tr_type_0,
                    tr_type_1: tr_type_1,
                    tr_type_2: tr_type_2,
                    tr_type_3: tr_type_3,
                    tr_type_4: tr_type_4,
                    tr_type_5: tr_type_5,
                    total_money: tr_tong_tien_quy_doi_theo_rac ?? 0,
                    total_trash: tr_type_0 + tr_type_1 + tr_type_2 + tr_type_3 + tr_type_4 + tr_type_5,
                });
            }
        }
        )
        this.setState({ isLoadDone: true });
    }
    formatCurrency = (value) => {
        return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    DataFormater = (number) => {
        return AppConsts.formatNumber(number);
    }
    CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            // Tính tổng lượng rác
            const totalTrash = payload[0].payload.tr_type_0 +
                payload[0].payload.tr_type_1 +
                payload[0].payload.tr_type_2 +
                payload[0].payload.tr_type_3 +
                payload[0].payload.tr_type_4 +
                payload[0].payload.tr_type_5;

            return (
                <div className="custom-tooltip">
                    <p className="label">{`Tên: ${label}`}</p>
                    {payload.map((data, index) => (
                        <p key={index}>{`${data.name}: ${data.value}`}</p>
                    ))}
                    <p>{`Tổng lượng rác: ${totalTrash}`}</p> {/* Hiển thị tổng lượng rác */}
                </div>
            );
        }
    }
    compareNumbersAsc = (a, b) => {
        this.setState({ isAscending: 0 });
        return a - b;
    }

    compareNumbersDesc = (a, b) => {
        this.setState({ isAscending: 1 });
        return b - a;
    }
    sortData = () => {
        this.setState({ isLoadDone: false });
        this.dataChart.sort((a, b) => this.state.isAscending == 1 ? this.compareNumbersAsc(a.total_money, b.total_money) : this.compareNumbersDesc(a.total_money, b.total_money));
        this.setState({ isLoadDone: true });
    }
    render() {
        return (
            <Card bordered={false}>
                <Row style={{ marginBottom: 20 }}>
                    <Space>
                        <Button title='Sắp xếp' style={{ marginLeft: 20 }} type='primary' onClick={() => this.sortData()} >
                            {this.state.isAscending == 1 ? "Sắp xếp tăng dần" : "Sắp xếp giảm dần"}
                        </Button>
                    </Space>
                </Row>
                <ResponsiveContainer height={500}>
                    <ComposedChart margin={{ left: 20, right: 20 }} data={this.dataChart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" stroke="#969696" orientation='left'  >
                            <Label
                                value={"Tổng lượng rác(kg)"}
                                angle={-90}
                                position="insideLeft"
                                style={{ textAnchor: 'middle', fill: '#808080' }}
                                dx={-10}
                            />
                        </YAxis>
                        <YAxis yAxisId="right" orientation="right" stroke="#969696" tickFormatter={this.DataFormater}>
                            <Label
                                value={"Tổng tiền(VND)"}
                                angle={-90}
                                position="insideRight"
                                style={{ textAnchor: 'middle', fill: '#808080' }}
                                dx={10}
                            />
                        </YAxis>
                        <Tooltip formatter={(value) => new Intl.NumberFormat('en').format(Number(value))} />
                        <Legend margin={{ top: 10, right: 10, bottom: 0, left: 0 }} />
                        <Bar yAxisId="left" dataKey="tr_type_0" stackId="a" fill="#a5dfdf" name="Chưa phân loại" />
                        <Bar yAxisId="left" dataKey="tr_type_1" stackId="a" fill="#9ad0f5" name="Rác giấy" />
                        <Bar yAxisId="left" dataKey="tr_type_2" stackId="a" fill="#ccb2ff" name="Nhựa cứng" />
                        <Bar yAxisId="left" dataKey="tr_type_3" stackId="a" fill="#ffcf9f" name="Lon kim loại" />
                        <Bar yAxisId="left" dataKey="tr_type_4" stackId="a" fill="#ffb1c1" name="Nhựa dẻo" />
                        <Bar yAxisId="left" dataKey="tr_type_5" stackId="a" fill="#ff708f" name="Chai nhựa" />
                        <Brush dataKey="name" height={30} stroke="#8884d8" />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="total_money"
                            stroke="#FF7300"
                            name={"Tổng tiền"}
                            activeDot={{ r: 8 }}
                        />

                    </ComposedChart>
                </ResponsiveContainer>
            </Card>
        );
    }
}

export default BarChartTrashBin;
