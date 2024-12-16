import * as React from 'react';
import { Button, Card, Col, Modal, Row, Space, Tabs, message } from 'antd';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import { stores } from '@src/stores/storeInitializer';
import { BillingDto, ExcelReconcileDto, ReconcileBankDto, ReconcileDto } from '@src/services/services_autogen';
import { eReconcileBillingStatus, eReconsile, eSort } from '@src/lib/enumconst';
import { ExportOutlined, StepBackwardOutlined } from '@ant-design/icons';
import { isGranted } from '@src/lib/abpUtility';
import TableReconcileBankAdmin from './TableReconcileBankAdmin';
import TableBillingViewAdmin from './TableBillingViewAdmin';
import UpdateBillingReconcileAdmin from './UpateBillingReconcileAdmin';
import TableListBillingOnlyInExcelAdmin from './TableListBillingOnlyInExcelAdmin';
import UpdateBillingOnlyExcelReconcileAdmin from './UpdateBillingOnlyExcelReconcileAdmin';
import ModalImportBankReconciliationAdmin from './ModalImportBankReconciliationAdmin';
import ModalExportBankReconcolelAdmin from './ModalExportBankReconcoleAdmin';
import ReconcileLogs from '@src/scenes/Reconsile/ReconcilLogs';
import SearchReconcileAdmin, {
    SearchReconcileInputAdmin,
} from '@src/components/Manager/SearchReconcileAdmin';
import { SorterResult } from 'antd/lib/table/interface';
import TableMainReconcileBankAdmin from './TableMainReconcileBankAdmin';
import ModalExportBankReconcilelMainAdmin from './ModalExportMainReconcileBankAdmin';
export interface Iprops {
    tab?: string;
}
const { confirm } = Modal;
export const tabManager = {
    tab_1: "Danh sách đơn hàng trên hệ thống",
    tab_2: "Danh sách đơn hàng chỉ có ở Excel",
}
export default class BankReconciliationAdmin extends React.Component<Iprops> {
    state = {
        visibleImportExcel: false,
        visibleExportExcel: false,
        visibleViewBilling: false,
        visibleUpdateStatusReconcile: false,
        visibleUpdateStatusReconcileOnlyExcel: false,
        visibleModalLogReconcile: false,
        visibleExportExcelDetail: false,
        visibleExportMainReconcile: false,
        isLoadDone: true,
        rec_type: eReconsile.QR.num,
        skipCount: 0,
        currentPage: 1,
        pageSize: 10,
        tab: '',
        start_date: undefined,
        end_date: undefined,
        gr_ma_id: undefined,
        ma_id_list: undefined,
        us_id: undefined,
        re_status: undefined,
        sort: undefined,
        month: undefined,
        isReload: false,
    };
    listBilling: BillingDto[] = [];
    billingList: BillingDto[] = [];
    listBillingExcel: ExcelReconcileDto[] = [];
    reconcileDto: ReconcileDto = new ReconcileDto();
    billingSelected: BillingDto = new BillingDto();
    onlyExcelReconcile: ExcelReconcileDto = new ExcelReconcileDto();
    bi_code_logs: string = '';
    selectedField: string;
    reconcileBankReconcile: ReconcileBankDto = new ReconcileBankDto();
    async componentDidMount() {
        await this.getAll();
    }

    handleSubmitSearch = async () => {
        this.onChangePage(1, 10);
    };
    onChangePage = async (page: number, pagesize?: number) => {
        if (pagesize !== undefined) {
            await this.setState({ pageSize: pagesize! });
        }
        this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            this.getAll();
        });
    };
    getAll = async () => {
        await Promise.all([
            stores.reconcileStore.getAllBankReconcileByAdmin(
                this.state.us_id,
                this.state.month,
                this.state.start_date,
                this.state.end_date,
                this.state.gr_ma_id,
                this.state.ma_id_list,
                this.state.re_status,
                this.selectedField,
                this.state.sort,
                this.state.skipCount,
                undefined
            ),
            stores.billingStore.getAllByAdmin(
                undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined
            )
        ]);
        const { billListResult } = stores.billingStore;
        this.listBilling = billListResult.slice();
        this.billingList = billListResult.slice();
        if (this.reconcileBankReconcile.rec_month != undefined) {
            const { reconcileBankDto } = stores.reconcileStore;
           const result =reconcileBankDto.find(item => item.rec_month == this.reconcileBankReconcile.rec_month)
           this.reconcileBankReconcile = result != undefined ? result :new ReconcileBankDto() ;
           console.log(11111, this.reconcileBankReconcile );
           
           this.setState({isReload: false})
        }
        await this.setState({ isLoadDone: !this.state.isLoadDone });
    };
    actionTableBilling = async (bill: BillingDto, event: EventTable) => {
        if (event == EventTable.Edit) {
            this.billingSelected.init(bill);
            this.setState({ visibleUpdateStatusReconcile: true });
        }
        if (event == EventTable.View) {
            this.billingSelected.init(bill);
            this.bi_code_logs = this.billingSelected.bi_code!;
            this.setState({ visibleModalLogReconcile: true });
        }
    };
    changeColumnSort = async (sort: SorterResult<ReconcileBankDto> | SorterResult<ReconcileBankDto>[]) => {
        this.setState({ isLoadDone: false });
        this.selectedField = sort['field'];
        await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
        this.reconcileBankReconcile = new ReconcileBankDto() ;
        await this.getAll();
        this.setState({ isLoadDone: true });
    }

    actionTableBillingOnlyExcel = async (input: ExcelReconcileDto, event: EventTable) => {
        if (event == EventTable.Edit) {
            this.onlyExcelReconcile.init(input);
            this.setState({ visibleUpdateStatusReconcileOnlyExcel: true });
        }
        if (event == EventTable.View) {
            this.onlyExcelReconcile.init(input);
            this.bi_code_logs = this.onlyExcelReconcile.ex_code?.split("-")[0]!;
            this.setState({ visibleModalLogReconcile: true });
        }
    };
    actionTableReconcileBank = async (
        reconcile: ReconcileDto,
        event: EventTable,
        checked?: boolean
    ) => {
        if (event === EventTable.View) {
            this.reconcileDto.init(reconcile);
            this.listBillingExcel = this.reconcileDto.listBillingOnlyInExcel!;
            this.setState({ visibleViewBilling: true });
        }
        if (event === EventTable.Accept) {
            this.reconcileDto.init(reconcile);
            this.listBillingExcel = this.reconcileDto.listBillingOnlyInExcel!;
            if (reconcile.rec_id > 0) {
                let self = this;
                confirm({
                    title: (
                        <h3>
                            <span>
                                {'Vui lòng kiểm tra kỹ các đơn hàng trước khi xác nhận, sau khi xác nhận sẽ '}
                            </span>
                            <span style={{ color: 'red' }}>không thể thay đổi thông tin đơn hàng?</span>
                        </h3>
                    ),
                    okText: 'Xác nhận',
                    cancelText: 'Hủy',
                    async onOk() {
                        await stores.reconcileStore.confirmReconcile(reconcile.rec_id);
                        await self.getAll();
                        message.success('Xác nhận thành công !');
                        self.setState({ isLoadDone: !self.state.isLoadDone });
                    },
                    onCancel() { },
                });
            }
        }
    };

    getSuccess = async () => {
        await this.setState({ isLoadDone: false });
        await this.getAll();
        this.setState({
            visibleUpdateStatusReconcile: false,
            visibleUpdateStatusReconcileOnlyExcel: false,
        });
        await this.setState({ isLoadDone: true });
    };
    getSuccessImport = async () => {
        await this.getAll();
        this.setState({
            visibleUpdateStatusReconcile: false,
            visibleUpdateStatusReconcileOnlyExcel: false,
            visibleImportExcel: false,
        });
    };
    onSearchStatisticAdmin = async (input: SearchReconcileInputAdmin) => {
        await this.setState({
            re_status: input.status,
            us_id: input.us_id,
            start_date: input.start_date,
            end_date: input.end_date,
            gr_ma_id: input.gr_ma_id,
            ma_id_list: input.ma_id_list,
        });
        this.onChangePage(1, this.state.pageSize);
    };
    openVisibleExportMainReconcile = (record: ReconcileBankDto) => {
        this.reconcileBankReconcile.init(record);
        this.setState({ visibleExportMainReconcile: true, isReload: true, isLoadDone: !this.state.isLoadDone })
    }
    expandedRowRender = (record: ReconcileDto) => {
        const { reconcileBankDto } = stores.reconcileStore;
        return (
            <>
                <Tabs defaultActiveKey={tabManager.tab_1}>
                    <Tabs.TabPane tab={tabManager.tab_1} key={tabManager.tab_1}>
                        <TableBillingViewAdmin
                            isLoadDone={this.state.isLoadDone}
                            rec_id={record.rec_id}
                            billListResult={this.billingList}
                            hasAction={true}
                            actionTable={this.actionTableBilling}
                            onSuccess={() => this.getSuccess()}
                            isConfirm={
                                record.rec_status != eReconcileBillingStatus.NONE.num ? true : false
                            }
                            listBillId={record.listBillingId} />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={tabManager.tab_2} key={tabManager.tab_2}>
                        <TableListBillingOnlyInExcelAdmin
                            onChangeData={(item) => this.listBillingExcel = item}
                            isLoadDone={this.state.isLoadDone}
                            actionTable={this.actionTableBillingOnlyExcel}
                            rec_id={record.rec_id}
                            billListResult={record.listBillingOnlyInExcel}
                            hasAction={true}
                            onSuccess={() => this.getSuccess()}
                            is_confirmed={
                                record.rec_status != eReconcileBillingStatus.NONE.num ? true : false
                            }
                        />
                    </Tabs.TabPane>
                </Tabs >
            </>
        )
    }
    render() {
        const { reconcileBankDto, total } = stores.reconcileStore;
        const { reconcileLogsListDto } = stores.reconcileLogsStore;
        const { billListResult } = stores.billingStore;
        const self = this;
        const left = this.state.visibleExportMainReconcile ? cssCol(0) : cssCol(24);
        const right = this.state.visibleExportMainReconcile ? cssCol(24) : cssCol(0);
        return (
            <Card>
                <Col {...left}>
                    <Row justify="end">
                        
                        <Col {...cssColResponsiveSpan(24,24, 12, 15, 18, 18 )}>
                            <SearchReconcileAdmin hideSearch={false} onSearchStatistic={(input) => this.onSearchStatisticAdmin(input)} />
                        </Col>
                        <Col {...cssColResponsiveSpan(24,24, 12, 9, 6, 6 )} style={{  display :'flex',alignItems:'center',justifyContent:'end'}}>
                            <Space>
                                {isGranted(AppConsts.Permission.Pages_Reconcile_Reconcile_Create) && (
                                    <Button
                                        type="primary"
                                        onClick={() => this.setState({ visibleImportExcel: true })}
                                    >
                                        {'Đối soát ngân hàng'}
                                    </Button>
                                )}
                                {isGranted(AppConsts.Permission.Pages_Reconcile_Reconcile_Export) && (
                                    <Button
                                        type="primary"
                                        icon={<ExportOutlined />}
                                        onClick={() => this.setState({ visibleExportExcel: true })}>
                                        Xuất dữ liệu
                                    </Button>
                                )}
                            </Space>
                        </Col>
                    </Row>
                    <TableMainReconcileBankAdmin
                        listReconsile={reconcileBankDto}
                        changeColumnSort={this.changeColumnSort}
                        openVisibleExportMainReconcile={this.openVisibleExportMainReconcile}
                        hasAction={true}
                        is_printed={false}
                        pagination={{
                            position: ['topRight'],
                            pageSize: this.state.pageSize,
                            total: total,
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
                {
                    this.reconcileBankReconcile.rec_month != undefined && this.state.visibleExportMainReconcile &&
                    <Col {...right}>
                        <Row>
                            <Button style={{ marginBottom: 5 }} size='middle' onClick={() => this.setState({ visibleExportMainReconcile: false, isReload: false })} icon={<StepBackwardOutlined />} title='Quay lại trang chính'></Button>
                            &nbsp;&nbsp;<h2>Chi tiết đối soát giao dịch từng máy của đối soát tháng {this.reconcileBankReconcile.rec_month}</h2>
                        </Row>
                        <TableReconcileBankAdmin
                            expandedRowRender={this.expandedRowRender}
                            isReload={this.state.isReload}
                            listReconsile={this.reconcileBankReconcile.listReconcile != undefined ? this.reconcileBankReconcile.listReconcile : []}
                            hasAction={true}
                            is_printed={false}
                            actionTable={this.actionTableReconcileBank}
                            pagination={{
                                position: ['topRight'],
                                pageSize: this.state.pageSize,
                                total: this.reconcileBankReconcile.listReconcile != undefined ? this.reconcileBankReconcile.listReconcile.length : 0,
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
                        {this.state.visibleUpdateStatusReconcileOnlyExcel && (
                            <Modal
                                visible={this.state.visibleUpdateStatusReconcileOnlyExcel}
                                onCancel={() => {
                                    this.setState({ visibleUpdateStatusReconcileOnlyExcel: false });
                                }}
                                closable={false}
                                maskClosable={true}
                                footer={false}
                                width={'45%'}
                            >
                                <UpdateBillingOnlyExcelReconcileAdmin
                                    onlyExcelReconcile={this.onlyExcelReconcile}
                                    logReconcile={reconcileLogsListDto[0]}
                                    reconcileSelect={this.reconcileDto}
                                    onCancel={() => this.setState({ visibleUpdateStatusReconcileOnlyExcel: false })}
                                    onSuccess={() => this.getSuccess()}
                                />
                            </Modal>
                        )}
                        {this.state.visibleUpdateStatusReconcile && (
                            <Modal
                                visible={this.state.visibleUpdateStatusReconcile}
                                onCancel={() => {
                                    this.setState({ visibleUpdateStatusReconcile: false });
                                }}
                                closable={false}
                                maskClosable={true}
                                footer={false}
                                width={'45%'}
                            >
                                <UpdateBillingReconcileAdmin
                                    onCancel={() => this.setState({ visibleUpdateStatusReconcile: false })}
                                    onSuccess={() => this.getSuccess()}
                                    bill_select={this.billingSelected}
                                    logReconcile={reconcileLogsListDto[0]}
                                    reconcileSelect={this.reconcileDto.rec_id}
                                />
                            </Modal>
                        )}
                    </Col>
                }

                <Modal
                    centered
                    visible={this.state.visibleImportExcel}
                    onCancel={() => {
                        this.setState({ visibleImportExcel: false });
                    }}
                    closable={false}
                    maskClosable={false}
                    footer={false}
                    width={'70%'}
                >
                    <ModalImportBankReconciliationAdmin
                        onCancel={() => {
                            this.setState({ visibleImportExcel: false });
                        }}
                        onSucces={() => {
                            this.getSuccessImport();
                        }}
                        billingListResult={billListResult}
                    />
                </Modal>

                <Modal
                    closable={true}
                    visible={this.state.visibleModalLogReconcile}
                    onCancel={() => this.setState({ visibleModalLogReconcile: false })}
                    maskClosable={false}
                    title="Lịch sử đối soát"
                    footer={false}
                    width={'80%'}
                >
                    <ReconcileLogs bi_code={this.bi_code_logs} />
                </Modal>
                {this.state.visibleExportExcel && (
                    <ModalExportBankReconcilelMainAdmin
                        bankReconcileSelected={reconcileBankDto}
                        onCancel={() => {
                            this.setState({ visibleExportExcel: false });
                        }}
                        visible={this.state.visibleExportExcel}
                    />
                )}
            </Card>
        );
    }
}
