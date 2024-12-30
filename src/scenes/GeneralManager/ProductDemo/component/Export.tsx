import ActionExport from '@src/components/ActionExport';
import { ProductDto } from '@src/services/services_autogen';
import { Col, Modal, Row, Button, Space } from 'antd';
import * as React from 'react';
import moment from 'moment';
import IActionExport from '@src/components/ActionExport';
import AppConsts from '@src/lib/appconst';
import * as ExcelJS from 'exceljs';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import ProductTable from './ProductTable';
import { stores } from '@src/stores/storeInitializer';
import FileSaver from 'file-saver';

export interface IProps {
    productListResult: ProductDto[];
    visible: boolean;
    onCancel?: () => void;
    noScroll?: boolean;
    table?: any;
}

export default class Export extends AppComponentBase<IProps> {
    componentRef: any | null = null;
    state = {
        isLoadDone: true,
    }
    listProduct: ProductDto[] = [];

    async componentDidMount() {
        this.listProduct = this.props.productListResult;
    }

    setComponentRef = (ref) => {
        this.setState({ isLoadDone: false });
        this.componentRef = ref;
        this.setState({ isLoadDone: true });
    }

    render() {
        const { productListResult } = this.props;
        return (
            <Modal
                visible={this.props.visible}
                title="Xuất danh sách sản phẩm"
                closable={false}
                cancelButtonProps={{ style: { display: "none" } }}
                onCancel={() => { this.props.onCancel!() }}
                footer={null}
                width='90vw'
                maskClosable={true}
            >
                <Row justify='end' style={{ marginTop: 10 }}>
                    <Space>
                        <ActionExport
                            componentRef={this.componentRef}
                            idPrint='product_print_id'
                            nameFileExport='Danh sách sản phẩm'
                            isPrint={true}
                            isExcel={true}
                            isExcelWithImage={true}
                            isWord={true}
                        />
                        <Button danger onClick={this.props.onCancel}>Huỷ</Button>
                    </Space>
                </Row>
                <Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id="product_print_id">
                    <TitleTableModalExport title='Danh sách sản phẩm'></TitleTableModalExport>
                    <ProductTable
                        isPrint={true}
                        productListResult={productListResult}
                        pagination={false}
                        isLoadDone={true}
                        noScroll={false}
                        formatImage={true}
                    />
                </Col>
            </Modal>
        )
    }
}
