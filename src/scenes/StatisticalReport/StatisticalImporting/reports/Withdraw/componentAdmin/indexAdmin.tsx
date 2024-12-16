import { DeleteOutlined, ExportOutlined, PlusOutlined, SearchOutlined, WarningOutlined } from '@ant-design/icons';
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import SelectEnum from '@src/components/Manager/SelectEnum';
import SelectUserMultiple from '@src/components/Manager/SelectUserMultiple';
import AppConsts, { EventTable, RouterPath, cssCol, cssColResponsiveSpan } from '@src/lib/appconst';
import { ePaymentMethod, eSort, eWithdrawStatus } from '@src/lib/enumconst';
import { WithdrawDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, InputNumber, Modal, Row, message } from 'antd';
import moment from 'moment';
import CreateOrUpdateWithDrawAdmin from './CreateOrUpdateWithdrawAdmin';
import ModalExportWithdrawAdmin from './ModalExportWithdrawAdmin';
import TableWithdrawAdmin from './TableWithdrawAdmin';
import * as React from 'react';
import HistoryHelper from '@src/lib/historyHelper';
import { L } from '@src/lib/abpUtility';
import PassWordLevel2 from '@src/scenes/SystemManager/Users/components/PassWordLevel2';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';
import SearchStaticWithdrawAdmin, { SearchWithdrawAdmin } from '@src/components/Manager/SearchStaticWithdrawAdmin';
import { SorterResult } from 'antd/lib/table/interface';

const { confirm } = Modal;

export default class WithdrawAdmin extends AppComponentBase {

    state = {
        wi_start_at: undefined,
        wi_end_at: undefined,
        us_id_list: undefined,
        skipCount: 0,
        currentPage: 1,
        pageSize: 10,
        visibleModalCreateUpdate: false,
        visibleExportExcel: false,
        isLoadDone: true,
        wi_payment_type: undefined,
        wi_status: undefined,
        us_id_withdraw: undefined,
        viewDetail: false,
        prevEndDate: '',
        visiblePassWordLevel2ModalOpen: true,
        isCheckPassword2: false,
        ma_id_list: undefined,
        sort: undefined,
    };
    selectedField: string;

    async componentDidMount() {
        await this.setState({ isCheckPassword2: true, visiblePassWordLevel2ModalOpen: true });
        this.getAll();
    }
    async getAll() {
        this.setState({ isLoadDone: false });
        await stores.withDrawStore.getAllByAdmin(this.state.us_id_list, this.state.ma_id_list, this.state.wi_payment_type, this.state.wi_start_at, this.state.wi_end_at, this.selectedField, this.state.sort, this.state.skipCount, this.state.pageSize)
        this.setState({ isLoadDone: true });
    }
    searchStatistic = async (input: SearchWithdrawAdmin) => {
        await this.setState({
            us_id_list: input.us_id,
            ma_id_list: input.ma_id_list,
            wi_payment_type: input.payment_type,
            wi_start_at: input.start_date,
            wi_end_at: input.end_date
        })
        this.onChangePage(1, this.state.pageSize);
    }
    handleVisibleChange = (visible) => {
        this.setState({ clicked: visible });
    }
    onChangePage = async (page: number, pagesize?: number) => {
        if (pagesize !== undefined) {
            await this.setState({ pageSize: pagesize! });
        }
        await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            this.getAll();
        })
    }

    openModalPassWordLevel2 = async (isCheckPassword2: boolean, event?: EventTable) => {
        this.setState({
            isCheckPassword2: isCheckPassword2,
            visiblePassWordLevel2ModalOpen: !this.state.visiblePassWordLevel2ModalOpen,
        });
    };

    onsavePassWordLevel2 = async (val: boolean) => {
        if (val != undefined && val == true) {
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
    changeColumnSort = async (sort: SorterResult<WithdrawDto> | SorterResult<WithdrawDto>[]) => {
        this.setState({ isLoadDone: false });
        this.selectedField = sort["field"];
        await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
        await this.getAll();
        this.setState({ isLoadDone: true });

    }
    render() {
        let self = this;
        const { withdrawListResult, totalWithdraw, } = stores.withDrawStore;
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
                    <SearchStaticWithdrawAdmin onSearchStatistic={(input) => this.searchStatistic(input)}></SearchStaticWithdrawAdmin>
                </Row>
                <TableWithdrawAdmin
                    changeColumnSort={this.changeColumnSort}
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
                <Modal
                    title={L("mat_khau_cap_2")}
                    visible={this.state.visiblePassWordLevel2ModalOpen}
                    onCancel={() => this.onCancelUsersPassWordLevel2()}
                    cancelText={L("Hủy")}
                    footer={null}
                    className="UsersPassWordLevel2ModalClass"
                    destroyOnClose={true}
                    width={"50vw"}
                >
                    <PassWordLevel2
                        oncancel={() => this.setState({ visiblePassWordLevel2ModalOpen: false })}
                        onsave={this.onsavePassWordLevel2}
                        isCheckPassword2={this.state.isCheckPassword2}
                    />
                </Modal>
                <ModalExportWithdrawAdmin
                    withdrawListResult={withdrawListResult}
                    visible={this.state.visibleExportExcel}
                    onCancel={() => this.setState({ visibleExportExcel: false })}
                />
            </Card>
        )
    }
}