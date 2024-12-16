import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { pageSizeOptions } from '@src/lib/appconst';
import { RepositoryDto, ImportRepositoryDto } from '@src/services/services_autogen';
import { Button, Col, Input, Modal, Row, Table, Tag } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import { stores } from '@src/stores/storeInitializer';
import SelectedSupplier from '@src/components/Manager/SelectedSupplier';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import SelectEnum from '@src/components/Manager/SelectEnum';
import { eStatusImportRepository } from '@src/lib/enumconst';
import DetailInfomationImportRepositoryAdmin from '@src/scenes/GeneralManager/ImportRepositoryAdmin/components/ImportReponsitoryDetail/DetailInfomationImportRepositoryAdmin';

export interface IProps {
    repository?: RepositoryDto;
    onSucess?: () => void;
}
export default class TableImportDetailRepository extends AppComponentBase<IProps> {
    state = {
        isLoadDone: true,
        pr_id_selected: undefined,
        listIdProduct: 0,
        visibleModal: false,
        pageSize: 10,
        currentPage: 1,
        im_re_code: undefined,
        su_id: undefined,
        im_re_status: undefined,

    }
    listProduct: ImportRepositoryDto[] = [];
    importRepositorySelected: ImportRepositoryDto = new ImportRepositoryDto();

    componentDidMount() {
        this.initData(this.props.repository!);
    }
    initData = async (input: RepositoryDto) => {
        this.setState({ isLoadDone: false });
        await stores.importRepositoryStore.getAll(undefined, undefined, undefined, [input.us_id_operator], undefined, undefined, this.state.pageSize, undefined);
        const { importRepositoryListResult } = stores.importRepositoryStore;
        this.listProduct = importRepositoryListResult;
        this.setState({ isLoadDone: true });

    }
    onCellTable = (item: ImportRepositoryDto) => {
        this.importRepositorySelected = item;
        this.setState({ visibleModal: true });
    }
    onSuccess = () => {

        this.props.onSucess!();
        this.initData(this.props.repository!);
        this.setState({ visibleModal: false });

    }
    handleSearch = () => {
        this.setState({ isLoadDone: false });
        const { importRepositoryListResult } = stores.importRepositoryStore;
        this.listProduct = importRepositoryListResult.slice();
        if (this.state.im_re_code != undefined) {
            this.listProduct = this.listProduct.filter(item => item.im_re_code?.includes(this.state.im_re_code!));
        }
        if (this.state.su_id != undefined) {
            this.listProduct = this.listProduct.filter(item => item.su_id == Number(this.state.su_id!));
        }
        if (this.state.im_re_status != undefined) {
            this.listProduct = this.listProduct.filter(item => item.im_re_status == Number(this.state.im_re_status!));
        }
        this.setState({ isLoadDone: true });
    }
    onClearSearch = async () => {
        await this.setState({
            im_re_code: undefined,
            su_id: undefined,
            im_re_status: undefined,
        });
        this.handleSearch();
    }
    render() {
        const self = this
        const columns: ColumnsType<ImportRepositoryDto> = [
            { title: "STT", key: "stt_fresh_drink_index", width: 50, render: (text: string, item: ImportRepositoryDto, index: number) => <div>{this.state.pageSize * (this.state.currentPage - 1) + (index + 1)}</div> },
            {
                title: "Mã phiếu nhập", className: "hoverCell", key: "im_re_code", onCell: (item: ImportRepositoryDto) => {
                    return { onClick: () => this.onCellTable(item) }
                }, render: (text: string, item: ImportRepositoryDto) => <div title='Xem chi tiết'>{item.im_re_code}</div>
            },
            { title: "Nhà cung cấp", key: "su_id", ellipsis: true, render: (text: string, item: ImportRepositoryDto) => <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stores.sessionStore.getNameSupplier(item.su_id)}</div> },
            { title: "Tổng số sản phẩm", sorter: (a, b) => a.listProductImport!.length - b.listProductImport!.length, key: "im_re_code", render: (text: string, item: ImportRepositoryDto) => <div> {item.listProductImport?.length} </div> },
            { title: "Tổng số lượng", sorter: (a, b) => a.listProductImport!.reduce((total, currenttotal) => total + currenttotal.pr_im_quantity, 0) - b.listProductImport!.reduce((total, currenttotal) => total + currenttotal.pr_im_quantity, 0), key: "im_re_code", render: (text: string, item: ImportRepositoryDto) => <div> {AppConsts.formatNumber(item.listProductImport?.reduce((total, currenttotal) => total + currenttotal.pr_im_quantity, 0))} </div> },
            { title: "Tổng tiền hàng", sorter: (a, b) => a.listProductImport!.reduce((total, currenttotal) => total + currenttotal.pr_im_total_money, 0) - b.listProductImport!.reduce((total, currenttotal) => total + currenttotal.pr_im_total_money, 0), key: "im_re_code", render: (text: string, item: ImportRepositoryDto) => <div> {AppConsts.formatNumber(item.listProductImport?.reduce((total, currenttotal) => total + currenttotal.pr_im_total_money, 0))} </div> },
            { title: "Nợ cần trả NCC", sorter: (a, b) => a.im_re_debt - b.im_re_debt, key: "im_re_code", render: (text: string, item: ImportRepositoryDto) => <div>{AppConsts.formatNumber(item.im_re_debt)}</div> },
            {
                title: "Trạng thái nhập kho", key: "im_re_status", dataIndex: 'im_re_status', render: (text: string, item: ImportRepositoryDto) => (
                    item.im_re_status ?
                        <Tag color='success'>Đã nhập kho</Tag>
                        :
                        <Tag color='processing'>Phiếu tạm</Tag>
                )
            },
            { title: "Thời gian tạo", sorter: (a, b) => moment(a.im_re_created_at).unix() - moment(b.im_re_created_at).unix(), key: "im_re_imported_at", render: (text: string, item: ImportRepositoryDto) => <div>{moment(item.im_re_created_at).format("DD/MM/YYYY HH:mm")}</div> },
            { title: "Thời gian nhập", sorter: (a, b) => moment(a.im_re_created_at).unix() - moment(b.im_re_created_at).unix(), key: "im_re_imported_at", render: (text: string, item: ImportRepositoryDto) => <div>{moment(item.im_re_created_at).format("DD/MM/YYYY HH:mm")}</div> },

        ];
        return (
            <>
                <Row gutter={[8, 8]} align='bottom'>
                    <Col span={5}>
                        <strong>Mã phiếu nhập</strong>
                        <Input value={this.state.im_re_code} onChange={async (e) => { await this.setState({ im_re_code: e.target.value }); this.handleSearch() }} />
                    </Col>
                    <Col span={5}>
                        <strong>Nhà cung cấp</strong>
                        <SelectedSupplier supplierID={this.state.su_id} onChangeSupplier={async (item) => { await this.setState({ su_id: item }); this.handleSearch() }} />
                    </Col>
                    <Col span={5}>
                        <strong>Trạng thái nhập kho</strong>
                        <SelectEnum
                            enum_value={this.state.im_re_status}
                            eNum={eStatusImportRepository}
                            onChangeEnum={async (value) => { await this.setState({ im_re_status: value }); this.handleSearch() }}
                        ></SelectEnum>
                    </Col>
                    <Col span={9} style={{ display: "flex", flexWrap: "wrap", padding: 0 }} >
                        <Col>
                            <Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={this.handleSearch} >{(window.innerWidth >= 576 && window.innerWidth <= 992) ? 'Tìm' : 'Tìm kiếm'}</Button>
                        </Col>
                        {
                            (!!this.state.im_re_code || !!this.state.im_re_status || !!this.state.su_id || this.state.im_re_status! > -1) &&
                            <Col>
                                <Button danger icon={<DeleteOutlined />} title={"Xóa tìm kiếm"} onClick={this.onClearSearch} >Xóa tìm kiếm</Button>
                            </Col>
                        }
                    </Col>
                </Row>
                <Table
                    className='centerTable customTable'
                    scroll={{ x: 1000, y: 600 }}
                    columns={columns}
                    size={'small'}
                    bordered={true}
                    
                    dataSource={this.listProduct}
                    rowKey={record => record.im_re_id}
                    pagination={{
                        position: ['topRight'],
                        total: this.listProduct.length,
                        showTotal: (tot) => "Tổng" + ": " + tot + "",
                        showQuickJumper: true,
                        showSizeChanger: true,
                        pageSizeOptions: pageSizeOptions,
                        onChange(page: number, pageSize?: number) {
                            self.setState({ currentPage: page, pageSize: pageSize })
                        }
                    }}
                />
                <Modal
                    width={"80vw"}
                    title={<strong>{"Phiếu nhập kho " + this.importRepositorySelected.im_re_code}</strong>}
                    visible={this.state.visibleModal}
                    onCancel={() => this.setState({ visibleModal: false })}
                    footer={null}
                    destroyOnClose={true}
                    maskClosable={true}
                >
                    <DetailInfomationImportRepositoryAdmin onSuccess={this.onSuccess} isOpen={true} listProductImport={this.importRepositorySelected.listProductImport} importRepostitorySelected={this.importRepositorySelected} />
                </Modal>
            </>

        )
    }
}