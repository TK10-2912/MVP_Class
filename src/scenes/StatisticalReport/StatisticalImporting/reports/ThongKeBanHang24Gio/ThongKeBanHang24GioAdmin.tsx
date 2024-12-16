import { L } from '@lib/abpUtility';
import ActionExport from "@src/components/ActionExport";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import StatisticSearchByAdmin from '@src/components/Manager/StatisticSearchByAdmin';
import AppConsts, { EventTable, cssColResponsiveSpan } from '@src/lib/appconst';
import { MachineDto, StatisticBillingOf24hDto } from '@src/services/services_autogen';
import { SearchInputAdmin } from '@src/stores/statisticStore';
import { stores } from '@src/stores/storeInitializer';
import { Card, Col, Row, Table } from "antd";
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import { Link } from 'react-router-dom';

export default class ThongKeBanHang24GioAdmin extends AppComponentBase {
    componentRef: any | null = null;

    state = {
        isLoadDone: true,
        skipCount: 0,
        currentPage: 1,
        pageSize: 10,
        noScrollReport: false,
    };
    machineSelected: MachineDto;
    inputSearch: SearchInputAdmin = new SearchInputAdmin(undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    lastitem: number;
    dateTitle: string = "";
    today: Date = new Date();

    getAll = async () => {
        this.setState({ isLoadDone: false });
        await stores.statisticStore.statisticBillingOf24hByAdmin(this.inputSearch);
        this.setState({ isLoadDone: true })
    };

    onChangePage = async (page: number, pagesize?: number) => {
        if (pagesize === undefined || isNaN(pagesize)) {
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
    onSearchStatistic = (input: SearchInputAdmin) => {
        this.inputSearch = input;
        this.onChangePage(1, this.state.pageSize);
    }
    actionTable = (machine: StatisticBillingOf24hDto, event: EventTable) => {
        if (event == EventTable.View) {
            this.machineSelected.init(machine);
        }
    }
    render() {
        const { listBlillingOf24h } = stores.statisticStore
        const self = this;
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const columns: ColumnsType<StatisticBillingOf24hDto> = [
            {
                key: "stt", className: "start", title: <span>STT</span>, fixed: "left", width: 50,
                render: (text: string, item: StatisticBillingOf24hDto, index: number) => {
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
                            colSpan: 5
                        }
                    })
                }
            },
            {
                title: "Tên nhóm", fixed: "left", key: "groupMachineId", render: (text: string, item: StatisticBillingOf24hDto, index: number) => {
                    if (item.machineName != "Tổng") {
                        return ({
                            children: <div>
                                <Link to={"/general/machine/?gr_id=" + stores.sessionStore.getIdGroupMachinesStatistic(item.groupMachineName)} onDoubleClick={() => this.actionTable(item, EventTable.View)} >
                                    {stores.sessionStore.getNameGroupMachinesStatistic(item.groupMachineName)}
                                </Link>
                            </div>,

                            props: {
                                colSpan: 1
                            }
                        })
                    }
                    else return ({
                        props: {
                            colSpan: 0
                        }
                    })
                }
            },
            {
                title: "Mã máy", fixed: "left", key: "machineCode", render: (text: string, item: StatisticBillingOf24hDto, index: number) => {
                    if (item.machineName != "Tổng") {
                        return ({
                            children: <div>
                                <Link to={"/general/machine/?machine=" + item.machineCode} onDoubleClick={() => this.actionTable(item, EventTable.View)}>
                                    {item.machineCode}
                                </Link>
                            </div>,
                            props: {
                                colSpan: 1
                            }
                        })
                    }
                    else return ({
                        props: {
                            colSpan: 0
                        }
                    })
                }
            },
            {
                title: "Tên máy", fixed: "left", key: "machineName", render: (text: string, item: StatisticBillingOf24hDto, index: number) => {
                    if (item.machineName != "Tổng") {
                        return ({
                            children: <div>
                                <Link to={"/general/machine/?machine=" + item.machineCode} onDoubleClick={() => this.actionTable(item, EventTable.View)}>
                                    {item.machineName}
                                </Link>
                            </div>,
                            props: {
                                colSpan: 1
                            }
                        })
                    }
                    else return ({
                        props: {
                            colSpan: 0
                        }
                    })
                }
            },
            {
                title: "Người sở hữu", fixed: "left", key: "us_machine", render: (text: string, item: StatisticBillingOf24hDto, index: number) => {
                    if (item.machineName != "Tổng") {
                        return ({
                            children: <div>
                                <Link to={"/general/machine/?us_id_list=" + (item.us_id_owner)} onDoubleClick={() => this.actionTable(item, EventTable.View)} >
                                    {stores.sessionStore.getUserNameById(item.us_id_owner)}
                                </Link>
                            </div>,
                            props: {
                                colSpan: 1
                            }
                        })
                    }
                    else return ({
                        props: {
                            colSpan: 0
                        }
                    })
                }
            },
            {

                title: "Khoảng thời gian",
                key: "hour",
                children: hours.map((hour) => ({
                    title: `${hour < 10 ? "0" : ""}${hour}:00`,
                    key: `${hour}_00`,
                    width:100,
                    render: (text, item: StatisticBillingOf24hDto) => {
                        if (item.machineName != "Tổng") {
                            return ({
                                children: <div>{AppConsts.formatNumber(item.hour![hour])}</div>,
                                props: {
                                    colSpan: 1
                                }
                            })
                        }
                        else return ({
                            children: <div><b>{AppConsts.formatNumber(item.hour![hour])}</b></div>,
                            props: {
                                colSpan: 1
                            }
                        })
                    },
                })),
            },
            { title: "Tổng", fixed: "right", width: 120, key: "total", render: (text: string, item: StatisticBillingOf24hDto) => <div><b>{AppConsts.formatNumber(item.hour![24])}</b></div> },
        ];

        return (
            <Card >
                <Row gutter={16}>
                    <Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 24)}>
                        <StatisticSearchByAdmin onSearchStatistic={(input) => this.onSearchStatistic(input)} />
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
                    <h2 style={{ textAlign: 'center', paddingTop: '10px' }}>{"THỐNG KÊ BÁN HÀNG 24 GIỜ"}</h2>
                    <Table
                        // sticky
                        className="centerTable"
                        loading={!this.state.isLoadDone}
                        size={'small'}
                        bordered={true}
                        dataSource={listBlillingOf24h != undefined ? listBlillingOf24h : []}
                        scroll={this.state.noScrollReport ? { x: undefined } : { x: 3000 }}
                        columns={columns}
                        pagination={this.state.noScrollReport ? false : {
                            className: "ant-table-pagination ant-table-pagination-right no-print noprintExcel ",
                            pageSize: this.state.pageSize,
                            current: this.state.currentPage,
                            total: listBlillingOf24h.length > 0 ? listBlillingOf24h.length - 1 : 0,
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
            </Card>
        )
    }
}