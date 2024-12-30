import AppConsts, { EventTable } from "@src/lib/appconst";
import { ePaidStatus, valueOfePaidStatus, valueOfeBillMethod } from "@src/lib/enumconst";
import { ItemBillingHistory, TransactionByMachineDto } from "@src/services/services_autogen";
import { Col, Row, Table, Tag, Tooltip } from "antd";
import { ColumnsType, TablePaginationConfig } from "antd/lib/table";
import moment from "moment";
import React from "react";
import { Link } from "react-router-dom";
import ModalInvoiceDetail from "./ModalInvoiceDetail";
import { stores } from "@src/stores/storeInitializer";
import { SorterResult } from "antd/lib/table/interface";
import ModalMoneyRefundLog from "@src/scenes/HistoryMVP/LichSuChiTietGiaoDichTungMay/component/ModalMoneyRefundLog";
import DailyTransactionFooter from "./DailyTransactionFooter";
export interface IProps {
    pagination: TablePaginationConfig | false;
    listTransactionByMachine?: TransactionByMachineDto[];
    is_printed?: boolean;
    actionTable?: (item: TransactionByMachineDto, event: EventTable) => void;
    cash_payment?: boolean;
    changeColumnSort?: (fieldSort: SorterResult<TransactionByMachineDto> | SorterResult<TransactionByMachineDto>[]) => void;
    currentPage?: number,
    pageSize?: number,
    parent?: string,
}
export default class TableTransactionDetailToday extends React.Component<IProps> {
    state = {
        visibleModal: false,
        isVisibleModalMoneyRefundTodayLog: false,
    }
    itemProduct: ItemBillingHistory[] = [];
    transactionSelected: TransactionByMachineDto = new TransactionByMachineDto;
    onAction = (item: TransactionByMachineDto, action: EventTable) => {
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action);
        }
    }
    tinhTongTienTheoStatus(items: TransactionByMachineDto) {
        let tongTien = 0;
        if (!!items.list_product) {
            items.list_product?.map(itemItemBillingHistory => {
                itemItemBillingHistory.statusPaidProduct?.forEach(itemStatusPaidProduct => itemStatusPaidProduct.status === "Success" ? tongTien += itemItemBillingHistory.product_money : 0)
            })
        }
        return tongTien;
    }
    render() {
        const { listTransactionByMachine, pagination } = this.props;

        const columns: ColumnsType<TransactionByMachineDto> = [
            { title: "STT", key: "stt_transaction_index", width: 50, render: (text: string, item: TransactionByMachineDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
            {
                title: "Mã đơn hàng", width: 130, key: "list_product", className: "hoverCell",
                onCell: (item: TransactionByMachineDto) => {
                    return {
                        onClick: async (e) => {
                            this.itemProduct = item.list_product!;
                            this.transactionSelected = item;
                            this.setState({ visibleModal: true });
                        }
                    }
                },
                render: (text: string, item: TransactionByMachineDto) => <div title="Chi tiết đơn hàng"> {item.ma_hoa_don} </div>
            },
            {
                title: "Nhóm máy", width: 150, key: "nhom_may", render: (text: string, item: TransactionByMachineDto) =>
                    <div>
                        {
                            this.props.is_printed ? stores.sessionStore.getNameGroupMachinesbyNameDisplayTable(item.ten_nhom) :
                                <div title="Chi tiết nhóm máy">
                                    <Link target="_blank" to={"/general/machine/?gr_id=" + stores.sessionStore.getIDGroupUseMaId(stores.sessionStore.getIDMachineUseName(item.ma_may!))} onDoubleClick={() => this.onAction(item, EventTable.View)} >
                                        {stores.sessionStore.getNameGroupMachinesbyNameDisplayTable(item.ten_nhom)}                                    </Link>
                                </div>
                        }
                    </div>
            },
            {
                title: 'Máy bán nước',
                dataIndex: '',
                key: 'ma_display_name',
                width: 100,
                render: (_: string, item: TransactionByMachineDto, index: number) => (
                    <div>
                        {this.props.is_printed ? (
                            <>
                                <div>{item.ma_may}</div>
                                <div style={{
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    color: 'gray',
                                    fontSize: 11
                                }}
                                >{item.ten_may}</div>
                            </>
                        ) : (
                            <div title={'Xem chi tiết ' + item.ten_may}>
                                <Link
                                    to={'/general/machine/?machine=' + item.ma_may}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    <>
                                        <div>{item.ma_may}</div>
                                        <div>{item.ten_may}</div>
                                    </>
                                </Link>
                            </div>
                        )}
                    </div>
                ),
            },
            {
                title: "Số tiền cần thanh toán",
                key: "money",
                width: 100,
                sorter: (a: TransactionByMachineDto, b: TransactionByMachineDto) => a.so_tien_thanh_toan - b.so_tien_thanh_toan,
                render: (_: string, item: TransactionByMachineDto) => (
                    <div>{AppConsts.formatNumber(item.so_tien_thanh_toan)}</div>
                ),
            },

            {
                title: "Tiền giao dịch", children: [
                    {
                        title: "Nạp vào", width: 90,
                        sorter: (a: TransactionByMachineDto, b: TransactionByMachineDto) => a.so_tien_nap_vao_cash - b.so_tien_nap_vao_cash,
                        render: (_: string, item: TransactionByMachineDto) =>
                            <Tooltip placement="right"
                                title={(
                                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                        <li>Tiền mặt: <b>{AppConsts.formatNumber(item.so_tien_nap_vao_cash)}</b> vnđ</li>
                                        <li>Tiền từ ngân hàng: <b>{AppConsts.formatNumber(item.so_tien_nap_vao_qr)}</b> vnđ</li>
                                        <li>Tiền từ RFID: <b>{AppConsts.formatNumber(item.so_tien_nap_vao_rfid)}</b> vnđ</li>
                                    </ul>
                                )}
                                color='#20C997'
                                key="cyan"
                            >
                                {AppConsts.formatNumber(item.so_tien_nap_vao_cash + item.so_tien_nap_vao_qr + item.so_tien_nap_vao_rfid)}
                            </Tooltip>

                    },
                    {
                        title: "Thành công",
                        width: 100,
                        key: "money1",
                        sorter: (a: TransactionByMachineDto, b: TransactionByMachineDto) =>
                            Number(this.tinhTongTienTheoStatus(a)) - Number(this.tinhTongTienTheoStatus(b)),
                        render: (_: string, item: TransactionByMachineDto) =>
                            <div>{AppConsts.formatNumber(this.tinhTongTienTheoStatus(item))}</div>
                    },
                    {
                        title: "Dư",
                        width: 100,
                        key: "remaining_money",
                        sorter: (a: TransactionByMachineDto, b: TransactionByMachineDto) =>
                            Number(a.so_tien_du) - Number(b.so_tien_du),
                        render: (_: string, item: TransactionByMachineDto) =>
                            <div>{AppConsts.formatNumber(item.so_tien_du)}</div>
                    }

                ]
            },
            {
                title: 'Số tiền hoàn trả', className: "hoverCell", width: 100, key: '', sorter: (a, b) => a.totalMoneyRefund - b.totalMoneyRefund,
                onCell: (item: TransactionByMachineDto) => (
                    {
                        onClick: () => {
                            this.transactionSelected = item;
                            this.setState({ isVisibleModalMoneyRefundTodayLog: true });
                        }
                    }
                ),
                render: (_: string, record: TransactionByMachineDto) => <div>{record.totalMoneyRefund}</div>
            }

        ]
        if (!this.props.cash_payment) {
            columns.push({
                title: "Hình thức thanh toán",
                width: 100,
                key: "hinh_thuc_thanh_toan",
                render: (text: string, item: TransactionByMachineDto) => (
                    <div>
                        {valueOfeBillMethod(item.hinh_thuc_thanh_toan)}
                    </div>
                )
            });
        }

        // Thêm cột trạng thái trả hàng vào columns
        columns.push({
            title: "Trạng thái trả hàng",
            width: "15%",
            key: "trang_thai_tra_hang",
            render: (_: string, item: TransactionByMachineDto) => (
                <div>
                    {this.props.is_printed === false ? (
                        <div>
                            {(() => {
                                if (item.trang_thai_tra_hang === ePaidStatus.CREATE.num) {
                                    return <Tag color="#FFB266" style={{ color: 'black' }}>{valueOfePaidStatus(item.trang_thai_tra_hang)}</Tag>;
                                } else if (item.trang_thai_tra_hang === ePaidStatus.ERROR.num) {
                                    return <Tag color="red">{valueOfePaidStatus(item.trang_thai_tra_hang)}</Tag>;
                                } else if (item.trang_thai_tra_hang === ePaidStatus.PART_SUCCESS.num) {
                                    return <Tag color="orange">{valueOfePaidStatus(item.trang_thai_tra_hang)}</Tag>;
                                } else if (item.trang_thai_tra_hang === ePaidStatus.SUCCESS.num) {
                                    return <Tag color="green">{valueOfePaidStatus(item.trang_thai_tra_hang)}</Tag>;
                                }
                                return null; // If no matching status, return nothing
                            })()}
                        </div>

                    ) : (
                        <div>
                            {valueOfePaidStatus(item.trang_thai_tra_hang)}
                        </div>
                    )}
                </div>
            )
        });
        columns.push({
            title: "Thời gian giao dịch",
            width: "15%",
            dataIndex: 'thoi_gian_giao_dich',
            key: "thoi_gian_giao_dich",
            sorter: true,
            render: (text: string, item: TransactionByMachineDto) => <div> {moment(item.thoi_gian_giao_dich).format("DD/MM/YYYY - HH:mm:ss")} </div>
        });
        return (
            <>
                <Table
                    className="centerTable"
                    scroll={this.props.is_printed ? { x: undefined, y: undefined } : { x: 1500, y: 600 }}
                    size={'middle'}
                    bordered={true}

                    pagination={this.props.pagination}
                    columns={columns}
                    onChange={(a, b, sort: SorterResult<TransactionByMachineDto> | SorterResult<TransactionByMachineDto>[]) => {
                        if (!!this.props.changeColumnSort) {
                            this.props.changeColumnSort(sort);
                        }
                    }}
                    dataSource={listTransactionByMachine}
                    rowKey={record => "importing_table" + JSON.stringify(record)}
                    footer={() => (
                        <DailyTransactionFooter
                            listTransactionByMachine={listTransactionByMachine!}
                            currentPage={this.props.currentPage!}
                            pageSize={this.props.pageSize!}
                            parent="daily"
                        />
                    )}

                />
                <ModalInvoiceDetail
                    listItemBillingHistory={this.itemProduct}
                    visible={this.state.visibleModal}
                    transaction={this.transactionSelected}
                    onCancel={() => this.setState({ visibleModal: false })}
                />
                <ModalMoneyRefundLog
                    visible={this.state.isVisibleModalMoneyRefundTodayLog}
                    onCancel={() => this.setState({ isVisibleModalMoneyRefundTodayLog: false })}
                    transactionSelected={this.transactionSelected}
                />
            </>
        )
    }
}