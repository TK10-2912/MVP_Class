import AppConsts, { EventTable, cssColResponsiveSpan, pageSizeOptions } from "@src/lib/appconst";
import { ReconcileCashDto } from "@src/services/services_autogen";
import { Button, Col, Space, Table } from "antd";
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from "antd/lib/table";
import React from "react";
import { stores } from "@src/stores/storeInitializer";
import { ExportOutlined, EyeFilled } from "@ant-design/icons";
import { isGranted } from "@src/lib/abpUtility";
import { SorterResult } from "antd/lib/table/interface";
import { Link } from "react-router-dom";
import ModalExportMainCashReconcileAdmin from "./ModalExportCashReconcileAdmin copy";
export interface IProps {
    listReconsile: ReconcileCashDto[];
    is_printed?: boolean;
    hasAction?: boolean;
    actionTable?: (item: ReconcileCashDto, event: EventTable) => void;
    changeColumnSort?: (fieldSort: SorterResult<ReconcileCashDto> | SorterResult<ReconcileCashDto>[]) => void;
    expandedRowRender?: (item: ReconcileCashDto) => JSX.Element;
    openVisibleMainReconcile?: (item: ReconcileCashDto) => void;
}
export default class TableMainReconcileCashAdmin extends React.Component<IProps> {
    state = {
        visibleModal: false,
        expandedRowKey: [],
        keyRow: undefined,
        pageSize: 10,
        visibleExportExcel: false,
        currentPage: 1,
    }

    onAction = (item: ReconcileCashDto, action: EventTable) => {
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action);
        }
    }
    handleExpand = async (expanded, record) => {
        if (expanded) {
            this.setState({ expandedRowKey: [record.rec_month], keyRow: `${record.rec_month}-${record.ma_id} ` });
        } else {
            this.setState({ expandedRowKey: undefined, keyRow: undefined });
        }
    };
    openVisibleMainReconcile = (record: ReconcileCashDto) => {
        if (!!this.props.openVisibleMainReconcile) {
            this.props.openVisibleMainReconcile(record);
        }
    }
    getTimeReconcile = (input: ReconcileCashDto) => {
        const year = Number(input.rec_month?.toString().split("/")[1]);
        const month = Number(input.rec_month?.toString().split("/")[0]);
        const startDate = new Date(year, month - 2, 22);
        const endDate = new Date(year, month - 1, 21);
        return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
    }
    render() {
        let action: ColumnGroupType<ReconcileCashDto> = {
            title: "Chức năng", width: 100, key: "action_drink_index", className: "no-print center ", fixed: 'right', children: [],
            render: (_: string, item: ReconcileCashDto) => {
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

        const { listReconsile, hasAction, } = this.props;
        const columns: ColumnsType<ReconcileCashDto> = [
            { title: "STT", key: "stt_transaction_index", width: 50, render: (_: string, item: ReconcileCashDto, index: number) => <div>{this.state.pageSize! * (this.state.currentPage! - 1) + (index + 1)}</div> },
            {
                title: 'Máy bán nước', key: "ma_may", render: (_: string, item: ReconcileCashDto) => <>
                    {this.props.is_printed ?
                        <>
                            <div>{stores.sessionStore.getCodeMachines(item.ma_id)}</div>
                            <div>{stores.sessionStore.getNameMachines(item.ma_id)}</div>
                        </>
                        :
                        <div title="Chi tiết máy">
                            <Link target='blank' to={"/general/machine/?machine=" + stores.sessionStore.getCodeMachines(item.ma_id)}>
                                <div>{stores.sessionStore.getCodeMachines(item.ma_id)}</div>
                                <div style={{ fontSize: 11, color: 'gray' }}>{stores.sessionStore.getNameMachines(item.ma_id)}</div>
                            </Link>
                        </div>
                    }
                </>
            },
            {
                title: "Tiền giao dịch", width: 750, children: [
                    { title: "Tiền hệ thống", key: "rec_total_money_calculated", dataIndex: "rec_total_money_calculated", sorter: true, render: (_: string, item: ReconcileCashDto) => <div> {AppConsts.formatNumber(item.rec_total_money_calculated)} </div> },
                    { title: "Tiền ngân hàng", key: "rec_total_money_reality", dataIndex: "rec_total_money_reality", sorter: true, render: (_: string, item: ReconcileCashDto) => <div> {AppConsts.formatNumber(item.rec_total_money_reality)} </div> },
                    { title: "Tiền hoàn trả", key: "rec_refund_money", dataIndex: "rec_refund_money", sorter: true, render: (_: string, item: ReconcileCashDto) => <div> {AppConsts.formatNumber(item.rec_refund_money)} </div> },
                ]
            },
            {
                title: "Tiền thực nhận",
                dataIndex: '',
                sorter: (a: ReconcileCashDto, b: ReconcileCashDto) => {
                    const valueA = a.rec_total_money_calculated - a.rec_refund_money;
                    const valueB = b.rec_total_money_calculated - b.rec_refund_money;
                    return valueA - valueB;
                },
                key: "money_reality",
                render: (_: string, item: ReconcileCashDto) => (
                    <div>{AppConsts.formatNumber(item.rec_total_money_calculated - item.rec_refund_money)}</div>
                ),
            },
        ]
        if (hasAction === true) {
            columns.push(action);
        }
        return (
            <>
                {this.props.is_printed == false &&
                    <Col style={{ display: 'flex', alignItems: 'center', justifyContent: 'end' ,marginBottom:5}}>
                        <Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcel: true })}>Xuất dữ liệu</Button>
                    </Col>
                }
                <Table
                    className="centerTable customTable"
                    scroll={(hasAction != undefined && hasAction === true) ? { x: 1500, y: 600 } : { x: undefined, y: undefined }}
                    onChange={(a, b, sort: SorterResult<ReconcileCashDto> | SorterResult<ReconcileCashDto>[]) => {
                        if (!!this.props.changeColumnSort) {
                            this.props.changeColumnSort(sort);
                        }
                    }}
                    rowKey={record => `${record.rec_month}-${record.ma_id}`}
                    size={'middle'}
                    onRow={(record) => {
                        return {
                            onClick: () => {
                                this.openVisibleMainReconcile(record!)
                            }
                        }
                    }}
                    bordered={true}
                    pagination={this.props.is_printed == false ?
                        {
                            position: ['topRight'],
                            total: this.props.listReconsile != undefined ? this.props.listReconsile.length : 0,
                            showTotal: (tot) => 'Tổng: ' + tot + '',
                            showQuickJumper: true,
                            showSizeChanger: true,
                            pageSizeOptions: pageSizeOptions,
                            onChange: (page: number, pageSize?: number | undefined) => {
                                this.setState({ pageSize: pageSize, currentPage: page })
                            }
                        }
                        : undefined
                    }
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
                <ModalExportMainCashReconcileAdmin
                    listData={this.props.listReconsile != undefined ? this.props.listReconsile : []}
                    onCancel={() => { this.setState({ visibleExportExcel: false }) }}
                    visible={this.state.visibleExportExcel}
                />
            </>
        )
    }
}