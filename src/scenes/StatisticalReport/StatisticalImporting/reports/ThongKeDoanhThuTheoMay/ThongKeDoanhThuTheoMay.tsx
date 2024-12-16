import * as React from 'react';
import ActionExport from "@src/components/ActionExport";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { Button, Card, Col, Modal, Row, Table, message } from "antd";
import { stores } from '@src/stores/storeInitializer';
import { L } from '@lib/abpUtility';
import AppConsts, { EventTable, cssColResponsiveSpan } from '@src/lib/appconst';
import { MachineDto, StatisticBillingOfMachineDto } from '@src/services/services_autogen';
import StatisticSearch from '@src/components/Manager/StatisticSearch';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import { BarChartOutlined } from '@ant-design/icons';
import BarchartReport, { DataBarchart } from '../../Chart/BarchartReport';
import { SearchInputUser } from '@src/stores/statisticStore';
import HistoryHelper from '@src/lib/historyHelper';

export default class ThongKeDoanhThuTheoMayUser extends AppComponentBase {
    componentRef: any | null = null;

    state = {
        isLoadDone: true,
        skipCount: 0,
        currentPage: 1,
        pageSize: 10,
        visibleBarchart: false,
        noScroll: false,
        noScrollReport: false,
        datePick: '',
    };
    machineSelected: MachineDto;
    inputSearch: SearchInputUser = new SearchInputUser(undefined, undefined, undefined, undefined, undefined, undefined);

    async componentDidMount() {
        const query = new URLSearchParams(window.location.search);
        await this.setState({ datePick: query.get('date') });
        if (!!this.state.datePick) {
            if (this.state.datePick === 'yesterday') {
                this.inputSearch.start_date = moment().startOf('day').subtract(1, 'day').toDate();
                this.inputSearch.end_date = moment().endOf('day').subtract(1, 'day').toDate();
            }
            else if (this.state.datePick === "week") {
                this.inputSearch.start_date = moment().startOf('week').add(1, 'day').toDate();
                this.inputSearch.end_date = moment().endOf('week').add(1, 'day').toDate();
            }
            else {
                this.inputSearch.start_date = moment().startOf(this.state.datePick as any).toDate();
                this.inputSearch.end_date = moment().endOf(this.state.datePick as any).toDate();
            }
            this.onSearch(this.inputSearch);
        }
    }

    getAll = async () => {
        this.setState({ isLoadDone: false });
        await stores.statisticStore.statisticBillingOfMachine(this.inputSearch);
        this.setState({ isLoadDone: true })
    };
    onChangePage = async (page: number, pagesize?: number) => {
        if (pagesize === undefined || isNaN(pagesize)) {
            page = 1;
        }
        await this.setState({ pageSize: pagesize! });
        await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            this.getAll();
        });
    }
    onSearch = (inputSearch: SearchInputUser) => {
        this.inputSearch = inputSearch;
        this.onChangePage(1, this.state.pageSize)
    }
    setComponentRef = (ref) => {
        this.setState({ isLoadDone: false });
        this.componentRef = ref;
        this.setState({ isLoadDone: true });
    }
    visibleBarchartReport = () => {
        const { billingStatisticListResult } = stores.statisticStore

        if (billingStatisticListResult.length > 0) {
            this.setState({ visibleBarchart: true });
        }
        else
            message.info("Không có dữ liệu");
    }
    actionTable = (machine: StatisticBillingOfMachineDto, event: EventTable) => {
        if (event == EventTable.View) {
            this.machineSelected.init(machine);
        }
    }
    formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    render() {
        const { billingStatisticListResult } = stores.statisticStore;
        const self = this;
        const columns: ColumnsType<StatisticBillingOfMachineDto> = [
            { title: "STT", className: "start", width: 50, key: "stt", render: (text: string, item: StatisticBillingOfMachineDto, index: number) => <div>{this.state.pageSize! * (this.state.currentPage! - 1) + (index + 1)}</div> },
            {
                title: "Tên nhóm", width: 150, key: "groupMachine", sorter: (a, b) => a.groupMachineName!.localeCompare(b.groupMachineName!), render: (text: string, item: StatisticBillingOfMachineDto) => <div>
                    {stores.sessionStore.getNameGroupMachinesStatistic(item.groupMachineName)}
                </div>
            },
            {
                title: "Mã máy", width: 150, key: "machineCode", sorter: (a, b) => a.machineCode!.localeCompare(b.machineCode!), render: (text: string, item: StatisticBillingOfMachineDto) => <div>
                    {item.machineCode}
                </div>
            },
            {
                title: "Tên máy", width: 150, key: "nameMachine", sorter: (a, b) => a.nameMachine!.localeCompare(b.nameMachine!), render: (text: string, item: StatisticBillingOfMachineDto) => <div>
                    {item.nameMachine}
                </div>
            },
            { title: "Người sở hữu", width: 150, key: "machineName", render: (text: string, item: StatisticBillingOfMachineDto) => <div>{stores.sessionStore.getUserNameById(item.us_id_owner)}</div> },
            {
                title: "Sản phẩm", key: "nameMachine",
                children: [
                    { title: "Có bao bì", width: 120, sorter: (a, b) => a.quantityDrink - b.quantityDrink, key: "pr_name", render: (text: string, item: StatisticBillingOfMachineDto) => <div>{AppConsts.formatNumber(item.quantityDrink)}</div> },
                    { title: "Không bao bì (ml)", width: 120, sorter: (a, b) => a.quantityFreshDrink - b.quantityFreshDrink, key: "pr_name", render: (text: string, item: StatisticBillingOfMachineDto) => <div>{AppConsts.formatNumber(item.quantityFreshDrink)}</div> },
                ]
            },
            {
                title: "Loại hình thanh toán", key: "loai_hinh_thanh_toan", children: [
                    { title: "Tiền mặt", width: 120, sorter: (a, b) => a.cash - b.cash, key: "money_cash", render: (text: string, item: StatisticBillingOfMachineDto) => <div>{AppConsts.formatNumber(item.cash)}</div> },
                    { title: "Số lượng", width: 120, sorter: (a, b) => a.cash_count - b.cash_count, key: "money_cash_number", render: (text: string, item: StatisticBillingOfMachineDto) => <div>{AppConsts.formatNumber(item.cash_count)}</div> },
                    { title: "Mã QR", width: 120, sorter: (a, b) => a.moneyTransaction - b.moneyTransaction, key: "moneyTransaction", render: (text: string, item: StatisticBillingOfMachineDto) => <div>{AppConsts.formatNumber(item.moneyTransaction)}</div> },
                    { title: "Số lượng", width: 120, sorter: (a, b) => a.transaction_count - b.transaction_count, key: "transaction_count", render: (text: string, item: StatisticBillingOfMachineDto) => <div>{AppConsts.formatNumber(item.transaction_count)}</div> },
                    { title: "RFID", width: 120, sorter: (a, b) => a.moneyRFID - b.moneyRFID, key: "money_rfid", render: (text: string, item: StatisticBillingOfMachineDto) => <div>{AppConsts.formatNumber(item.moneyRFID)}</div> },
                    { title: "Số lượng", width: 120, sorter: (a, b) => a.rfid_count - b.rfid_count, key: "rfid_count", render: (text: string, item: StatisticBillingOfMachineDto) => <div>{AppConsts.formatNumber(item.rfid_count)}</div> },
                ]
            },
            { title: "Tổng số lượng đơn", width: 120, key: "total_number", sorter: (a, b) => a.totalQuantity - b.totalQuantity, render: (text: string, item: StatisticBillingOfMachineDto) => <div>{AppConsts.formatNumber(item.totalQuantity)}</div> },
            { title: "Tổng doanh thu (VNĐ)", width: 120, key: "total", sorter: (a, b) => a.totalMoney - b.totalMoney, render: (text: string, item: StatisticBillingOfMachineDto) => <div>{AppConsts.formatNumber(item.totalMoney)}</div> },
        ];
        return (
            <Card >
                <Row>
                    <Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 24)}>
                        <StatisticSearch
                            onSearchStatistic={async (input) => await this.onSearch(input)}
                            defaultStartDate={this.inputSearch.start_date}
                            defaultEndDate={this.inputSearch.end_date}
                        />
                    </Col>
                    {this.isGranted(AppConsts.Permission.Pages_Statistic_BillingOfMachine_Export) &&
                        <Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 24)} style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "end" }}>
                            <Button type='primary' icon={<BarChartOutlined />} onClick={() => this.visibleBarchartReport()}>{(window.innerWidth >= 768) && 'Biểu đồ'}</Button>
                            <ActionExport
                                isScrollReport={async () => await this.setState({ noScrollReport: false })}
                                noScrollReport={async () => await this.setState({ noScrollReport: true })}
                                isWord={true}
                                isExcel={true}
                                idPrint={"thongkedoanhthutheomay"}
                                nameFileExport={"thongkedoanhthutheomay" + ' ' + moment().format('DD_MM_YYYY')}
                                componentRef={this.componentRef}
                            />
                        </Col>
                    }
                </Row>
                <div id='thongkedoanhthutheomay' ref={this.setComponentRef}>
                    <h2 style={{ textAlign: 'center', paddingTop: '10px' }}>
                        {"THỐNG KÊ DOANH THU THEO MÁY "}
                        {!this.inputSearch.start_date && !this.inputSearch.end_date ? "" :
                            (moment(this.inputSearch.start_date).format('DD/MM/YYYY') === moment(this.inputSearch.end_date).subtract(7, "hour").format('DD/MM/YYYY')
                                ? `TRONG NGÀY ${moment(this.inputSearch.start_date).format('DD/MM/YYYY')}`
                                : `TỪ NGÀY ${moment(this.inputSearch.start_date).format('DD/MM/YYYY')} ĐẾN NGÀY ${moment(this.inputSearch.end_date).subtract(7, "hour").format('DD/MM/YYYY')}`
                            )
                        }
                    </h2>
                    <Table
                        onRow={(record, rowIndex) => {
                            return {
                                onClick: () => {
                                    const { start_date, end_date, } = this.inputSearch;
                                    const machineId = Number(stores.sessionStore.getIdMachine(record.machineCode!));
                                    const groupId = stores.sessionStore.getIdGroupUseName(record.groupMachineName!);
                                    const url = `/history/transaction_detail?startDate=${start_date}&endDate=${end_date}&gr_id=${groupId}&ma_list_id=${machineId}`;
                                    HistoryHelper.redirect(url);
                                }
                            };
                        }}
                        className="centerTable"
                        loading={!this.state.isLoadDone}
                        locale={{ "emptyText": L('Không có dữ liệu') }}
                        size={'small'}
                        bordered={true}
                        dataSource={billingStatisticListResult != undefined ? billingStatisticListResult.slice(0, -1) : []}
                        columns={columns}
                        scroll={this.state.noScrollReport ? { x: undefined } : { x: 1000 }}
                        pagination={this.state.noScrollReport ? false : {
                            className: "ant-table-pagination ant-table-pagination-right no-print noprintExcel ",
                            pageSize: this.state.pageSize,
                            total: billingStatisticListResult.length - 1,
                            current: this.state.currentPage,
                            showTotal: (tot) => "Tổng: " + tot + "",
                            showQuickJumper: true,
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '20', '50', '100', L('All')],
                            onShowSizeChange(current: number, size: number) {
                                self.onChangePage(current, size)
                            },
                            onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
                        }}
                        summary={
                            billingStatisticListResult.length > 0 ? () => (
                                <>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0} colSpan={4}>
                                            <div style={{ display: "flex", justifyContent: "left" }}>
                                                <b> Tổng số lượng đơn hàng: {billingStatisticListResult && billingStatisticListResult.length > 0 ? AppConsts.formatNumber(billingStatisticListResult[billingStatisticListResult.length - 1].totalQuantity) + " đơn" : 0}</b>
                                            </div>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={1} colSpan={4} >
                                            <div style={{ display: "flex", justifyContent: "left" }}>
                                                <b> Tổng sản phẩm có bao bì: {billingStatisticListResult && billingStatisticListResult.length > 0 ? AppConsts.formatNumber(billingStatisticListResult[billingStatisticListResult.length - 1].quantityDrink) + " sản phẩm" : 0}</b>
                                            </div>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={2} colSpan={16}>
                                            <div style={{ display: "flex", justifyContent: "left" }}>
                                                <b>Tổng dung tích không có bao bì: {billingStatisticListResult && billingStatisticListResult.length > 0 ? AppConsts.formatNumber(billingStatisticListResult[billingStatisticListResult.length - 1].quantityFreshDrink) + " ml" : 0}</b>
                                            </div>
                                        </Table.Summary.Cell>

                                    </Table.Summary.Row>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={3} colSpan={4}>
                                            <div style={{ display: "flex", justifyContent: "left" }}>
                                                <b>Tổng đơn hàng thanh toán bằng tiền mặt: {billingStatisticListResult && billingStatisticListResult.length > 0 ? AppConsts.formatNumber(billingStatisticListResult[billingStatisticListResult.length - 1].cash_count) + " đơn" : 0}</b>
                                            </div>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={4} colSpan={4}>
                                            <div style={{ display: "flex", justifyContent: "left" }}>
                                                <b>Tổng đơn hàng thanh toán bằng QR: {billingStatisticListResult && billingStatisticListResult.length > 0 ? AppConsts.formatNumber(billingStatisticListResult[billingStatisticListResult.length - 1].transaction_count) + " đơn" : 0}</b>
                                            </div>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={5} colSpan={16}>
                                            <div style={{ display: "flex", justifyContent: "left" }}>
                                                <b>Tổng đơn hàng thanh toán bằng RFID: {billingStatisticListResult && billingStatisticListResult.length > 0 ? AppConsts.formatNumber(billingStatisticListResult[billingStatisticListResult.length - 1].rfid_count) + " đơn" : 0}</b>
                                            </div>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={6} colSpan={4}>
                                            <div style={{ display: "flex", justifyContent: "left" }}>
                                                <b>Tổng tiền mặt: {billingStatisticListResult && billingStatisticListResult.length > 0 ? AppConsts.formatNumber(billingStatisticListResult[billingStatisticListResult.length - 1].cash) : 0} VND</b>
                                            </div>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={7} colSpan={4}>
                                            <div style={{ display: "flex", justifyContent: "left" }}>
                                                <b>Tổng tiền QR: {billingStatisticListResult && billingStatisticListResult.length > 0 ? AppConsts.formatNumber(billingStatisticListResult[billingStatisticListResult.length - 1].moneyTransaction) : 0} VND</b>
                                            </div>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={8} colSpan={16}>
                                            <div style={{ display: "flex", justifyContent: "left" }}>
                                                <b>Tổng tiền RFID: {billingStatisticListResult && billingStatisticListResult.length > 0 ? AppConsts.formatNumber(billingStatisticListResult[billingStatisticListResult.length - 1].moneyRFID) : 0} VND</b>
                                            </div>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={9} colSpan={24}>
                                            <div style={{ display: "flex", justifyContent: "center" }}>
                                                <b> Tổng doanh thu: {billingStatisticListResult && billingStatisticListResult.length > 0 ? AppConsts.formatNumber(billingStatisticListResult[billingStatisticListResult.length - 1].totalMoney) : 0} VND</b>
                                            </div>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                </>
                            ) : undefined}
                    />
                </div>
                {this.state.visibleBarchart &&
                    <Modal
                        visible={this.state.visibleBarchart}
                        onCancel={() => { this.setState({ visibleBarchart: false }) }}
                        footer={null}
                        width='77vw'
                        closable={true}
                        title="Thống kê doanh thu theo máy"
                    >
                        <BarchartReport
                            data={billingStatisticListResult?.slice(0, -1).map(item => new DataBarchart(item.nameMachine, item.cash, item.moneyTransaction, item.moneyRFID, item.cash_count, item.transaction_count, item.rfid_count))}
                            label1='VNĐ'
                            label2='Số lượng đơn hàng'
                            nameColumg1_1='Tiền mặt'
                            nameColumg1_2='Mã QR'
                            nameColumg1_3='Thẻ RFID'
                            nameColumg2_1='SLHD thanh toán theo tiền mặt'
                            nameColumg2_2='SLHD thanh toán theo mã QR'
                            nameColumg2_3='SLHD thanh toán theo thẻ RFID'
                        />
                    </Modal>
                }
            </Card>
        )
    }
}