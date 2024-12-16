import * as React from 'react';
import ActionExport from "@src/components/ActionExport";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { Card, Col, Row } from "antd";
import { stores } from '@src/stores/storeInitializer';
import { isGranted, L } from '@lib/abpUtility';
import moment from 'moment';
import { SearchStatisticImportSellRemainProductByAdmin } from '@src/stores/statisticStore';
import SearchThongKeBienDongSanPham from '@src/components/Manager/SearchThongKeBienDongSanPhamCuaMay';
import TableHoatDongMayBanNuocAdmin from './TableHoatDongMayBanNuocAdmin';
import AppConsts, { pageSizeOptions } from '@src/lib/appconst';

export default class BaoCaoHoatDongMayBanNuocAdmin extends AppComponentBase {
    componentRef: any | null = null;
    state = {
        isLoadDone: true,
        skipCount: 0,
        currentPage: 1,
        pageSize: 10,
        isHeaderReport: false,
        typeDate: "",
        noScrollReport: false,
    };
    inputSearch: SearchStatisticImportSellRemainProductByAdmin = new SearchStatisticImportSellRemainProductByAdmin(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    lastitem: number;
    dateTitle: string = "";
    today: Date = new Date();

    searchStatistic(input: SearchStatisticImportSellRemainProductByAdmin) {
        this.inputSearch = input;
        this.onChangePage(1, this.state.pageSize);
    }
    getAll = async () => {
        this.setState({ isLoadDone: false });
        this.inputSearch.skipCount = this.state.skipCount!;
        this.inputSearch.maxResult = this.state.pageSize!;
        await stores.statisticStore.statisticImportSellRemainProductByAdmin(this.inputSearch)
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
        const { listImportSellRemainProductByAdmin, totalCountRemainProduct } = stores.statisticStore;
        const newList = listImportSellRemainProductByAdmin.slice(0, -1);
        let dateRangeText = "";
        const { start_date, end_date } = this.inputSearch;
        if (start_date && end_date) {
            const type = this.state.typeDate;
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
            <Card >
                <Row >
                    <Col span={24}>
                        <SearchThongKeBienDongSanPham getTypeDate={this.getTypeDate} onSearchStatistic={(value) => this.searchStatistic(value)}></SearchThongKeBienDongSanPham>
                    </Col>
                    {isGranted(AppConsts.Permission.Pages_Statistic_ImportSellRemainProduct_Export) &&
                        <Col span={24}>
                            <ActionExport
                                isScrollReport={async () => await this.setState({ noScrollReport: false })}
                                noScrollReport={async () => await this.setState({ noScrollReport: true })}
                                isWord={true}
                                isExcel={true}
                                idPrint={"baocaohoatdongmaybannuoc"}
                                nameFileExport={"baocaohoatdongmaybannuoc " + moment().format('DD_MM_YYYY')}
                                componentRef={this.componentRef}
                            />
                        </Col>
                    }
                    <Col style={{ textAlign: "center" }} span={24}>
                        <h2 style={{ textAlign: 'center', fontWeight: 'bold' }}>
                            {"BÁO CÁO HOẠT ĐỘNG MÁY BÁN NƯỚC "}
                            {dateRangeText}
                        </h2>
                    </Col>
                </Row>
                <div id='baocaohoatdongmaybannuoc' ref={this.setComponentRef}>
                    <TableHoatDongMayBanNuocAdmin
                        listStatistic={newList}
                        totalSatistic={listImportSellRemainProductByAdmin[listImportSellRemainProductByAdmin.length - 1]}
                        is_print={this.state.noScrollReport}
                        pagination={!this.state.noScrollReport ? {
                            position: ['topRight'],
                            pageSize: this.state.pageSize,
                            total: totalCountRemainProduct! > 0 ? totalCountRemainProduct! - 1 : 0,
                            current: this.state.currentPage,
                            showTotal: (tot) => "Tổng: " + tot + "",
                            showQuickJumper: true,
                            showSizeChanger: true,
                            pageSizeOptions: pageSizeOptions,
                            onShowSizeChange(current: number, size: number) {
                                self.onChangePage(current, size)
                            },
                            onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
                        } : false}
                    />
                </div>
            </Card>
        )
    }
}