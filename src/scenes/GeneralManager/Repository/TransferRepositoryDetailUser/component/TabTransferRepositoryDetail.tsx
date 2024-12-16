import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { EventTable } from '@src/lib/appconst';
import { AttachmentItem, TranferRepositoryDto, ProductTranferDto, RepositoryDto, CreateTranferRepositoryInput, UpdateTranferRepositoryInput } from '@src/services/services_autogen';
import { Button, Col, message, Row, Space, } from 'antd';
import * as React from 'react';
import { ArrowLeftOutlined, ImportOutlined, PlusOutlined, } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';
import SelectedProductTransferRepository from '@src/components/Manager/SelectedProductTransferRepository';
import { stores } from '@src/stores/storeInitializer';
import ImportListTransferRepositoryDetail from './ImportListTransferRepositoryDetail';
import TableImportTranferRepositoryUser from './TableImportTranferRepositoryDetail';
import { eTranferRepositoryStatus } from '@src/lib/enumconst';
import CreateTransferRepositoryDetail from './CreateTransferRepositoryDetail';

export interface IProps {
    isVisible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    actionTable?: (item: TranferRepositoryDto, event: EventTable) => void;
    tranferRepositoryDetailSelected?: TranferRepositoryDto,
}
export default class TabTransferRepositoryDetail extends AppComponentBase<IProps> {
    formRef: React.RefObject<FormInstance> = React.createRef();
    state = {
        isLoadDone: true,
        tr_re_id: undefined,
        su_id: undefined,
        re_id: undefined,
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
        const { tranferRepositoryDetailSelected } = this.props;
        this.setState({ isLoadDone: !this.state.isLoadDone })
        await Promise.all([
            stores.productStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined, undefined),
            stores.repositoryStore.getAllByAdmin(undefined, undefined, undefined, undefined, undefined)
        ]);
        if (!!tranferRepositoryDetailSelected) {
            this.setState({ listProduct: tranferRepositoryDetailSelected.listProductTranfer })
        }
        await this.setState({ isLoadDone: !this.state.isLoadDone })
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
        this.setState({ isLoadDone: false });
        const { productListResult } = stores.productStore;
        const product = productListResult.find(item => item.pr_id === pr_id);
        this.setState({ listProduct: this.state.listProduct == undefined ? [] : this.state.listProduct })
        const check = this.state.listProduct.some(item => item.pr_tr_name == stores.sessionStore.getNameProduct(pr_id))
        if (product && check == false) {
            const productInput: ProductTranferDto = new ProductTranferDto();
            productInput.fi_id = product.fi_id;
            productInput.pr_tr_name = product.pr_name;
            productInput.pr_tr_quantity = 1;
            productInput.pr_tr_unit = 'Thùng';
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
    // onCreateUpdate = async () => {
    //     const { tranferRepositoryDetailSelected } = this.props;
    //     const { listProduct } = this.state;
    //     this.setState({ isLoadDone: false });
    //     const form = this.formRef.current;
    //     if (tranferRepositoryDetailSelected?.tr_re_id === undefined || tranferRepositoryDetailSelected.tr_re_id < 0) {
    //         let unitData = new CreateTranferRepositoryInput();
    //         unitData.listProductTranfer = listProduct;
    //         unitData.tr_re_status = eTranferRepositoryStatus.TEMPORARY.num;
    //         unitData.us_id_receiver = stores.sessionStore.getUserLogin().id;
    //         await stores.transferRepositoryStore.createTranferRepository(unitData);
    //         this.onSuccess();
    //         await this.onCancel();
    //         message.success("Thêm mới thành công!");
    //     }
    //     else {
    //         let unitData = new UpdateTranferRepositoryInput();
    //         unitData.tr_re_id = tranferRepositoryDetailSelected.tr_re_id;
    //         unitData.fi_id_list = tranferRepositoryDetailSelected.fi_id_list;
    //         unitData.listProductTranfer = listProduct;
    //         unitData.tr_re_status = eTranferRepositoryStatus.TEMPORARY.num;
    //         await stores.transferRepositoryStore.updateTranferRepository(unitData);
    //         this.onSuccess();
    //         message.success("Cập nhật thành công!");

    //     }
    //     await stores.sessionStore.getCurrentLoginInformations();
    //     this.setState({ isLoadDone: true });

    // };
    onChangeTransferRepositoryNumberFieldToCreate = (item: ProductTranferDto, value: number, field: string) => {
        
        const { listProduct } = this.state;
        const productIndex = this.state.listProduct.findIndex(product => product.pr_tr_name === item.pr_tr_name);
        if (productIndex !== -1) {
            const updatedProducts = [...listProduct];

            if (field == "pr_tr_unit_price") {
                updatedProducts[productIndex].pr_tr_unit_price = value;
            }
            else if (field == "pr_tr_quantity") {
                updatedProducts[productIndex].pr_tr_quantity = value;
            }
            else if (field == "pr_tr_total_money") {
                updatedProducts[productIndex].pr_tr_total_money = value;
            }
            updatedProducts[productIndex].pr_tr_total_money = updatedProducts[productIndex].pr_tr_quantity * updatedProducts[productIndex].pr_tr_unit_price;
            this.setState({ listProduct: updatedProducts });
        }
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }
    onChangeTransferRepositoryStringFieldToCreate = (item: ProductTranferDto, value: string,) => {
        
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
    onChangeRepository = async (re_id: number) => {
        await this.setState({ re_id: re_id, isLoadDone: !this.state.isLoadDone });
    }
    render() {

        return (
            <>
                <Row gutter={16}>
                    <Col span={16}>
                        <Row>
                            <Col span={8}>
                                <Row>
                                    <Col><Button icon={<ArrowLeftOutlined />} type='text' title='Trở về' onClick={this.onCancel}></Button></Col>
                                    <Col><h2>Tạo cấp phát kho</h2></Col>
                                </Row>
                            </Col>
                            <Col span={12}>
                                {/* <SelectedProductRepository productId={this.state.pr_id} re_id={this.state.re_id} us_id={stores.sessionStore.getUserLogin().id!}
                                    onChangeProduct={async (value) => {
                                        (value != undefined) && await this.onChangeSelectProduct(value);
                                    }} /> */}

                                <SelectedProductTransferRepository productId={this.state.pr_id} onChangeProduct={async (value) => {
                                    (value != undefined) && await this.onChangeSelectProduct(value);
                                }} />
                            </Col>
                            
                        </Row>
                        <TableImportTranferRepositoryUser
                            actionTable={this.actionTable}
                            loadTable={this.state.loadTable}
                            openImportExcelProduct={() => this.setState({ isVisibleImportExcelModal: true })}
                            listProductResult={this.state.listProduct}
                            pagination={false}
                            hasAction={true}
                            edit={true}
                            checkChangeQuantity={true}
                            onChangeTransferRepositoryNumberFieldToCreate={this.onChangeTransferRepositoryNumberFieldToCreate}
                            onChangeTransferRepositoryStringFieldToCreate={this.onChangeTransferRepositoryStringFieldToCreate}
                        />
                    </Col>
                    <Col span={8} >
                        <CreateTransferRepositoryDetail 
                        onChangeRepository={(value) => this.onChangeRepository(value)} 
                        onSuccess={this.onSuccess} 
                        transferRepositoryDetailSelected={this.props.tranferRepositoryDetailSelected} 
                        onCancel={this.onCancel} listProductTransfer={this.state.listProduct} />
                    </Col>
                    <ImportListTransferRepositoryDetail
                        isVisible={this.state.isVisibleImportExcelModal}
                        onCancel={() => this.setState({ isVisibleImportExcelModal: false })}
                        onSuccessImport={this.onSuccessImport}
                    />
                </Row >

            </>
        )
    }
}
