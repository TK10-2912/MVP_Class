import AppConsts, { cssColResponsiveSpan } from '@src/lib/appconst';
import { Button, Card, Col, Row } from 'antd';
import * as React from 'react';
import { stores } from '@src/stores/storeInitializer';
import { DailySaleMonitoringDto } from '@src/services/services_autogen';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import ModalExportSalesdetails from './components/ModalExportHistoryReport';
import { isGranted } from '@src/lib/abpUtility';
import TablePaymentOfSaleMonitoring from '@src/scenes/Monitor/DailySaleMonitoring/component/TablePaymentOfSaleMonitoring';
import TableSaleMonitoring from '@src/scenes/Monitor/DailySaleMonitoring/component/TableSaleMonitoring';
import SearchDailyMonitoringAdmin, { SearchDailySaleMonitoringInputAdmin } from '@src/components/Manager/SearchDailySaleMonitoringAdmin';
import SearchDailyMonitoringUser, { SearchDailySaleMonitoringInputUser } from '@src/components/Manager/SearchDailySaleMonitoringUser';
import { ExportOutlined } from '@ant-design/icons';
import moment from 'moment';

export default class Salesdetails extends AppComponentBase {
    componentRef: any | null = null;

    state = {
        isLoadDone: false,
        visibleExport: false,
        skipCount: 0,
        maxResultCount: 10,
        pageSize: 10,
        currentPage: 1,

    }
    inputSearchUser: SearchDailySaleMonitoringInputUser = new SearchDailySaleMonitoringInputUser(undefined, undefined, undefined, undefined);
    inputSearchAdmin: SearchDailySaleMonitoringInputAdmin = new SearchDailySaleMonitoringInputAdmin(undefined, undefined, undefined, undefined, undefined);
    dailySaleMonitoringDto: DailySaleMonitoringDto = new DailySaleMonitoringDto();
    dateTitle: string = "";
    today: Date = new Date();
    async componentDidMount() {
        isGranted(AppConsts.Permission.Pages_History_Admin_ChiTietBanHang) ? this.getAllAdmin() : this.getAllUser()
    }
    getAllAdmin = async () => {
        this.setState({ isLoadDone: false });
        this.dailySaleMonitoringDto = await stores.historyStore.chiTietBanHangAdmin(this.inputSearchAdmin.us_id, !!this.inputSearchAdmin.start_date ? moment(this.inputSearchAdmin.start_date).toDate() : undefined, !!this.inputSearchAdmin.end_date ? moment(this.inputSearchAdmin.end_date).toDate() : undefined, this.inputSearchAdmin.gr_ma_id, this.inputSearchAdmin.ma_id_list, undefined, undefined, undefined, undefined,)
        this.setState({ isLoadDone: true })
    };
    getAllUser = async () => {
        this.setState({ isLoadDone: false });
        this.dailySaleMonitoringDto = await stores.historyStore.chiTietBanHang(!!this.inputSearchUser.start_date ? moment(this.inputSearchUser.start_date).toDate() : undefined, !!this.inputSearchUser.end_date ? moment(this.inputSearchUser.end_date).toDate() : undefined, this.inputSearchUser.gr_ma_id, this.inputSearchUser.ma_id_list, undefined, undefined, undefined, undefined)
        this.setState({ isLoadDone: true })
    };

    onChangePage = async (page: number, pagesize?: number) => {
        if (pagesize === undefined || isNaN(pagesize)) {
            page = 1;
        }
        await this.setState({ pageSize: pagesize! });
        await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            isGranted(AppConsts.Permission.Pages_History_Admin_ChiTietBanHang) ?
                this.getAllAdmin() : this.getAllUser();
        });
    }
    onSearchStatisticAdmin = (input: SearchDailySaleMonitoringInputAdmin) => {
        this.inputSearchAdmin = input;
        this.onChangePage(1, this.state.pageSize);
    }
    onSearchStatisticUser = (input: SearchDailySaleMonitoringInputUser) => {
        this.inputSearchUser = input;
        this.onChangePage(1, this.state.pageSize);
    }
    setComponentRef = (ref) => {
        this.setState({ isLoadDone: false });
        this.componentRef = ref;
        this.setState({ isLoadDone: true });
    }
    render() {
        let self = this;
        return (
            <Card>
                <Row gutter={[8, 8]} align='middle'>
                    <Col {...cssColResponsiveSpan(19, 16, 12, 12, 12, 12)}>
                        <h2>Lịch sử chi tiết bán hàng</h2>
                    </Col>
                    {isGranted(AppConsts.Permission.Pages_History_ChiTietBanHang_Export) &&
                        <Col {...cssColResponsiveSpan(5, 8, 12, 12, 12, 12)} style={{ textAlign: 'end' }}>
                            <Button icon={<ExportOutlined />} onClick={() => this.setState({ visibleExport: true })} type='primary' >{(window.innerWidth > 575) && 'Xuất dữ liệu'}</Button>
                        </Col>
                    }
                    {isGranted(AppConsts.Permission.Pages_History_Admin_ChiTietBanHang) ?
                        <Col span={24}>
                            <SearchDailyMonitoringAdmin onSearchStatistic={(input) => { this.onSearchStatisticAdmin(input) }} />
                        </Col>
                        :
                        <Col span={24}>
                            <SearchDailyMonitoringUser onSearchStatistic={(input) => { this.onSearchStatisticUser(input) }} />
                        </Col>
                    }
                </Row>

                <div style={{ marginTop: 10 }}>
                    <Row>
                        <Col span={24}><h2 style={{ textAlign: "center" }}>Hình thức thanh toán</h2></Col>
                        <Col span={24}>
                            <TablePaymentOfSaleMonitoring
                                end_date={isGranted(AppConsts.Permission.Pages_History_Admin_ChiTietBanHang) ? this.inputSearchAdmin.end_date : this.inputSearchUser.end_date}
                                start_date={isGranted(AppConsts.Permission.Pages_History_Admin_ChiTietBanHang) ? this.inputSearchAdmin.start_date : this.inputSearchUser.start_date}
                                dailySaleMonitoringDto={this.dailySaleMonitoringDto}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}> <h2 style={{ marginTop: '10px', textAlign: "center" }}>Máy bán nước</h2></Col>
                        <Col span={24}>
                            <TableSaleMonitoring
                                billingOfMachine={this.dailySaleMonitoringDto.listBillingOfMachine}
                                is_printed={false}
                                end_date={isGranted(AppConsts.Permission.Pages_History_Admin_ChiTietBanHang) ? this.inputSearchAdmin.end_date : this.inputSearchUser.end_date}
                                start_date={isGranted(AppConsts.Permission.Pages_History_Admin_ChiTietBanHang) ? this.inputSearchAdmin.start_date : this.inputSearchUser.start_date}
                                pagination={{
                                    pageSize: this.state.pageSize,
                                    total: !!this.dailySaleMonitoringDto.listBillingOfMachine ? this.dailySaleMonitoringDto.listBillingOfMachine.length : 0,
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
                    {this.state.visibleExport &&
                        <ModalExportSalesdetails visible={this.state.visibleExport} dailySaleMonitoringDto={this.dailySaleMonitoringDto} onCancel={() => this.setState({ visibleExport: false })} />}
                </div>
            </Card >
        )

    }
}