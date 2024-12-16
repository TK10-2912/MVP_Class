import * as React from 'react';
import { Button, Card, Col, Modal, Row } from 'antd';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { stores } from '@src/stores/storeInitializer';
import { BillingDto, ReconcileDto, } from '@src/services/services_autogen';
import { eReconsile } from '@src/lib/enumconst';
import TableBillingViewAdmin from './TableBillingViewAdmin';
import { ExportOutlined } from '@ant-design/icons';
import ModalExportBankReconciliationAdmin from './ModalExportBankReconciliationAdmin';
import SearchReconcileAdmin, { SearchReconcileInputAdmin } from '@src/components/Manager/SearchReconcileAdmin';
import TableListBillingOnlyInExcelAdmin from './TableListBillingOnlyInExcelAdmin';
import TableReconcileBankAdmin from './TableReconcileBankAdmin';
import { isGranted } from '@src/lib/abpUtility';
export interface Iprops {

}
const { confirm } = Modal;
export default class BankReconciliationAdmin extends React.Component<Iprops> {
    state = {
        visibleImportExcel: false,
        visibleViewBilling: false,
        visibleExportExcel: false,
        visibleChangeStatusAndReson: false,
        isLoadDone: false,
        rec_type: eReconsile.QR.num,
        skipCount: 0,
        currentPage: 1,
        pageSize: 10,
        us_id_list: undefined,
        start_date: undefined,
        end_date: undefined,
        gr_ma_id: undefined,
        ma_id_list: undefined,
    }
    reconcileDto: ReconcileDto = new ReconcileDto();
    billDto: BillingDto = new BillingDto();
    async componentDidMount() {
        this.getAll();
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
        await stores.reconcileStore.getAllBankReconcileByAdmin(this.state.us_id_list, this.state.start_date, this.state.end_date, this.state.gr_ma_id, this.state.ma_id_list, this.state.skipCount, this.state.pageSize);
        await stores.billingStore.getAllByAdmin(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined)
        this.setState({ isLoadDone: true });

    }

    actionTableReconcileBank = async (reconcileListDto: ReconcileDto, event: EventTable, checked?: boolean) => {
        if (event === EventTable.View) {
            this.reconcileDto.init(reconcileListDto);
            this.setState({ visibleViewBilling: true });
        }
    }
    onSearchStatisticAdmin = async (input: SearchReconcileInputAdmin) => {
        await this.setState({ us_id_list: input.us_id, start_date: input.start_date, end_date: input.end_date, gr_ma_id: input.gr_ma_id, ma_id_list: input.ma_id_list });
        this.onChangePage(1, this.state.pageSize);
    }
    getSuccess = async () => {
        await this.getAll();
    }
    render() {
        const { reconcileListDto, total } = stores.reconcileStore;
        const { billListResult } = stores.billingStore;
        const self = this;
        return (
            <Card>
                <Row >
                    <Col span={12}>
                        <h2>Đối soát ngân hàng</h2>
                    </Col>
                    <Col span={12} style={{ textAlign: "end", marginBottom: 10 }}>
                        {isGranted(AppConsts.Permission.Pages_Reconcile_Reconcile_Export) &&
                            <Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcel: true })}>Xuất dữ liệu</Button>
                        }
                    </Col>
                    <Col span={24}>
                        <SearchReconcileAdmin onSearchStatistic={(input) => { this.onSearchStatisticAdmin(input) }} />
                    </Col>
                </Row>
                <TableReconcileBankAdmin
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
                    closable={true}
                    maskClosable={true}
                    title={
                        <Row>
                            <h2>Danh sách đơn hàng đối soát {stores.sessionStore.getNameMachines(this.reconcileDto.ma_id)}</h2>
                        </Row>
                    }
                    footer={false}
                    width={"80%"}
                >
                    <TableBillingViewAdmin
                        billListResult={billListResult}
                        listBillId={this.reconcileDto.listBillingId}
                        isPrint={false}
                    />
                    <TableListBillingOnlyInExcelAdmin
                        billListResult={this.reconcileDto.listBillingOnlyInExcel}
                        hasAction={true}
                        onSuccess={() => this.getSuccess()}
                    />
                </Modal>
                {this.state.visibleExportExcel &&
                    <ModalExportBankReconciliationAdmin
                        listReconsile={reconcileListDto}
                        onCancel={() => { this.setState({ visibleExportExcel: false }) }}
                        visible={this.state.visibleExportExcel}
                    />
                }

            </Card>
        )
    }
}