
import { ExportOutlined, PlusCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { isGranted, L } from '@src/lib/abpUtility';
import { GroupMachineDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Input, Modal, Row, Space, message } from 'antd';
import confirm from 'antd/lib/modal/confirm';
import * as React from 'react';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import TableInvoice from './TableInvoice';

export default class Invoice extends React.Component {
    state = {
        isLoadDone: false,
        skipCount: 0,
        maxResultCount: 10,
        pageSize: 10,
        currentPage: 1,
    }

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
                    <Col {...cssColResponsiveSpan(24, 24, 12, 16, 16, 16)} style={{ display: 'flex' }}>
                        <Input style={{ width: '90%', height: "32px" }} placeholder={"Nhập tìm kiếm nhóm máy..."} allowClear onChange={(e) => { this.setState({ ma_search: e.target.value ? e.target.value : "" }); this.handleSubmitSearch() }} onPressEnter={() => this.handleSubmitSearch()}></Input> &nbsp;
                        <Button type='primary' onClick={() => this.handleSubmitSearch()}><SearchOutlined />Tìm kiếm</Button>
                    </Col>

                </Row>
                <Row>
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
