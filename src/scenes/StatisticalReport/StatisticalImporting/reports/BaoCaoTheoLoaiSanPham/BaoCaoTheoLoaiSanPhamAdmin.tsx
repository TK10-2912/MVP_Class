import * as React from 'react';
import ActionExport from "@src/components/ActionExport";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { Button, Card, Col, Modal, Row, Table, message } from "antd";
import { stores } from '@src/stores/storeInitializer';
import { valueOfeDrinkType } from '@src/lib/enumconst';
import { L } from '@lib/abpUtility';
import AppConsts, { cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import { eFormatPicker } from '@src/components/Manager/StatisticSearch';
import moment from 'moment';
import { BarChartOutlined } from '@ant-design/icons';
import BarchartReport, { DataBarchart } from '../../Chart/BarchartReport';
import StatisticSearchByAdmin from '@src/components/Manager/StatisticSearchByAdmin';
import { SearchInputAdmin } from '@src/stores/statisticStore';
import { StatisticBillingOfProductDto, ThongKeTongQuanDoanhSoTheoSanPhamDto } from '@src/services/services_autogen';

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
        await stores.statisticStore.thongKeTongQuanDoanhSoTheoSanPham(this.inputSearch.gr_ma_id,this.inputSearch.start_date,this.inputSearch.end_date,this.inputSearch.ma_id_list,this.inputSearch.fieldSort,this.inputSearch.sort);
        this.setState({ isLoadDone: true })
    };
    onChangePage = async (page: number, pagesize?: number) => {
        const { thongkedoanhthutheosanpham } = stores.statisticStore;
        if (pagesize === undefined || isNaN(pagesize)) {
            pagesize = thongkedoanhthutheosanpham.length;
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
        const { thongkedoanhthutheosanpham } = stores.statisticStore;
        if (thongkedoanhthutheosanpham.length > 0) {
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
        const { thongkedoanhthutheosanpham, totalThongKeTheoSanPham } = stores.statisticStore;

        const columns = [
            { title: "STT", className: "start", key: "stt", width: 50, render: (text: string, item: ThongKeTongQuanDoanhSoTheoSanPhamDto, index: number) => <div>{this.state.pageSize! * (this.state.currentPage! - 1) + (index + 1)}</div> },
            { title: "Tên sản phẩm", key: "pr_name", render: (text: string, item: ThongKeTongQuanDoanhSoTheoSanPhamDto) => <div>{item.tenSanPham}</div> },
            { title: "Mã sản phẩm", key: "pr_code", render: (text: string, item: ThongKeTongQuanDoanhSoTheoSanPhamDto) => <div>{item.maSanPham}</div> },
            { title: "Ảnh sản phẩm", key: "pr_image", render: (text: string, item: ThongKeTongQuanDoanhSoTheoSanPhamDto) => <div>{item.anhSanPham}</div> },
            { title: <b>Số lượng sản phẩm</b>, key: "pr_number", sorter: (a, b) => a.soLuongSanPham - b.soLuongSanPham, render: (text: string, item: ThongKeTongQuanDoanhSoTheoSanPhamDto) => <div><b>{item.soLuongSanPham}</b></div> },
            { title: <b>Doanh thu (VNĐ)</b>, key: "total", sorter: (a, b) => a.doanhThu - b.doanhThu, render: (text: string, item: ThongKeTongQuanDoanhSoTheoSanPhamDto) => <div><b>{AppConsts.formatNumber(item.doanhThu)}</b></div> },
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
                        dataSource={thongkedoanhthutheosanpham != undefined ? thongkedoanhthutheosanpham: []}
                        columns={columns}
                        rowKey={record => "quanlymaybannuoc_index__" + JSON.stringify(record)}
                        scroll={this.state.noScrollReport ? { x: undefined } : { x: 500 }}
                        pagination={{
                            className: "ant-table-pagination ant-table-pagination-right no-print noprintExcel ",
                            pageSize: this.state.pageSize,
                            total: totalThongKeTheoSanPham - 1,
                            current: this.state.currentPage,
                            showTotal: (tot) => "Tổng: " + tot + "",
                            showQuickJumper: true,
                            showSizeChanger: true,
                            pageSizeOptions: pageSizeOptions,
                            onShowSizeChange(current: number, size: number) {
                                self.onChangePage(current, size)
                            },
                            onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)}
                        }
                        // summary={() => (
                        //     <>
                        //         <Table.Summary.Row>
                        //             <Table.Summary.Cell index={0} colSpan={0}></Table.Summary.Cell>
                        //             <Table.Summary.Cell index={1} colSpan={2}><div style={{ display: "flex", justifyContent: "center" }}><b>Tổng</b></div></Table.Summary.Cell>
                        //             <Table.Summary.Cell index={2}>
                        //                 <div style={{ display: "flex", justifyContent: "center" }}>
                        //                     <b>{liststatisticOfDrinkType && liststatisticOfDrinkType.length > 0 ? AppConsts.formatNumber(liststatisticOfDrinkType[liststatisticOfDrinkType.length - 1].cash) : ""}</b>
                        //                 </div>
                        //             </Table.Summary.Cell>
                        //             <Table.Summary.Cell index={3}>
                        //                 <div style={{ display: "flex", justifyContent: "center" }}>
                        //                     <b>{liststatisticOfDrinkType && liststatisticOfDrinkType.length > 0 ? liststatisticOfDrinkType[liststatisticOfDrinkType.length - 1].cash_count : ""}</b>
                        //                 </div>
                        //             </Table.Summary.Cell>
                        //             <Table.Summary.Cell index={4}>
                        //                 <div style={{ display: "flex", justifyContent: "center" }}>
                        //                     <b>{liststatisticOfDrinkType && liststatisticOfDrinkType.length > 0 ? AppConsts.formatNumber(liststatisticOfDrinkType[liststatisticOfDrinkType.length - 1].moneyTransaction) : ""}</b>
                        //                 </div>
                        //             </Table.Summary.Cell>
                        //             <Table.Summary.Cell index={5}>
                        //                 <div style={{ display: "flex", justifyContent: "center" }}>
                        //                     <b>{liststatisticOfDrinkType && liststatisticOfDrinkType.length > 0 ? liststatisticOfDrinkType[liststatisticOfDrinkType.length - 1].transaction_count : ""}</b>
                        //                 </div>
                        //             </Table.Summary.Cell>
                        //             <Table.Summary.Cell index={6}>
                        //                 <div style={{ display: "flex", justifyContent: "center" }}>
                        //                     <b>{liststatisticOfDrinkType && liststatisticOfDrinkType.length > 0 ? AppConsts.formatNumber(liststatisticOfDrinkType[liststatisticOfDrinkType.length - 1].moneyRFID) : ""}</b>
                        //                 </div>
                        //             </Table.Summary.Cell>
                        //             <Table.Summary.Cell index={7}>
                        //                 <div style={{ display: "flex", justifyContent: "center" }}>
                        //                     <b>{liststatisticOfDrinkType && liststatisticOfDrinkType.length > 0 ? liststatisticOfDrinkType[liststatisticOfDrinkType.length - 1].rfid_count : ""}</b>
                        //                 </div>
                        //             </Table.Summary.Cell>
                        //             <Table.Summary.Cell index={8}>
                        //                 <div style={{ display: "flex", justifyContent: "center" }}>
                        //                     <b>{liststatisticOfDrinkType && liststatisticOfDrinkType.length > 0 ? liststatisticOfDrinkType[liststatisticOfDrinkType.length - 1].totalBiliing : ""}</b>
                        //                 </div>
                        //             </Table.Summary.Cell>
                        //             <Table.Summary.Cell index={9}>
                        //                 <div style={{ display: "flex", justifyContent: "center" }}>
                        //                     <b>{liststatisticOfDrinkType && liststatisticOfDrinkType.length > 0 ? AppConsts.formatNumber(liststatisticOfDrinkType[liststatisticOfDrinkType.length - 1].totalMoney) : ""}</b>
                        //                 </div>
                        //             </Table.Summary.Cell>
                        //         </Table.Summary.Row>

                        //     </>
                        // )}
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
                            // data={listBillingOfDrinkProduct?.slice(0, -1).map(item => new DataBarchart(valueOfeDrinkType(item.type), item.cash, item.moneyTransaction, item.moneyRFID, item.cash_count, item.transaction_count, item.rfid_count,item.cash+item.moneyTransaction+item.moneyRFID))}
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