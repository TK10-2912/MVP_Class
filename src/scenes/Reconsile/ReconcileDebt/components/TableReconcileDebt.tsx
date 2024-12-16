import AppConsts, { EventTable } from "@src/lib/appconst";
import { eReconcileDebtStatus, eReconcileDebtStatusSupplier, valueOfeReconcileDebtStatusSupplier, valueOfeReconcileStatus } from "@src/lib/enumconst";
import { ReconcileSupplierDebtDetailDto, ReconcileSupplierDebtDto } from "@src/services/services_autogen";
import { Button, Popover, Space, Table, Tag } from "antd";
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from "antd/lib/table";
import React from "react";
import { stores } from "@src/stores/storeInitializer";
import { CaretDownOutlined, CheckCircleOutlined, CheckSquareOutlined, ContainerOutlined, DeleteOutlined, EyeOutlined, HistoryOutlined, MenuOutlined, MoneyCollectOutlined, SyncOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { isGranted } from "@src/lib/abpUtility";
import { SorterResult } from "antd/lib/table/interface";
export interface IProps {
    pagination: TablePaginationConfig | false;
    listReconsile?: ReconcileSupplierDebtDto[];
    is_printed?: boolean;
    hasAction?: boolean;
    onSuccess?: () => void;
    listSuId?: number[];
    getSuID?: (number: ReconcileSupplierDebtDto) => void;
    expandedRowRender?: (item: ReconcileSupplierDebtDto) => JSX.Element;
    actionTable?: (item: ReconcileSupplierDebtDto, event: EventTable) => void;
    changeColumnSort?: (fieldSort: SorterResult<ReconcileSupplierDebtDto> | SorterResult<ReconcileSupplierDebtDto>[]) => void;
}
export const tabManager = {
    tab_1: "Danh sách nhập hàng trên hệ thống",
    tab_2: "Danh sách nhập hàng chỉ có ở Excel",
}
export default class TableReconcileDebt extends React.Component<IProps> {
    state = {
        isLoadDone: false,
        visibleModal: false,
        expandedRowKey: [],
        keyRow: undefined,
        ma_hover: false,
    }
    onSuccess = () => {
        if (!!this.props.onSuccess) {
            this.props.onSuccess();
        }
    }
    handleExpand = (expanded, record) => {
        if (expanded) {
            // this.onCancel();
            this.setState({ expandedRowKey: [`${record.su_id}_${record.rec_month}`], keyRow: `${record.su_id}_${record.rec_month}` });
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
        let action: ColumnGroupType<ReconcileSupplierDebtDto> = {
            title: "Chức năng", width: 100, key: "action_drink_index", className: "no-print center", fixed: 'right', children: [],
            render: (_text: string, item: ReconcileSupplierDebtDto) => {
                return (
                    <Popover
                        style={{ width: 220 }}
                        trigger="hover"
                        placement="top"
                        onVisibleChange={record => this.setState({ ma_hover: record })}
                        content={(
                            <Space direction='vertical'>
                                {item.rec_remain_supplier_debt > 0 && item.rec_status !== eReconcileDebtStatusSupplier.WAIT.num && (
                                    <Space>
                                        <Button
                                            type="primary"
                                            icon={<MoneyCollectOutlined />}
                                            title="Thanh toán"
                                            size='small'
                                            onClick={(e) => { this.onAction(item!, EventTable.Edit); e.stopPropagation(); }}
                                        />
                                        <a onClick={(e) => { this.onAction(item!, EventTable.Edit); e.stopPropagation(); }}>Thanh toán</a>
                                    </Space>
                                )}
                                {(listSuId?.filter(num => num == item.su_id).length! > 1) &&
                                    <Space>
                                        <Button
                                            type="primary"
                                            icon={<ContainerOutlined />}
                                            title="Chi tiết lịch sử nhập từ trước"
                                            size='small'
                                            onClick={(e) => { this.onAction(item!, EventTable.View); e.stopPropagation(); }}
                                        />
                                        <a onClick={(e) => { this.onAction(item!, EventTable.View); e.stopPropagation(); }}>Lịch sử đối soát công nợ</a>
                                    </Space>
                                }
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={<EyeOutlined />}
                                        title="Chi tiết đối soát"
                                        size='small'
                                        // onClick={(e) => { this.setState({ expandedRowKey: [`${item.su_id}_${item.rec_month}`] }); e.stopPropagation(); }}
                                    />
                                    <a>Chi tiết đối soát</a>
                                </Space>
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={<HistoryOutlined />}
                                        title="Lịch sử thanh toán"
                                        size='small'
                                        onClick={(e) => { this.onAction(item!, EventTable.History); e.stopPropagation(); }}
                                    />
                                    <a onClick={(e) => { this.onAction(item!, EventTable.History); e.stopPropagation(); }}>Lịch sử thanh toán</a>
                                </Space>
                                {this.checkConfirmReconcile(item) && item.rec_status === eReconcileDebtStatusSupplier.WAIT.num && (
                                    <Space>
                                        <Button
                                            type="primary"
                                            icon={<CheckSquareOutlined />}
                                            title="Xác nhận đối soát"
                                            size='small'
                                            onClick={(e) => { this.onAction(item!, EventTable.Accept); e.stopPropagation(); }}
                                        />
                                        <a onClick={(e) => { this.onAction(item!, EventTable.Accept); e.stopPropagation(); }}>Xác nhận đối soát</a>
                                    </Space>
                                )}

                                {item.rec_status !== eReconcileDebtStatusSupplier.PAYMENT_COMPLETE.num && (
                                    <Space>
                                        <Button
                                            icon={<DeleteOutlined />}
                                            title="Xóa"
                                            size='small'
                                            danger
                                            onClick={(e) => { this.onAction(item!, EventTable.Delete); e.stopPropagation(); }}
                                        />
                                        <a style={{ color: 'red' }} onClick={(e) => { this.onAction(item!, EventTable.Delete); e.stopPropagation(); }}>Xóa</a>
                                    </Space>
                                )}
                            </Space>
                        )}
                    >
                        <Button size='small' icon={this.state.ma_hover ? <CaretDownOutlined /> : <UnorderedListOutlined />}></Button>
                    </Popover>
                );
            }
        };

        const { listReconsile, hasAction, listSuId, pagination } = this.props;
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
                        title:"Tiền nhập sản phẩm từ nhà cung cấp", key: "rec_remain_supplier_debt", render: (text: string, item: ReconcileSupplierDebtDto, index: number) => <div>{AppConsts.formatNumber(item.rec_total_money_reality)}</div>
                    },
                    {
                        title: "Tổng dư nợ còn lại", key: "rec_total_money_reality", render: (text: string, item: ReconcileSupplierDebtDto, index: number) => <div>{AppConsts.formatNumber(item.rec_remain_supplier_debt)}</div>
                    },
                ]
            },
            {
                title: "Trạng thái", width: "25%", key: "rec_customer_is_confirmed", render: (text: string, item: ReconcileSupplierDebtDto) =>
                    <>
                        {
                            hasAction !== undefined && hasAction === true ?
                                <div>
                                    {item.rec_status === eReconcileDebtStatusSupplier.WAIT.num ? <Tag icon={<SyncOutlined spin />} color="blue" >{valueOfeReconcileDebtStatusSupplier(item.rec_status)}</Tag> : ""}
                                    {item.rec_status === eReconcileDebtStatusSupplier.SUCCESS.num ? <Tag icon={<CheckCircleOutlined />} color="red" >{valueOfeReconcileDebtStatusSupplier(item.rec_status)}</Tag> : ""}
                                    {item.rec_status === eReconcileDebtStatusSupplier.PAYMENT_ONEPART.num ? <Tag color="volcano" >{valueOfeReconcileDebtStatusSupplier(item.rec_status)}</Tag> : ""}
                                    {item.rec_status === eReconcileDebtStatusSupplier.PAYMENT_COMPLETE.num ? <Tag color="cyan" >{valueOfeReconcileDebtStatusSupplier(item.rec_status)}</Tag> : ""}
                                </div>
                                :
                                <>{valueOfeReconcileStatus(item.rec_status)}</>
                        }
                    </>
            },
            {
                title: "Tháng đối soát", key: "stt_transaction_index", render: (text: string, item: ReconcileSupplierDebtDto, index: number) => <div>{item.rec_month}</div>
            },
        ]
        if (hasAction !== undefined && hasAction === true) {
            columns.push(action);
        }
        return (
            <Table
                className="centerTable"
                scroll={(hasAction != undefined && hasAction === true) ? { x: 1000 } : { x: undefined, y: undefined }}
                rowKey={record => `${record.su_id}_${record.rec_month}`}
                onRow={(record) => {
                    return {
                        title: "Xem chi tiết",
                        style: { cursor: "pointer" },
                        onClick: () => this.getSuID(record),
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
                rowClassName={(record) => `pointHover ${this.state.keyRow === `${record.su_id}_${record.rec_month}` ? "bg-lightGreen" : "bg-white"}`}
                bordered={true}
                
                pagination={this.props.pagination}
                columns={columns}
                dataSource={listReconsile}
            >
            </Table>
        )
    }
}