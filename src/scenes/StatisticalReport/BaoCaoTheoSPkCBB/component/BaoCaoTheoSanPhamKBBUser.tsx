import { BarChartOutlined } from '@ant-design/icons';
import ActionExport from "@src/components/ActionExport";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { eFormatPicker } from '@src/components/Manager/StatisticSearch';
import StatisticSearchProductAdmin from '@src/components/Manager/StatisticSearchProductAdmin';
import { cssColResponsiveSpan } from '@src/lib/appconst';
import { SORT, StatisticBillingOfProductDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Modal, Row, Tabs, message } from "antd";
import moment from 'moment';
import BarchartReport, { DataBarchart } from '../../StatisticalImporting/Chart/BarchartReport';
import BaoCaoSanPhamTheoMay from '../../StatisticalImporting/reports/BaoCaoSanPhamTheoMay';
import TableStaticReport from '../../StatisticalImporting/reports/TableStaticReport';
import * as React from 'react';
import { L } from '@src/lib/abpUtility';
import StatisticSearchProduct from '@src/components/Manager/StatisticSearchProduct';
import { SorterResult } from 'antd/lib/table/interface';
import { eSort } from '@src/lib/enumconst';
import { SearchBillingOfProductWithMachine, SearchInputUser } from '@src/stores/statisticStore';
import { unzipSync } from 'zlib';

const { TabPane } = Tabs;

export default class BaoCaoTheoSanPhamKhongCoBaoBiUser extends AppComponentBase {
    componentRefDrink: any | null = null;
    componentRefFreshDrink: any | null = null;
    componentRef: any | null = null;


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
        sort: SORT._1,
        noScroll: false,
    };
    inputSearchProduct: SearchBillingOfProductWithMachine = new SearchBillingOfProductWithMachine(undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    inputSearch: SearchInputUser = new SearchInputUser(undefined, undefined, undefined, undefined, undefined, undefined);
    productCount: number = 0;
    selectedField: string = "";

    componentDidMount() {
        this.getAll();
        const { listBillingOfFreshProduct } = stores.statisticStore;
        this.productCount = listBillingOfFreshProduct.length;
    }
    getAll = async () => {
        this.setState({ isLoadDone: false });
        if (!!this.inputSearchProduct.product_key) {
            await stores.statisticStore.statisticBillingOfProductWithMachine(this.inputSearchProduct);
            this.setState({ visibleBaoCaoSanPhamTheoMay: true });
        }
        else {
            this.inputSearch.end_date = this.inputSearchProduct.end_date;
            this.inputSearch.start_date = this.inputSearchProduct.start_date;
            this.inputSearch.fieldSort = this.inputSearchProduct.fieldSort;
            this.inputSearch.gr_ma_id = this.inputSearchProduct.gr_ma_id;
            this.inputSearch.ma_id_list = this.inputSearchProduct.ma_id_list;
            this.inputSearch.sort = this.inputSearchProduct.sort;
            await stores.statisticStore.statisticBillingOfProduct(this.inputSearch);
            this.setState({ visibleBaoCaoSanPhamTheoMay: false });
        }
        this.setState({ isLoadDone: true })
    };
    onChangePage = async (page: number, pagesize?: number) => {
        const { listBillingOfFreshProduct } = stores.statisticStore;
        if (pagesize === undefined || isNaN(pagesize)) {
            pagesize = listBillingOfFreshProduct.length;
            page = 1;
        }
        await this.setState({ pageSize: pagesize! });
        await this.setState({ currentPage: page }, async () => {
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
    onSearchStatistic = (input: SearchBillingOfProductWithMachine) => {
        this.inputSearchProduct = input;
        this.onChangePage(1, this.state.pageSize);
    }
    visibleBarchartReportTab1 = () => {
        const { listBillingOfFreshProduct } = stores.statisticStore;
        if (listBillingOfFreshProduct.length > 0) {
            this.setState({ visibleBarchartTab1: true });
        }
        else
            message.info("Không có dữ liệu");
    }
    setComponentRef = (ref) => {
        this.setState({ isLoadDone: false });
        this.componentRef = ref;
        this.setState({ isLoadDone: true });
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
    changeColumnSort = async (sort: SorterResult<StatisticBillingOfProductDto> | SorterResult<StatisticBillingOfProductDto>[]) => {
        this.setState({ isLoadDone: false });
        this.selectedField = sort['columnKey'];
        await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
        await this.getAll();
        this.setState({ isLoadDone: true });
    }
    render() {
        const { listBillingOfFreshProduct } = stores.statisticStore;

        let self = this;
        return (
            <>
                <Card >
                    <Row>
                        <Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 24)}>
                            <StatisticSearchProduct getTypeDate={this.getTypeDate} onSearchStatistic={(input) => { this.onSearchStatistic(input) }} />
                        </Col>
                    </Row>
                    <div>
                        <h2 style={{ textAlign: 'center', paddingTop: '10px' }}>
                            {this.state.visibleBaoCaoSanPhamTheoMay ?
                                <BaoCaoSanPhamTheoMay typeDate={this.state.typeDate} inputSearch={this.inputSearch} getAll={this.getAll} />
                                :
                                <>
                                    <Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 24)} style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "end" }}>
                                        <Button type='primary' icon={<BarChartOutlined />} onClick={() => this.visibleBarchartReportTab2()}>{(window.innerWidth >= 782) && 'Biểu đồ'}</Button>
                                        <ActionExport
                                            isWord={true}
                                            isExcel={true}
                                            idPrint={"baocaosanphamkhongcobaobi"}
                                            nameFileExport={this.state.visibleBaoCaoSanPhamTheoMay ? "baocaosanphamkhongcobaobi" + ' ' + moment().format('DD_MM_YYYY') : "baocaotheosanpham" + ' ' + moment().format('DD_MM_YYYY')}
                                            componentRef={this.componentRef}
                                            noScrollReport={async () => { await this.setState({ noScroll: true }) }}
                                            isScrollReport={async () => { await this.setState({ noScroll: false }) }}
                                        />
                                    </Col>
                                    <div id='baocaosanphamkhongcobaobi' ref={this.setComponentRef}>
                                        <h3 style={{ textAlign: 'center', paddingTop: '10px' }}>
                                            {
                                                (this.state.typeDate == eFormatPicker.month ?
                                                    <>{"BÁO CÁO THEO SẢN PHẨM CÓ KHÔNG BAO BÌ THÁNG " + moment(this.inputSearch.start_date).format("MM/YYYY")}</>
                                                    :
                                                    (this.state.typeDate == eFormatPicker.year ?
                                                        <>{"BÁO CÁO THEO SẢN PHẨM KHÔNG CÓ BAO BÌ NĂM " + moment(this.inputSearch.start_date).format("YYYY")}</>
                                                        : <> BÁO CÁO THEO SẢN PHẨM KHÔNG CÓ BAO BÌ</>)
                                                )
                                            }
                                        </h3>
                                        <TableStaticReport
                                            changeColumnSort={this.changeColumnSort}
                                            type='(ml)' isPrint={this.state.noScroll}
                                            listBillingOfDrinkProduct={listBillingOfFreshProduct}
                                            pagination={this.state.noScroll ? false : {
                                                className: "ant-table-pagination ant-table-pagination-right no-print noprintExcel ",
                                                pageSize: this.state.pageSize,
                                                total: this.productCount,
                                                current: this.state.currentPage,
                                                showTotal: (tot) => "Tổng: " + tot + "",
                                                showQuickJumper: true,
                                                showSizeChanger: true,
                                                pageSizeOptions: ['10', '20', '50', '100', this.L('All')],
                                                onShowSizeChange(current: number, size: number) {
                                                    self.onChangePage(current, size)
                                                },
                                                onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
                                            }} />
                                    </div>

                                </>
                            }
                        </h2>

                    </div>
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