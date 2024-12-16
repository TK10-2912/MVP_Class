import * as React from 'react';
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, DatePicker, Modal, Row } from 'antd';
import { WithdrawDto } from '@src/services/services_autogen';
import AppConsts, { EventTable, RouterPath, cssCol, cssColResponsiveSpan } from '@src/lib/appconst';
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
import { stat } from 'fs';

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
        rangeDatetime: undefined,
        sort: undefined,
    };
    withdrawSelected: WithdrawDto = new WithdrawDto();
    record_bank: any;
    record_cash: any;
    selectedField: string;

    async componentDidMount() {
        this.record_bank = JSON.parse(localStorage.getItem('reconcile_bank')!);
        this.record_cash = JSON.parse(localStorage.getItem('reconcile_cash')!);
        await this.setState({ visibleModalCreateUpdate: (!!this.record_bank || !!this.record_cash) ? true : false });
        await this.getAll();
        this.setState({ isCheckPassword2: true, visiblePassWordLevel2ModalOpen: true });
        localStorage.removeItem('reconcile_bank');
        localStorage.removeItem('reconcile_cash');
    }
    async getAll() {
        this.setState({ isLoadDone: false });
        await stores.withDrawStore.getAll(this.state.ma_id_list, this.state.wi_payment_type, !!this.state.rangeDatetime ? moment(this.state.rangeDatetime![0]).startOf('day').toDate() : undefined, !!this.state.rangeDatetime ? moment(this.state.rangeDatetime![1]).endOf('day').toDate() : undefined, this.selectedField, this.state.sort, this.state.skipCount, this.state.pageSize)
        await this.setState({ isLoadDone: true, visibleModalCreateUpdate: (!!this.record_bank || !!this.record_cash) ? true : false, acceptWithdraw: false });
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
        } else {
            Modal.error({ title: ("Thông báo"), content: ("Không được truy cập") });
            HistoryHelper.redirect(RouterPath.admin_home);
        }
    }
    onCancelUsersPassWordLevel2 = () => {
        this.setState({ visiblePassWordLevel2ModalOpen: false });
        if (this.state.isCheckPassword2 == true) {
            HistoryHelper.redirect(RouterPath.admin_home);
        }
    }
    shouldChangeText = () => {
        const isChangeText = window.innerWidth <= 768;
        return !isChangeText;
    }
    searchStatistic = async (input: SearchWithdrawUser) => {
        await this.setState({
            ma_id_list: input.ma_id_list,
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
        const left = this.state.visibleModalCreateUpdate || this.state.viewDetail ? cssColResponsiveSpan(24, 24, 12, 14, 14, 14) : cssCol(24);
        const right = this.state.visibleModalCreateUpdate || this.state.viewDetail ? cssColResponsiveSpan(24, 24, 12, 10, 10, 10) : cssCol(0);
        let self = this;
        const { withdrawListResult, totalWithdraw } = stores.withDrawStore;
        return (
            <Card>
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
                    <SearchStaticWithdrawUser onSearchStatistic={(input) => this.searchStatistic(input)}
                    ></SearchStaticWithdrawUser>
                </Row>
                <Row>
                    <Col {...left} style={{ overflowY: "auto" }}>
                        <TableWithdrawUser
                            changeColumnSort={this.changeColumnSort}
                            actionTable={this.actionTable}
                            withdrawListResult={withdrawListResult}
                            isLoadDone={this.state.isLoadDone}
                            is_Printed={false}
                            pagination={{
                                pageSize: this.state.pageSize,
                                total: totalWithdraw,
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
                    {this.state.visibleModalCreateUpdate &&
                        <Col  {...right}>
                            <CreateOrUpdateWithDrawUser
                                withdrawSelected={this.withdrawSelected}
                                onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
                                onSuccess={async () => { await this.getAll(); this.setState({ visibleModalCreateUpdate: false }) }}
                                record={this.record_bank != null ? this.record_bank : this.record_cash}
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

                    <PassWord
                        oncancel={() => this.setState({ visiblePassWordLevel2ModalOpen: false })}
                        onsave={this.onsavePassWordLevel2}
                        isCheckPassword2={this.state.isCheckPassword2}
                    />
                </Modal>

                <ModalExportWithdrawUser
                    withdrawListResult={withdrawListResult}
                    visible={this.state.visibleExportExcel}
                    onCancel={() => this.setState({ visibleExportExcel: false })}
                />
            </Card>
        )
    }
}