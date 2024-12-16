import * as React from 'react';
import { Col, Row, Card, Modal, Button, Input, DatePicker, Select, message } from 'antd';
import { stores } from '@stores/storeInitializer';
import { ERIFDAction, LayoutDto, RfidLogDto } from '@services/services_autogen';
import { L } from '@lib/abpUtility';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { DeleteOutlined, ExportOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { eRIFDAction, eSort } from '@src/lib/enumconst';
import SelectUserMultiple from '@src/components/Manager/SelectUserMultiple';
import SelectEnumMulti from '@src/components/Manager/SelectEnumMulti';
import { EventTable, cssCol, cssColResponsiveSpan } from '@src/lib/appconst';
import { SorterResult } from 'antd/lib/table/interface';
import moment from 'moment';
import SelectedGroupMachine from '@src/components/Manager/SelectedGroupMachine';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';
import SelectedSupplier from '@src/components/Manager/SelectedSupplier';
import SelectedProduct from '@src/components/Manager/SelectedProduct';
import TableLayout from './component/TableLayout';
import ProductList from './component/ProductList';
import ModalExportLayout from './component/ModalExportLayout';
const { confirm } = Modal;
const { RangePicker } = DatePicker;

export const eFormatPicker = {
    date: "date",
    month: "month",
    year: "year",
}
export interface IProps {
    status?: number;
    rf_code?: string;
    tab?: string;
}
export default class Layout extends AppComponentBase<IProps> {
    state = {
        isLoadDone: true,
        visibleModalExport: false,
        skipCount: 0,
        maxResult: 10,
        pageSize: 10,
        currentPage: 1,
        us_id_list: undefined,
        la_search: undefined,
        visibleModalCreateUpdate: false,
    };
    layoutSelected: LayoutDto = new LayoutDto();
    async getAll() {
        this.setState({ isLoadDone: false });
        await stores.layoutStore.getAll(this.state.la_search, this.state.skipCount, this.state.maxResult);
        await stores.productStore.getAll(undefined, undefined, undefined);
        this.setState({ isLoadDone: true, visibleModalCreateUpdate: false, visibleExportExcelSupplier: false, });
    }
    async componentDidMount() {
        await this.getAll();
    }
    createOrUpdateModalOpen = async (item: LayoutDto) => {
        this.layoutSelected = item;
        await this.setState({ visibleModalCreateUpdate: true, isLoadDone: true });
    }
    onChangePage = async (page: number, pagesize?: number) => {
        if (pagesize !== undefined) {
            await this.setState({ pageSize: pagesize! });
        }
        await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            this.getAll();
        })
    }
    actionTable = (item: LayoutDto, event: EventTable) => {
        let self = this;
        if (event === EventTable.Edit || event === EventTable.RowDoubleClick) {
            this.createOrUpdateModalOpen(item);
        }
        if (event === EventTable.Delete) {
            confirm({
                title: "Bạn có muốn xóa bố cục " + item.la_type + "?",
                okText: L('Xác nhận'),
                cancelText: L('Hủy'),
                async onOk() {
                    self.setState({ isLoadDone: false });
                    await stores.layoutStore.delete(item);
                    message.success("Xóa thành công !")
                    await self.getAll();
                    self.setState({ isLoadDone: true });
                },
            });
        }
    }
    handleSearch = () => {
        this.setState({ isLoadDone: false });
        this.getAll();
        this.setState({ isLoadDone: true });
    }
    render() {
        const self = this;
        const left = this.state.visibleModalCreateUpdate ? cssCol(0) : cssColResponsiveSpan(24, 24, 24, 24, 24, 24);
        const right = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 24, 24, 24, 24) : cssCol(0);
        const { layoutListResult, totalCount } = stores.layoutStore;
        const { productListResult } = stores.productStore;
        return (
            <>
                <Row gutter={[8, 8]}>
                    <Col {...cssColResponsiveSpan(15, 12, 8, 12, 12, 12)}>
                        <h2>Bố cục</h2>
                    </Col>
                    <Col style={{ textAlign: "end" }} {...cssColResponsiveSpan(9, 12, 16, 12, 12, 12)}>
                        <Button style={{ marginRight:"10px" }} title='Thêm mới' type="primary" icon={<PlusOutlined />} onClick={() => this.createOrUpdateModalOpen(new LayoutDto())}>{'Thêm mới'}</Button>
                        <Button title='Xuất dữ liệu' type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleModalExport: true })} >Xuất dữ liệu</Button>

                    </Col>
                </Row>
                <Card>
                    {!this.state.visibleModalCreateUpdate &&
                        <Row gutter={[8, 8]} align='bottom'>
                            <Col {...cssColResponsiveSpan(24, 12, 12, 12, 12, 12)}>
                                <strong>Tìm kiếm</strong>
                                <Input onChange={async (value) => await this.setState({ la_search: value })}
                                />
                            </Col>
                            <Col {...cssColResponsiveSpan(24, 24, 16, 8, 8, 8)} style={{ display: "end", flexWrap: "wrap", gap: 8 }} >
                                <Button type="primary" icon={<SearchOutlined />} title="Tìm kiếm" onClick={this.handleSearch}>Tìm kiếm</Button>
                                {!!this.state.la_search && <Button style={{ marginLeft: "10px" }} danger title="Xoá tìm kiếm" onClick={async () => { await this.setState({ la_search: undefined }); this.handleSearch() }}>Xoá tìm kiếm</Button>}
                            </Col>
                        </Row>
                    }
                    <Row>
                        <Col {...left} >
                            <TableLayout
                                hasAction={true}
                                actionTable={this.actionTable}
                                layoutListResult={layoutListResult}
                                isLoadDone={this.state.isLoadDone}
                                pagination={{
                                    pageSize: this.state.pageSize,
                                    total: totalCount,
                                    current: this.state.currentPage,
                                    showTotal: (tot) => ("Tổng: ") + tot + "",
                                    showQuickJumper: true,
                                    showSizeChanger: true,
                                    pageSizeOptions: ['10', '20', '50', '100'],
                                    onShowSizeChange(current: number, size: number) {
                                        self.onChangePage(current, size)
                                    },
                                    onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
                                }}
                                noScrool={false}
                            />
                        </Col>
                        <Col  {...right}>
                            {this.state.visibleModalCreateUpdate &&
                                <ProductList
                                    layoutSelected={this.layoutSelected}
                                    listProduct={productListResult}
                                    onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
                                    onSuccess={() => this.getAll()}
                                />
                            }
                        </Col>
                        {this.state.visibleModalExport &&
                            <ModalExportLayout
                                layoutListResult={layoutListResult}
                                onCancel={() => this.setState({ visibleModalExport: false })}
                                visible={this.state.visibleModalExport}
                            />
                        }
                    </Row>
                </Card >

            </>

        )
    }
}