import { BillingDto, ItemBillingEntity, RefundDto } from '@src/services/services_autogen';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import { Col, Modal, Row, Table, Tabs, Tag } from 'antd';
import AppConsts, { pageSizeOptions } from '@src/lib/appconst';
import ActionExport from '@src/components/ActionExport';
import TablePaymentBankAdmin from './TablePaymentBankAdmin';
import { stores } from '@src/stores/storeInitializer';

export interface IProps {
    listItem?: ItemBillingEntity[];
    refundSelected?: RefundDto;
    billSelected: BillingDto;
    visibleModalBillProduct: boolean;
    onCancel: () => void;
}
export const tabBillingDetail = {
    tab_2: ("Chi tiết giao giao dịch"),
    tab_1: ("Chi tiết thanh toán"),

}
export default class ModalTableBillingViewAdmin extends React.Component<IProps> {
    state = {
        isLoadDone: true,
        visibleModalBillProduct: false,
        page: 10,
        currentPage: 1,
    }
    componentRef: any | null = null;
    setComponentRef = (ref) => {
        this.setState({ isLoadDone: false });
        this.componentRef = ref;
        this.setState({ isLoadDone: true });
    }
    onCancel = () => {
        if (!!this.props.onCancel) {
            this.props.onCancel()
        }
    }
    render() {
        const self = this;
        const { listItem, billSelected, visibleModalBillProduct } = this.props;
        const { refundListDto } = stores.refundStore;
        const columns: ColumnsType<ItemBillingEntity> = [
            { title: "STT", key: "stt_product_index", width: 50, render: (text: string, item: ItemBillingEntity, index: number) => <div>{this.state.page! * (this.state.currentPage! - 1) + (index + 1)}</div> },
            { title: 'Tên sản phẩm', key: 'product_name', dataIndex: 'product_name' },
            { title: 'Giá sản phẩm', key: 'product_money', render: (text: string, item: ItemBillingEntity, index: number) => <div>{AppConsts.formatNumber(item.product_money)}</div> },
            { title: 'Tổng số lượng', key: 'product_no_order', dataIndex: 'product_no_order' },
            { title: 'Vị trí sản phẩm', key: 'slot_id', render: (text: string, item: ItemBillingEntity, index: number) => <div>{(item.slot_id + 1)}</div> },
            { title: 'Số sản phẩm thành công', key: 'product_name', render: (text: string, item: ItemBillingEntity) => <div>{item.statusPaidProduct?.filter(item => item.status == "Success").length}</div> },
            // { title: 'Số sản phẩm thất bại', key: 'product_name', render: (text: string, item: ItemBillingEntity) => <div>{item.statusPaidProduct?.filter(item => item.status != "Success").length}</div> },
            // ...(this.props.billSelected.bi_method_payment === 0 ||
            //     this.props.billSelected.bi_method_payment === 3 ||
            //     this.props.billSelected.bi_method_payment === 4
            //     ? [] : [{
            //         title: 'Trạng thái',
            //         key: 'slot_id',
            //         // render: (text: string, item: ItemBillingEntity) => <div>{this.props.billSelected.listRefunds}</div>
            //     }]),
            { title: 'Trạng thái trả hàng', key: 'product_name', render: (text: string, item: ItemBillingEntity) => <div>{item.statusPaidProduct?.filter(item => item.status != "Success").length != undefined && item.statusPaidProduct?.filter(item => item.status != "Success").length > 0 && item.statusPaidProduct?.filter(item => item.status != "Success").length ? <Tag color="error">Trả hàng không thành công</Tag> : <Tag color="success">Trả hàng thành công</Tag>}</div> },
        ]
        return (
            <Modal
                width={'80%'}
                title={`Chi tiết đơn hàng: "${billSelected?.bi_code}"`}
                visible={visibleModalBillProduct}
                onCancel={() => this.onCancel()}
                footer={null}
            >
                <Tabs defaultActiveKey={tabBillingDetail.tab_1}>
                    <Tabs.TabPane tab={tabBillingDetail.tab_1} key={tabBillingDetail.tab_1}>
                        <Table
                            className='centerTable'
                            scroll={undefined}
                            columns={columns}
                            size={'middle'}
                            bordered={true}
                            
                            dataSource={listItem != undefined ? listItem : []}
                            // pagination={listItem != undefined && listItem!.length > 10 ?
                            //      {
                            //         total:listItem?.length,
                            //         showTotal:(tot)=>'Tổng: '+ tot,
                            //         onChange(page: number, pageSize?: number)
                            //         {
                            //             self.setState({currentPage:page, page:pageSize})
                            //         }
                            //      }
                            //     : false}
                            pagination={{
                                position: ['topRight'],
                                showTotal: (tot) => "Tổng" + ": " + tot + "",
                                showQuickJumper: true,
                                showSizeChanger: true,
                                pageSizeOptions: pageSizeOptions,
                                onChange: (page: number, pageSize?: number | undefined) => {
                                    this.setState({ page: pageSize, currentPage: page })
                                }
                            }}
                            rowKey={record => "billing_table" + JSON.stringify(record)}
                        />
                    </Tabs.TabPane>
                    {this.props.refundSelected?.paymentBankDto != undefined &&

                        < Tabs.TabPane tab={tabBillingDetail.tab_2} key={tabBillingDetail.tab_2}>
                            <TablePaymentBankAdmin
                                isOpenModalBilling={true}
                                isPrinted={false}
                                paymentBankingListResult={[this.props.refundSelected?.paymentBankDto!]}
                                isLoadDone={this.state.isLoadDone}
                                pagination={{
                                    position: ['topRight'],
                                    showTotal: (tot) => "Tổng" + ": " + tot + "",
                                    showQuickJumper: true,
                                    showSizeChanger: true,
                                    pageSizeOptions: pageSizeOptions,
                                    onChange: (page: number, pageSize?: number | undefined) => {
                                        this.setState({ page: pageSize, currentPage: page })
                                    }
                                }}
                            />
                        </Tabs.TabPane>
                    }
                </Tabs>

            </Modal >
        )


    }

}