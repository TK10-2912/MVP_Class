import { DeleteFilled, EyeFilled } from '@ant-design/icons';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { isGranted } from '@src/lib/abpUtility';
import AppConsts, { EventTable, cssColResponsiveSpan } from '@src/lib/appconst';
import { ProductDto } from '@src/services/services_autogen';
import { Button, Table, Tabs, Tag, Space, Row, Col, Image } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { SorterResult, TableRowSelection } from 'antd/lib/table/interface';
import moment from 'moment';
import * as React from 'react';
import UpdateModal from './UpdateModal';
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
    onUpdateSuccess?: () => void;
    checkExpand?: boolean;
    changeColumnSort?: (fieldSort: SorterResult<ProductDto> | SorterResult<ProductDto>[]) => void;
    formatImage?: boolean;
}
export const tabManager = {
    tab_1: "Thông tin sản phẩm",
}
export default class ProductTable extends AppComponentBase<IProps> {
    state = {
        isLoadDone: true,
        pr_id_selected: undefined,
        listIdProduct: 0,
        expandedRowKey: [],
    }
    listIdProduct: number[] = [];
    listItemProduct: ProductDto[] = [];
    handleExpand = (expanded, record) => {
        if (expanded) {
            this.setState({ expandedRowKey: [record.pr_id] });
            this.setState({ pr_id_selected: record.pr_id });
        } else {
            this.setState({ expandedRowKey: undefined });
            this.setState({ pr_id_selected: undefined });
        }
    };
    onAction = (item: ProductDto, action: EventTable) => {
        this.setState({ pr_id_selected: item.pr_id });
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action);
        }
    }

    onUpdateSuccess = () => {
        if (!!this.props.onUpdateSuccess) {
            this.props.onUpdateSuccess();
        }
    }
    render() {


        const { pagination, productListResult, rowSelection, hasAction, isPrint } = this.props
        const { expandedRowKey } = this.state;
        let action = {
            title: "Chức năng", width: 100, key: "action_fresh_drink_index", className: "no-print", dataIndex: '',
            render: (_: string, item: ProductDto) => (
                <Space>
                    {isGranted(AppConsts.Permission.Pages_Manager_General_Product_Update) &&
                        <Button
                            type="primary" icon={<EyeFilled />} title={"Xem chi tiết"}
                            size='small'
                            onClick={() => this.handleExpand(true, item)}
                        ></Button>
                    }
                    {isGranted(AppConsts.Permission.Pages_Manager_General_Product_Delete) &&
                        <Button
                            danger icon={<DeleteFilled />} title="Xóa"
                            size='small'
                            onClick={(e) => { e.stopPropagation(); this.onAction(item, EventTable.Delete) }}
                        ></Button>}
                </Space>
            )
        };

        const columns: ColumnsType<ProductDto> = [
            {
                title: "STT", key: "stt_fresh_drink_index", width: 50, render: (_: string, item: ProductDto, index: number) =>
                    <div>{pagination !== false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div>
            },
            {
                title: "Ảnh",
                width: 120,
                className: 'no-print',
                key: "fi_id_index",
                render: (_: string, item: ProductDto, index: number) => (
                    <div style={{ textAlign: "center" }}>
                        <Image onClick={(e) => e.stopPropagation()} className='imageDetailProductExportExcel' src={(item.fi_id != undefined && item.fi_id.id != undefined) ? this.getImageProduct(item.fi_id.md5 != undefined ? item.fi_id.md5 : "") : AppConsts.appBaseUrl + "/image/no_image.jpg"} style={{ height: `${this.props.isPrint ? "70px" : "60px"}`, width: `${this.props.isPrint ? "70px" : "60px"}`, maxWidth: '60px !important', maxHeight: '60px !important' }}
                            alt='No image available' />
                    </div>
                )
            },
            { title: "Mã sản phẩm", dataIndex: "pr_code", key: "pr_code", render: (_: string, item: ProductDto) => <div> {item.pr_code} </div> },
            { title: "Tên sản phẩm", dataIndex: "pr_name", key: "pr_name", render: (_: string, item: ProductDto) => <div> {item.pr_name} </div> },
            { title: "Đơn vị tính", dataIndex: "pr_code", key: "pr_code", render: (_: string, item: ProductDto) => <div> {item.pr_unit} </div> },
            { title: "Giá tiền", sorter: (a, b) => a.pr_price - b.pr_price, dataIndex: "pr_code", key: "pr_code", render: (_: string, item: ProductDto) => <div> {AppConsts.formatNumber(item.pr_price)} </div> },
            {
                title: "Trạng thái sản phẩm", width: 150, dataIndex: "pr_code", key: "pr_code", render: (_: string, item: ProductDto) => <div>
                    {
                        this.props.isPrint
                            ? item.pr_is_active == true ? <div>Đang kinh doanh</div> : <div>Ngừng kinh doanh</div>
                            : item.pr_is_active == true ? <Tag color='success'>Đang kinh doanh</Tag> : <Tag color='error'>Ngừng kinh doanh</Tag>

                    }
                </div>
            },
            { title: "Ngày tạo", dataIndex: "pr_created_at", key: "pr_created_at", sorter: true, render: (_: string, item: ProductDto) => <div> {moment(item.pr_created_at).format("DD/MM/YYYY")} </div> },
        ];
        if (!!hasAction && hasAction === true) {
            columns.push(action);
        }

        return (
            <Table
                className='centerTable'
                scroll={this.props.noScroll === false ? { x: undefined, y: undefined } : { x: 1200, y: 600 }}
                expandable={
                    this.props.isPrint
                        ? {}
                        : {
                            expandedRowRender: (record) => (
                                <>
                                    <Tabs defaultActiveKey={tabManager.tab_1}>
                                        <Tabs.TabPane tab={tabManager.tab_1} key={tabManager.tab_1}>
                                            <UpdateModal
                                                productListResult={productListResult}
                                                layoutDetail={true}
                                                productSelected={record}
                                                onCreateUpdateSuccess={this.onUpdateSuccess} />
                                        </Tabs.TabPane>
                                    </Tabs>
                                </>
                            ),
                            expandRowByClick: true,
                            expandIconColumnIndex: -1,
                            expandedRowKeys: this.props.checkExpand == true ? [] : expandedRowKey,
                            onExpand: (isGranted(AppConsts.Permission.Pages_Manager_General_Product_Update)) ? this.handleExpand : () => { },
                        }
                }
                rowSelection={this.props.actionTable !== undefined ? rowSelection : undefined}
                loading={!this.props.isLoadDone}
                columns={columns}
                size={'small'}
                onChange={(_a, _b, sort: SorterResult<ProductDto> | SorterResult<ProductDto>[]) => {
                    if (!!this.props.changeColumnSort) {
                        this.props.changeColumnSort(sort);
                    }
                }}

                bordered={true}

                dataSource={productListResult.length > 0 ? productListResult : []}
                pagination={this.props.pagination}
                rowClassName={(record) => (this.state.pr_id_selected === record.pr_id) ? "bg-lightGreen" : "bg-white"}
                rowKey={record => record.pr_id}
                onRow={() => {
                    return {
                        style: { cursor: `${this.props.isPrint ? '' : "pointer"}` },
                    };
                }}
                footer={
                    // this.props.isPrint == false ?
                    () =>
                        <Row justify='center' style={{ marginTop: "8px", fontSize: 14 }} id='ProductTableFooterID'>
                            <Col {...cssColResponsiveSpan(24, 8, 8, 8, 8, 8)} style={{ border: '1px solid #e4e1e1', padding: 15, }}>
                                <span>Tổng sản phẩm: <strong>{productListResult.length}</strong></span>
                            </Col>
                            <Col {...cssColResponsiveSpan(24, 8, 8, 8, 8, 8)} style={{ border: '1px solid #e4e1e1', padding: 15, }}>
                                <span>Sản phẩm đang kinh doanh: <strong style={{ color: '#1DA57A' }}>{productListResult.filter(item => item.pr_is_active == true).length}</strong></span>
                            </Col>
                            <Col {...cssColResponsiveSpan(24, 8, 8, 8, 8, 8)} style={{ border: '1px solid #e4e1e1', padding: 15, }}>
                                <span>Sản phẩm ngừng kinh doanh: <strong style={{ color: '#FF2B89' }}>{productListResult.filter(item => item.pr_is_active !== true).length}</strong></span>
                            </Col>
                        </Row>

                }
            />
        )
    }
}