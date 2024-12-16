import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { EventTable } from '@src/lib/appconst';
import { AttachmentItem, ImportRepositoryDto, ProductImportDto } from '@src/services/services_autogen';
import { Button, Col, Row, Space, message } from 'antd';
import { TablePaginationConfig } from 'antd/lib/table';
import * as React from 'react';
import { ArrowLeftOutlined, ImportOutlined, PlusOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';
import SelectedProductImportRepository from '@src/components/Manager/SelectedProductImportRepository';
import CreateOrUpdateImportsitoryAdmin from './CreateOrUpdateImportRepository';
import TableImportRepositoryDetailAdmin from './TableImportRepositoryDetail';
import { stores } from '@src/stores/storeInitializer';
import ImportProductRepository from './ImportExcelProductRepository';

export interface IProps {
    isVisible: boolean;
    onCancel: () => void;
    actionTable?: (item: ImportRepositoryDto, event: EventTable) => void;
    importRepostitorySelected?: ImportRepositoryDto,
}
export default class ImportRepositoryDetailAdmin extends AppComponentBase<IProps> {
    formRef: React.RefObject<FormInstance> = React.createRef();
    state = {
        isLoadDone: true,
        im_re_id: undefined,
        su_id: undefined,
        isVisibleCreateModal: false,
        isVisibleImportExcelModal: false,
        saveType: 0,
        loadTable: false,
        listProduct: [] as ProductImportDto[],
        pr_id: undefined,
    }
    listAttachmentItem_file: AttachmentItem[] = [];
    index = 1;
    listProduct: ProductImportDto[] = [];
    async componentDidMount() {
        this.setState({ isLoadDone: !this.state.isLoadDone })
        await stores.productStore.getAllByAdmin(undefined, undefined, undefined, undefined);
        this.setState({ isLoadDone: !this.state.isLoadDone })
    }
    onCancel = () => {
        if (!!this.props.onCancel) {
            this.props.onCancel();
        }
    }
    onChangeSelectProduct = async (pr_id: number) => {
        await this.setState({ pr_id: pr_id });
        this.setState({ isLoadDone: false });
        const { productListResult } = stores.productStore;
        const product = productListResult.find(item => item.pr_id === pr_id);
        const check = this.state.listProduct.some(item => item.pr_im_name == stores.sessionStore.getNameProduct(pr_id))
        if (product && check == false) {
            const productInput: ProductImportDto = new ProductImportDto();
            productInput.fi_id = product.fi_id;
            productInput.pr_im_name = product.pr_name;
            productInput.pr_im_quantity = 1;
            productInput.pr_im_unit = product.pr_unit;
            productInput.pr_im_unit_price = product.pr_price;
            productInput.pr_im_total_money = product.pr_price + productInput.pr_im_quantity;

            const updatedListProduct = [...this.state.listProduct, productInput];
            this.setState({
                listProduct: updatedListProduct,
                loadTable: !this.state.loadTable,
                isLoadDone: true
            });
        } else {
            const { listProduct } = this.state;
            const productIndex = this.state.listProduct.findIndex(product => product.pr_im_name === stores.sessionStore.getNameProduct(pr_id));
            if (productIndex !== -1) {
                const updatedProducts = [...listProduct];
                updatedProducts[productIndex].pr_im_quantity = updatedProducts[productIndex].pr_im_quantity + 1;
                updatedProducts[productIndex].pr_im_total_money = updatedProducts[productIndex].pr_im_quantity * updatedProducts[productIndex].pr_im_unit_price;
                this.setState({ listProduct: updatedProducts });
            }
        }
        this.setState({ isLoadDone: true });
    }
    actionTable = async (productImport: ProductImportDto, event: EventTable) => {
        if (event == EventTable.Delete) {
            const listFilter = this.state.listProduct.filter(item => item.pr_im_name != productImport.pr_im_name);
            this.setState({ listProduct: listFilter })
        }
    };
    onChangeQuantity = (item: ProductImportDto, value: number) => {
        this.setState({ isLoadDone: false });
        const { listProduct } = this.state;
        const productIndex = this.state.listProduct.findIndex(product => product.pr_im_name === item.pr_im_name);
        if (productIndex !== -1) {
            const updatedProducts = [...listProduct];
            updatedProducts[productIndex].pr_im_quantity = value;
            updatedProducts[productIndex].pr_im_total_money = updatedProducts[productIndex].pr_im_quantity * updatedProducts[productIndex].pr_im_unit_price;
            this.setState({ listProduct: updatedProducts });
        }
        this.setState({ isLoadDone: true });
    }
    onSuccessImport=(input: ProductImportDto[])=>{
        this.setState({isLoadDone: false});
        this.setState({listProduct:input,isLoadDone: true,isVisibleImportExcelModal: false})
    }
    render() {
        const height = window.innerHeight;
        return (
            <>
                <Row gutter={16}>
                    <Col span={16}>
                        <Row>
                            <Col span={8}>
                                <Row>
                                    <Col><Button icon={<ArrowLeftOutlined />} type='text' title='Trở về' onClick={() => this.props.onCancel()}></Button></Col>
                                    <Col><h2>Nhập kho lưu trữ</h2></Col>
                                </Row>
                            </Col>
                            <Col span={8}>
                                <SelectedProductImportRepository productId={this.state.pr_id} onChangeProduct={async (value) => {
                                    (value != undefined) && await this.onChangeSelectProduct(value);
                                }} />
                            </Col>
                            <Col span={8} style={{ textAlign: 'right' }}>
                                <Space>
                                    <Button
                                        title='Nhập sản phẩm'
                                        icon={<ImportOutlined />}
                                        type='primary'
                                        onClick={() => this.setState({ isVisibleImportExcelModal: true })}
                                    >
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                        <TableImportRepositoryDetailAdmin
                            actionTable={this.actionTable}
                            loadTable={this.state.loadTable}
                            openImportExcelProduct ={()=> this.setState({isVisibleImportExcelModal: true})}
                            listProductResult={this.state.listProduct}
                            pagination={false}
                            hasAction={true}
                            checkChangeQuantity={true}
                            onChangeQuantity={this.onChangeQuantity}
                        />
                    </Col>
                    <Col span={8} >
                        <CreateOrUpdateImportsitoryAdmin onCancel={this.onCancel} detailImportRepository={false} listProductImport={this.state.listProduct} />
                    </Col>
                    <ImportProductRepository
                    isVisible={this.state.isVisibleImportExcelModal}
                    onCancel={() => this.setState({ isVisibleImportExcelModal: false })}
                    onSuccessImport={this.onSuccessImport}
                />
                </Row >
             
            </>
        )
    }
}
