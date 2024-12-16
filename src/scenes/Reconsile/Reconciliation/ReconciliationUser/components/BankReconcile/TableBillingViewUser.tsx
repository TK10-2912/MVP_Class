import AppConsts, { EventTable } from '@src/lib/appconst';
import { BillingDto } from '@src/services/services_autogen';
import { ColumnsType, ColumnGroupType, TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import { Button, Col, Input, Row, Space, Table, Tag } from 'antd';
import { eBillReconcileStatus, eBillRequiredFund, valueOfeBillReconcileStatus, valueOfeBillRequiredFund } from '@src/lib/enumconst';
import { stores } from '@src/stores/storeInitializer';
import { DeleteOutlined, EditOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { L } from '@src/lib/abpUtility';
import { Link } from 'react-router-dom';
import ModalTableBillingViewAdmin from '@src/scenes/StatisticalReport/TabPayment/BankingPayment/componentAdmin/ModalTableBillingViewAdmin';
import SelectEnumMulti from '@src/components/Manager/SelectEnumMulti';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';


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
    isPrint?: boolean;
}

export default class TableBillingViewUser extends React.Component<IProps> {
    state = {
        isLoadDone: true,
        bi_id_selected: undefined,
        bi_code: undefined,
        bi_reconcile_status: undefined,
        bi_reconcile_reason: undefined,
        visibleUpdateStatusReconcile: false,
        visibleModalBillProduct: false,
        visibleModalLogReconcile: false,
        bi_reconcile_status_search: [] as number[],
        bi_required_refund_search: [] as number[],
        bi_code_search: undefined,
        searchTimeout: undefined,
    }
    listDataBill: BillingDto[] = [];
    listDataBillFill: BillingDto[] = [];
    reconcile_status: number[] = [];
    required_refund: number[] = [];
    bi_code: string;
    billingSelected: BillingDto = new BillingDto();

    async componentDidMount() {
        this.setState({ isLoadDone: false });
        await this.fillBillViewUser();
        this.setState({ isLoadDone: true });
    }

    fillBillViewUser = () => {
        const { listBillId, billListResult } = this.props;
        this.listDataBill = billListResult!.filter(bill => listBillId?.includes(bill.bi_id));
        this.listDataBillFill = this.listDataBill;
    }
    onSuccess = async () => {
        await this.setState({ isLoadDone: false });
        if (!!this.props.onSuccess) {
            this.props.onSuccess();
        }
        await this.setState({ isLoadDone: true });
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
        this.setState({ isLoadDone: false });

    }
    onSearchStatic = async () => {
        this.setState({ isLoadDone: false });
        let filteredList = this.listDataBill || [];
        if (this.state.bi_reconcile_status_search.length > 0) {
            filteredList = filteredList.filter(bill => this.state.bi_reconcile_status_search.includes(bill.bi_reconcile_status));
        }
        if (this.state.bi_required_refund_search.length > 0) {
            filteredList = filteredList.filter(bill => this.state.bi_required_refund_search.includes(bill.bi_required_refund));
        }
        if (this.state.bi_code_search) {
            filteredList = filteredList?.filter(item => item.bi_code?.includes(this.state.bi_code_search!));
        }
        this.listDataBillFill = filteredList;
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
    render() {
        const { hasAction } = this.props
        const action: ColumnGroupType<BillingDto> = {
            title: "Chức năng",
            width: 100,
            key: "action_billing_reconcile",
            fixed: 'right',
            children: [],
            render: (_: any, record: BillingDto) => {
                return (
                    <Space>
                        {record.bi_reconcile_status === eBillReconcileStatus.DONE.num
                            ?
                            <Button
                                type="primary" icon={<EyeOutlined />} title={L('Lịch sửa đối soát')}
                                size='small'
                                onClick={() => this.actionTable(record, EventTable.View)}
                            >
                            </Button>
                            :
                            <>
                                {!this.props.isConfirm &&
                                    <Button
                                        type="primary" icon={<EditOutlined />} title={L('Cập nhật trạng thái đối soát đơn hàng')}
                                        size='small'
                                        onClick={() => this.actionTable(record, EventTable.Edit)}>
                                    </Button>}
                                <Button
                                    type="primary" icon={<EyeOutlined />} title={L('Lịch sử đối soát')}
                                    size='small'
                                    onClick={() => this.actionTable(record, EventTable.View)}>
                                </Button>
                            </>
                        }
                    </Space>
                )
            }
        };
        const columns: ColumnsType<BillingDto> = [
            { title: "STT", key: "stt_drink_index", width: 50, render: (text: string, item: BillingDto, index: number) => <div>{index + 1}</div> },
            {
                title: "Mã hoá đơn", key: "im_code", width: 150, className: "hoverCell",
                onCell: (record) => {
                    return {
                        onClick: async () => {
                            if (record.bi_required_refund === eBillRequiredFund.NONE.num) {
                                this.billingSelected = this.props.billListResult?.filter(item => item.bi_code === record.bi_code)[0]!;
                                this.setState({ visibleModalBillProduct: true });
                            }
                        }
                    }
                },
                render: (text: string, item: BillingDto) => <div>
                    {
                        item.bi_required_refund === eBillRequiredFund.NONE.num
                            ?
                            `${item.bi_code}- ${stores.sessionStore.getBiCodeMachine(item.bi_code!)}`
                            :
                            <Link to={"/reconsile/refund?bi_code=" + (item.bi_code)} target='_blank' >
                                {item.bi_code + "-" + stores.sessionStore.getBiCodeMachine(item.bi_code!)}
                            </Link>
                    }
                </div>
            },
            {
                title: L('Tiền đơn hàng'), dataIndex: 'bi_money_original', key: 'bi_money_original', width: 120, render: (text: string, item: BillingDto, index: number) =>
                    <div >{AppConsts.formatNumber(item.bi_money_original)}</div>
            },
            {
                title: L('Trạng thái đối soát'), dataIndex: 'bi_reconcile_status', key: 'bi_reconcile_status', width: 300, render: (text: string, item: BillingDto, index: number) =>
                    <>
                        {
                            hasAction != undefined && hasAction == true
                                ?
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
                                :
                                <>
                                    {valueOfeBillReconcileStatus(item.bi_reconcile_status)}
                                </>
                        }

                    </>
            },
            {
                title: "Trạng thái hoàn tiền", key: "ma_id_bill_index", width: 250, render: (text: string, item: BillingDto) => <div>
                    <>
                        {
                            this.props.isPrint != undefined && this.props.isPrint == true ?
                                <>
                                    {valueOfeBillRequiredFund(item.bi_required_refund)}
                                </>
                                :
                                <>
                                    {
                                        eBillRequiredFund.NONE.num == item.bi_required_refund && <Tag color='red'>{valueOfeBillRequiredFund(item.bi_required_refund)}</Tag>
                                    }
                                    {
                                        eBillRequiredFund.REFUNDED.num == item.bi_required_refund && <Tag color='blue'>{valueOfeBillRequiredFund(item.bi_required_refund)}</Tag>
                                    }
                                    {
                                        eBillRequiredFund.REQUEST_REFUND.num == item.bi_required_refund && <Tag color='green'>{valueOfeBillRequiredFund(item.bi_required_refund)}</Tag>
                                    }
                                </>
                        }

                    </>
                </div>
            },
            { title: "Thời gian giao dịch", key: "ma_id_bill_index", render: (text: string, item: BillingDto) => <div> {moment(item.bi_created_at).format("DD/MM/YYYY HH:mm:ss")} </div> },
            { title: "Thời gian tạo đối soát", key: "ma_id_bill_index", render: (text: string, item: BillingDto) => <div> {moment(item.bi_reconcile_at).format("DD/MM/YYYY  HH:mm:ss")} </div> },
            {
                title: L('Lý do lỗi'), dataIndex: 'bi_reconcile_reason', key: 'bi_reconcile_reason', render: (text: string, item: BillingDto, index: number) =>
                    <div dangerouslySetInnerHTML={{ __html: item.bi_reconcile_reason! }}></div>
            },
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
                    {
                        hasAction != undefined && hasAction === true &&
                        <Row align='bottom' gutter={8} style={{ display: "contents" }}>
                            <Col span={6}>
                                <strong>Mã hóa đơn</strong>
                                <Input
                                    allowClear
                                    placeholder='Nhập...'
                                    onChange={(e) => this.handleInputChange(e)}
                                    value={this.state.bi_code_search}>
                                </Input>
                            </Col>

                            <Col span={6} style={{ width: "100%" }} >
                                <strong>Trạng thái đơn hàng</strong>
                                <SelectEnumMulti
                                    eNum={eBillReconcileStatus}
                                    onChangeEnum={async (e) => {
                                        await this.setState({ bi_reconcile_status_search: e }); this.onSearchStatic();
                                    }}
                                    enum_value={this.reconcile_status}
                                />
                            </Col>
                            <Col span={6}>
                                <strong>Hoàn tiền</strong>
                                <SelectEnumMulti
                                    eNum={eBillRequiredFund}
                                    onChangeEnum={async (e) => { await this.setState({ bi_required_refund_search: e }); this.onSearchStatic() }}
                                    enum_value={this.required_refund} />
                            </Col>
                            <Col span={6} style={{ display: 'flex' }}>
                                <Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={this.onSearchStatic} >Tìm kiếm</Button> &nbsp;
                                {
                                    (this.state.bi_reconcile_status_search.length > 0 || this.state.bi_required_refund_search.length > 0 || !!this.state.bi_code_search) &&
                                    <Button danger icon={<DeleteOutlined />} title={"Xóa tìm kiếm"} onClick={async () => await this.clearSearch()} >{this.shouldChangeText() ? 'Xóa' : 'Xóa tìm kiếm'}</Button>
                                }
                            </Col>
                        </Row>
                    }
                </Row>
                <Table

                    className='centerTable'
                    scroll={this.props.hasAction == false ? { x: undefined, y: undefined } : { x: 1400, y: 600 }}
                    columns={columns}
                    size={'small'}
                    bordered={true}
                    locale={{ "emptyText": "Không có dữ liệu" }}
                    dataSource={(this.state.bi_reconcile_status_search.length == 0 && this.state.bi_required_refund_search.length == 0 && this.state.bi_code_search == undefined) ? this.listDataBill : this.listDataBillFill}
                    rowKey={record => "billing_table" + JSON.stringify(record)}
                    pagination={this.props.hasAction != false ? {
                        showTotal: (tot) => "Tổng" + ": " + tot + "",
                        showQuickJumper: true,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100', '200', '300', '400', '500'],
                    } : false
                    }
                />
                <ModalTableBillingViewAdmin
                    billSelected={this.billingSelected}
                    visibleModalBillProduct={this.state.visibleModalBillProduct}
                    onCancel={() => this.setState({ visibleModalBillProduct: false })}

                    listItem={this.billingSelected.entities_id_arr}
                />
            </>
        )
    }

}