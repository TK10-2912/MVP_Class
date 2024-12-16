import { ExportOutlined } from '@ant-design/icons';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, message, Modal, Row } from 'antd';
import * as React from 'react';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import TableHistoryReport from './components/TableHistoryReport';
import ModalExportMachineReport from './components/ModalExportHistoryReport';
import { MachineDto, ReportOfMachineDto } from '@src/services/services_autogen';

import { isGranted } from '@src/lib/abpUtility';
import SearchHistoryReportAdmin, { SearchHistoryReportInputAdmin } from '@src/components/Manager/SearchHistoryReportAdmin';
import SearchHistoryReportUser, { SearchHistoryReportInputUser } from '@src/components/Manager/SearchHistoryReportUser';
import { SorterResult } from 'antd/lib/table/interface';
import { eSort } from '@src/lib/enumconst';
import LogHistoryReport from './components/LogHistoryReport';
import MapComponent from '@src/components/MapComponent';

export default class HistoryReport extends React.Component {
    state = {
        isLoadDone: true,
        skipCount: 0,
        pageSize: 10,
        currentPage: 1,
        ma_mapUrl: '',
        visibleExportExcelBill: false,
        visibleModalInfoBilling: false,
        us_id_list: [],
        sort: undefined,
        viewLog: undefined,
        visibleModalGoogleMap: false,
    }
    reportOfMachineDto: ReportOfMachineDto = new ReportOfMachineDto();
    inputSearchUser: SearchHistoryReportInputUser = new SearchHistoryReportInputUser(undefined,undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    inputSearchAdmin: SearchHistoryReportInputAdmin = new SearchHistoryReportInputAdmin(undefined,undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    selectedField: string;
    maSelected: MachineDto = new MachineDto();

    async getAll() {
        this.setState({ isLoadDone: false })
        this.inputSearchUser.skipCount = this.state.skipCount;
        this.inputSearchUser.maxResultCount = this.state.pageSize;
        this.inputSearchUser.fieldSort = this.selectedField;
        this.inputSearchUser.sort = this.state.sort;
        if (isGranted(AppConsts.Permission.Pages_History_Admin_CanhBao)) {
            await stores.historyStore.lichSuCanhBaoAdmin(this.inputSearchAdmin.us_id, this.inputSearchAdmin.re_status, this.inputSearchAdmin.re_level,this.inputSearchAdmin.bi_code, this.inputSearchAdmin.start_date, this.inputSearchAdmin.end_date, this.inputSearchAdmin.gr_ma_id, this.inputSearchAdmin.ma_id_list, this.selectedField, this.state.sort, this.inputSearchUser.skipCount, this.state.pageSize);
        } else {
            await stores.historyStore.lichSuCanhBao(this.inputSearchUser);
        }
        this.setState({ isLoadDone: true })
    }
    changeColumnSort = async (sort: SorterResult<ReportOfMachineDto> | SorterResult<ReportOfMachineDto>[]) => {
        this.setState({ isLoadDone: false });
        this.selectedField = sort["field"];
        await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
        await this.getAll();
        this.setState({ isLoadDone: true });

    }
    handleSubmitSearch = async () => {
        this.onChangePage(1, this.state.pageSize);
    }

    actionTable = async (reportOfMachineDto: ReportOfMachineDto, event: EventTable, hasMapUrl?: boolean) => {
        if (event === EventTable.View) {
            if (!!reportOfMachineDto.billing) {
                this.reportOfMachineDto.init(reportOfMachineDto)
                this.setState({ viewLog: true })
            } else message.error("Mã hoá đơn không hợp lệ!");
        }
        if (event == EventTable.ViewMap || event == EventTable.RowDoubleClick) {
            this.maSelected = reportOfMachineDto.machine;
            await this.setState({ visibleModalGoogleMap: true, })

        }
        if (event == EventTable.MapDirection || event == EventTable.RowDoubleClick) {
            this.maSelected = reportOfMachineDto.machine;
            if (this.maSelected != undefined) {
                AppConsts.actionDirection(this.maSelected.ma_gps_lat!, this.maSelected.ma_gps_lng!);
            }

        }
    }

    onChangePage = async (page: number, pagesize?: number) => {
        if (pagesize !== undefined) {
            await this.setState({ pageSize: pagesize! });
        }
        await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            this.getAll();
        })
    }
    onSearchStatisticAdmin = (input: SearchHistoryReportInputAdmin) => {
        this.inputSearchAdmin = input;
        this.onChangePage(1, this.state.pageSize);
    }
    onSearchStatisticUser = (input: SearchHistoryReportInputUser) => {
        this.inputSearchUser = input;
        this.onChangePage(1, this.state.pageSize);
    }

    render() {
        let self = this;
        const { listReportOfMachine, total } = stores.historyStore;
        const left = this.state.viewLog ? { ...cssColResponsiveSpan(24, 24, 24, 14, 14, 16) } : cssCol(24);
        const right = this.state.viewLog ? { ...cssColResponsiveSpan(24, 24, 24, 10, 10, 8) } : cssCol(0);
        return (
            <Card>
                <Row gutter={[8, 8]}>
                    <Col {...cssColResponsiveSpan(19, 16, 12, 12, 12, 12)}>
                        <h2>Lịch sử cảnh báo</h2>
                    </Col>
                    {isGranted(AppConsts.Permission.Pages_History_CanhBao_Export) &&
                        <Col {...cssColResponsiveSpan(5, 8, 12, 12, 12, 12)} style={{ textAlign: "right" }}>
                            <Button type="primary"
                                icon={<ExportOutlined />}
                                onClick={() => this.setState({ visibleExportExcelBill: true })}>{(window.innerWidth > 575) && 'Xuất dữ liệu'}</Button>
                        </Col>
                    }
                </Row>
                <Row>
                    {
                        isGranted(AppConsts.Permission.Pages_History_Admin_CanhBao) ?
                            <SearchHistoryReportAdmin onSearchHistoryReport={(value) => this.onSearchStatisticAdmin(value)} />
                            :
                            <SearchHistoryReportUser onSearchHistoryReport={(value) => this.onSearchStatisticUser(value)} />
                    }
                </Row>
                <Row>
                    <Col {...left} style={{ overflowY: "auto" }}>
                        <TableHistoryReport
                            actionTable={this.actionTable}
                            changeColumnSort={this.changeColumnSort}
                            listReportOfMachine={listReportOfMachine}
                            hasAction={true}
                            is_printed={false}
                            checkExpand={false}
                            pagination={{
                                position: ['topRight'],
                                pageSize: this.state.pageSize,
                                total: total,
                                current: this.state.currentPage,
                                showTotal: (tot) => ("Tổng: ") + tot + "",
                                showQuickJumper: true,
                                showSizeChanger: true,
                                pageSizeOptions: pageSizeOptions,
                                onShowSizeChange(current: number, size: number) {
                                    self.onChangePage(current, size)
                                },
                                onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
                            }}

                        />
                    </Col>
                    {this.state.viewLog &&
                        <Col {...right} style={{ overflowY: "auto" }}>
                            <LogHistoryReport
                                isLoadDone={this.state.isLoadDone}
                                pagination={false}
                                onCancel={() => this.setState({ viewLog: false })}
                                reportOfMachineDto={this.reportOfMachineDto}
                            ></LogHistoryReport>
                        </Col>
                    }
                    <ModalExportMachineReport
                        listReportOfMachine={listReportOfMachine}
                        visible={this.state.visibleExportExcelBill}
                        onCancel={() => this.setState({ visibleExportExcelBill: false })}
                    />
                </Row>
                <Modal
                    centered
                    visible={this.state.visibleModalGoogleMap}
                    onCancel={() => this.setState({ visibleModalGoogleMap: false })}
                    title={<h3>{'Vị trí máy: ' + this.maSelected.ma_display_name}</h3>}
                    width={'70vw'}
                    footer={null}
                >

                    {(AppConsts.isValidLocation(this.maSelected.ma_gps_lat, this.maSelected.ma_gps_lng)) ?
                        <MapComponent
                            centerMap={{ lat: Number(this.maSelected.ma_gps_lat), lng: Number(this.maSelected.ma_gps_lng) }}
                            zoom={15}
                            positionList={[
                                { lat: Number(this.maSelected.ma_gps_lat), lng: Number(this.maSelected.ma_gps_lng), title: 'Vị trí máy' },
                            ]}
                        />
                        :
                        <div dangerouslySetInnerHTML={{ __html: this.maSelected.ma_mapUrl! }} />
                    }
                </Modal>

            </Card>
        )
    }
}