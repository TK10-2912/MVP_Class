import * as React from 'react';
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, DatePicker, Modal, Row } from 'antd';
import { WithdrawDto } from '@src/services/services_autogen';
import AppConsts, { EventTable, RouterPath, cssCol, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import { ExportOutlined } from '@ant-design/icons';
import moment from 'moment';
import ModalExportWithdrawUser from './ModalExportWithdrawUser';
import CreateOrUpdateWithDrawUser from './CreateOrUpdateWithdrawUser';
import TableWithdrawUser from './TableWithdrawUser';
import HistoryHelper from '@src/lib/historyHelper';
import { L } from '@src/lib/abpUtility';
import PassWord from '@src/scenes/SystemManager/Users/components/PassWord';
import SearchStaticWithdrawUser, { SearchWithdrawUser } from '@src/components/Manager/SearchStaticWithdrawUser';
import ViewWithdrawUser from './ViewWithdrawUser';
import { SorterResult } from 'antd/lib/table/interface';
import { eSort } from '@src/lib/enumconst';
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
        visibleModalCreateUpdate: true,
        visibleExportExcel: false,
        isLoadDone: true,
        payment_type: undefined,
        wi_status: undefined,
        wi_total_money: undefined,
        viewDetail: false,
        visiblePassWordLevel2ModalOpen: false,
        isCheckPassword2: false,
        ma_id_list: undefined,
        wi_payment_type: undefined,
        gr_id: undefined,
        sort: undefined,
        hasPasswordLever2: undefined,
        type: "",

    };
    withdrawSelected: WithdrawDto = new WithdrawDto();
    record_bank: any;
    record_cash: any;
    record_rfid: any;
    selectedField: string;
    inputSearch: SearchWithdrawUser = new SearchWithdrawUser(undefined, undefined, undefined, undefined, undefined);
    async componentDidMount() {
        const sessionData = await stores.sessionStore.currentLogin
        this.record_bank = JSON.parse(localStorage.getItem('reconcile_bank')!);
        this.record_cash = JSON.parse(localStorage.getItem('reconcile_cash')!);
        this.record_rfid = JSON.parse(localStorage.getItem('reconcile_rfid')!);
        this.setState({ hasPasswordLever2: sessionData.user.hasPassword2 })
        this.setState({ isCheckPassword2: true, visiblePassWordLevel2ModalOpen: true, visibleModalCreateUpdate: false });
        localStorage.removeItem('reconcile_bank');
        localStorage.removeItem('reconcile_cash');
        localStorage.removeItem('reconcile_rfid');

    }
    async getAll() {
        await stores.withDrawStore.getAll(this.state.ma_id_list, this.state.gr_id, this.state.wi_payment_type, this.state.wi_start_at, this.state.wi_end_at, this.selectedField, this.state.sort, this.state.skipCount, this.state.pageSize)
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
            this.getAll();
        })
    }
    actionTable = (withdraw: WithdrawDto, event: EventTable) => {
        if (event == EventTable.View) {
            this.withdrawSelected.init(withdraw);
            this.setState({ viewDetail: true })
        }
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
    searchStatistic = async (input: SearchWithdrawUser, type: String) => {
        this.inputSearch = input;
        await this.setState({
            gr_id: input.gr_id,
            ma_id_list: input.ma_id_list,
            wi_payment_type: input.payment_type,
            wi_start_at: input.start_date,
            wi_end_at: input.end_date,
            type: type,
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
        let dateRangeText = "";
        const { start_date, end_date } = this.inputSearch;
        if (start_date && end_date) {
            const type = this.state.type;
            if (type === 'date') {
                dateRangeText = (moment(this.inputSearch.start_date).format('DD/MM/YYYY') === moment(this.inputSearch.end_date).subtract(7, "hour").format('DD/MM/YYYY')
                    ? `TRONG NGÀY ${moment(this.inputSearch.start_date).format('DD/MM/YYYY')}`
                    : `TỪ NGÀY ${moment(this.inputSearch.start_date).format('DD/MM/YYYY')} ĐẾN NGÀY ${moment(this.inputSearch.end_date).subtract(7, "hour").format('DD/MM/YYYY')}`
                )
            } else if (type === 'month') {
                dateRangeText = (moment(this.inputSearch.start_date).format('MM/YYYY') === moment(this.inputSearch.end_date).subtract(7, "hour").format('MM/YYYY')
                    ? `TRONG THÁNG ${moment(this.inputSearch.start_date).format('MM/YYYY')}`
                    : `TỪ THÁNG ${moment(this.inputSearch.start_date).format('MM/YYYY')} ĐẾN THÁNG ${moment(this.inputSearch.end_date).subtract(7, "hour").format('MM/YYYY')}`
                )
            } else if (type === 'year') {
                dateRangeText = (moment(this.inputSearch.start_date).format('YYYY') === moment(this.inputSearch.end_date).subtract(7, "hour").format('YYYY')
                    ? `TRONG NĂM ${moment(this.inputSearch.start_date).format('YYYY')}`
                    : `TỪ NĂM ${moment(this.inputSearch.start_date).format('YYYY')} ĐẾN NĂM ${moment(this.inputSearch.end_date).subtract(7, "hour").format('YYYY')}`
                )
            }
        }
        let self = this;
        const { withdrawListResult, totalWithdraw } = stores.withDrawStore;
        return (
            <Card>
                <Row gutter={[8, 8]}>
                    <Col {...cssColResponsiveSpan(18, 16, 12, 14, 19, 20)}>
                        <SearchStaticWithdrawUser onSearchStatistic={(input, type) => this.searchStatistic(input, type)}></SearchStaticWithdrawUser>
                    </Col>
                    {this.isGranted(AppConsts.Permission.Pages_Statistic_MoneyWithdraw_Export) &&
                        <Col {...cssColResponsiveSpan(6, 8, 12, 10, 5, 4)} style={{ display: "flex", flexWrap: "wrap", justifyContent: "end", alignContent: "center", gap: 8 }}>
                            <Button title='Xuất dữ liệu' type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcel: true, select: false })}>{this.shouldChangeText() && 'Xuất dữ liệu'}</Button>
                        </Col>
                    }
                </Row>
                <Row>
                    <Col span={20}>
                        <h2 style={{ textAlign: 'center', paddingTop: '10px' }}>
                            {"THỐNG KÊ RÚT TIỀN TỪ MÁY BÁN NƯỚC "}
                            {dateRangeText}
                        </h2>
                    </Col>
                    <Col span={4}>
                        <Col span={4} style={{ display: "flex", flexWrap: "wrap", justifyContent: "end", alignContent: "center", gap: 8 }}>
                            <Button title='Xuất dữ liệu' type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcel: true, select: false })}>{this.shouldChangeText() && 'Xuất dữ liệu'}</Button>
                        </Col>
                    </Col>
                </Row>
                <Row>
                    <Col {...left} style={{ overflowY: "auto" }}>
                        <TableWithdrawUser
                            currentPage={this.state.currentPage}
                            pageSize={this.state.pageSize}
                            actionTable={this.actionTable}
                            withdrawListResult={withdrawListResult}
                            isLoadDone={this.state.isLoadDone}
                            is_Printed={false}
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
                            <CreateOrUpdateWithDrawUser
                                withdrawSelected={this.withdrawSelected}
                                onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
                                onSuccess={async () => { await this.getAll(); this.setState({ visibleModalCreateUpdate: false }); this.onChangePage(1, this.state.pageSize) }}
                                record={(this.record_bank != null ? this.record_bank : this.record_cash) ? this.record_bank : this.record_rfid}
                            />
                        </Col>
                    }
                    {
                        this.state.viewDetail &&
                        <Col {...right}>
                            <ViewWithdrawUser
                                withDrawSelected={this.withdrawSelected}
                                wi_id={this.withdrawSelected.wi_id}
                                onCancel={() => this.setState({ viewDetail: false })}
                            />
                        </Col>
                    }
                </Row>
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
                    {this.state.hasPasswordLever2 == true ?
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

                <ModalExportWithdrawUser
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