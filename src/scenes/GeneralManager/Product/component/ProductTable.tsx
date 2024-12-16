import { DeleteFilled, EditOutlined } from '@ant-design/icons';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { isGranted } from '@src/lib/abpUtility';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { ProductDto } from '@src/services/services_autogen';
import { Button, Table, Image, Tabs } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { TableRowSelection } from 'antd/lib/table/interface';
import moment from 'moment';
import * as React from 'react';
import CreateOrUpdateProduct from './CreateOrUpdateProduct';
import { stores } from '@src/stores/storeInitializer';

export interface IProps {
    actionTable?: (item: ProductDto, event: EventTable) => void;
    pagination: TablePaginationConfig | false;
    isLoadDone?: boolean;
    hasAction?: boolean;
    productListResult: ProductDto[];
    rowSelection?: TableRowSelection<ProductDto>
    noScroll?: boolean;
    isPrint: boolean;
    onCancel?: () => void;
    onCreateUpdateSuccess?: () => void;
    checkExpand?: boolean;
}
export const tabManager = {
    tab_1: "Thông tin",
}
export default class ProductTable extends AppComponentBase<IProps> {
    state = {
        isLoadDone: true,
        pr_id_selected: undefined,
        listIdProduct: 0,
        expandedRowKey: [],
        selectedRowKey: null,
    }
    listIdProduct: number[] = [];
    listItemProduct: ProductDto[] = [];

    handleExpand = (expanded, record) => {
        if (expanded) {
            this.onCancel();
            this.setState({ expandedRowKey: [record.pr_id] });
        } else {
            this.setState({ expandedRowKey: undefined });
        }
    };
    onAction = (item: ProductDto, action: EventTable) => {
        this.setState({ pr_id_selected: item.pr_id });
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action);
        }
    }

    onCreateUpdateSuccess = () => {
        if (!!this.props.onCreateUpdateSuccess) {
            this.props.onCreateUpdateSuccess();
        }
    }
    onCancel = () => {
        if (!!this.props.onCancel) {
            this.props.onCancel();
        }
    }
    render() {
        const { pagination, productListResult, rowSelection, hasAction, isPrint } = this.props
        const { expandedRowKey } = this.state;
        let action = {
            title: "Chức năng", width: 100, key: "action_fresh_drink_index", className: "no-print", dataIndex: '',
            render: (text: string, item: ProductDto) => (
                <div>
                    {(isGranted(AppConsts.Permission.Pages_Manager_General_Product_Delete)) &&
                        <Button
                            danger icon={<DeleteFilled />} title="Xóa"
                            style={{ marginLeft: '10px' }}
                            size='small'
                            onClick={() => this.onAction(item!, EventTable.Delete)}
                        ></Button>}
                </div>
            )
        };

        const columns: ColumnsType<ProductDto> = [
            { title: "STT", key: "stt_fresh_drink_index", width: 50, render: (text: string, item: ProductDto, index: number) => <div>{pagination !== false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
            {
                title: "Ảnh",
                width: 160,
                className: 'no-print',
                key: "fi_id_index",
                render: (text: string, item: ProductDto, index: number) => (
                    <div style={{ textAlign: "center" }}>
                        <Image className='no-print imageProduct' src={(item.fi_id != undefined && item.fi_id.id != undefined) ? this.getFile(item.fi_id.id) : AppConsts.appBaseUrl + "/image/no_image.jpg"} style={{ height: "20vh", width: "60% !important" }}
                            alt='No image available' />
                    </div>
                )
            },
            { title: "Mã sản phẩm", dataIndex: "pr_code", key: "pr_code", render: (text: string, item: ProductDto) => <div> {item.pr_code} </div> },
            { title: "Tên sản phẩm", dataIndex: "pr_name", key: "pr_name", render: (text: string, item: ProductDto) => <div> {item.pr_name} </div> },
            { title: "Nhà cung cấp", dataIndex: "su_id", key: "pr_name", render: (text: string, item: ProductDto) => <div> {stores.sessionStore.getNameSupplier(item.su_id)} </div> },
            // { title: "Loại sản phẩm", dataIndex: "pr_code", key: "pr_code", render: (text: string, item: ProductDto) => <div> {item.pr_type} </div> },
            { title: "Đơn vị tính", dataIndex: "pr_code", key: "pr_code", render: (text: string, item: ProductDto) => <div> {item.pr_unit} </div> },
            { title: "Giá tiền", dataIndex: "pr_code", key: "pr_code", render: (text: string, item: ProductDto) => <div> {AppConsts.formatNumber(item.pr_price)} </div> },
            { title: "Ngày tạo", dataIndex: "pr_created_at", key: "pr_created_at", render: (text: string, item: ProductDto) => <div> {moment(item.pr_created_at).format("DD/MM/YYYY")} </div> },
        ];
        if (!!hasAction && hasAction === true) {
            columns.push(action);
        }

        return (
            <Table
                className='centerTable'
                scroll={this.props.noScroll === false ? { x: undefined, y: undefined } : { x: 1000, y: 600 }}
                expandable={
                    this.props.isPrint
                        ? {}
                        : {
                            expandedRowRender: (record) => (
                                <>
                                    {/* {this.props.onCancel != undefined && this.props.onCancel()} */}
                                    <Tabs defaultActiveKey={tabManager.tab_1}>
                                        <Tabs.TabPane tab={tabManager.tab_1} key={tabManager.tab_1}>
                                            <CreateOrUpdateProduct
                                                layoutDetail={true}
                                                productSelected={record}
                                                onCreateUpdateSuccess={this.onCreateUpdateSuccess} />
                                        </Tabs.TabPane>
                                    </Tabs>
                                </>
                            ),
                            expandRowByClick: true,
                            expandIconColumnIndex: -1,
                            expandedRowKeys: this.props.checkExpand == true ? [] : expandedRowKey,
                            onExpand: this.handleExpand,
                        }
                }

                rowSelection={this.props.actionTable !== undefined ? rowSelection : undefined}
                loading={!this.props.isLoadDone}
                columns={columns}
                size={'small'}
                bordered={true}
                locale={{ "emptyText": "Không có dữ liệu" }}
                dataSource={productListResult.length > 0 ? productListResult : []}
                pagination={this.props.pagination}
                rowClassName={(record) => this.state.selectedRowKey === record.pr_id ? "bg-click" : "bg-white"}
                onRow={(record) => ({
                    onClick: () => {
                        this.setState({ selectedRowKey: record.pr_id });
                    },
                })}
                rowKey={record => record.pr_id}
            />
        )
    }
}