import { CheckCircleOutlined, CheckOutlined, EyeFilled, SyncOutlined } from "@ant-design/icons";
import AppConsts, { EventTable } from "@src/lib/appconst";
import { eReconcileStatus, valueOfeReconcileStatus } from "@src/lib/enumconst";
import { ReconcileDto } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import { Button, Table, Tag } from "antd";
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from "antd/lib/table";
import moment from "moment";
import React from "react";
import { Link } from "react-router-dom";
export interface IProps {
    pagination: TablePaginationConfig | false;
    listReconciliationResult?: ReconcileDto[];
    has_action: boolean;
    is_printed?: boolean;
    actionTable?: (item: ReconcileDto, event: EventTable) => void;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default class TableReconcileDetailCashUser extends React.Component<IProps> {
    state = {
        visibleModalBillingDetail: false,
        visibleExportExcel: false,
        bi_code: "",
        skipCount: 0,
        maxResultCount: 10,
        pageSize: 10,
        currentPage: 1,
    }
    onSuccess = () => {
        if (!!this.props.onSuccess) {
            this.props.onSuccess();
        }
    }
    onCancel = () => {
        if (!!this.props.onCancel) {
            this.props.onCancel();
        }
    }
    onAction = (item: ReconcileDto, action: EventTable) => {
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action);
        }
    }
    render() {
        const { has_action, listReconciliationResult } = this.props;
        let action: ColumnGroupType<ReconcileDto> = {
            title: 'Chức năng', children: [], key: 'action_member_index', className: "no-print center", fixed: 'right', width: 100,
            render: (text: string, item: ReconcileDto) => (
                <div >
                    <Button
                        type="primary" icon={<EyeFilled />} title={"Xem chi tiết"}
                        size='small'
                        style={{ marginLeft: '10px', marginTop: '5px' }}
                        onClick={() => this.onAction(item!, EventTable.View)}
                    >
                    </Button>
                    {item.rec_status == eReconcileStatus.NONE.num &&
                        <Button
                            type="primary" icon={<CheckOutlined />} title={"Xác nhận"}
                            size='small'
                            style={{ marginLeft: '10px', marginTop: '5px' }}
                            onClick={() => {
                                this.onAction(item!, EventTable.Accept);
                                listReconciliationResult?.filter(a => {
                                    if (a.rec_id === item.rec_id) {
                                        a.rec_status = eReconcileStatus.READY.num;
                                    }
                                })

                            }}
                        >
                        </Button>
                    }
                </div >
            )
        }
        const columns: ColumnsType<ReconcileDto> = [
            { title: "STT", key: "stt_transaction_index", width: 50, render: (text: string, item: ReconcileDto, index: number) => <div>{index + 1}</div> },
            { title: "Nhóm máy", key: "stt_transaction_index", render: (text: string, item: ReconcileDto, index: number) => <div>{stores.sessionStore.getNameGroupUseMaId(item.ma_id)}</div> },
            {
                title: "Mã máy", key: "ma_may", render: (text: string, item: ReconcileDto) => <div>
                    <Link to={"/general/machine/?machine=" + stores.sessionStore.getCodeMachines(item.ma_id)} >
                        {stores.sessionStore.getCodeMachines(item.ma_id)}
                    </Link>
                </div>
            },
            { title: "Tên máy", key: "stt_transaction_index", render: (text: string, item: ReconcileDto, index: number) => <div>{stores.sessionStore.getNameMachines(item.ma_id)}</div> },
            {
                title: "Tiền giao dịch", children: [
                    { title: "Tiền từ hệ thống", key: "rec_total_money", render: (text: string, item: ReconcileDto) => <div> {AppConsts.formatNumber(item.rec_total_money_calculated)} </div> },
                    { title: "Tiền lấy từ máy", key: "rec_total_money", render: (text: string, item: ReconcileDto) => <div> {AppConsts.formatNumber(item.rec_total_money_reality)} </div> },
                    { title: "Tiền hoàn trả", key: "rec_refund_money", render: (text: string, item: ReconcileDto) => <div> {AppConsts.formatNumber(item.rec_refund_money)} </div> },
                ]
            },
            {
                title: "Trạng thái", key: "rec_customer_is_confirmed", width: "25%", render: (text: string, item: ReconcileDto) => {
                    if (has_action != undefined && has_action == true) {
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
            { title: "Ngày tạo đối soát", key: "money", render: (text: string, item: ReconcileDto) => <div> {moment(item.rec_created_at).format("DD/MM/YYYY")}</div> },
            { title: "Khoảng thời gian đối soát", key: "date_time", render: (text: string, item: ReconcileDto) => <div> {moment(item.rec_from).add(7, 'hours').format("DD/MM/YYYY") + " - " + moment(item.rec_to).format("DD/MM/YYYY")}</div> },

        ]
        if (has_action != undefined && has_action == true) {
            columns.push(action);
        }
        return (
            <>
                <Table
                    className="centerTable"
                    scroll={this.props.is_printed ? { x: undefined, y: undefined } : { x: 1000, y: 600 }}
                    size={'middle'}
                    rowKey={record => "reconcile_cash__" + JSON.stringify(record)}
                    bordered={true}
                    locale={{ "emptyText": "Không có dữ liệu" }}
                    pagination={this.props.has_action != false ? this.props.pagination : false}
                    columns={columns}
                    dataSource={listReconciliationResult}
                >
                </Table>
            </>
        )
    }
}