import AppConsts from '@src/lib/appconst'
import { valueOfeBillMethod } from '@src/lib/enumconst'
import { BillingDto, ItemBillingEntity } from '@src/services/services_autogen'
import { stores } from '@src/stores/storeInitializer'
import { Table, Tag } from 'antd'
import Modal from 'antd/lib/modal/Modal'
import { ColumnsType } from 'antd/lib/table'
import React, { Component } from 'react'
interface IProps {
    billSelected: BillingDto,
    visibleModalBillProduct: boolean,
    onCancel?: () => void,
    listItem: ItemBillingEntity[]
}
export default class ModalTableBillingViewAdmin extends Component<IProps> {
    render() {
        const columns: ColumnsType<ItemBillingEntity> = [
            { title: "STT", key: "stt_product_index", width: 50, render: (text: string, item: ItemBillingEntity, index: number) => <div>{index + 1}</div> },
            { title: 'Tên sản phẩm', key: 'product_name', dataIndex: 'product_name' },
            { title: 'Giá sản phẩm', key: 'product_money', render: (text: string, item: ItemBillingEntity, index: number) => <div>{AppConsts.formatNumber(item.product_money)}</div> },
            { title: 'Tổng số lượng', key: 'product_no_order', dataIndex: 'product_no_order' },
            { title: 'Vị trí sản phẩm', key: 'slot_id', render: (text: string, item: ItemBillingEntity, index: number) => <div>{(item.slot_id + 1)}</div> },
            { title: 'Số sản phẩm thành công', key: 'product_name', render: (text: string, item: ItemBillingEntity) => <div>{item.statusPaidProduct?.filter(item => item.error == "Success").length}</div> },
            { title: 'Số sản phẩm thất bại', key: 'product_name', render: (text: string, item: ItemBillingEntity) => <div>{item.statusPaidProduct?.filter(item => item.status != "Success").length}</div> },
            { title: 'Trạng thái đơn hàng', key: 'product_status', render: (text: string, item: ItemBillingEntity) => <div>{item.statusPaidProduct?.filter(item => item.status != "Success").length != undefined && item.statusPaidProduct?.filter(item => item.status != "Success").length > 0 && item.statusPaidProduct?.filter(item => item.status != "Success").length ? <Tag color="error">Trả hàng không thành công</Tag> : <Tag color="success">Trả hàng thành công</Tag>}</div> },

        ]
        return (
            <Modal
                width={'80%'}
                title={<h3 style={{ textAlign: 'center' }}>Chi tiết đơn hàng:  {`" ${this.props.billSelected.bi_code}"`}  {this.props.billSelected != undefined && "- Hình thức thanh toán "+  `"${valueOfeBillMethod(this.props.billSelected.bi_method_payment)}"`}</h3>}
                visible={this.props.visibleModalBillProduct}
                onCancel={() => this.props.onCancel!()}
                footer={null}
            >
                <Table
                    className='centerTable'
                    scroll={undefined}
                    columns={columns}
                    size={'middle'}
                    bordered={true}
                    
                    dataSource={this.props.listItem}
                    pagination={false}
                    rowKey={record => "billing_table" + JSON.stringify(record)}
                />
            </Modal>
        )
    }
}
