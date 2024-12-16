import * as React from 'react';
import ActionExport from "@src/components/ActionExport";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { Button, Card, Col, Modal, Row, Table, message } from "antd";
import { stores } from '@src/stores/storeInitializer';
import { L } from '@lib/abpUtility';
import AppConsts, { cssColResponsiveSpan } from '@src/lib/appconst';
import { StatisticBillingOfPaymentDto } from '@src/services/services_autogen';
import moment from 'moment';
import StatisticSearch, { eFormatPicker } from '@src/components/Manager/StatisticSearch';
import { BarChartOutlined } from '@ant-design/icons';
import PiechartReport, { DataPiechart } from '../../Chart/PiechartReport';
import { SearchInputUser } from '@src/stores/statisticStore';
import HistoryHelper from '@src/lib/historyHelper';

export default class BaoCaoTheoLoaiHinhThanhToanUser extends AppComponentBase {
    componentRef: any | null = null;

    state = {
        isLoadDone: true,
        isVisibleModelDetailMemberList: false,
        skipCount: 0,
        currentPage: 1,
        pageSize: 10,
        titleList: '',
        titleColumn: '',
        isHeaderReport: false,
        visibleBarchart: false,
        typeDate: undefined,
        noScrollReport: false,
    };
    inputSearch: SearchInputUser = new SearchInputUser(undefined, undefined, undefined, undefined, undefined, undefined);
    lastitem: number;
    dateTitle: string = "";
    today: Date = new Date();
    getAll = async () => {
        this.setState({ isLoadDone: false });
        await stores.statisticStore.statisticBillingOfPayment(this.inputSearch);
        this.setState({ isLoadDone: true })
    };

    onChangePage = async (page: number, pagesize?: number) => {
        const { listStatisticBillingOfPayment } = stores.statisticStore;
        if (pagesize === undefined || isNaN(pagesize)) {
            pagesize = listStatisticBillingOfPayment.length;
            page = 1;
        }
        await this.setState({ pageSize: pagesize! });
        await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            this.getAll();
        });
    }
    setComponentRef = (ref) => {
        this.setState({ isLoadDone: false });
        this.componentRef = ref;
        this.setState({ isLoadDone: true });
    }
    searchStatistic(input: SearchInputUser) {
        this.inputSearch = input;
        this.onChangePage(1, this.state.pageSize);
    }
    visibleBarchartReport = () => {
        const { listStatisticBillingOfPayment } = stores.statisticStore;

        if (listStatisticBillingOfPayment[listStatisticBillingOfPayment.length - 1].total_value > 0) {
            this.setState({ visibleBarchart: true });
        }
        else
            message.info("Không có dữ liệu");
    }
    getTypeDate = (typeDate) => {
        this.setState({ typeDate: typeDate });
    }
    render() {
        const self = this;
        const { listStatisticBillingOfPayment } = stores.statisticStore;
        let total;
        listStatisticBillingOfPayment.map(item => {
            if (item.name === "total_value") {
                total = item.total_value;
            }
        });

        const columns = [

            { title: "STT", classNames: "start", key: "stt", width: 50, render: (text: string, item: StatisticBillingOfPaymentDto, index: number) => <div>{this.state.pageSize! * (this.state.currentPage! - 1) + (index + 1)}</div> },
            { title: "Loại hình thanh toán", key: "name", render: (text: string, item: StatisticBillingOfPaymentDto) => <div>{item.name === "cash" ? "Tiền mặt" : (item.name === "transaction" ? "Mã QR" : "Thẻ RFID")}</div> },
            { title: "Số đơn hàng đã bán", key: "quantity", sorter: (a, b) => a.quantity - b.quantity, render: (text: string, item: StatisticBillingOfPaymentDto) => <div>{AppConsts.formatNumber(item.quantity)}</div> },
            { title: "Tổng doanh thu", key: "total_money", sorter: (a, b) => a.total_value - b.total_value, render: (text: string, item: StatisticBillingOfPaymentDto) => <div>{AppConsts.formatNumber(item.total_value)}</div> },
            {
                title: "Tỉ lệ", key: "ti_le", render: (text: string, item: StatisticBillingOfPaymentDto) => <div>{
                    total !== 0 && item.name !== "total_value" ?
                        (item.total_value / total * 100).toFixed(2) + "%" : "0"
                }</div>
            },
        ];

        return (
            <Card >
                <Row gutter={16}>
                    <Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 24)}>
                        <StatisticSearch getTypeDate={(typeDate) => this.getTypeDate(typeDate)} onSearchStatistic={(input) => { this.searchStatistic(input) }} />
                    </Col>
                    {this.isGranted(AppConsts.Permission.Pages_Statistic_BillingOfPayment_Export) &&
                        <Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 24)} style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "end" }}>
                            <Button type='primary' icon={<BarChartOutlined />} onClick={() => this.visibleBarchartReport()}>{(window.innerWidth >= 768) && 'Biểu đồ'}</Button>
                            <ActionExport
                                isScrollReport={async () => await this.setState({ noScrollReport: false })}
                                noScrollReport={async () => await this.setState({ noScrollReport: true })}
                                isWord={true}
                                isExcel={true}
                                idPrint={"baocaotheoloaihinhthanhtoan"}
                                nameFileExport={"baocaotheoloaihinhthanhtoan" + ' ' + moment().format('DD_MM_YYYY')}
                                componentRef={this.componentRef}
                            />
                        </Col>
                    }
                </Row>
                <div id='baocaotheoloaihinhthanhtoan' ref={this.setComponentRef}>
                    <h2 style={{ textAlign: 'center', paddingTop: '10px' }}>
                        {this.state.typeDate === eFormatPicker.date ?
                            (!!this.inputSearch.start_date) ?

                                ((moment(this.inputSearch.start_date).format("DD/MM/YYYY") === moment(this.inputSearch.end_date).format("DD/MM/YYYY") || this.inputSearch.end_date === undefined) ?
                                    <>{"BÁO CÁO THEO LOẠI HÌNH THANH TOÁN NGÀY " + moment(this.inputSearch.start_date).format("DD/MM/YYYY")}</>
                                    :
                                    <>{"BÁO CÁO THEO LOẠI HÌNH THANH TOÁN TỪ NGÀY " + moment(this.inputSearch.start_date).format("DD/MM/YYYY") + " ĐẾN NGÀY " + moment(this.inputSearch.end_date).format("DD/MM/YYYY")}</>
                                )
                                :
                                <> BÁO CÁO THEO LOẠI HÌNH THANH TOÁN</>
                            :
                            (this.state.typeDate === eFormatPicker.month ?
                                <>{"BÁO CÁO THEO LOẠI HÌNH THANH TOÁN THÁNG " + moment(this.inputSearch.start_date).format("MM/YYYY")}</>
                                :
                                (this.state.typeDate === eFormatPicker.year ?
                                    <>{"BÁO CÁO THEO LOẠI HÌNH THANH TOÁN NĂM " + moment(this.inputSearch.start_date).format("YYYY")}</>
                                    : <> BÁO CÁO THEO LOẠI HÌNH THANH TOÁN</>)
                            )
                        }
                    </h2>
                    <Table
                        // sticky
                        onRow={(record, rowIndex) => {
                            return {
                                onClick: () => {
                                    const { start_date, end_date } = this.inputSearch;

                                    const paymentType = record.name === "cash"
                                        ? 0
                                        : (record.name === "transaction"
                                            ? 1
                                            : 2);

                                    // const machineId = Number(stores.sessionStore.getIdMachine(record.machineCode!));
                                    // const groupId = stores.sessionStore.getIdGroupUseName(record.groupMachineName!);
                                    const url = `/history/transaction_detail?startDate=${start_date}&endDate=${end_date}&paymentType=${paymentType}`;
                                    HistoryHelper.redirect(url);
                                }
                            };
                        }}
                        className="centerTable"
                        size={'small'}
                        scroll={this.state.noScrollReport ? { x: undefined } : { x: 500 }}
                        bordered={true}
                        dataSource={listStatisticBillingOfPayment !== undefined ? listStatisticBillingOfPayment.slice(0, -1) : []}
                        columns={columns}
                        rowKey={record => "quanlymaybannuoc_index__" + JSON.stringify(record)}
                        pagination={this.state.noScrollReport ? false : {
                            className: "ant-table-pagination ant-table-pagination-right no-print noprintExcel ",
                            pageSize: this.state.pageSize,
                            total: listStatisticBillingOfPayment.length - 1,
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
                            listStatisticBillingOfPayment.length > 0 ? () => (
                                <>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0} colSpan={0}></Table.Summary.Cell>
                                        <Table.Summary.Cell index={1} colSpan={2}><div style={{ display: "flex", justifyContent: "center" }}><b>Tổng</b></div></Table.Summary.Cell>
                                        <Table.Summary.Cell index={2}>
                                            <div style={{ display: "flex", justifyContent: "center" }}>
                                                <b>{listStatisticBillingOfPayment && listStatisticBillingOfPayment.length > 0 ? listStatisticBillingOfPayment[listStatisticBillingOfPayment.length - 1].quantity : ""}</b>
                                            </div>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={3}>
                                            <div style={{ display: "flex", justifyContent: "center" }}>
                                                <b>{listStatisticBillingOfPayment && listStatisticBillingOfPayment.length > 0 ? AppConsts.formatNumber(listStatisticBillingOfPayment[listStatisticBillingOfPayment.length - 1].total_value) : ""}</b>
                                            </div>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={3}>
                                            <div style={{ display: "flex", justifyContent: "center" }}>
                                                <b>{listStatisticBillingOfPayment && listStatisticBillingOfPayment.length > 0 ? "100%" : ""}</b>
                                            </div>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>

                                </>
                            ) : undefined} />
                </div>
                {this.state.visibleBarchart &&
                    <Modal
                        visible={this.state.visibleBarchart}
                        onCancel={() => { this.setState({ visibleBarchart: false }) }}
                        footer={null}
                        width='70vw'
                        closable={true}
                        title="Biểu đồ báo cáo theo loại hình thanh toán"
                    >
                        <PiechartReport
                            data={listStatisticBillingOfPayment.slice(0, -1)?.map((item, index) => (
                                new DataPiechart(
                                    item.name === "cash" ? "Tiền mặt" : (item.name === "transaction" ? "Mã QR" : "Thẻ RFID"),
                                    item.total_value,
                                    item.quantity,
                                )
                            ))}
                            label1='VNĐ'
                            label2='Số lượng'
                        />
                    </Modal>
                }
            </Card >
        )
    }
}