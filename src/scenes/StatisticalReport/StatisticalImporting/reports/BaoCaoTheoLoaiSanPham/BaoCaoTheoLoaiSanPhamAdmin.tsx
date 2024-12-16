import * as React from 'react';
import ActionExport from "@src/components/ActionExport";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { Button, Card, Col, Modal, Row, Table, message } from "antd";
import { stores } from '@src/stores/storeInitializer';
import { valueOfeDrinkType } from '@src/lib/enumconst';
import { L } from '@lib/abpUtility';
import AppConsts, { cssColResponsiveSpan } from '@src/lib/appconst';
import { eFormatPicker } from '@src/components/Manager/StatisticSearch';
import moment from 'moment';
import { BarChartOutlined } from '@ant-design/icons';
import BarchartReport, { DataBarchart } from '../../Chart/BarchartReport';
import { StatisticOfDrinkTypeDto } from '@src/services/services_autogen';
import StatisticSearchByAdmin from '@src/components/Manager/StatisticSearchByAdmin';
import { SearchInputAdmin } from '@src/stores/statisticStore';

export default class BaoCaoTheoLoaiSanPhamAdmin extends AppComponentBase {
    componentRef: any | null = null;

    state = {
        isLoadDone: true,
        isVisibleModelDetailMemberList: false,
        skipCount: 0,
        currentPage: 1,
        pageSize: 10,
        isHeaderReport: false,
        visibleBarchart: false,
        typeDate: undefined,
        noScrollReport: false,
    };
    inputSearch: SearchInputAdmin = new SearchInputAdmin(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    dateTitle: string = "";
    today: Date = new Date();
    getAll = async () => {
        this.setState({ isLoadDone: false });
        await stores.statisticStore.statisticOfDrinkTypebyAdmin(this.inputSearch);
        this.setState({ isLoadDone: true })
    };
    onChangePage = async (page: number, pagesize?: number) => {
        const { liststatisticOfDrinkType } = stores.statisticStore;
        if (pagesize === undefined || isNaN(pagesize)) {
            pagesize = liststatisticOfDrinkType.length;
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
    searchStatistic(input: SearchInputAdmin) {
        this.inputSearch = input;
        this.onChangePage(1, this.state.pageSize);
    }
    visibleBarchartReport = () => {
        const { liststatisticOfDrinkType } = stores.statisticStore;
        if (liststatisticOfDrinkType[liststatisticOfDrinkType.length - 1].totalMoney > 0) {
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
        const { liststatisticOfDrinkType } = stores.statisticStore;

        const columns = [
            { title: "STT", className: "start", key: "stt", width: 50, render: (text: string, item: StatisticOfDrinkTypeDto, index: number) => <div>{this.state.pageSize! * (this.state.currentPage! - 1) + (index + 1)}</div> },
            { title: "Loại sản phẩm", key: "type", width: 200, render: (text: string, item: StatisticOfDrinkTypeDto) => <div>{valueOfeDrinkType(item.type)}</div> },
            {
                title: "Loại hình thanh toán", key: "loai_hinh_thanh_toan",
                children: [
                    { title: "Tiền mặt", width: 110, key: "cash", sorter: (a, b) => a.cash - b.cash, render: (text: string, item: StatisticOfDrinkTypeDto) => <div>{AppConsts.formatNumber(item.cash)}</div> },
                    { title: "Số lượng", key: "cash_count", width: 110, sorter: (a, b) => a.cash_count - b.cash_count, render: (text: string, item: StatisticOfDrinkTypeDto) => <div>{AppConsts.formatNumber(item.cash_count)}</div> },
                    { title: "Mã QR", width: 110, key: "moneyTransaction", sorter: (a, b) => a.moneyTransaction - b.moneyTransaction, render: (text: string, item: StatisticOfDrinkTypeDto) => <div>{AppConsts.formatNumber(item.moneyTransaction)}</div> },
                    { title: "Số lượng", key: "transaction_count", width: 110, sorter: (a, b) => a.transaction_count - b.transaction_count, render: (text: string, item: StatisticOfDrinkTypeDto) => <div>{AppConsts.formatNumber(item.transaction_count)}</div> },
                    { title: "RFID", width: 110, key: "moneyRFID", sorter: (a, b) => a.moneyRFID - b.moneyRFID, render: (text: string, item: StatisticOfDrinkTypeDto) => <div>{AppConsts.formatNumber(item.moneyRFID)}</div> },
                    { title: "Số lượng", key: "money_rfid_money", width: 110, sorter: (a, b) => a.rfid_count - b.rfid_count, render: (text: string, item: StatisticOfDrinkTypeDto) => <div>{AppConsts.formatNumber(item.rfid_count)}</div> },
                    { title: "Khuyến mãi", width: 110, key: "moneyPromo", sorter: (a, b) => a.moneyPromo - b.moneyPromo, render: (text: string, item: StatisticOfDrinkTypeDto) => 
                    <div>
                        {/* {AppConsts.formatNumber(item.moneyPromo)} */}chưa có api
                        </div> },
                    { title: "Số lượng", key: "promo_count", width: 110, sorter: (a, b) => a.promo_count - b.promo_count, render: (text: string, item: StatisticOfDrinkTypeDto) => <div>
                        {/* {AppConsts.formatNumber(item.promo_count)} */}chưa có api
                        </div> },
                ]
            },
            { title: <b>Tổng số lượng đơn hàng</b>, width: 140, key: "total_number", sorter: (a, b) => a.totalBiliing - b.totalBiliing, render: (text: string, item: StatisticOfDrinkTypeDto) => <div><b>{AppConsts.formatNumber(item.totalBiliing)}</b></div> },
            { title: <b>Tổng cộng (VNĐ)</b>, key: "total", sorter: (a, b) => a.totalMoney - b.totalMoney, width: 140, render: (text: string, item: StatisticOfDrinkTypeDto) => <div><b>{AppConsts.formatNumber(item.totalMoney)}</b></div> },
        ];

        return (
            <Card >
                <Row>
                    <Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 24)}>
                        <StatisticSearchByAdmin getTypeDate={(typeDate) => this.getTypeDate(typeDate)} onSearchStatistic={(inputSearch) => { this.searchStatistic(inputSearch) }} />
                    </Col>
                    {this.isGranted(AppConsts.Permission.Pages_Statistic_DrinkType_Export) &&
                        <Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 24)} style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "end" }}>
                            <Button type='primary' icon={<BarChartOutlined />} onClick={() => this.visibleBarchartReport()}>{(window.innerWidth >= 768) && 'Biểu đồ'}</Button>
                            <ActionExport
                                isScrollReport={async () => await this.setState({ noScrollReport: false })}
                                noScrollReport={async () => await this.setState({ noScrollReport: true })}
                                isWord={true}
                                isExcel={true}
                                idPrint={"baocaotheoloaisanpham"}
                                nameFileExport={"baocaotheoloaisanpham" + ' ' + moment().format('DD_MM_YYYY')}
                                componentRef={this.componentRef}
                            />
                        </Col>}
                </Row>
                <div id='baocaotheoloaisanpham' ref={this.setComponentRef}>
                    <h2 style={{ textAlign: 'center', paddingTop: '10px', fontWeight: 'bold' }}>
                        {this.state.typeDate == eFormatPicker.date ?
                            (!!this.inputSearch.start_date) ?

                                ((moment(this.inputSearch.start_date).format("DD/MM/YYYY") == moment(this.inputSearch.end_date).format("DD/MM/YYYY") || this.inputSearch.end_date == undefined) ?
                                    <>{"BÁO CÁO THEO LOẠI SẢN PHẨM NGÀY " + moment(this.inputSearch.start_date).format("DD/MM/YYYY")}</>
                                    :
                                    <>{"BÁO CÁO THEO LOẠI SẢN PHẨM TỪ NGÀY " + moment(this.inputSearch.start_date).format("DD/MM/YYYY") + " ĐẾN NGÀY " + moment(this.inputSearch.end_date).format("DD/MM/YYYY")}</>
                                )
                                :
                                <> BÁO CÁO THEO LOẠI SẢN PHẨM</>
                            :
                            (this.state.typeDate == eFormatPicker.month ?
                                ((moment(this.inputSearch.start_date).format("MM/YYYY") == moment(this.inputSearch.end_date).format("MM/YYYY") || this.inputSearch.end_date == undefined) ?
                                    <>{"BÁO CÁO THEO LOẠI SẢN PHẨM THÁNG " + moment(this.inputSearch.start_date).format("MM/YYYY")}</>
                                    :
                                    <>{"BÁO CÁO THEO LOẠI SẢN PHẨM TỪ THÁNG " + moment(this.inputSearch.start_date).format("MM/YYYY") + " ĐẾN THÁNG " + moment(this.inputSearch.end_date).format("MM/YYYY")}</>
                                )
                                :
                                (this.state.typeDate == eFormatPicker.year ?
                                    ((moment(this.inputSearch.start_date).format("YYYY") == moment(this.inputSearch.end_date).format("YYYY") || this.inputSearch.end_date == undefined) ?
                                        <>{"BÁO CÁO THEO LOẠI SẢN PHẨM NĂM " + moment(this.inputSearch.start_date).format("YYYY")}</>
                                        :
                                        <>{"BÁO CÁO THEO LOẠI SẢN PHẨM TỪ NĂM " + moment(this.inputSearch.start_date).format("YYYY") + " ĐẾN NĂM " + moment(this.inputSearch.end_date).format("YYYY")}</>
                                    )
                                    : <> BÁO CÁO THEO LOẠI SẢN PHẨM</>)
                            )
                        }
                    </h2>
                    <Table
                        className="centerTable"
                        loading={!this.state.isLoadDone}
                        size={'small'}
                        bordered={true}
                        dataSource={liststatisticOfDrinkType != undefined ? liststatisticOfDrinkType.slice(0, -1) : []}
                        columns={columns}
                        
                        rowKey={record => "quanlymaybannuoc_index__" + JSON.stringify(record)}
                        scroll={this.state.noScrollReport ? { x: undefined } : { x: 500 }}
                        pagination={false
                            // this.state.noScrollReport ? false : {
                            // className: "ant-table-pagination ant-table-pagination-right no-print noprintExcel ",
                            // pageSize: this.state.pageSize,
                            // total: liststatisticOfDrinkType.length - 1,
                            // current: this.state.currentPage,
                            // showTotal: (tot) => "Tổng: " + tot + "",
                            // showQuickJumper: true,
                            // showSizeChanger: true,
                            // pageSizeOptions: pageSizeOptions,
                            // onShowSizeChange(current: number, size: number) {
                            //     self.onChangePage(current, size)
                            // },
                            // onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)}
                        }
                        summary={() => (
                            <>
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0} colSpan={0}></Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} colSpan={2}><div style={{ display: "flex", justifyContent: "center" }}><b>Tổng</b></div></Table.Summary.Cell>
                                    <Table.Summary.Cell index={2}>
                                        <div style={{ display: "flex", justifyContent: "center" }}>
                                            <b>{liststatisticOfDrinkType && liststatisticOfDrinkType.length > 0 ? AppConsts.formatNumber(liststatisticOfDrinkType[liststatisticOfDrinkType.length - 1].cash) : ""}</b>
                                        </div>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={3}>
                                        <div style={{ display: "flex", justifyContent: "center" }}>
                                            <b>{liststatisticOfDrinkType && liststatisticOfDrinkType.length > 0 ? liststatisticOfDrinkType[liststatisticOfDrinkType.length - 1].cash_count : ""}</b>
                                        </div>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={4}>
                                        <div style={{ display: "flex", justifyContent: "center" }}>
                                            <b>{liststatisticOfDrinkType && liststatisticOfDrinkType.length > 0 ? AppConsts.formatNumber(liststatisticOfDrinkType[liststatisticOfDrinkType.length - 1].moneyTransaction) : ""}</b>
                                        </div>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={5}>
                                        <div style={{ display: "flex", justifyContent: "center" }}>
                                            <b>{liststatisticOfDrinkType && liststatisticOfDrinkType.length > 0 ? liststatisticOfDrinkType[liststatisticOfDrinkType.length - 1].transaction_count : ""}</b>
                                        </div>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={6}>
                                        <div style={{ display: "flex", justifyContent: "center" }}>
                                            <b>{liststatisticOfDrinkType && liststatisticOfDrinkType.length > 0 ? AppConsts.formatNumber(liststatisticOfDrinkType[liststatisticOfDrinkType.length - 1].moneyRFID) : ""}</b>
                                        </div>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={7}>
                                        <div style={{ display: "flex", justifyContent: "center" }}>
                                            <b>{liststatisticOfDrinkType && liststatisticOfDrinkType.length > 0 ? liststatisticOfDrinkType[liststatisticOfDrinkType.length - 1].rfid_count : ""}</b>
                                        </div>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={8}>
                                        <div style={{ display: "flex", justifyContent: "center" }}>
                                            <b>{liststatisticOfDrinkType && liststatisticOfDrinkType.length > 0 ? liststatisticOfDrinkType[liststatisticOfDrinkType.length - 1].totalBiliing : ""}</b>
                                        </div>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={9}>
                                        <div style={{ display: "flex", justifyContent: "center" }}>
                                            <b>{liststatisticOfDrinkType && liststatisticOfDrinkType.length > 0 ? AppConsts.formatNumber(liststatisticOfDrinkType[liststatisticOfDrinkType.length - 1].totalMoney) : ""}</b>
                                        </div>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>

                            </>
                        )}
                    />
                </div>
                {this.state.visibleBarchart &&
                    <Modal
                        visible={this.state.visibleBarchart}
                        onCancel={() => { this.setState({ visibleBarchart: false }) }}
                        footer={null}
                        width='77vw'
                        closable={true}
                        title="Biểu đồ báo cáo theo loại sản phẩm"
                    >
                        <BarchartReport
                            data={liststatisticOfDrinkType?.slice(0, -1).map(item => new DataBarchart(valueOfeDrinkType(item.type), item.cash, item.moneyTransaction, item.moneyRFID, item.cash_count, item.transaction_count, item.rfid_count,item.cash+item.moneyTransaction+item.moneyRFID))}
                            label1='Tổng tiền'
                            label2='Số lượng đơn hàng'
                            nameColumg1_1='Tiền mặt'
                            nameColumg1_2='Mã QR'
                            nameColumg1_3='Thẻ RFID'
                            nameColumg2_1='SLHD thanh toán  theo tiền mặt'
                            nameColumg2_2='SLHD thanh toán  theo mã QR'
                            nameColumg2_3='SLHD thanh toán  theo thẻ RFID'
                        />
                    </Modal>
                }
            </Card >
        )
    }
}