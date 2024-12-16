import * as React from 'react';
import ActionExport from "@src/components/ActionExport";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { Button, Card, Col, Modal, Row, Table, Tooltip, message } from "antd";
import { stores } from '@src/stores/storeInitializer';
import AppConsts, { cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import { StatisticBillingOfPaymentDto } from '@src/services/services_autogen';
import moment from 'moment';
import { eFormatPicker } from '@src/components/Manager/StatisticSearch';
import { BarChartOutlined } from '@ant-design/icons';
import PiechartReport, { DataPiechart } from '../../Chart/PiechartReport';
import StatisticSearchByAdmin from '@src/components/Manager/StatisticSearchByAdmin';
import { SearchInputAdmin } from '@src/stores/statisticStore';
import { valueOfeBillMethod } from '@src/lib/enumconst';

type TTotal = {
    quantity: number,
    total_value: number,
}

export default class BaoCaoTheoLoaiHinhThanhToanAdmin extends AppComponentBase {
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
        listMachineId: undefined,
        groupMachineId: undefined,
    };
    inputSearch: SearchInputAdmin = new SearchInputAdmin(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    lastitem: number;
    dateTitle: string = "";
    today: Date = new Date();
    totalFooter: TTotal = { quantity: 0, total_value: 0 };

    getAll = async () => {
        await stores.statisticStore.statisticBillingOfPaymentbyAdmin(this.inputSearch);
        this.setState({ isLoadDone: !this.state.isLoadDone });
    };

    onChangePage = async (page: number, pagesize?: number) => {
        const { listStatisticBillingOfPayment } = stores.statisticStore;
        if (pagesize === undefined || isNaN(pagesize)) {
            pagesize = listStatisticBillingOfPayment.length;
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
    setComponentRef = (ref) => {
        this.setState({ isLoadDone: false });
        this.componentRef = ref;
        this.setState({ isLoadDone: true });
    }
    searchStatistic(input: SearchInputAdmin) {
        this.inputSearch = input;
        this.setState({ groupMachineId: input.gr_ma_id, listMachineId: input.ma_id_list });
        this.onChangePage(1, this.state.pageSize);
    }
    visibleBarchartReport = () => {
        if (this.totalFooter.total_value > 0) {
            this.setState({ visibleBarchart: true });
        }
        else
            message.info("Không có dữ liệu");
    }
    getTypeDate = (typeDate) => {
        this.setState({ typeDate: typeDate });
    }
    caculatorTotal = () => {
        const { listStatisticBillingOfPayment } = stores.statisticStore;
        this.totalFooter = { quantity: 0, total_value: 0 };
        for (let i = 0; i < listStatisticBillingOfPayment.length; i++) {
            this.totalFooter.quantity += listStatisticBillingOfPayment[i].quantity;
            this.totalFooter.total_value += listStatisticBillingOfPayment[i].total_value;
        }
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }
    render() {
        const { listStatisticBillingOfPayment } = stores.statisticStore;

        const columns = [
            { title: "STT", classNames: "start", key: "stt", width: 50, render: (_: string, item: StatisticBillingOfPaymentDto, index: number) => <div><Tooltip title="Xem chi tiết giao dịch">{this.state.pageSize! * (this.state.currentPage! - 1) + (index + 1)}</Tooltip></div> },
            { title: "Loại hình thanh toán", key: "name", render: (_: string, item: StatisticBillingOfPaymentDto) => <div><Tooltip title="Xem chi tiết giao dịch">{valueOfeBillMethod(item.paymentType)}</Tooltip></div> },
            { title: "Số đơn hàng đã bán", key: "quantity", sorter: (a, b) => a.quantity - b.quantity, render: (_: string, item: StatisticBillingOfPaymentDto) => <div><Tooltip title="Xem chi tiết giao dịch">{AppConsts.formatNumber(item.quantity)}</Tooltip></div> },
            { title: "Tổng doanh thu", key: "total_money", sorter: (a, b) => a.total_value - b.total_value, render: (_: string, item: StatisticBillingOfPaymentDto) => <div><Tooltip title="Xem chi tiết giao dịch">{AppConsts.formatNumber(item.total_value)}</Tooltip></div> },
            { title: "Tỉ lệ", key: "ti_le", sorter: (a, b) => a.total_value - b.total_value, render: (_: string, item: StatisticBillingOfPaymentDto) => <div>{this.totalFooter.total_value ? (item.total_value / this.totalFooter.total_value * 100).toFixed(2)+ "%" : "0%"}</div> },
        ];

        return (
            <Card >
                <Row gutter={16}>
                    <Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 24)}>
                        <StatisticSearchByAdmin getTypeDate={(typeDate) => this.getTypeDate(typeDate)} onSearchStatistic={(input) => { this.searchStatistic(input) }} />
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
                    <h2 style={{ textAlign: 'center', paddingTop: '10px', fontWeight: 'bold' }}>
                        {
                            (() => {
                                const { typeDate } = this.state;
                                const { start_date, end_date } = this.inputSearch;

                                const formattedStartDate = moment(start_date).format("DD/MM/YYYY");
                                const formattedEndDate = end_date ? moment(end_date).format("DD/MM/YYYY") : undefined;

                                const formattedStartMonth = moment(start_date).format("MM/YYYY");
                                const formattedEndMonth = end_date ? moment(end_date).format("MM/YYYY") : undefined;

                                const formattedStartYear = moment(start_date).format("YYYY");
                                const formattedEndYear = end_date ? moment(end_date).format("YYYY") : undefined;

                                if (typeDate === eFormatPicker.date) {
                                    // Báo cáo theo ngày
                                    if (!!start_date) {
                                        return (
                                            formattedStartDate === formattedEndDate || end_date === undefined
                                                ? <>{"BÁO CÁO THEO LOẠI HÌNH THANH TOÁN NGÀY " + formattedStartDate}</>
                                                : <>{"BÁO CÁO THEO LOẠI HÌNH THANH TOÁN TỪ NGÀY " + formattedStartDate + " ĐẾN NGÀY " + formattedEndDate}</>
                                        );
                                    }
                                } else if (typeDate === eFormatPicker.month) {
                                    // Báo cáo theo tháng
                                    if (!!start_date) {
                                        return (
                                            formattedStartMonth === formattedEndMonth || end_date === undefined
                                                ? <>{"BÁO CÁO THEO LOẠI HÌNH THANH TOÁN THÁNG " + formattedStartMonth}</>
                                                : <>{"BÁO CÁO THEO LOẠI HÌNH THANH TOÁN TỪ THÁNG " + formattedStartMonth + " ĐẾN THÁNG " + formattedEndMonth}</>
                                        );
                                    }
                                } else if (typeDate === eFormatPicker.year) {
                                    // Báo cáo theo năm
                                    if (!!start_date) {
                                        return (
                                            formattedStartYear === formattedEndYear || end_date === undefined
                                                ? <>{"BÁO CÁO THEO LOẠI HÌNH THANH TOÁN NĂM " + formattedStartYear}</>
                                                : <>{"BÁO CÁO THEO LOẠI HÌNH THANH TOÁN TỪ NĂM " + formattedStartYear + " ĐẾN NĂM " + formattedEndYear}</>
                                        );
                                    }
                                }

                                return <> BÁO CÁO THEO LOẠI HÌNH THANH TOÁN</>;
                            })()
                        }
                    </h2>
                    <Table
                        onRow={(record) => {
                            return {
                                onClick: () => {
                                    const { start_date, end_date } = this.inputSearch;

                                    const paymentType = record.name === "cash"
                                        ? 0
                                        : (record.name === "transaction"
                                            ? 1
                                            : 2);

                                    const machineId = this.state.listMachineId!;
                                    const groupId = this.state.groupMachineId!;
                                    const url = `/history/transaction_detail?startDate=${start_date}&endDate=${end_date}&ma_list_id=${machineId}&gr_id=${groupId}&paymentType=${paymentType}`;
                                    window.open(url, '_blank')
                                }
                            };
                        }}
                        className="centerTable"
                        size={'small'}
                        scroll={this.state.noScrollReport ? { x: undefined } : { x: 500 }}
                        bordered={true}
                        dataSource={listStatisticBillingOfPayment}
                        columns={columns}
                        rowKey={record => "quanlymaybannuoc_index__" + JSON.stringify(record)}
                        pagination={false}
                        summary={
                            listStatisticBillingOfPayment.length > 0 ? () => (
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0} colSpan={0}></Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} colSpan={2}><div style={{ display: "flex", justifyContent: "center" }}><b>Tổng</b></div></Table.Summary.Cell>
                                    <Table.Summary.Cell index={2}>
                                        <div style={{ display: "flex", justifyContent: "center" }}>
                                            <b>{AppConsts.formatNumber(this.totalFooter.quantity)}</b>
                                        </div>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={3}>
                                        <div style={{ display: "flex", justifyContent: "center" }}>
                                            <b>{AppConsts.formatNumber(this.totalFooter.total_value)}</b>
                                        </div>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={3}>
                                        <div style={{ display: "flex", justifyContent: "center" }}>
                                            <b>{this.totalFooter.total_value ? "100%" : "0%"}</b>
                                        </div>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            ) : undefined} />
                </div>
                <Modal
                    centered
                    visible={this.state.visibleBarchart}
                    onCancel={() => { this.setState({ visibleBarchart: false }) }}
                    footer={null}
                    width='70vw'
                    closable={true}
                    title="Biểu đồ báo cáo theo loại hình thanh toán"
                >
                    <PiechartReport
                        data={listStatisticBillingOfPayment.map((item, index) => (
                            new DataPiechart(
                                item.name === "cash" ? "Tiền mặt" : (item.name === "transaction" ? "Ngân hàng":(item.name==="promo")?"Khuyến mãi" : "Thẻ RFID"),
                                item.total_value,
                                item.quantity,
                            )
                        ))}
                        label1='VNĐ'
                        label2='Số lượng'
                    />
                </Modal>
            </Card >
        )
    }
}