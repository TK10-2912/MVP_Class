import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { AttachmentItem, HandoverDto } from '@src/services/services_autogen';
import { Button, Col, Row } from 'antd';
import * as React from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';
import { stores } from '@src/stores/storeInitializer';
import CreateOrUpdateHandoverUser from './CreateOrUpdateHandoverUser';
import SelectedProductRepository from '@src/components/Manager/SelectedProductRepository';
import TableProductRepositoryDetail from './TableProductRepositoryDetail';
export class ListProductHandOver {
    public pr_id;
    public pr_name;
    public pr_quantity;
    public fi_id;
    public pr_quantity_max;
    public pr_unit;
    constructor(pr_id, pr_name, pr_quantity, fi_id, pr_quantity_max, pr_unit) {
        this.pr_id = pr_id;
        this.pr_name = pr_name;
        this.pr_quantity = pr_quantity;
        this.fi_id = fi_id;
        this.pr_quantity_max = pr_quantity_max;
        this.pr_unit = pr_unit;
    }
}
export interface IProps {
    isVisible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    actionTable?: (item: HandoverDto, event: EventTable) => void;
    handoverSelected?: HandoverDto,

}
export default class CreateHandover extends AppComponentBase<IProps> {
    formRef: React.RefObject<FormInstance> = React.createRef();
    state = {
        isLoadDone: true,
        im_re_id: undefined,
        us_id: undefined,
        isVisibleCreateModal: false,
        isVisibleImportExcelModal: false,
        saveType: 0,
        loadTable: false,
        listProduct: [] as ListProductHandOver[],
        pr_id: undefined,
    }
    listAttachmentItem_file: AttachmentItem[] = [];
    index = 1;
    async componentDidMount() {
        const { handoverSelected } = this.props;
        this.setState({ isLoadDone: !this.state.isLoadDone })
        if (!!handoverSelected) {
            let listProductRepository = stores.sessionStore.getAllProductInRepository(-2);
            let listProductHandover = handoverSelected.productHandoverInputs;
            let listProduct: ListProductHandOver[] = [];
            listProductRepository.forEach(item => {
                const foundItem = listProductHandover?.find(itemHandover => itemHandover.pr_id === item.pr_id);
                const isAlreadyAdded = listProduct.some(product => product.pr_id === item.pr_id);
                if (foundItem && !isAlreadyAdded) {
                    let x = new ListProductHandOver(
                        item.pr_id, 
                        item.pr_name, 
                        foundItem.pr_quantity, 
                        item.fi_id, 
                        item.pr_quantity, 
                        item.pr_unit
                    );
                    listProduct.push(x);
                }
            });
            this.setState({ listProduct: listProduct })
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
        this.setState({ isLoadDone: false });
        let productRepository: ListProductHandOver[] = stores.sessionStore.getAllProductInRepository(this.state.us_id);
        const product = productRepository.find(item => item.pr_id === pr_id);
        this.setState({ listProduct: this.state.listProduct == undefined ? [] : this.state.listProduct })
        const check = this.state.listProduct.some(item => item.pr_id == product?.pr_id)
        if (product && check == false) {
            const updatedListProduct = [...this.state.listProduct, product];
            this.setState({
                listProduct: updatedListProduct,
                loadTable: !this.state.loadTable,
                isLoadDone: true
            });
        }
        this.setState({ isLoadDone: true });
    }
    actionTable = async (productImport: ListProductHandOver, event: EventTable) => {
        if (event == EventTable.Delete) {
            const listFilter = this.state.listProduct.filter(item => item.pr_id != productImport.pr_id);
            this.setState({ listProduct: listFilter })
        }
    };
    onChangeQuantity = (item: ListProductHandOver, value: number) => {
        this.setState({ isLoadDone: false });
        const { listProduct } = this.state;
        const productIndex = this.state.listProduct.findIndex(product => product.pr_id === item.pr_id);
        if (productIndex !== -1) {
            const updatedProducts = [...listProduct];
            updatedProducts[productIndex].pr_quantity = value;
            this.setState({ listProduct: updatedProducts });
        }
        this.setState({ isLoadDone: true });
    }
    onChangeUser = async (us_id: number) => {
        await this.setState({ us_id: us_id });
    }
    render() {
        const height = window.innerHeight;
        const { handoverSelected } = this.props;
        return (
            <>
                <Row gutter={16}>
                    <Col span={14}>
                        <Row>
                            <Col span={8}>
                                <Row>
                                    <Col><Button icon={<ArrowLeftOutlined />} type='text' title='Trở về' onClick={() => this.props.onCancel()}></Button></Col>
                                    <Col><h2>{(handoverSelected != undefined && handoverSelected.ha_id != undefined) ? "Cập nhật bàn giao" : "Tạo mới bàn giao"}</h2></Col>
                                </Row>
                            </Col>
                            <Col span={16}>
                                <SelectedProductRepository us_id={this.state.us_id} productId={this.state.pr_id} onChangeProduct={async (value) => {
                                    (value != undefined) && await this.onChangeSelectProduct(value);
                                }} />
                            </Col>
                        </Row>
                        <TableProductRepositoryDetail
                            actionTable={this.actionTable}
                            loadTable={this.state.loadTable}
                            openImportExcelProduct={() => this.setState({ isVisibleImportExcelModal: true })}
                            listProductResult={this.state.listProduct}
                            pagination={false}
                            hasAction={true}
                            edit={true}
                            onChangeQuantity={this.onChangeQuantity}
                        />
                    </Col>
                    <Col span={10} >
                        <CreateOrUpdateHandoverUser onChangeUser={this.onChangeUser} onSuccess={this.onSuccess} handoverSelected={this.props.handoverSelected} onCancel={this.onCancel} listProductImport={this.state.listProduct} />
                    </Col>
                </Row >

            </>
        )
    }
}
