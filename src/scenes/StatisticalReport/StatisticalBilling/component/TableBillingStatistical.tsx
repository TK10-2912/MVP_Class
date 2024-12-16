import * as React from 'react';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { StatisticBillingOfMachineDto } from '@src/services/services_autogen';
import { Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';

export interface IProps {
    actionTable?: (item: StatisticBillingOfMachineDto, event: EventTable) => void;
    isLoadDone?: boolean;
    billingStatisticListResult: StatisticBillingOfMachineDto[],
}

export default class TableBillingStatistical extends React.Component<IProps> {
    state = {
        bill_statistic_selected: undefined,
    }

    onAction = (item: StatisticBillingOfMachineDto, action: EventTable) => {
        this.setState({ dr_id_selected: item.key });
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action);
        }
    }

    render() {
        const { billingStatisticListResult } = this.props

        const columns: ColumnsType<StatisticBillingOfMachineDto> = [
            { title: "STT", width: 50, key: "stt_bill_statistic_index", render: (text: string, item: StatisticBillingOfMachineDto, index: number) => <div>{index < billingStatisticListResult.length - 1 && index + 1}</div> },
            { title: "Tên máy", key: "name_machine_statistic", render: (text: string, item: StatisticBillingOfMachineDto) => <div> {item.nameMachine} </div> },
            { title: "Sản phẩm có bao bì (chai/lon)", key: "drink_statistic", render: (text: string, item: StatisticBillingOfMachineDto) => <div>{(AppConsts.formatNumber(item.drink!.length))}</div> },
            { title: "Sản phẩm không có bao bì (ml)", key: "fresh_drink_statistic", render: (text: string, item: StatisticBillingOfMachineDto) => <div> {(AppConsts.formatNumber(item.freshDrink!.length))}</div> },
            { title: "Tiền giao dịch (VNĐ)", key: "money_transaction_statistic", render: (text: number, item: StatisticBillingOfMachineDto) => <div> {AppConsts.formatNumber(item.moneyTransaction)} </div> },
            { title: "Tổng tiền (VNĐ)", key: "total_money_statistic", render: (text: number, item: StatisticBillingOfMachineDto) => <div> {AppConsts.formatNumber(item.totalMoney)}</div> },
        ];

        return (
            <Table
                // sticky
                className='centerTable'
                onRow={(record, rowIndex) => {
                    return {
                        onDoubleClick: (event: any) => { this.onAction(record!, EventTable.RowDoubleClick) }
                    };
                }}
                columns={columns}
                size={'middle'}
                bordered={true}
                
                dataSource={billingStatisticListResult.length > 0 ? billingStatisticListResult : []}
                pagination={false}
                rowClassName={(record, index) => (this.state.bill_statistic_selected === record.key) ? "bg-click" : "bg-white"}
                rowKey={record => "drink_table" + JSON.stringify(record)}
            />
        )
    }
}