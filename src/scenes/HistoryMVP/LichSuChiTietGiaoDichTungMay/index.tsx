import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Row } from 'antd';
import * as React from 'react';
import { MachineDto, TransactionByMachineDto } from '@src/services/services_autogen';
import AppConsts, { EventTable, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import { ExportOutlined } from '@ant-design/icons';
import TableTransactionDetail from './component/TableTransactionDetail';
import ModalExportTransactionAdmin from './component/ModalExportTransactionAdmin';
import { isGranted } from '@src/lib/abpUtility';
import SearchHistoryTransactionInputUser, { SearchHistoryTransactionInput } from '@src/components/Manager/SearchHistoryTransactionInputUser';
import SearchHistoryTransactionInputAdmin, { SearchHistoryTransactionAdminInput } from '@src/components/Manager/SearchHistoryTransactionInputAdmin';
import moment from 'moment';
import { eSort } from '@src/lib/enumconst';
import { SorterResult } from 'antd/lib/table/interface';
export interface IProps {
    cash_payment?: boolean;
    parent?: string
}

export default class TransactionDetail extends React.Component<IProps> {
    componentRef: any | null = null;
    state = {
        start_date: undefined,
        end_date: undefined,
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
    inputSearchUser: SearchHistoryTransactionInput = new SearchHistoryTransactionInput(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    inputSearchAdmin: SearchHistoryTransactionAdminInput = new SearchHistoryTransactionAdminInput(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    selectedField: string;

    async getAll() {
        isGranted(AppConsts.Permission.Pages_History_Admin_ChiTietGiaoDichTheoTungMay) ?
            await stores.historyStore.chiTietGiaoDichTheoTungMayAdmin(this.inputSearchAdmin.us_id, this.inputSearchAdmin.payment_type, this.inputSearchAdmin.bi_status, this.inputSearchAdmin.bi_code, this.inputSearchAdmin.start_date != undefined ? moment(this.inputSearchAdmin.start_date).toDate() : undefined, this.inputSearchAdmin.end_date != undefined ? moment(this.inputSearchAdmin.end_date).toDate() : undefined, this.inputSearchAdmin.gr_ma_id, this.inputSearchAdmin.ma_id_list, this.selectedField, this.state.sort, this.state.skipCount, this.state.pageSize)
            :
            await stores.historyStore.chiTietGiaoDichTheoTungMay(this.inputSearchUser.payment_type, this.inputSearchUser.bi_status, this.inputSearchUser.bi_code, !!this.inputSearchUser.start_date ? moment(this.inputSearchUser.start_date).toDate() : undefined, !!this.inputSearchUser.end_date ? moment(this.inputSearchUser.end_date).toDate() : undefined, this.inputSearchUser.gr_ma_id, this.inputSearchUser.ma_id_list, this.selectedField, this.state.sort, this.state.skipCount, this.state.pageSize)
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }
    onSearchStatisticUser = (input: SearchHistoryTransactionInput) => {
        this.inputSearchUser = input;
        this.onChangePage(1, this.state.pageSize);
    }
    onSearchStatisticAdmin = async (input: SearchHistoryTransactionAdminInput) => {
        this.inputSearchAdmin = input;
        this.onChangePage(1, this.state.pageSize);
    }
    onChangePage = async (page: number, pagesize?: number) => {
		if (pagesize !== undefined) {
			await this.setState({ pageSize: pagesize! });
		}
		await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page });
		this.getAll();
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
            start_date: undefined,
            end_date: undefined,
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
        const { listTransactionByMachineDto, totalLog } = stores.historyStore;
        return (
            <Card>
                <Row gutter={[8, 8]} align='bottom'>
                    {this.props.cash_payment != true &&
                        <Col {...cssColResponsiveSpan(18, 16, 12, 12, 12, 12)}>
                            <h2>Chi tiết giao dịch theo từng máy</h2>
                        </Col>}
                    {isGranted(AppConsts.Permission.Pages_History_ChiTietGiaoDichTheoTungMay_Export) &&
                        <Col span={this.props.cash_payment != true ? 12 : 24} style={{ textAlign: "end" }}>
                            <Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcel: true })}>Xuất dữ liệu</Button>
                        </Col>
                    }
                    <Col span={24}>
                        {isGranted(AppConsts.Permission.Pages_History_Admin_ChiTietGiaoDichTheoTungMay) ?
                            <SearchHistoryTransactionInputAdmin cash_payment={this.props.cash_payment} onSearchStatistic={(input) => { this.onSearchStatisticAdmin(input) }} />
                            : <SearchHistoryTransactionInputUser cash_payment={this.props.cash_payment} onSearchStatistic={(input) => { this.onSearchStatisticUser(input) }} />}
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
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
                    parent={this.props.parent}
                    onCancel={() => this.setState({ visibleExportExcel: false })}
                />
            </Card >
        )
    }
}