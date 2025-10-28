import AppConsts, { cssColResponsiveSpan, EventTable } from "@src/lib/appconst";
import { ePaidStatus, valueOfePaidStatus, valueOfeBillMethod } from "@src/lib/enumconst";
import { BillingDto, BillingProduct, EPaidStatus} from "@src/services/services_autogen";
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
    listTransactionByMachine?: BillingDto[];
    is_printed?: boolean;
    actionTable?: (item: BillingDto, event: EventTable) => void;
    cash_payment?: boolean;
    changeColumnSort?: (fieldSort: SorterResult<BillingDto> | SorterResult<BillingDto>[]) => void;
    parent?: string,
}
export default class TableTransactionDetail extends React.Component<IProps> {
    state = {
        visibleModal: false,
        isVisibleModalMoneyRefundLog: false,
    }
    itemProduct: BillingProduct[] = [];
    transactionSelected: BillingDto = new BillingDto;
    onAction = (item: BillingDto, action: EventTable) => {
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action);
        }
    }
    calculateTotalSuccess(item: BillingDto): number {
        let tongTien = 0;
        if (!item.listBillingProduct) {
            return 0;
        }
        // item.listBillingProduct.map(product => {
        //     product.?.forEach(itemStatusPaidProduct => itemStatusPaidProduct.status === "Success" ? tongTien += product.product_money : 0)
        // })
        return tongTien;
    }
    renderTotalFooter = (paidStatus?: EPaidStatus) => {
        const { listTransactionByMachine } = this.props;
        let theFirstCellOfCol = <></>;
        let totalCard = 0;
        const arrRFIDPaymentLogFiltered = listTransactionByMachine!.filter(item => paidStatus !== undefined ? item.bi_paid_status === paidStatus : item)
        let totalOrder = arrRFIDPaymentLogFiltered!.length || 0; ///Tổng đơn hàng
        let totalOrderAmount = 0; ///Tiền đơn hàng
        let totalDepositAmount = 0; ///Tiền nạp vào 
        let totalSuccessfulAmount = 0; ///Tiền thành công
        let totalRemainingAmount = 0; ///Tiền dư
        let totalRefundAmount = 0; ///Tiền hoàn trả

        // arrRFIDPaymentLogFiltered.map(item => {
        //     totalOrderAmount += item.so_tien_thanh_toan;
        //     totalDepositAmount += item.so_tien_nap_vao_cash;
        //     totalRemainingAmount += item.so_tien_du;
        //     totalRefundAmount += item.totalMoneyRefund;
        //     totalSuccessfulAmount += this.calculateTotalSuccess(item)
        // });

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

        const columns: ColumnsType<BillingDto> = [
            { title: "STT", key: "stt_transaction_index", width: 50, render: (text: string, item: BillingDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
            {
                title: "Mã đơn hàng", width: 130, key: "list_product", className: "hoverCell",
                onCell: (item: BillingDto) => {
                    return {
                        onClick: async (e) => {
                            this.itemProduct = item.listBillingProduct!;
                            this.transactionSelected = item;
                            this.setState({ visibleModal: true });
                        }
                    }
                },
                render: (text: string, item: BillingDto) => <div title="Chi tiết đơn hàng"> {item.bi_code} </div>
            },
            {
                title: "Nhóm máy", width: 150, key: "nhom_may", render: (text: string, item: BillingDto) =>
                    <div>
                       {item.gr_ma_name!}
                    </div>
            },
            {
                title: 'Máy bán nước',
                dataIndex: '',
                key: 'ma_display_name',
                width: "10%",
                render: (_: string, item: BillingDto) => (
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
                                <div>{stores.sessionStore.getNameMachines(item.ma_id!)}</div>
                            </>
                        ) : (
                            <div title={'Xem chi tiết ' + stores.sessionStore.getNameMachines(item.ma_id!)}>
                                <Link
                                    to={'/general/machine/?machine=' + item.ma_id}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    <>
                                        <div>{stores.sessionStore.getNameMachines(item.ma_id!)}</div>
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
                        render: (_: string, item: BillingDto) => (
                            <div>{AppConsts.formatNumber(item.bi_cash_received)}</div>
                        ),
                    },
                    {
                        title: "Thành công",
                        width: 100,
                        key: "money",
                        sorter: (a: BillingDto, b: BillingDto) =>
                            Number(this.calculateTotalSuccess(a)) - Number(this.calculateTotalSuccess(b)),
                        render: (_: string, item: BillingDto) =>
                            <div>{AppConsts.formatNumber(this.calculateTotalSuccess(item))}</div>
                    },
                    
                ]
            },
            
        ]
        if (!this.props.cash_payment) {
            columns.push({
                title: "Hình thức thanh toán",
                width: 100,
                key: "hinh_thuc_thanh_toan",
                render: (text: string, item: BillingDto) => (
                    <div>
                        {valueOfeBillMethod(item.bi_method_payment)}
                    </div>
                )
            });
        }

        
       
        return (
            <>
                <Table
                    className="centerTable"
                    scroll={this.props.is_printed ? { x: undefined, y: undefined } : { x: 1500, y: 600 }}
                    size={'small'}
                    bordered={true}

                    pagination={this.props.pagination}
                    columns={columns}
                    onChange={(_a, _b, sort: SorterResult<BillingDto> | SorterResult<BillingDto>[]) => {
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