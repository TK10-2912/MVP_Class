import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { pageSizeOptions } from '@src/lib/appconst';
import { ProductExportDto } from '@src/services/services_autogen';
import { Col, Image, Pagination, Row, Table, Tag } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import { stores } from '@src/stores/storeInitializer';
import { SorterResult, TablePaginationConfig } from 'antd/lib/table/interface';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';

export interface IProps {
    listProduct?: ProductExportDto[];
    isModal?: boolean;
    title?: string;
}
export default class TableProductExport extends AppComponentBase<IProps> {
    state = {
        isLoadDone: true,
        currentPage: 1,
        pagesize: 10,
    }
    handlePageChange = (page, pageSize) => {
        this.setState({ currentPage: page, pagesize: pageSize });
    };
    onShowSizeChange = (current, size) => {
        this.handlePageChange(current, size);
    };
  
    render() {
        const { listProduct } = this.props;
        const startIndex = (this.state.currentPage - 1) * this.state.pagesize;
        const endIndex = startIndex + this.state.pagesize;
        const currentData = listProduct?.slice(startIndex, endIndex);
        const columns: ColumnsType<ProductExportDto> = [
            { title: "STT", key: "stt_fresh_drink_index", width: 50, render: (text: string, item: ProductExportDto, index: number) => <div>{(this.state.currentPage - 1) * this.state.pagesize + index + 1}</div> },
            { title: "Vị trí khay", key: "stt_fresh_drink_index", render: (text: string, item: ProductExportDto, index: number) => <div>{item.pr_ex_no}</div> },
            { title: "Mã sản phẩm", key: "im_re_code", render: (text: string, item: ProductExportDto) => <div> {stores.sessionStore.getCodeProductByID(item.pr_id!)} </div> },
            {
                title: "Ảnh", key: "image", dataIndex: "pr_im_name", width: 100, render: (text: string, item: ProductExportDto) =>
                    <div style={{ textAlign: "center" }} >
                        <Image className='no-print imageProduct'
                            src={stores.sessionStore.getImageProductByID(item.pr_id) ? this.getImageProduct(stores.sessionStore.getImageProductByID(item.pr_id)!.md5!) : process.env.PUBLIC_URL + '/image/no_image.jpg'}
                            alt='No image available' />
                    </div>
            },
            { title: "Tên sản phẩm", key: "im_re_code", render: (text: string, item: ProductExportDto) => <div> {stores.sessionStore.getNameProduct(item.pr_id!)} </div> },
            { title: "Đơn vị", key: "im_re_code", render: (text: string, item: ProductExportDto) => <div> {stores.sessionStore.getUnitProductByID(item.pr_id!)} </div> },
            { title: "Số lượng", key: "pr_ex_quantity", dataIndex: "pr_ex_quantity", sorter: (a, b) => a.pr_ex_quantity - b.pr_ex_quantity, render: (text: string, item: ProductExportDto) => <div> {AppConsts.formatNumber(item.pr_ex_quantity)} </div> },
            // { title: "Số lượng trước khi nhập", width: 100, key: "pr_ex_quantityBeforeExport", dataIndex: "pr_ex_quantityBeforeExport", sorter: (a, b) => a.pr_ex_quantityBeforeExport - b.pr_ex_quantityBeforeExport, render: (text: string, item: ProductExportDto) => <div> {item.pr_ex_quantityBeforeExport!} </div> },
            // { title: "Số lượng đã nhập", width: 100, key: "pr_ex_quantity", dataIndex: "pr_ex_quantity", sorter: (a, b) => a.pr_ex_quantity - b.pr_ex_quantity, render: (text: string, item: ProductExportDto) => <div> {item.pr_ex_quantity!} </div> },
            // {
            //     title: "Số lượng sau khi nhập",
            //     width: 100,
            //     key: "pr_ex_quantityAfterImport",
            //     dataIndex: "pr_ex_quantityAfterImport",
            //     sorter: (a, b) => {
            //         const before = (a.pr_ex_quantityBeforeExport - a.pr_ex_quantity);
            //         const after = (b.pr_ex_quantityBeforeExport - b.pr_ex_quantity);
            //         return before - after;
            //     },
            //     render: (text: string, item: ProductExportDto) => (
            //         <div>{item.pr_ex_quantityBeforeExport! - item.pr_ex_quantity}</div>
            //     ),
            // }

        ];
        return (
            <>
                {this.props.isModal && <TitleTableModalExport title={"Danh sách xuất hàng " + this.props.title!}></TitleTableModalExport>}
                <Table
                    className='centerTable customTable'
                    columns={columns}
                    size={'small'}
                    bordered={true}
                    dataSource={currentData}
                    rowKey={record => record.pr_ex_no}
                    pagination={false}
                />
                <Row justify='end'>
                    <Pagination
                        size='small'
                        current={this.state.currentPage}
                        pageSize={this.state.pagesize}
                        total={listProduct?.length}
                        onChange={this.handlePageChange}
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total) => `Tổng: ${total}`}
                        pageSizeOptions={pageSizeOptions}
                        onShowSizeChange={this.onShowSizeChange}
                    />
                </Row>

            </>

        )
    }
}