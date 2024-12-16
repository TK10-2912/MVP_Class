import { DeleteOutlined, ExportOutlined, SearchOutlined } from '@ant-design/icons';
import { cssCol, cssColResponsiveSpan } from '@src/lib/appconst';
import { Button, Card, Col, Row } from 'antd';
import * as React from 'react';
import TablePayments from './components/TablePayments';
import TableWatervendingmachine from './components/TableWatervendingmachine';
import SelectedGroupMachine from '@src/components/Manager/SelectedGroupMachine';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';
import { stores } from '@src/stores/storeInitializer';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import StatisticSearch from '@src/components/Manager/StatisticSearch';
import ActionExport from '@src/components/ActionExport';
import moment from 'moment';
import { SearchInputUser } from '@src/stores/statisticStore';

export default class Salesdetails extends AppComponentBase {
    componentRef: any | null = null;

    state = {
        isLoadDone: false,
        visibleModalCreateUpdate: false,
        visibleModalStatusMachine: false,
        visibleExportMachine: false,
        skipCount: 0,
        maxResultCount: 10,
        pageSize: 10,
        currentPage: 1,
        gr_ma_id: undefined,
        ma_id_list: undefined,
    }
    inputSearch: SearchInputUser = new SearchInputUser(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    dateTitle: string = "";
    today: Date = new Date();
    async componentDidMount() {
        await this.getAll();
    }
    getAll = async () => {
        this.setState({ isLoadDone: false });
        await stores.historyStore.chiTietBanHang(this.inputSearch.start_date, this.inputSearch.end_date, this.inputSearch.gr_ma_id, this.inputSearch.ma_id_list, undefined, undefined, this.state.skipCount, this.state.maxResultCount);
        this.setState({ isLoadDone: true })
    };
    onChangePage = async (page: number, pagesize?: number) => {
        // const { billingDetail } = stores.historyStore;
        if (pagesize === undefined || isNaN(pagesize)) {
            page = 1;
        }
        await this.setState({ pageSize: pagesize! });
        await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            this.getAll();
        });
    }
    onSearchStatistic = (input: SearchInputUser) => {
        this.inputSearch = input;
        this.onChangePage(1, this.state.pageSize);
    }
    setComponentRef = (ref) => {
        this.setState({ isLoadDone: false });
        this.componentRef = ref;
        this.setState({ isLoadDone: true });
    }
    render() {
        let self = this;
        // const { billingDetail } = stores.historyStore;

        return (
            <Card>
                {/* <Row gutter={16}>
                    <Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 14)}>
                        <StatisticSearch onSearchStatistic={(input) => { this.onSearchStatistic(input) }} />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 10)} style={{ textAlign: 'end' }}>
                        <ActionExport
                            isWord={true}
                            isExcel={true}
                            idPrint={"chitietbanhang"}
                            nameFileExport={"chitietbanhang" + ' ' + moment().format('DD_MM_YYYY')}
                            componentRef={this.componentRef}
                        />
                    </Col>
                </Row>

                <Row id='chitietbanhang' ref={self.setComponentRef} style={{ marginTop: 10 }}>
                    <Col span={24}>
                        <h2>Hình thức thanh toán</h2>
                    </Col>
                    <Col span={24}>
                        <TablePayments
                            itemPaymentMethodList={billingDetail != undefined && billingDetail.itemPaymentMethodList != undefined ? billingDetail.itemPaymentMethodList : []}
                            pagination={{
                                pageSize: this.state.pageSize,
                                total: billingDetail != undefined && billingDetail.itemPaymentMethodList != undefined ? billingDetail.itemPaymentMethodList!.length : 0,
                                showTotal: (tot) => ("Tổng: ") + tot + "",
                            }} />
                    </Col>
                    <Col span={24}>
                        <h2 style={{ marginTop: '10px' }}>Máy bán nước</h2>
                    </Col>
                    <TableWatervendingmachine
                        itemMachineList={billingDetail != undefined && billingDetail.itemMachineList != undefined ? billingDetail.itemMachineList! : []}
                        pagination={{
                            pageSize: this.state.pageSize,
                            total: billingDetail != undefined && billingDetail.itemMachineList != undefined ? billingDetail.itemMachineList!.length : 0,
                            current: this.state.currentPage,
                            showTotal: (tot) => ("Tổng: ") + tot + "",
                            showQuickJumper: true,
                            showSizeChanger: true,
                            pageSizeOptions: pageSizeOptions,
                            onShowSizeChange(current: number, size: number) {
                                self.onChangePage(current, size)
                            },
                            onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
                        }} />
                </Row> */}
            </Card >
        )

    }
}
