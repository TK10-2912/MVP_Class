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
import SupplierLogPayment from '@src/scenes/GeneralManager/LogSupplierDebt';
import confirm from 'antd/lib/modal/confirm';
import ReconcileLogs from '../ReconcilLogs';
import TableReconcileDebtHistory from './components/TableReconcileDebtHistory';
import TableDetailReconcileDebtSupplierHistory from './components/TableDetailReconcileDebtSupplierHistory';
import TableDetailReconcilDebtSupplierOnlyExcelHistory from './components/TableDetailReconcilDebtSupplierOnlyExcelHistory';
import ModalExportReconcileDebtHistory from './components/ModalExportReconcileDebtHistory';
import TableProductDetailHistory from './components/TableProductDetailHistory';
import TableProductDetailSupplierHistory from './components/TableProductDetailSupplierHistory';

export interface Iprops {
    su_id?: number;
    re_month?: string;
}
export const tabManager = {
    tab_1: "Danh sách lịch sử nhập hàng trên hệ thống",
    tab_2: "Danh sách lịch sử nhập hàng chỉ có ở Excel",
}
export default class ReconcileDebtHistory extends React.Component<Iprops> {
    state = {
        isLoadDone: true,
        skipCount: 0,
        currentPage: 1,
        pageSize: 10,
        rec_month: undefined,
        su_id: undefined,
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
        visibleModalLogReconcileOnlyExcel: false,
        visibleProduct: false,
        visibleProductOnlyExcel: false,
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
    async componentDidMount() {
        this.setState({ isLoadDone: true,su_id: this.props.su_id, rec_month:this.props.re_month!=undefined?  moment(this.props.re_month, 'MM/YYYY'): undefined });
        await this.getAll();
    }
    handleSubmitSearch = async () => {
        await this.onChangePage(1, 10);
    }
    async componentDidUpdate(prevProps, prevState) {
        if (prevProps.su_id != this.props.su_id) {
           await this.setState({ su_id: this.props.su_id, rec_month:this.props.re_month!=undefined?  moment(this.props.re_month, 'MM/YYYY'): undefined})
            await stores.reconcileStore.getAllSupplierDebtReconcile(this.state.su_id != undefined ? [this.state.su_id!] : undefined, this.state.rec_month != undefined ? moment(this.state.rec_month).format("M/YYYY") : undefined, this.state.re_status, this.state.skipCount, this.state.pageSize);
        }
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
        this.reconcile_selected = reconcile != undefined && reconcile.listReconcile != undefined ? reconcile.listReconcile.find(item => item.rec_id === this.re_id)! : new ReconcileSupplierDebtDetailDto();
        await this.getList();
        this.setState({ visiblePaymentDebt: false, visibleUpdateStatusProductOnlyExcel: false, visibleUpdateStatusProduct: false })
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
                        <TableDetailReconcileDebtSupplierHistory
                            isLoadDone={this.state.isLoadDone}
                            actionTableSuppplier={this.actionDetailReconcilDebtSupplier}
                            hasAction={true} reconcileDebtListDto={this.list} />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={tabManager.tab_2} key={tabManager.tab_2}>
                        <TableDetailReconcilDebtSupplierOnlyExcelHistory
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
                message.warning("Hiện tại chưa có lịch sử nhập hàng!")
                this.setState({ visibleHistoryPayment: false })
            }
        }
    }
    // CHỨC NĂNG CỦA BẢNG ĐỐI SOÁT CHỈ CÓ FILE EXCEL
    actionDetailReconcilDebtSupplierOnlyExcel = async (reconcile: ReconcileSupplierDebtDetailDto, event: EventTable) => {
        this.reconcile_selected = reconcile
        this.re_id = reconcile.rec_id;
        if (event === EventTable.ViewDetail) {
            this.setState({ visibleProductOnlyExcel: true })
        }
    }
    //CHỨC NĂNG CỦA BẢNG ĐỐI SOÁT CÓ Ở HỆ THỐNG
    actionDetailReconcilDebtSupplier = async (reconcile: ReconcileSupplierDebtDetailDto, event: EventTable) => {
        this.reconcile_selected = reconcile
        this.re_id = reconcile.rec_id;
        if (event === EventTable.ViewDetail) {
            this.setState({ visibleProduct: true })
        }
    }
    //CHỨC NĂNG CỦA BẢNG SẢN PHẨM NHẬP HỆ THỐNG 
    actionProductDetail = async (record: ProductImportDto, event: EventTable) => {
        if (event === EventTable.History) {
            this.setState({ visibleModalLogReconcile: true });
            this.pr_code_logs = record.pr_im_code!;
        }
    }
    //CHỨC NĂNG CỦA BẢNG SẢN PHẨM NHẬP CHỈ CÓ Ở EXCEL 
    actionProductDetailOnlyExcel = async (record: ReconcileProductSupplierDebtDto, event: EventTable) => {
        if (event === EventTable.History) {
            this.setState({ visibleModalLogReconcileOnlyExcel: true });
            this.pr_code_logs = record.pr_code!;
        }

    }
    getSuId = async (input: ReconcileSupplierDebtDto) => {
        this.su_id = input.su_id;
        this.reconcilSupplierDebtSelected = input;
        await this.getList();
    }
    render() {
        const { reconcileDebtSupplierHistoryDto, totalReconcileDebtHistory } = stores.reconcileStore;
        const left = this.state.visibleUpdateStatusProduct ? cssCol(15) : cssCol(24);
        const right = this.state.visibleUpdateStatusProduct ? cssCol(9) : cssCol(0);
        const leftExcel = this.state.visibleUpdateStatusProductOnlyExcel ? cssCol(15) : cssCol(24);
        const rightExcel = this.state.visibleUpdateStatusProductOnlyExcel ? cssCol(9) : cssCol(0);
        const self = this;
        return (
            <Card>
                <Row justify='end'>
                    <Col span={12}>
                        <h2>Lịch sử đối soát nhập hàng</h2>
                    </Col>
                    <Col span={12} style={{ textAlign: "end", marginBottom: 10 }}>
                        {/* { */}
                        {/* isGranted(AppConsts.Permission.Pages_Reconcile_Reconcile_Export) && */}
                        <Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportReconcileDebt: true })}>Xuất dữ liệu</Button>
                        {/* } */}
                    </Col>
                </Row>
                <Row gutter={10} style={{ marginBottom: 10 }}>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 3, 3, 3)}>
                        <strong>Tháng</strong>
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

                    <Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 3)}>
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
                    <Col  {...cssColResponsiveSpan(24, 24, 16, 7, 7, 6)} style={{ display: "flex", alignItems: 'end', flexWrap: "wrap", padding: 0 }}>
                        <Col>
                            <Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={this.handleSubmitSearch} >Tìm kiếm</Button>
                        </Col>
                        {
                            (!!this.state.rec_month || !!this.state.re_status || !!this.state.su_id) &&
                            <Col>
                                <Button danger icon={<DeleteOutlined />} title={"Xóa tìm kiếm"} onClick={this.onClearSearch} >Xóa tìm kiếm</Button>
                            </Col>
                        }
                    </Col>

                </Row>
                {/* BẢNG ĐỐI SOÁT */}
                <TableReconcileDebtHistory
                    listReconsile={reconcileDebtSupplierHistoryDto}
                    hasAction={true}
                    expandedRowRender={this.expandedRowRender}
                    onSuccess={this.getSuccess}
                    getSuID={this.getSuId}
                    actionTable={this.actionTableReconcile}
                    pagination={{
                        position: ['topRight'],
                        pageSize: this.state.pageSize,
                        total: totalReconcileDebtHistory,
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
                {/* MODAL LỊCH SỬ THANH TOÁN CÔNG NỢ */}
                <Modal
                    visible={this.state.visibleHistoryPayment}
                    onCancel={() => { this.setState({ visibleHistoryPayment: false }) }}
                    closable={true}
                    maskClosable={false}
                    footer={false}
                    width={"70%"}
                    title={`Lịch sử thanh toán nhập hàng cho nhà cung cấp "${stores.sessionStore.getNameSupplier(this.supplierSelected.su_id)}"`}
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
                    title={`Đối soát danh sách sản phẩm nhập hệ thống `}
                >
                    <Row>
                        <Col {...left}>
                            <TableProductDetailHistory onSuccess={() => this.getSuccess()} onAction={this.actionProductDetail} productDetail={this.reconcile_selected != undefined && this.reconcile_selected.listProductImport != undefined ? this.reconcile_selected.listProductImport : []} />
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
                    title={`Đối soát danh sách sản phẩm nhập chỉ có ở excel`}
                >
                    <Row>
                        <Col {...leftExcel}>
                            <TableProductDetailSupplierHistory onSuccess={() => this.getSuccess()} onAction={this.actionProductDetailOnlyExcel} productDetail={this.reconcile_selected != undefined && this.reconcile_selected.listSupplierDebtOnlyInExcel != undefined ? this.reconcile_selected.listSupplierDebtOnlyInExcel : []} />
                        </Col>
                    </Row>
                </Modal>
                {/* MODAL XUẤT DỮ LIỆU ĐỐI SOÁT CÔNG NỢ */}
                {this.state.visibleExportReconcileDebt &&
                    <ModalExportReconcileDebtHistory
                        reconcileListResult={reconcileDebtSupplierHistoryDto}
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
                    title={<h2>Lịch sử cập nhật trạng thái đối soát</h2>}
                    width={'70%'}
                >
                    <ReconcileLogs bi_code={this.pr_code_logs} />
                </Modal>
            </Card>
        )
    }
}