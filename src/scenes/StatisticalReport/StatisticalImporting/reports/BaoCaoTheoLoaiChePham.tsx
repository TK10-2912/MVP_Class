import * as React from 'react';
import ActionExport from "@src/components/ActionExport";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { Card, Col, Row, Table } from "antd";
import { stores } from '@src/stores/storeInitializer';
import { valueOfeDrinkType } from '@src/lib/enumconst';
import AppConsts, { cssColResponsiveSpan } from '@src/lib/appconst';
import {  StatisticOfDrinkTypeDto } from '@src/services/services_autogen';
import StatisticSearch from '@src/components/Manager/StatisticSearch';
import moment from 'moment';
import { SearchInputUser } from '@src/stores/statisticStore';

export const eFormatPicker = {
    date: "date",
    month: "month",
    year: "year",
}
export default class BaoCaoTheoLoaiSanPham extends AppComponentBase {
    componentRef: any | null = null;
    state = {
        isLoadDone: true,
        skipCount: 0,
        currentPage: 1,
        pageSize: 10,
        isHeaderReport: false,
        typeDate: undefined,
    };
    listStatisticOfDrinkTypeDto: StatisticOfDrinkTypeDto[] = [];
    listIdSlected: number[] = [];
    inputSearch: SearchInputUser = new SearchInputUser(undefined,undefined,undefined,undefined,undefined,undefined);
    lastitem: number;
    dateTitle: string = "";
    today: Date = new Date();
    getAll = async () => {
        this.setState({ isLoadDone: false });
        await stores.statisticStore.statisticOfDrinkType(this.inputSearch);
        this.setState({ isLoadDone: true })
    };

    setComponentRef = (ref) => {
        this.setState({ isLoadDone: false });
        this.componentRef = ref;
        this.setState({ isLoadDone: true });
    }
    searchStatistic(input: SearchInputUser) {
        this.inputSearch = input;
        this.getAll();
    }
    getTypeDate = (typeDate) => {
        this.setState({ typeDate: typeDate });
    }
    render() {
        const { liststatisticOfDrinkType } = stores.statisticStore;
        const columns = [
            { title: "STT", key: "money", render: (text: string, item: StatisticOfDrinkTypeDto, index: number) => <div>{index + 1}</div> },
            { title: "Loại sản phẩm", key: "drink_type", render: (text: string, item: StatisticOfDrinkTypeDto) => <div>{valueOfeDrinkType(item.type)}</div> },
            {
                title: "Tiền mặt", key: "cash_type", children: [
                    { title: "Tổng tiền (VNĐ)", key: "total_cash", render: (text: string, item: StatisticOfDrinkTypeDto) => <div>{AppConsts.formatNumber(item.cash)}</div> },
                    { title: "Tổng lần giao dịch", key: "cash_count", render: (text: string, item: StatisticOfDrinkTypeDto) => <div>{AppConsts.formatNumber(item.cash_count)}</div> },
                ]
            },
            {
                title: "Mã QR", key: "moneyTransaction_type", children: [
                    { title: "Tổng tiền (VNĐ)", key: "moneyTransaction", render: (text: string, item: StatisticOfDrinkTypeDto) => <div>{AppConsts.formatNumber(item.moneyTransaction)}</div> },
                    { title: "Tổng lần giao dịch", key: "transaction_count", render: (text: string, item: StatisticOfDrinkTypeDto) => <div>{AppConsts.formatNumber(item.transaction_count)}</div> },
                ]
            },
            {
                title: "RFID", key: "moneyRFID_type", children: [
                    { title: "Tổng tiền (VNĐ)", key: "moneyRFID", render: (text: string, item: StatisticOfDrinkTypeDto) => <div>{AppConsts.formatNumber(item.moneyRFID)}</div> },
                    { title: "Tổng lần giao dịch", key: "rfid_count", render: (text: string, item: StatisticOfDrinkTypeDto) => <div>{AppConsts.formatNumber(item.rfid_count)}</div> },
                ]
            },
            { title: "Tổng số lượng đơn hàng", key: "total", render: (text: string, item: StatisticOfDrinkTypeDto) => <div>{AppConsts.formatNumber(item.totalBiliing)}</div> },
            { title: "Tổng tiền", key: "total_money", render: (text: string, item: StatisticOfDrinkTypeDto) => <div>{AppConsts.formatNumber(item.totalMoney)}</div> },
        ];

        return (
            <Card >
                <StatisticSearch getTypeDate={(typeDate) => this.getTypeDate(typeDate)} onSearchStatistic={(input) => this.searchStatistic(input)}
                ></StatisticSearch>
                <Row gutter={[16, 16]}>
                    <Col {...cssColResponsiveSpan(24, 18, 18, 12, 12, 12)} style={{ textAlign: "left" }}></Col>
                    <Col {...cssColResponsiveSpan(24, 24, 24, 12, 12, 12)} className='textAlign-col-992'>
                        <ActionExport
                            isWord={true}
                            isExcel={true}
                            idPrint={"baocaotheochepham"}
                            nameFileExport={"baocaotheochepham"}
                            componentRef={this.componentRef}
                        />
                    </Col>
                </Row>
                <div id='baocaotheochepham' ref={this.setComponentRef}>
                    <h2 style={{ textAlign: 'center', paddingTop: '10px' }}>
                        {this.state.typeDate == eFormatPicker.date ?
                            <>{"BÁO CÁO THEO LOẠI SẢN PHẨM TỪ NGÀY " + moment(this.inputSearch.start_date).format("DD/MM/YYYY") + " ĐẾN NGÀY " + moment(this.inputSearch.end_date).format("DD/MM/YYYY")}</>
                            :
                            (this.state.typeDate == eFormatPicker.month ?
                                <>{"BÁO CÁO THEO LOẠI SẢN PHẨM THÁNG " + moment(this.inputSearch.start_date).format("MM/YYYY")}</>
                                :
                                (this.state.typeDate == eFormatPicker.year ?
                                    <>{"BÁO CÁO THEO LOẠI SẢN PHẨM " + moment(this.inputSearch.start_date).format("YYYY")}</>
                                    : <> BÁO CÁO THEO LOẠI SẢN PHẨM</>)
                            )
                        }
                    </h2>
                    <Table
                        // sticky
                        className="centerTable"
                        loading={!this.state.isLoadDone}
                        size={'small'}
                        bordered={true}
                        dataSource={liststatisticOfDrinkType}
                        columns={columns}
                        pagination={false}
                    />
                </div>
            </Card>
        )
    }
}