import AppConsts, { EventTable } from "@src/lib/appconst";
import { eReconcileBillingStatus, eReconcileStatus, valueOfePaymentMethod, valueOfeReconcileBillingStatus, valueOfeReconcileStatus, valueOfeReconcileWithdrawStatus, valueOfeReconsile } from "@src/lib/enumconst";
import { ReconcileDto } from "@src/services/services_autogen";
import { Button, Space, Table, Tag, message } from "antd";
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from "antd/lib/table";
import moment from "moment";
import React from "react";
import { stores } from "@src/stores/storeInitializer";
import { CheckCircleOutlined, CheckOutlined, EyeFilled, FileDoneOutlined, MoneyCollectOutlined, SyncOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import HistoryHelper from "@src/lib/historyHelper";
import { isGranted } from "@src/lib/abpUtility";
export interface IProps {
    pagination: TablePaginationConfig | false;
    listReconsile?: ReconcileDto[];
    is_printed?: boolean;
    hasAction?: boolean;
    actionTable?: (item: ReconcileDto, event: EventTable) => void;
}
export default class TableReconcileBankUser extends React.Component<IProps> {
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
            title: "Chức năng", key: "action_drink_index", className: "no-print center ", fixed: 'right', children: [],
            render: (text: string, item: ReconcileDto) => (
                <Space>
                    {
                        isGranted(AppConsts.Permission.Pages_Reconcile_Reconcile_DetailBilling) &&
                        <Button
                            type="primary" icon={<EyeFilled />} title={"Xem chi tiết"}
                            size='small'
                            onClick={() => this.onAction(item!, EventTable.View)}
                        >
                        </Button>
                    }
                    {item.rec_status == eReconcileStatus.NONE.num && isGranted(AppConsts.Permission.Pages_Reconcile_Reconcile_Confirm) &&
                        <Button
                            type="primary" icon={<CheckOutlined />} title={"Xác nhận"}
                            size='small'
                            onClick={() => this.onAction(item!, EventTable.Accept)}
                        >
                        </Button>
                    }
                    {item.rec_status == eReconcileStatus.READY.num && isGranted(AppConsts.Permission.Pages_Reconcile_Reconcile_Withdraw) &&

                        <Button
                            type="primary" icon={<MoneyCollectOutlined />} title={"Rút tiền"}
                            size='small'
                            onClick={() => {
                                localStorage.setItem('reconcile_bank', JSON.stringify(item));
                                HistoryHelper.redirect("/statistic/withdraw_report");
                            }}>
                        </Button>
                    }
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
                title: "Mã máy ", key: "ma_may", width: 150, render: (text: string, item: ReconcileDto) => <div>
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
                title: "Tiền giao dịch", width: 500, children: [
                    { title: "Tiền hệ thống", key: "rec_total_money", render: (text: string, item: ReconcileDto) => <div> {AppConsts.formatNumber(item.rec_total_money_calculated)} </div> },
                    { title: "Tiền ngân hàng", key: "rec_total_money", render: (text: string, item: ReconcileDto) => <div> {AppConsts.formatNumber(item.rec_total_money_reality)} </div> },
                    { title: "Tiền hoàn trả", key: "rec_refund_money", render: (text: string, item: ReconcileDto) => <div> {AppConsts.formatNumber(item.rec_refund_money)} </div> },
                ]
            },
            {
                title: "Trạng thái", width: 280, key: "rec_customer_is_confirmed", render: (text: string, item: ReconcileDto) => {
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
            { title: "Khoảng thời gian đối soát", key: "date_time", render: (text: string, item: ReconcileDto) => <div> {moment(item.rec_from).add(7, 'hours').format("DD/MM/YYYY") + " - " + moment(item.rec_to).format("DD/MM/YYYY")}</div> },
            { title: "Thời gian tạo đối soát", key: "rec_created_at", render: (text: string, item: ReconcileDto) => <div> {moment(item.rec_created_at).format("DD/MM/YYYY HH:mm:ss")}</div> },

        ]
        if (hasAction !== undefined && hasAction === true) {
            columns.push(action);
        }
        return (
            <>
                <Table
                    className="centerTable"
                    scroll={(hasAction != undefined && hasAction === true) ? { x: 1500, y: 600 } : { x: undefined, y: undefined }}
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