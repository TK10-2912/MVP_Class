import AppConsts, { cssColResponsiveSpan, EventTable } from "@src/lib/appconst";
import { ePaidStatus, valueOfePaidStatus, valueOfeBillMethod } from "@src/lib/enumconst";
import { EPaidStatus, ItemBillingHistory, TransactionByMachineDto } from "@src/services/services_autogen";
import { Col, message, Row, Space, Table, Tag, Tooltip } from "antd";
import { ColumnsType, TablePaginationConfig } from "antd/lib/table";
import moment from "moment";
import React from "react";
import { Link } from "react-router-dom";
import ModalInvoiceDetail from "./ModalInvoiceDetail";
import { stores } from "@src/stores/storeInitializer";
import { SorterResult } from "antd/lib/table/interface";
import ModalMoneyRefundLog from "./ModalMoneyRefundLog";
import TransactionSummary from "./TransactionSummary";
export interface IProps {
    pagination: TablePaginationConfig | false;
    listTransactionByMachine?: TransactionByMachineDto[];
    is_printed?: boolean;
    actionTable?: (item: TransactionByMachineDto, event: EventTable) => void;
    cash_payment?: boolean;
    changeColumnSort?: (fieldSort: SorterResult<TransactionByMachineDto> | SorterResult<TransactionByMachineDto>[]) => void;
    parent?: string,
}
export default class TableTransactionDetail extends React.Component<IProps> {
    state = {
        visibleModal: false,
        isVisibleModalMoneyRefundLog: false,
    }
    itemProduct: ItemBillingHistory[] = [];
    transactionSelected: TransactionByMachineDto = new TransactionByMachineDto;
    onAction = (item: TransactionByMachineDto, action: EventTable) => {
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action);
        }
    }
    calculateTotalSuccess(item: TransactionByMachineDto): number {
        let tongTien = 0;
        if (!item.list_product) {
            return 0;
        }
        item.list_product.map(product => {
            product.statusPaidProduct?.forEach(itemStatusPaidProduct => itemStatusPaidProduct.status === "Success" ? tongTien += product.product_money : 0)
        })
        return tongTien;
    }
    renderTotalFooter = (paidStatus?: EPaidStatus) => {
        const { listTransactionByMachine } = this.props;
        let theFirstCellOfCol = <></>;
        let totalCard = 0;
        const arrRFIDPaymentLogFiltered = listTransactionByMachine!.filter(item => paidStatus !== undefined ? item.trang_thai_tra_hang === paidStatus : item)
        let totalOrder = arrRFIDPaymentLogFiltered!.length || 0; ///Tổng đơn hàng
        let totalOrderAmount = 0; ///Tiền đơn hàng
        let totalDepositAmount = 0; ///Tiền nạp vào 
        let totalSuccessfulAmount = 0; ///Tiền thành công
        let totalRemainingAmount = 0; ///Tiền dư
        let totalRefundAmount = 0; ///Tiền hoàn trả

        arrRFIDPaymentLogFiltered.map(item => {
            totalOrderAmount += item.so_tien_thanh_toan;
            totalDepositAmount += item.so_tien_nap_vao_cash;
            totalRemainingAmount += item.so_tien_du;
            totalRefundAmount += item.totalMoneyRefund;
            totalSuccessfulAmount += this.calculateTotalSuccess(item)
        });

        if (paidStatus === undefined) {
            const set = new Set();
            listTransactionByMachine!.map(item => set.add(item));
            totalCard = set.size;
            theFirstCellOfCol = <span><b>Tổng số giao dịch: <span className={this.props.is_printed ? '' : 'text-green'}>{`${totalCard}`}</span></b></span>
        }
        else if (paidStatus === ePaidStatus.CREATE.num) {
            theFirstCellOfCol = <span className={this.props.is_printed ? '' : 'text-orange'}><b>Quá trình tạo đơn hàng</b></span>
        }
        else if (paidStatus === ePaidStatus.SUCCESS.num) {
            theFirstCellOfCol = <span className={this.props.is_printed ? '' : 'text-green'}><b>Trả hàng thành công</b></span>
        }
        else if (paidStatus === ePaidStatus.PART_SUCCESS.num) {
            theFirstCellOfCol = <span className={this.props.is_printed ? '' : 'text-blue'}><b>Trả hàng thành công 1 phần</b></span>
        }
        else if (paidStatus === ePaidStatus.ERROR.num) {
            theFirstCellOfCol = <span className={this.props.is_printed ? '' : 'text-red'}><b>Lỗi</b></span>
        }
        return (
            <Space direction='vertical' size={2} style={{ fontSize: 13 }}>
                <span>{theFirstCellOfCol}</span>
                <span>Tổng số đơn hàng: <strong className={this.props.is_printed ? '' : 'text-green'}>{AppConsts.formatNumber(totalOrder)}</strong></span>
                <span>Tổng số tiền đơn hàng: <strong className={this.props.is_printed ? '' : 'text-green'}>{AppConsts.formatNumber(totalOrderAmount)} đ</strong></span>
                <span>Tổng số tiền nạp vào: <strong className={this.props.is_printed ? '' : 'text-green'}>{AppConsts.formatNumber(totalDepositAmount)} đ</strong></span>
                <span>Tổng số tiền thành công: <strong className={this.props.is_printed ? '' : 'text-green'}>{AppConsts.formatNumber(totalSuccessfulAmount)} đ</strong></span>
                <span>Tổng số tiền dư: <strong className={this.props.is_printed ? '' : 'text-green'}>{AppConsts.formatNumber(totalRemainingAmount)} đ</strong></span>
                <span>Tổng số hoàn trả: <strong className={this.props.is_printed ? '' : 'text-green'}>{AppConsts.formatNumber(totalRefundAmount)} đ</strong></span>
            </Space>
        )
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
                            this.props.is_printed ? stores.sessionStore.getNameGroupMachinesbyNameDisplayTable(item.ten_nhom)
                                :
                                <div title="Chi tiết nhóm máy">
                                    <Link target="_blank" to={"/general/machine/?gr_id=" + stores.sessionStore.getIDGroupUseMaId(stores.sessionStore.getIDMachineUseName(item.ma_may!))} onDoubleClick={() => this.onAction(item, EventTable.View)} >
                                        {stores.sessionStore.getNameGroupMachinesbyNameDisplayTable(item.ten_nhom)}
                                    </Link>
                                </div>
                        }
                    </div>
            },
            {
                title: 'Máy bán nước',
                dataIndex: '',
                key: 'ma_display_name',
                width: "10%",
                render: (_: string, item: TransactionByMachineDto) => (
                    <div
                        style={
                            this.props.is_printed
                                ? {}
                                : {
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                }
                        }
                    >
                        {this.props.is_printed ? (
                            <>
                                <div>{item.ma_may}</div>
                                <div>{item.ten_may}</div>
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
                                        <div style={{ color: 'gray', fontSize: 11 }}>{item.ten_may}</div>
                                    </>
                                </Link>
                            </div>
                        )}
                    </div>
                ),
            },

            {
                title: "Tiền giao dịch", children: [
                    {
                        title: "Cần thanh toán",
                        key: "money",
                        width: 100,
                        sorter: (a: TransactionByMachineDto, b: TransactionByMachineDto) => a.so_tien_thanh_toan - b.so_tien_thanh_toan,
                        render: (_: string, item: TransactionByMachineDto) => (
                            <div>{AppConsts.formatNumber(item.so_tien_thanh_toan)}</div>
                        ),
                    },
                    {
                        title: "Nạp vào",
                        width: 100,
                        sorter: (a: TransactionByMachineDto, b: TransactionByMachineDto) => Number(a.so_tien_nap_vao_cash + a.so_tien_nap_vao_qr + a.so_tien_nap_vao_rfid) - Number(b.so_tien_nap_vao_cash + b.so_tien_nap_vao_qr + b.so_tien_nap_vao_rfid),
                        render: (_: string, item: TransactionByMachineDto) =>
                            <Tooltip placement="right" style={{ padding: 0, margin: 0 }}
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
                        key: "money",
                        sorter: (a: TransactionByMachineDto, b: TransactionByMachineDto) =>
                            Number(this.calculateTotalSuccess(a)) - Number(this.calculateTotalSuccess(b)),
                        render: (_: string, item: TransactionByMachineDto) =>
                            <div>{AppConsts.formatNumber(this.calculateTotalSuccess(item))}</div>
                    },
                    {
                        title: "Dư",
                        width: 100,
                        key: "remaining_money",
                        sorter: (a: TransactionByMachineDto, b: TransactionByMachineDto) =>
                            Number(a.so_tien_du) - Number(b.so_tien_du),
                        render: (_: string, item: TransactionByMachineDto) =>
                            <div>{AppConsts.formatNumber(item.so_tien_du)}</div>
                    },
                    {
                        title: 'Hoàn trả', className: "hoverCell", width: 100, key: '', sorter: (a, b) => a.totalMoneyRefund - b.totalMoneyRefund,
                        onCell: (item: TransactionByMachineDto) => (
                            {
                                onClick: () => {
                                    this.transactionSelected = item;
                                    if (item.totalMoneyRefund) {
                                        this.setState({ isVisibleModalMoneyRefundLog: true });
                                    } else {
                                        message.warning("Không có tiền hoàn trả")
                                    }
                                }
                            }
                        ),
                        render: (_: string, record: TransactionByMachineDto) => <div>{AppConsts.formatNumber(record.totalMoneyRefund)}</div>
                    }
                ]
            },
            {
                title: 'Tiền mặt hiện tại',
                width: 100,
                key: 'tong_tien_trong_may_hien_tai',
                sorter: (a, b) => a.tong_tien_trong_may_hien_tai - b.tong_tien_trong_may_hien_tai,
                render: (_, record: TransactionByMachineDto) => <div>{AppConsts.formatNumber(record.tong_tien_trong_may_hien_tai)}</div>
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
            sorter: (a: TransactionByMachineDto, b: TransactionByMachineDto) => {
                return new Date(a.thoi_gian_giao_dich).getTime() - new Date(b.thoi_gian_giao_dich).getTime();
            },
            render: (_: string, item: TransactionByMachineDto) => (
                <div>{moment(item.thoi_gian_giao_dich).format("DD/MM/YYYY - HH:mm:ss")}</div>
            )
        });
        return (
            <>
                <Table
                    className="centerTable"
                    scroll={this.props.is_printed ? { x: undefined, y: undefined } : { x: 1500, y: 600 }}
                    size={'small'}
                    bordered={true}

                    pagination={this.props.pagination}
                    columns={columns}
                    onChange={(_a, _b, sort: SorterResult<TransactionByMachineDto> | SorterResult<TransactionByMachineDto>[]) => {
                        if (!!this.props.changeColumnSort) {
                            this.props.changeColumnSort(sort);
                        }
                    }}
                    dataSource={listTransactionByMachine}
                    rowKey={record => "importing_table" + JSON.stringify(record)}
                    footer={() => (this.props.parent == "history"
                        ? <Row gutter={8}>
                            {[undefined, ePaidStatus.SUCCESS.num, ePaidStatus.PART_SUCCESS.num, ePaidStatus.CREATE.num, ePaidStatus.ERROR.num]
                                .map(item => (
                                    <>
                                        <Col className="ant-col-xl-20-percent ant-col-lg-20-percent ant-col-md-20-percent" {...cssColResponsiveSpan(24, 24, 24, 4, 4, 4)}>
                                            {this.renderTotalFooter(item)}
                                        </Col>
                                    </>
                                ))
                            }
                        </Row>
                        :
                        <>
                            <TransactionSummary
                                listTransactionByMachine={listTransactionByMachine!}
                                parent={this.props.parent}
                                is_printed={this.props.is_printed}
                                calculateTotalSuccess={this.calculateTotalSuccess}
                            />
                        </>
                    )}

                />
                <ModalInvoiceDetail
                    listItemBillingHistory={this.itemProduct}
                    visible={this.state.visibleModal}
                    transaction={this.transactionSelected}
                    onCancel={() => this.setState({ visibleModal: false })}
                />
                <ModalMoneyRefundLog
                    visible={this.state.isVisibleModalMoneyRefundLog}
                    onCancel={() => this.setState({ isVisibleModalMoneyRefundLog: false })}
                    transactionSelected={this.transactionSelected}
                />
            </>
        )
    }
}