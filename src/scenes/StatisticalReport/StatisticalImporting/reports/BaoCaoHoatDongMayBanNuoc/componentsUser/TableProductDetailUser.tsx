import * as React from 'react';
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { Button, Col, Input, Modal, Row, Select, Table } from "antd";
import { ImportSellRemainProductDto, IntPtr, StatisticImportSellRemainProductDto } from '@src/services/services_autogen';
import { ColumnsType } from 'antd/lib/table';
import AppConsts, { cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import SelectedProduct from '@src/components/Manager/SelectedProduct';
import { stores } from '@src/stores/storeInitializer';
import SelectedProductMultiple from '@src/components/Manager/SelectedProductMultiple';
export interface Iprops {
    is_print?: boolean;
    visibleModal?: boolean;
    onCancel: () => void;
    listItemRemain: ImportSellRemainProductDto[];
    title?: string;
}
export default class TableProductDetailUser extends AppComponentBase<Iprops> {
    componentRef: any | null = null;
    state = {
        isLoadDone: true,
        pageSize: 10,
        currentPage: 1,
        codeProduct: "",
        nameProduct: undefined,
        pr_id: undefined,
    };
    listDisplayTable: ImportSellRemainProductDto[] = [];
    listNameProduct: string[] = [];
    onCancel = () => {
        if (!!this.props.onCancel) {
            this.props.onCancel();
        }
    }
    async componentDidMount() {
        await this.setState({ isLoadDone: false });
        this.listDisplayTable = this.props.listItemRemain;
        await this.setState({ isLoadDone: true });
    }
    handleSubmitSearch = async () => {
        this.setState({ isLoadDone: true });
        this.listDisplayTable = this.props.listItemRemain.slice();
        if (this.listNameProduct!.length! > 0) {
            await this.setState({ isLoadDone: !this.state.isLoadDone });
            this.listDisplayTable = await this.listDisplayTable.filter(item => this.listNameProduct.includes(item.pr_name!))
            await this.setState({ isLoadDone: !this.state.isLoadDone });
        }
        if (this.state.codeProduct != undefined && this.state.codeProduct!.length > 0) {
            const codeProductLower = this.state.codeProduct.toLowerCase();
            this.listDisplayTable = await this.listDisplayTable.filter(item =>
                (item.pr_code && item.pr_code.toLowerCase().includes(codeProductLower))
            );
        }
        this.setState({ isLoadDone: false });
    }
    onClearSearch = async () => {
        this.setState({ isLoadDone: true });
        await this.setState({
            codeProduct: "",
            nameProduct: undefined,
            pr_id: undefined,
        })

        this.listNameProduct = [];
        this.handleSubmitSearch();
        this.setState({ isLoadDone: true });
    }
    onChangeProduct = async (list: number[]) => {
        this.setState({ pr_id: list });
        this.listNameProduct = [];
        if (list != undefined && list.length > 0) {
            list.map(num => this.listNameProduct.push(stores.sessionStore.getNameProduct(num!) == "Sản phẩm không còn sử dụng trong máy" ? "" : stores.sessionStore.getNameProduct(num!)));
        }
        else {
            this.listNameProduct = [];
        }
    }
    render() {
        const columns: ColumnsType<ImportSellRemainProductDto> = [
            { title: "STT", key: "stt", width: 50, render: (text: string, item: ImportSellRemainProductDto, index: number) => <div>{this.state.pageSize * (this.state.currentPage - 1) + (index + 1)}</div> },

            {
                title: "Ảnh", key: "money", render: (text: string, item: ImportSellRemainProductDto) => <div style={{ textAlign: "center" }}>
                    <img className='imageDetailProductExportExcel' src={(item.fi_id != undefined && item.fi_id.id != undefined) ? this.getImageProduct(item.fi_id.md5 != undefined ? item.fi_id.md5 : "") : AppConsts.appBaseUrl + "/image/no_image.jpg"} style={{ height: `${this.props.is_print ? "70px" : "100px"}`, width: `${this.props.is_print ? "70px" : "100px"}`, maxWidth: '100px !important', maxHeight: '100px !important' }}
                        alt='No image available' />
                </div>
            },
            { title: "Mã sản phẩm", key: "pr_code", render: (text: string, item: ImportSellRemainProductDto) => <div>{item.pr_code}</div> },
            { title: "Tên sản phẩm", key: "pr_name", render: (text: string, item: ImportSellRemainProductDto) => <div>{item.pr_name}</div> },
            { title: this.props.title, key: "quantity", render: (text: string, item: ImportSellRemainProductDto) => <div>{item.quantity}</div> },
        ];
        return (
            <Modal
                width={'60%'}
                visible={this.props.visibleModal}
                onCancel={() => this.onCancel()}
                maskClosable={false}
                title={(<h2>Chi tiết sản phẩm</h2>)}
                footer={null}
            >
                <Row gutter={16} style={{ marginBottom: 10 }}>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 6, 6, 6)}>
                        <strong>Mã sản phẩm</strong>
                        <Input allowClear placeholder='Mã sản phẩm' value={this.state.codeProduct} onChange={async (e) => { await this.setState({ codeProduct: e.target.value.trim() }); await this.handleSubmitSearch() }} />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 6, 6, 6)}>
                        <strong>Tên sản phẩm</strong>
                        <SelectedProductMultiple productList={this.state.pr_id} onClear={async () => { this.setState({ pr_id: undefined }); await this.handleSubmitSearch() }} onChangeProduct={async (input) => {
                            await this.onChangeProduct(input!); await this.handleSubmitSearch()
                        }}
                        />
                    </Col>

                    <Col {...cssColResponsiveSpan(24, 12, 12, 12, 11, 11)} style={{ display: "flex", alignItems: 'end', flexWrap: "wrap", gap: 8 }}>
                        <Button type="primary" icon={<SearchOutlined />} title={this.L('Search')} onClick={this.handleSubmitSearch} >Tìm kiếm</Button>
                        {
                            (!!this.state.nameProduct || (this.listNameProduct != undefined && this.listNameProduct.length > 0) || this.state.codeProduct.length > 0) &&
                            <Button danger icon={<DeleteOutlined />} title={"Xóa tìm kiếm"} onClick={this.onClearSearch} >Xóa tìm kiếm</Button>
                        }
                    </Col>
                </Row>
                <Table
                    className="centerTable"
                    size={'small'}
                    bordered={true}
                    dataSource={this.listDisplayTable}
                    columns={columns}
                    rowKey={(record: ImportSellRemainProductDto) => record.pr_code! + "_" + record.pr_code}
                    scroll={this.props.is_print ? { x: undefined } : { x: undefined, y: 600 }}
                    pagination={{
                        position: ['topRight'],
                        showQuickJumper: true,
                        showSizeChanger: true,
                        pageSizeOptions: pageSizeOptions,
                        total: this.listDisplayTable.length,
                        showTotal: (tot) => "Tổng: " + this.props.listItemRemain.length,
                        onChange: (page, pageSize) => { this.setState({ currentPage: page, pageSize: pageSize }) }
                    }}
                />
            </Modal>

        )
    }
}