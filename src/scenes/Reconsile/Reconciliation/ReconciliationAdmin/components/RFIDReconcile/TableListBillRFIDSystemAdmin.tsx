import AppConsts, { EventTable, pageSizeOptions } from '@src/lib/appconst';
import { RfidLogDto } from '@src/services/services_autogen';
import { ColumnsType, ColumnGroupType, TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import { Button, Card, Col, Input, Row, Table, Tag } from 'antd';
import { eBillReconcileStatus, valueOfeBillReconcileStatus } from '@src/lib/enumconst';
import { DeleteOutlined, EditOutlined, HistoryOutlined, SearchOutlined } from '@ant-design/icons';
import { L } from '@src/lib/abpUtility';
import SelectEnumMulti from '@src/components/Manager/SelectEnumMulti';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { stores } from '@src/stores/storeInitializer';
import ModalExportRFIDReconcoleDetailAdmin from './ModalExportRFIDReconcoleDetailAdmin';


export interface IProps {
    isLoadDone?: boolean;
    rfidLogListCode?: number[];
    actionTable?: (item: RfidLogDto, event: EventTable) => void;
    hasAction?: boolean;
    visible?: boolean;
    rec_id?: number;
    onSuccess?: () => void;
    pagination?: TablePaginationConfig | false;
    isConfirm?: boolean;
    title?: string;
}

export default class TableBillingRFIDSystemAdmin extends React.Component<IProps> {
    state = {
        isLoadDone: true,
        rfid_code_selected: undefined,
        bi_code: undefined,
        rf_reconcile_status: undefined,
        bi_reconcile_reason: undefined,
        visibleUpdateStatusReconcile: false,
        visibleModalBillProduct: false,
        visibleModalLogReconcile: false,
        rfid_code_search: undefined,
        rifd_reconcile_status_search: [],
        searchTimeout: undefined,
        page: 10,
        currentPage: 1,
        visibleExport: false,
    }
    listDataRfidLog: RfidLogDto[] = [];
    listDataRfidLogFill: RfidLogDto[] = [];
    bi_code: string;
    reconcile_status: number[] = [];
    rfidLogSelected: RfidLogDto = new RfidLogDto();
    componentDidMount() {
        this.setState({ isLoadDone: false });
        this.getAll();
        this.setState({ isLoadDone: true });

    }
    onSuccess = () => {
        if (!!this.props.onSuccess) {
            this.props.onSuccess();
        }
    }
    getAll = async() => {
        await stores.rfidLogStore.getAllLogsByAdmin(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
        const { rfidLogListCode } = this.props;
        const { logRFIDListResult } = stores.rfidLogStore;
        this.listDataRfidLog = logRFIDListResult != undefined ? logRFIDListResult.filter(item => rfidLogListCode?.includes(item.rf_lo_id!)) : [];
        this.listDataRfidLogFill = this.listDataRfidLog;
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }
   async componentDidUpdate(prevProps) {
        if (this.props.isLoadDone != prevProps.isLoadDone) {
            this.setState({ isLoadDone: false });
           await this.getAll();
            this.setState({ isLoadDone: true });
        }
    }
    actionTable = (item: RfidLogDto, action: EventTable) => {
        this.setState({ rfid_code_selected: item.rf_code });
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action);
        }
    }
    clearSearch = async () => {
        this.setState({ isLoadDone: true });
        await this.setState({
            rfid_code_search: undefined,
            rifd_reconcile_status_search: []
        })
        this.reconcile_status = [];
        this.setState({ isLoadDone: false });

    }
    onSearchStatic = async () => {
        this.setState({ isLoadDone: false });
        this.listDataRfidLogFill = this.listDataRfidLog;
        if (this.state.rifd_reconcile_status_search.length > 0) {
            this.reconcile_status = this.state.rifd_reconcile_status_search;
            this.listDataRfidLogFill = this.listDataRfidLogFill.filter(item => this.reconcile_status?.includes(item.rf_reconcile_status));
        }
        if (this.state.rfid_code_search != undefined) {
            this.listDataRfidLogFill = this.listDataRfidLogFill.filter(item => item.rf_code?.includes(this.state.rfid_code_search!));
        }
        this.setState({ isLoadDone: true });
    }
    shouldChangeText = () => {
        const isChangeText = window.innerWidth >= 576 && window.innerWidth <= 992;
        return !!isChangeText;
    }
    handleInputChange = async (e) => {
        const value = e.target.value === "" ? undefined : e.target.value.trim();
        if (this.state.searchTimeout) {
            clearTimeout(this.state.searchTimeout);
        }
        await this.setState({ rfid_code_search: value });
        const newTimeout = setTimeout(async () => {
            await this.onSearchStatic();
        }, 1000);
        await this.setState({ searchTimeout: newTimeout });
    };
    render() {
        const { hasAction } = this.props
        const action: ColumnGroupType<RfidLogDto> = {
            title: "",
            width: 100,
            key: "action_billing_reconcile",
            fixed: 'right',
            children: [],
            render: (_: any, record: RfidLogDto) => {
                return (
                    <>
                        {record.rf_reconcile_status === eBillReconcileStatus.DONE.num ?
                            <Button
                                type="primary" icon={<HistoryOutlined />} title={L('Lịch sửa đối soát')}
                                size='small'
                                onClick={() => this.actionTable(record, EventTable.View)}

                            ></Button> :
                            <>
                                {!this.props.isConfirm &&
                                    <Button
                                        type="primary" icon={<EditOutlined />} title={L('Cập nhật trạng thái đối soát đơn hàng')}
                                        size='small'
                                        onClick={() => this.actionTable(record, EventTable.Edit)}>
                                    </Button>}
                                &nbsp;
                                <Button
                                    type="primary" icon={<HistoryOutlined />} title={L('Lịch sử đối soát')}
                                    size='small'
                                    onClick={() => this.actionTable(record, EventTable.View)}>
                                </Button>
                            </>
                        }
                    </>)
            }
        };
        const columns: ColumnsType<RfidLogDto> = [
            { title: "STT", key: "stt_drink_index", width: 50, render: (text: string, item: RfidLogDto, index: number) => <div>{this.state.page! * (this.state.currentPage! - 1) + (index + 1)}</div> },
            {
                title: "Mã giao dịch", key: "im_code", className: "hoverCell", render: (text: string, item: RfidLogDto, index: number) => <>{item.rf_code}</>
            },
            {
                title: L('Tiền nạp'), dataIndex: 'bi_money_original', key: 'bi_money_original', render: (text: string, item: RfidLogDto, index: number) =>
                    <div >{AppConsts.formatNumber(item.rf_lo_money)}</div>
            },
            {
                title: L('Trạng thái đối soát'), width: "20%", dataIndex: 'rf_reconcile_status', key: 'rf_reconcile_status', render: (text: string, item: RfidLogDto, index: number) =>
                    <div title={valueOfeBillReconcileStatus(item.rf_reconcile_status)}>
                        {
                            hasAction != undefined && hasAction == true ?
                                <>
                                    {
                                        eBillReconcileStatus.DONE.num == item.rf_reconcile_status && <Tag color='green'>{valueOfeBillReconcileStatus(item.rf_reconcile_status)}</Tag>
                                    }
                                    {
                                        eBillReconcileStatus.DOING.num == item.rf_reconcile_status && <Tag color='blue'>{valueOfeBillReconcileStatus(item.rf_reconcile_status)}</Tag>
                                    }
                                    {
                                        eBillReconcileStatus.ERROR.num == item.rf_reconcile_status && <Tag color='orange'>{valueOfeBillReconcileStatus(item.rf_reconcile_status)}</Tag>
                                    }
                                    {
                                        eBillReconcileStatus.NONE.num == item.rf_reconcile_status && <Tag color='red'>{valueOfeBillReconcileStatus(item.rf_reconcile_status)}</Tag>
                                    }
                                </>
                                : <>{valueOfeBillReconcileStatus(item.rf_reconcile_status)}</>
                        }
                    </div>
            },
            {
                title: L('Lý do lỗi'), dataIndex: 'bi_reconcile_reason', key: 'bi_reconcile_reason', render: (text: string, item: RfidLogDto, index: number) =>
                    <div dangerouslySetInnerHTML={{ __html: item.rf_reconcile_reason! }}></div>
            },
            { title: "Ngày tạo đối soát", key: "ma_id_bill_index", render: (text: string, item: RfidLogDto) => <div> {moment(item.rf_lo_created_at).format("DD/MM/YYYY")} </div> },
            { title: "Thời gian giao dịch", key: "ma_id_bill_index", render: (text: string, item: RfidLogDto) => <div> {moment(item.rf_reconcile_at).format("DD/MM/YYYY HH:mm:ss A")} </div> },
        ]
        if (hasAction != undefined && hasAction === true) {
            columns.push(action);
        }
        return (
            <Card>
                <Row gutter={[8, 8]} align='bottom'>
                    <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
                        <TitleTableModalExport title='Danh sách chi tiết nạp tiền hệ thống'></TitleTableModalExport>
                    </Col>
                    {hasAction != undefined && hasAction === true ?
                        <Row style={{ width: "100%" }} gutter={16} >
                            <Col span={4} style={{ width: "100%", textAlign: 'left' }}>
                                <strong>Mã hóa đơn</strong>
                                <Input allowClear
                                    onChange={(e) => { this.handleInputChange(e); this.onSearchStatic() }}
                                    value={this.state.rfid_code_search}
                                    placeholder='Nhập mã hóa đơn'>
                                </Input>
                            </Col>
                            <Col span={8} style={{ width: "100%", textAlign: 'left' }}>
                                <strong>Trạng thái đối soát</strong>
                                <SelectEnumMulti
                                    eNum={eBillReconcileStatus}
                                    placeholder='Trạng thái đơn hàng'
                                    onChangeEnum={async (e) => {
                                        await this.setState({ rifd_reconcile_status_search: e }); this.onSearchStatic();
                                    }}
                                    enum_value={this.reconcile_status} />
                            </Col>
                            <Col span={6} style={{ display: 'flex', justifyContent: 'start', alignItems: 'end' }} >
                                <Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={() => this.onSearchStatic()} >Tìm kiếm</Button>&nbsp;
                                {
                                    (!!this.state.rfid_code_search || !!this.state.rifd_reconcile_status_search) &&
                                    <Button danger icon={<DeleteOutlined />} title={"Xóa tìm kiếm"} onClick={async () => await this.clearSearch()} >{this.shouldChangeText() ? 'Xóa' : 'Xóa tìm kiếm'}</Button>
                                }
                            </Col>
                            <Col span={6} style={{ display: 'flex', justifyContent: 'end', alignItems: 'end' }} >
                                <Button type='primary' onClick={() => this.setState({ visibleExport: true })}> Xuất dữ liệu</Button>
                            </Col>
                        </Row>
                        : ""}
                </Row>
                <Table
                    className='centerTable'
                    scroll={(hasAction != undefined && hasAction === true) ? { y: 600 } : { x: undefined, y: undefined }}
                    columns={columns}
                    size={'middle'}
                    bordered={true}
                    dataSource={this.listDataRfidLogFill}
                    rowKey={record => "billing_table" + JSON.stringify(record)}

                    pagination={this.props.hasAction != false ? {

                        onChange: (page: number, pageSize?: number | undefined) => {
                            this.setState({ page: pageSize, currentPage: page })
                        },
                        position: ['topRight'],
                        showTotal: (tot) => "Tổng" + ": " + tot + "",
                        showQuickJumper: true,
                        showSizeChanger: true,
                        pageSizeOptions: pageSizeOptions,
                    } : false
                    }
                />
                {this.state.visibleExport &&
                    <ModalExportRFIDReconcoleDetailAdmin
                        visible={this.state.visibleExport}
                        listRfidId={this.listDataRfidLogFill.map(item => item.rf_lo_id)}
                        onCancel={() => this.setState({ visibleExport: false })}
                    />
                }
            </Card>
        )
    }

}