import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { pageSizeOptions } from '@src/lib/appconst';
import { ProductDto, RepositoryDetails, RepositoryDto } from '@src/services/services_autogen';
import { Table, Image, Tag, Col, Row, Button } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import { stores } from '@src/stores/storeInitializer';
import { eRepositoryProductStatus, valueOfeRepositoryProductStatus } from '@src/lib/enumconst';
import SelectedProductFilter from '@src/components/Manager/SelectedProductFilter';
import SelectedProductPrice from '@src/components/Manager/SelectedProductPrice';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import SelectedProductPriceInRepository from '@src/components/Manager/SelectedProductPriceInRepository';
import SelectEnum from '@src/components/Manager/SelectEnum';

export interface IProps {
    repository?: RepositoryDto;
    re_id: number;
}
export default class TableViewProductInRepository extends AppComponentBase<IProps> {
    state = {
        isLoadDone: true,
        re_id_selected: undefined,
        listIdProduct: 0,
        pagesize: 10,
        currentPage: 1,
        pr_id: undefined,
        pr_price_from: undefined,
        pr_price_to: undefined,
        pr_status_in_repository: undefined,
    }
    childRef = React.createRef<SelectedProductPriceInRepository>();
    listIdProduct: number[] = [];
    listProduct: RepositoryDetails[] = [];
    componentDidMount() {
        this.setState({ re_id_selected: this.props.re_id });
        this.listProduct = this.props.repository != undefined ? this.props.repository.repositoryDetails! : [];
        this.listIdProduct = this.listProduct.length > 0 ? this.listProduct.map(item => item.pr_id) : [];
    }
    handleSearch = () => {
        this.setState({ isLoadDone: false });
        this.listProduct = this.props.repository != undefined ? this.props.repository.repositoryDetails! : [];
        if (this.state.pr_id != undefined) {
            this.listProduct = this.listProduct.filter(item => item.pr_id == this.state.pr_id);
        }
        if (this.state.pr_price_from != undefined) {
            this.listProduct = this.listProduct.filter(item => item.pr_price >= Number(this.state.pr_price_from));
        }
        if (this.state.pr_price_to != undefined) {
            this.listProduct = this.listProduct.filter(item => item.pr_price <= Number(this.state.pr_price_to));
        }

        if (this.state.pr_status_in_repository != undefined) {
            this.listProduct = this.listProduct.filter(item => this.getStatus(item.pr_id) == Number(this.state.pr_status_in_repository));
        }
        this.setState({ isLoadDone: true });
    }
    getQuantiy = (id: number) => {
        const { repository } = this.props;
        if (repository != undefined) {
            const result = repository.repositoryDetails!.find(item => item.pr_id === id);
            return result?.pr_quantity;
        }
        else return 0;
    }
    getStatus = (id: number) => {
        const { repository } = this.props;
        if (repository != undefined) {
            const result = repository.repositoryDetails!.find(item => item.pr_id === id);
            return result != undefined ? result.re_de_product_status : -1;
        }
        else return -1
    }
    handlePageChange = (page, pageSize) => {
        this.setState({ currentPage: page, pagesize: pageSize });
    };
    onShowSizeChange = (current, size) => {
        this.handlePageChange(current, size);
    };
    onClearSearch = async () => {
        await this.setState({
            pr_id: null,
            pr_status_in_repository: undefined,
        });
        this.clearSearch()
        this.handleSearch();
    }
    clearSearch = () => {
        if (this.childRef.current) {
            this.childRef.current.onClear();
        }
    };
    render() {
        const startIndex = (this.state.currentPage - 1) * this.state.pagesize;
        const endIndex = startIndex + this.state.pagesize;
        let currentData = this.listProduct?.slice(startIndex, endIndex);
        const sessionStore = stores.sessionStore;
        const columns: ColumnsType<RepositoryDetails> = [
            { title: "STT", key: "stt_fresh_drink_index", width: 50, render: (text: string, item: RepositoryDetails, index: number) => <div>{this.state.pagesize! * (this.state.currentPage! - 1) + (index + 1)}</div> },
            {
                title: "Ảnh",
                width: 160,
                className: 'no-print',
                key: "fi_id_index",
                render: (text: string, item: RepositoryDetails, index: number) => (
                    <div style={{ textAlign: "center" }}>
                        <Image className='no-print imageProduct'
                            src={sessionStore.getImageProductByID(item.pr_id) ? this.getImageProduct(sessionStore.getImageProductByID(item.pr_id)?.md5!) : process.env.PUBLIC_URL + '/image/no_image.jpg'}
                            alt='No image available' />
                    </div>
                )
            },
            { title: "Mã sản phẩm", dataIndex: "pr_code", key: "pr_code", render: (text: string, item: RepositoryDetails) => <div> {sessionStore.getCodeProductByID(item.pr_id)} </div> },
            { title: "Tên sản phẩm", dataIndex: "pr_name", key: "pr_name", render: (text: string, item: RepositoryDetails) => <div> {sessionStore.getNameProduct(item.pr_id)} </div> },
            { title: "Tồn kho", sorter: (a, b) => a.pr_total_quantity_quydoi - b.pr_total_quantity_quydoi, dataIndex: "pr_code", key: "pr_code", render: (text: string, item: RepositoryDetails) => <div> {AppConsts.formatNumber(item.pr_total_quantity_quydoi)} </div> },
            { title: "Đơn vị tính", dataIndex: "pr_code", key: "pr_code", render: (text: string, item: RepositoryDetails) => <div> {item.pr_unit_quydoi} </div> },
            { title: "Giá bán", sorter: (a, b) => a.pr_price - b.pr_price, dataIndex: "pr_code", key: "pr_code", render: (text: string, item: RepositoryDetails) => <div> {AppConsts.formatNumber(item.pr_price)} </div> },
            {
                title: "Trạng thái sản phẩm", width: 150, dataIndex: "pr_code", key: "pr_code", render: (text: string, item: RepositoryDetails) =>
                    <div>
                        {this.getStatus(item.pr_id) == -1 ?
                            <></>
                            :
                            <>
                                {this.getStatus(item.pr_id) == eRepositoryProductStatus.AVAILABLE.num && <Tag color='success'>{valueOfeRepositoryProductStatus(this.getStatus(item.pr_id))}</Tag>}
                                {this.getStatus(item.pr_id) == eRepositoryProductStatus.ALMOST_OUT_OF_STOCK.num && <Tag color='volcano'>{valueOfeRepositoryProductStatus(this.getStatus(item.pr_id))}</Tag>}
                                {this.getStatus(item.pr_id) == eRepositoryProductStatus.LONG_TERM_INVENTORY.num && <Tag>{valueOfeRepositoryProductStatus(this.getStatus(item.pr_id))}</Tag>}
                                {this.getStatus(item.pr_id) == eRepositoryProductStatus.OUT_OF_STOCK.num && <Tag color='error'>{valueOfeRepositoryProductStatus(this.getStatus(item.pr_id))}</Tag>}
                            </>
                        }
                    </div>
            },
        ];
        return (
            <>
                <Row gutter={[8, 8]} align='bottom'>
                    <Col span={5}>
                        <strong>Chọn sản phẩm</strong>
                        <SelectedProductFilter productId={this.state.pr_id} productIdList={this.listIdProduct} onChangeProduct={async num => { await this.setState({ pr_id: num }); await this.handleSearch() }} />
                    </Col>
                    <Col span={8}>
                        <strong>Chọn giá sản phẩm</strong>
                        <SelectedProductPriceInRepository
                            ref={this.childRef}
                            onChangePrice={async (price_from, price_to) => {
                                await this.setState({ pr_price_from: price_from, pr_price_to: price_to });
                                await this.handleSearch();
                            }}
                        />
                    </Col>
                    <Col span={5}>
                        <strong>Chọn trạng thái</strong>
                        <SelectEnum eNum={eRepositoryProductStatus} enum_value={this.state.pr_status_in_repository} onChangeEnum={async (e) => {
                            await this.setState({ pr_status_in_repository: e });
                            this.handleSearch();
                        }} />
                    </Col>
                    <Col span={6} style={{ display: "flex", flexWrap: "wrap", padding: 0 }} >
                        <Col>
                            <Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={this.handleSearch} >{(window.innerWidth >= 576 && window.innerWidth <= 992) ? 'Tìm' : 'Tìm kiếm'}</Button>
                        </Col>
                        {
                            (!!this.state.pr_id || !!this.state.pr_price_from || !!this.state.pr_price_to || !!this.state.pr_status_in_repository || this.state.pr_status_in_repository! > -1) &&
                            <Col>
                                <Button danger icon={<DeleteOutlined />} title={"Xóa tìm kiếm"} onClick={this.onClearSearch} >Xóa tìm kiếm</Button>
                            </Col>
                        }
                    </Col>

                </Row>
                <Table
                    className='centerTable customTable'
                    scroll={{ x: undefined, y: 600 }}
                    columns={columns}
                    size={'small'}
                    bordered={true}
                    
                    dataSource={currentData}
                    rowClassName={(record, index) => (this.state.re_id_selected === record.pr_id) ? "bg-click" : "bg-white"}
                    pagination={{
                        position: ['topRight'],
                        total: this.listProduct?.length,
                        showTotal: (tot) => "Tổng" + ": " + tot + "",
                        showQuickJumper: true,
                        showSizeChanger: true,
                        pageSizeOptions: pageSizeOptions,
                        onChange: (page: number, pageSize?: number) => {
                            this.handlePageChange(page, pageSize);
                        },
                        onShowSizeChange: this.onShowSizeChange,
                    }}

                    rowKey={record => record.pr_id}
                />
            </>
        )
    }
}