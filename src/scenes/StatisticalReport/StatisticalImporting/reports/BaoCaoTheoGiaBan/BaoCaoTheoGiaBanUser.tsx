import * as React from 'react';
import ActionExport from "@src/components/ActionExport";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { Card, Col, Row, Table } from "antd";
import { stores } from '@src/stores/storeInitializer';
import { isGranted, L } from '@lib/abpUtility';
import AppConsts, { pageSizeOptions } from '@src/lib/appconst';
import { StatisticOfPriceUnitDto } from '@src/services/services_autogen';
import StatisticSearchByPriceUnitInput from '@src/components/Manager/StatisticSearchPrice';
import moment from 'moment';
import { eFormatPicker } from '@src/components/Manager/StatisticSearch';
import { SearchPriceUnitInput } from '@src/stores/statisticStore';

type TTotal = {
    quantityDrink: number,
    quantityFreshDrink: number,
    totalMoneyDrink: number,
    totalMoneyFreshDrink: number,
    totalMoney: number
}
export default class BaoCaoTheoGiaBanUser extends AppComponentBase {
    componentRef: any | null = null;
    state = {
        isLoadDone: true,
        skipCount: 0,
        currentPage: 1,
        pageSize: 10,
        isHeaderReport: false,
        typeDate: undefined,
        noScrollReport: false,
    };
    inputSearch: SearchPriceUnitInput = new SearchPriceUnitInput(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    lastitem: number;
    dateTitle: string = "";
    today: Date = new Date();
    totalFooter: TTotal = { quantityDrink: 0, quantityFreshDrink: 0, totalMoneyDrink: 0, totalMoneyFreshDrink: 0, totalMoney: 0 };

    searchStatistic(input: SearchPriceUnitInput) {
        this.inputSearch = input;
        this.onChangePage(1, this.state.pageSize);
    }
    getAll = async () => {
        this.setState({ isLoadDone: true });
        await stores.statisticStore.statisticOfPriceUnit(this.inputSearch);
        this.setState({ isLoadDone: false })
    };
    onChangePage = async (page: number, pagesize?: number) => {
        const { listStatisticOfPriceUnit } = stores.statisticStore;
        if (pagesize === undefined || isNaN(pagesize)) {
            pagesize = listStatisticOfPriceUnit.length;
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
    getTypeDate = (typeDate) => {
        this.setState({ typeDate: typeDate });
    }

    caculatorTotal = () => {
        const { listStatisticOfPriceUnit } = stores.statisticStore;
        this.totalFooter = { quantityDrink: 0, quantityFreshDrink: 0, totalMoneyDrink: 0, totalMoneyFreshDrink: 0, totalMoney: 0 };
        for (let i = 0; i < listStatisticOfPriceUnit.length; i++) {
            this.totalFooter.quantityDrink += listStatisticOfPriceUnit[i].quantityDrink;
            this.totalFooter.quantityFreshDrink += listStatisticOfPriceUnit[i].quantityFreshDrink;
            this.totalFooter.totalMoneyDrink += listStatisticOfPriceUnit[i].totalMoneyDrink;
            this.totalFooter.totalMoneyFreshDrink += listStatisticOfPriceUnit[i].totalMoneyFreshDrink;
            this.totalFooter.totalMoney += listStatisticOfPriceUnit[i].totalMoney;
        }
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }
    render() {
        const self = this;
        const { listStatisticOfPriceUnit } = stores.statisticStore;
        const columns = [
            { title: "STT", key: "stt", width: 50, render: (text: string, item: StatisticOfPriceUnitDto, index: number) => <div>{this.state.pageSize! * (this.state.currentPage! - 1) + (index + 1)}</div> },
            { title: "Giá bán", key: "money", sorter: (a, b) => a.price - b.price, width: 130, render: (text: string, item: StatisticOfPriceUnitDto) => <div>{AppConsts.formatNumber(item.price)}</div> },
            {
                title: "Số lượng bán", key: "so_luong_ban", children: [
                    { title: "Sản phẩm có bao bì", width: 220, sorter: (a, b) => a.quantityDrink - b.quantityDrink, key: "quantityDrink", render: (_: string, item: StatisticOfPriceUnitDto) => <div>{AppConsts.formatNumber(item.quantityDrink)}</div> },
                    { title: "Sản phẩm không bao bì (ml)", width: 220, sorter: (a, b) => a.quantityFreshDrink - b.quantityFreshDrink, key: "quantityFreshDrink", render: (_: string, item: StatisticOfPriceUnitDto) => <div>{AppConsts.formatNumber(item.quantityFreshDrink)}</div> },
                ]
            },
            {
                title: "Tổng tiền (VNĐ)", key: "tong_tien", children: [
                    { title: "Sản phẩm có bao bì", width: 220, sorter: (a, b) => a.totalMoneyDrink - b.totalMoneyDrink, key: "totalMoneyDrink", render: (_: string, item: StatisticOfPriceUnitDto) => <div>{AppConsts.formatNumber(item.totalMoneyDrink)}</div> },
                    { title: "Sản phẩm không bao bì", width: 220, sorter: (a, b) => a.totalMoneyFreshDrink - b.totalMoneyFreshDrink, key: "totalMoneyFreshDrink", render: (_: string, item: StatisticOfPriceUnitDto) => <div>{AppConsts.formatNumber(item.totalMoneyFreshDrink)}</div> },
                    { title: <b>Tổng</b>, sorter: (a, b) => a.totalMoney - b.totalMoney, key: "total", width: 120, render: (_: string, item: StatisticOfPriceUnitDto) => <div><b>{AppConsts.formatNumber(item.totalMoney)}</b></div> },
                ]
            },
        ];
        return (
            <Card >
                <Row gutter={[8, 8]}>
                    <Col span={24}>
                        <StatisticSearchByPriceUnitInput getTypeDate={(typeDate) => this.getTypeDate(typeDate)} onSearchStatistic={value => this.searchStatistic(value)}></StatisticSearchByPriceUnitInput>
                    </Col>
                    {isGranted(AppConsts.Permission.Pages_Statistic_PriceUnit_Export) &&
                        <Col span={24}>
                            <ActionExport
                                isScrollReport={async () => await this.setState({ noScrollReport: false })}
                                noScrollReport={async () => await this.setState({ noScrollReport: true })}
                                isWord={true}
                                isExcel={true}
                                idPrint={"baocaotheogiaban"}
                                nameFileExport={"baocaotheogiaban " + moment().format('DD_MM_YYYY')}
                                componentRef={this.componentRef}
                            />
                        </Col>
                    }
                </Row>
                <div id='baocaotheogiaban' ref={this.setComponentRef}>
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
                                                ? <><strong>{"BÁO CÁO THEO GIÁ BÁN NGÀY " + formattedStartDate}</strong></>
                                                : <><strong>{"BÁO CÁO THEO GIÁ BÁN TỪ NGÀY " + formattedStartDate + " ĐẾN NGÀY " + formattedEndDate}</strong></>
                                        );
                                    }
                                } else if (typeDate === eFormatPicker.month) {
                                    // Báo cáo theo tháng
                                    if (!!start_date) {
                                        return (
                                            formattedStartMonth === formattedEndMonth || end_date === undefined
                                                ? <><strong>{"BÁO CÁO THEO GIÁ BÁN THÁNG " + formattedStartMonth}</strong></>
                                                : <><strong>{"BÁO CÁO THEO GIÁ BÁN TỪ THÁNG " + formattedStartMonth + " ĐẾN THÁNG " + formattedEndMonth}</strong></>
                                        );
                                    }
                                } else if (typeDate === eFormatPicker.year) {
                                    // Báo cáo theo năm
                                    if (!!start_date) {
                                        return (
                                            formattedStartYear === formattedEndYear || end_date === undefined
                                                ? <><strong>{"BÁO CÁO THEO GIÁ BÁN NĂM " + formattedStartYear}</strong></>
                                                : <><strong>{"BÁO CÁO THEO GIÁ BÁN TỪ NĂM " + formattedStartYear + " ĐẾN NĂM " + formattedEndYear}</strong></>
                                        );
                                    }
                                }

                                return <><strong>BÁO CÁO THEO GIÁ BÁN</strong></>;
                            })()
                        }
                    </h2>
                    <Table
                        // sticky
                        className="centerTable"
                        loading={!this.state.isLoadDone}
                        size={'small'}
                        bordered={true}
                        scroll={this.state.noScrollReport ? { x: undefined } : { x: 1000 }}
                        dataSource={listStatisticOfPriceUnit != undefined ? listStatisticOfPriceUnit.slice(0, -1) : []}
                        columns={columns}
                        pagination={this.state.noScrollReport ? false : {
                            className: "ant-table-pagination ant-table-pagination-right no-print noprintExcel ",
                            pageSize: this.state.pageSize,
                            total: listStatisticOfPriceUnit.length - 1,
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
                        summary={
                            listStatisticOfPriceUnit.length > 0 ?
                                () => (
                                    <>
                                        <Table.Summary.Row>
                                            <Table.Summary.Cell index={0} colSpan={0}></Table.Summary.Cell>
                                            <Table.Summary.Cell index={1} colSpan={2}><div style={{ display: "flex", justifyContent: "center" }}><b>Tổng</b></div></Table.Summary.Cell>
                                            <Table.Summary.Cell index={2}>
                                                <div style={{ display: "flex", justifyContent: "center" }}>
                                                    <b>{AppConsts.formatNumber(this.totalFooter.quantityDrink)}</b>
                                                </div>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={3}>
                                                <div style={{ display: "flex", justifyContent: "center" }}>
                                                    <b>{AppConsts.formatNumber(this.totalFooter.quantityFreshDrink)}</b>
                                                </div>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={4}>
                                                <div style={{ display: "flex", justifyContent: "center" }}>
                                                    <b>{AppConsts.formatNumber(this.totalFooter.totalMoneyDrink)}</b>
                                                </div>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={5}>
                                                <div style={{ display: "flex", justifyContent: "center" }}>
                                                    <b>{AppConsts.formatNumber(this.totalFooter.totalMoneyFreshDrink)}</b>
                                                </div>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={6}>
                                                <div style={{ display: "flex", justifyContent: "center" }}>
                                                    <b>{AppConsts.formatNumber(this.totalFooter.totalMoney)}</b>
                                                </div>
                                            </Table.Summary.Cell>
                                        </Table.Summary.Row>
                                    </>
                                ) : undefined}
                    />
                </div>
            </Card>
        )
    }
}