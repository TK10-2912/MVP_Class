import AppConsts, { EventTable } from "@src/lib/appconst";
import { eReconcileStatus, valueOfeReconcileStatus } from "@src/lib/enumconst";
import { ReconcileSupplierDebtDto } from "@src/services/services_autogen";
import { Button, Table, Tag } from "antd";
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from "antd/lib/table";
import React from "react";
import { stores } from "@src/stores/storeInitializer";
import { CheckCircleOutlined, EyeOutlined, MoneyCollectOutlined, SyncOutlined } from "@ant-design/icons";
import { SorterResult } from "antd/lib/table/interface";
export interface IProps {
    pagination: TablePaginationConfig | false;
    listReconsile?: ReconcileSupplierDebtDto[];
    is_printed?: boolean;
    hasAction?: boolean;
    actionTable?: (item: ReconcileSupplierDebtDto, event: EventTable) => void;
    changeColumnSort?: (fieldSort: SorterResult<ReconcileSupplierDebtDto> | SorterResult<ReconcileSupplierDebtDto>[]) => void;
}
export default class TableReconcileDebtSupplier extends React.Component<IProps> {
    state = {
        visibleModal: false,
        expandedRowKey: [],
    }
    onAction = (item: ReconcileSupplierDebtDto, action: EventTable) => {
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action);
        }
    }
    render() {
        let action: ColumnGroupType<ReconcileSupplierDebtDto> = {
            title: "Chức năng", width: 100, key: "action_drink_index", className: "no-print center ", fixed: 'right', children: [],
            render: (text: string, item: ReconcileSupplierDebtDto) => (
                <div>
                    {item.rec_remain_supplier_debt > 0 ?
                        <Button
                            type="primary" icon={<MoneyCollectOutlined />} title={"Thanh toán"}
                            size='small'
                            style={{ marginLeft: '10px', marginTop: '5px' }}
                            onClick={(e) => { this.onAction(item!, EventTable.Accept); e.stopPropagation() }}>
                        </Button> :
                        ""
                    }
                    <Button
                        type="primary" icon={<EyeOutlined />} title={"Lịch sử thanh toán"}
                        size='small'
                        style={{ marginLeft: '10px', marginTop: '5px' }}
                        onClick={(e) => { this.onAction(item!, EventTable.History); e.stopPropagation() }}>
                    </Button>
                </div>
            )
        };

        const { listReconsile, hasAction, pagination } = this.props;
        const columns: ColumnsType<ReconcileSupplierDebtDto> = [
            { title: "STT", key: "stt_transaction_index", width: 50, render: (text: string, item: ReconcileSupplierDebtDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
            {
                title: "Nhà cung cấp", key: "su_id", render: (text: string, item: ReconcileSupplierDebtDto, index: number) => <div>{stores.sessionStore.getNameSupplier(item.su_id)}</div>
            },
            {
                title: "Công nợ", key: "ma_may",
                children: [
                    {
                        title: "Tiền từ hệ thống", key: "rec_total_money_calculated", render: (text: string, item: ReconcileSupplierDebtDto, index: number) => <div>{AppConsts.formatNumber(item.rec_total_money_calculated)}</div>
                    },
                    {
                        title: "Tiền từ nhà cung cấp", key: "rec_remain_supplier_debt", render: (text: string, item: ReconcileSupplierDebtDto, index: number) => <div>{AppConsts.formatNumber(item.rec_total_money_reality)}</div>
                    },
                    {
                        title: "Dư nợ còn lại", key: "rec_total_money_reality", render: (text: string, item: ReconcileSupplierDebtDto, index: number) => <div>{AppConsts.formatNumber(item.rec_remain_supplier_debt)}</div>
                    },
                ]
            },
            {
                title: "Trạng thái", width: "25%", key: "rec_customer_is_confirmed", render: (text: string, item: ReconcileSupplierDebtDto) => {
                    if (hasAction !== undefined && hasAction === true) {
                        return <div>
                            {item.rec_status === eReconcileStatus.NONE.num ? <Tag color="yellow" >{valueOfeReconcileStatus(item.rec_status)}</Tag> : ""}
                            {item.rec_status === eReconcileStatus.READY.num ? <Tag icon={<SyncOutlined spin />} color="blue" >{valueOfeReconcileStatus(item.rec_status)}</Tag> : ""}
                            {item.rec_status === eReconcileStatus.PAYMENT_ONEPART.num ? <Tag icon={<SyncOutlined spin />} color="blue" >{valueOfeReconcileStatus(item.rec_status)}</Tag> : ""}
                            {item.rec_status === eReconcileStatus.PAYMENT_COMPLETE.num ? <Tag icon={<SyncOutlined spin />} color="blue" >{valueOfeReconcileStatus(item.rec_status)}</Tag> : ""}
                            {item.rec_status === eReconcileStatus.PAID.num ? <Tag icon={<CheckCircleOutlined />} color="green" >{valueOfeReconcileStatus(item.rec_status)}</Tag> : ""}
                        </div>
                    } else {
                        return <div>
                            {valueOfeReconcileStatus(item.rec_status)}
                        </div>
                    }
                }
            },
            {
                title: "Tháng đối soát", key: "stt_transaction_index", render: (text: string, item: ReconcileSupplierDebtDto, index: number) => <div>{item.rec_month}</div>
            },
            { title: "Ngày tạo đối soát", dataIndex: 'rec_created_at', sorter: true, key: "rec_created_at", render: (text: string, item: ReconcileSupplierDebtDto) => <div>chua co loi api</div> },
        ]
        if (hasAction !== undefined && hasAction === true) {
            columns.push(action);
        }
        return (
            <>
                <Table
                    className="centerTable customTable"
                    scroll={(hasAction != undefined && hasAction === true) ? { x: 1000, y: 600 } : { x: undefined, y: undefined }}
                    onChange={(a, b, sort: SorterResult<ReconcileSupplierDebtDto> | SorterResult<ReconcileSupplierDebtDto>[]) => {
                        if (!!this.props.changeColumnSort) {
                            this.props.changeColumnSort(sort);
                        }
                    }}
                    rowKey={record => `${record.su_id}_${record.rec_month}`}
                    size={'middle'}
                    bordered={true}
                    
                    pagination={this.props.pagination}
                    columns={columns}
                    dataSource={listReconsile}>
                </Table>
            </>
        )
    }
}