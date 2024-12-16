import AppConsts, { EventTable } from '@src/lib/appconst';
import { BillingDto } from '@src/services/services_autogen';
import { ColumnsType, ColumnGroupType, TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import { Button, Col, Input, Row, Table, Tag } from 'antd';
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
}

export default class TableBillingRFIDSystemUser extends React.Component<IProps> {
    state = {
        isLoadDone: true,
        bi_id_selected: undefined,
        bi_code: undefined,
        bi_reconcile_status: undefined,
        bi_reconcile_reason: undefined,
        visibleUpdateStatusReconcile: false,
        visibleModalBillProduct: false,
        visibleModalLogReconcile: false,
        bi_code_search: undefined,
        bi_reconcile_status_search: [],
        searchTimeout:undefined,
    }
    listDataBill: BillingDto[] = [];
    listDataBillFill: BillingDto[] = [];
    bi_code: string;
    reconcile_status:number[]=[];
    billingSelected: BillingDto = new BillingDto();
    componentDidMount() {
        this.setState({ isLoadDone: false });
        const { listBillId, billListResult } = this.props;
        this.listDataBill = billListResult != undefined ? billListResult.filter(bill => listBillId?.includes(bill.bi_id)) : [];
        this.listDataBillFill = this.listDataBill;
        this.setState({ isLoadDone: true });

    }
    onSuccess = () => {
        if (!!this.props.onSuccess) {
            this.props.onSuccess();
        }
    }
    componentDidUpdate(prevProps) {
        if (this.props.isLoadDone != prevProps.isLoadDone) {
            this.setState({ isLoadDone: false });
            const { listBillId, billListResult } = this.props;
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
            bi_code_search: undefined,
            bi_reconcile_status_search:[]
        })
        this.reconcile_status = [];
        this.setState({ isLoadDone: false });

    }
    onSearchStatic = async () => {
        this.setState({ isLoadDone: false });
        if (this.state.bi_reconcile_status_search.length > 0) {
            this.reconcile_status = this.state.bi_reconcile_status_search;
            this.listDataBillFill = this.listDataBill != undefined ? this.listDataBill.filter(bill => this.reconcile_status?.includes(bill.bi_reconcile_status)) : [];
        }
        if (this.state.bi_code_search != undefined) {
            this.listDataBillFill = this.listDataBill != undefined ? this.listDataBill.filter(item => item.bi_code?.includes(this.state.bi_code_search!)) : [];
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
        await this.setState({ bi_code_search: value });
        const newTimeout = setTimeout(async () => {
            await this.onSearchStatic();
        }, 1000);
        await this.setState({ searchTimeout: newTimeout });
    };
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
                            type="primary" icon={<EyeOutlined />} title={L('Lịch sửa đối soát')}
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
                                type="primary" icon={<EyeOutlined />} title={L('Lịch sử đối soát')}
                                size='small'
                                onClick={() => this.actionTable(record, EventTable.View)}>
                            </Button>
                        </>
                    }
                    </>)
            }
        };
        const columns: ColumnsType<BillingDto> = [
            { title: "STT", key: "stt_drink_index", width: 50, render: (text: string, item: BillingDto, index: number) => <div>{index + 1}</div> },
            {
                title: "Mã đơn hàng", key: "im_code", className: "hoverCell",
                onCell: (record) => {
                    return {
                        onClick: async () => {
                            if (record.bi_required_refund === eBillRequiredFund.NONE.num) {
                                await stores.billingStore.getAll(record.bi_code, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
                                const { billListResult } = stores.billingStore;
                                this.billingSelected = billListResult[0];
                                this.setState({ visibleModalBillProduct: true });
                            }
                        }
                    }
                },
                render: (text: string, item: BillingDto) => <div>{item.bi_required_refund === eBillRequiredFund.NONE.num ? item.bi_code : <Link to={"/reconsile/refund?bi_code=" + (item.bi_code)} target='_blank' >
                    {item.bi_code}
                </Link>}</div>
            },
            {
                title: L('Tiền đơn hàng'), dataIndex: 'bi_money_original', key: 'bi_money_original', render: (text: string, item: BillingDto, index: number) =>
                    <div >{AppConsts.formatNumber(item.bi_money_original)}</div>
            },
            {
                title: L('Trạng thái đối soát'), width: "20%", dataIndex: 'bi_reconcile_status', key: 'bi_reconcile_status', render: (text: string, item: BillingDto, index: number) =>
                    <div>
                        {
                            hasAction != undefined && hasAction == true ?
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
            { title: "Ngày tạo đối soát", key: "ma_id_bill_index", render: (text: string, item: BillingDto) => <div> {moment(item.bi_reconcile_at).format("DD/MM/YYYY")} </div> },
            { title: "Ngày giao dịch", key: "ma_id_bill_index", render: (text: string, item: BillingDto) => <div> {moment(item.bi_created_at).format("DD/MM/YYYY")} </div> },
        ]
        if (hasAction != undefined && hasAction === true) {
            columns.push(action);
        }
        return (
            <>
                <Row gutter={[8, 8]} align='bottom'>
                    <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
                        <TitleTableModalExport title='Bảng chi tiết nạp tiền hệ thống'></TitleTableModalExport>
                    </Col>
                    {hasAction != undefined && hasAction === true ?
                        <Row align='bottom' gutter={8} style={{ display: "contents" }}>
                            <Col span={4}>
                                <strong>Mã hóa đơn</strong>
                                <Input allowClear
                                    onChange={(e) => this.handleInputChange(e)}
                                    value={this.state.bi_code_search}>
                                </Input>
                            </Col>
                            <Col span={6} style={{ width: "100%" }}>
                                <strong>Trạng thái đối soát</strong>
                                <SelectEnumMulti
                                    eNum={eBillReconcileStatus}
                                    onChangeEnum={async (e) => {
                                        await this.setState({ bi_reconcile_status_search: e }); this.onSearchStatic();
                                    }}
                                    enum_value={this.reconcile_status} />
                            </Col>
                            <Col>
                                <Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={() => this.onSearchStatic()} >Tìm kiếm</Button>
                            </Col>
                            <Col span={4}>
                                {
                                    ( !!this.state.bi_code_search) &&
                                    <Button danger icon={<DeleteOutlined />} title={"Xóa tìm kiếm"} onClick={async () => await this.clearSearch()} >{this.shouldChangeText() ? 'Xóa' : 'Xóa tìm kiếm'}</Button>
                                }
                            </Col>
                        </Row>
                        : ""}
                </Row>
                <Table
                    className='centerTable'
                    scroll={(hasAction != undefined && hasAction === true) ? { x: 1700, y: 600 } : { x: undefined, y: undefined }}
                    columns={columns}
                    size={'middle'}
                    bordered={true}
                    locale={{ "emptyText": "Không có dữ liệu" }}
                    dataSource={(this.state.bi_code_search == undefined) ? this.listDataBill : this.listDataBillFill}
                    rowKey={record => "billing_table" + JSON.stringify(record)}
                    pagination={this.props.hasAction != false ? {
                        showTotal: (tot) => "Tổng" + ": " + tot + "",
                        showQuickJumper: true,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100', '200', '300', '400', '500'],
                    } : false
                    }
                // loading={this.props.isLoadDone}
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