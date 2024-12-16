import * as React from 'react';
import ActionExport from "@src/components/ActionExport";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { Card, Col, Row, Table } from "antd";
import { stores } from '@src/stores/storeInitializer';
import AppConsts, { EventTable, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import { ColumnsType } from 'antd/lib/table';
import StatisticSearch from '@src/components/Manager/StatisticSearch';
import { MachineDto, StatisticBillingOf24hDto } from '@src/services/services_autogen';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { SearchInputUser } from '@src/stores/statisticStore';
import { eFormatPicker } from '../BaoCaoTheoDonGia';

type TTotal = {
    totalHourlyRate: number[],
    totalMoney: number,
}

export default class ThongKeBanHang24GioUser extends AppComponentBase {
    componentRef: any | null = null;

    state = {
        isLoadDone: true,
        skipCount: 0,
        currentPage: 1,
        pageSize: 10,
        noScrollReport: false,
        typeDate: undefined,
    };
    machineSelected: MachineDto;
    inputSearch: SearchInputUser = new SearchInputUser(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    lastitem: number;
    dateTitle: string = "";
    today: Date = new Date();
    totalFooter: TTotal = { totalHourlyRate: Array(24).fill(0), totalMoney: 0 };

    getAll = async () => {
        await stores.statisticStore.statisticBillingOf24h(this.inputSearch);
        this.setState({ isLoadDone: !this.state.isLoadDone });
    };

    onChangePage = async (page: number, pagesize?: number) => {
        if (pagesize === undefined || isNaN(pagesize)) {
            page = 1;
        }
        await this.setState({ pageSize: pagesize! });
        await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            this.inputSearch.skipCount = this.state.skipCount;
            this.inputSearch.maxResult = this.state.pageSize;
            await this.getAll();
            this.caculatorTotal();
        });
    }
    setComponentRef = (ref) => {
        this.setState({ isLoadDone: false });
        this.componentRef = ref;
        this.setState({ isLoadDone: true });
    }
    onSearchStatistic = (input: SearchInputUser) => {
        this.inputSearch = input;
        this.onChangePage(1, this.state.pageSize);
    }
    actionTable = (machine: StatisticBillingOf24hDto, event: EventTable) => {
        if (event == EventTable.View) {
            this.machineSelected.init(machine);
        }
    }
    getTypeDate = (typeDate) => {
        this.setState({ typeDate: typeDate });
    }

    caculatorTotal = () => {
        const { listBlillingOf24h } = stores.statisticStore;
        this.totalFooter = { totalHourlyRate: Array(24).fill(0), totalMoney: 0 };
        for (let i = 0; i < listBlillingOf24h.length - 1; i++) {
            for (let j = 0; j < 24; j++) {
                this.totalFooter.totalHourlyRate[j] += listBlillingOf24h[i].hour![j];
            }
            this.totalFooter.totalMoney += this.totalFooter.totalHourlyRate[i];
        }
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }
    render() {
        const { listBlillingOf24h } = stores.statisticStore;
        const self = this;
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const columns: ColumnsType<StatisticBillingOf24hDto> = [
            {
                key: "stt", className: "start", title: <span>STT</span>, fixed: "left", width: 50,
                render: (_: string, item: StatisticBillingOf24hDto, index: number) => {
                    if (item.machineName != "Tổng") {
                        return ({
                            children: <div>{this.state.pageSize! * (this.state.currentPage! - 1) + (index + 1)}</div>,
                            props: {
                                colSpan: 1
                            }
                        })
                    }
                    else return ({
                        children: <div><b>Tổng</b></div>,
                        props: {
                            colSpan: 3
                        }
                    })
                }
            },
            {
                title: "Nhóm máy", fixed: "left", ellipsis: { showTitle: false },
                width: 150, key: "groupMachineId", render: (_: string, item: StatisticBillingOf24hDto, index: number) => {
                    if (item.machineName != "Tổng") {
                        return ({
                            children: <div title="Chi tiết nhóm máy">
                                <Link target='blank' to={"/general/machine/?gr_id=" + stores.sessionStore.getIdGroupMachinesStatistic(item.groupMachineName)} onDoubleClick={() => this.actionTable(item, EventTable.View)} >
                                    {item.groupMachineName || ""}
                                </Link>
                            </div>,

                            props: { colSpan: 1 }
                        })
                    }
                    else return ({
                        props: { colSpan: 0 }
                    })
                }
            },
            {
                title: "Máy bán nước", fixed: "left", width: 150, key: "machineCode", render: (_: string, item: StatisticBillingOf24hDto, index: number) => {
                    if (item.machineName != "Tổng") {
                        return ({
                            children: <div title="Chi tiết mã máy">
                                <Link target='blank' to={"/general/machine/?machine=" + item.machineCode} onDoubleClick={() => this.actionTable(item, EventTable.View)}>
                                    <div>{item.machineCode}</div>
                                    <div style={{ fontSize: 11, color: 'gray' }}>{item.machineName}</div>
                                </Link>
                            </div>,
                            props: { colSpan: 1 }
                        })
                    }
                    else return ({
                        props: { colSpan: 0 }
                    })
                }
            },
            {
                title: "Khoảng thời gian",
                key: "hour",
                children: hours.map((hour) => ({
                    title: `${hour < 10 ? "0" : ""}${hour}:00`,
                    key: `${hour}_00`,
                    width: 100,
                    sorter: (a: StatisticBillingOf24hDto, b: StatisticBillingOf24hDto) => {
                        const aValue = a.hour ? a.hour[hour] || 0 : 0;
                        const bValue = b.hour ? b.hour[hour] || 0 : 0;
                        return aValue - bValue;
                    },
                    render: (_, item: StatisticBillingOf24hDto) => {
                        if (item.machineName !== "Tổng") {
                            return {
                                children: <div>{AppConsts.formatNumber(item.hour![hour])}</div>,
                                props: { colSpan: 1 }
                            };
                        } else {
                            return {
                                children: <div><b>{AppConsts.formatNumber(item.hour![hour])}</b></div>,
                                props: { colSpan: 1 }
                            };
                        }
                    },
                })),
            },
            {
                title: (<strong> Tổng</strong>),
                sorter: (a, b) => a.hour![24] - b.hour![24],
                fixed: "right",
                width: 120,
                key: "total",
                render: (_: string, item: StatisticBillingOf24hDto) => (
                    <div>
                        <b>
                            {AppConsts.formatNumber(item.hour![24])}
                        </b>
                    </div>
                ),
            }
        ];

        return (
            <Card >
                <Row gutter={16}>
                    <Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 24)}>
                        <StatisticSearch onSearchStatistic={(input) => this.onSearchStatistic(input)} />
                    </Col>
                    {this.isGranted(AppConsts.Permission.Pages_Statistic_BillingOf24h_Export) &&
                        <Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 24)} style={{ textAlign: 'end' }}>
                            <ActionExport
                                isPrint={false}
                                isScrollReport={async () => await this.setState({ noScrollReport: false })}
                                noScrollReport={async () => await this.setState({ noScrollReport: true })}
                                isWord={false}
                                isExcel={true}
                                idPrint={"thongkebanhang24h"}
                                nameFileExport={"thongkebanhang24h" + ' ' + moment().format('DD_MM_YYYY')}
                                componentRef={this.componentRef}
                            />
                        </Col>
                    }
                </Row>
                <div id='thongkebanhang24h' ref={this.setComponentRef}>
                    <h2 style={{ textAlign: 'center', paddingTop: '10px', fontWeight: 'bold' }}>
                        {this.state.typeDate == eFormatPicker.date ?
                            (!!this.inputSearch.start_date) ?

                                ((moment(this.inputSearch.start_date).format("DD/MM/YYYY") == moment(this.inputSearch.end_date).format("DD/MM/YYYY") || this.inputSearch.end_date == undefined) ?
                                    <>{"THỐNG KÊ DOANH THU 24 GIỜ NGÀY " + moment(this.inputSearch.start_date).format("DD/MM/YYYY")}</>
                                    :
                                    <>{"THỐNG KÊ DOANH THU 24 GIỜ TỪ NGÀY " + moment(this.inputSearch.start_date).format("DD/MM/YYYY") + " ĐẾN NGÀY " + moment(this.inputSearch.end_date).format("DD/MM/YYYY")}</>
                                )
                                :
                                <> THỐNG KÊ DOANH THU 24 GIỜ</>
                            :
                            (this.state.typeDate == eFormatPicker.month ?
                                ((moment(this.inputSearch.start_date).format("MM/YYYY") == moment(this.inputSearch.end_date).format("MM/YYYY") || this.inputSearch.end_date == undefined) ?
                                    <>{this.inputSearch.start_date ? "THỐNG KÊ DOANH THU 24 GIỜ THÁNG " + moment(this.inputSearch.start_date).format("MM/YYYY") : "THỐNG KÊ DOANH THU 24 GIỜ"}</>
                                    :
                                    <>{"THỐNG KÊ DOANH THU 24 GIỜ TỪ THÁNG " + moment(this.inputSearch.start_date).format("MM/YYYY") + " ĐẾN THÁNG " + moment(this.inputSearch.end_date).format("MM/YYYY")}</>
                                )
                                :
                                (this.state.typeDate == eFormatPicker.year ?
                                    ((moment(this.inputSearch.start_date).format("YYYY") == moment(this.inputSearch.end_date).format("YYYY") || this.inputSearch.end_date == undefined) ?
                                        <>{this.inputSearch.start_date ? "THỐNG KÊ DOANH THU 24 GIỜ NĂM " + moment(this.inputSearch.start_date).format("YYYY") : "THỐNG KÊ DOANH THU 24 GIỜ"}</>
                                        :
                                        <>{"THỐNG KÊ DOANH THU 24 GIỜ TỪ NĂM " + moment(this.inputSearch.start_date).format("YYYY") + " ĐẾN NĂM " + moment(this.inputSearch.end_date).format("YYYY")}</>
                                    )
                                    : <> THỐNG KÊ DOANH THU 24 GIỜ</>)
                            )
                        }
                    </h2>
                    <Table
                        className="centerTable"
                        size={'small'}
                        bordered={true}
                        dataSource={listBlillingOf24h}
                        
                        scroll={this.state.noScrollReport ? { x: undefined } : { x: 2000 }}
                        columns={columns}
                        pagination={this.state.noScrollReport ? false : {
                            className: "ant-table-pagination ant-table-pagination-right no-print noprintExcel ",
                            pageSize: this.state.pageSize,
                            current: this.state.currentPage,
                            total: listBlillingOf24h.length ?? 0,
                            showTotal: (tot) => "Tổng: " + tot + "",
                            showQuickJumper: true,
                            showSizeChanger: true,
                            pageSizeOptions: pageSizeOptions,
                            onShowSizeChange(current: number, size: number) {
                                self.onChangePage(current, size)
                            },
                            onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
                        }}
                        summary={() => (
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0} colSpan={3} >
                                    <div style={{ display: "flex", justifyContent: "center" }}><strong>Tổng</strong></div>
                                </Table.Summary.Cell>
                                {this.totalFooter.totalHourlyRate.map((totalMoney, index) => (
                                    <Table.Summary.Cell key={index + 3} index={index + 3}>
                                        <div style={{ display: "flex", justifyContent: "center" }}> <strong>{AppConsts.formatNumber(totalMoney)}</strong></div>
                                    </Table.Summary.Cell>
                                ))}
                                <Table.Summary.Cell index={27}>
                                    <div style={{ display: "flex", justifyContent: "center" }}>
                                        <strong>{AppConsts.formatNumber(this.totalFooter.totalMoney)}</strong>
                                    </div>
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        )}
                    />
                </div>
            </Card>
        )
    }
}