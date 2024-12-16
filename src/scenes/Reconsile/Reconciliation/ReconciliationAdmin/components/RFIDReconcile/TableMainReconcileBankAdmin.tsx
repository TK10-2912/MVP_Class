import AppConsts, { EventTable } from "@src/lib/appconst";
import { ReconcileRFIDDto } from "@src/services/services_autogen";
import { Button, Space, Table } from "antd";
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from "antd/lib/table";
import React from "react";
import { stores } from "@src/stores/storeInitializer";
import { EyeFilled } from "@ant-design/icons";
import { isGranted } from "@src/lib/abpUtility";
import { SorterResult } from "antd/lib/table/interface";
import moment from "moment";
export interface IProps {
    pagination: TablePaginationConfig | false;
    listReconsile: ReconcileRFIDDto[];
    is_printed?: boolean;
    hasAction?: boolean;
    actionTable?: (item: ReconcileRFIDDto, event: EventTable) => void;
    changeColumnSort?: (fieldSort: SorterResult<ReconcileRFIDDto> | SorterResult<ReconcileRFIDDto>[]) => void;
    expandedRowRender?: (item: ReconcileRFIDDto) => JSX.Element;
    openVisibleExportMainReconcile?: (item: ReconcileRFIDDto) => void;
}
export default class TableMainReconcileRFIDAdmin extends React.Component<IProps> {
    state = {
        visibleModal: false,
        expandedRowKey: [],
        keyRow: undefined,
    }
    onAction = (item: ReconcileRFIDDto, action: EventTable) => {
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
    openVisibleExportMainReconcile = (record: ReconcileRFIDDto) => {
        if (!!this.props.openVisibleExportMainReconcile) {
            this.props.openVisibleExportMainReconcile(record);
        }
    }
    getTimeReconcile = (input: ReconcileRFIDDto) => {
        const year = Number(input.rec_month?.toString().split("/")[1]);
        const month = Number(input.rec_month?.toString().split("/")[0]);
        const startDate = new Date(year, month - 2, 22); // month - 2 để lấy tháng trước

        // Ngày kết thúc: 21 của tháng hiện tại
        const endDate = new Date(year, month - 1, 21);
        return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
    }
    render() {
        const { billListResult } = stores.billingStore;
        let action: ColumnGroupType<ReconcileRFIDDto> = {
            title: "Chức năng", width: 100, key: "action_drink_index", className: "no-print center ", fixed: 'right', children: [],
            render: (_: string, item: ReconcileRFIDDto) => {
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
        const columns: ColumnsType<ReconcileRFIDDto> = [
            { title: "STT", key: "stt_transaction_index", width: 50, render: (_: string, item: ReconcileRFIDDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
            { title: 'Tháng đối soát', key: "rec_month", dataIndex: 'rec_month', sorter: true, render: (_: string, item: ReconcileRFIDDto) => <>{item.rec_month}</> },
            {
                title: "Tiền giao dịch", width: 750, children: [
                    { title: "Tiền hệ thống", key: "rec_total_money_calculated", dataIndex: 'rec_total_money_calculated', sorter: true, render: (_: string, item: ReconcileRFIDDto) => <div> {AppConsts.formatNumber(item.rec_total_money_calculated)} </div> },
                    { title: "Tiền ngân hàng", key: "rec_total_money_reality", dataIndex: 'rec_total_money_reality', sorter: true, render: (_: string, item: ReconcileRFIDDto) => <div> {AppConsts.formatNumber(item.rec_total_money_reality)} </div> },
                    { title: "Tiền hoàn trả", key: "rec_refund_money", dataIndex: 'rec_refund_money', sorter: true, render: (_: string, item: ReconcileRFIDDto) => <div> {AppConsts.formatNumber(item.rec_refund_money)} </div> },
                ]
            },
            {
                title: "Tiền thực nhận",
                dataIndex: '',
                key: "rec_total_money",
                sorter: (a: ReconcileRFIDDto, b: ReconcileRFIDDto) =>
                    (a.rec_total_money_calculated - a.rec_refund_money) -
                    (b.rec_total_money_calculated - b.rec_refund_money),
                render: (_: string, item: ReconcileRFIDDto) => (
                    <div>
                        {AppConsts.formatNumber(
                            item.rec_total_money_calculated - item.rec_refund_money
                        )}
                    </div>
                ),
            },
                
            { title: "Khoảng thời gian đối soát", dataIndex: 'rec_from', sorter: true, key: "rec_from", render: (_: string, item: ReconcileRFIDDto) => <div> {this.getTimeReconcile(item)}</div> },
            { title: "Thời gian tạo đối soát", dataIndex: 'rec_created_at', key: "rec_created_at", sorter: true, render: (_: string, item: ReconcileRFIDDto) => <div>{moment(item.rec_created_at).format("DD/MM/YYYY hh:mm:ss A")}</div> },

        ]
        if (hasAction === true) {
            columns.push(action);
        }
        return (
            <>
                <Table
                    className="centerTable"
                    scroll={(hasAction != undefined && hasAction === true) ? { x: 1500, y: 600 } : { x: undefined, y: undefined }}
                    onChange={(a, b, sort: SorterResult<ReconcileRFIDDto> | SorterResult<ReconcileRFIDDto>[]) => {
                        if (!!this.props.changeColumnSort) {
                            this.props.changeColumnSort(sort);
                        }
                    }}
                    rowKey={record => `${record.rec_month}`}
                    size={'middle'}
                    onRow={(record) => {
                        return {
                            onClick: () => {
                                this.openVisibleExportMainReconcile(record!)
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