import * as React from 'react';
import { Button, Card, Col, Modal, Row } from 'antd';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { stores } from '@src/stores/storeInitializer';
import { BillingDto, ExcelReconcileDto, ReconcileDto } from '@src/services/services_autogen';
import { eReconsile } from '@src/lib/enumconst';

import SearchReconcile from '@src/components/Manager/SearchReconcile';
import { ExportOutlined } from '@ant-design/icons';
import { SearchInputUser } from '@src/stores/statisticStore';
import ReconcileLogs from '@src/scenes/Reconsile/ReconcilLogs';
import moment from 'moment';
import TableReconcileRFIDAdmin from './TableReconcileRFIDAdmin';
import TableListRFIDBillingOnlyInExcelAdmin from './TableListRFIDBillingOnlyInExcelAdmin';
import TableBillingDetailRFIDAdmin from './TableBillingDetailRFIDAdmin';
import ModalExportRFIDReconcolelAdmin from './ModalExportRFIDReconcoleAdmin';
import ModalExportRFIDReconcoleDetailAdmin from './ModalExportRFIDReconcoleAdminDetail';
import ModalExportRFIDReconcileUserDetailAdmin from './ModalExportBillingDetailRFIDAdmin';
import TableBillingRFIDSystemAdmin from './TableListBillRFIDSystemAdmin';
import { isGranted } from '@src/lib/abpUtility';
export interface Iprops {
    tab?: string;
}
const { confirm } = Modal;
export default class RFIDReconciliationAdmin extends React.Component<Iprops> {
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
        visivleModalExportRfidBillDetail: false,
        visivleModalRfidBillDetail: false,
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
    async componentDidUpdate(prevState) {
        if (this.state.tab != prevState.tab) {
            this.getAll();
            this.setState({ tab: this.props.tab });
        }
    }
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
            stores.reconcileStore.getAllRFIDReconcileByAdmin(undefined, this.state.start_date, this.state.end_date, this.state.gr_ma_id, this.state.ma_id_list, this.state.skipCount, this.state.pageSize),
            stores.billingStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined),
        ])
        this.setState({ isLoadDone: true });
    }
    actionTableBilling = async (bill: BillingDto, event: EventTable) => {
        if (event == EventTable.View) {
            this.billingSelected.init(bill)
            this.bi_code_logs = this.billingSelected.bi_code!;
            this.setState({ visibleModalLogReconcile: true });

        }
    }
    actionTableBillingOnlyExcel = async (input: ExcelReconcileDto, event: EventTable) => {
        if (event == EventTable.View) {
            this.onlyExcelReconcile.init(input)

            this.bi_code_logs = this.onlyExcelReconcile.ex_code?.split("-")[1]!;

            this.setState({ visibleModalLogReconcile: true });

        }
    }
    actionTableReconcileRFID = async (reconcileListDto: ReconcileDto, event: EventTable, checked?: boolean) => {
        if (event === EventTable.View) {
            this.reconcileDto.init(reconcileListDto);
            this.setState({ visibleViewBilling: true });
        }
        if (event === EventTable.History) {
            this.reconcileDto.init(reconcileListDto);
            this.setState({ visivleModalRfidBillDetail: true });
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
        this.setState({ visibleUpdateStatusReconcile: false, visibleUpdateStatusReconcileOnlyExcel: false })
    }
    onSearchStatisticAdmin = async (input: SearchInputUser) => {
        await this.setState({ start_date: input.start_date, end_date: input.end_date, gr_ma_id: input.gr_ma_id, ma_id_list: input.ma_id_list });
        this.onChangePage(1, this.state.pageSize);
    }
    render() {
        const { reconcileListDto, total } = stores.reconcileStore;
        const { billListResult } = stores.billingStore;
        const self = this;

        return (
            <Card>
                <Row justify='end'>
                    <Col span={12}>
                        <h2>Đối soát RFID</h2>
                    </Col>
                    {isGranted(AppConsts.Permission.Pages_Reconcile_Reconcile_Export) &&
                        <Col span={12} style={{ textAlign: "end", marginBottom: 10 }}>
                            <Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcel: true })}>Xuất dữ liệu</Button>
                        </Col>
                    }
                    <Col span={24}>
                        <SearchReconcile onSearchStatistic={(input) => { this.onSearchStatisticAdmin(input) }} />
                    </Col>
                </Row>
                <TableReconcileRFIDAdmin
                    listReconsile={reconcileListDto}
                    hasAction={true}
                    actionTable={this.actionTableReconcileRFID}
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
                        <Col span={12}><h2>Danh sách chi tiết nạp tiền {stores.sessionStore.getNameMachines(this.reconcileDto.ma_id)} {"- Của tháng: " + moment(this.reconcileDto.rec_from).format('M')}</h2></Col>
                        <Col span={12} style={{ display: "flex", justifyContent: "end" }}>
                            <Button style={{ marginRight: "10px" }} type="primary" onClick={() => this.setState({ visibleExportExcelDetail: true })}>Xuất dữ liệu</Button>
                            <Button
                                danger
                                type="ghost" title='Hủy'
                                onClick={() => this.setState({ visibleViewBilling: false })}
                            >
                                Hủy
                            </Button>
                        </Col>
                    </Row>
                    <>
                        <Row gutter={10}>
                            <Col span={24}>
                                <TableBillingRFIDSystemAdmin
                                    isLoadDone={this.state.isLoadDone}
                                    rec_id={this.reconcileDto.rec_id}
                                    billListResult={billListResult}
                                    hasAction={true}
                                    actionTable={this.actionTableBilling}
                                    onSuccess={() => this.getSuccess()}
                                    listBillId={this.reconcileDto.listBillingId}
                                />
                            </Col>

                        </Row>
                        <Row gutter={10}>
                            <Col span={24}>
                                <TableListRFIDBillingOnlyInExcelAdmin
                                    reconcileListDto={reconcileListDto}
                                    isLoadDone={this.state.isLoadDone}
                                    actionTable={this.actionTableBillingOnlyExcel}
                                    rec_id={this.reconcileDto.rec_id}
                                    billListResult={this.reconcileDto.listBillingOnlyInExcel}
                                    hasAction={true}
                                    onSuccess={() => this.getSuccess()}
                                />
                            </Col>
                        </Row>
                    </>
                </Modal>

                <Modal
                    visible={this.state.visivleModalRfidBillDetail}
                    onCancel={() => { this.setState({ visivleModalRfidBillDetail: false }) }}
                    closable={false}
                    maskClosable={false}
                    footer={false}
                    width={"85%"}
                >
                    <TableBillingDetailRFIDAdmin onCancel={() => this.setState({ visivleModalRfidBillDetail: false })} billing={billListResult} rfid_id_list={this.reconcileDto.listRfidLogsId} ma_id={this.reconcileDto.ma_id} />
                </Modal>

                {
                    this.state.visivleModalExportRfidBillDetail &&
                    <ModalExportRFIDReconcileUserDetailAdmin onCancel={() => this.setState({ visivleModalExportRfidBillDetail: false })} ma_id={this.reconcileDto.ma_id} visible={this.state.visivleModalExportRfidBillDetail} rfid_id_list={this.reconcileDto.listRfidLogsId} billing={billListResult} />
                }
                {this.state.visibleExportExcel &&
                    <ModalExportRFIDReconcolelAdmin
                        listReconsile={reconcileListDto}
                        onCancel={() => { this.setState({ visibleExportExcel: false }) }}
                        visible={this.state.visibleExportExcel}
                    />
                }
                {this.state.visibleExportExcelDetail &&
                    <ModalExportRFIDReconcoleDetailAdmin
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