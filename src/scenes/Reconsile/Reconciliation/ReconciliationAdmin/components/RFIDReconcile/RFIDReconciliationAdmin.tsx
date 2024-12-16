import * as React from 'react';
import { Button, Card, Col, Modal, Row, Tabs, message, } from 'antd';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import { stores } from '@src/stores/storeInitializer';
import { RfidLogDto, ExcelReconcileDto, IntPtr, ReconcileDto, ReconcileRFIDDto } from '@src/services/services_autogen';
import { eReconcileBillingStatus, eReconsile, eSort } from '@src/lib/enumconst';
import { ExportOutlined, StepBackwardOutlined } from '@ant-design/icons';
import ReconcileLogs from '@src/scenes/Reconsile/ReconcilLogs';
import { isGranted } from '@src/lib/abpUtility';
import TableReconcileRFIDAdmin from './TableReconcileRFIDAdmin';
import TableBillingRFIDSystemAdmin from './TableListBillRFIDSystemAdmin';
import UpdateBillingRFIDReconcileAdmin from './UpateBillingRFIDReconcileAdmin';
import TableListRFIDBillingOnlyInExcelAdmin from './TableListRFIDBillingOnlyInExcelAdmin';
import UpdateBillingOnlyExcelRFIDReconcileAdmin from './UpdateBillingOnlyExcelRFIDReconcileAdmin';
import TableBillingDetailRFIDAdmin from './TableBillingDetailRFIDAdmin';
import ModalImportRFIDReconciliationAdmin from './ModalImportRFIDReconciliationAdmin';
import SearchReconcileAdmin, { SearchReconcileInputAdmin } from '@src/components/Manager/SearchReconcileAdmin';
import { SorterResult } from 'antd/lib/table/interface';
import TableMainReconcileRFIDAdmin from './TableMainReconcileBankAdmin';
import ModalExportRFIDReconcilelMainAdmin from './ModalExportMainReconcileBankAdmin';
export interface Iprops {
    tab?: string;
}
const { confirm } = Modal;
export const tabManager = {
    tab_1: "Danh sách chi tiết nạp tiền hệ thống",
    tab_2: "Danh sách chi tiết nạp tiền chỉ có ở Excel",
}
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
        visibleMainReconcile: false,
        visibleExportMainReconcile: false,
        visibleUpdateStatusReconcile: false,
        visibleUpdateStatusReconcileOnlyExcel: false,
        visibleModalLogReconcile: false,
        visivleModalRfidBillDetail: false,
        visivleModalExportRfidBillDetail: false,
        start_date: undefined,
        end_date: undefined,
        gr_ma_id: undefined,
        ma_id_list: undefined,
        visibleExportExcelDetail: false,
        us_id: undefined,
        re_status: undefined,
        sort: undefined,
        month: undefined,
        isReload: false,

    }
    reconcileDto: ReconcileDto = new ReconcileDto();
    rfidSelected: RfidLogDto = new RfidLogDto();
    onlyExcelReconcile: ExcelReconcileDto = new ExcelReconcileDto();
    rfid_code: string = "";
    selectedField: string;
    reconcileRFIDSelected: ReconcileRFIDDto = new ReconcileRFIDDto();

    async componentDidMount() {
        await stores.rfidLogStore.getAllLogsByAdmin(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
        await this.getAll();
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
    changeColumnSort = async (sort: SorterResult<ReconcileRFIDDto> | SorterResult<ReconcileRFIDDto>[]) => {
        this.setState({ isLoadDone: false });
        this.selectedField = sort["field"];
        await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
        this.reconcileRFIDSelected =new ReconcileRFIDDto() 
        await this.getAll();
        this.setState({ isLoadDone: true });
    }
    getAll = async () => {
        await Promise.all([
            stores.reconcileStore.getAllRFIDReconcileByAdmin(this.state.us_id, this.state.month, this.state.start_date, this.state.end_date, this.state.gr_ma_id, this.state.ma_id_list, this.state.re_status, this.selectedField, this.state.sort, this.state.skipCount, this.state.pageSize),
        ])
        if (this.reconcileRFIDSelected.rec_month != undefined) {
            const { reconcileRFIDListDto } = stores.reconcileStore;
           const result =reconcileRFIDListDto.find(item => item.rec_month == this.reconcileRFIDSelected.rec_month)
           this.reconcileRFIDSelected = result != undefined ? result :new ReconcileRFIDDto() 
           this.setState({isReload: false})
        }
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }
    actionTableBilling = async (rfidLog: RfidLogDto, event: EventTable) => {
        if (event == EventTable.Edit) {
            this.rfidSelected.init(rfidLog)
            this.setState({ visibleUpdateStatusReconcile: true });
        }
        if (event == EventTable.View) {
            this.rfidSelected.init(rfidLog)
            this.rfid_code = this.rfidSelected.rf_code!;
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
            this.rfid_code = this.onlyExcelReconcile.ex_code?.split("-")[1]!;
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
        if (event === EventTable.Accept) {
            this.reconcileDto.init(reconcileListDto);
            if (reconcileListDto.rec_id > 0) {
                let self = this;
                confirm({
                    title: <h3><span>{"Vui lòng kiểm tra kỹ các đơn hàng trước khi xác nhận, sau khi xác nhận sẽ "}</span><span style={{ color: "red" }}>không thể thay đổi thông tin đơn hàng?</span></h3>,
                    okText: "Xác nhận",
                    cancelText: "Hủy",
                    async onOk() {
                        await stores.reconcileStore.confirmReconcile(reconcileListDto.rec_id);
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

    getSuccess = async () => {
        this.setState({ isLoadDone: false })
        await this.onChangePage(1, this.state.pageSize);
        this.setState({ visibleUpdateStatusReconcile: false, visibleUpdateStatusReconcileOnlyExcel: false, isLoadDone: true })
    }
    getSuccessImport = async () => {
        await this.getAll();
        this.setState({ visibleUpdateStatusReconcile: false, visibleUpdateStatusReconcileOnlyExcel: false, visibleImportExcel: false })
    }
    onSearchStatisticAdmin = async (input: SearchReconcileInputAdmin) => {
        await this.setState({ re_status: input.status, us_id: input.us_id, start_date: input.start_date, end_date: input.end_date, gr_ma_id: input.gr_ma_id, ma_id_list: input.ma_id_list });
        this.onChangePage(1, this.state.pageSize);
    }
    openVisibleExportMainReconcile = (record: ReconcileRFIDDto) => {
        this.reconcileRFIDSelected.init(record);
        this.setState({ visibleExportMainReconcile: true, isReload: true })
    }
    expandedRowRender = (record: ReconcileDto) => {
        this.reconcileDto.init(record);
        return (
            <>
                <Tabs defaultActiveKey={tabManager.tab_1}>
                    <Tabs.TabPane tab={tabManager.tab_1} key={tabManager.tab_1}>
                        <TableBillingRFIDSystemAdmin
                            isLoadDone={this.state.isLoadDone}
                            rec_id={record.rec_id}
                            hasAction={true}
                            actionTable={this.actionTableBilling}
                            onSuccess={() => this.getSuccess()}
                            isConfirm={record.rec_status != eReconcileBillingStatus.NONE.num ? true : false}
                            rfidLogListCode={record.listRfidLogsId}
                        />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={tabManager.tab_2} key={tabManager.tab_2}>
                        <TableListRFIDBillingOnlyInExcelAdmin
                            reconcileListDto={this.reconcileRFIDSelected.listReconcile}
                            isLoadDone={this.state.isLoadDone}
                            actionTable={this.actionTableBillingOnlyExcel}
                            rec_id={record.rec_id}
                            billListResult={record.listBillingOnlyInExcel}
                            hasAction={true}
                            onSuccess={() => this.getSuccess()}
                            is_confirmed={record.rec_status != eReconcileBillingStatus.NONE.num ? true : false}
                        />
                    </Tabs.TabPane>
                </Tabs >
            </>
        )
    }
    render() {
        const { reconcileRFIDListDto, total } = stores.reconcileStore;
        const { reconcileLogsListDto } = stores.reconcileLogsStore;
        const { billListResult } = stores.billingStore;
        const self = this;
        const left = this.state.visibleExportMainReconcile ? cssCol(0) : cssCol(24);
        const right = this.state.visibleExportMainReconcile ? cssCol(24) : cssCol(0);
        return (
            <Card>
                <Col {...left}>
                    <Row justify='end'>
                        <Col {...cssColResponsiveSpan(24, 24, 12, 15, 18, 18)}>
                            <SearchReconcileAdmin hideSearch={false} onSearchStatistic={(input) => this.onSearchStatisticAdmin(input)} />
                        </Col>
                        <Col {...cssColResponsiveSpan(24, 24, 12, 9, 6, 6)} style={{  display :'flex',alignItems:'center',justifyContent:'end'}}>
                            {
                                isGranted(AppConsts.Permission.Pages_Reconcile_Reconcile_Create) &&
                                <Button style={{ marginRight: "10px" }} type='primary' onClick={() => this.setState({ visibleImportExcel: true })}>{"Đối soát nạp thẻ RFID"}</Button>
                            }
                            {isGranted(AppConsts.Permission.Pages_Reconcile_Reconcile_Export) &&
                                <Button type="primary" icon={<ExportOutlined />} onClick={async () => await this.setState({ visibleExportExcel: true })}>Xuất dữ liệu</Button>
                            }

                        </Col>
                    </Row>

                    <TableMainReconcileRFIDAdmin
                        changeColumnSort={this.changeColumnSort}
                        listReconsile={reconcileRFIDListDto}
                        hasAction={true}
                        openVisibleExportMainReconcile={this.openVisibleExportMainReconcile}
                        is_printed={false}
                        pagination={{
                            position: ['topRight'],
                            pageSize: this.state.pageSize,
                            total: total,
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
                {this.state.visibleExportMainReconcile &&
                    <Col {...right}>
                        <Row>
                            <Button style={{ marginBottom: 5 }} size='middle' onClick={() => this.setState({ visibleExportMainReconcile: false, isReload: true })} icon={<StepBackwardOutlined />} title='Quay lại trang chính'></Button>
                            &nbsp;&nbsp;<h2>Chi tiết đối soát giao dịch từng máy của đối soát tháng {this.reconcileRFIDSelected.rec_month}</h2>
                        </Row>
                        <TableReconcileRFIDAdmin
                            expandedRowRender={this.expandedRowRender}
                            isReload={this.state.isReload}
                            listReconsile={this.reconcileRFIDSelected.listReconcile != undefined ? this.reconcileRFIDSelected.listReconcile : []}
                            hasAction={true}
                            is_printed={false}
                            actionTable={this.actionTableReconcileRFID}
                            pagination={{
                                position: ['topRight'],
                                pageSize: this.state.pageSize,
                                total: this.reconcileRFIDSelected.listReconcile!= undefined ? this.reconcileRFIDSelected.listReconcile.length :0 ,
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
                {this.state.visibleUpdateStatusReconcile &&
                    <Modal
                        visible={this.state.visibleUpdateStatusReconcile}
                        onCancel={() => { this.setState({ visibleUpdateStatusReconcile: false }) }}
                        closable={false}
                        maskClosable={false}
                        footer={false}
                        width={"50%"}
                    >
                        <UpdateBillingRFIDReconcileAdmin onCancel={() => this.setState({ visibleUpdateStatusReconcile: false })} onSuccess={() => this.getSuccess()} rfid_logs_select={this.rfidSelected} logReconcile={reconcileLogsListDto[0]} reconcileSelect={this.reconcileDto.rec_id} />
                    </Modal>
                }
                {this.state.visibleUpdateStatusReconcileOnlyExcel &&
                    <Modal
                        visible={this.state.visibleUpdateStatusReconcileOnlyExcel}
                        onCancel={() => { this.setState({ visibleUpdateStatusReconcileOnlyExcel: false }) }}
                        closable={false}
                        maskClosable={false}
                        footer={false}
                        width={"50%"}
                    >
                        <UpdateBillingOnlyExcelRFIDReconcileAdmin onlyExcelReconcile={this.onlyExcelReconcile} logReconcile={reconcileLogsListDto[0]} reconcileSelect={this.reconcileDto} onCancel={() => this.setState({ visibleUpdateStatusReconcileOnlyExcel: false })} onSuccess={() => this.getSuccess()} />
                    </Modal>
                }
                <Modal
                    visible={this.state.visivleModalRfidBillDetail}
                    onCancel={() => { this.setState({ visivleModalRfidBillDetail: false }) }}
                    closable={false}
                    maskClosable={false}
                    footer={false}
                    width={"85%"}
                >
                    <TableBillingDetailRFIDAdmin onCancel={() => this.setState({ visivleModalRfidBillDetail: false })} ma_id={this.reconcileDto.ma_id} rfid_id_list={this.reconcileDto.listRfidLogsId} billing={billListResult} />
                </Modal>
                <Modal
                    visible={this.state.visibleImportExcel}
                    onCancel={() => { this.setState({ visibleImportExcel: false }) }}
                    closable={false}
                    maskClosable={false}
                    footer={false}
                    width={"85%"}
                >
                    <ModalImportRFIDReconciliationAdmin
                        onCancel={() => { this.setState({ visibleImportExcel: false }) }}
                        onSucces={() => { this.getSuccessImport() }}
                        billingListResult={billListResult}
                    />
                </Modal>
                {this.state.visibleExportExcel &&
                    <ModalExportRFIDReconcilelMainAdmin
                        rfidReconcileSelected={reconcileRFIDListDto}
                        onCancel={() => { this.setState({ visibleExportExcel: false }) }}
                        visible={this.state.visibleExportExcel}
                    />
                }
                <Modal
                    closable={true}
                    visible={this.state.visibleModalLogReconcile}
                    onCancel={() => this.setState({ visibleModalLogReconcile: false })}
                    maskClosable={false}
                    footer={false}
                    title='Lịch sử đối soát'
                    width={"80%"}
                >
                    <ReconcileLogs bi_code={this.rfid_code} />
                </Modal>

            </Card>
        )
    }
}