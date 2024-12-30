import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Row } from 'antd';
import * as React from 'react';
import { MachineDto, TransactionByMachineDto } from '@src/services/services_autogen';
import AppConsts, { EventTable, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import { ExportOutlined } from '@ant-design/icons';
import ModalExportTransactionAdmin from './component/ModalExportTransactionAdmin';
import { isGranted } from '@src/lib/abpUtility';
import moment from 'moment';
import { eSort } from '@src/lib/enumconst';
import { SorterResult } from 'antd/lib/table/interface';
import SearchHistoryTransactionToday, { SearchHistoryTransactionTodayType } from '@src/components/Manager/SearchHistoryTransactionInputToday';
import TableTransactionDetailToday from './component/TableTransactionDetailToday';
import TableTransactionDetail from '@src/scenes/HistoryMVP/LichSuChiTietGiaoDichTungMay/component/TableTransactionDetail';

export interface IProps {
    cash_payment?: boolean;
    parent?: string;
}

export default class TransactionDetailToday extends React.Component<IProps> {
    componentRef: any | null = null;
    state = {
        gr_ma_id: undefined,
        bi_code: undefined,
        ma_id_list: [],
        skipCount: 0,
        pageSize: AppConsts.PAGESIZE,
        currentPage: 1,
        visibleExportExcel: false,
        isLoadDone: true,
        sort: undefined,
    }
    machineSelected: MachineDto;
    inputSearch: SearchHistoryTransactionTodayType = new SearchHistoryTransactionTodayType(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    selectedField: string;

    async getAll() {
        if (isGranted(AppConsts.Permission.Pages_History_Admin_ChiTietGiaoDichTheoTungMay)) {
            await stores.historyStore.chiTietGiaoDichTheoTungMayAdmin(this.inputSearch.us_id, this.inputSearch.payment_type, this.inputSearch.bi_status, this.inputSearch.bi_code, moment().toDate(), moment().toDate(), this.inputSearch.gr_ma_id, this.inputSearch.ma_id_list, this.selectedField, this.state.sort, undefined, undefined)
            //await stores.historyStore.chiTietGiaoDichTheoTungMayAdmin(this.inputSearch.us_id, this.inputSearch.payment_type, this.inputSearch.bi_status, this.inputSearch.bi_code, moment().toDate(), moment().toDate(), this.inputSearch.gr_ma_id, this.inputSearch.ma_id_list, this.selectedField, this.state.sort, this.state.skipCount, this.state.pageSize)
        }
        else {
            await stores.historyStore.chiTietGiaoDichTheoTungMay(this.inputSearch.payment_type, this.inputSearch.bi_status, this.inputSearch.bi_code, moment().toDate(), moment().toDate(), this.inputSearch.gr_ma_id, this.inputSearch.ma_id_list, this.selectedField, this.state.sort, undefined, undefined)
            //await stores.historyStore.chiTietGiaoDichTheoTungMay(this.inputSearch.payment_type, this.inputSearch.bi_status, this.inputSearch.bi_code, moment().toDate(), moment().toDate(), this.inputSearch.gr_ma_id, this.inputSearch.ma_id_list, this.selectedField, this.state.sort, this.state.skipCount, this.state.pageSize)
        }
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }

    onSearchStatisticAdmin = async (input: SearchHistoryTransactionTodayType) => {
        this.inputSearch = input;
        this.onChangePage(1, this.state.pageSize);
    }
    onChangePage = async (page: number, pagesize?: number) => {
        if (pagesize !== undefined) {
            await this.setState({ pageSize: pagesize! });
        }
        await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            await this.getAll();
        })
    }
    changeColumnSort = async (sort: SorterResult<TransactionByMachineDto> | SorterResult<TransactionByMachineDto>[]) => {
        this.setState({ isLoadDone: false });
        this.selectedField = sort["field"];
        await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
        await this.getAll();
        this.setState({ isLoadDone: true });

    }
    clearSearch = async () => {
        await this.setState({
            gr_ma_id: undefined,
            bi_code: undefined,
            us_id_list: [],
        })
        this.getAll();
    }
    actionTable = (machine: TransactionByMachineDto, event: EventTable) => {
        if (event == EventTable.View) {
            this.machineSelected.init(machine);
        }
    }
    render() {
        const self = this;
        const { listTransactionByMachineDto, totalLog } = stores.historyStore
        let listTransactionByMachineDtoFilter = listTransactionByMachineDto.filter(transaction => transaction.hinh_thuc_thanh_toan === 0);
        return (
            <Card>
                <Row gutter={[8, 8]} align='bottom'>
                    {this.props.cash_payment != true &&
                        <Col {...cssColResponsiveSpan(18, 16, 12, 12, 12, 12)}>
                            <h2 style={{ margin: 0 }}>Giao dịch từng máy hôm nay ({new Date().toLocaleDateString('vi-VN')})</h2>
                        </Col>}
                    {isGranted(AppConsts.Permission.Pages_History_ChiTietGiaoDichTheoTungMay_Export) &&
                        <Col span={this.props.cash_payment != true ? 12 : 24} style={{ textAlign: "end" }}>
                            <Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcel: true })}>Xuất dữ liệu</Button>
                        </Col>
                    }
                    <Col span={24}>
                        <SearchHistoryTransactionToday cash_payment={this.props.cash_payment} onSearchStatistic={(input) => { this.onSearchStatisticAdmin(input) }} />
                    </Col>
                </Row>

                <Row>
                    <Col span={24}>
                        {/* <TableTransactionDetailToday
                            parent={this.props.parent}
                            currentPage={this.state.currentPage}
                            pageSize={this.state.pageSize}
                            cash_payment={this.props.cash_payment}
                            is_printed={false}
                            changeColumnSort={this.changeColumnSort}
                            listTransactionByMachine={this.props.cash_payment != true ? listTransactionByMachineDto : listTransactionByMachineDtoFilter}
                            pagination={{
                                position: ['topRight'],
                                pageSize: this.state.pageSize,
                                total: this.props.cash_payment != true ? total : listTransactionByMachineDtoFilter.length,
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
                        /> */}
                        <TableTransactionDetail
                            parent={this.props.parent}
                            cash_payment={this.props.cash_payment}
                            is_printed={false}
                            changeColumnSort={this.changeColumnSort}
                            listTransactionByMachine={listTransactionByMachineDto}
                            pagination={{
                                position: ['topRight'],
                                pageSize: this.state.pageSize,
                                total: totalLog,
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
                </Row>
                <ModalExportTransactionAdmin
                    listTransactionDetailDto={listTransactionByMachineDto}
                    visible={this.state.visibleExportExcel}
                    onCancel={() => this.setState({ visibleExportExcel: false })}
                    currentPage={this.state.currentPage}
                    pageSize={this.state.pageSize}
                />
            </Card >
        )
    }
}