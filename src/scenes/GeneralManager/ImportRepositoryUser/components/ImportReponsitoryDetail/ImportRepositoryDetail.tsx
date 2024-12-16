import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { AttachmentItem, CreateImportRepositoryInput, ImportRepositoryDto, ProductImportDto, UpdateImportRepositoryInput } from '@src/services/services_autogen';
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
import TableImportRepositoryDetailUser from './TableImportRepositoryDetail';
import { eStatusImportRepository } from '@src/lib/enumconst';
import moment from 'moment';

export interface IProps {
    isVisible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    actionTable?: (item: ImportRepositoryDto, event: EventTable) => void;
    importRepostitorySelected?: ImportRepositoryDto,

}
export default class ImportRepositoryDetailUser extends AppComponentBase<IProps> {
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
    async componentDidMount() {
        const { importRepostitorySelected } = this.props;
        this.setState({ isLoadDone: !this.state.isLoadDone })
        await stores.productStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined, undefined);
        // await stores.repositoryStore.getAll(undefined, undefined, undefined, undefined, undefined);
        if (!!importRepostitorySelected) {
            this.setState({ listProduct: importRepostitorySelected.listProductImport })
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
        // await this.setState({ pr_id: pr_id });
        // this.setState({ isLoadDone: false });
        // const { productListResult } = stores.productStore;
        // const { repositoryUserListResult } = stores.repositoryStore;
        // const product = productListResult.find(item => item.pr_id === pr_id);
        // this.setState({ listProduct: this.state.listProduct == undefined ? [] : this.state.listProduct })
        // const check = this.state.listProduct.some(item => item.pr_im_name == stores.sessionStore.getNameProduct(pr_id))
        // if (product && check == false) {
        //     const productInput: ProductImportDto = new ProductImportDto();
        //     productInput.pr_remain_in_repository = repositoryUserListResult
        //         .filter(i => i.pr_id === product.pr_id)
        //         .map(i => i.pr_quantity_quydoi)
        //         .reduce((total, quantity) => total + quantity, 0);
        //     productInput.fi_id = product.fi_id;
        //     productInput.pr_im_name = product.pr_name;
        //     productInput.pr_im_quantity = 1;
        //     productInput.pr_im_unit = 'Cái';
        //     productInput.pr_im_quantity_quydoi = 1;
        //     productInput.pr_im_unit_quydoi = product.pr_unit;
        //     productInput.pr_im_code = stores.sessionStore.getCodeProductUseName(product.pr_name!);
        //     productInput.pr_im_unit_price = product.pr_price;
        //     productInput.pr_im_total_money = product.pr_price * productInput.pr_im_quantity;

        //     const updatedListProduct = [...this.state.listProduct, productInput];
        //     this.setState({
        //         listProduct: updatedListProduct,
        //         loadTable: !this.state.loadTable,
        //         isLoadDone: true
        //     });
        // } else {
        //     const { listProduct } = this.state;
        //     const productIndex = this.state.listProduct.findIndex(product => product.pr_im_name === stores.sessionStore.getNameProduct(pr_id));
        //     if (productIndex !== -1) {
        //         const updatedProducts = [...listProduct];
        //         updatedProducts[productIndex].pr_im_quantity = updatedProducts[productIndex].pr_im_quantity + 1;
        //         updatedProducts[productIndex].pr_im_total_money = updatedProducts[productIndex].pr_im_quantity * updatedProducts[productIndex].pr_im_unit_price;
        //         this.setState({ listProduct: updatedProducts });
        //     }
        // }
        // this.setState({ isLoadDone: true });
    }
    actionTable = async (productImport: ProductImportDto, event: EventTable) => {
        if (event == EventTable.Delete) {
            const listFilter = this.state.listProduct.filter(item => item.pr_im_name != productImport.pr_im_name);
            this.setState({ listProduct: listFilter })
        }
    };
    onCreateUpdate = async () => {
        const { importRepostitorySelected } = this.props;
        const { listProduct } = this.state;
        this.setState({ isLoadDone: false });
        const form = this.formRef.current;
        if (importRepostitorySelected?.im_re_id === undefined || importRepostitorySelected.im_re_id < 0) {
            let unitData = new CreateImportRepositoryInput();
            unitData.im_re_total_money = listProduct != undefined ? listProduct.reduce((accumulator, currentValue) => accumulator + currentValue.pr_im_total_money, 0) : 0;
            unitData.im_re_debt = listProduct != undefined ? listProduct.reduce((accumulator, currentValue) => accumulator + currentValue.pr_im_total_money, 0) : 0;
            unitData.listProductImport = listProduct;
            unitData.im_re_status = eStatusImportRepository.PHIEU_TAM.num;
            unitData.im_re_imported_at = moment().toDate();
            unitData.im_re_code = moment().format("YYMMDDHHmmss");
            await stores.importRepositoryStore.createImportRepository(unitData);
            this.onSuccess();
            await this.onCancel();
            message.success("Thêm mới thành công!");
        }
        else {
            let unitData = new UpdateImportRepositoryInput();
            unitData.im_re_id = importRepostitorySelected.im_re_id;
            unitData.su_id = importRepostitorySelected.su_id!;
            unitData.im_re_code = importRepostitorySelected.im_re_code;
            unitData.fi_id_list = importRepostitorySelected.fi_id_list;
            unitData.im_re_total_money = listProduct != undefined ? listProduct.reduce((accumulator, currentValue) => accumulator + currentValue.pr_im_total_money, 0) : 0;
            unitData.im_re_debt = listProduct != undefined ? listProduct.reduce((accumulator, currentValue) => accumulator + currentValue.pr_im_total_money, 0) : 0;
            unitData.listProductImport = listProduct;
            unitData.im_re_status = eStatusImportRepository.PHIEU_TAM.num;
            unitData.im_re_imported_at = moment().toDate();
            await stores.importRepositoryStore.updateImportRepository(unitData);
            this.onSuccess();
            message.success("Cập nhật thành công!");

        }
        await stores.sessionStore.getCurrentLoginInformations();
        this.setState({ isLoadDone: true });

    };
    onChangeImportRepositoryNumberFieldToCreate = (item: ProductImportDto, value: number, field: string) => {
        this.setState({ isLoadDone: false });
        const { listProduct } = this.state;
        const productIndex = listProduct.findIndex(product => product.pr_im_name === item.pr_im_name);
        if (productIndex !== -1) {
            const updatedProducts = [...listProduct];
            if (field == "pr_im_quantity") {
                updatedProducts[productIndex].pr_im_quantity = value
            }
            else if (field == "pr_im_unit_price") {
                updatedProducts[productIndex].pr_im_unit_price = value;
            }
            else if (field == "pr_im_quantity_quydoi") {
                updatedProducts[productIndex].pr_im_quantity_quydoi = value;
            }
            else if (field == "pr_im_total_money") {
                updatedProducts[productIndex].pr_im_total_money = value;
            }
            //updatedProducts[productIndex].pr_im_total_money = updatedProducts[productIndex].pr_im_quantity * updatedProducts[productIndex].pr_im_unit_price;
            this.setState({ listProduct: updatedProducts });
        }
        this.setState({ isLoadDone: true });
    }
    onChangeImportRepositoryStringFieldToCreate = (item: ProductImportDto, value: string,) => {
        this.setState({ isLoadDone: false });
        const { listProduct } = this.state;
        const productIndex = this.state.listProduct.findIndex(product => product.pr_im_name === item.pr_im_name);
        if (productIndex !== -1) {
            const updatedProducts = [...listProduct];
            updatedProducts[productIndex].pr_im_unit = value;
            this.setState({ listProduct: updatedProducts });
        }
        this.setState({ isLoadDone: true });
    }
    onSuccessImport = (input: ProductImportDto[]) => {
        const { listProduct } = this.state;
        this.setState({ isLoadDone: false });
        const updatedProducts = listProduct != undefined ? [...listProduct] : [];
        input.forEach(newProduct => {
            const existingProductIndex = updatedProducts.findIndex(item => item.pr_im_name === newProduct.pr_im_name);
            if (existingProductIndex !== -1) {
                updatedProducts[existingProductIndex].pr_im_quantity += newProduct.pr_im_quantity;
            } else {
                updatedProducts.push(newProduct);
            }
        });

        this.setState({ listProduct: updatedProducts, isLoadDone: true, isVisibleImportExcelModal: false })
    }
    render() {
        const height = window.innerHeight;
        return (
            <>
                <Row gutter={16}>
                    <Col span={24}>
                        <Row>
                            <Col span={8}>
                                <Row>
                                    <Col><Button icon={<ArrowLeftOutlined />} type='text' title='Trở về' onClick={() => this.props.onCancel()}></Button></Col>
                                    <Col><h2>Nhập kho lưu trữ</h2></Col>
                                </Row>
                            </Col>
                            <Col span={12}>
                                <SelectedProductImportRepository productId={this.state.pr_id} onChangeProduct={async (value) => {
                                    (value != undefined) && await this.onChangeSelectProduct(value);
                                }} />
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
                                    <Button
                                        title='Tạo phiếu nhập'
                                        icon={<PlusOutlined />}
                                        type='primary'
                                        onClick={() => this.onCreateUpdate()}
                                    >
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                        <TableImportRepositoryDetailUser
                            actionTable={this.actionTable}
                            loadTable={this.state.loadTable}
                            openImportExcelProduct={() => this.setState({ isVisibleImportExcelModal: true })}
                            listProductResult={this.state.listProduct}
                            pagination={false}
                            hasAction={true}
                            edit={true}
                            checkChangeQuantity={true}
                            onChangeImportRepositoryNumberFieldToCreate={this.onChangeImportRepositoryNumberFieldToCreate}
                            onChangeImportRepositoryStringFieldToCreate={this.onChangeImportRepositoryStringFieldToCreate}
                        />
                    </Col>
                    {/* <Col span={8} >
                        <CreateOrUpdateImportsitoryAdmin
                            onSuccess={this.onSuccess}
                            importRepostitorySelected={this.props.importRepostitorySelected}
                            onCancel={this.onCancel}
                            listProductImport={this.state.listProduct}
                        />
                    </Col> */}
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
