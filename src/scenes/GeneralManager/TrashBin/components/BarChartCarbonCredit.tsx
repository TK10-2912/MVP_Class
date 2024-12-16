import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, ResponsiveContainer, Label, ComposedChart, Line, Brush } from 'recharts';
import * as React from 'react';
import { Button, Card, Row, Space } from 'antd';
import AppConsts from '@src/lib/appconst';
import { stores } from '@src/stores/storeInitializer';
import { ETrashType, TrashBinDto } from '@src/services/services_autogen';
import { eTrashType } from '@src/lib/enumconst';

export type DataChartType = {
    'name': string,
    'carbon_credit': number,
    'plastic_credit': number,
}

class BarChartCarbonCredit extends React.Component {

    state = {
        isLoadDone: false,
		isAscending: 1,

    }
    dataCarbonCredit: DataChartType[] = [];

    async componentDidMount() {
        this.calculatorDataCarbonCredit();
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }

    calculatorDataCarbonCredit = () => {
        const { trashBinListResult } = stores.trashBinStore;
        trashBinListResult.forEach((trashBin) => {
            const { tr_name, tr_type, tr_total_trash } = trashBin;
            if (tr_type === eTrashType.CHAI_NHUA.num ||
                tr_type === eTrashType.NHUA_CUNG.num ||
                tr_type === eTrashType.NHUA_DEO.num) {
                const indexExistTrashBinName: number = this.dataCarbonCredit.findIndex(value => value.name === tr_name!);
                if (indexExistTrashBinName !== -1) {
                    this.dataCarbonCredit[indexExistTrashBinName] = { 
                        name: tr_name!, 
                        carbon_credit: this.dataCarbonCredit[indexExistTrashBinName].carbon_credit + AppConsts.calculatorCarbonCredit(tr_total_trash),
                        plastic_credit: this.dataCarbonCredit[indexExistTrashBinName].plastic_credit + AppConsts.calculatorCarbonCredit(tr_total_trash),
                    }
                }
                else {
                    this.dataCarbonCredit.push({
                        name: tr_name!,
                        carbon_credit: AppConsts.calculatorCarbonCredit(tr_total_trash),
                        plastic_credit: AppConsts.calculatorPlasticCredit(tr_total_trash),
                    });
                }
            }
        })
    }
    formatCurrency = (value) => {
        return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    DataFormater = (number) => {
        return AppConsts.formatNumber(number);
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
		this.dataCarbonCredit.sort((a, b) => this.state.isAscending == 1 ? this.compareNumbersAsc(a.carbon_credit, b.carbon_credit) : this.compareNumbersDesc(a.carbon_credit, b.carbon_credit));
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
                    <ComposedChart margin={{ left: 20, right: 20 }} data={this.dataCarbonCredit}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" stroke="#969696" orientation='left' tickFormatter={this.DataFormater} >
                            <Label
                                value={"Tín chỉ"}
                                angle={-90}
                                position="insideLeft"
                                style={{ textAnchor: 'middle', fill: '#808080' }}
                                dx={-10}
                            />
                        </YAxis>
                        <Brush dataKey="name" height={30} stroke="#8884d8" />
                        <Tooltip formatter={(value) => new Intl.NumberFormat('en').format(Number(value))} />
                        <Legend margin={{ top: 10, right: 10, bottom: 0, left: 0 }} />
                        <Bar yAxisId="left" dataKey="plastic_credit" stackId="a" fill="#9ad0f5" name="Tín chỉ Nhựa" />
                        <Bar yAxisId="left" dataKey="carbon_credit" stackId="b" fill="#ff708f" name="Tín chỉ Carbon" />
                    </ComposedChart>
                </ResponsiveContainer>
            </Card>
        );
    }
}

export default BarChartCarbonCredit;
