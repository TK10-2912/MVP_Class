import { ChangeStatusTranferRepositoryInput, TranferRepositoryDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Input, Modal, Row, message } from 'antd';
import * as React from 'react';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import { DeleteOutlined, ExportOutlined, PlusOutlined, SearchOutlined, WarningOutlined } from '@ant-design/icons';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { SorterResult } from 'antd/lib/table/interface';
import { eSort, valueOfeTranferRepositoryStatus, } from '@src/lib/enumconst';
import TabTransferRepositoryDetail from './component/TabTransferRepositoryDetail';
import TableTranferRepositoryUser from './component/TableTranferRepositoryDetail';

const { confirm } = Modal;

export interface IProps {
    im_re_id?: number;
    modalImport?: boolean;
}
export default class TransferRepositoryDetailUser extends AppComponentBase<IProps> {
    state = {
        isLoadDone: true,
        tr_re_code: undefined,
        su_id_list: undefined,
        us_id_list: undefined,
        visibleModalCreateUpdate: false,
        visibleExportExcelTransferRepository: false,
        visibleTransferRepositoryDetail: false,
        skipCount: 0,
        onChangePage: 1,
        pageSize: 10,
        currentPage: 1,
        expandRowKeys: [],
        numberSelected: undefined,
        select: false,
        clicked: false,
        sort: undefined,
        fieldSort: undefined,
        status: undefined,
    }
    tranferRepositoryDetailSelected: TranferRepositoryDto = new TranferRepositoryDto();
    listItemDrink: TranferRepositoryDto[] = [];
    keySelected: number[] = [];
    listTransferRepository: TranferRepositoryDto[] = [];

    async componentDidMount() {
        await this.getAll();
    }
    async getAll() {
        this.setState({ isLoadDone: false })
        await stores.transferRepositoryStore.getAll(this.state.tr_re_code, undefined, this.state.fieldSort, this.state.sort, this.state.skipCount, this.state.pageSize);
        this.setState({ isLoadDone: true })

    }

    onUpdateSuccess = () => {
        this.setState({ isLoadDone: false });
        this.getAll();
        this.setState({ isLoadDone: true, })
    }
    handleSubmitSearch = async () => {
        this.onChangePage(1, this.state.pageSize);
    }
    createOrUpdateModalOpen = async (input: TranferRepositoryDto) => {
        this.setState({ isLoadDone: false })
        this.tranferRepositoryDetailSelected.init(input);

        await this.setState({ visibleTransferRepositoryDetail: true });
    }

    actionTable = (tranferRepositoryDetailSelected: TranferRepositoryDto, event: EventTable, status?: number) => {
        if (tranferRepositoryDetailSelected === undefined || tranferRepositoryDetailSelected.tr_re_id === undefined) {
            message.error("Không tìm thấy !");
            return;
        }
        if (event === EventTable.RowDoubleClick) {
            this.createOrUpdateModalOpen(tranferRepositoryDetailSelected);
        }
        else if (event === EventTable.ChangeStatus) {
            const self = this;
            confirm({
                title: <span>Bạn chắc chắn muốn thay đổi trạng thái thành <span style={{ color: "green" }}>{valueOfeTranferRepositoryStatus(tranferRepositoryDetailSelected.tr_re_status+1)}</span>?</span>,
                okText: ('Xác nhận'),
                cancelText: ('Huỷ'),
                async onOk() {
                    var changeStatusTranferRepositoryInput = new ChangeStatusTranferRepositoryInput();
                    changeStatusTranferRepositoryInput.tr_re_id = tranferRepositoryDetailSelected.tr_re_id;
                    changeStatusTranferRepositoryInput.tr_re_status = status!;
                    await stores.transferRepositoryStore.changeStatus(changeStatusTranferRepositoryInput);
                    message.success("Đổi trạng thái thành công!")
                    self.setState({ isLoadDone: !self.state.isLoadDone, numberSelected: 0 });
                },
                onCancel() {
                },
            })
        }
    }
    onChangePage = async (page: number, pagesize?: number) => {
        if (pagesize !== undefined) {
            await this.setState({ pageSize: pagesize! });
        }
        await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            this.getAll();
        })
    }
    changeColumnSort = async (sort: SorterResult<TranferRepositoryDto> | SorterResult<TranferRepositoryDto>[]) => {
        this.setState({ isLoadDone: false });
        await this.setState({ fieldSort: sort['columnKey'] });
        await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
        await this.getAll();
        this.setState({ isLoadDone: true });
    }
    onCreateUpdateSuccess = () => {
        this.setState({ isLoadDone: false });
        this.getAll();
        this.setState({ isLoadDone: true, visibleModalCreateUpdate: false, })
    }

    clearSearch = async () => {
        await this.setState({
            tr_re_code: undefined,
            us_id_list: undefined,
            su_id_list: undefined,
            status: undefined,
        })
        this.handleSubmitSearch();
    }
    hide = () => {
        this.setState({ clicked: false });
    }
    handleVisibleChange = (visible) => {
        this.setState({ clicked: visible });
    }
    shouldChangeText = () => {
        const isChangeText = window.innerWidth <= 768;
        return !isChangeText;
    }
    exportData = () => {
        this.setState({ visibleExportExcelTransferRepository: true, select: false });

    };
    openBillTransferRepository = async (record: TranferRepositoryDto) => {
        this.setState({ isLoadDone: false });
        await this.tranferRepositoryDetailSelected.init(record);
        this.setState({ visibleTransferRepositoryDetail: true, isLoadDone: true });
    }

    render() {
        let self = this;
        const left = this.state.visibleModalCreateUpdate ? cssCol(0) : cssCol(24);
        const right = this.state.visibleModalCreateUpdate ? cssCol(24) : cssCol(0);
        const { transferRepositoryResult, totalTransferRepository } = stores.transferRepositoryStore;

        return (
            !this.state.visibleTransferRepositoryDetail ?
                <Card>
                    <Row gutter={[8, 8]} align='bottom'>
                        <Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)}>
                            <strong>Mã cấp phát</strong>
                            <Input
                                allowClear={true}
                                onChange={async (e) => { await this.setState({ tr_re_code: e.target.value }); this.handleSubmitSearch() }} placeholder={"Nhập mã..."}
                                value={this.state.tr_re_code}
                                onPressEnter={(e) => this.onChangePage(1, this.state.pageSize)}

                            />

                        </Col>
                        <Col {...cssColResponsiveSpan(24, 24, 12, 8, 8, 8)} style={{ display: "flex", flexWrap: "wrap", gap: 8 }} >
                            <Button type="primary" icon={<SearchOutlined />} title="Tìm kiếm" onClick={() => this.handleSubmitSearch()} >Tìm kiếm</Button>
                            {(!!this.state.su_id_list || !!this.state.tr_re_code || !!this.state.us_id_list || !!this.state.status) &&
                                <Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >Xóa tìm kiếm</Button>
                            }
                        </Col>
                        <Col {...cssColResponsiveSpan(24, 24, 12, 10, 10, 10)} style={{ display: "flex", flexWrap: "wrap", justifyContent: "end", gap: 8 }}>
                            {!this.isGranted(AppConsts.Permission.Pages_Manager_General_TransferRepository_Create) &&

                                <Button title='Tạo yêu cầu' type="primary" icon={<PlusOutlined />} onClick={() => { this.setState({ visibleTransferRepositoryDetail: true }); this.tranferRepositoryDetailSelected = new TranferRepositoryDto() }}>{this.shouldChangeText() && 'Tạo yêu cầu'}</Button>
                            }
                            {!this.isGranted(AppConsts.Permission.Pages_Manager_General_TransferRepository_Export) &&
                                <Button title='Xuất dữ liệu danh sách nhập kho' type="primary" icon={<ExportOutlined />} onClick={() => this.exportData()} >{this.shouldChangeText() && 'Xuất dữ liệu'}</Button>
                            }
                        </Col>
                    </Row>

                    <Row>
                        <Col {...left} >
                            <TableTranferRepositoryUser
                                changeColumnSort={this.changeColumnSort}
                                actionTable={this.actionTable}
                                hasAction={true}
                                onUpdate={() => this.onUpdateSuccess()}
                                isPrint={false}
                                noScroll={true}
                                openBillTransferRepository={this.openBillTransferRepository}
                                onSuccess={() => this.handleSubmitSearch()}
                                transferRepositoryDetailResult={transferRepositoryResult}
                                isLoadDone={this.state.isLoadDone}
                                pagination={{
                                    position: ['topRight'],
                                    pageSize: this.state.pageSize,
                                    total: totalTransferRepository,
                                    current: this.state.currentPage,
                                    showTotal: (tot) => ("Tổng: ") + tot + "",
                                    showQuickJumper: true,
                                    showSizeChanger: true,
                                    pageSizeOptions: pageSizeOptions,
                                    onShowSizeChange(current: number, size: number) {
                                        self.onChangePage(current, size);
                                    },
                                    onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
                                }}
                            />
                        </Col>
                    </Row>
                    {/* <Col {...right}>
                        {this.state.visibleModalCreateUpdate &&
                            <TabTransferRepositoryDetail
                                isVisible={this.state.visibleModalCreateUpdate}
                                onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
                                actionTable={this.actionTable}
                                onSuccess={() => this.onChangePage(1, this.state.pageSize)}
                                tranferRepositoryDetailSelected={this.tranferRepositoryDetailSelected}
                            />
                        }
                    </Col> */}
                </Card>
                :
                <TabTransferRepositoryDetail

                    isVisible={this.props.modalImport != undefined ? this.props.modalImport : this.state.visibleTransferRepositoryDetail}
                    onCancel={() => this.setState({ visibleTransferRepositoryDetail: false })}
                    actionTable={this.actionTable}
                    onSuccess={() => this.onChangePage(1, this.state.pageSize)}
                    tranferRepositoryDetailSelected={this.tranferRepositoryDetailSelected}
                />

        )
    }
}
