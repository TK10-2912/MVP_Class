import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { pageSizeOptions } from '@src/lib/appconst';
import { RepositoryDto, ExportRepositoryDto, ProductExportDto } from '@src/services/services_autogen';
import { Button, Col, Input, Modal, Row, Table, Tag } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import { stores } from '@src/stores/storeInitializer';
import { SorterResult } from 'antd/lib/table/interface';
import TableProductExport from '@src/scenes/GeneralManager/ExportRepository/componentAdmin/TableProductExport';
import { Link } from 'react-router-dom';
import SelectEnum from '@src/components/Manager/SelectEnum';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';
import SelectedGroupMachine from '@src/components/Manager/SelectedGroupMachine';

export interface IProps {
    repository?: RepositoryDto;
    changeColumnSortExportRepository?: (fieldSort: SorterResult<ExportRepositoryDto> | SorterResult<ExportRepositoryDto>[]) => void;
}
export default class TableExportRepository extends AppComponentBase<IProps> {
    state = {
        isLoadDone: true,
        pr_id_selected: undefined,
        ex_re_code: undefined,
        ma_id_list: [] as number[],
        gr_ma_id: undefined,
        listIdProduct: 0,
        visibleModalProductExport: false,
        pageSize: 10,
        currentPage: 1,
    }
    listProduct: ExportRepositoryDto[] = [];
    listProductExport: ProductExportDto[] = [];
    title: string = "";
    componentDidMount() {

        this.initData(this.props.repository!);
    }
    initData = (input: RepositoryDto) => {
        const { exportRepositoryListResult } = stores.exportRepositoryStore;
        if (input.us_id_operator != undefined) {
            this.listProduct = exportRepositoryListResult.filter(item => item.us_id_operator == input.us_id_operator);
        }
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }
    initListProduct = async (item: ExportRepositoryDto) => {
        this.listProductExport = item.listProductExport!;
        this.title = item.ex_re_code!;
        this.setState({ visibleModalProductExport: true });
    }
    handleSearch = () => {
        const { exportRepositoryListResult } = stores.exportRepositoryStore;

        this.listProduct = exportRepositoryListResult.slice();

        if (this.state.ex_re_code != undefined) {
            this.listProduct = this.listProduct.filter(item => item.ex_re_code?.includes(this.state.ex_re_code!));
        }

        if (this.state.gr_ma_id != undefined) {
            var listMachineId = stores.sessionStore.getAllMachineIdByGroupMachineId(this.state.gr_ma_id!);
            this.listProduct = this.listProduct.filter(item => listMachineId.includes(item.ma_id));
        }
        if (this.state.ma_id_list.length > 0) {
            this.listProduct = this.listProduct.filter(item => this.state.ma_id_list!.includes(item.ma_id));
        }
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }
    onClearSearch = async () => {
        await this.setState({
            ex_re_code: undefined,
            gr_ma_id: undefined,
            ma_id_list: [],
        });
        this.handleSearch();
    }
    render() {
        const columns: ColumnsType<ExportRepositoryDto> = [
            { title: "STT", key: "stt_fresh_drink_index", width: 50, render: (text: string, item: ExportRepositoryDto, index: number) => <div>{this.state.pageSize! * (this.state.currentPage! - 1) + (index + 1)}</div> },
            {
                title: "Mã xuất", key: "im_re_code", className: "hoverCell", onCell: (item: ExportRepositoryDto) => {
                    return {
                        onClick: (event) => this.initListProduct(item)
                    }
                }, render: (text: string, item: ExportRepositoryDto) => <div> {item.ex_re_code} </div>
            },
            {
                title: 'Nhóm máy', key: 'ma_name',
                render: (text: string, item: ExportRepositoryDto) =>
                    <div title={`Xem chi tiết nhóm máy ${stores.sessionStore.getNameGroupUseMaId(item.ma_id)}`}>
                        <Link target="_blank" to={"/general/machine/?gr_id=" + stores.sessionStore.getNameGroupUseMaId(item.ma_id)} onClick={e => { e.stopPropagation() }} >
                            {stores.sessionStore.getNameGroupUseMaId(item.ma_id)}
                        </Link>
                    </div>
            },
            {
                title: "Máy bán nước", sorter: false, dataIndex: "ma_id", key: "ma_id", render: (text: number, item: ExportRepositoryDto) => <div title="Chi tiết máy">
                    <Link target='_blank' to={"/general/machine/?machine=" + stores.sessionStore.getCodeMachines(item.ma_id)} >
                        <p>{stores.sessionStore.getCodeMachines(item.ma_id)}</p>
                        <p title={stores.sessionStore.getNameMachines(item.ma_id)} style={{
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            margin: 0
                        }}>{stores.sessionStore.getNameMachines(item.ma_id)}</p>
                    </Link>
                </div>
            },
            { title: "Tổng số sản phẩm", sorter: (a, b) => a.listProductExport!.length - b.listProductExport!.length, key: "im_re_code", render: (text: string, item: ExportRepositoryDto) => <div> {AppConsts.formatNumber(item.listProductExport?.length)} </div> },
            { title: "Tổng số lượng", sorter: (a, b) => a.ex_re_quantity - b.ex_re_quantity, key: "im_re_code", render: (text: string, item: ExportRepositoryDto) => <div> {AppConsts.formatNumber(item.ex_re_quantity)} </div> },
            {
                title: "Thời gian xuất",
                key: "im_re_imported_at",
                render: (text: string, item: ExportRepositoryDto) => (
                    <div>{moment(item.ex_re_export_at).format("DD/MM/YYYY HH:mm")}</div>
                ),
                sorter: (a: ExportRepositoryDto, b: ExportRepositoryDto) => {
                    const dateA = moment(a.ex_re_export_at);
                    const dateB = moment(b.ex_re_export_at);
                    return dateA.diff(dateB);
                },
            }


        ];
        return (
            <>
                <Row gutter={[8, 8]} align='bottom'>
                    <Col span={5}>
                        <strong>Mã phiếu xuất</strong>
                        <Input placeholder='Nhập tìm kiếm...' value={this.state.ex_re_code} onChange={async (e) => { await this.setState({ ex_re_code: e.target.value }); this.handleSearch() }} />
                    </Col>
                    <Col span={5}>
                        <strong>Nhóm máy</strong>
                        <SelectedGroupMachine
                            groupmachineId={this.state.gr_ma_id}
                            onChangeGroupMachine={async (value) => { await this.setState({ gr_ma_id: value }); this.handleSearch() }}
                        ></SelectedGroupMachine>
                    </Col>
                    <Col span={5}>
                        <strong>Máy</strong>
                        <SelectedMachineMultiple
                            groupMachineId={this.state.gr_ma_id}
                            listMachineId={this.state.ma_id_list}
                            onChangeMachine={async (value) => { await this.setState({ ma_id_list: value ?? [] }); this.handleSearch() }}
                        ></SelectedMachineMultiple>
                    </Col>
                    <Col span={9} style={{ display: "flex", flexWrap: "wrap", padding: 0 }} >
                        <Col>
                            <Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={this.handleSearch} >{(window.innerWidth >= 576 && window.innerWidth <= 992) ? 'Tìm' : 'Tìm kiếm'}</Button>
                        </Col>
                        {
                            (!!this.state.ex_re_code || this.state.ma_id_list.length > 0 || this.state.gr_ma_id) &&
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
                    onChange={(a, b, sort: SorterResult<ExportRepositoryDto> | SorterResult<ExportRepositoryDto>[]) => {
                        if (!!this.props.changeColumnSortExportRepository) {
                            this.props.changeColumnSortExportRepository(sort);
                        }
                    }}
                    size={'small'}
                    bordered={true}
                    
                    dataSource={this.listProduct}
                    rowKey={record => record.ex_re_id}
                    pagination={{
                        position: ['topRight'],
                        total: this.props.repository ? this.listProduct!.length : 0,
                        showTotal: (tot) => "Tổng" + ": " + tot + "",
                        showQuickJumper: true,
                        showSizeChanger: true,
                        pageSizeOptions: pageSizeOptions,
                        pageSize: this.state.pageSize,
                        onChange: (page: number, pageSize?: number) => {
                            this.setState({ pageSize, currentPage: page });
                        },
                    }}
                />

                <Modal
                    width={'50vw'}
                    destroyOnClose={true}
                    visible={this.state.visibleModalProductExport}
                    footer={null}
                    onCancel={() => this.setState({ visibleModalProductExport: false })}
                    cancelText="Huỷ"
                >
                    <TableProductExport
                        title={this.title}
                        listProduct={this.listProductExport}
                        isModal={true}
                    />
                </Modal>
            </>

        )
    }
}