import * as React from 'react';
import ActionExport from "@src/components/ActionExport";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { Card, Col, Row, Table } from "antd";
import { stores } from '@src/stores/storeInitializer';
import { L } from '@lib/abpUtility';
import AppConsts from '@src/lib/appconst';
import { StatisticOfPriceUnitDto } from '@src/services/services_autogen';
import StatisticSearchByPriceUnitInput from '@src/components/Manager/StatisticSearchPrice';
import moment from 'moment';
import { eFormatPicker } from '@src/components/Manager/StatisticSearch';
import { SearchPriceUnitInput } from '@src/stores/statisticStore';

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
    inputSearch: SearchPriceUnitInput = new SearchPriceUnitInput(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    lastitem: number;
    dateTitle: string = "";
    today: Date = new Date();

    searchStatistic(input: SearchPriceUnitInput) {
        this.inputSearch = input;
        this.onChangePage(1, this.state.pageSize);
    }
    getAll = async () => {
        this.setState({ isLoadDone: false });
        await stores.statisticStore.statisticOfPriceUnit(this.inputSearch);
        this.setState({ isLoadDone: true })
    };
    onChangePage = async (page: number, pagesize?: number) => {
        const { listStatisticOfPriceUnit } = stores.statisticStore;
        if (pagesize === undefined || isNaN(pagesize)) {
            pagesize = listStatisticOfPriceUnit.length;
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
    getTypeDate = (typeDate) => {
        this.setState({ typeDate: typeDate });
    }
    render() {
        const self = this;
        const { listStatisticOfPriceUnit } = stores.statisticStore;
        const columns = [
            { title: "STT", key: "stt", width: 50, render: (text: string, item: StatisticOfPriceUnitDto, index: number) => <div>{this.state.pageSize! * (this.state.currentPage! - 1) + (index + 1)}</div> },
            { title: "Giá bán", key: "money", sorter: (a, b) => a.price - b.price, width: 100, render: (text: string, item: StatisticOfPriceUnitDto) => <div>{AppConsts.formatNumber(item.price)}</div> },
            {
                title: "Số lượng bán", key: "so_luong_ban", width: 400, children: [
                    { title: "Sản phẩm có bao bì", sorter: (a, b) => a.quantityDrink - b.quantityDrink, key: "drink", render: (text: string, item: StatisticOfPriceUnitDto) => <div>{AppConsts.formatNumber(item.quantityDrink)}</div> },
                    { title: "Sản phẩm không bao bì (ml)", sorter: (a, b) => a.quantityFreshDrink - b.quantityFreshDrink, key: "fr_drink", render: (text: string, item: StatisticOfPriceUnitDto) => <div>{AppConsts.formatNumber(item.quantityFreshDrink)}</div> },
                ]
            },
            {
                title: "Tổng tiền (VNĐ)", key: "tong_tien", width: 520, children: [
                    { title: "Sản phẩm có bao bì", sorter: (a, b) => a.totalMoneyDrink - b.totalMoneyDrink, key: "drink", render: (text: string, item: StatisticOfPriceUnitDto) => <div>{AppConsts.formatNumber(item.totalMoneyDrink)}</div> },
                    { title: "Sản phẩm không bao bì", sorter: (a, b) => a.totalMoneyFreshDrink - b.totalMoneyFreshDrink, key: "fr_drink", render: (text: string, item: StatisticOfPriceUnitDto) => <div>{AppConsts.formatNumber(item.totalMoneyFreshDrink)}</div> },
                    { title: "Tổng", sorter: (a, b) => a.totalMoney - b.totalMoney, key: "total", width: 120, render: (text: string, item: StatisticOfPriceUnitDto) => <div><b>{AppConsts.formatNumber(item.totalMoney)}</b></div> },
                ]
            },
        ];
        return (
            <Card >
                <Row gutter={[8, 8]}>
                    <Col span={24}>
                        <StatisticSearchByPriceUnitInput getTypeDate={(typeDate) => this.getTypeDate(typeDate)} onSearchStatistic={value => this.searchStatistic(value)}></StatisticSearchByPriceUnitInput>
                    </Col>
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
                </Row>
                <div id='baocaotheogiaban' ref={this.setComponentRef}>
                    <h2 style={{ textAlign: 'center', paddingTop: '10px' }}>
                        {this.state.typeDate === eFormatPicker.date ?
                            (!!this.inputSearch.start_date) ?

                                ((moment(this.inputSearch.start_date).format("DD/MM/YYYY") === moment(this.inputSearch.end_date).format("DD/MM/YYYY") || this.inputSearch.end_date === undefined) ?
                                    <>{"BÁO CÁO THEO GIÁ BÁN NGÀY " + moment(this.inputSearch.start_date).format("DD/MM/YYYY")}</>
                                    :
                                    <>{"BÁO CÁO THEO GIÁ BÁN TỪ NGÀY " + moment(this.inputSearch.start_date).format("DD/MM/YYYY") + " ĐẾN NGÀY " + moment(this.inputSearch.end_date).format("DD/MM/YYYY")}</>
                                )
                                :
                                <> BÁO CÁO THEO GIÁ BÁN</>
                            :
                            (this.state.typeDate == eFormatPicker.month ?
                                <>{"BÁO CÁO THEO GIÁ BÁN THÁNG " + moment(this.inputSearch.start_date).format("MM/YYYY")}</>
                                :
                                (this.state.typeDate == eFormatPicker.year ?
                                    <>{"BÁO CÁO THEO GIÁ BÁN NĂM " + moment(this.inputSearch.start_date).format("YYYY")}</>
                                    : <> BÁO CÁO THEO GIÁ BÁN</>)
                            )
                        }
                    </h2>
                    <Table
                        className="centerTable"
                        loading={!this.state.isLoadDone}
                        size={'small'}
                        bordered={true}
                        scroll={this.state.noScrollReport ? { x: undefined } : { x: 1070 }}
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
                            pageSizeOptions: ['10', '20', '50', '100', L('All')],
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
                                                    <b>{listStatisticOfPriceUnit && listStatisticOfPriceUnit.length > 0 ? AppConsts.formatNumber(listStatisticOfPriceUnit[listStatisticOfPriceUnit.length - 1].quantityDrink) : 0}</b>
                                                </div>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={3}>
                                                <div style={{ display: "flex", justifyContent: "center" }}>
                                                    <b>{listStatisticOfPriceUnit && listStatisticOfPriceUnit.length > 0 ? AppConsts.formatNumber(listStatisticOfPriceUnit[listStatisticOfPriceUnit.length - 1].quantityFreshDrink) : 0}</b>
                                                </div>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={4}>
                                                <div style={{ display: "flex", justifyContent: "center" }}>
                                                    <b>{listStatisticOfPriceUnit && listStatisticOfPriceUnit.length > 0 ? AppConsts.formatNumber(listStatisticOfPriceUnit[listStatisticOfPriceUnit.length - 1].totalMoneyDrink) : 0}</b>
                                                </div>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={5}>
                                                <div style={{ display: "flex", justifyContent: "center" }}>
                                                    <b>{listStatisticOfPriceUnit && listStatisticOfPriceUnit.length > 0 ? AppConsts.formatNumber(listStatisticOfPriceUnit[listStatisticOfPriceUnit.length - 1].totalMoneyFreshDrink) : 0}</b>
                                                </div>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={6}>
                                                <div style={{ display: "flex", justifyContent: "center" }}>
                                                    <b>{listStatisticOfPriceUnit && listStatisticOfPriceUnit.length > 0 ? AppConsts.formatNumber(listStatisticOfPriceUnit[listStatisticOfPriceUnit.length - 1].totalMoney) : 0}</b>
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