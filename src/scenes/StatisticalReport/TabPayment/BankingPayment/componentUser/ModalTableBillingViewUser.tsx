import { BillingDto, ItemBillingEntity } from '@src/services/services_autogen';
import { ColumnsType } from 'antd/lib/table';
import * as React from 'react';
import { Modal, Table, Tag } from 'antd';
import AppConsts from '@src/lib/appconst';
import { stores } from '@src/stores/storeInitializer';

export interface IProps {
    listItem?: ItemBillingEntity[];
    billSelected: BillingDto;
    visibleModalBillProduct?: boolean;
    onCancel: () => void;
}

export default class ModalTableBillingViewUser extends React.Component<IProps> {
    state = {
        isLoadDone: true,
    }
    onCancel = () => {
        if (!!this.props.onCancel) {
            this.props.onCancel()
        }
    }
    render() {
        const { listItem, billSelected, visibleModalBillProduct } = this.props
        const columns: ColumnsType<ItemBillingEntity> = [
            { title: "STT", key: "stt_product_index", width: 50, render: (text: string, item: ItemBillingEntity, index: number) => <div>{index + 1}</div> },
            { title: 'Tên sản phẩm', key: 'product_name', dataIndex: 'product_name' },
            { title: 'Tổng số lượng', key: 'product_no_order', dataIndex: 'product_no_order' },
            { title: 'Vị trí sản phẩm', key: 'slot_id', render: (text: string, item: ItemBillingEntity, index: number) => <div>{(item.slot_id + 1)}</div> },
            { title: 'Giá bán', key: 'product_money', render: (text: string, item: ItemBillingEntity, index: number) => <div>{AppConsts.formatNumber(item.product_money)}</div> },
            { title: 'Số sản phẩm thành công', key: 'product_name', render: (text: string, item: ItemBillingEntity) => <div>{item.statusPaidProduct?.filter(item => item.status == "Success").length}</div> },
            { title: 'Số sản phẩm thất bại', key: 'product_name', render: (text: string, item: ItemBillingEntity) => <div>{item.statusPaidProduct?.filter(item => item.status != "Success").length}</div> },
            { title: 'Trạng thái đơn hàng', key: 'product_name', render: (text: string, item: ItemBillingEntity) => <div>{item.statusPaidProduct?.filter(item => item.status != "Success").length != undefined && item.statusPaidProduct?.filter(item => item.status != "Success").length > 0 && item.statusPaidProduct?.filter(item => item.status != "Success").length ? <Tag color="error">Trả hàng không thành công</Tag> : <Tag color="success">Trả hàng thành công</Tag>}</div> },
        ]
        return (
            <Modal
                width={'80%'}
                title={<h3 style={{ textAlign: 'center' }}>{`Chi tiết đơn hàng "${billSelected.bi_code}" của máy bán nước "${stores.sessionStore.getNameMachines(billSelected.ma_id)} - ${billSelected.ma_id}" thuộc nhóm máy "${stores.sessionStore.getNameGroupUseMaId(billSelected.ma_id)} "`}</h3>}
                visible={visibleModalBillProduct}
                onCancel={() => this.onCancel()}
                footer={null}
            >
                <Table
                    className='centerTable'
                    scroll={undefined}
                    columns={columns}
                    size={'middle'}
                    bordered={true}
                    locale={{ "emptyText": "Không có dữ liệu" }}
                    dataSource={listItem}
                    pagination={false}
                    rowKey={record => "billing_table" + JSON.stringify(record)}
                />
            </Modal>
        )
    }

}