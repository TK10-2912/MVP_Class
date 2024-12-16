import * as React from 'react';
import { DeleteFilled, DeleteOutlined, ExportOutlined, PlusOutlined, SearchOutlined, WarningOutlined } from '@ant-design/icons';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan } from '@src/lib/appconst';
import { ProductDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Badge, Button, Card, Col, Input, Modal, Popover, Row, Space, message } from 'antd';
import { L, isGranted } from '@src/lib/abpUtility';
import { TableRowSelection } from 'antd/lib/table/interface';
import ModalExportProduct from './component/ModalExportProduct';
import CreateOrUpdateProduct from './component/CreateOrUpdateProduct';
import ProductTable from './component/ProductTable';
import SelectUserMultiple from '@src/components/Manager/SelectUserMultiple';

const { confirm } = Modal;

export default class Product extends React.Component {
    state = {
        isLoadDone: false,
        visibleModalCreateUpdate: false,
        visibleExportExcelFreshDrink: false,
        visibleModalImport: false,
        pr_name: undefined,
        us_id_list: undefined,
        su_id: undefined,
        skipCount: 0,
        maxResultCount: 10,
        onChangePage: 1,
        currentPage: 1,
        pageSize: 10,
        clicked: false,
        numberSelected: 0,
        select: false,
        sort: undefined,

    };

    productSelected: ProductDto = new ProductDto();
    listItemProduct: ProductDto[] = [];
    keySelected: number[] = [];
    selectedField: string;

    async componentDidMount() {
        await this.getAll();
    }

    async getAll() {
        this.setState({ isLoadDone: false });
        if (isGranted(AppConsts.Permission.Pages_Manager_General_Admin_Product)) {
            await stores.productStore.getAllByAdmin(this.state.us_id_list, this.state.pr_name, this.state.skipCount, undefined);
        }
        else
            await stores.productStore.getAll(this.state.pr_name, this.state.skipCount, this.state.pageSize);
        this.setState({ isLoadDone: true, visibleModalCreateUpdate: false, visibleExportExcelAuthor: false });
    }

    handleSubmitSearch = async () => {
        this.onChangePage(1, this.state.pageSize);
    }
    handleVisibleChange = (visible) => {
        this.setState({ clicked: visible });
    }
    onChangePage = async (page: number, pagesize?: number) => {
        if (pagesize !== undefined) {
            await this.setState({ pageSize: pagesize! });
        }
        await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            this.getAll();
        })
    }

    createOrUpdateModalOpen = async (input: ProductDto) => {
        if (input !== undefined && input !== null) {
            this.productSelected.init(input);
            await this.setState({ visibleModalCreateUpdate: true, isLoadDone: true });
        }
    }
    actionTable = async (product: ProductDto, event: EventTable) => {
        let self = this;
        if (product === undefined || product.pr_id === undefined) {
            message.error("Không tìm thấy !");
            return;
        }
        else if (event === EventTable.Edit) {
            this.setState({ isLoadDone: false });
            this.productSelected.init(product);
            await this.setState({ visibleModalCreateUpdate: true, isLoadDone: true });
        }
        else if (event === EventTable.Delete) {
            confirm({
                title: 'Bạn có chắc muốn xóa sản phẩm: ' + product.pr_name + "?",
                okText: "Xác nhận",
                cancelText: "Hủy",
                async onOk() {
                    await stores.productStore.delete(product);
                    await self.getAll();
                    message.success("Xóa thành công !")
                    self.setState({ isLoadDone: true });
                },
                onCancel() {
                },
            });
        }
    };
    onCreateUpdateSuccess = () => {
        this.setState({ isLoadDone: false });
        this.getAll();
        this.setState({ isLoadDone: true, visibleModalCreateUpdate: false, })
    }
    clearSearch = async () => {
        await this.setState({
            pr_name: undefined,
            us_id_list: undefined,
        })
        this.getAll();
    }
    onChange = (listItemProduct: ProductDto[], listIdProduct: number[]) => {
        this.setState({ isLoadDone: false });
        if (listItemProduct.length > 0) {
            this.listItemProduct = listItemProduct;
            this.keySelected = listIdProduct;
            if (listIdProduct.length > 0) {
                this.setState({ visibleModalCreateUpdate: false })
            }
        }
        this.setState({ isLoadDone: true, numberSelected: listItemProduct.length });
    }

    deleteMulti = async (listIdProduct: number[]) => {
        if (listIdProduct.length < 1) {
            await message.error(L("Hãy chọn 1 hàng trước khi xóa"));
        }
        else {
            let self = this;
            const { totalProduct } = stores.productStore;
            confirm({
                icon: false,
                title: <span><WarningOutlined style={{ fontSize: "23px", color: "orange" }} /> Bạn có muốn <span style={{ color: "red" }}>xóa hàng loạt</span> {listIdProduct.length} dữ liệu ? Thao tác này khi xác nhận <span style={{ color: "red" }}>không thể hoàn tác</span>.</span>,
                okText: L('Xác nhận'),
                cancelText: L('Hủy'),
                async onOk() {
                    if (self.state.currentPage > 1 && (totalProduct - self.keySelected.length) % 10 == 0) self.onChangePage(self.state.currentPage - 1, self.state.pageSize)
                    await stores.productStore.deleteMulti(listIdProduct);
                    await self.getAll();
                    message.success(L("Xóa thành công" + "!"))
                    self.setState({ isLoadDone: true, numberSelected: 0 });
                },
                onCancel() {
                },
            });
        }
    }
    deleteAll() {
        let self = this;
        let titleConfirm = (
            <div>
                <div style={{ color: "orange", textAlign: "center", fontSize: "23px" }} ><WarningOutlined style={{}} /> Cảnh báo</div> <br />
                <span> Bạn có muốn <span style={{ color: "red" }}>xóa tất cả</span> dữ liệu ? Thao tác này khi xác nhận <span style={{ color: "red" }}>không thể hoàn tác</span>.</span>
            </div>
        )
        let cancelText = (
            <div style={{ color: "red" }}>Hủy</div>
        )
        this.setState({ isLoadDone: false });
        confirm({
            icon: false,
            title: titleConfirm,
            okText: L("Delete"),
            cancelText: cancelText,
            async onOk() {
                await stores.productStore.deleteAll();
                await self.getAll();
                message.success(L("Xóa thành công"));
            },
            onCancel() {

            },
        });
        this.setState({ isLoadDone: true });
    }
    rowSelection: TableRowSelection<ProductDto> = {
        onChange: (listItemProduct: React.Key[], listItem: ProductDto[]) => {
            this.setState({ isLoadDone: false })
            this.listItemProduct = listItem;
            this.keySelected = listItem.map(item => item.pr_id);
            this.setState({ isLoadDone: true, numberSelected: listItem.length })
        }
    }
    onRefreshData = () => {
        this.setState({ visibleModalImport: false });
        this.getAll();
    }

    shouldChangeText = () => {
        const isChangeText = window.innerWidth <= 768;
        return !isChangeText;
    }
    hide = () => {
        this.setState({ clicked: false });
    }
    render() {
        let self = this;
        const { productListResult, totalProduct } = stores.productStore;
        const left = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 12, 14, 14, 14) : cssCol(24);
        const right = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 12, 10, 10, 10) : cssCol(0);
        return (
            <Card>
                <Row gutter={[8, 8]} align='bottom'>
                    <Col {...cssColResponsiveSpan(24, 24, 3, 3, 3, 3)}>
                        <h2>Sản phẩm</h2>
                    </Col>
                    {/* {(isGranted(AppConsts.Permission.Pages_Manager_General_Admin_Product)) && */}
                    <Col {...cssColResponsiveSpan(24, 12, 4, 4, 4, 4)}>
                        <strong>Người sở hữu</strong>
                        <SelectUserMultiple
                            onChangeUser={(e) => {
                                this.setState({ us_id_list: e });
                            }}
                            us_id_list={this.state.us_id_list}
                        ></SelectUserMultiple>
                    </Col>
                    {/* } */}
                    <Col {...cssColResponsiveSpan(24, 12, 5, 5, 5, 5)}>
                        <strong>Tên sản phẩm</strong>
                        <Input allowClear
                            onChange={(e) => this.setState({ pr_name: e.target.value })} placeholder={"Tên sản phẩm..."}
                            onPressEnter={this.handleSubmitSearch}
                            value={this.state.pr_name}
                        />
                    </Col>
                    <Col className='textAlignCenter-col-992' {...cssColResponsiveSpan(24, 12, 6, 6, 6, 6)} style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "start" }} >
                        <Button type="primary" icon={<SearchOutlined />} title="Tìm kiếm" onClick={() => this.handleSubmitSearch()} >Tìm kiếm</Button>
                        {(!!this.state.pr_name || !!this.state.us_id_list) &&
                            <Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >Xóa tìm kiếm</Button>
                        }
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 6, 6, 6, 6)} style={{ display: 'flex', justifyContent: 'right' }}>
                        <Space>
                            {(isGranted(AppConsts.Permission.Pages_Manager_General_Product_Create)) &&
                                <Button title='Thêm mới' type="primary" icon={<PlusOutlined />} onClick={() => this.createOrUpdateModalOpen(new ProductDto())}>{this.shouldChangeText() && 'Thêm mới'}</Button>}
                            {(isGranted(AppConsts.Permission.Pages_Manager_General_Product_Export)) &&
                                <Button title='Xuất dữ liệu' type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcelFreshDrink: true, select: false })}>{this.shouldChangeText() && 'Xuất dữ liệu'}</Button>}
                        </Space>
                    </Col>
                </Row>
                <Row gutter={[8, 8]} align='bottom'>
                    {this.state.visibleModalCreateUpdate == false &&
                        <Col span={24} >
                            <Badge count={this.state.numberSelected}>
                                <Popover style={{ width: "200px" }} visible={this.state.clicked} onVisibleChange={(e) => this.handleVisibleChange(e)} placement="right" content={
                                    <>
                                        {this.keySelected.length > 0 ?
                                            <>
                                                {(isGranted(AppConsts.Permission.Pages_Manager_General_Product_Delete)) &&
                                                    <Row style={{ alignItems: "center", marginTop: "10px" }}>

                                                        <Button
                                                            danger icon={<DeleteFilled />} title={L("Delete")}
                                                            style={{ marginLeft: '10px' }}
                                                            size='small'
                                                            onClick={() => { this.deleteMulti(this.keySelected); this.hide() }}
                                                        ></Button>
                                                        <a style={{ paddingLeft: "10px", color: "red" }} onClick={() => { this.deleteMulti(this.keySelected); this.hide() }}>{L('Xóa hàng loạt')}</a>
                                                    </Row>}
                                            </>
                                            :
                                            <>
                                                {/* {(isGranted(AppConsts.Permission.Pages_Manager_General_Product_Delete)) &&
                                                    <Row style={{ alignItems: "center" }}>
                                                        <Button
                                                            danger icon={<DeleteOutlined />} title={L("xoa_tat_ca")}
                                                            style={{ marginLeft: '10px' }}
                                                            size='small'
                                                            type='primary'
                                                            onClick={() => { this.deleteAll(); this.hide() }}
                                                        ></Button>
                                                        <a style={{ paddingLeft: "10px", color: "red" }} onClick={() => { this.deleteAll(); this.hide() }}>{L('xoa_tat_ca')}</a>
                                                    </Row>} */}
                                            </>
                                        }
                                        {(isGranted(AppConsts.Permission.Pages_Manager_General_Product_Export)) &&
                                            <Row style={{ alignItems: "center", marginTop: "10px" }}>
                                                <Button
                                                    type='primary'
                                                    icon={<ExportOutlined />} title={'Xuất dữ liệu'}
                                                    style={{ marginLeft: '10px' }}
                                                    size='small'
                                                    onClick={async () => {
                                                        if (this.keySelected.length < 1) {
                                                            await message.warning(L("Hãy chọn một hàng muốn xuất dữ liệu"));
                                                        }
                                                        else {
                                                            this.setState({ visibleExportExcelFreshDrink: true, select: true })
                                                        }
                                                    }}
                                                ></Button>
                                                <a style={{ paddingLeft: "10px" }} onClick={async () => {
                                                    if (this.keySelected.length < 1) {
                                                        await message.warning(L("Hãy chọn một hàng muốn xuất dữ liệu"));
                                                    }
                                                    else {
                                                        this.setState({ visibleExportExcelFreshDrink: true, select: true })
                                                    };
                                                }}>Xuất dữ liệu</a>

                                            </Row>
                                        }
                                    </>
                                } trigger={['hover']} >
                                    <Button type='primary'>{L("Thao tác hàng loạt")}</Button>
                                </Popover >
                            </Badge>
                        </Col>
                    }
                </Row>
                <Row>
                    <Col {...left}>
                        <ProductTable
                            rowSelection={this.rowSelection}
                            actionTable={this.actionTable}
                            hasAction={this.keySelected.length > 0 ? false : true}
                            productListResult={productListResult}
                            checkExpand= {this.state.visibleModalCreateUpdate}
                            isLoadDone={this.state.isLoadDone}
                            onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
                            isPrint={false}
                            onCreateUpdateSuccess={this.getAll}
                            pagination={{
                                pageSize: this.state.pageSize,
                                total: totalProduct,
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
                        />
                    </Col>
                    {this.state.visibleModalCreateUpdate &&
                        <Col  {...right}>
                            <CreateOrUpdateProduct
                                layoutDetail={false}
                                productSelected={this.productSelected}
                                onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
                                onCreateUpdateSuccess={this.onCreateUpdateSuccess}
                            />
                        </Col>
                    }
                </Row>
                <ModalExportProduct
                    productListResult={this.state.select ? this.listItemProduct : productListResult}
                    visible={this.state.visibleExportExcelFreshDrink}
                    onCancel={() => this.setState({ visibleExportExcelFreshDrink: false })}
                />
            </Card>
        )
    }
}