import AppConsts, { EventTable } from "@src/lib/appconst";
import {  eReconcileStatus, valueOfeReconcileStatus } from "@src/lib/enumconst";
import { ReconcileDto } from "@src/services/services_autogen";
import { Button, Space, Table, Tag } from "antd";
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from "antd/lib/table";
import moment from "moment";
import React from "react";
import { stores } from "@src/stores/storeInitializer";
import { CheckCircleOutlined,EyeFilled, FileSearchOutlined, SyncOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
export interface IProps {
    pagination: TablePaginationConfig | false;
    listReconsile?: ReconcileDto[];
    is_printed?: boolean;
    hasAction?: boolean;
    actionTable?: (item: ReconcileDto, event: EventTable) => void;
}
export default class TableReconcileRFIDAdmin extends React.Component<IProps> {
    state = {
        visibleModal: false,
    }
    onAction = (item: ReconcileDto, action: EventTable) => {
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action);
        }
    }

    render() {
        let action: ColumnGroupType<ReconcileDto> = {
            title: "Chức năng", key: "action_drink_index", className: "no-print center ", fixed: 'right', children: [], width: 100,
            render: (text: string, item: ReconcileDto) => (
                <Space>
                    <Button
                        type="primary" icon={<EyeFilled />} title={"Xem chi tiết"}
                        size='small'
                        onClick={() => this.onAction(item!, EventTable.View)}
                    >
                    </Button>
                    <Button
                        type="primary" icon={<FileSearchOutlined />} title={"Chi tiết đơn hàng"}
                        size='small'
                        onClick={() => this.onAction(item!, EventTable.History)}
                    >
                    </Button>
                </Space>
            )
        };

        const { listReconsile, hasAction, pagination } = this.props;
        const columns: ColumnsType<ReconcileDto> = [
            { title: "STT", key: "stt_transaction_index", width: 50, render: (text: string, item: ReconcileDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
            {
                title: "Nhóm máy", key: "stt_transaction_index", width: 150, render: (text: string, item: ReconcileDto, index: number) => <div>
                    <Link to={"/general/machine/?machine=" + stores.sessionStore.getCodeMachines(item.ma_id)} >
                        {stores.sessionStore.getNameGroupUseMaId(item.ma_id)}
                    </Link>
                </div>
            },
            {
                title: "Mã máy", key: "ma_may", width: 150, render: (text: string, item: ReconcileDto) => <div>
                    <Link to={"/general/machine/?machine=" + stores.sessionStore.getCodeMachines(item.ma_id)} >
                        {stores.sessionStore.getCodeMachines(item.ma_id)}
                    </Link>
                </div>
            },
            {
                title: "Tên máy", key: "stt_transaction_index", width: 150, render: (text: string, item: ReconcileDto, index: number) => <div>{
                    <Link to={"/general/machine/?machine=" + stores.sessionStore.getCodeMachines(item.ma_id)} >
                        {stores.sessionStore.getNameMachines(item.ma_id)}
                    </Link>
                }
                </div>
            },
            {
                title: "Tiền giao dịch", width: 750, children: [
                    { title: "Tiền hệ thống", key: "rec_total_money_calculated", render: (text: string, item: ReconcileDto) => <div> {AppConsts.formatNumber(item.rec_total_money_calculated)} </div> },
                    { title: "Tiền ngân hàng", key: "rec_total_money_reality", render: (text: string, item: ReconcileDto) => <div> {AppConsts.formatNumber(item.rec_total_money_reality)} </div> },
                    { title: "Tiền đơn hàng", key: "rec_total_money_billingofrfid", render: (text: string, item: ReconcileDto) => <div> {AppConsts.formatNumber(item.rec_total_money_billingofrfid)} </div> },
                    { title: "Tiền khuyến mãi", key: "rec_total_money_sale_billingofrfid", render: (text: string, item: ReconcileDto) => <div> {AppConsts.formatNumber(item.rec_total_money_sale_billingofrfid)} </div> },
                    { title: "Tiền hoàn trả", key: "rec_refund_money", render: (text: string, item: ReconcileDto) => <div> {AppConsts.formatNumber(item.rec_refund_money)} </div> },
                ]
            },
            {
                title: "Trạng thái", width: 200, key: "rec_customer_is_confirmed", render: (text: string, item: ReconcileDto) => {
                    if (hasAction !== undefined && hasAction === true) {
                        return <div>
                            {item.rec_status === eReconcileStatus.NONE.num ? <Tag color="yellow" >{valueOfeReconcileStatus(item.rec_status)}</Tag> : ""}
                            {item.rec_status === eReconcileStatus.READY.num ? <Tag icon={<SyncOutlined spin />} color="blue" >{valueOfeReconcileStatus(item.rec_status)}</Tag> : ""}
                            {item.rec_status === eReconcileStatus.PAID.num ? <Tag icon={<CheckCircleOutlined />} color="green" >{valueOfeReconcileStatus(item.rec_status)}</Tag> : ""}
                        </div>
                    } else {
                        return <div>
                            {valueOfeReconcileStatus(item.rec_status)}
                        </div>
                    }
                }
            },
            { title: "Thời gian tạo đối soát", key: "rec_created_at", render: (text: string, item: ReconcileDto) => <div> {moment(item.rec_created_at).format("DD/MM/YYYY HH:mm:ss")}</div> },
            { title: "Khoảng thời gian đối soát", key: "date_time", render: (text: string, item: ReconcileDto) => <div> {moment(item.rec_from).add(7, 'hours').format("DD/MM/YYYY") + " - " + moment(item.rec_to).format("DD/MM/YYYY")}</div> },

        ]
        if (hasAction !== undefined && hasAction === true) {
            columns.push(action);
        }
        return (
            <>
                <Table
                    className="centerTable"
                    scroll={(hasAction != undefined && hasAction === true) ? { x: 1650, y: 600 } : { x: undefined, y: undefined }}
                    rowKey={record => "supplier__" + JSON.stringify(record)}
                    size={'small'}
                    bordered={true}
                    locale={{ "emptyText": "Không có dữ liệu" }}
                    pagination={this.props.pagination}
                    columns={columns}
                    dataSource={listReconsile}>
                </Table>
            </>
        )
    }
}