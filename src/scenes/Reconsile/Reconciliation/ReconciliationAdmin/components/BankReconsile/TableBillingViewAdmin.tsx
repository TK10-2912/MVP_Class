import AppConsts, { EventTable, pageSizeOptions } from '@src/lib/appconst';
import { BillingDto } from '@src/services/services_autogen';
import { ColumnsType, ColumnGroupType, TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import { Button, Col, Input, Row, Space, Table, Tag, message } from 'antd';
import { eBillReconcileStatus, eBillRequiredFund, valueOfeBillReconcileStatus, valueOfeBillRequiredFund, valueOfeReconcileStatus } from '@src/lib/enumconst';
import { stores } from '@src/stores/storeInitializer';
import { DeleteOutlined, EditOutlined, EyeOutlined, HistoryOutlined, SearchOutlined } from '@ant-design/icons';
import { L } from '@src/lib/abpUtility';
import { Link } from 'react-router-dom';
import ModalTableBillingViewAdmin from '@src/scenes/StatisticalReport/TabPayment/BankingPayment/componentAdmin/ModalTableBillingViewAdmin';
import SelectEnumMulti from '@src/components/Manager/SelectEnumMulti';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import ModalExportBankReconcoleUserDetailAdmin from './ModalExportBankReconcoleUserDetailAdmin';


export interface IProps {
    isLoadDone?: boolean;
    billListResult?: BillingDto[];
    listBillId?: number[];
    actionTable?: (item: BillingDto, event: EventTable) => void;
    hasAction?: boolean;
    visible?: boolean;
    rec_id?: number;
    onSuccess?: () => void;
    pagination?: TablePaginationConfig | false;
    isConfirm?: boolean;
    title?: string;
    onChangeData?: (item: BillingDto[]) => void;
}

export default class TableBillingViewAdmin extends React.Component<IProps> {
    state = {
        isLoadDone: true,
        bi_id_selected: undefined,
        bi_code: undefined,
        bi_reconcile_status: undefined,
        bi_reconcile_reason: undefined,
        visibleUpdateStatusReconcile: false,
        visibleModalBillProduct: false,
        visibleModalLogReconcile: false,
        visibleExport: false,
        bi_reconcile_status_search: [],
        bi_required_refund_search: [],
        bi_code_search: undefined,
        searchTimeout: undefined,
        page: 10,
        currentPage: 1,
        rowSelection: undefined,
    }
    componentRef: any | null = null;
    listDataBill: BillingDto[] = [];
    listDataBillFill: BillingDto[] = [];
    reconcile_status: number[] = [];
    required_refund: number[] = [];
    bi_code: string;
    billingSelected: BillingDto = new BillingDto();
    componentDidMount() {
        this.setState({ isLoadDone: false });
        const { listBillId, billListResult } = this.props;
        this.listDataBill = billListResult != undefined ? billListResult.filter(bill => listBillId?.includes(bill.bi_id)) : [];
        this.setState({ isLoadDone: true });
    }
    onSuccess = () => {
        if (!!this.props.onSuccess) {
            this.props.onSuccess();
        }
    }
    async componentDidUpdate(prevProps) {
        if (this.props.isLoadDone != prevProps.isLoadDone) {
            const { listBillId, billListResult } = this.props;
            this.setState({ isLoadDone: false });
            this.listDataBill = billListResult != undefined ? billListResult.filter(bill => listBillId?.includes(bill.bi_id)) : [];
            this.listDataBillFill = this.listDataBill;
            this.setState({ isLoadDone: true });
        }
    }
    actionTable = (item: BillingDto, action: EventTable) => {
        this.setState({ bi_id_selected: item.bi_id });
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action);
        }
    }
    clearSearch = async () => {
        this.setState({ isLoadDone: true });
        await this.setState({
            bi_reconcile_status_search: [],
            bi_required_refund_search: [],
            bi_code_search: undefined,
        })
        this.reconcile_status = [];
        this.required_refund = [];
        this.onSearchStatic();
        this.setState({ isLoadDone: false });

    }
    onSearchStatic = async () => {
        this.setState({ isLoadDone: false });
        this.listDataBillFill = this.listDataBill;

        if (this.state.bi_reconcile_status_search.length > 0) {
            this.reconcile_status = this.state.bi_reconcile_status_search;
            this.listDataBillFill = this.listDataBill.filter(bill => this.reconcile_status?.includes(bill.bi_reconcile_status));
        }
        if (this.state.bi_required_refund_search.length > 0) {
            this.required_refund = this.state.bi_required_refund_search;
            this.listDataBillFill = this.listDataBill.filter(bill => this.required_refund?.includes(bill.bi_required_refund));
        }
        if (this.state.bi_code_search != undefined) {
            this.listDataBillFill = this.listDataBill.filter(item => item.bi_code?.includes(this.state.bi_code_search!));
        }
        this.props.onChangeData!(this.listDataBillFill);
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
        await this.setState({ bi_code_search: value });
        const newTimeout = setTimeout(async () => {
            await this.onSearchStatic();
        }, 1000);
        await this.setState({ searchTimeout: newTimeout });
    };
    setComponentRef = (ref) => {
        this.setState({ isLoadDone: false });
        this.componentRef = ref;
        this.setState({ isLoadDone: true });
    }
    render() {
        const { hasAction } = this.props
        const action: ColumnGroupType<BillingDto> = {
            title: "",
            width: 100,
            key: "action_billing_reconcile",
            fixed: 'right',
            children: [],
            render: (_: any, record: BillingDto) => {
                return (
                    <>{record.bi_reconcile_status === eBillReconcileStatus.DONE.num ?
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
        const columns: ColumnsType<BillingDto> = [
            { title: "STT", key: "stt_drink_index", width: 50, render: (text: string, item: BillingDto, index: number) => <div>{this.state.page! * (this.state.currentPage! - 1) + (index + 1)}</div> },
            {
                title: "Mã đơn hàng", key: "im_code", className: "hoverCell",
                onCell: (record) => {
                    return {
                        onClick: async () => {
                            if (record.bi_required_refund === eBillRequiredFund.NONE.num) {
                                this.billingSelected = this.listDataBill.find(item => item.bi_code == record.bi_code)!;
                                this.setState({ visibleModalBillProduct: true });
                            }
                        }
                    }
                },
                render: (text: string, item: BillingDto) => <div>{item.bi_required_refund === eBillRequiredFund.NONE.num ? `${item.bi_code}- ${stores.sessionStore.getBiCodeMachine(item.bi_code!)}` : <Link to={"/reconsile/refund?bi_code=" + (item.bi_code)} target='_blank' >
                    {item.bi_code + "-" + stores.sessionStore.getBiCodeMachine(item.bi_code!)}
                </Link>}</div>
            },
            {
                title: L('Tiền đơn hàng'), dataIndex: 'bi_money_original', key: 'bi_money_original', render: (text: string, item: BillingDto, index: number) =>
                    <div >{AppConsts.formatNumber(item.bi_money_original)}</div>
            },
            {
                title: "Trạng thái hoàn tiền", onCell: (record) => {
                    return {
                        onClick: async () => {
                            if (record.bi_reconcile_status == eBillReconcileStatus.DONE.num) {
                                this.actionTable(record, EventTable.Edit)
                            }
                        }
                    }
                }, width: "20%", className: 'pointHover', key: "ma_id_bill_index", render: (text: string, item: BillingDto) => <div >
                    {(hasAction != undefined && hasAction == true) ?
                        <>
                            {
                                eBillRequiredFund.NONE.num == item.bi_required_refund && <Tag color='orange'>{valueOfeBillRequiredFund(item.bi_required_refund)}</Tag>
                            }
                            {
                                eBillRequiredFund.REQUEST_REFUND.num == item.bi_required_refund && <Tag color='blue'>{valueOfeBillRequiredFund(item.bi_required_refund)}</Tag>
                            }
                            {
                                eBillRequiredFund.REFUNDED.num == item.bi_required_refund && <Tag color='green'>{valueOfeBillRequiredFund(item.bi_required_refund)}</Tag>
                            }
                        </>
                        :
                        valueOfeBillRequiredFund(item.bi_required_refund)
                    }
                </div>
            },
            {
                title: L('Trạng thái đối soát'), width: "20%", dataIndex: 'bi_reconcile_status', key: 'bi_reconcile_status', render: (text: string, item: BillingDto, index: number) =>
                    <div title={valueOfeBillReconcileStatus(item.bi_reconcile_status)}>
                        {
                            (hasAction != undefined && hasAction == true) ?
                                <>
                                    {
                                        eBillReconcileStatus.DONE.num == item.bi_reconcile_status && <Tag color='green'>{valueOfeBillReconcileStatus(item.bi_reconcile_status)}</Tag>
                                    }
                                    {
                                        eBillReconcileStatus.DOING.num == item.bi_reconcile_status && <Tag color='blue'>{valueOfeBillReconcileStatus(item.bi_reconcile_status)}</Tag>
                                    }
                                    {
                                        eBillReconcileStatus.ERROR.num == item.bi_reconcile_status && <Tag color='orange'>{valueOfeBillReconcileStatus(item.bi_reconcile_status)}</Tag>
                                    }
                                    {
                                        eBillReconcileStatus.NONE.num == item.bi_reconcile_status && <Tag color='red'>{valueOfeBillReconcileStatus(item.bi_reconcile_status)}</Tag>
                                    }
                                </>
                                : <>{valueOfeBillReconcileStatus(item.bi_reconcile_status)}</>
                        }

                    </div>
            },
            {
                title: L('Lý do lỗi'), dataIndex: 'bi_reconcile_reason', key: 'bi_reconcile_reason', render: (text: string, item: BillingDto, index: number) =>
                    <div dangerouslySetInnerHTML={{ __html: item.bi_reconcile_reason! }}></div>
            },
            { title: "Thời gian tạo đối soát", sorter: (a: BillingDto, b: BillingDto) => moment(a.bi_reconcile_at).unix() - moment(b.bi_reconcile_at).unix(), key: "ma_id_bill_index", render: (text: string, item: BillingDto) => <div> {moment(item.bi_reconcile_at).format("DD/MM/YYYY  hh:mm")} </div> },
            { title: "Thời gian giao dịch", sorter: (a: BillingDto, b: BillingDto) => moment(a.bi_created_at).unix() - moment(b.bi_created_at).unix(), key: "ma_id_bill_index", render: (text: string, item: BillingDto) => <div> {moment(item.bi_created_at).format("DD/MM/YYYY HH:mm:ss A")} </div> },
        ]
        if (hasAction != undefined && hasAction === true) {
            columns.push(action);
        }
        return (
            <>
                <Row gutter={[8, 8]} align='bottom'>
                    <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
                        <TitleTableModalExport title='Danh sách đơn hàng đối soát với hệ thống'></TitleTableModalExport>
                    </Col>
                    {hasAction != undefined && hasAction === true ?
                        <>
                            <Col span={4} style={{ width: "100%", textAlign: 'left' }}>
                                <strong>Mã hóa đơn</strong>
                                <Input allowClear
                                    placeholder='Mã hóa đơn '
                                    onChange={(e) => { this.handleInputChange(e); this.onSearchStatic() }}
                                    value={this.state.bi_code_search}>
                                </Input>
                            </Col>
                            <Col span={6} style={{ width: "100%", textAlign: 'left' }} >
                                <strong>Trạng thái đối soát</strong>
                                <SelectEnumMulti
                                    placeholder='Trạng thái đối soát'
                                    eNum={eBillReconcileStatus}
                                    onChangeEnum={async (e) => {
                                        await this.setState({ bi_reconcile_status_search: e }); await this.onSearchStatic();
                                    }}
                                    enum_value={this.reconcile_status} />
                            </Col>
                            <Col span={6} style={{ width: "100%", textAlign: 'left' }}>
                                <strong>Trạng thái hoàn tiền</strong>
                                <SelectEnumMulti
                                    eNum={eBillRequiredFund}
                                    placeholder='Trạng thái hoàn tiền'
                                    onChangeEnum={async (e) => { await this.setState({ bi_required_refund_search: e }); await this.onSearchStatic() }}
                                    enum_value={this.required_refund} />
                            </Col>

                            <Col span={6} style={{ display: 'flex', justifyContent: 'start' }}>
                                <Button type="primary" icon={<SearchOutlined />} title="Tìm kiếm" onClick={() => this.onSearchStatic()} >Tìm kiếm</Button> &nbsp;
                                {
                                    (this.state.bi_reconcile_status_search.length > 0 || this.state.bi_required_refund_search.length > 0 || !!this.state.bi_code_search) &&
                                    <Button danger icon={<DeleteOutlined />} title={"Xóa tìm kiếm"} onClick={async () => await this.clearSearch()} >{this.shouldChangeText() ? 'Xóa' : 'Xóa tìm kiếm'}</Button>
                                }
                            </Col>
                            <Col span={2} style={{ display: 'flex', justifyContent: 'end' }} >
                                <Button type='primary' onClick={() => this.setState({ visibleExport: true })}> Xuất dữ liệu</Button>
                            </Col>
                        </>
                        : ""}
                </Row>
                <Table
                    className='centerTable customTable'
                    scroll={(hasAction != undefined && hasAction === true) ? { x: 1700, y: 600 } : { x: undefined, y: undefined }}
                    columns={columns}
                    size={'middle'}
                    bordered={true}
                    dataSource={(this.state.bi_reconcile_status_search.length > 0 || this.state.bi_required_refund_search.length > 0 || this.state.bi_code_search != undefined) ? this.listDataBillFill : this.listDataBill}//
                    rowKey={record => "billing_table" + JSON.stringify(record)}
                    pagination={this.props.hasAction && {
                        position: ['topRight'],
                        showTotal: (tot) => "Tổng" + ": " + tot + "",
                        showQuickJumper: true,
                        showSizeChanger: true,
                        pageSizeOptions: pageSizeOptions,
                        onChange: (page: number, pageSize?: number | undefined) => {
                            this.setState({ page: pageSize, currentPage: page })
                        }
                    }}
                    rowClassName={(record) => (this.state.rowSelection === record) ? "bg-click" : "bg-white"}
                />
                {this.state.visibleExport &&
                    <ModalExportBankReconcoleUserDetailAdmin
                        visible={this.state.visibleExport}
                        listId={this.props.listBillId != undefined ? this.props.listBillId : []}
                        onCancel={() => this.setState({ visibleExport: false })}
                        billListResult={(this.state.bi_reconcile_status_search.length > 0 || this.state.bi_required_refund_search.length > 0 || this.state.bi_code_search != undefined) ? this.listDataBillFill : this.listDataBill}
                    />
                }
                <ModalTableBillingViewAdmin
                    billSelected={this.billingSelected}
                    visibleModalBillProduct={this.state.visibleModalBillProduct}
                    onCancel={() => this.setState({ visibleModalBillProduct: false })}
                    listItem={this.billingSelected.entities_id_arr != undefined ? this.billingSelected.entities_id_arr : []}
                />
            </>
        )
    }

}   