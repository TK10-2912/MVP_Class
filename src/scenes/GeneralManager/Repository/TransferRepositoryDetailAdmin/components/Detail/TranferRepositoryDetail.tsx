import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { AttachmentItem, TranferRepositoryDto, ProductTranferDto } from '@src/services/services_autogen';
import { Button, Col, Row, Space, message } from 'antd';
import * as React from 'react';
import { ArrowLeftOutlined, ImportOutlined, PlusOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';
import { stores } from '@src/stores/storeInitializer';
import SelectedProductImportRepository from '@src/components/Manager/SelectedProductImportRepository';
import TableTranferRepositoryDetailAdmin from './TableTranferRepositoryDetailAdmin';
import CreateOrUpdateTranferRepositoryAdmin from './CreateOrUpdateTranferRepository';
import ImportProductRepositoryAdmin from './ImportExcelProductRepository';

export interface IProps {
    isVisible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    actionTable?: (item: TranferRepositoryDto, event: EventTable) => void;
    tranferRepositorySelected?: TranferRepositoryDto,

}
export default class TranferRepositoryDetailAdmin extends AppComponentBase<IProps> {
    formRef: React.RefObject<FormInstance> = React.createRef();
    state = {
        isLoadDone: true,
        im_re_id: undefined,
        su_id: undefined,
        isVisibleCreateModal: false,
        isVisibleImportExcelModal: false,
        saveType: 0,
        loadTable: false,
        listProduct: [] as ProductTranferDto[],
        pr_id: undefined,
    }
    listAttachmentItem_file: AttachmentItem[] = [];
    index = 1;
    async componentDidMount() {
        const { tranferRepositorySelected } = this.props;
        this.setState({ isLoadDone: !this.state.isLoadDone })
        await stores.repositoryStore.getAllByAdmin([stores.sessionStore.getUserLogin().id], undefined, undefined, undefined, undefined);
        if (!!tranferRepositorySelected) {
            this.setState({ listProduct: tranferRepositorySelected.listProductTranfer })
        }
        this.setState({ isLoadDone: !this.state.isLoadDone })
    }
    onCancel = () => {
        if (!!this.props.onCancel) {
            this.props.onCancel();
        }
    }
    onSuccess = async () => {
        if (!!this.props.onSuccess) {
            this.props.onSuccess();
        }

    }
    onChangeSelectProduct = async (pr_id: number) => {
        await this.setState({ pr_id: pr_id });
        
        const { productListResult } = stores.productStore;
        const { repositoryListResult } = stores.repositoryStore;
        const product = productListResult.find(item => item.pr_id === pr_id);
        this.setState({ listProduct: this.state.listProduct == undefined ? [] : this.state.listProduct })
        const check = this.state.listProduct.some(item => item.pr_tr_name == stores.sessionStore.getNameProduct(pr_id))
        if (product && check == false) {
            const productInput: ProductTranferDto = new ProductTranferDto();
            productInput.pr_remain_in_repository = repositoryListResult
                .map((item) =>
                    item.repositoryDetails?.find(i => i.pr_id === product.pr_id)?.pr_quantity_quydoi || 0
                )
                .reduce((total, quantity) => total + quantity, 0);
            productInput.fi_id = product.fi_id;
            productInput.pr_tr_name = product.pr_name;
            productInput.pr_tr_quantity = 1;
            productInput.pr_tr_unit = 'Cái';
            // productInput.pr_tr_quantity_quydoi = 1;
            // productInput.pr_tr_unit_quydoi = product.pr_unit;
            productInput.pr_tr_code = stores.sessionStore.getCodeProductUseName(product.pr_name!);
            productInput.pr_tr_unit_price = product.pr_price;
            productInput.pr_tr_total_money = product.pr_price * productInput.pr_tr_quantity;

            const updatedListProduct = [...this.state.listProduct, productInput];
            this.setState({
                listProduct: updatedListProduct,
                loadTable: !this.state.loadTable,
            });
        } else {
            const { listProduct } = this.state;
            const productIndex = this.state.listProduct.findIndex(product => product.pr_tr_name === stores.sessionStore.getNameProduct(pr_id));
            if (productIndex !== -1) {
                const updatedProducts = [...listProduct];
                updatedProducts[productIndex].pr_tr_quantity = updatedProducts[productIndex].pr_tr_quantity + 1;
                updatedProducts[productIndex].pr_tr_total_money = updatedProducts[productIndex].pr_tr_quantity * updatedProducts[productIndex].pr_tr_unit_price;
                this.setState({ listProduct: updatedProducts });
            }
        }
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }
    actionTable = async (productImport: ProductTranferDto, event: EventTable) => {
        if (event == EventTable.Delete) {
            const listFilter = this.state.listProduct.filter(item => item.pr_tr_name != productImport.pr_tr_name);
            this.setState({ listProduct: listFilter })
        }
    };
    onChangeTranferRepositoryNumberFieldToCreate = (item: ProductTranferDto, value: number, field: string) => {
        this.setState({ isLoadDone: false });
        const { listProduct } = this.state;
        const productIndex = listProduct.findIndex(product => product.pr_tr_name === item.pr_tr_name);
        if (productIndex !== -1) {
            const updatedProducts = [...listProduct];
            if (field == "pr_tr_quantity") {
                updatedProducts[productIndex].pr_tr_quantity = value
            }
            else if (field == "pr_tr_unit_price") {
                updatedProducts[productIndex].pr_tr_unit_price = value;
            }
            // else if (field == "pr_tr_quantity_quydoi") {
            //     // updatedProducts[productIndex].pr_tr_quantity_quydoi = value;
            // }
            else if (field == "pr_tr_total_money") {
                updatedProducts[productIndex].pr_tr_total_money = value;
            }
            updatedProducts[productIndex].pr_tr_total_money = updatedProducts[productIndex].pr_tr_quantity * updatedProducts[productIndex].pr_tr_unit_price;
            this.setState({ listProduct: updatedProducts });
        }
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }
    onChangeTranferRepositoryStringFieldToCreate = (item: ProductTranferDto, value: string,) => {
        const { listProduct } = this.state;
        const productIndex = this.state.listProduct.findIndex(product => product.pr_tr_name === item.pr_tr_name);
        if (productIndex !== -1) {
            const updatedProducts = [...listProduct];
            updatedProducts[productIndex].pr_tr_unit = value;
            this.setState({ listProduct: updatedProducts });
        }
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }
    onSuccessImport = (input: ProductTranferDto[]) => {
        const { listProduct } = this.state;
        const updatedProducts = listProduct != undefined ? [...listProduct] : [];
        input.forEach(newProduct => {
            const existingProductIndex = updatedProducts.findIndex(item => item.pr_tr_name === newProduct.pr_tr_name);
            if (existingProductIndex !== -1) {
                updatedProducts[existingProductIndex].pr_tr_quantity += newProduct.pr_tr_quantity;
            } else {
                updatedProducts.push(newProduct);
            }
        });

        this.setState({ listProduct: updatedProducts, isLoadDone: !this.state.isLoadDone, isVisibleImportExcelModal: false })
    }
    render() {
        return (
            <>
                <Row gutter={16}>
                    <Col span={16}>
                        <Row>
                            <Col span={8}>
                                <Row>
                                    <Col><Button icon={<ArrowLeftOutlined />} type='text' title='Trở về' onClick={() => this.props.onCancel()}></Button></Col>
                                    <Col><h2>Cấp phát kho</h2></Col>
                                </Row>
                            </Col>
                            <Col span={12}>
                                {/* <SelectedProductImportRepository productId={this.state.pr_id} onChangeProduct={async (value) => {
                                    (value != undefined) && await this.onChangeSelectProduct(value);
                                }} /> */}
                            </Col>
                            <Col span={4} style={{ textAlign: 'right' }}>
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
                        <TableTranferRepositoryDetailAdmin
                            actionTable={this.actionTable}
                            loadTable={this.state.loadTable}
                            openImportExcelProduct={() => this.setState({ isVisibleImportExcelModal: true })}
                            listProductResult={this.state.listProduct}
                            pagination={false}
                            hasAction={true}
                            edit={true}
                            checkChangeQuantity={true}
                            onChangeTranferRepositoryNumberFieldToCreate={this.onChangeTranferRepositoryNumberFieldToCreate}
                            onChangeTranferRepositoryStringFieldToCreate={this.onChangeTranferRepositoryStringFieldToCreate}
                        />
                    </Col>
                    <Col span={8} >
                        <CreateOrUpdateTranferRepositoryAdmin
                            onSuccess={this.onSuccess}
                            transferRepositorySelected={this.props.tranferRepositorySelected}
                            onCancel={this.onCancel}
                            listProductTranfer={this.state.listProduct}
                        />
                    </Col>
                    <ImportProductRepositoryAdmin
                        isVisible={this.state.isVisibleImportExcelModal}
                        onCancel={() => this.setState({ isVisibleImportExcelModal: false })}
                        onSuccessImport={this.onSuccessImport}
                    />
                </Row >

            </>
        )
    }
}
