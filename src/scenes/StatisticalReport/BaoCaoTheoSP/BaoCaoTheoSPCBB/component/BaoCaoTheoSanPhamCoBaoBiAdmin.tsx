import { BarChartOutlined } from '@ant-design/icons';
import ActionExport from "@src/components/ActionExport";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { eFormatPicker } from '@src/components/Manager/StatisticSearch';
import StatisticSearchProductAdmin from '@src/components/Manager/StatisticSearchProductAdmin';
import AppConsts, { cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import { SORT, StatisticBillingOfProductDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Modal, Row, message } from "antd";
import moment from 'moment';
import BarchartReport, { DataBarchart } from '../../../StatisticalImporting/Chart/BarchartReport';
import BaoCaoSanPhamTheoMay from '../../../StatisticalImporting/reports/BaoCaoSanPhamTheoMay';
import * as React from 'react';
import { isGranted, L } from '@src/lib/abpUtility';
import { SorterResult } from 'antd/lib/table/interface';
import { eSort } from '@src/lib/enumconst';
import { SearchBillingOfProductWithMachineAdmin, SearchInputAdmin } from '@src/stores/statisticStore';
import TableStaticReportProduct from '@src/scenes/StatisticalReport/StatisticalImporting/reports/TableStaticReportProduct';

export default class BaoCaoTheoSanPhamCoBaoBiAdmin extends AppComponentBase {
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
        sort: SORT._1,
        skipCountMachine: 0,
        currentPageMachine: 1,
        pageSizeMachine: 10,
    };
    inputSearchProduct: SearchBillingOfProductWithMachineAdmin = new SearchBillingOfProductWithMachineAdmin(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, this.state.skipCount, this.state.pageSize);
    inputSearch: SearchInputAdmin = new SearchInputAdmin(undefined, undefined, undefined, undefined, undefined, undefined, undefined, this.state.skipCount, this.state.pageSize);
    selectedField: string = "";

    async componentDidMount() {
        await this.getAll();
    }
    getAll = async () => {
        this.setState({ isLoadDone: false });
        if (!!this.inputSearchProduct.product_key) {
            this.inputSearchProduct.skipCount = this.state.skipCountMachine!;
            this.inputSearchProduct.maxResult = this.state.pageSizeMachine!;
            await stores.statisticStore.statisticBillingOfProductWithMachinebyAdmin(this.inputSearchProduct);
            this.setState({ visibleBaoCaoSanPhamTheoMay: true });
        }
        else {
            this.inputSearch.us_id = this.inputSearchProduct.us_id;
            this.inputSearch.end_date = this.inputSearchProduct.end_date;
            this.inputSearch.start_date = this.inputSearchProduct.start_date;
            this.inputSearch.gr_ma_id = this.inputSearchProduct.gr_ma_id;
            this.inputSearch.ma_id_list = this.inputSearchProduct.ma_id_list;
            this.inputSearch.sort = this.state.sort;
            this.inputSearch.fieldSort = this.selectedField;
            this.inputSearch.skipCount = this.state.skipCount;
            this.inputSearch.maxResult = this.state.pageSize;
            await stores.statisticStore.statisticBillingOfDrinkProductByAdmin(this.inputSearch);
            this.setState({ visibleBaoCaoSanPhamTheoMay: false });
        }
        this.setState({ isLoadDone: true })
    };
    onChangePage = async (page: number, pagesize?: number) => {
        if (pagesize !== undefined) {
            await this.setState({ pageSize: pagesize! });
        }
        this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            this.getAll();
        })
    }
    onChangePageMachine = async (page: number, pagesize?: number) => {
        if (pagesize !== undefined) {
            await this.setState({ pageSizeMachine: pagesize! });
        }
        this.setState({ skipCountMachine: (page - 1) * this.state.pageSizeMachine, currentPageMachine: page }, async () => {
            this.getAll();
        })
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
    changeColumnSort = async (sort: SorterResult<StatisticBillingOfProductDto> | SorterResult<StatisticBillingOfProductDto>[]) => {
        this.setState({ isLoadDone: false });
        this.selectedField = sort['columnKey'];
        await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
        await this.getAll();
        this.setState({ isLoadDone: true });
    }
    render() {
        const { listBillingOfDrinkProduct, totalBillingStatistic, listBillingOfProductWithMachine } = stores.statisticStore;

        let self = this;
        return (
            <Card >
                <Row>
                    <Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 24)}>
                        <StatisticSearchProductAdmin getTypeDate={this.getTypeDate} onSearchStatistic={(input) => { this.onSearchStatistic(input) }} />
                    </Col>
                </Row>
                <div>
                    {this.state.visibleBaoCaoSanPhamTheoMay ?
                        <BaoCaoSanPhamTheoMay
                            typeDate={this.state.typeDate}
                            inputSearch={this.inputSearch}
                            pagination={{
                                className: "ant-table-pagination ant-table-pagination-right no-print noprintExcel ",
                                position: ["topRight"],
                                pageSize: this.state.pageSizeMachine,
                                total: totalBillingStatistic,
                                current: this.state.currentPageMachine,
                                showTotal: (tot) => "Tổng: " + tot,
                                showQuickJumper: true,
                                showSizeChanger: true,
                                pageSizeOptions: pageSizeOptions,
                                onShowSizeChange(current: number, size: number) {
                                    self.onChangePageMachine(current, size)
                                },
                                onChange: (page: number, pagesize?: number) => self.onChangePageMachine(page, pagesize)
                            }}
                            listBillingOfProductWithMachine={listBillingOfProductWithMachine} />
                        :
                        <>
                            {isGranted(AppConsts.Permission.Pages_Statistic_Drink_Export) &&
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
                                        idFooter='TableStaticReportProduct'
                                    />
                                </Col>
                            }
                            <div id='baocaosanphamcobaobi' ref={this.setComponentRefDrink}>
                                <h2 style={{ textAlign: 'center', paddingTop: '10px', }}>
                                    <strong>
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
                                                                ? <>{"BÁO CÁO THEO SẢN PHẨM CÓ BAO BÌ NGÀY " + formattedStartDate}</>
                                                                : <>{"BÁO CÁO THEO SẢN PHẨM CÓ BAO BÌ TỪ NGÀY " + formattedStartDate + " ĐẾN NGÀY " + formattedEndDate}</>
                                                        );
                                                    }
                                                } else if (typeDate === eFormatPicker.month) {
                                                    // Báo cáo theo tháng
                                                    if (!!start_date) {
                                                        return (
                                                            formattedStartMonth === formattedEndMonth || end_date === undefined
                                                                ? <>{"BÁO CÁO THEO SẢN PHẨM CÓ BAO BÌ THÁNG " + formattedStartMonth}</>
                                                                : <>{"BÁO CÁO THEO SẢN PHẨM CÓ BAO BÌ TỪ THÁNG " + formattedStartMonth + " ĐẾN THÁNG " + formattedEndMonth}</>
                                                        );
                                                    }
                                                } else if (typeDate === eFormatPicker.year) {
                                                    // Báo cáo theo năm
                                                    if (!!start_date) {
                                                        return (
                                                            formattedStartYear === formattedEndYear || end_date === undefined
                                                                ? <>{"BÁO CÁO THEO SẢN PHẨM CÓ BAO BÌ NĂM " + formattedStartYear}</>
                                                                : <>{"BÁO CÁO THEO SẢN PHẨM CÓ BAO BÌ TỪ NĂM " + formattedStartYear + " ĐẾN NĂM " + formattedEndYear}</>
                                                        );
                                                    }
                                                }

                                                return <> BÁO CÁO THEO SẢN PHẨM CÓ BAO BÌ</>;
                                            })()
                                        }
                                    </strong></h2>
                                {listBillingOfDrinkProduct.length > 0 &&
                                    <TableStaticReportProduct
                                        changeColumnSort={this.changeColumnSort}
                                        type=''
                                        isPrint={this.state.noScroll}
                                        listBillingOfDrinkProduct={listBillingOfDrinkProduct}
                                        pagination={this.state.noScroll ? false : {
                                            className: "ant-table-pagination ant-table-pagination-right no-print noprintExcel ",
                                            position: ["topRight"],
                                            pageSize: this.state.pageSize,
                                            total: totalBillingStatistic,
                                            current: this.state.currentPage,
                                            showTotal: (tot) => "Tổng: " + tot,
                                            showQuickJumper: true,
                                            showSizeChanger: true,
                                            pageSizeOptions: pageSizeOptions,
                                            onShowSizeChange(current: number, size: number) {
                                                self.onChangePage(current, size)
                                            },
                                            onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
                                        }}
                                    />
                                }
                            </div>
                        </>
                    }
                </div>
                {this.state.visibleBarchartTab1 &&
                    <Modal
                        visible={this.state.visibleBarchartTab1}
                        onCancel={() => { this.setState({ visibleBarchartTab1: false }) }}
                        footer={null}
                        width='90vw'
                        closable={true}
                        title="Biểu đồ báo cáo theo sản phẩm có bao bì"
                    >
                        <BarchartReport
                            data={listBillingOfDrinkProduct?.map(item => new DataBarchart(item.productname, item.cash, item.moneyQr, item.moneyRFID, item.cash_quantity, item.qr_quantity, item.rfid_quantity, item.cash + item.moneyQr + item.moneyRFID))}
                            label1='Tổng tiền'
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
        )
    }
}