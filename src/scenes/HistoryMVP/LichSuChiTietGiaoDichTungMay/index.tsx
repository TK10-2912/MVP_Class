import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Row } from 'antd';
import * as React from 'react';
import { MachineDto, TransactionByMachineDto } from '@src/services/services_autogen';
import AppConsts, { EventTable, cssColResponsiveSpan } from '@src/lib/appconst';
import { ExportOutlined } from '@ant-design/icons';
import TableTransactionDetail from './component/TableTransactionDetail';
import ModalExportTransactionAdmin from './component/ModalExportTransactionAdmin';
import { isGranted } from '@src/lib/abpUtility';
import SearchHistoryTransactionInputUser, { SearchHistoryTransactionInput } from '@src/components/Manager/SearchHistoryTransactionInputUser';
import SearchHistoryTransactionInputAdmin, { SearchHistoryTransactionAdminInput } from '@src/components/Manager/SearchHistoryTransactionInputAdmin';
import moment from 'moment';
import { SorterResult } from 'antd/lib/table/interface';
import { eSort } from '@src/lib/enumconst';
export interface IProps {
    cash_payment?: boolean;
}

export default class TransactionDetail extends React.Component<IProps> {
    componentRef: any | null = null;
    state = {
        start_date: undefined,
        end_date: undefined,
        gr_ma_id: undefined,
        bi_code: undefined,
        ma_id_list: [],
        skipCount: 0,
        maxResultCount: 10,
        pageSize: 10,
        currentPage: 1,
        visibleExportExcel: false,
        isLoadDone: true,
        checkStartDate: true,
        sort: undefined,
    }
    selectedField: string;
    machineSelected: MachineDto;
    inputSearchUser: SearchHistoryTransactionInput = new SearchHistoryTransactionInput(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    inputSearchAdmin: SearchHistoryTransactionAdminInput = new SearchHistoryTransactionAdminInput(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);

    async componentDidMount() {
        await this.setState({ isLoadDone: false });
        const urlParams = new URLSearchParams(window.location.search);
        let startDate = urlParams.get('startDate') == null || urlParams.get('startDate') == "undefined" ? undefined : urlParams.get('startDate');
        let endDate = urlParams.get('endDate') == null || urlParams.get('endDate') == "undefined" ? undefined : urlParams.get('endDate');
        let ma_list_id = urlParams.get('ma_list_id') == null || urlParams.get('ma_list_id') == "undefined" ? [] : [Number(urlParams.get('ma_list_id'))];
        let paymentType = urlParams.get('paymentType') == null || urlParams.get('paymentType') == "undefined" ? [] : [Number(urlParams.get('paymentType'))];
        let gr_id = urlParams.get('gr_id') == null || urlParams.get('gr_id') == "gr_id" ? undefined : (isNaN(Number(urlParams.get('gr_id'))) ? -1 : Number(urlParams.get('gr_id')));
        if (ma_list_id != undefined || paymentType != undefined) {
            const start_date = startDate ? moment(startDate) : undefined;
            const end_date = endDate ? moment(endDate) : undefined;
            this.inputSearchUser = new SearchHistoryTransactionInput(paymentType, undefined, undefined, start_date, end_date, gr_id, ma_list_id, this.selectedField, this.state.sort);
            this.inputSearchAdmin = new SearchHistoryTransactionAdminInput(undefined, paymentType, undefined, undefined, start_date, end_date, gr_id, ma_list_id);
        }

        await this.getAll();
        await this.setState({ isLoadDone: true });
    }

    async getAll() {
        this.setState({ isLoadDone: false })

        isGranted(AppConsts.Permission.Pages_History_Admin_ChiTietGiaoDichTheoTungMay) ?
            await stores.historyStore.chiTietGiaoDichTheoTungMayAdmin(this.inputSearchAdmin.us_id, this.props.cash_payment ? 0 : this.inputSearchUser.payment_type, this.inputSearchAdmin.bi_status, this.inputSearchAdmin.bi_code, !!this.inputSearchAdmin.start_date ? moment(this.inputSearchAdmin.start_date).toDate() : undefined, !!this.inputSearchAdmin.end_date ? moment(this.inputSearchAdmin.end_date).toDate() : undefined, this.inputSearchAdmin.gr_ma_id, this.inputSearchAdmin.ma_id_list, this.selectedField, this.state.sort, this.state.skipCount, this.state.maxResultCount)
            :
            await stores.historyStore.chiTietGiaoDichTheoTungMay(this.props.cash_payment ? 0 : this.inputSearchUser.payment_type, this.inputSearchUser.bi_status, this.inputSearchUser.bi_code, !!this.inputSearchUser.start_date ? this.inputSearchUser.start_date : undefined, !!this.inputSearchUser.end_date ? this.inputSearchUser.end_date : undefined, this.inputSearchUser.gr_ma_id, this.inputSearchUser.ma_id_list, this.selectedField, this.state.sort, this.state.skipCount, this.state.maxResultCount)

        this.setState({ isLoadDone: true })
    }
    onSearchStatisticUser = (input: SearchHistoryTransactionInput) => {
        this.inputSearchUser = input;
        this.onChangePage(1, this.state.pageSize);
    }
    onSearchStatisticAdmin = (input: SearchHistoryTransactionAdminInput) => {
        this.inputSearchAdmin = input;
        this.onChangePage(1, this.state.pageSize);
    }
    onChangePage = async (page: number, pagesize?: number) => {
        if (pagesize !== undefined) {
            await this.setState({ pageSize: pagesize! });
        }
        await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page, maxResultCount: pagesize }, async () => {
            this.getAll();
        })
    }

    clearSearch = async () => {
        await this.setState({
            start_date: undefined,
            end_date: undefined,
            gr_ma_id: undefined,
            bi_code: undefined,
            us_id_list: [],
        })
        this.getAll();
    }
    actionTable = (machine: TransactionByMachineDto, event: EventTable) => {
        if (event == EventTable.View) {
            this.machineSelected.init(machine);
        }
    }
    changeColumnSort = async (sort: SorterResult<TransactionByMachineDto> | SorterResult<TransactionByMachineDto>[]) => {
        this.setState({ isLoadDone: false });
        this.selectedField = sort["field"];
        await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
        await this.getAll();
        this.setState({ isLoadDone: true });

    }
    render() {
        const self = this;
        const { listTransactionByMachineDto, total } = stores.historyStore
        const isDesktopScreen: React.CSSProperties = window.innerWidth > 768 ? { zIndex: 99, marginBottom: '8px', marginTop: '-50px' } : {}
        return (
            <Card>
                <Row gutter={[8, 8]} align='bottom'>
                    {this.props.cash_payment != true &&
                        <Col {...cssColResponsiveSpan(18, 16, 12, 12, 12, 12)}>
                            <h2>Chi tiết giao dịch theo từng máy</h2>
                        </Col>}
                    <Col span={24}>
                        {
                            isGranted(AppConsts.Permission.Pages_History_Admin_ChiTietGiaoDichTheoTungMay)
                                ?
                                <SearchHistoryTransactionInputAdmin cash_payment={this.props.cash_payment} onSearchStatistic={(input) => { this.onSearchStatisticAdmin(input) }} />
                                :
                                <SearchHistoryTransactionInputUser cash_payment={this.props.cash_payment} onSearchStatistic={(input) => { this.onSearchStatisticUser(input) }} />
                        }
                    </Col>
                    {isGranted(AppConsts.Permission.Pages_History_ChiTietGiaoDichTheoTungMay_Export) &&
                        <Col offset={12} span={12}
                            style={{
                                display: "flex",
                                justifyContent: "end",
                                ...isDesktopScreen,
                            }}>
                            <Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcel: true })}>Xuất dữ liệu</Button>
                        </Col>
                    }
                </Row>

                <Row>
                    <Col span={24}>
                        <TableTransactionDetail
                            changeColumnSort={this.changeColumnSort}
                            cash_payment={this.props.cash_payment}
                            is_printed={false}
                            listTransactionByMachine={listTransactionByMachineDto}
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
                <ModalExportTransactionAdmin
                    listTransactionDetailDto={listTransactionByMachineDto}
                    visible={this.state.visibleExportExcel}
                    onCancel={() => this.setState({ visibleExportExcel: false })}
                />
            </Card >
        )
    }
}