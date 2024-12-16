import * as React from 'react';
import ActionExport from "@src/components/ActionExport";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { Card, Col, Row, Table } from "antd";
import { stores } from '@src/stores/storeInitializer';
import { L } from '@lib/abpUtility';
import AppConsts, { cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import { StatisticOfPriceUnitDto } from '@src/services/services_autogen';
import SearchStatisticByPriceUnit from '@src/components/Manager/SearchStatisticByPriceUnit';
import moment from 'moment';
import { SearchPriceUnitInput } from '@src/stores/statisticStore';

export const eFormatPicker = {
    date: "date",
    month: "month",
    year: "year",
}
export default class BaoCaoTheoDonGia extends AppComponentBase {
    componentRef: any | null = null;
    state = {
        isLoadDone: true,
        skipCount: 0,
        currentPage: 1,
        pageSize: 10,
        isHeaderReport: false,
        typeDate: undefined,
    };
    listIdSlected: number[] = [];
    inputSearch: SearchPriceUnitInput = new SearchPriceUnitInput(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    lastitem: number;
    dateTitle: string = "";
    today: Date = new Date();
    listStatisticByPriceUnitInput: StatisticOfPriceUnitDto[] = [];

    getAll = async () => {
        this.setState({ isLoadDone: false });
        await stores.statisticStore.statisticOfPriceUnit(this.inputSearch);
        const { listStatisticOfPriceUnit } = stores.statisticStore;
        this.listStatisticByPriceUnitInput = listStatisticOfPriceUnit;
        this.setState({ isLoadDone: true })
    };

    setComponentRef = (ref) => {
        this.setState({ isLoadDone: false });
        this.componentRef = ref;
        this.setState({ isLoadDone: true });
    }
    searchStatistic(input: SearchPriceUnitInput) {
        this.inputSearch = input;
        this.getAll();
    }
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
    getTypeDate = (typeDate) => {
        this.setState({ typeDate: typeDate });
    }
    render() {
        const self = this;
        const { listStatisticOfPriceUnit } = stores.statisticStore;
        const columns = [
            { title: "STT", width: 50, key: "money", render: (text: string, item: StatisticOfPriceUnitDto, index: number) => <div>{index + 1}</div> },
            { title: "Đơn giá (VNĐ)", key: "drink_type", render: (text: string, item: StatisticOfPriceUnitDto) => <div>{AppConsts.formatNumber(item.price)}</div> },
        ];

        return (
            <Card >
                <SearchStatisticByPriceUnit getTypeDate={(typeDate) => this.getTypeDate(typeDate)} onSearchStatistic={(input) => this.searchStatistic(input)}
                ></SearchStatisticByPriceUnit>
                <Row gutter={[16, 16]}>
                    <Col {...cssColResponsiveSpan(24, 18, 18, 12, 12, 12)} style={{ textAlign: "left" }}>
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 24, 24, 12, 12, 12)} className='textAlign-col-992'>
                        <ActionExport
                            isWord={true}
                            isExcel={true}
                            idPrint={"baocaotheochepham"}
                            nameFileExport={"baocaotheochepham" + ' ' + moment().format('DD_MM_YYYY')}
                            componentRef={this.componentRef}
                        />
                    </Col>
                </Row>
                <div id='baocaotheochepham' ref={this.setComponentRef}>
                    <h2 style={{ textAlign: 'center', paddingTop: '10px', fontWeight: 'bold' }}>
                        {this.state.typeDate == eFormatPicker.date ?
                            (!!this.inputSearch.start_date && !!this.inputSearch.end_date) ?
                                ((moment(this.inputSearch.start_date).format("DD/MM/YYYY") == moment(this.inputSearch.end_date).format("DD/MM/YYYY") || this.inputSearch.end_date == undefined) ?

                                    <>{"BÁO CÁO THEO ĐƠN GIÁ NGÀY " + moment(this.inputSearch.start_date).format("DD/MM/YYYY")}</>
                                    :
                                    <>{"BÁO CÁO THEO ĐƠN GIÁ TỪ NGÀY " + moment(this.inputSearch.start_date).format("DD/MM/YYYY") + " ĐẾN NGÀY " + moment(this.inputSearch.end_date).format("DD/MM/YYYY")}</>
                                )
                                :
                                <> BÁO CÁO THEO ĐƠN GIÁ</>
                            :
                            (this.state.typeDate == eFormatPicker.month ?
                                <>{"BÁO CÁO THEO ĐƠN GIÁ THÁNG " + moment(this.inputSearch.start_date).format("MM/YYYY")}</>
                                :
                                (this.state.typeDate == eFormatPicker.year ?
                                    <>{"BÁO CÁO THEO ĐƠN GIÁ NĂM " + moment(this.inputSearch.start_date).format("YYYY")}</>
                                    : <> BÁO CÁO THEO ĐƠN GIÁ</>)
                            )
                        }
                    </h2>

                    <Table
                        // sticky
                        className="centerTable"
                        loading={!this.state.isLoadDone}
                        size={'small'}
                        bordered={true}
                        dataSource={listStatisticOfPriceUnit}
                        columns={columns}
                        pagination={{
                            position: ['topRight'],
                            className: "ant-table-pagination ant-table-pagination-right no-print noprintExcel ",
                            pageSize: this.state.pageSize,
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
                    />
                </div>
            </Card>
        )
    }
}