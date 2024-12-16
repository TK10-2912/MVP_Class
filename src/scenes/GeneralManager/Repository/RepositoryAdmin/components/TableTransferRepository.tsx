import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { pageSizeOptions } from '@src/lib/appconst';
import { RepositoryDto, TranferRepositoryDto, ProductTranferDto } from '@src/services/services_autogen';
import { Button, Col, Input, Modal, Row, Table, Tag } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import { stores } from '@src/stores/storeInitializer';
import { SorterResult } from 'antd/lib/table/interface';
import { eTranferRepositoryStatus, valueOfeTranferRepositoryStatus } from '@src/lib/enumconst';
import SelectEnum from '@src/components/Manager/SelectEnum';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import DetailInfomationTranferRepositoryAdmin from '../../TransferRepositoryDetailAdmin/components/Detail/DetailInfomationTranferRepositoryAdmin';
import DetailInfomationTranferRepositoryUser from '../../TransferRepositoryDetailUser/component/DetailInfomationTranferRepositoryUser';

export interface IProps {
    repository?: RepositoryDto;
    changeColumnSortExportRepository?: (fieldSort: SorterResult<TranferRepositoryDto> | SorterResult<TranferRepositoryDto>[]) => void;
}
export default class TableTransferRepository extends AppComponentBase<IProps> {
    state = {
        isLoadDone: true,
        tr_re_code: undefined,
        tr_re_status: undefined,
        listIdProduct: 0,
        visibleModal: false,
        pageSize: 10,
        currentPage: 1,
    }
    listProduct: TranferRepositoryDto[] = [];
    transferRepositorySelected: TranferRepositoryDto = new TranferRepositoryDto();

    title: string = "";
    componentDidMount() {
        this.initData(this.props.repository!);
    }
    initData = (input: RepositoryDto) => {
        const { transferRepositoryResult } = stores.transferRepositoryStore;
        // re_id = 1 là kho tổng, sẽ xem được hết
        this.listProduct = input.re_id == 1 ? transferRepositoryResult : transferRepositoryResult.filter(item => item.us_id_receiver == input.us_id_operator);
        this.setState({ isLoadDone: !this.state.isLoadDone });

    }

    onCellTable = (item: TranferRepositoryDto) => {
        this.transferRepositorySelected = item;
        this.setState({ visibleModal: true });
    }

    handleSearch = () => {
        this.setState({ isLoadDone: false });
        const { transferRepositoryResult } = stores.transferRepositoryStore;
        this.listProduct = [...transferRepositoryResult];
        if (this.state.tr_re_code != undefined) {
            this.listProduct = this.listProduct.filter(item => item.tr_re_code?.includes(this.state.tr_re_code!));
        }

        if (this.state.tr_re_status != undefined) {
            this.listProduct = this.listProduct.filter(item => item.tr_re_status == Number(this.state.tr_re_status!));
        }
        this.setState({ isLoadDone: true });
    }
    onClearSearch = async () => {
        await this.setState({
            tr_re_code: undefined,
            tr_re_status: undefined,
        });
        this.handleSearch();
    }
    render() {
        const { } = this.props
        let self = this;
        const columns: ColumnsType<TranferRepositoryDto> = [
            { title: "STT", key: "stt_fresh_drink_index", width: 50, render: (text: string, item: TranferRepositoryDto, index: number) => <div>{this.state.pageSize * (this.state.currentPage - 1) + (index + 1)}</div> },
            {
                title: "Mã phiếu nhập", className: "hoverCell", key: "tr_re_code", onCell: (item: TranferRepositoryDto) => {
                    return { onClick: () => this.onCellTable(item) }
                }, render: (text: string, item: TranferRepositoryDto) => <div title='Xem chi tiết'>{item.tr_re_code}</div>
            },
            { title: "Tổng số sản phẩm", sorter: (a, b) => a.listProductTranfer!.length - b.listProductTranfer!.length, key: "tr_re_code", render: (text: string, item: TranferRepositoryDto) => <div> {item.listProductTranfer?.length} </div> },
            { title: "Tổng số lượng", sorter: (a, b) => a.tr_re_total_quantity - b.tr_re_total_quantity, key: "tr_re_total_quantity", render: (text: string, item: TranferRepositoryDto) => <div> {AppConsts.formatNumber(item.tr_re_total_quantity)} </div> },
            { title: "Tổng tiền hàng", sorter: (a, b) => a.tr_re_total_money - b.tr_re_total_money, key: "tr_re_total_money", render: (text: string, item: TranferRepositoryDto) => <div> {AppConsts.formatNumber(item.tr_re_total_money)} </div> },
            {
                title: "Trạng thái nhập kho", key: "tr_re_status", dataIndex: 'tr_re_status', render: (text: string, item: TranferRepositoryDto) => <div>

                    <>
                        {item.tr_re_status === eTranferRepositoryStatus.TEMPORARY.num && (
                            <Tag color="magenta">{valueOfeTranferRepositoryStatus(item.tr_re_status)}</Tag>
                        )}
                        {item.tr_re_status === eTranferRepositoryStatus.REQUEST.num && (
                            <Tag color="processing">{valueOfeTranferRepositoryStatus(item.tr_re_status)}</Tag>
                        )}
                        {item.tr_re_status === eTranferRepositoryStatus.RECEIVED.num && (
                            <Tag color="gold">{valueOfeTranferRepositoryStatus(item.tr_re_status)}</Tag>
                        )}
                        {item.tr_re_status === eTranferRepositoryStatus.CONFIRM.num && (
                            <Tag color="geekblue">{valueOfeTranferRepositoryStatus(item.tr_re_status)}</Tag>
                        )}
                        {item.tr_re_status === eTranferRepositoryStatus.IMPORTED.num && (
                            <Tag color="success">{valueOfeTranferRepositoryStatus(item.tr_re_status)}</Tag>
                        )}
                    </>

                </div>
            },
            { title: "Thời gian tạo", sorter: (a, b) => moment(a.tr_re_created_at).unix() - moment(b.tr_re_created_at).unix(), key: "im_re_imported_at", render: (text: string, item: TranferRepositoryDto) => <div>{moment(item.tr_re_created_at).format("DD/MM/YYYY HH:mm")}</div> },
            // { title: "Thời gian nhập", sorter: (a, b) => moment(a.im_re_created_at).unix() - moment(b.im_re_created_at).unix(), key: "im_re_imported_at", render: (text: string, item: TranferRepositoryDto) => <div>{moment(item.im_re_created_at).format("DD/MM/YYYY HH:mm")}</div> },

        ];
        return (
            <>
                <Row gutter={[8, 8]} align='bottom'>
                    <Col span={5}>
                        <strong>Mã phiếu nhập</strong>
                        <Input placeholder='Nhập tìm kiếm...' value={this.state.tr_re_code} onChange={async (e) => { await this.setState({ tr_re_code: e.target.value }); this.handleSearch() }} />
                    </Col>
                    <Col span={5}>
                        <strong>Trạng thái nhập kho</strong>
                        <SelectEnum
                            enum_value={this.state.tr_re_status}
                            eNum={eTranferRepositoryStatus}
                            onChangeEnum={async (value) => { await this.setState({ tr_re_status: value }); this.handleSearch() }}
                        ></SelectEnum>
                    </Col>
                    <Col span={9} style={{ display: "flex", flexWrap: "wrap", padding: 0 }} >
                        <Col>
                            <Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={this.handleSearch} >{(window.innerWidth >= 576 && window.innerWidth <= 992) ? 'Tìm' : 'Tìm kiếm'}</Button>
                        </Col>
                        {
                            (!!this.state.tr_re_code || !!this.state.tr_re_status || this.state.tr_re_status! > -1) &&
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
                    rowKey={record => record.tr_re_id}
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
                    title={<strong>{"Mã chuyển kho" + this.transferRepositorySelected.tr_re_code}</strong>}
                    visible={this.state.visibleModal}
                    onCancel={() => this.setState({ visibleModal: false })}
                    footer={null}
                    destroyOnClose={true}
                    maskClosable={true}
                >
                    {this.props.repository?.re_id == 1 ?
                        <DetailInfomationTranferRepositoryAdmin transferRepostitorySelected={this.transferRepositorySelected} />
                        :
                        <DetailInfomationTranferRepositoryUser transferRepostitorySelected={this.transferRepositorySelected} />

                    }
                </Modal>
            </>

        )
    }
}