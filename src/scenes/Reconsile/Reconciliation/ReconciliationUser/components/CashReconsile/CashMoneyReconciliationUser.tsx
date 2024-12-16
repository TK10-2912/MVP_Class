import * as React from 'react';
import { Button, Card, Col, Modal, Row, message } from 'antd';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { stores } from '@src/stores/storeInitializer';
import { BillingDto, ReconcileCashDto, ReconcileDto, WithdrawDto } from '@src/services/services_autogen';
import ModalBilingDetailReconciliationUser from './ModalBilingDetailReconciliationUser';
import { eReconcileBillingStatus } from '@src/lib/enumconst';
import SearchReconcile from '@src/components/Manager/SearchReconcile';
import { ExportOutlined } from '@ant-design/icons';
import ModalExportCashReconcileUser from './ModalExportCashReconcileUser';
import { SearchInputUser } from '@src/stores/statisticStore';
import TableReconcileCashUser from './TableReconcileCashUser';
import TableReconcileDetailCashUser from './TableReconcileDetailCashUser';
import ModalExportCashDetailReconcileUser from './ModalExportCashDetailReconcileUser';
import ModalExportBillingReconcile from './ModalExportBillingReconcile';
import { isGranted } from '@src/lib/abpUtility';
import moment from 'moment';

export interface Iprops {
    tab?: string;
}
const { confirm } = Modal;

export default class CashMoneyReconciliationUser extends React.Component<Iprops> {
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
        lista: undefined,
        rec_month: moment().month(),
    }
    reconcileDto: ReconcileDto = new ReconcileDto();
    reconcileCashDto: ReconcileCashDto = new ReconcileCashDto();
    listReconcileDetail: ReconcileDto[] = [];
    listBillingResult: BillingDto[] = [];
    withdraw: WithdrawDto;
    rec_id: number = 0;

    async componentDidMount() {
        await this.getAll();
    }

    actionTableReconcileCash = async (item: ReconcileDto, event: EventTable, checked?: boolean) => {
        if (event === EventTable.View) {
            if (item!.listBillingId!.length > 0) {
                this.reconcileDto.init(item);
                this.rec_id = item.rec_id;
                this.setState({ visibleModalBillingDetail: true });
            }
            else message.warning("Không có dữ liệu");
        }
        else if (event == EventTable.Accept) {
            this.reconcileDto.init(item);
            if (item.rec_id > 0) {
                let self = this;
                confirm({
                    title: 'Xác nhận đối soát?',
                    okText: "Xác nhận",
                    cancelText: "Hủy",
                    async onOk() {
                        await stores.reconcileStore.confirmReconcile(item.rec_id);
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
    actionTable = async (item: ReconcileCashDto, event: EventTable, checked?: boolean) => {
        if (event === EventTable.View) {
            this.reconcileCashDto.init(item);
            if (item!.listReconcile!.length > 0) {
                if (item.listReconcile!.length > 0) {
                    this.listReconcileDetail = item.listReconcile!;
                    this.setState({ lista: item.listReconcile });
                    this.setState({ visibleReconcileCashDetail: true });
                }
                else message.warning("Không có dữ liệu");
            }
            else message.warning("Không có dữ liệu");
        }
        else if (event == EventTable.Accept) {
            if (item!.listReconcile!.length > 0) {
                let self = this;
                confirm({
                    title: <h3><span>{"Vui lòng kiểm tra kỹ các đơn hàng trước khi xác nhận, sau khi xác nhận sẽ "}</span><span style={{ color: "red" }}>không thể thay đổi thông tin đơn hàng?</span></h3>,
                    okText: "Xác nhận",
                    cancelText: "Hủy",
                    async onOk() {
                        await Promise.all(item!.listReconcile!.map(async (reconcile) => {
                            stores.reconcileStore.confirmReconcile(reconcile.rec_id);
                        }));
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

    getAll = async () => {
        this.setState({ isLoadDone: false });
        await stores.reconcileStore.getAllReconcileCash(this.state.gr_ma_id, this.state.ma_id_list, this.state.end_date, this.state.skipCount, this.state.pageSize);
        this.setState({ isLoadDone: true });
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
    onSearchStatisticUser = async (input: SearchInputUser) => {
        await this.setState({ start_date: input.start_date, end_date: input.end_date, gr_ma_id: input.gr_ma_id, ma_id_list: input.ma_id_list });
        this.onChangePage(1, this.state.pageSize);
    }
    render() {
        let self = this;
        const { reconcileCashListDto, total } = stores.reconcileStore;
        return (
            <Card>
                <Row gutter={[8, 8]}>
                    <Col span={12}>
                        <h2>Đối soát tiền mặt</h2>
                    </Col>
                    {isGranted(AppConsts.Permission.Pages_Reconcile_Reconcile_Export) &&
                        <Col span={12} style={{ display: "flex", justifyContent: "end" }}>
                            <Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcel: true })}>Xuất dữ liệu</Button>
                        </Col>
                    }
                    <Col span={24}>
                        <SearchReconcile onSearchStatistic={(input) => { this.onSearchStatisticUser(input) }} />
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <TableReconcileCashUser
                            onSuccess={this.getAll}
                            has_action={true}
                            is_printed={false}
                            actionTable={this.actionTable}
                            listReconciliationResult={reconcileCashListDto}
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
                    </Col>
                </Row>
                {this.state.visibleReconcileCashDetail &&
                    <Modal
                        visible={this.state.visibleReconcileCashDetail}
                        onCancel={() => { this.setState({ visibleReconcileCashDetail: false }) }}
                        closable={false}
                        maskClosable={false}
                        footer={false}
                        width={"80%"}
                        title={<><Row>
                            <Col span={18}>
                                <h2>{`Danh sách đơn hàng đối soát theo tiền mặt theo máy "${stores.sessionStore.getNameMachines(this.reconcileCashDto.ma_id)}" tháng ${this.reconcileCashDto.rec_month}` }</h2>
                            </Col>
                            <Col span={6} style={{ display: "flex", justifyContent: "end" }}>
                                <Button style={{ marginRight: "10px" }} type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcelDetail: true })}>Xuất dữ liệu</Button>
                                <Button
                                    danger
                                    type="ghost" title='Hủy'
                                    onClick={() => this.setState({ visibleReconcileCashDetail: false })}
                                >
                                    Hủy
                                </Button>
                            </Col>
                        </Row>
                        </>}
                    >
                        <TableReconcileDetailCashUser
                            onCancel={() => this.setState({ visibleReconcileCashDetail: false })}
                            onSuccess={this.getAll}
                            has_action={true}
                            actionTable={this.actionTableReconcileCash}
                            listReconciliationResult={this.listReconcileDetail}
                            pagination={{
                                pageSize: this.state.pageSize,
                                total: this.listReconcileDetail.length,
                                current: this.state.currentPage,
                                showTotal: (tot) => ("Tổng: ") + tot + "",
                                showQuickJumper: true,
                                showSizeChanger: true,
                                pageSizeOptions: ['10', '20', '50', '100'],
                                onShowSizeChange(current: number, size: number) {
                                    self.onChangePage(current, size)
                                },
                                onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
                            }} />

                    </Modal>
                }
                {
                    this.state.visibleModalBillingDetail &&
                    <Modal
                        visible={this.state.visibleModalBillingDetail}
                        onCancel={() => { this.setState({ visibleModalBillingDetail: false }); this.listBillingResult = [] }}
                        closable={false}
                        maskClosable={false}
                        footer={false}
                        width={"90%"}
                        title={<><Row>
                            <Col span={18}>
                                <h2>{"Danh sách hoá đơn đối soát tiền mặt"}</h2>
                            </Col>
                            <Col span={6} style={{ display: "flex", justifyContent: "end" }}>
                                <Button style={{ marginRight: "10px" }} type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcelBillingDetail: true })}>Xuất dữ liệu</Button>
                                <Button
                                    danger
                                    type="ghost" title='Hủy'
                                    onClick={() => this.setState({ visibleModalBillingDetail: false })}
                                >
                                    Hủy
                                </Button>
                            </Col>
                        </Row>
                        </>}
                    >
                        <ModalBilingDetailReconciliationUser
                            isLoadDone={this.state.isLoadDone}
                            reconcile={this.reconcileDto}
                            onCancel={() => { this.setState({ visibleModalBillingDetail: false }) }}
                            onSuccess={() => this.getSuccess()}
                            is_confirmed={this.reconcileDto.rec_status != eReconcileBillingStatus.NONE.num ? true : false}
                            rec_id={this.rec_id} />

                    </Modal>
                }
                {
                    this.state.visibleExportExcel &&
                    <ModalExportCashReconcileUser
                        listReconsile={reconcileCashListDto}
                        onCancel={() => { this.setState({ visibleExportExcel: false }) }}
                        visible={this.state.visibleExportExcel}
                    />
                }
                {
                    this.state.visibleExportExcelDetail &&
                    <ModalExportCashDetailReconcileUser
                        listReconsile={this.listReconcileDetail!}
                        onCancel={() => { this.setState({ visibleExportExcelDetail: false }) }}
                        visible={this.state.visibleExportExcelDetail}
                        reconcileCashSelect={this.reconcileCashDto}
                        title={stores.sessionStore.getNameMachines(this.listReconcileDetail![0]!.ma_id)}
                    />
                }
                {
                    this.state.visibleExportExcelBillingDetail &&
                    <ModalExportBillingReconcile
                        reconcile={this.reconcileDto!}
                        visible={this.state.visibleExportExcelBillingDetail}
                        onCancel={() => { this.setState({ visibleExportExcelBillingDetail: false }) }}
                    />
                }
            </Card >
        )
    }
}