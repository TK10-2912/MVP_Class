import { CheckCircleOutlined, CheckOutlined, EyeFilled, MoneyCollectOutlined, SyncOutlined } from "@ant-design/icons";
import AppConsts, { EventTable } from "@src/lib/appconst";
import { eBillReconcileStatus, eReconcileBillingStatus, eReconcileStatus, valueOfeReconcileBillingStatus, valueOfeReconcileStatus, valueOfeReconcileWithdrawStatus, valueOfeReconsile } from "@src/lib/enumconst";
import HistoryHelper from "@src/lib/historyHelper";
import { ReconcileCashDto } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import { Button, Modal, Space, Table, Tag, message } from "antd";
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from "antd/lib/table";
import React from "react";
import { Link } from "react-router-dom";
export interface IProps {
    pagination: TablePaginationConfig | false;
    listReconciliationResult?: ReconcileCashDto[];
    has_action: boolean;
    is_printed?: boolean;
    actionTable?: (item: ReconcileCashDto, event: EventTable) => void;
    onSuccess?: () => void;
}
const { confirm } = Modal;

export default class TableReconcileCashAdmin extends React.Component<IProps> {
    state = {
        visibleModalBillingDetail: false,
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
    onAction = (item: ReconcileCashDto, action: EventTable) => {
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action);
        }
    }
    render() {
        const { has_action, listReconciliationResult } = this.props;
        let action: ColumnGroupType<ReconcileCashDto> = {
            title: 'Chức năng', children: [], key: 'action_member_index', className: "no-print center", fixed: 'right',
            render: (text: string, item: ReconcileCashDto) => (
                <Space>
                    <Button
                        type="primary" icon={<EyeFilled />} title={"Xem chi tiết"}
                        size='small'
                        onClick={() => this.onAction(item!, EventTable.View)}
                    >
                    </Button>
                </Space >
            )
        }
        const columns: ColumnsType<ReconcileCashDto> = [
            { title: "STT", key: "stt_transaction_index", width: 50, render: (text: string, item: ReconcileCashDto, index: number) => <div>{index + 1}</div> },
            {
                title: "Nhóm máy", key: "stt_transaction_index", width: 150, render: (text: string, item: ReconcileCashDto, index: number) => <div>
                    <Link to={"/general/machine/?machine=" + stores.sessionStore.getCodeMachines(item.ma_id)} >
                        {stores.sessionStore.getNameGroupUseMaId(item.ma_id)}
                    </Link>
                </div>
            },
            {
                title: "Mã máy", key: "ma_may", width: 150, render: (text: string, item: ReconcileCashDto) => <div>
                    <Link to={"/general/machine/?machine=" + stores.sessionStore.getCodeMachines(item.ma_id)} >
                        {stores.sessionStore.getCodeMachines(item.ma_id)}
                    </Link>
                </div>
            },
            {
                title: "Tên máy", key: "stt_transaction_index", width: 150, render: (text: string, item: ReconcileCashDto, index: number) => <div>{
                    <Link to={"/general/machine/?machine=" + stores.sessionStore.getCodeMachines(item.ma_id)} >
                        {stores.sessionStore.getNameMachines(item.ma_id)}
                    </Link>
                }
                </div>
            },
            {
                title: "Tiền giao dịch", width: 500, children: [
                    { title: "Tiền hệ thống", key: "rec_total_money", render: (text: string, item: ReconcileCashDto) => <div> {AppConsts.formatNumber(item.rec_total_money_calculated)} </div> },
                    { title: "Tiền từ máy", key: "rec_total_money", render: (text: string, item: ReconcileCashDto) => <div> {AppConsts.formatNumber(item.rec_total_money_reality)} </div> },
                    { title: "Tiền hoàn trả", key: "rec_refund_money", render: (text: string, item: ReconcileCashDto) => <div> {AppConsts.formatNumber(item.rec_refund_money)} </div> },
                ]
            },
            {
                title: "Trạng thái", key: "rec_customer_is_confirmed", width: 200, render: (text: string, item: ReconcileCashDto) => {
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
            { title: "Khoảng thời gian đối soát", key: "date_time", render: (text: string, item: ReconcileCashDto) => <div> {`22/${item.rec_month}` + " - " + `21/${item.rec_month?.slice(-1, -4)}`}</div> },
            { title: "Tháng đối soát", key: "money", render: (text: string, item: ReconcileCashDto) => <div> {item.rec_month}</div> },
        ]
        if (has_action != undefined && has_action == true) {
            columns.push(action);
        }
        return (
            <>
                <Table
                    className="centerTable"
                    scroll={this.props.is_printed ? { x: 1500, y: 600 } : { x: undefined, y: undefined }}
                    size={'small'}
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