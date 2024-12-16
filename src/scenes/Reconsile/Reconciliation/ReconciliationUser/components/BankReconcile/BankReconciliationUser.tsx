import * as React from 'react';
import { Button, Card, Col, Modal, Row, message, } from 'antd';
import AppConsts, { EventTable, cssCol } from '@src/lib/appconst';
import { stores } from '@src/stores/storeInitializer';
import { BillingDto, ExcelReconcileDto, ReconcileDto } from '@src/services/services_autogen';
import { eReconcileBillingStatus, eReconsile } from '@src/lib/enumconst';
import TableBillingViewUser from './TableBillingViewUser';
import ModalImportBankReconciliationUser from './ModalImportBankReconciliationUser';
import SearchReconcile from '@src/components/Manager/SearchReconcile';
import { ExportOutlined } from '@ant-design/icons';
import ModalExportBankReconcoleUser from './ModalExportBankReconcoleUser';
import TableReconcileBankUser from './TableReconcileBankUser';
import { SearchInputUser } from '@src/stores/statisticStore';
import TableListBillingOnlyInExcelUser from './TableListBillingOnlyInExcelUser';
import ModalExportBankReconcoleUserDetail from './ModalExportBankReconcoleUserDetail';
import ReconcileLogs from '@src/scenes/Reconsile/ReconcilLogs';
import UpdateBillingReconcile from './UpateBillingReconcile';
import UpdateBillingOnlyExcelReconcile from './UpdateBillingOnlyExcelReconcile';
import moment from 'moment';
import { isGranted } from '@src/lib/abpUtility';
export interface Iprops {
    tab?: string;
}
const { confirm } = Modal;
export default class BankReconciliationUser extends React.Component<Iprops> {
    state = {
        visibleImportExcel: false,
        visibleExportExcel: false,
        visibleViewBilling: false,
        isLoadDone: true,
        rec_type: eReconsile.QR.num,
        skipCount: 0,
        currentPage: 1,
        pageSize: 10,
        tab: "",
        visibleUpdateStatusReconcile: false,
        visibleUpdateStatusReconcileOnlyExcel: false,
        visibleModalLogReconcile: false,
        start_date: undefined,
        end_date: undefined,
        gr_ma_id: undefined,
        ma_id_list: undefined,
        visibleExportExcelDetail: false,
    }
    reconcileDto: ReconcileDto = new ReconcileDto();
    billingSelected: BillingDto = new BillingDto();
    onlyExcelReconcile: ExcelReconcileDto = new ExcelReconcileDto();
    bi_code_logs: string = "";


    async componentDidMount() {
        await this.getAll();

    }
    // async componentDidUpdate(prevState) {
    //     if (this.state.tab != prevState.tab) {
    //         this.getAll();
    //         this.setState({ tab: this.props.tab });
    //     }
    // }
    handleSubmitSearch = async () => {
        this.onChangePage(1, 10);
    }
    onChangePage = async (page: number, pagesize?: number) => {
        if (pagesize !== undefined) {
            await this.setState({ pageSize: pagesize! });
        }
        this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            this.getAll();
        })
    }
    getAll = async () => {
        this.setState({ isLoadDone: false });
        await Promise.all([
            stores.reconcileStore.getAllBankReconcile(this.state.start_date, this.state.end_date, this.state.gr_ma_id, this.state.ma_id_list, this.state.skipCount, this.state.pageSize),
            stores.billingStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined),
        ])
        this.setState({ isLoadDone: true });
    }
    actionTableBilling = async (bill: BillingDto, event: EventTable) => {
        if (event == EventTable.Edit) {
            this.billingSelected.init(bill)
            this.setState({ visibleUpdateStatusReconcile: true });
        }
        if (event == EventTable.View) {
            this.billingSelected.init(bill)
            this.bi_code_logs = this.billingSelected.bi_code!;
            this.setState({ visibleModalLogReconcile: true });
        }
    }

    actionTableBillingOnlyExcel = async (input: ExcelReconcileDto, event: EventTable) => {
        if (event == EventTable.Edit) {
            this.onlyExcelReconcile.init(input)
            this.setState({ visibleUpdateStatusReconcileOnlyExcel: true });
        }
        if (event == EventTable.View) {
            this.onlyExcelReconcile.init(input)
            this.bi_code_logs = this.onlyExcelReconcile.ex_code?.split("-")[1]!;
            this.setState({ visibleModalLogReconcile: true });
        }
    }
    actionTableReconcileBank = async (reconcile: ReconcileDto, event: EventTable, checked?: boolean) => {
        if (event === EventTable.View) {
            this.reconcileDto.init(reconcile);
            this.setState({ visibleViewBilling: true });
        }
        if (event === EventTable.Accept) {
            this.reconcileDto.init(reconcile);
            if (reconcile.rec_id > 0) {
                let self = this;
                confirm({
                    title: <h3><span>{"Vui lòng kiểm tra kỹ các đơn hàng trước khi xác nhận, sau khi xác nhận sẽ "}</span><span style={{ color: "red" }}>không thể thay đổi thông tin đơn hàng?</span></h3>,
                    okText: "Xác nhận",
                    cancelText: "Hủy",
                    async onOk() {
                        await stores.reconcileStore.confirmReconcile(reconcile.rec_id);
                        await self.getAll();
                        message.success("Xác nhận thành công !")
                        self.setState({ isLoadDone: true });
                    },
                    onCancel() {
                    },
                });
            }
        }
    }

    getSuccess = async () => {
        await this.setState({ isLoadDone: false });
        await this.getAll();
        this.setState({ visibleUpdateStatusReconcile: false, visibleUpdateStatusReconcileOnlyExcel: false })
        await this.setState({ isLoadDone: true });
    }
    getSuccessImport = async () => {
        await this.getAll();
        this.setState({ visibleUpdateStatusReconcile: false, visibleUpdateStatusReconcileOnlyExcel: false, visibleImportExcel: false })
    }
    getSuccessChangeStatus = async () => {
        await this.setState({ isLoadDone: false, visibleViewBilling: false });
        await this.getAll();
        this.setState({ visibleUpdateStatusReconcile: false, visibleUpdateStatusReconcileOnlyExcel: false })
        await this.setState({ isLoadDone: true, visibleViewBilling: true });
    }

    onSearchStatisticUser = async (input: SearchInputUser) => {
        await this.setState({ start_date: input.start_date, end_date: input.end_date, gr_ma_id: input.gr_ma_id, ma_id_list: input.ma_id_list });
        this.onChangePage(1, this.state.pageSize);
    }
    render() {
        const { reconcileListDto, total } = stores.reconcileStore;
        const { reconcileLogsListDto } = stores.reconcileLogsStore;
        const { billListResult } = stores.billingStore;
        const left = this.state.visibleUpdateStatusReconcile ? cssCol(15) : cssCol(24);
        const right = this.state.visibleUpdateStatusReconcile ? cssCol(9) : cssCol(0);
        const leftOnlyExcel = this.state.visibleUpdateStatusReconcileOnlyExcel ? cssCol(15) : cssCol(24);
        const rightOnlyExcel = this.state.visibleUpdateStatusReconcileOnlyExcel ? cssCol(9) : cssCol(0);
        const self = this;
        return (
            <Card>
                <Row justify='end'>
                    <Col span={12}>
                        <h2>Đối soát ngân hàng</h2>
                    </Col>
                    <Col span={12} style={{ textAlign: "end", marginBottom: 10 }}>
                        {isGranted(AppConsts.Permission.Pages_Reconcile_Reconcile_Create) &&
                            <Button style={{ marginRight: "10px" }} type='primary' onClick={() => this.setState({ visibleImportExcel: true })}>{"Đối soát ngân hàng"}</Button>
                        }
                        {
                            isGranted(AppConsts.Permission.Pages_Reconcile_Reconcile_Withdraw) &&
                            <Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcel: true })}>Xuất dữ liệu</Button>
                        }
                    </Col>
                    <Col span={24}>
                        <SearchReconcile onSearchStatistic={(input) => { this.onSearchStatisticUser(input) }} />
                    </Col>
                </Row>
                <TableReconcileBankUser
                    listReconsile={reconcileListDto}
                    hasAction={true}
                    actionTable={this.actionTableReconcileBank}
                    pagination={{
                        pageSize: this.state.pageSize,
                        total: total,
                        current: this.state.currentPage,
                        showTotal: (tot) => ("Tổng: ") + tot + "",
                        showQuickJumper: true,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        onShowSizeChange(current: number, size: number) {
                            self.onChangePage(current, size)
                        },
                        onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
                    }}
                />

                <Modal
                    visible={this.state.visibleViewBilling}
                    onCancel={() => { this.setState({ visibleViewBilling: false }) }}
                    closable={false}
                    maskClosable={true}
                    footer={false}
                    width={"85%"}>
                    <Row gutter={8}>
                        <Col span={14}><h2>Danh sách đơn hàng đối soát  {stores.sessionStore.getNameMachines(this.reconcileDto.ma_id)} {"- Của tháng: " + moment(this.reconcileDto.rec_from).add(1, "month").format('M')}</h2></Col>
                        <Col span={10} style={{ display: "flex", justifyContent: "end" }}>
                            {isGranted(AppConsts.Permission.Pages_Reconcile_Reconcile_Export) &&
                                <Button style={{ marginRight: "10px" }} type="primary" onClick={() => this.setState({ visibleExportExcelDetail: true })}>Xuất dữ liệu</Button>
                            }
                            <Button
                                danger
                                type="ghost" title='Hủy'
                                onClick={() => this.setState({ visibleViewBilling: false, visibleUpdateStatusReconcile: false })}
                            >
                                Hủy
                            </Button>
                        </Col>
                    </Row>
                    {
                        this.state.visibleViewBilling
                        &&
                        <>
                            <Row gutter={10}>
                                <Col {...left}>
                                    <TableBillingViewUser
                                        isLoadDone={this.state.isLoadDone}
                                        rec_id={this.reconcileDto.rec_id}
                                        billListResult={billListResult}
                                        hasAction={true}
                                        actionTable={this.actionTableBilling}
                                        onSuccess={() => this.getSuccess()}
                                        isConfirm={this.reconcileDto.rec_status != eReconcileBillingStatus.NONE.num ? true : false}
                                        listBillId={this.reconcileDto.listBillingId}
                                    />
                                </Col>
                                <Col {...right} style={{ marginTop: 105 }}>
                                    {this.state.visibleUpdateStatusReconcile &&
                                        <UpdateBillingReconcile onCancel={() => this.setState({ visibleUpdateStatusReconcile: false })} onSuccess={() => this.getSuccessChangeStatus()} bill_select={this.billingSelected} logReconcile={reconcileLogsListDto[0]} reconcileSelect={this.reconcileDto.rec_id} />
                                    }
                                </Col>
                            </Row>
                            <Row gutter={10}>
                                <Col {...leftOnlyExcel}>
                                    <TableListBillingOnlyInExcelUser
                                        reconcileListDto={reconcileListDto}
                                        isLoadDone={this.state.isLoadDone}
                                        actionTable={this.actionTableBillingOnlyExcel}
                                        rec_id={this.reconcileDto.rec_id}
                                        billListResult={this.reconcileDto.listBillingOnlyInExcel}
                                        hasAction={true}
                                        onSuccess={() => this.getSuccess()}
                                        is_confirmed={this.reconcileDto.rec_status != eReconcileBillingStatus.NONE.num ? true : false}
                                    />
                                </Col>
                                <Col {...rightOnlyExcel} style={{ marginTop: 105 }}>
                                    {this.state.visibleUpdateStatusReconcileOnlyExcel &&
                                        <UpdateBillingOnlyExcelReconcile onlyExcelReconcile={this.onlyExcelReconcile} logReconcile={reconcileLogsListDto[0]} reconcileSelect={this.reconcileDto} onCancel={() => this.setState({ visibleUpdateStatusReconcileOnlyExcel: false })} onSuccess={() => this.getSuccessChangeStatus()} />
                                    }
                                </Col>
                            </Row>
                        </>
                    }
                </Modal>
                <Modal
                    visible={this.state.visibleImportExcel}
                    centered
                    onCancel={() => { this.setState({ visibleImportExcel: false }) }}
                    closable={false}
                    maskClosable={false}
                    footer={false}
                    width={"85%"}
                >
                    <ModalImportBankReconciliationUser
                        onCancel={() => { this.setState({ visibleImportExcel: false }) }}
                        onSucces={() => { this.getSuccessImport() }}
                        billingListResult={billListResult}
                    />
                </Modal>
                {this.state.visibleExportExcel &&
                    <ModalExportBankReconcoleUser
                        listReconsile={reconcileListDto}
                        onCancel={() => { this.setState({ visibleExportExcel: false }) }}
                        visible={this.state.visibleExportExcel}
                    />
                }
                {this.state.visibleExportExcelDetail &&
                    <ModalExportBankReconcoleUserDetail
                        billListResultExcel={this.reconcileDto.listBillingOnlyInExcel}
                        listBillId={this.reconcileDto.listBillingId!}
                        billListResult={billListResult}
                        onCancel={() => { this.setState({ visibleExportExcelDetail: false }) }}
                        visible={this.state.visibleExportExcelDetail}
                        title={"Danh sách đơn hàng đối soát" + stores.sessionStore.getNameMachines(this.reconcileDto.ma_id) + "- Của tháng: " + moment(this.reconcileDto.rec_from).add(1, "month").format('M')}
                    />
                }
                <Modal
                    closable={true}
                    visible={this.state.visibleModalLogReconcile}
                    onCancel={() => this.setState({ visibleModalLogReconcile: false })}
                    maskClosable={false}
                    footer={false}
                    width={"80%"}
                >
                    <ReconcileLogs bi_code={this.bi_code_logs} />
                </Modal>
            </Card>
        )
    }
}