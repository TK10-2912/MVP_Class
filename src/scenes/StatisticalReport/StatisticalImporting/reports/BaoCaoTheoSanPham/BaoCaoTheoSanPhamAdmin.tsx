import { BarChartOutlined } from '@ant-design/icons';
import ActionExport from "@src/components/ActionExport";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { eFormatPicker } from '@src/components/Manager/StatisticSearch';
import StatisticSearchProductAdmin from '@src/components/Manager/StatisticSearchProductAdmin';
import { cssColResponsiveSpan } from '@src/lib/appconst';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Modal, Row, Tabs, message } from "antd";
import moment from 'moment';
import BarchartReport, { DataBarchart } from '../../Chart/BarchartReport';
import BaoCaoSanPhamTheoMay from '../BaoCaoSanPhamTheoMay';
import TableStaticReport from '../TableStaticReport';
import * as React from 'react';
import { L } from '@src/lib/abpUtility';
import { SearchBillingOfProductWithMachineAdmin, SearchInputAdmin } from '@src/stores/statisticStore';

const { TabPane } = Tabs;

export default class BaoCaoTheoSanPhamAdmin extends AppComponentBase {
    componentRefDrink: any | null = null;
    componentRefFreshDrink: any | null = null;

    state = {
        isLoadDone: true,
        skipCount: 0,
        currentPage: 1,
        pageSize: 10,
        visibleBarchartTab1: false,
        visibleBarchartTab2: false,
        productKey: undefined,
        typeDate: undefined,
        visibleBaoCaoSanPhamTheoMay: false,
        noScroll: false,
    };
    inputSearchProduct: SearchBillingOfProductWithMachineAdmin = new SearchBillingOfProductWithMachineAdmin(undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined);
    inputSearch: SearchInputAdmin = new SearchInputAdmin(undefined,undefined,undefined,undefined,undefined,undefined,undefined);
    getAll = async () => {
        this.setState({ isLoadDone: false });
        if (!!this.inputSearchProduct.product_key) {
            await stores.statisticStore.statisticBillingOfProductWithMachinebyAdmin(this.inputSearchProduct);
            this.setState({ visibleBaoCaoSanPhamTheoMay: true });
        }
        else {
            this.inputSearch.us_id = this.inputSearchProduct.us_id;
            this.inputSearch.end_date = this.inputSearchProduct.end_date;
            this.inputSearch.start_date = this.inputSearchProduct.start_date;
            this.inputSearch.fieldSort = this.inputSearchProduct.fieldSort;
            this.inputSearch.gr_ma_id = this.inputSearchProduct.gr_ma_id;
            this.inputSearch.ma_id_list = this.inputSearchProduct.ma_id_list;
            this.inputSearch.sort = this.inputSearchProduct.sort;
            await stores.statisticStore.statisticBillingOfProductbyAdmin(this.inputSearch);
            this.setState({ visibleBaoCaoSanPhamTheoMay: false });
        }
        this.setState({ isLoadDone: true })
    };
    onChangePage = async (page: number, pagesize?: number) => {
        const { listBillingOfDrinkProduct } = stores.statisticStore;
        if (pagesize === undefined || isNaN(pagesize)) {
            pagesize = listBillingOfDrinkProduct.length;
            page = 1;
        }
        await this.setState({ pageSize: pagesize! });
        await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            this.getAll();
        });
    }
    setComponentRefDrink = (ref) => {
        this.setState({ isLoadDone: false });
        this.componentRefDrink = ref;
        this.setState({ isLoadDone: true });
    }
    setComponentRefFreshDrink = (ref) => {
        this.setState({ isLoadDone: false });
        this.componentRefFreshDrink = ref;
        this.setState({ isLoadDone: true });
    }
    onSearchStatistic = (input: SearchBillingOfProductWithMachineAdmin) => {
        this.inputSearchProduct = input;
        this.onChangePage(1, this.state.pageSize);
    }
    visibleBarchartReportTab1 = () => {
        const { listBillingOfDrinkProduct } = stores.statisticStore;
        if (listBillingOfDrinkProduct.length > 0) {
            this.setState({ visibleBarchartTab1: true });
        }
        else
            message.info("Không có dữ liệu");
    }
    visibleBarchartReportTab2 = () => {
        const { listBillingOfFreshProduct } = stores.statisticStore;
        if (listBillingOfFreshProduct.length > 0) {
            this.setState({ visibleBarchartTab2: true });
        }
        else
            message.info("Không có dữ liệu");
    }
    getTypeDate = (typeDate) => {
        this.setState({ typeDate: typeDate });
    }
    render() {
        const { listBillingOfDrinkProduct, listBillingOfFreshProduct } = stores.statisticStore;
        let self = this;
        return (
            <>
                <Card >
                    <Row>
                        <Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 24)}>
                            <StatisticSearchProductAdmin getTypeDate={this.getTypeDate} onSearchStatistic={(input) => { this.onSearchStatistic(input) }} />
                        </Col>
                    </Row>
                    <div>
                        <h2 style={{ textAlign: 'center', paddingTop: '10px' }}>
                            {this.state.visibleBaoCaoSanPhamTheoMay ?
                                <BaoCaoSanPhamTheoMay typeDate={this.state.typeDate} inputSearch={this.inputSearch} getAll={this.getAll} />
                                :
                                <>
                                    <Tabs defaultActiveKey="1">
                                        <TabPane tab="Báo cáo sản phẩm có bao bì" key="1">
                                            <Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 24)} style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "end" }}>
                                                <Button type='primary' icon={<BarChartOutlined />} onClick={() => this.visibleBarchartReportTab1()}>{(window.innerWidth >= 782) && 'Biểu đồ'}</Button>
                                                <ActionExport
                                                    isWord={true}
                                                    isExcel={true}
                                                    idPrint={"baocaosanphamcobaobi"}
                                                    nameFileExport={this.state.visibleBaoCaoSanPhamTheoMay ? "baocaosanphamcobaobi" + ' ' + moment().format('DD_MM_YYYY') : "baocaosanphamcobaobi" + ' ' + moment().format('DD_MM_YYYY')}
                                                    componentRef={this.componentRefDrink}
                                                    noScrollReport={async () => { await this.setState({ noScroll: true }) }}
                                                    isScrollReport={async () => { await this.setState({ noScroll: false }) }}
                                                />
                                            </Col>
                                            <div id='baocaosanphamcobaobi' ref={this.setComponentRefDrink}>
                                                <h2 style={{ textAlign: 'center', paddingTop: '10px' }}>
                                                    {this.state.typeDate == eFormatPicker.date ?
                                                        (!!this.inputSearch.start_date) ?

                                                            ((moment(this.inputSearch.start_date).format("DD/MM/YYYY") == moment(this.inputSearch.end_date).format("DD/MM/YYYY") || this.inputSearch.end_date == undefined) ?
                                                                <>{"BÁO CÁO SẢN PHẨM CÓ BAO BÌ NGÀY " + moment(this.inputSearch.start_date).format("DD/MM/YYYY")}</>
                                                                :
                                                                <>{"BÁO CÁO THEO SẢN PHẨM CÓ BAO BÌ TỪ NGÀY " + moment(this.inputSearch.start_date).format("DD/MM/YYYY") + " ĐẾN NGÀY " + moment(this.inputSearch.end_date).format("DD/MM/YYYY")}</>
                                                            )
                                                            :
                                                            <> BÁO CÁO THEO SẢN PHẨM CÓ BAO BÌ</>
                                                        :
                                                        (this.state.typeDate == eFormatPicker.month ?
                                                            <>{"BÁO CÁO THEO SẢN PHẨM CÓ BAO BÌ THÁNG " + moment(this.inputSearch.start_date).format("MM/YYYY")}</>
                                                            :
                                                            (this.state.typeDate == eFormatPicker.year ?
                                                                <>{"BÁO CÁO THEO SẢN PHẨM CÓ BAO BÌ NĂM " + moment(this.inputSearch.start_date).format("YYYY")}</>
                                                                : <> BÁO CÁO THEO SẢN PHẨM CÓ BAO BÌ</>)
                                                        )
                                                    }
                                                </h2>
                                                <TableStaticReport
                                                    type='' isPrint={this.state.noScroll}
                                                    listBillingOfDrinkProduct={listBillingOfDrinkProduct}
                                                    pagination={this.state.noScroll ? false : {
                                                        className: "ant-table-pagination ant-table-pagination-right no-print noprintExcel ",
                                                        pageSize: this.state.pageSize,
                                                        total: listBillingOfFreshProduct.length - 1,
                                                        current: this.state.currentPage,
                                                        showTotal: (tot) => "Tổng: " + tot + "",
                                                        showQuickJumper: true,
                                                        showSizeChanger: true,
                                                        pageSizeOptions: ['10', '20', '50', '100', L('All')],
                                                        onShowSizeChange(current: number, size: number) {
                                                            self.onChangePage(current, size)
                                                        },
                                                        onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
                                                    }} />
                                            </div>
                                        </TabPane>
                                        <TabPane tab="Báo cáo sản phẩm không có bao bì" key="2">
                                            <Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 24)} style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "end" }}>
                                                <Button type='primary' icon={<BarChartOutlined />} onClick={() => this.visibleBarchartReportTab2()}>{(window.innerWidth >= 782) && 'Biểu đồ'}</Button>
                                                <ActionExport
                                                    isWord={true}
                                                    isExcel={true}
                                                    idPrint={"baocaosanphamkhongcobaobi"}
                                                    nameFileExport={this.state.visibleBaoCaoSanPhamTheoMay ? "baocaosanphamkhongcobaobi" + ' ' + moment().format('DD_MM_YYYY') : "baocaotheosanpham" + ' ' + moment().format('DD_MM_YYYY')}
                                                    componentRef={this.componentRefFreshDrink}
                                                    noScrollReport={async () => { await this.setState({ noScroll: true }) }}
                                                    isScrollReport={async () => { await this.setState({ noScroll: false }) }}
                                                />
                                            </Col>
                                            <div id='baocaosanphamkhongcobaobi' ref={this.setComponentRefFreshDrink}>
                                                <h2 style={{ textAlign: 'center', paddingTop: '10px' }}>
                                                    {this.state.typeDate == eFormatPicker.date ?
                                                        (!!this.inputSearch.start_date) ?

                                                            ((moment(this.inputSearch.start_date).format("DD/MM/YYYY") == moment(this.inputSearch.end_date).format("DD/MM/YYYY") || this.inputSearch.end_date == undefined) ?
                                                                <>{"BÁO CÁO SẢN PHẨM KHÔNG CÓ BAO BÌ NGÀY " + moment(this.inputSearch.start_date).format("DD/MM/YYYY")}</>
                                                                :
                                                                <>{"BÁO CÁO THEO SẢN PHẨM KHÔNG CÓ BAO BÌ TỪ NGÀY " + moment(this.inputSearch.start_date).format("DD/MM/YYYY") + " ĐẾN NGÀY " + moment(this.inputSearch.end_date).format("DD/MM/YYYY")}</>
                                                            )
                                                            :
                                                            <> BÁO CÁO THEO SẢN PHẨM CÓ BAO BÌ</>
                                                        :
                                                        (this.state.typeDate == eFormatPicker.month ?
                                                            <>{"BÁO CÁO THEO SẢN PHẨM CÓ KHÔNG BAO BÌ THÁNG " + moment(this.inputSearch.start_date).format("MM/YYYY")}</>
                                                            :
                                                            (this.state.typeDate == eFormatPicker.year ?
                                                                <>{"BÁO CÁO THEO SẢN PHẨM KHÔNG CÓ BAO BÌ NĂM " + moment(this.inputSearch.start_date).format("YYYY")}</>
                                                                : <> BÁO CÁO THEO SẢN PHẨM KHÔNG CÓ BAO BÌ</>)
                                                        )
                                                    }
                                                </h2>
                                                <TableStaticReport
                                                    type=' (ml)' isPrint={this.state.noScroll}
                                                    listBillingOfDrinkProduct={listBillingOfFreshProduct}
                                                    pagination={this.state.noScroll ? false : {
                                                        className: "ant-table-pagination ant-table-pagination-right no-print noprintExcel ",
                                                        pageSize: this.state.pageSize,
                                                        total: listBillingOfFreshProduct.length - 1,
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
                                                />
                                            </div>
                                        </TabPane>
                                    </Tabs>
                                </>
                            }
                        </h2>

                    </div>
                    {this.state.visibleBarchartTab1 &&
                        <Modal
                            visible={this.state.visibleBarchartTab1}
                            onCancel={() => { this.setState({ visibleBarchartTab1: false }) }}
                            footer={null}
                            width='77vw'
                            closable={true}
                            title="Biểu đồ báo cáo theo sản phẩm có bao bì"
                        >
                            <BarchartReport
                                data={listBillingOfDrinkProduct?.map(item => new DataBarchart(item.productname, item.cash, item.moneyQr, item.moneyRFID, item.cash_quantity, item.qr_quantity, item.rfid_quantity))}
                                label1='VNĐ'
                                label2='Số lượng đơn hàng'
                                nameColumg1_1='Tiền mặt'
                                nameColumg1_2='Mã QR'
                                nameColumg1_3='Thẻ RFID'
                                nameColumg2_1='SLHD thanh toán theo tiền mặt'
                                nameColumg2_2='SLHD thanh toán theo mã QR'
                                nameColumg2_3='SLHD thanh toán theo thẻ RFID'
                            />
                        </Modal>
                    }
                    {this.state.visibleBarchartTab2 &&
                        <Modal
                            visible={this.state.visibleBarchartTab2}
                            onCancel={() => { this.setState({ visibleBarchartTab2: false }) }}
                            footer={null}
                            width='77vw'
                            closable={true}
                            title="Biểu đồ báo cáo theo sản phẩm không có bao bì"
                        >
                            <BarchartReport
                                data={listBillingOfFreshProduct?.map(item => new DataBarchart(item.productname, item.cash, item.moneyQr, item.moneyRFID, item.cash_quantity, item.qr_quantity, item.rfid_quantity))}
                                label1='VNĐ'
                                label2='Số lượng đơn hàng'
                                nameColumg1_1='Tiền mặt'
                                nameColumg1_2='Mã QR'
                                nameColumg1_3='Thẻ RFID'
                                nameColumg2_1='SLHD thanh toán theo tiền mặt'
                                nameColumg2_2='SLHD thanh toán theo mã QR'
                                nameColumg2_3='SLHD thanh toán theo thẻ RFID'
                            />
                        </Modal>
                    }
                </Card>
            </>
        )
    }
}