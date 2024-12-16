import AppConsts, { EventTable } from "@src/lib/appconst";
import { eReconcileDebtStatus, eReconcileDebtStatusSupplier, valueOfeReconcileDebtStatusSupplier, valueOfeReconcileStatus } from "@src/lib/enumconst";
import { ReconcileSupplierDebtDetailDto, ReconcileSupplierDebtDto } from "@src/services/services_autogen";
import { Button, Table, Tag } from "antd";
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from "antd/lib/table";
import React from "react";
import { stores } from "@src/stores/storeInitializer";
import { CheckCircleOutlined, CheckSquareOutlined, DeleteOutlined, EyeOutlined, HistoryOutlined, MoneyCollectOutlined, SyncOutlined } from "@ant-design/icons";
import { isGranted } from "@src/lib/abpUtility";
import { SorterResult } from "antd/lib/table/interface";
export interface IProps {
    pagination: TablePaginationConfig | false;
    listReconsile?: ReconcileSupplierDebtDto[];
    is_printed?: boolean;
    hasAction?: boolean;
    onSuccess?: () => void;
    getSuID?: (number: ReconcileSupplierDebtDto) => void;
    expandedRowRender?: (item: ReconcileSupplierDebtDto) => JSX.Element;
    actionTable?: (item: ReconcileSupplierDebtDto, event: EventTable) => void;
    changeColumnSort?: (fieldSort: SorterResult<ReconcileSupplierDebtDto> | SorterResult<ReconcileSupplierDebtDto>[]) => void;
}
export const tabManager = {
    tab_1: "Danh sách nhập hàng trên hệ thống",
    tab_2: "Danh sách nhập hàng chỉ có ở Excel",
}
export default class TableReconcileDebtHistory extends React.Component<IProps> {
    state = {
        visibleModal: false,
        expandedRowKey: [],
    }
    onSuccess = () => {
        if (!!this.props.onSuccess) {
            this.props.onSuccess();
        }
    }
    handleExpand = (expanded, record) => {
        if (expanded) {
            // this.onCancel();
            this.setState({ expandedRowKey: [`${record.su_id}_${record.rec_month}`] });
        } else {
            this.setState({ expandedRowKey: undefined });
        }
    };
    getSuID = (input: ReconcileSupplierDebtDto) => {
        if (!!this.props.getSuID) {
            this.props.getSuID(input);
        }
    }
    onAction = (item: ReconcileSupplierDebtDto, action: EventTable) => {
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action);
        }
    }
    checkOnlyExcel = (input: ReconcileSupplierDebtDetailDto) => {
        const arr = input.rec_im_re_code?.split("-");
        if (arr != undefined && arr[arr.length - 1] == "onlyExcel") {
            return true;
        }
        return false
    }
    checkConfirmReconcile = (input: ReconcileSupplierDebtDto) => {
        if (input != undefined) {
            const list = input.listReconcile!.filter(item => item.rec_status === eReconcileDebtStatus.SUCCESS.num);
            if (list.length == input.listReconcile!.length) {
                return true;
            }
            return false;
        }
        else return false;
    }
    render() {
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
                        title: "Tiền nhập sản phẩm vào hệ thống", key: "rec_total_money_calculated", render: (text: string, item: ReconcileSupplierDebtDto, index: number) => <div>{AppConsts.formatNumber(item.rec_total_money_calculated)}</div>
                    },
                    {
                        title: "Tiền nhập sản phẩm từ nhà cung cấp", key: "rec_remain_supplier_debt", render: (text: string, item: ReconcileSupplierDebtDto, index: number) => <div>{AppConsts.formatNumber(item.rec_total_money_reality)}</div>
                    },
                    {
                        title: "Tổng dư nợ còn lại", key: "rec_total_money_reality", render: (text: string, item: ReconcileSupplierDebtDto, index: number) => <div>{AppConsts.formatNumber(item.rec_remain_supplier_debt)}</div>
                    },
                ]
            },
            {
                title: "Tháng đối soát", key: "stt_transaction_index", render: (text: string, item: ReconcileSupplierDebtDto, index: number) => <div>{item.rec_month}</div>
            },
        ]
        return (
            <Table
                className="centerTable"
                scroll={(hasAction != undefined && hasAction === true) ? { x: 1000, y: 600 } : { x: undefined, y: undefined }}
                rowKey={record => `${record.su_id}_${record.rec_month}`}
                onRow={(record) => {
                    return {
                        onClick: () => { this.getSuID(record) },
                    };
                }}
                size={'middle'}
                expandable={
                    this.props.is_printed
                        ? {}
                        : {
                            expandedRowRender: this.props.expandedRowRender,
                            expandRowByClick: true,
                            expandIconColumnIndex: -1,
                            expandedRowKeys: this.state.expandedRowKey,
                            onExpand: (isGranted(AppConsts.Permission.Pages_Manager_General_Product_Update)) ? this.handleExpand : () => { },
                        }
                }
                bordered={true}
                
                pagination={this.props.pagination}
                columns={columns}
                dataSource={listReconsile}>
            </Table>
        )
    }
}