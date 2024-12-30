import * as React from 'react';
import { DeleteFilled, DeleteOutlined, ExportOutlined, ImportOutlined, PlusOutlined, SearchOutlined, WarningOutlined } from '@ant-design/icons';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import { ImageProductDto, ProductDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Badge, Button, Card, Col, Input, Modal, Popover, Row, Space, message } from 'antd';
import { L, isGranted } from '@src/lib/abpUtility';
import { SorterResult, TableRowSelection } from 'antd/lib/table/interface';
import ModalExportProduct from './component/ModalExportProduct';
import CreateOrUpdateProduct from './component/CreateOrUpdateProduct';
import ProductTable from './component/ProductTable';
import SelectEnum from '@src/components/Manager/SelectEnum';
import { eSort, eStatusProduct } from '@src/lib/enumconst';
import ImportExcelProductList from './component/ImportExcelProductList';
import debounce from "lodash.debounce";

const { confirm } = Modal;

export default class Product extends React.Component {
    debouncedSearch: () => void;
    constructor(props) {
        super(props);
        this.debouncedSearch = debounce(this.handleSubmitSearch, 500);
    }
    state = {
        isLoadDone: false,
        visibleModalCreateUpdate: false,
        visibleExportExcelFreshDrink: false,
        visibleModalImport: false,
        pr_name: undefined,
        us_id_list: undefined,
        su_id_list: undefined,
        skipCount: 0,
        maxResultCount: 10,
        onChangePage: 1,
        currentPage: 1,
        pageSize: 10,
        clicked: false,
        numberSelected: 0,
        select: false,
        status: undefined,
        sort: undefined,
        visibleImportExcelProduct: undefined,

    };

    productSelected: ProductDto = new ProductDto();
    listItemProduct: ProductDto[] = [];
    keySelected: number[] = [];
    listIdImage: number[] = [];
    selectedField: string;

    async componentDidMount() {
        stores.imageProductStore.getAll(undefined, undefined, undefined,);
        const urlParams = new URLSearchParams(window.location.search);
        const prName = urlParams.get('pr_name');
        if (!!prName) {
            await this.setState({ pr_name: prName });
        }
        await this.getAll();
    }

    async getAll() {
        this.setState({ isLoadDone: false });
        await stores.productStore.getAll(this.state.pr_name, this.state.status, this.state.su_id_list, this.selectedField, this.state.sort, this.state.skipCount, this.state.pageSize);
        this.setState({ isLoadDone: true });
    }

    handleSubmitSearch = async () => {
        this.onChangePage(1, this.state.pageSize);
    }
    handleVisibleChange = (visible) => {
        this.setState({ clicked: visible });
    }
    onChangePage = async (page: number, pagesize?: number) => {
        const { productListResult, totalProduct } = stores.productStore;
        if (pagesize === undefined || isNaN(pagesize)) {
            pagesize = productListResult.length;
            page = 1;
        }
        await this.setState({ pageSize: pagesize! });
        await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            this.getAll();
        });
    }

    createOrUpdateModalOpen = async (input: ProductDto) => {
        if (input !== undefined && input !== null) {
            this.productSelected.init(input);
            await this.setState({ visibleModalCreateUpdate: true, isLoadDone: true });
        }
    }
    actionTable = async (product: ProductDto, event: EventTable) => {
        const { imageProductListResult } = stores.imageProductStore
        let self = this;
        if (product === undefined || product.pr_id === undefined) {
            message.error("Không tìm thấy !");
            return;
        }
        else if (isGranted(AppConsts.Permission.Pages_Manager_General_Product_Update) && event === EventTable.Edit) {
            this.setState({ isLoadDone: false });
            this.productSelected.init(product);
            await this.setState({ visibleModalCreateUpdate: true, isLoadDone: true });
        }
        else if (event === EventTable.Delete) {
            this.productSelected.init(product);
            let title = <div>Bạn có chắc muốn xóa sản phẩm: <strong>{product.pr_name}</strong>.</div>
            let cancelText = (
                <div style={{ color: "red" }}>Hủy</div>
            )
            let okText = (
                <strong>Xác nhận</strong>
            )
            confirm({
                title: title,
                okText: okText,
                cancelText: cancelText,
                async onOk() {
                    await stores.productStore.delete(product);
                    let imageProduct: ImageProductDto = imageProductListResult.filter(item => item.im_pr_name?.split("_")[0] == self.productSelected.fi_id.key!.split("_")[0])[0];
                    if (imageProduct) {
                        await stores.imageProductStore.deleteImageProduct(imageProduct.im_pr_id!);
                    }
                    await self.getAll();
                    message.success("Xóa thành công !")
                    self.setState({ isLoadDone: true });
                },
                onCancel() {
                },
            });
        }
    };
    changeColumnSort = async (sort: SorterResult<ProductDto> | SorterResult<ProductDto>[]) => {
        this.setState({ isLoadDone: false });
        this.selectedField = sort["field"];
        await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
        await this.getAll();
        this.setState({ isLoadDone: true });

    }
    onUpdateSuccess = () => {
        this.setState({ isLoadDone: false });
        this.getAll();
        this.setState({ isLoadDone: true, })
    }
    clearSearch = async () => {
        await this.setState({
            pr_name: undefined,
            us_id_list: undefined,
            su_id_list: undefined,
            status: undefined,
        })
        this.handleSubmitSearch();
    }
    onChange = (listItemProduct: ProductDto[], listIdProduct: number[]) => {
        this.setState({ isLoadDone: false });
        if (listItemProduct.length > 0) {
            this.listItemProduct = listItemProduct;
            this.keySelected = listIdProduct;
            this.listIdImage = listItemProduct.map(item => item.fi_id.id!);
            if (listIdProduct.length > 0) {
                this.setState({ visibleModalCreateUpdate: false })
            }
        }
        this.setState({ isLoadDone: true, numberSelected: listItemProduct.length });
    }

    deleteMulti = async (listIdProduct: number[], listIdImage: number[]) => {
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
                    await stores.imageProductStore.deleteMultiImageProduct(listIdImage!);
                    await self.getAll();
                    self.keySelected = [];
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
            okText: L("Xác nhận"),
            cancelText: cancelText,
            async onOk() {
                await stores.productStore.deleteAll();
                await stores.imageProductStore.deleteAll();
                await self.getAll();
                message.success(L("Xóa thành công"));
            },
            onCancel() {

            },
        });
        this.setState({ isLoadDone: true });
    }
    rowSelection: TableRowSelection<ProductDto> = {
        onChange: async (_listItemProduct: React.Key[], listItem: ProductDto[]) => {
            this.setState({ isLoadDone: false })
            this.listItemProduct = listItem;

            this.keySelected = listItem.map(item => item.pr_id);
            await this.setState({ select: !!this.listItemProduct.length })
            this.setState({ isLoadDone: true, numberSelected: listItem.length })
        }
    }
    onRefreshData = () => {
        this.setState({ visibleModalImport: false });
        this.getAll();
    }
    shouldChangeText3BtnData1 = () => {
        const isChangeText = window.innerWidth > 955 && window.innerWidth <= 1222;
        return !!isChangeText;
    }
    shouldChangeText3BtnData2 = () => {
        const isChangeText = window.innerWidth <= 576 || window.innerWidth >= 768 && window.innerWidth <= 955;
        return !!isChangeText;
    }
    shouldChangeText = () => {
        const isChangeText = window.innerWidth <= 768;
        return !isChangeText;
    }
    hide = () => {
        this.setState({ clicked: false });
    }

    searchProductName = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ pr_name: e.target.value })
        this.debouncedSearch();
    }
    render() {
        let self = this;
        const { productListResult, totalProduct } = stores.productStore;
        const left = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 12, 14, 14, 14) : cssCol(24);
        const right = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 12, 10, 10, 10) : cssCol(0);

        return (
            <Card>
                <Row gutter={[8, 8]} align='bottom'>
                    <Col {...cssColResponsiveSpan(24, 24, 12, 12, 12, 3)} order={1}>
                        <h2>Sản phẩm</h2>
                    </Col>
                    <Col
                        xs={{ span: 24, order: 3 }}
                        sm={{ span: 12, order: 3 }}
                        md={{ span: 12, order: 3 }}
                        lg={{ span: 6, order: 3 }}
                        xl={{ span: 6, order: 3 }}
                        xxl={{ span: 4, order: 2 }}
                    >
                        <strong>Tên sản phẩm</strong>
                        <Input allowClear
                            onChange={this.searchProductName}
                            placeholder={"Tên sản phẩm..."}
                            onPressEnter={this.handleSubmitSearch}
                            value={this.state.pr_name}
                        />
                    </Col>
                    <Col
                        xs={{ span: 24, order: 4 }}
                        sm={{ span: 12, order: 4 }}
                        md={{ span: 12, order: 4 }}
                        lg={{ span: 6, order: 4 }}
                        xl={{ span: 6, order: 4 }}
                        xxl={{ span: 4, order: 3 }}
                    >
                        <strong>Trạng thái sản phẩm</strong>
                        <SelectEnum enum_value={this.state.status} eNum={eStatusProduct} onChangeEnum={async (e) => { await this.setState({ status: e }); await this.handleSubmitSearch() }} />
                    </Col>
                    <Col className='textAlignCenter-col-992' {...cssColResponsiveSpan(24, 12, 6, 6, 6, 5)}
                        xs={{ span: 24, order: 5 }}
                        sm={{ span: 24, order: 5 }}
                        md={{ span: 24, order: 5 }}
                        lg={{ span: 6, order: 5 }}
                        xl={{ span: 6, order: 5 }}
                        xxl={{ span: 5, order: 4 }}
                        style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "start" }} >
                        <Button type="primary" icon={<SearchOutlined />} title="Tìm kiếm" onClick={() => this.handleSubmitSearch()} >Tìm kiếm</Button>
                        {(!!this.state.pr_name || !!this.state.us_id_list || this.state.status != undefined || this.state.su_id_list != undefined) &&
                            <Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >Xóa tìm kiếm</Button>
                        }
                    </Col>
                    <Col
                        xs={{ span: 24, order: 2 }}
                        sm={{ span: 24, order: 2 }}
                        md={{ span: 12, order: 2 }}
                        lg={{ span: 12, order: 2 }}
                        xl={{ span: 12, order: 2 }}
                        xxl={{ span: 8, order: 5 }}
                        style={{ textAlign: 'right' }}>
                        <Space>
                            {(isGranted(AppConsts.Permission.Pages_Manager_General_Product_Create)) &&
                                <Button title='Thêm mới' type="primary" icon={<PlusOutlined />} onClick={() => this.createOrUpdateModalOpen(new ProductDto())}>{this.shouldChangeText() && 'Thêm mới'}</Button>
                            }
                            {(isGranted(AppConsts.Permission.Pages_Manager_General_Product_Export)) &&
                                <Button title='Xuất dữ liệu' type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcelFreshDrink: true, select: false })}>{this.shouldChangeText() && 'Xuất dữ liệu'}</Button>
                            }
                            {(isGranted(AppConsts.Permission.Pages_Manager_General_Product_Import)) &&
                                <Button type="primary" title='Nhập dữ liệu' icon={<ImportOutlined />} onClick={() => this.setState({ visibleImportExcelProduct: true })}>{this.shouldChangeText3BtnData1() ? 'Nhập' : (this.shouldChangeText3BtnData2() ? '' : 'Nhập dữ liệu')}</Button>
                            }
                        </Space>
                    </Col>
                </Row>
                <Row gutter={[8, 8]} align='bottom'>
                    {this.state.visibleModalCreateUpdate == false &&
                        <>
                            <Col span={12} >
                                <Badge count={this.state.numberSelected}>
                                    <Popover style={{ width: 200 }} visible={this.state.clicked} onVisibleChange={(e) => this.handleVisibleChange(e)} placement="right" content={
                                        <>
                                            {this.keySelected.length > 0 ?
                                                <>
                                                    {(isGranted(AppConsts.Permission.Pages_Manager_General_Product_Delete)) &&
                                                        <Row style={{ alignItems: "center", marginTop: "10px" }}>

                                                            <Button
                                                                danger icon={<DeleteFilled />} title={L("Delete")}
                                                                style={{ marginLeft: '10px' }}
                                                                size='small'
                                                                onClick={() => { this.deleteMulti(this.keySelected, this.listIdImage); this.hide() }}
                                                            ></Button>
                                                            <a style={{ paddingLeft: "10px", color: "red" }} onClick={() => { this.deleteMulti(this.keySelected, this.listIdImage); this.hide() }}>{L('Xóa hàng loạt')}</a>
                                                        </Row>}
                                                </>
                                                :
                                                <>
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
                                                                await this.setState({ select: true, visibleExportExcelFreshDrink: true })
                                                            }
                                                        }}
                                                    ></Button>
                                                    <a style={{ paddingLeft: "10px" }} onClick={async () => {
                                                        if (this.keySelected.length < 1) {
                                                            await message.warning(L("Hãy chọn một hàng muốn xuất dữ liệu"));
                                                        }
                                                        else {

                                                            await this.setState({ select: true, visibleExportExcelFreshDrink: true })
                                                        };

                                                    }}>{L('Xuất dữ liệu')}</a>

                                                </Row>
                                            }
                                            {(isGranted(AppConsts.Permission.Pages_Manager_General_Product_Delete) && this.keySelected.length < 1) &&
                                                <Row style={{ alignItems: "center", marginTop: "10px" }}>
                                                    <Button
                                                        type='primary'
                                                        danger
                                                        icon={<DeleteOutlined />} title={'Xoá tất cả'}
                                                        style={{ marginLeft: '10px' }}
                                                        size='small'
                                                        onClick={async () => {
                                                            await this.deleteAll();
                                                        }}
                                                    ></Button>
                                                    <a style={{ paddingLeft: "10px", color: "red" }} onClick={async () => {
                                                        await this.deleteAll();
                                                    }}>{L('Xoá tất cả')}</a>

                                                </Row>
                                            }
                                        </>
                                    } trigger={['hover']} >
                                        <Button type='primary'>Thao tác hàng loạt</Button>
                                    </Popover >
                                </Badge>
                            </Col>
                        </>
                    }
                </Row>
                <Row>
                    <Col {...left}>
                        <ProductTable
                            rowSelection={this.rowSelection}
                            actionTable={this.actionTable}
                            changeColumnSort={this.changeColumnSort}
                            hasAction={this.keySelected.length > 0 ? false : true}
                            productListResult={productListResult}
                            checkExpand={this.state.visibleModalCreateUpdate}
                            isLoadDone={this.state.isLoadDone}
                            formatImage={false}
                            onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
                            isPrint={false}
                            onUpdateSuccess={() => { this.onUpdateSuccess(); this.setState({ visibleModalCreateUpdate: false }) }}
                            pagination={{
                                position: ['topRight'],
                                pageSize: this.state.pageSize,
                                total: totalProduct,
                                current: this.state.currentPage,
                                showTotal: (tot) => ("Tổng: ") + tot + "",
                                showQuickJumper: true,
                                showSizeChanger: true,
                                pageSizeOptions: pageSizeOptions,
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
                                productListResult={productListResult}
                                layoutDetail={false}
                                productSelected={this.productSelected}
                                onCancel={() => { this.setState({ visibleModalCreateUpdate: false }); this.getAll(); }}
                                onCreateUpdateSuccess={() => {
                                    this.handleSubmitSearch();
                                    this.setState({ visibleModalCreateUpdate: false })
                                }}
                            />
                        </Col>
                    }
                </Row>
                {this.state.visibleExportExcelFreshDrink &&
                    <ModalExportProduct
                        productListResult={this.state.select ? this.listItemProduct : productListResult}
                        visible={this.state.visibleExportExcelFreshDrink}
                        onCancel={() => this.setState({ visibleExportExcelFreshDrink: false })}
                    />
                }
                <Modal
                    centered
                    visible={this.state.visibleImportExcelProduct}
                    closable={true}
                    maskClosable={false}
                    onCancel={() => { this.setState({ visibleImportExcelProduct: false }); }}
                    footer={null}
                    width={"60vw"}
                    title={<strong>NHẬP DỮ LIỆU SẢN PHẨM</strong>}
                >
                    <ImportExcelProductList
                        onRefreshData={this.onRefreshData}
                        onCancel={() => this.setState({ visibleImportExcelProduct: false })}
                    />
                </Modal>
            </Card>
        )
    }
}