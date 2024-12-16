import AppConsts from "@src/lib/appconst";
import { valueOfeBillMethod } from "@src/lib/enumconst";
import { ItemBillingHistory, TransactionByMachineDto } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import { Modal, Table, Tag } from "antd";
import React from "react";

export interface IProps {
    listItemBillingHistory: ItemBillingHistory[];
    onCancel: () => void;
    visible: boolean;
    transaction: TransactionByMachineDto;
}

export default class ModalInvoiceDetail extends React.Component<IProps> {

    onCancel = () => {
        if (!!this.props.onCancel) {
            this.props.onCancel()
        }
    }

    render() {
        const columns = [
            { title: "STT", key: "stt_product_index", width: 50, render: (text: string, item: ItemBillingHistory, index: number) => <div>{index + 1}</div> },
            { title: 'Tên sản phẩm', key: 'product_name', dataIndex: 'product_name' },
            { title: 'Giá sản phẩm', key: 'product_money', render: (text: string, item: ItemBillingHistory, index: number) => <div>{AppConsts.formatNumber(item.product_money)}</div> },
            { title: 'Tổng số lượng', key: 'product_no_order', dataIndex: 'product_no_order' },
            { title: 'Vị trí sản phẩm', key: 'product_Slot', render: (text: string, item: ItemBillingHistory,) => <div>{(item.product_Slot + 1)}</div> },
            { title: 'Số sản phẩm thành công', key: 'product_name', render: (text: string, item: ItemBillingHistory) => <div>{item.statusPaidProduct?.filter(item => item.status == "Success").length}</div> },
            { title: 'Số sản phẩm thất bại', key: 'product_name', render: (text: string, item: ItemBillingHistory) => <div>{item.statusPaidProduct?.filter(item => item.status != "Success").length}</div> },
            { title: 'Hình thức thanh toán', key: 'product_name', render: (text: string, item: ItemBillingHistory) => <div>{valueOfeBillMethod(this.props.transaction.hinh_thuc_thanh_toan)}</div> },
            { title: 'Trạng thái đơn hàng', key: 'product_name', render: (text: string, item: ItemBillingHistory) => <div>{item.statusPaidProduct?.filter(item => item.status != "Success").length != undefined && item.statusPaidProduct?.filter(item => item.status != "Success").length > 0 && item.statusPaidProduct?.filter(item => item.status != "Success").length ? <Tag color="error">Trả hàng không thành công</Tag> : <Tag color="success">Trả hàng thành công</Tag>}</div> },
        ]
        return (
            <>
                <Modal
                    width={'80%'}
                    title={
                        <h3 style={{ textAlign: 'center' }}>
                          {this.props.transaction && (
                            <>
                              Chi tiết đơn hàng: {this.props.transaction.ma_hoa_don} của máy "{this.props.transaction.ten_may}" - 
                              {this.props.transaction.ten_nhom ? ` "${this.props.transaction.ten_nhom}"` : ' Không có nhóm máy'}
                            </>
                          )}
                        </h3>
                      }
                      
                    visible={this.props.visible}
                    onCancel={() => this.onCancel()}
                    footer={null}
                >
                    <Table
                        className="centerTable"
                        bordered
                        rowKey={record => "InvoiceDetail" + JSON.stringify(record)}
                        columns={columns}
                        dataSource={this.props.listItemBillingHistory}
                    />
                </Modal>
            </>
        )


    }
}