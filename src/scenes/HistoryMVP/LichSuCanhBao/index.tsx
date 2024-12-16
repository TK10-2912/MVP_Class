import { ExportOutlined } from '@ant-design/icons';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Row } from 'antd';
import * as React from 'react';
import AppConsts, { EventTable, cssColResponsiveSpan } from '@src/lib/appconst';
import TableHistoryReport from './components/TableHistoryReport';
import ModalExportMachineReport from './components/ModalExportHistoryReport';
import { MachineDto, ReportOfMachineDto } from '@src/services/services_autogen';

import { isGranted } from '@src/lib/abpUtility';
import SearchHistoryReportAdmin, { SearchHistoryReportInputAdmin } from '@src/components/Manager/SearchHistoryReportAdmin';
import SearchHistoryReportUser, { SearchHistoryReportInputUser } from '@src/components/Manager/SearchHistoryReportUser';

export default class HistoryReport extends React.Component {
    state = {
        isLoadDone: true,
        skipCount: 0,
        pageSize: 10,
        currentPage: 1,
        visibleExportExcelBill: false,
        visibleModalInfoBilling: false,
        us_id_list: [],
    }
    machineSelected: MachineDto;
    inputSearchUser: SearchHistoryReportInputUser = new SearchHistoryReportInputUser(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined,);
    inputSearchAdmin: SearchHistoryReportInputAdmin = new SearchHistoryReportInputAdmin(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    async getAll() {
        this.setState({ isLoadDone: false })
        if (isGranted(AppConsts.Permission.Pages_History_Admin_CanhBao)) {
            await stores.historyStore.lichSuCanhBaoAdmin(this.inputSearchAdmin);
            stores.machineStore.getAllByAdmin(undefined, undefined, undefined, undefined, undefined, undefined, undefined)
        } else {
            await stores.historyStore.lichSuCanhBao(this.inputSearchUser);
        }
        this.setState({ isLoadDone: true })
    }

    handleSubmitSearch = async () => {
        this.onChangePage(1, this.state.pageSize);
    }
    actionTable = (machine: ReportOfMachineDto, event: EventTable) => {
        if (event === EventTable.View) {
            this.machineSelected.init(machine);
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
                    <Col style={{ overflowY: "auto" }}>
                        <TableHistoryReport
                            actionTable={this.actionTable}
                            listReportOfMachine={listReportOfMachine}
                            isLoadDone={false}
                            hasAction={true}
                            is_printed={false}
                            pagination={{
                                pageSize: this.state.pageSize,
                                total: total,
                                current: this.state.currentPage,
                                showTotal: (tot) => ("Tổng: ") + tot + "",
                                showQuickJumper: true,
                                showSizeChanger: true,
                                pageSizeOptions: ['10', '20', '50', '100'],
                                onShowSizeChange(current: number, size: number) {
                                    self.onChangePage(current, size)
                                },
                                onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
                            }}
                        />
                        <ModalExportMachineReport
                            listReportOfMachine={listReportOfMachine}
                            visible={this.state.visibleExportExcelBill}
                            onCancel={() => this.setState({ visibleExportExcelBill: false })}
                        />
                    </Col>
                </Row>
            </Card>
        )
    }
}