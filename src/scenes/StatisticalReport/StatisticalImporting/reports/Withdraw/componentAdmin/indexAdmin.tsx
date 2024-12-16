import * as React from 'react';
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, DatePicker, Modal, Row, Skeleton } from 'antd';
import { WithdrawDto } from '@src/services/services_autogen';
import AppConsts, { EventTable, RouterPath, cssCol, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import { ExportOutlined } from '@ant-design/icons';
import HistoryHelper from '@src/lib/historyHelper';
import { L } from '@src/lib/abpUtility';
import PassWord from '@src/scenes/SystemManager/Users/components/PassWord';
import { SorterResult } from 'antd/lib/table/interface';
import { eSort } from '@src/lib/enumconst';
import TableWithdrawAdmin from './TableWithdrawAdmin';
import CreateOrUpdateWithDrawAdmin from './CreateOrUpdateWithdrawAdmin';
import ModalExportWithdrawAdmin from './ModalExportWithdrawAdmin';
import SearchStaticWithdrawAdmin, { SearchWithdrawAdmin } from '@src/components/Manager/SearchStaticWithdrawAdmin';
import PassWordLevel2 from '@src/scenes/SystemManager/Users/components/PassWordLevel2';

const { confirm } = Modal;
const { RangePicker } = DatePicker;


export default class WithdrawUser extends AppComponentBase {
    state = {
        wi_start_at: undefined,
        wi_end_at: undefined,
        skipCount: 0,
        currentPage: 1,
        pageSize: 10,
        visibleModalCreateUpdate: false,
        visibleExportExcel: false,
        isLoadDone: true,
        payment_type: undefined,
        wi_status: undefined,
        wi_total_money: undefined,
        visiblePassWordLevel2ModalOpen: false,
        isCheckPassword2: false,
        ma_id_list: undefined,
        wi_payment_type: undefined,
        sort: undefined,
        hasPasswordLever2: undefined,
        gr_id: undefined,
        us_id: undefined,
    };
    withdrawSelected: WithdrawDto = new WithdrawDto();
    record_bank: any;
    record_cash: any;
    record_rfid: any;
    selectedField: string;

    async componentDidMount() {
        const sessionData = await stores.sessionStore.currentLogin
        this.record_bank = JSON.parse(localStorage.getItem('reconcile_bank')!);
        this.record_cash = JSON.parse(localStorage.getItem('reconcile_cash')!);
        this.record_rfid = JSON.parse(localStorage.getItem('reconcile_rfid')!);
        this.setState({ hasPasswordLever2: sessionData.user.hasPassword2 })
        this.setState({ isCheckPassword2: true, visiblePassWordLevel2ModalOpen: true });
        localStorage.removeItem('reconcile_bank');
        localStorage.removeItem('reconcile_cash');
        localStorage.removeItem('reconcile_rfid');

    }
    async getAll() {
        await stores.withDrawStore.getAllByAdmin(this.state.us_id, this.state.ma_id_list, this.state.gr_id, this.state.wi_payment_type, this.state.wi_start_at, this.state.wi_end_at, this.selectedField, this.state.sort, this.state.skipCount, this.state.pageSize)
        await this.setState({ isLoadDone: !this.state.isLoadDone, acceptWithdraw: false });
    }
    handleSubmitSearch = async () => {
        this.onChangePage(1, this.state.pageSize);
    }
    onChangePage = async (page: number, pagesize?: number) => {
        if (pagesize !== undefined) {
            await this.setState({ pageSize: pagesize! });
        }
        await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            await this.getAll();
        })
    }
    createOrUpdateModalOpen = async (input: WithdrawDto) => {
        if (input !== undefined && input !== null) {
            this.withdrawSelected.init(input);
            await this.setState({ visibleModalCreateUpdate: true, isLoadDone: true });
        }
    }
    openModalPassWordLevel2 = async (isCheckPassword2: boolean, event?: EventTable) => {
        this.setState({
            isCheckPassword2: isCheckPassword2,
            visiblePassWordLevel2ModalOpen: !this.state.visiblePassWordLevel2ModalOpen,
        });
    };
    onsavePassWordLevel2 = async (val: boolean) => {
        if (val != undefined && val == true) {
            this.setState({ visiblePassWordLevel2ModalOpen: false });
            await this.getAll();
            await this.setState({ visibleModalCreateUpdate: (!!this.record_bank || !!this.record_cash || !!this.record_rfid) ? true : false });
            this.setState({ hasPasswordLever2: undefined, isCheckPassword2: false })
        } else {
            Modal.error({ title: ("Thông báo"), content: ("Không được truy cập") });
            HistoryHelper.redirect(RouterPath.admin_home);
        }
    }
    onCancelUsersPassWordLevel2 = () => {
        this.setState({ visiblePassWordLevel2ModalOpen: false });
        if (this.state.isCheckPassword2 == true) {
            HistoryHelper.redirect(RouterPath.admin_home);
            this.setState({ hasPasswordLever2: undefined, isCheckPassword2: false })
        }
    }
    shouldChangeText = () => {
        const isChangeText = window.innerWidth <= 768;
        return !isChangeText;
    }
    searchStatistic = async (input: SearchWithdrawAdmin) => {
        await this.setState({
            us_id: input.us_id,
            ma_id_list: input.ma_id_list,
            gr_id: input.gr_id,
            wi_payment_type: input.payment_type,
            wi_start_at: input.start_date,
            wi_end_at: input.end_date
        })
        this.onChangePage(1, this.state.pageSize);
    }
    changeColumnSort = async (sort: SorterResult<WithdrawDto> | SorterResult<WithdrawDto>[]) => {
        this.setState({ isLoadDone: false });
        this.selectedField = sort["field"];
        await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
        await this.getAll();
        this.setState({ isLoadDone: true });

    }
    render() {
        const left = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 12, 14, 16, 16) : cssCol(24);
        const right = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 12, 10, 8, 8) : cssCol(0);
        let self = this;
        const { withdrawListResult, totalWithdraw } = stores.withDrawStore;
        return (
            <Card>
                <Skeleton active loading={this.state.visiblePassWordLevel2ModalOpen}>
                    <Row gutter={[8, 8]}>
                        <Col {...cssColResponsiveSpan(18, 16, 12, 8, 8, 8)}>
                            <h2>Rút tiền từ máy bán nước</h2>
                        </Col>
                        {this.isGranted(AppConsts.Permission.Pages_Statistic_MoneyWithdraw_Export) &&
                            <Col {...cssColResponsiveSpan(6, 8, 12, 16, 16, 16)} style={{ display: "flex", flexWrap: "wrap", justifyContent: "end", alignContent: "center", gap: 8 }}>
                                <Button title='Xuất dữ liệu' type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcel: true, select: false })}>{this.shouldChangeText() && 'Xuất dữ liệu'}</Button>
                            </Col>
                        }
                    </Row>
                    <Row gutter={[8, 8]} align='bottom'>
                        <SearchStaticWithdrawAdmin onSearchStatistic={(input) => this.searchStatistic(input)}></SearchStaticWithdrawAdmin>
                    </Row>
                    <Row>
                        <Col {...left} style={{ overflowY: "auto" }}>
                            <TableWithdrawAdmin
                                currentPage={this.state.currentPage}
                                pageSize={this.state.pageSize}
                                changeColumnSort={this.changeColumnSort}
                                withdrawListResult={withdrawListResult}
                                isLoadDone={this.state.isLoadDone}
                                is_Printed={false}
                                checkExpand={false}
                                pagination={{
                                    position: ['topRight'],
                                    pageSize: this.state.pageSize,
                                    total: totalWithdraw,
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
                        {this.state.visibleModalCreateUpdate &&
                            <Col  {...right}>
                                <CreateOrUpdateWithDrawAdmin
                                    withdrawSelected={this.withdrawSelected}
                                    onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
                                    onSuccess={async () => { await this.getAll(); this.setState({ visibleModalCreateUpdate: false }); this.onChangePage(1, this.state.pageSize) }}
                                    record={this.record_bank || this.record_cash || this.record_rfid}
                                />
                            </Col>
                        }

                    </Row>
                </Skeleton>
                <Modal
                    title={L("Mật khẩu")}
                    visible={this.state.visiblePassWordLevel2ModalOpen}
                    onCancel={() => this.onCancelUsersPassWordLevel2()}
                    cancelText={L("Hủy")}
                    footer={null}
                    className="UsersPassWordLevel2ModalClass"
                    destroyOnClose={true}
                    width={"50vw"}
                >
                    {this.state.hasPasswordLever2 ?
                        <PassWordLevel2
                            oncancel={() => this.setState({ visiblePassWordModalOpen: false })}
                            onsave={this.onsavePassWordLevel2}
                            isCheckPassword2={this.state.isCheckPassword2}
                        />
                        :
                        <PassWord
                            oncancel={() => this.setState({ visiblePassWordLevel2ModalOpen: false })}
                            onsave={this.onsavePassWordLevel2}
                            isCheckPassword2={this.state.isCheckPassword2}
                        />
                    }
                </Modal>

                <ModalExportWithdrawAdmin
                    currentPage={this.state.currentPage}
                    pageSize={this.state.pageSize}
                    withdrawListResult={withdrawListResult}
                    visible={this.state.visibleExportExcel}
                    onCancel={() => this.setState({ visibleExportExcel: false })}
                />
            </Card>
        )
    }
}