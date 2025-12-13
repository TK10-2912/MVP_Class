
import { ExportOutlined, PlusCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { isGranted, L } from '@src/lib/abpUtility';
import { GroupMachineDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, DatePicker, Input, Modal, Row, Space, message } from 'antd';
import confirm from 'antd/lib/modal/confirm';
import * as React from 'react';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import TableInvoice from './TableInvoice';
import SearchInvoice from './SearchInvoice';
import { eFormatPicker } from '@src/lib/enumconst';
import moment from 'moment';
import { SearchInputAdmin } from '@src/stores/statisticStore';

export default class Invoice extends React.Component {
    state = {
        isLoadDone: false,
        skipCount: 0,
        maxResultCount: 10,
        pageSize: 10,
        currentPage: 1,
        typeDate: undefined
    }
    inputSearch: SearchInputAdmin = new SearchInputAdmin(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    async componentDidMount() {
        await this.getAll();
    }

    async getAll() {
        this.setState({ isLoadDone: false });
        await stores.invoiceStore.getAll(this.state.skipCount, this.state.pageSize);
        this.setState({ isLoadDone: true });
    }

    onChangePage = async (page: number, pagesize?: number) => {
        if (pagesize !== undefined) {
            await this.setState({ pageSize: pagesize! });
        }
        this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            this.getAll();
        })
    }

    handleSubmitSearch = async () => {
        this.onChangePage(1, this.state.pageSize);
    }
    render() {
        let self = this;
        const { totalCount, listInvoice } = stores.invoiceStore;

        return (
            <Card>
                <Row gutter={[8, 8]}>
                    <Col span={18}>
                        <SearchInvoice onDataChanged={() => { }} />
                    </Col>
                </Row>
                <Row>
                    <div>
                    <h2 style={{ textAlign: 'center', paddingTop: '10px', fontWeight: 'bold' }}>
                        {this.state.typeDate == eFormatPicker.date ?
                            (!!this.inputSearch.start_date) ?

                                ((moment(this.inputSearch.start_date).format("DD/MM/YYYY") == moment(this.inputSearch.end_date).format("DD/MM/YYYY") || this.inputSearch.end_date == undefined) ?
                                    <>{"LỊCH SỬ PHÁT HÀNH HÓA ĐƠN ĐIỆN TỬ NGÀY " + moment(this.inputSearch.start_date).format("DD/MM/YYYY")}</>
                                    :
                                    <>{"LỊCH SỬ PHÁT HÀNH HÓA ĐƠN ĐIỆN TỬ TỪ NGÀY " + moment(this.inputSearch.start_date).format("DD/MM/YYYY") + " ĐẾN NGÀY " + moment(this.inputSearch.end_date).format("DD/MM/YYYY")}</>
                                )
                                :
                                <> LỊCH SỬ PHÁT HÀNH HÓA ĐƠN ĐIỆN TỬ</>
                            :
                            (this.state.typeDate == eFormatPicker.month ?
                                ((moment(this.inputSearch.start_date).format("MM/YYYY") == moment(this.inputSearch.end_date).format("MM/YYYY") || this.inputSearch.end_date == undefined) ?
                                    <>{"LỊCH SỬ PHÁT HÀNH HÓA ĐƠN ĐIỆN TỬ THÁNG " + moment(this.inputSearch.start_date).format("MM/YYYY")}</>
                                    :
                                    <>{"LỊCH SỬ PHÁT HÀNH HÓA ĐƠN ĐIỆN TỬ TỪ THÁNG " + moment(this.inputSearch.start_date).format("MM/YYYY") + " ĐẾN THÁNG " + moment(this.inputSearch.end_date).format("MM/YYYY")}</>
                                )
                                :
                                (this.state.typeDate == eFormatPicker.year ?
                                    ((moment(this.inputSearch.start_date).format("YYYY") == moment(this.inputSearch.end_date).format("YYYY") || this.inputSearch.end_date == undefined) ?
                                        <>{"LỊCH SỬ PHÁT HÀNH HÓA ĐƠN ĐIỆN TỬ NĂM " + moment(this.inputSearch.start_date).format("YYYY")}</>
                                        :
                                        <>{"LỊCH SỬ PHÁT HÀNH HÓA ĐƠN ĐIỆN TỬ TỪ NĂM " + moment(this.inputSearch.start_date).format("YYYY") + " ĐẾN NĂM " + moment(this.inputSearch.end_date).format("YYYY")}</>
                                    )
                                    : <> LỊCH SỬ PHÁT HÀNH HÓA ĐƠN ĐIỆN TỬ</>)
                            )
                        }
                    </h2>
                    </div>
                    <Col span={24}>
                        <TableInvoice
                            listInvoice={listInvoice}
                            pagination={{
                                position: ['topRight'],
                                pageSize: this.state.pageSize,
                                total: totalCount,
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
                    </Col>
                </Row>
            </Card >
        )
    }
}
