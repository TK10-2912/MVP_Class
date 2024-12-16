import { CheckCircleOutlined, SyncOutlined } from "@ant-design/icons";
import AppConsts, { EventTable } from "@src/lib/appconst";
import { eBillStatus, ePaidStatus, valueOfeBillStatus, valueOfePaidStatus, valueOfePaymentMethod } from "@src/lib/enumconst";
import { ItemBillingHistory, TransactionByMachineDto } from "@src/services/services_autogen";
import { Table, Tag } from "antd";
import { ColumnsType, TablePaginationConfig } from "antd/lib/table";
import moment from "moment";
import React from "react";
import { Link } from "react-router-dom";
import ModalInvoiceDetail from "./ModalInvoiceDetail";
import { stores } from "@src/stores/storeInitializer";
import { SorterResult } from "antd/lib/table/interface";
export interface IProps {
    pagination: TablePaginationConfig | false;
    listTransactionByMachine?: TransactionByMachineDto[];
    is_printed?: boolean;
    actionTable?: (item: TransactionByMachineDto, event: EventTable) => void;
    cash_payment?: boolean;
    changeColumnSort?: (fieldSort: SorterResult<TransactionByMachineDto> | SorterResult<TransactionByMachineDto>[]) => void;
}
export default class TableTransactionDetail extends React.Component<IProps> {
    state = {
        visibleModal: false,
        bi_code: "",
    }
    transactionSelected: TransactionByMachineDto = new TransactionByMachineDto();
    itemProduct: ItemBillingHistory[] = [];
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
        const { listTransactionByMachine, is_printed, pagination } = this.props;
        const columns: ColumnsType<TransactionByMachineDto> = [
            { title: "STT", key: "stt_transaction_index", width: 50, render: (text: string, item: TransactionByMachineDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
            {
                title: "Nhóm máy", key: "nhom_may", render: (text: string, item: TransactionByMachineDto) => <div>
                    <Link to={"/general/machine/?gr_id=" + stores.sessionStore.getIdGroupMachinesStatistic(item.ten_nhom)} onDoubleClick={() => this.onAction(item, EventTable.View)} >
                        {stores.sessionStore.getNameGroupMachinesStatistic(item.ten_nhom)}
                    </Link>
                </div>
            },
            {
                title: "Mã máy ", key: "ma_may", width: 110, render: (text: string, item: TransactionByMachineDto) => <div style={{ width: "90px" }}>
                    {is_printed === false ?

                        <Link to={"/general/machine/?machine=" + item.ma_may} onDoubleClick={() => this.onAction(item, EventTable.View)}>
                            {item.ma_may}
                        </Link> :
                        <>
                            {item.ma_may}
                        </>
                    }
                </div>
            },
            {
                title: "Tên máy", key: "ten_may", width: 110, render: (text: string, item: TransactionByMachineDto) => <div style={{ width: "90px" }}>
                    {is_printed === false ?

                        <Link to={"/general/machine/?machine=" + item.ma_may} onDoubleClick={() => this.onAction(item, EventTable.View)}>
                            {item.ten_may}
                        </Link> :
                        <>
                            {item.ten_may}
                        </>
                    }
                </div>
            },
            {
                title: "Mã đơn hàng", key: "list_product",width:100, className: "hoverCell",
                onCell: (item: TransactionByMachineDto) => {
                    return {
                        onClick: (e) => {
                            this.itemProduct = item.list_product!;
                            this.transactionSelected = item;
                            this.setState({ visibleModal: true });
                        }
                    }
                },
                render: (text: string, item: TransactionByMachineDto) => <div style={{width:"80px"}}> {item.ma_hoa_don} </div>
            },
            {
                title: "Tiền giao dịch", children: [
                    {
                        title: "Số tiền nạp vào",
                        render: (text: string, item: TransactionByMachineDto) => <div> {AppConsts.formatNumber(item.so_tien_nap_vao)} </div>
                    },
                    {
                        title: "Số tiền dư",
                        render: (text: string, item: TransactionByMachineDto) => <div> {AppConsts.formatNumber(item.so_tien_du)} </div>
                    }
                ]
            },
            { title: "Số tiền cần thanh toán", key: "money", render: (text: string, item: TransactionByMachineDto) => <div> {AppConsts.formatNumber(item.so_tien_thanh_toan)} </div> },
            { title: "Hình thức thanh toán", key: "hinh_thuc_thanh_toan", render: (text: string, item: TransactionByMachineDto) => <div> {valueOfePaymentMethod(item.hinh_thuc_thanh_toan)} </div> },
            { title: "Số tiền thành công", key: "money", render: (text: string, item: TransactionByMachineDto) => <div> {AppConsts.formatNumber(this.tinhTongTienTheoStatus(item))}</div> },
            {
                title: "Trạng thái hoá đơn", width: 120, key: "trang_thai_hoa_don", render: (text: string, item: TransactionByMachineDto) => {
                    if (is_printed === false) {
                        return <div>
                            {item.trang_thai_hoa_don === eBillStatus.CREATE.num ? <Tag color="yellow" >Khởi tạo</Tag> : ""}
                            {item.trang_thai_hoa_don === eBillStatus.PAYMENT.num ? <Tag icon={<SyncOutlined spin />} color="blue" >Đang giao dịch</Tag> : ""}
                            {item.trang_thai_hoa_don === eBillStatus.SUCCESS.num ? <Tag icon={<CheckCircleOutlined />} color="green" >Thành công</Tag> : ""}
                        </div>
                    } else {
                        return <div>
                            {valueOfeBillStatus(item.trang_thai_hoa_don)}
                        </div>
                    }
                }
            },
            {
                title: "Trạng thái trả hàng", width: 160, key: "trang_thai_tra_hang", render: (text: string, item: TransactionByMachineDto) =>
                    <>
                        {this.props.is_printed == false ?
                            <>
                                {
                                    item.trang_thai_tra_hang === ePaidStatus.CREATE.num ? <Tag color="yellow" >{valueOfePaidStatus(item.trang_thai_tra_hang)}</Tag> : ""
                                }
                                {
                                    item.trang_thai_tra_hang === ePaidStatus.ERROR.num ? <Tag color="red" >{valueOfePaidStatus(item.trang_thai_tra_hang)}</Tag> : ""
                                }
                                {
                                    item.trang_thai_tra_hang === ePaidStatus.PART_SUCCESS.num ? <Tag color="orange" >{valueOfePaidStatus(item.trang_thai_tra_hang)}</Tag> : ""
                                }
                                {
                                    item.trang_thai_tra_hang === ePaidStatus.SUCCESS.num ? <Tag color="green" >{valueOfePaidStatus(item.trang_thai_tra_hang)}</Tag> : ""
                                }

                            </>
                            :
                            <>
                                {valueOfePaidStatus(item.trang_thai_tra_hang)}
                            </>
                        }
                    </>

            },
            { title: "Thời gian giao dịch", dataIndex: 'thoi_gian_giao_dich', key: "thoi_gian_giao_dich", sorter: true, render: (text: string, item: TransactionByMachineDto) => <div> {moment(item.thoi_gian_giao_dich).format("DD/MM/YYYY HH:mm:ss")} </div> },
        ]
        return (
            <>
                <Table
                    className="centerTable"
                    scroll={this.props.is_printed ? { x: undefined, y: undefined } : { x: 1530, y: 600 }}
                    size={'small'}
                    bordered={true}
                    locale={{ "emptyText": "Không có dữ liệu" }}
                    pagination={this.props.pagination}
                    columns={columns}
                    dataSource={listTransactionByMachine}
                    rowKey={record => "importing_table" + JSON.stringify(record)}
                    onChange={(a, b, sort: SorterResult<TransactionByMachineDto> | SorterResult<TransactionByMachineDto>[]) => {
                        if (!!this.props.changeColumnSort) {
                            this.props.changeColumnSort(sort);
                        }
                    }}
                />
                <ModalInvoiceDetail
                    listItemBillingHistory={this.itemProduct}
                    transaction={this.transactionSelected}
                    visible={this.state.visibleModal}
                    onCancel={() => this.setState({ visibleModal: false })}
                />
            </>
        )
    }
}