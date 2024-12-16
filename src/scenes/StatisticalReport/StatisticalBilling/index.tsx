import * as React from 'react';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Modal, Row } from 'antd';
import { ExportOutlined, LineChartOutlined } from '@ant-design/icons';
import TableBillingStatistical from './component/TableBillingStatistical';
import ExportBillingStatistic from './component/ExportBillingStatistic';
import InputSearch from './component/InputSearch';
import { StatisticBillingOfMachineDto } from '@src/services/services_autogen';
import { L } from '@src/lib/abpUtility';
import BarChartDrink from './component/BarChartDrink';
import BarChartFreshDrink from './component/BarChartFreshDrink';
import { SearchInputUser } from '@src/stores/statisticStore';

export default class StatisticalImporting extends React.Component {
    state = {
        isLoadDone: true,
        dr_search: "",
        dr_price: undefined,
        su_id: undefined,
        skipCount: 0,
        maxResultCount: 10,
        onChangePage: 1,
        visibleModalCreateUpdate: false,
        visibleExportExcelDrink: false,
        visibleInfoDrink: false,
        pageSize: 10,
        currentPage: 1,
        isBarChartDrink: false,
        isBarChartFreshDrink: false,
    }
    dateTitle: string = "";
    inputSearch: SearchInputUser = new SearchInputUser(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    itemBillingStatisticListResult: StatisticBillingOfMachineDto[];
    today: Date = new Date();
    async componentDidMount() {
        await this.getAll();
    }

    async getAll() {
        this.setState({ isLoadDone: false })
        await stores.statisticStore.statisticBillingOfMachine(this.inputSearch);
        this.setState({ isLoadDone: true })
    }

    handleSubmitSearch = async () => {
        this.onChangePage(1, this.state.pageSize);
    }

    handleDataChange = async (inputSearch: SearchInputUser) => {
        // this.inputSearch = inputSearch;
        // if (this.inputSearch.day == undefined && this.inputSearch.month == undefined && this.inputSearch.year == undefined) {
        //     this.dateTitle = "";
        // }
        // if (this.inputSearch.day != undefined) {
        //     this.dateTitle = "NGÀY " + this.inputSearch.day + "/" + this.inputSearch.month + "/" + this.inputSearch.year;
        // }
        // if (this.inputSearch.day == undefined && this.inputSearch.month != undefined) {
        //     this.dateTitle = "THÁNG " + this.inputSearch.month + "/" + this.inputSearch.year;
        // }
        // if (this.inputSearch.day == undefined && this.inputSearch.month == undefined && this.inputSearch.year != undefined) {
        //     this.dateTitle = "NĂM " + this.inputSearch.year;
        // }
        // await this.getAll();
        // this.onChangePage(1, this.state.pageSize);
    };

    onChangePage = async (page: number, pagesize?: number) => {
        if (pagesize !== undefined) {
            await this.setState({ pageSize: pagesize! });
        }
        await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            this.getAll();
        })
    }
    onCancelChartDrink = async () => {
        await this.setState({ isBarChartDrink: false })
    }
    onCancelCharFreshDrink = async () => {
        await this.setState({ isBarChartFreshDrink: false })
    }

    handleBarChartDrink() {
        this.setState({ isBarChartDrink: true });
    }
    handleBarChartFreshDrink() {
        this.setState({ isBarChartFreshDrink: true });
    }
    render() {
        let self = this;
        const { billingStatisticListResult } = stores.statisticStore;
        const { currentLogin } = stores.sessionStore;
        return (
            <Card>
                <h2 style={{ textAlign: 'center', paddingTop: '10px' }}>{"THỐNG KÊ ĐƠN HÀNG ĐÃ BÁN " + this.dateTitle + " CỦA " + currentLogin.user.name?.toLocaleUpperCase()}</h2>
                <Row gutter={[8, 8]}>
                    <Col>
                        <Button type="primary" icon={<LineChartOutlined />} title={L('Biểu đồ thống kê sản phẩm có bao bì')} onClick={() => this.handleBarChartDrink()} >{L('Biểu đồ thống kê sản phẩm có bao bì')}</Button>
                    </Col>
                    <Col>
                        <Button type="primary" icon={<LineChartOutlined />} title={L('Biểu đồ thống kê sản phẩm không bao bì')} onClick={() => this.handleBarChartFreshDrink()} >{L('Biểu đồ thống kê sản phẩm không bao bì')}</Button>
                    </Col>

                    <Col style={{ textAlign: "end" }}>
                        <Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcelDrink: true })}>Xuất dữ liệu</Button>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <InputSearch onDataChanged={this.handleDataChange} />
                    </Col>
                </Row>
                <Row style={{ paddingTop: '10px' }}>
                    <Col span={24} style={{ overflowY: "auto" }}>
                        <TableBillingStatistical
                            billingStatisticListResult={billingStatisticListResult}
                        />
                    </Col>
                </Row>
                <ExportBillingStatistic
                    billingStatisticListResult={billingStatisticListResult}
                    visible={this.state.visibleExportExcelDrink}
                    onCancel={() => this.setState({ visibleExportExcelDrink: false })}
                />
                <Modal
                    visible={this.state.isBarChartDrink}
                    onCancel={() => { this.setState({ isBarChartDrink: false }) }}
                    footer={null}
                    width='70vw'
                    closable={false}
                    maskClosable={true}
                >
                    <BarChartDrink
                        billingStatisticListResult={billingStatisticListResult}
                        onCancelChart={this.onCancelChartDrink}
                        title={this.dateTitle}
                    />
                </Modal>
                <Modal
                    visible={this.state.isBarChartFreshDrink}
                    onCancel={() => { this.setState({ isBarChartFreshDrink: false }) }}
                    footer={null}
                    width='70vw'
                    closable={false}
                    maskClosable={true}
                >
                    <BarChartFreshDrink
                        billingStatisticListResult={billingStatisticListResult}
                        onCancelChart={this.onCancelCharFreshDrink}
                        title={this.dateTitle}
                    />
                </Modal>
            </Card>
        )
    }
}