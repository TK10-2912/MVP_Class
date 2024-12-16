import * as React from 'react';
import { Button, Card, Col, DatePicker, Modal, Row, Tabs, message, } from 'antd';
import { EventTable, cssCol, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import { stores } from '@src/stores/storeInitializer';
import { ProductImportDto, ReconcileProductSupplierDebtDto, ReconcileSupplierDebtDetailDto, ReconcileSupplierDebtDto, SupplierDto } from '@src/services/services_autogen';
import { eReconcileDebtStatusSupplier } from '@src/lib/enumconst';
import { DeleteOutlined, ExportOutlined, SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import SelectedSupplier from '@src/components/Manager/SelectedSupplier';
import SelectEnum from '@src/components/Manager/SelectEnum';
import TableReconcileDebt from './components/TableReconcileDebt';
import ImportLSCFromReconcileDebt from './components/ImportExcelReconileDebt';
import PaymentSupplierDebt from './components/PaymentSupplierDebt';
import SupplierLogPayment from '@src/scenes/GeneralManager/LogSupplierDebt';
import ModalExportReconcileDebt from './components/ModalExportReconcileDebt';
import confirm from 'antd/lib/modal/confirm';
import TableProductDetail from './components/TableProductDetail';
import UpateReconcileDebt from './components/UpateReconcileDebt';
import TableProductDetailSupplier from './components/TableProductDetailSupplier';
import UpdateReconcilDebtOnlyExcel from './components/UpdateReconcileDebtOnlyExcel';
import ReconcileLogs from '../ReconcilLogs';
import TableDetailReconcileDebtSupplier from './components/TableDetailReconcileDebtSupplier';
import TableDetailReconcilDebtSupplierOnlyExcel from './components/TableDetailReconcilDebtSupplierOnlyExcel';

export const tabManager = {
    tab_1: "Danh sách nhập hàng trên hệ thống",
    tab_2: "Danh sách nhập hàng chỉ có ở Excel",
}
export interface IProps {
    historyReconcileDelete?: (su_id: number, rec_month: string) => void;
}
export default class ReconcileDebt extends React.Component<IProps> {
    state = {
        isLoadDone: true,
        skipCount: 0,
        currentPage: 1,
        pageSize: 10,
        rec_month: undefined,
        su_id: undefined,
        rec_monthDelete: undefined,
        su_idDelete: undefined,
        re_status: undefined,
        visibleImportExcel: false,
        visibleUpdateStatusReconcileOnlyExcel: false,
        visibleViewBilling: false,
        visiblePaymentDebt: false,
        visibleHistoryPayment: false,
        visibleExportReconcileDebt: false,
        visibleProductDetail: false,
        visibleProductDetailSupplierOnlyExcel: false,
        visibleUpdateStatusProduct: false,
        visibleUpdateStatusProductOnlyExcel: false,
        visibleModalLogReconcile: false,
        visibleProduct: false,
        visibleProductOnlyExcel: false,
        visibleModalLogReconcileOnlyExcel: false,
        sort: undefined,
    }
    reconcilSupplierDebtSelected: ReconcileSupplierDebtDto = new ReconcileSupplierDebtDto();
    list: ReconcileSupplierDebtDetailDto[] = [];
    listExcel: ReconcileSupplierDebtDetailDto[] = [];
    reconcilSupplierListDebtSelected: ReconcileSupplierDebtDetailDto[] = [];
    listProductOnlyExcel: ReconcileProductSupplierDebtDto[] = [];
    supplierSelected: SupplierDto = new SupplierDto();
    reconcile_selected: ReconcileSupplierDebtDetailDto = new ReconcileSupplierDebtDetailDto();
    productSelected: ProductImportDto = new ProductImportDto();
    re_id: number = 0;
    su_id: number = 0;
    pr_code_logs: string = '';
    productSelectedOnlyExcel: ReconcileProductSupplierDebtDto = new ReconcileProductSupplierDebtDto();
    historyReconcileDelete = (su_id: number, rec_month: string) => {
        if (!!this.props.historyReconcileDelete) {
            this.props.historyReconcileDelete(su_id, rec_month);
        }
    }
    handleSubmitSearch = async () => {
        await this.onChangePage(1, 10);
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
        this.setState({ isLoadDone: true });
        await Promise.all([
            stores.reconcileStore.getAllSupplierDebtReconcile(this.state.su_id != undefined ? [this.state.su_id!] : undefined, this.state.rec_month != undefined ? moment(this.state.rec_month).format("M/YYYY") : undefined, this.state.re_status, this.state.skipCount, this.state.pageSize),
            stores.supplierStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined)

        ])
        await this.getList();
        this.setState({ visibleImportExcel: false, isLoadDone: false });
    }
    getSuccess = async () => {
        this.setState({ isLoadDone: true });
        await this.getAll();
        const { reconcileDebtSupplierDto } = stores.reconcileStore
        const reconcile = reconcileDebtSupplierDto.find(item => item.su_id === this.su_id);
        this.reconcilSupplierDebtSelected = reconcile!;
        this.reconcile_selected = reconcile != undefined && reconcile.listReconcile != undefined ? reconcile.listReconcile!.find(item => item.rec_id === this.re_id)! : new ReconcileSupplierDebtDetailDto();
        await this.getList();
        this.setState({ visiblePaymentDebt: false, visibleUpdateStatusProduct: false, visibleUpdateStatusProductOnlyExcel: false })
        this.setState({ isLoadDone: false });
    }
    onClearSearch = async () => {
        await this.setState({
            rec_month: undefined,
            re_status: undefined,
            su_id: undefined,

        })
        this.handleSubmitSearch();
    }
    getList = async () => {
        this.setState({ isLoadDone: true });
        if (this.reconcilSupplierDebtSelected && !!this.reconcilSupplierDebtSelected.listReconcile) {
            this.list = this.reconcilSupplierDebtSelected.listReconcile?.filter(item => this.checkOnlyExcel(item) == false)!;
            this.listExcel = this.reconcilSupplierDebtSelected.listReconcile?.filter(item => this.checkOnlyExcel(item) == true)!;
        }
        this.setState({ isLoadDone: false });
    }

    checkOnlyExcel = (input: ReconcileSupplierDebtDetailDto) => {
        const arr = input.rec_im_re_code?.split("-");
        if (arr != undefined && arr[arr.length - 1] == "onlyExcel") {
            return true;
        }
        return false
    }
    expandedRowRender = (record: ReconcileSupplierDebtDto) => {
        return (
            <>
                <Tabs defaultActiveKey={tabManager.tab_1}>
                    <Tabs.TabPane tab={tabManager.tab_1} key={tabManager.tab_1}>
                        <TableDetailReconcileDebtSupplier
                            isLoadDone={this.state.isLoadDone}
                            actionTableSuppplier={this.actionDetailReconcilDebtSupplier}
                            hasAction={true} reconcileDebtListDto={this.list} />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={tabManager.tab_2} key={tabManager.tab_2}>
                        <TableDetailReconcilDebtSupplierOnlyExcel
                            isLoadDone={this.state.isLoadDone}
                            actionTableSuppplierOnlyExcel={this.actionDetailReconcilDebtSupplierOnlyExcel}
                            hasAction={true} reconcileDebtListDto={this.listExcel} />
                    </Tabs.TabPane>
                </Tabs >
            </>
        )
    }
    //CHỨC NĂNG CỦA BẢNG ĐỐI SOÁT
    actionTableReconcile = async (reconcile: ReconcileSupplierDebtDto, event: EventTable, checked?: boolean) => {
        const self = this;
        this.su_id = reconcile.su_id;
        if (event === EventTable.Edit) {
            this.reconcilSupplierDebtSelected.init(reconcile);
            this.setState({ visiblePaymentDebt: true })
        }
        if (event === EventTable.View) {
            await this.setState({ su_idDelete: reconcile.su_id, rec_monthDelete: reconcile.rec_month })
            this.historyReconcileDelete(this.state.su_idDelete!, this.state.rec_monthDelete!);
        }

        if (event === EventTable.Accept) {
            const listId = reconcile.listReconcile?.map(item => item.rec_id);
            if (listId != undefined && listId.length > 0) {
                confirm({
                    title: 'Thông báo',
                    content: `Bạn muốn xác nhận đối soát thành công ?`,
                    okText: 'Xác nhận',
                    cancelText: 'Hủy',
                    async onOk() {
                        self.setState({ isLoadDone: true });
                        await stores.reconcileStore.confirmMultiReconcile(listId!)
                        await self.getSuccess();
                        self.setState({ isLoadDone: false });
                    },
                    onCancel() {

                    },
                })
            }
            else message.warning("Không có danh sách hóa đơn")
        }

        if (event === EventTable.History) {
            const { supplierListResult } = stores.supplierStore;
            const result = supplierListResult.find(item => item.su_id === reconcile.su_id);
            if (result != undefined) {
                this.supplierSelected.init(result);
            }
            if (this.supplierSelected.supplierPaymentLogs != undefined && this.supplierSelected.supplierPaymentLogs.length > 0) {
                this.setState({ visibleHistoryPayment: true })
            }
            else {
                message.warning("Hiện tại chưa có lịch sử thanh toán nhập hàng!")
                this.setState({ visibleHistoryPayment: false })
            }
        }
        if (event === EventTable.Delete) {
            const listId = reconcile.listReconcile?.map(item => item.rec_id);
            if (listId != undefined && listId.length > 0) {
                confirm({
                    title: 'Bạn có chắc chắn xác nhận muốn xóa đối soát ?',
                    okText: 'Xác nhận',
                    cancelText: 'Hủy',
                    async onOk() {
                        self.setState({ isLoadDone: true });
                        await stores.reconcileStore.deleteReconcileSupplierDebt(listId!)
                        await self.getSuccess();
                        self.setState({ isLoadDone: false });
                    },
                    onCancel() {

                    },
                })
            }
            else message.warning("Không có danh sách hóa đơn")
        }
    }
    // CHỨC NĂNG CỦA BẢNG ĐỐI SOÁT CHỈ CÓ FILE EXCEL
    actionDetailReconcilDebtSupplierOnlyExcel = async (reconcile: ReconcileSupplierDebtDetailDto, event: EventTable) => {
        this.reconcile_selected = reconcile
        this.re_id = reconcile.rec_id;
        if (event === EventTable.Accept) {
            let self = this;
            confirm({
                title: 'Bạn muốn xác nhận đối soát thành công ?',
                okText: 'Xác nhận',
                cancelText: 'Hủy',
                async onOk() {
                    self.setState({ isLoadDone: true });
                    await stores.reconcileStore.confirmReconcile(reconcile.rec_id)
                    await self.getSuccess();
                    self.setState({ isLoadDone: false });
                },
                onCancel() {

                },
            })
        }
        if (event === EventTable.ViewDetail) {
            this.setState({ visibleProductOnlyExcel: true })
        }
    }
    //CHỨC NĂNG CỦA BẢNG ĐỐI SOÁT CÓ Ở HỆ THỐNG
    actionDetailReconcilDebtSupplier = async (reconcile: ReconcileSupplierDebtDetailDto, event: EventTable) => {
        this.reconcile_selected = reconcile
        this.re_id = reconcile.rec_id;
        if (event === EventTable.Accept) {
            let self = this;
            confirm({
                title: 'Thông báo',
                content: `Bạn muốn xác nhận đối soát thành công ?`,
                okText: 'Xác nhận',
                cancelText: 'Hủy',
                async onOk() {
                    self.setState({ isLoadDone: true });
                    await stores.reconcileStore.confirmReconcile(reconcile.rec_id)
                    await self.getSuccess();
                    self.setState({ isLoadDone: false });
                },
                onCancel() {

                },
            })
        }
        if (event === EventTable.ViewDetail) {
            this.setState({ visibleProduct: true })
        }
    }
    //CHỨC NĂNG CỦA BẢNG SẢN PHẨM NHẬP HỆ THỐNG 
    actionProductDetail = async (record: ProductImportDto, event: EventTable) => {
        if (event === EventTable.Edit) {
            this.setState({ visibleUpdateStatusProduct: true });
            await this.productSelected.init(record);
        }
        if (event === EventTable.History) {
            this.pr_code_logs = record.pr_im_code!;
            this.setState({ visibleModalLogReconcile: true });
        }
    }
    //CHỨC NĂNG CỦA BẢNG SẢN PHẨM NHẬP CHỈ CÓ Ở EXCEL 
    actionProductDetailOnlyExcel = async (record: ReconcileProductSupplierDebtDto, event: EventTable) => {
        if (event === EventTable.Edit) {
            this.setState({ visibleUpdateStatusProductOnlyExcel: true });
            await this.productSelectedOnlyExcel.init(record);
        }
        if (event === EventTable.History) {
            this.pr_code_logs = record.pr_code!;
            this.setState({ visibleModalLogReconcileOnlyExcel: true });
        }

    }
    getSuId = async (input: ReconcileSupplierDebtDto) => {
        this.su_id = input.su_id;
        this.reconcilSupplierDebtSelected = input;
        await this.getList();
    }
    render() {
        const { reconcileDebtSupplierDto, totalReconcileDebt, su_id_list } = stores.reconcileStore;
        const left = this.state.visibleUpdateStatusProduct ? cssCol(15) : cssCol(24);
        const right = this.state.visibleUpdateStatusProduct ? cssCol(9) : cssCol(0);
        const leftExcel = this.state.visibleUpdateStatusProductOnlyExcel ? cssCol(15) : cssCol(24);
        const rightExcel = this.state.visibleUpdateStatusProductOnlyExcel ? cssCol(9) : cssCol(0);
        const { tenant } = stores.sessionStore.currentLogin;
        const self = this;
        return (
            <Card>
                <Row justify='end' gutter={[8, 8]} align='bottom'>
                    <Col {...cssColResponsiveSpan(24, 24, 16, 5, 5, 3)} >
                        <h2>Đối soát nhập hàng</h2>
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 3, 3, 2)}>
                        <strong>Tháng đối soát</strong>
                        <DatePicker
                            style={{ width: "100%" }}
                            placeholder={"Chọn tháng"}
                            onChange={async (value) => { await this.setState({ rec_month: value !== null ? value : undefined }); this.handleSubmitSearch() }}
                            picker={"month"}
                            format={'MM/YYYY'}
                            value={this.state.rec_month}
                            disabledDate={current => current > moment()}
                        />
                    </Col>

                    <Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 4)}>
                        <strong>Nhà cung cấp</strong>
                        <SelectedSupplier
                            onChangeSupplier={async (value) => { await this.setState({ su_id: value }); this.handleSubmitSearch() }}
                            supplierID={this.state.su_id}
                        />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 4)}>
                        <strong>Trạng thái</strong>
                        <SelectEnum
                            eNum={eReconcileDebtStatusSupplier}
                            onChangeEnum={value => { this.setState({ re_status: value }); this.handleSubmitSearch() }}
                            enum_value={this.state.re_status}
                        />
                    </Col>
                    <Col  {...cssColResponsiveSpan(24, 24, 16, 6, 6, 5)} style={{ display: "flex", alignItems: 'end', flexWrap: "wrap", padding: 0 }}>
                        <Col>
                            <Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={this.handleSubmitSearch} >Tìm kiếm</Button>
                        </Col>
                        {
                            (!!this.state.rec_month || this.state.re_status != undefined || !!this.state.su_id) &&
                            <Col>
                                <Button danger icon={<DeleteOutlined />} title={"Xóa tìm kiếm"} onClick={this.onClearSearch} >Xóa tìm kiếm</Button>
                            </Col>
                        }
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 6)} style={{ textAlign: "end", }}>
                        {tenant &&
                            <Button style={{ marginRight: "10px" }} type='primary' onClick={() => this.setState({ visibleImportExcel: true })}>{"Đối soát nhập hàng"}</Button>
                        }
                        <Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportReconcileDebt: true })}>Xuất dữ liệu</Button>
                    </Col>
                </Row>
              
                {/* BẢNG ĐỐI SOÁT */}
                <TableReconcileDebt
                    listReconsile={reconcileDebtSupplierDto}
                    hasAction={true}
                    listSuId={su_id_list}
                    expandedRowRender={this.expandedRowRender}
                    onSuccess={this.getSuccess}
                    getSuID={this.getSuId}
                    actionTable={this.actionTableReconcile}
                    pagination={{
                        position: ['topRight'],
                        pageSize: this.state.pageSize,
                        total: totalReconcileDebt,
                        current: this.state.currentPage,
                        showTotal: (tot) => ("Tổng: ") + tot + "",
                        showQuickJumper: true,
                        showSizeChanger: true,
                        pageSizeOptions: pageSizeOptions,
                        onShowSizeChange(current: number, size: number) {
                            self.onChangePage(current, size)
                        },
                        onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
                    }} />

                {/* MODAL NHẬP ĐỐI SOÁT nhập hàng */}
                <Modal
                    visible={this.state.visibleImportExcel}
                    onCancel={() => { this.setState({ visibleImportExcel: false }) }}
                    closable={false}
                    maskClosable={false}
                    footer={false}
                    width={"85%"}
                >
                    <ImportLSCFromReconcileDebt
                        onCancel={() => { this.setState({ visibleImportExcel: false }) }}
                        onSuccess={() => { this.onChangePage(1, 10) }}
                    />
                </Modal>

                {/* MODAL THANH TOÁN nhập hàng */}
                {this.state.visiblePaymentDebt &&
                    <Modal
                        visible={this.state.visiblePaymentDebt}
                        onCancel={() => { this.setState({ visiblePaymentDebt: false }) }}
                        closable={true}
                        maskClosable={false}
                        footer={false}
                        title={
                            <>Thanh toán nhập hàng nhập hàng cho nhà cung cấp "<b>{stores.sessionStore.getNameSupplier(this.reconcilSupplierDebtSelected?.su_id)}</b>" của tháng <b>{this.reconcilSupplierDebtSelected?.rec_month}</b></>}
                        width={"70%"}
                    >
                        <PaymentSupplierDebt onCancel={() => this.setState({ visiblePaymentDebt: false })} onSuccess={() => this.getSuccess()} debt_money={this.reconcilSupplierDebtSelected.rec_remain_supplier_debt} su_id={this.reconcilSupplierDebtSelected.su_id} />
                    </Modal>
                }
                {/* MODAL LỊCH SỬ THANH TOÁN nhập hàng */}
                <Modal
                    visible={this.state.visibleHistoryPayment}
                    onCancel={() => { this.setState({ visibleHistoryPayment: false }) }}
                    closable={true}
                    maskClosable={false}
                    footer={false}
                    width={"70%"}
                    title={`Lịch sử thanh toán nhập hàng tháng "${this.reconcilSupplierDebtSelected!= undefined ? this.reconcilSupplierDebtSelected.rec_month: ''}" cho nhà cung cấp "${stores.sessionStore.getNameSupplier(this.supplierSelected?.su_id)}"`}
                >
                    <SupplierLogPayment supplierSelected={this.supplierSelected} />
                </Modal>
                {/* MODAL ĐỐI SOÁT SẢN PHẨM HỆ THỐNG */}
                <Modal
                    visible={this.state.visibleProduct}
                    onCancel={() => { this.setState({ visibleProduct: false, visibleUpdateStatusProduct: false }) }}
                    closable={true}
                    maskClosable={false}
                    footer={false}
                    width={"80%"}
                    title={<h2>Chi tiết đối soát sản phẩm trên hệ thống</h2>}
                >
                    <Row>
                        <Col {...left}>
                            <TableProductDetail onSuccess={() => this.getSuccess()} onAction={this.actionProductDetail} productDetail={this.reconcile_selected != undefined && this.reconcile_selected.listProductImport != undefined ? this.reconcile_selected.listProductImport : []} />
                        </Col>
                        <Col {...right}>
                            {this.state.visibleUpdateStatusProduct &&
                                <UpateReconcileDebt onCancel={() => this.setState({ visibleUpdateStatusProduct: false })} onSuccess={() => this.getSuccess()} recSelected={this.reconcile_selected} importProductSelected={this.productSelected} />
                            }
                        </Col>
                    </Row>
                </Modal>
                {/* MODAL ĐỐI SOÁT SẢN PHẨM CHỈ CÓ Ở EXCEL */}
                <Modal
                    visible={this.state.visibleProductOnlyExcel}
                    onCancel={() => { this.setState({ visibleProductOnlyExcel: false, visibleUpdateStatusProductOnlyExcel: false }) }}
                    closable={true}
                    maskClosable={false}
                    footer={false}
                    width={"80%"}
                    title={<h2>Chi tiết đối soát sản phẩm chỉ có ở excel</h2>}
                >
                    <Row>
                        <Col {...leftExcel}>
                            <TableProductDetailSupplier onSuccess={() => this.getSuccess()} onAction={this.actionProductDetailOnlyExcel} productDetail={this.reconcile_selected != undefined && this.reconcile_selected.listSupplierDebtOnlyInExcel != undefined ? this.reconcile_selected.listSupplierDebtOnlyInExcel : []} />
                        </Col>
                        <Col {...rightExcel}>
                            {this.state.visibleUpdateStatusProductOnlyExcel &&
                                <UpdateReconcilDebtOnlyExcel onCancel={() => this.setState({ visibleUpdateStatusProductOnlyExcel: false })} onSuccess={() => this.getSuccess()} reconcileProductSelect={this.productSelectedOnlyExcel} onlyExcelReconcile={this.reconcile_selected} />
                            }
                        </Col>
                    </Row>
                </Modal>
                {/* MODAL XUẤT DỮ LIỆU ĐỐI SOÁT nhập hàng */}
                {this.state.visibleExportReconcileDebt &&
                    <ModalExportReconcileDebt
                        reconcileListResult={reconcileDebtSupplierDto}
                        visible={this.state.visibleExportReconcileDebt}
                        onCancel={() => this.setState({ visibleExportReconcileDebt: false })}
                    />
                }

                <Modal
                    closable={true}
                    visible={this.state.visibleModalLogReconcile || this.state.visibleModalLogReconcileOnlyExcel}
                    onCancel={() => this.setState({ visibleModalLogReconcile: false, visibleModalLogReconcileOnlyExcel: false })}
                    maskClosable={false}
                    footer={false}
                    title={<h2>Lịch sử cập nhật trạng thái đối soát </h2>}
                    width={'70%'}
                >
                    <ReconcileLogs title={true} bi_code={this.pr_code_logs} />
                </Modal>
            </Card>
        )
    }
}