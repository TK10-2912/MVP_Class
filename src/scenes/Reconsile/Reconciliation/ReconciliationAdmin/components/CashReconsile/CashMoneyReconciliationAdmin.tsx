import * as React from 'react';
import { Button, Card, Col, Modal, Row, Tabs, message } from 'antd';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import { stores } from '@src/stores/storeInitializer';
import { ReconcileCashDetailDto, ReconcileCashDto, ReconcileDto, WithdrawDto } from '@src/services/services_autogen';
import { eSort } from '@src/lib/enumconst';
import { ExportOutlined, StepBackwardOutlined } from '@ant-design/icons';
import { isGranted } from '@src/lib/abpUtility';
import moment from 'moment';
import ModalExportBillingReconcileAdmin from './ModalExportBillingReconcileAdmin';
import SearchReconcileAdmin, { SearchReconcileInputAdmin } from '@src/components/Manager/SearchReconcileAdmin';
import { SorterResult } from 'antd/lib/table/interface';
import TableMainReconcileCashAdmin from './TableMainReconcileBankAdmin';
import TableBillingCashViewAdmin from './TableBillingCashViewAdmin';
import TableReconcileCashDetailAdmin from './TableReconcileCashDetailAdmin';
import TableMonthReconcileCashAdmin from './TableMonthReconcileBankAdmin';
import ModalExportMonthCashReconcileAdmin from './ModalExportMonthCashReconcileAdmin';

export interface Iprops {
    tab?: string;
}
const { confirm } = Modal;
export class ReconcileMonthCashDisplay {
    public rec_month: string;
    public tienhethong: number;
    public tiennganhang: number;
    public tienhoantra: number;
    public ReconcileMonthCashDisplay(rec_month: string, tienhethong: number, tiennganhang: number, tienhoantra: number) {
        this.rec_month = rec_month;
        this.tienhethong = tienhethong;
        this.tiennganhang = tiennganhang;
        this.tienhoantra = tienhoantra;
    }
}
export default class CashMoneyReconciliationAdmin extends React.Component<Iprops> {
    state = {
        visibleImportExcel: false,
        visibleModalBillingDetail: false,
        visibleReconcileCashDetail: false,
        visibleExportExcelDetail: false,
        visibleExportExcel: false,
        visibleExportExcelBillingDetail: false,
        isLoadDone: false,
        rec_type: 0,
        us_id_list: undefined,
        skipCount: 0,
        currentPage: 1,
        pageSize: 10,
        tab: "",
        start_date: undefined,
        end_date: undefined,
        gr_ma_id: undefined,
        ma_id_list: undefined,
        bi_reconcile_status: undefined,
        re_status: undefined,
        rec_month: moment().month(),
        visibleExportMainReconcile: false,
        sort: undefined,
        isReload: false,
    }
    reconcileDto: ReconcileDto = new ReconcileDto();
    reconcileCashDtoSelected: ReconcileCashDto = new ReconcileCashDto();
    listReconcileDetail: ReconcileCashDetailDto[] = [];
    listReconcileDetailSelect: ReconcileCashDetailDto = new ReconcileCashDetailDto();
    withdraw: WithdrawDto;
    dicItem: { [key: string]: ReconcileCashDto[] } = {};
    reconcileMonthList: ReconcileMonthCashDisplay[] = [];
    rec_id: number = 0;
    selectedField: string;
    total: number;

    async componentDidMount() {
        await stores.billingStore.getAllByAdmin(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined)
    }
    actionTable = async (item: ReconcileCashDetailDto, event: EventTable, checked?: boolean) => {
        if (event === EventTable.View) {
            if (item != undefined) {
                this.reconcileCashDtoSelected.init(item);
                this.setState({ visibleReconcileCashDetail: true });
            }
            else message.warning("Không có dữ liệu");
        }
        else if (event == EventTable.Accept) {
            if (item != undefined) {
                let self = this;
                confirm({
                    title: <h3><span>{"Vui lòng kiểm tra kỹ các đơn hàng trước khi xác nhận, sau khi xác nhận sẽ "}</span><span style={{ color: "red" }}>không thể thay đổi thông tin đơn hàng?</span></h3>,
                    okText: "Xác nhận",
                    cancelText: "Hủy",
                    async onOk() {
                        await stores.reconcileStore.confirmReconcile(item.rec_id);
                        await self.getAll();
                        message.success("Xác nhận thành công !")
                        self.setState({ isLoadDone: !self.state.isLoadDone });
                    },
                    onCancel() {
                    },
                });
            }
        }
    }

    getListDataDisplay = async () => {
        const { reconcileCashListDto } = stores.reconcileStore;
        this.reconcileMonthList = [];
        this.dicItem = {};
        if (!reconcileCashListDto || reconcileCashListDto.length === 0) {
            return;
        }
        reconcileCashListDto.forEach((item) => {
            if (item.rec_month) {
                if (!this.dicItem[item.rec_month]) {
                    this.dicItem[item.rec_month] = [];
                }
                this.dicItem[item.rec_month].push(item);
            }
        });
        Object.entries(this.dicItem).forEach(([key, value]) => {
            const data: ReconcileMonthCashDisplay = new ReconcileMonthCashDisplay();
            data.rec_month = key;
            data.tienhethong = value.reduce((total, current) => total + current.rec_total_money_calculated, 0)
            data.tiennganhang = value.reduce((total, current) => total + current.rec_total_money_reality, 0)
            data.tienhoantra = value.reduce((total, current) => total + current.rec_refund_money, 0)
            this.reconcileMonthList.push(data);
        });
        this.setState({ isLoadDone: !this.state.isLoadDone });
    };

    getAll = async () => {
        await stores.reconcileStore.getAllReconcileCashByAdmin(this.state.gr_ma_id, this.state.ma_id_list, this.state.end_date, this.state.re_status, this.state.us_id_list, this.selectedField, this.state.sort, this.state.skipCount, this.state.pageSize);
        if (this.reconcileCashDtoSelected.ma_id != undefined) {
            const { reconcileCashListDto } = stores.reconcileStore;
            const result = reconcileCashListDto.find(item => item.ma_id == this.reconcileCashDtoSelected.ma_id)
            this.reconcileCashDtoSelected = result != undefined ? result : new ReconcileCashDto()
            this.setState({ isReload: false })
        }
        await this.getListDataDisplay();

        this.setState({ isLoadDone: !this.state.isLoadDone });
    }
    onChangePage = async (page: number, pagesize?: number) => {
        if (pagesize !== undefined) {
            await this.setState({ pageSize: pagesize! });
        }
        await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            this.getAll();
        })

    }
    getSuccess = async () => {
        await this.getAll();
    }
    onSearchStatisticAdmin = async (input: SearchReconcileInputAdmin) => {
        await this.setState({ us_id_list: input.us_id, re_status: input.status, start_date: input.start_date ? input.start_date : undefined, end_date: input.start_date ? moment(input.end_date).format("M/YYYY") : undefined, gr_ma_id: input.gr_ma_id, ma_id_list: input.ma_id_list });
        this.onChangePage(1, this.state.pageSize);

    }
    changeColumnSort = async (sort: SorterResult<ReconcileCashDto> | SorterResult<ReconcileCashDto>[]) => {
        this.setState({ isLoadDone: false });
        this.selectedField = sort['field'];
        await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
        this.reconcileCashDtoSelected = new ReconcileCashDto();
        await this.getAll();
        this.setState({ isLoadDone: true });

    }
    openVisibleMainReconcile = (record: ReconcileCashDto) => {
        this.reconcileCashDtoSelected.init(record);
        this.setState({ visibleExportMainReconcile: true, isReload: true, isLoadDone: !this.state.isLoadDone })
    }
    expandedRowRender = (record: ReconcileCashDetailDto) => {
        let self = this;
        const { billListResult } = stores.billingStore
        return (
            <>
                <Row>
                    <Col span={24}>
                        <h2>{`Danh sách đơn hàng`}</h2>
                    </Col>
                </Row>
                <TableBillingCashViewAdmin
                    onSuccess={this.getAll}
                    hasAction={true}
                    listIdBill={record.listBillingId!}
                    billListResult={billListResult}
                    pagination={{
                        position: ['topRight'],
                        pageSize: this.state.pageSize,
                        total: this.listReconcileDetail.length,
                        current: this.state.currentPage,
                        showTotal: (tot) => ("Tổng: ") + tot + "",
                        showQuickJumper: true,
                        showSizeChanger: true,
                        pageSizeOptions: pageSizeOptions,
                        onShowSizeChange(current: number, size: number) {
                            self.onChangePage(current, size)
                        },
                        onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
                    }}
                />
            </>
        )
    }
    expandedRowRenderOfMonth = (record: ReconcileMonthCashDisplay) => {
        return (
            <Tabs>
                <Tabs.TabPane tab={"Danh sách chi tiết máy"} > <Col {...cssColResponsiveSpan(24, 24, 12, 9, 6, 6)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'end' }}>
                </Col>
                    <TableMainReconcileCashAdmin
                        listReconsile={this.dicItem[record.rec_month]}
                        openVisibleMainReconcile={this.openVisibleMainReconcile}
                        changeColumnSort={this.changeColumnSort}
                        hasAction={true}
                        is_printed={false}
                    />
                </Tabs.TabPane>

            </Tabs>

        )
    }
    render() {
        let self = this;
        const left = this.state.visibleExportMainReconcile ? cssCol(0) : cssCol(24);
        const right = this.state.visibleExportMainReconcile ? cssCol(24) : cssCol(0);
        return (
            <Card>
                <Col {...left}>
                    <Row gutter={[8, 8]}>
                        <Col {...cssColResponsiveSpan(24, 24, 12, 15, 18, 18)}>
                            <SearchReconcileAdmin hideSearch={false} onSearchStatistic={(input) => this.onSearchStatisticAdmin(input)} />
                        </Col>
                        <Col {...cssColResponsiveSpan(24, 24, 12, 9, 6, 6)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'end' }}>
                            {isGranted(AppConsts.Permission.Pages_Reconcile_Reconcile_Export) &&
                                <Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcel: true })}>Xuất dữ liệu</Button>
                            }
                        </Col>
                    </Row>
                    <TableMonthReconcileCashAdmin
                        listReconsile={this.reconcileMonthList}
                        expandedRowRender={this.expandedRowRenderOfMonth}
                        hasAction={true}
                        is_printed={false}
                        pagination={{
                            position: ['topRight'],
                            pageSize: this.state.pageSize,
                            total: this.dicItem != undefined ? Object.entries(this.dicItem || {}).length : 0,
                            current: this.state.currentPage,
                            showTotal: (tot) => 'Tổng: ' + tot + '',
                            showQuickJumper: true,
                            showSizeChanger: true,
                            pageSizeOptions: pageSizeOptions,
                            onShowSizeChange(current: number, size: number) {
                                self.onChangePage(current, size);
                            },
                            onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize),
                        }}
                    />

                </Col>
                {this.state.visibleExportMainReconcile &&
                    <Col {...right}>
                        <Row>
                            <Button style={{ marginBottom: 5 }} size='middle' onClick={() => this.setState({ visibleExportMainReconcile: false, isReload: false })} icon={<StepBackwardOutlined />} title='Quay lại trang chính'></Button>
                            &nbsp;&nbsp;<h2>Chi tiết đối soát giao dịch từng máy của đối soát tháng {this.reconcileCashDtoSelected.rec_month}</h2>
                        </Row>
                        <TableReconcileCashDetailAdmin
                            onSuccess={this.getAll}
                            expandedRowRender={this.expandedRowRender}
                            has_action={true}
                            is_printed={false}
                            isReload={this.state.isReload}
                            actionTable={this.actionTable}
                            listReconciliationResult={this.reconcileCashDtoSelected.listReconcile}
                            pagination={{
                                position: ['topRight'],
                                pageSize: this.state.pageSize,
                                total: this.reconcileCashDtoSelected.listReconcile != undefined ? this.reconcileCashDtoSelected.listReconcile.length : 0,
                                current: this.state.currentPage,
                                showTotal: (tot) => ("Tổng: ") + tot + "",
                                showQuickJumper: true,
                                showSizeChanger: true,
                                pageSizeOptions: pageSizeOptions,
                                onShowSizeChange(current: number, size: number) {
                                    self.onChangePage(current, size)
                                },
                                onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
                            }}
                        />
                    </Col>
                }

                {
                    this.state.visibleExportExcel &&
                    <ModalExportMonthCashReconcileAdmin
                        listData={this.reconcileMonthList}
                        onCancel={() => { this.setState({ visibleExportExcel: false }) }}
                        visible={this.state.visibleExportExcel}
                    />
                }

                {
                    this.state.visibleExportExcelBillingDetail &&
                    <ModalExportBillingReconcileAdmin
                        reconcile={this.reconcileDto!}
                        visible={this.state.visibleExportExcelBillingDetail}
                        onCancel={() => { this.setState({ visibleExportExcelBillingDetail: false }) }}
                    />
                }
            </Card >
        )
    }
}