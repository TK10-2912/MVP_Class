import * as React from 'react';
import ActionExport from "@src/components/ActionExport";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { Button, Card, Col, Modal, Row, Table, message } from "antd";
import { stores } from '@src/stores/storeInitializer';
import AppConsts, { EventTable, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import { MachineDto, StatisticBillingOfMachineDto } from '@src/services/services_autogen';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import { BarChartOutlined, EyeFilled } from '@ant-design/icons';
import BarchartReport, { DataBarchart } from '../../Chart/BarchartReport';
import StatisticSearchByAdmin from '@src/components/Manager/StatisticSearchByAdmin';
import { Link } from 'react-router-dom';
import { SearchInputAdmin } from '@src/stores/statisticStore';
import TableTransactionDetail from '@src/scenes/HistoryMVP/LichSuChiTietGiaoDichTungMay/component/TableTransactionDetail';
import SearchHistoryTransaction, { SearchHistoryTransactionInput } from '@src/components/Manager/SearchHistoryTransactionInput';
export interface IProps {
    ma_id?: number;
    ma_lo_log_from?:Date;
    ma_lo_log_to?:Date;
}
export interface SearchHistoryTransactionInputRef {
    onClearSearch?: () => void;
  }

type TTotal = {
    totalQuantity: number,
    quantityDrink: number,
    quantityFreshDrink: number,
    cash_count: number,
    transaction_count: number,
    rfid_count: number,
    cash: number,
    moneyTransaction: number,
    moneyRFID: number,
    promo_count: number,
    moneyPromo: number,
    totalMoney: number,
}

export default class ThongKeDoanhThuTheoMayAdmin extends AppComponentBase<IProps> {
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
        type: "",
        visibleModalTransactionDetail: false,
        ma_id_list: undefined,
        skipCountHistory: 0,
        currentPageHistory: 1,
        pageSizeHistory: 10,
    };
    machineSelected: MachineDto;
    inputSearch: SearchInputAdmin = new SearchInputAdmin(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    inputSearchHistory: SearchHistoryTransactionInput = new SearchHistoryTransactionInput(undefined, undefined, undefined, undefined, undefined);
    totalFooter: TTotal = {
        totalQuantity: 0,
        quantityDrink: 0,
        quantityFreshDrink: 0,
        cash_count: 0,
        transaction_count: 0,
        rfid_count: 0,
        cash: 0,
        moneyTransaction: 0,
        moneyRFID: 0,
        promo_count: 0,
        moneyPromo: 0,
        totalMoney: 0,
    };
    private childRef = React.createRef<SearchHistoryTransaction>();
    async componentDidMount() {
        const query = new URLSearchParams(window.location.search);
        await this.setState({ datePick: query.get('date') });
        if (!!this.state.datePick) {
            if (this.state.datePick === 'yesterday') {
                this.inputSearch.start_date = moment().startOf('day').subtract(1, 'day').toDate();
                this.inputSearch.end_date = moment().endOf('day').subtract(1, 'day').toDate();
            } else if (this.state.datePick === "week") {
                this.inputSearch.start_date = moment().startOf('week').add(1, 'day').toDate();
                this.inputSearch.end_date = moment().endOf('week').add(1, 'day').toDate();
            }
            else if (this.state.datePick === "lastMonth") {
                this.inputSearch.start_date = moment().startOf('month').subtract(1, 'month').toDate();
                this.inputSearch.end_date = moment().endOf('month').subtract(1, 'month').toDate();
            }
            else {
                this.inputSearch.start_date = moment().startOf(this.state.datePick as any).toDate();
                this.inputSearch.end_date = moment().endOf(this.state.datePick as any).toDate();
            }

            this.onSearch(this.inputSearch, this.state.type);
        }
        if (!!this.props.ma_id) {
            this.inputSearch.ma_id_list = [this.props.ma_id];
            this.getAll();
        }
    }

    getAll = async () => {
        await stores.statisticStore.statisticBillingOfMachinebyAdmin(this.inputSearch);
        this.setState({ isLoadDone: !this.state.isLoadDone });
    };
    getAllBill = async () => {
        await stores.historyStore.chiTietGiaoDichTheoTungMayAdmin(undefined, this.inputSearchHistory.payment_type, this.inputSearchHistory.bi_status, this.inputSearchHistory.bi_code, this.inputSearchHistory.start_date, this.inputSearchHistory.end_date, undefined, this.state.ma_id_list, undefined, undefined, this.state.skipCountHistory, this.state.pageSizeHistory)
        this.setState({ isLoadDone: !this.state.isLoadDone });
    };
    onChangePage = async (page: number, pagesize?: number) => {
        if (pagesize === undefined || isNaN(pagesize)) {
            page = 1;
        }
        await this.setState({ pageSize: pagesize! });
        await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            this.inputSearch.skipCount = this.state.skipCount;
            this.inputSearch.maxResult = this.state.pageSize;
            await this.getAll();
            this.caculatorTotal();
        });
    }
    onChangePageHistory = async (page: number, pagesize?: number) => {
        if (pagesize === undefined || isNaN(pagesize)) {
            page = 1;
        }
        await this.setState({ pageSizeHistory: pagesize! });
        await this.setState({ skipCountHistory: (page - 1) * this.state.pageSize, currentPageHistory: page }, async () => {
            await this.getAllBill();
        });
    }
    onSearch = (inputSearch: SearchInputAdmin, type: String) => {
        this.setState({ type: type });
        this.inputSearch = inputSearch;
        this.onChangePage(1, this.state.pageSize);
    }
    setComponentRef = (ref) => {
        this.componentRef = ref;
        this.setState({ isLoadDone: !this.state.isLoadDone });
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
        if (event === EventTable.View) {
            this.machineSelected.init(machine);
        }
    }
    onViewModal = async (item: StatisticBillingOfMachineDto) => {
        await this.setState({ ma_id_list: [stores.sessionStore.getIdMachine(item.machineCode!)] });
        await this.getAllBill();
        this.setState({ visibleModalTransactionDetail: true });
    }
    onSearchHistory = async (inputSearch: SearchHistoryTransactionInput) => {
        this.inputSearchHistory = inputSearch;
        await this.getAllBill();
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }

    handleCloseModal=()=>{
        if (this.childRef.current) {
            this.childRef.current.onClearSearch();
          }
    }

    caculatorTotal = () => {
        const { billingStatisticListResult } = stores.statisticStore;
        this.totalFooter = {
            totalQuantity: 0,
            quantityDrink: 0,
            quantityFreshDrink: 0,
            cash_count: 0,
            transaction_count: 0,
            rfid_count: 0,
            cash: 0,
            moneyTransaction: 0,
            moneyRFID: 0,
            promo_count: 0,
            moneyPromo: 0,
            totalMoney: 0,
        };
        for (let i = 0; i < billingStatisticListResult.length; i++) {
            this.totalFooter.totalQuantity += billingStatisticListResult[i].totalQuantity;
            this.totalFooter.quantityDrink += billingStatisticListResult[i].quantityDrink;
            this.totalFooter.quantityFreshDrink += billingStatisticListResult[i].quantityFreshDrink * 100;
            this.totalFooter.cash_count += billingStatisticListResult[i].cash_count;
            this.totalFooter.transaction_count += billingStatisticListResult[i].transaction_count;
            this.totalFooter.rfid_count += billingStatisticListResult[i].rfid_count;
            this.totalFooter.cash += billingStatisticListResult[i].cash;
            this.totalFooter.moneyTransaction += billingStatisticListResult[i].moneyTransaction;
            this.totalFooter.moneyRFID += billingStatisticListResult[i].moneyRFID;
            this.totalFooter.promo_count += billingStatisticListResult[i].promo_count;
            this.totalFooter.moneyPromo += billingStatisticListResult[i].moneyPromo;
            this.totalFooter.totalMoney += billingStatisticListResult[i].totalMoney;
        }
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }
    render() {
        const { billingStatisticListResult, totalBillingStatistic } = stores.statisticStore
        const { listTransactionByMachineDto, totalLog } = stores.historyStore;

        const self = this;
        let action: any =
        {
            title: "Chức năng", width: 70, key: "action_machine_report_index", className: "no-print", dataIndex: '',
            render: (_: string, item: StatisticBillingOfMachineDto) => (
                <Button
                    type="primary" icon={<EyeFilled />} title={"Xem chi tiết"}
                    size='small'
                    onClick={(e) => { this.onViewModal(item); e.stopPropagation() }}
                ></Button>
            )
        }
        const columns: ColumnsType<StatisticBillingOfMachineDto> = [
            { title: "STT", className: "start", key: "stt", width: 50, render: (_: string, item: StatisticBillingOfMachineDto, index: number) => <div>{this.state.pageSize! * (this.state.currentPage! - 1) + (index + 1)}</div> },
            {
                title: <b>Tổng</b>, key: "total", children: [
                    { title: "Số lượng đơn", width: 100, key: "total_number", sorter: (a, b) => a.totalQuantity - b.totalQuantity, render: (_: string, item: StatisticBillingOfMachineDto) => <div><b>{AppConsts.formatNumber(item.totalQuantity)}</b></div> },
                    { title: "Doanh thu (VNĐ)", width: 100, key: "total", sorter: (a, b) => a.totalMoney - b.totalMoney, render: (_: string, item: StatisticBillingOfMachineDto) => <div><b>{AppConsts.formatNumber(item.totalMoney)}</b></div> },
                ]
            },
            {
                title: "Nhóm máy", width: 120, key: "groupMachine",
                render: (_: string, item: StatisticBillingOfMachineDto) => <div>
                    {this.state.noScrollReport ?
                        <div title={`Chi tiết nhóm máy ${item.groupMachineName || ""}`}>
                            {item.groupMachineName || ""}
                        </div>
                        :
                        <Link title="Chi tiết nhóm máy" target='_blank' to={"/general/machine/?gr_id=" + stores.sessionStore.getIDGroupUseName(item.groupMachineName!)}>
                            {item.groupMachineName || ""}
                        </Link>
                    }
                </div>
            },
            {
                title: "Máy bán nước", width: 150, key: "nameMachine",
                render: (_: string, item: StatisticBillingOfMachineDto) => <div>
                    {this.state.noScrollReport == false ?

                        <div title={item.nameMachine} style={{
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical"
                        }} >
                            <Link target='_blank' to={"/general/machine/?machine=" + item.machineCode}>
                                <div>
                                    <div>{item.machineCode}</div>
                                    <div style={{ color: "gray", fontSize: 11 }}>{item.nameMachine}</div>
                                </div>
                            </Link>
                        </div>
                        :
                        <div>
                            <div>{item.machineCode}</div>
                            <div style={{ color: "gray", fontSize: 11 }}>{item.nameMachine}</div>
                        </div>
                    }
                </div>
            },
            {
                title: "Sản phẩm", key: "nameMachine",
                children: [
                    { title: "Có bao bì", width: 120, sorter: (a, b) => a.quantityDrink - b.quantityDrink, key: "pr_name", render: (_: string, item: StatisticBillingOfMachineDto) => <div>{AppConsts.formatNumber(item.quantityDrink)}</div> },
                    { title: "Không bao bì (ml)", width: 120, sorter: (a, b) => a.quantityFreshDrink - b.quantityFreshDrink, key: "pr_name", render: (_: string, item: StatisticBillingOfMachineDto) => <div>{AppConsts.formatNumber(item.quantityFreshDrink * 100)}</div> },
                ]
            },
            {
                title: "Loại hình thanh toán", key: "loai_hinh_thanh_toan", children: [
                    { title: "Tiền mặt", width: 120, sorter: (a, b) => a.cash - b.cash, key: "money_cash", render: (_: string, item: StatisticBillingOfMachineDto) => <div>{AppConsts.formatNumber(item.cash)}</div> },
                    { title: "Số lượng", width: 65, sorter: (a, b) => a.cash_count - b.cash_count, key: "money_cash_number", render: (_: string, item: StatisticBillingOfMachineDto) => <div>{AppConsts.formatNumber(item.cash_count)}</div> },
                    { title: "Ngân hàng", width: 120, sorter: (a, b) => a.moneyTransaction - b.moneyTransaction, key: "moneyTransaction", render: (_: string, item: StatisticBillingOfMachineDto) => <div>{AppConsts.formatNumber(item.moneyTransaction)}</div> },
                    { title: "Số lượng", width: 65, sorter: (a, b) => a.transaction_count - b.transaction_count, key: "transaction_count", render: (_: string, item: StatisticBillingOfMachineDto) => <div>{AppConsts.formatNumber(item.transaction_count)}</div> },
                    { title: "RFID", width: 120, sorter: (a, b) => a.moneyRFID - b.moneyRFID, key: "money_rfid", render: (_: string, item: StatisticBillingOfMachineDto) => <div>{AppConsts.formatNumber(item.moneyRFID)}</div> },
                    { title: "Số lượng", width: 65, sorter: (a, b) => a.rfid_count - b.rfid_count, key: "rfid_count", render: (_: string, item: StatisticBillingOfMachineDto) => <div>{AppConsts.formatNumber(item.rfid_count)}</div> },
                    { title: "Khuyến mãi", width: 120, sorter: (a, b) => a.moneyPromo - b.moneyPromo, key: "moneyPromo", render: (_: string, item: StatisticBillingOfMachineDto) => <div>{AppConsts.formatNumber(item.moneyPromo)}</div> },
                    { title: "Số lượng", width: 65, sorter: (a, b) => a.promo_count - b.promo_count, key: "promo_count", render: (_: string, item: StatisticBillingOfMachineDto) => <div>{AppConsts.formatNumber(item.promo_count)}</div> },
                ]
            },
        ];
        if (!this.state.noScrollReport && this.props.ma_lo_log_from == undefined && this.props.ma_lo_log_to == undefined) {
            columns.unshift(action);
        }
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

        return (
            <Card>
                <Row>
                    <Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 24)}>
                        <StatisticSearchByAdmin
                            ma_id={this.props.ma_id}
                            onSearchStatistic={async (input, type) => await this.onSearch(input, type)}
                            defaultStartDate={this.inputSearch.start_date}
                            defaultEndDate={this.inputSearch.end_date}
                            ma_lo_log_from={this.props.ma_lo_log_from}
                            ma_lo_log_to={this.props.ma_lo_log_to} 
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
                                idFooter='ThongKeDoanhThuTheoMayAdmin'
                            />
                        </Col>
                    }
                </Row>
                <div id='thongkedoanhthutheomay' ref={this.setComponentRef}>
                    <h2 style={{ textAlign: 'center', paddingTop: '10px', fontWeight: 'bold' }}>
                        {!!this.props.ma_id ? "THỐNG KÊ DOANH THU THEO MÁY " + stores.sessionStore.getNameMachines(this.props.ma_id) : "THỐNG KÊ DOANH THU THEO MÁY "}
                        {dateRangeText}
                    </h2>
                    <Table
                        className="centerTable"
                        size={'small'}
                        bordered={true}
                        dataSource={billingStatisticListResult}
                        columns={columns}
                        
                        scroll={this.state.noScrollReport ? { x: undefined } : { x: 1800, y: 600 }}
                        pagination={this.state.noScrollReport ? false : {
                            className: "ant-table-pagination ant-table-pagination-right no-print noprintExcel ",
                            position: ['topRight'],
                            pageSize: this.state.pageSize,
                            total: totalBillingStatistic,
                            current: this.state.currentPage,
                            showTotal: (tot) => "Tổng: " + tot + "",
                            showQuickJumper: true,
                            showSizeChanger: true,
                            pageSizeOptions: pageSizeOptions,
                            onShowSizeChange(current: number, size: number) {
                                self.onChangePage(current, size)
                            },
                            onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
                        }}
                        footer={
                            () =>
                                <>
                                    <Row id='ThongKeDoanhThuTheoMayAdmin'>
                                        <Col style={{ border: "1px solid #e4e1e1", padding: 10 }} span={8}>
                                            <span>Tổng số lượng đơn hàng: <strong style={{ color: '#1DA57A' }}> {AppConsts.formatNumber(this.totalFooter.totalQuantity) + " đơn"}</strong></span><br />
                                            <span>Tổng doanh thu: <strong style={{ color: '#1DA57A' }}>{AppConsts.formatNumber(this.totalFooter.totalMoney)} VND</strong></span><br />
                                            <span>Tổng sản phẩm có bao bì: <strong style={{ color: '#1DA57A' }}> {AppConsts.formatNumber(this.totalFooter.quantityDrink) + " sản phẩm"}</strong></span><br />
                                            <span>Tổng dung tích không có bao bì: <strong style={{ color: '#1DA57A' }}> {AppConsts.formatNumber(this.totalFooter.quantityFreshDrink) + " ml"}</strong></span><br />
                                        </Col>
                                        <Col style={{ border: "1px solid #e4e1e1", padding: 10 }} span={8}>
                                            <span>Tổng đơn hàng thanh toán bằng tiền mặt: <strong style={{ color: '#1DA57A' }}> {AppConsts.formatNumber(this.totalFooter.cash_count) + " đơn"}</strong></span><br />
                                            <span>Tổng đơn hàng thanh toán bằng Ngân hàng: <strong style={{ color: '#1DA57A' }}> {AppConsts.formatNumber(this.totalFooter.transaction_count) + " đơn"}</strong></span><br />
                                            <span>Tổng đơn hàng thanh toán bằng RFID: <strong style={{ color: '#1DA57A' }}> {AppConsts.formatNumber(this.totalFooter.rfid_count) + " đơn"}</strong></span><br />
                                            <span>Tổng đơn hàng thanh toán bằng Khuyến mãi: <strong style={{ color: '#1DA57A' }}> {AppConsts.formatNumber(this.totalFooter.promo_count) + " đơn"}</strong></span><br />
                                        </Col>
                                        <Col style={{ border: "1px solid #e4e1e1", padding: 10 }} span={8}>
                                            <span>Tổng tiền mặt: <strong style={{ color: '#1DA57A' }}>{AppConsts.formatNumber(this.totalFooter.cash)} VND</strong> </span><br />
                                            <span>Tổng tiền Ngân hàng: <strong style={{ color: '#1DA57A' }}> {AppConsts.formatNumber(this.totalFooter.moneyTransaction)} VND</strong></span><br />
                                            <span>Tổng tiền RFID: <strong style={{ color: '#1DA57A' }}> {AppConsts.formatNumber(this.totalFooter.moneyRFID)} VND</strong></span><br />
                                            <span>Tổng tiền Khuyến mãi: <strong style={{ color: '#1DA57A' }}> {AppConsts.formatNumber(this.totalFooter.moneyPromo)} VND</strong></span><br />
                                        </Col>
                                        <Col span={24} style={{ textAlign: "center" }}>
                                        </Col>
                                    </Row>
                                </>
                        }
                    />
                </div>
                <Modal
                    visible={this.state.visibleBarchart}
                    onCancel={() => { this.setState({ visibleBarchart: false }) }}
                    footer={null}
                    width='77vw'
                    closable={true}
                    title="Thống kê doanh thu theo máy"
                >
                    <BarchartReport
                        data={billingStatisticListResult?.map(item => new DataBarchart(
                            item.nameMachine,
                            item.cash,
                            item.moneyTransaction,
                            item.moneyRFID,
                            // item.moneyPromo,
                            item.cash_count,
                            item.transaction_count,
                            item.rfid_count,
                            // item.promo_count,
                            item.cash +
                            item.moneyTransaction +
                            item.moneyRFID
                            // item.moneyPromo
                        ))}
                        label1='Tổng tiền'
                        label2='Số lượng đơn hàng'
                        nameColumg1_1='Tiền mặt'
                        nameColumg1_2='Ngân hàng'
                        nameColumg1_3='Thẻ RFID'
                        // nameColumg1_4='Khuyến mãi'
                        nameColumg2_1='SLHD thanh toán theo tiền mặt'
                        nameColumg2_2='SLHD thanh toán theo Ngân hàng'
                        nameColumg2_3='SLHD thanh toán theo thẻ RFID'
                    // nameColumg2_4='SLHD thanh toán theo Khuyến mãi'
                    />
                </Modal>
                <Modal
                    visible={this.state.visibleModalTransactionDetail}
                    onCancel={() => { this.setState({ visibleModalTransactionDetail: false }); self.onChangePage(1, this.state.pageSize) ;self.handleCloseModal()}}
                    footer={null}
                    width='80vw'
                    closable={true}
                    title={"Chi tiết giao dịch máy " + stores.sessionStore.getNameMachines(this.state.ma_id_list!)}
                >
                    <Row gutter={[8, 8]}>
                        <Col span={24}>
                            <SearchHistoryTransaction
                                ref={this.childRef}
                                onSearchStatistic={this.onSearchHistory}
                                defaultStartDate={this.inputSearch.start_date}
                                defaultEndDate={this.inputSearch.end_date}
                            />
                        </Col>
                        <TableTransactionDetail
                            is_printed={false}
                            listTransactionByMachine={listTransactionByMachineDto}
                            pagination={{
                                position: ['topRight'],
                                pageSize: this.state.pageSizeHistory,
                                total: totalLog,
                                current: this.state.currentPageHistory,
                                showTotal: (tot) => ("Tổng: ") + tot + "",
                                showQuickJumper: true,
                                showSizeChanger: true,
                                pageSizeOptions: pageSizeOptions,
                                onShowSizeChange(current: number, size: number) {
                                    self.onChangePageHistory(current, size)
                                },
                                onChange: (page: number, pagesize?: number) => self.onChangePageHistory(page, pagesize)
                            }}
                        />
                    </Row>
                </Modal>
            </Card >
        )
    }
}