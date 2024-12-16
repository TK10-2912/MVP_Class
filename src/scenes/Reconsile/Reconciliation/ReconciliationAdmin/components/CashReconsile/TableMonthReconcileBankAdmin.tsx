import AppConsts, { EventTable } from "@src/lib/appconst";
import { Button, Space, Table } from "antd";
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from "antd/lib/table";
import React from "react";
import { stores } from "@src/stores/storeInitializer";
import { EyeFilled } from "@ant-design/icons";
import { isGranted } from "@src/lib/abpUtility";
import { SorterResult } from "antd/lib/table/interface";
import { ReconcileMonthCashDisplay } from "./CashMoneyReconciliationAdmin";
export interface IProps {
    pagination: TablePaginationConfig | false;
    listReconsile: ReconcileMonthCashDisplay[];
    is_printed?: boolean;
    hasAction?: boolean;
    actionTable?: (item: ReconcileMonthCashDisplay, event: EventTable) => void;
    changeColumnSort?: (fieldSort: SorterResult<ReconcileMonthCashDisplay> | SorterResult<ReconcileMonthCashDisplay>[]) => void;
    expandedRowRender?: (item: ReconcileMonthCashDisplay) => JSX.Element;
    openVisibleMainReconcile?: (item: ReconcileMonthCashDisplay) => void;
}
export default class TableMonthReconcileCashAdmin extends React.Component<IProps> {
    state = {
        visibleModal: false,
        expandedRowKey: [],
        keyRow: undefined,
    }
    onAction = (item: ReconcileMonthCashDisplay, action: EventTable) => {
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action);
        }
    }
    handleExpand = async (expanded, record) => {
        if (expanded) {
            this.setState({ expandedRowKey: [record.rec_month], keyRow: record.rec_month });
        } else {
            this.setState({ expandedRowKey: undefined, keyRow: undefined });
        }
    };
    openVisibleMainReconcile = (record: ReconcileMonthCashDisplay) => {
        if (!!this.props.openVisibleMainReconcile) {
            this.props.openVisibleMainReconcile(record);
        }
    }
    getTimeReconcile = (input: ReconcileMonthCashDisplay) => {
        const year = Number(input.rec_month?.toString().split("/")[1]);
        const month = Number(input.rec_month?.toString().split("/")[0]);
        const startDate = new Date(year, month - 2, 22);
        const endDate = new Date(year, month - 1, 21);
        return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
    }
    render() {
        const { billListResult } = stores.billingStore;
        let action: ColumnGroupType<ReconcileMonthCashDisplay> = {
            title: "Chức năng", width: 100, key: "action_drink_index", className: "no-print center ", fixed: 'right', children: [],
            render: (_: string, item: ReconcileMonthCashDisplay) => {
                return (
                    <Space>
                        {isGranted(AppConsts.Permission.Pages_Reconcile_Reconcile_DetailBilling) &&
                            <Button
                                type="primary" icon={<EyeFilled />} title={"Xem chi tiết"}
                                size='small'
                            >
                            </Button>
                        }
                    </Space>
                )
            }
        };

        const { listReconsile, hasAction, pagination } = this.props;
        const columns: ColumnsType<ReconcileMonthCashDisplay> = [
            { title: "STT", key: "stt_transaction_index", width: 50, render: (_: string, item: ReconcileMonthCashDisplay, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
            {
                title: 'Tháng đối soát', key: "ma_may", render: (_: string, item: ReconcileMonthCashDisplay) => <>
                    {item.rec_month}
                </>
            }, 
            {
                title: "Tiền giao dịch", width: 750, children: [
                    { title: "Tiền hệ thống", key: "tienhethong", dataIndex: "tienhethong", sorter: true, render: (_: string, item: ReconcileMonthCashDisplay) => <div> {AppConsts.formatNumber(item.tienhethong)} </div> },
                    { title: "Tiền ngân hàng", key: "tiennganhang", dataIndex: "tiennganhang", sorter: true, render: (_: string, item: ReconcileMonthCashDisplay) => <div> {AppConsts.formatNumber(item.tiennganhang)} </div> },
                    { title: "Tiền hoàn trả", key: "tienhoantra", dataIndex: "tienhoantra", sorter: true, render: (_: string, item: ReconcileMonthCashDisplay) => <div> {AppConsts.formatNumber(item.tienhoantra)} </div> },
                ]
            },
            {
                title: "Tiền thực nhận",
                dataIndex: '',
                sorter: (a: ReconcileMonthCashDisplay, b: ReconcileMonthCashDisplay) => {
                    const valueA = a.tienhethong - a.tienhoantra;
                    const valueB = b.tienhethong - b.tienhoantra;
                    return valueA - valueB;
                },
                key: "money_reality",
                render: (_: string, item: ReconcileMonthCashDisplay) => (
                    <div>{AppConsts.formatNumber(item.tienhethong - item.tienhoantra)}</div>
                ),
            },
              
            { title: "Khoảng thời gian đối soát", dataIndex: 'rec_from', sorter: true, key: "rec_from", render: (_: string, item: ReconcileMonthCashDisplay) => <div> {this.getTimeReconcile(item)}</div> },
        ]
        if (hasAction === true) {
            columns.push(action);
        }
        return (
            <>
                <Table
                    className="centerTable"
                    scroll={(hasAction != undefined && hasAction === true) ? { x: 1500, y: 600 } : { x: undefined, y: undefined }}
                    onChange={(a, b, sort: SorterResult<ReconcileMonthCashDisplay> | SorterResult<ReconcileMonthCashDisplay>[]) => {
                        if (!!this.props.changeColumnSort) {
                            this.props.changeColumnSort(sort);
                        }
                    }}
                    rowKey={record => `${record.rec_month}`}
                    size={'middle'}
                    onRow={(record) => {
                        return {
                            onClick: () => {
                                this.openVisibleMainReconcile(record!)
                            }
                        }
                    }}
                    bordered={true}
                    pagination={this.props.pagination}
                    columns={columns}
                    rowClassName={(record) => `pointHover ${this.state.keyRow === record.rec_month ? "bg-lightGreen" : "bg-white"}`}
                    dataSource={listReconsile}
                    expandable={
                        this.props.is_printed
                            ? {}
                            : {
                                expandedRowRender: this.props.expandedRowRender,
                                expandRowByClick: true,
                                expandIconColumnIndex: -1,
                                expandedRowKeys: this.state.expandedRowKey,
                                onExpand: this.handleExpand,
                            }
                    }
                >
                </Table>
            </>
        )
    }
}