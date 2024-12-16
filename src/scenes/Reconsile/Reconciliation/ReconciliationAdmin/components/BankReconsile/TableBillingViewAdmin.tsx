import { BillingDto } from '@src/services/services_autogen';
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import { Button, Col, Input, Modal, Row, Space, Table, Tag } from 'antd';
import { eBillReconcileStatus, eBillRequiredFund, valueOfeBillReconcileStatus, valueOfeBillRequiredFund } from '@src/lib/enumconst';
import { stores } from '@src/stores/storeInitializer';
import { L } from '@src/lib/abpUtility';
import { Link } from 'react-router-dom';
import ModalTableBillingViewAdmin from '@src/scenes/StatisticalReport/TabPayment/BankingPayment/componentAdmin/ModalTableBillingViewAdmin';
import ReconcileLogs from '@src/scenes/Reconsile/ReconcilLogs';
import { DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import SelectEnumMulti from '@src/components/Manager/SelectEnumMulti';
import AppConsts from '@src/lib/appconst';


export interface IProps {
    billListResult?: BillingDto[];
    isPrint: boolean;
    listBillId?: number[];
}

export default class TableBillingViewAdmin extends React.Component<IProps> {
    state = {
        isLoadDone: true,
        visibleModalBillProduct: false,
        visibleModalLogReconcile: false,
        bi_reconcile_status: undefined,
        bi_reconcile_reason: undefined,
        bi_code_search: undefined,
        bi_reconcile_status_search: [] as number[],
        bi_required_refund_search: [] as number[],
    }
    listDataBill: BillingDto[] = [];
    billingSelected: BillingDto = new BillingDto();
    tablePagination: TablePaginationConfig;
    listDataBillFill: BillingDto[] = [];
    reconcile_status: number[] = [];
    required_refund: number[] = [];

    componentDidMount() {
        this.setState({ isLoadDone: false });
        const { listBillId, billListResult } = this.props;
        this.listDataBill = billListResult != undefined ? billListResult.filter(bill => listBillId?.includes(bill.bi_id)) : [];
        this.setState({ isLoadDone: true });
    }
    clearSearch = async () => {
        this.setState({ isLoadDone: true });
        await this.setState({
            bi_reconcile_status_search: [],
            bi_code_search: undefined,
        })
        this.reconcile_status = [];
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
    cancel = () => {
        this.setState({ editingKey: -1, bi_id_selected: undefined });
    };
    shouldChangeText = () => {
        const isChangeText = window.innerWidth >= 576 && window.innerWidth <= 992;
        return !!isChangeText;
    }
    render() {
        const { isPrint } = this.props;
        let action: ColumnGroupType<BillingDto> = {
            title: 'Chức năng', children: [], key: 'action_Supplier_index', className: "no-print center", fixed: 'right', width: 100,
            render: (text: string, item: BillingDto) => (
                <Space>
                    <Button
                        type="primary" icon={<EyeOutlined />} title={L('Lịch sử đối soát')}
                        size='small'
                        onClick={() => {
                            this.setState({ visibleModalLogReconcile: true });
                            this.billingSelected.init(item);
                        }}
                    ></Button>
                </Space>
            )
        };
        const columns: ColumnsType<BillingDto> = [
            { title: "STT", key: "stt_drink_index", width: 50, render: (text: string, item: BillingDto, index: number) => <div>{index + 1}</div> },
            {
                title: "Mã hóa đơn", key: "im_code", width: 150, className: "hoverCell",
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
                render: (text: string, item: BillingDto) => <div>{item.bi_required_refund === eBillRequiredFund.NONE.num ? `${item.bi_code}- ${stores.sessionStore.getBiCodeMachine(item.bi_code!)}` : <Link to={"/reconsile/refund?bi_code=" + (item.bi_code)} target='_blank' >
                    {item.bi_code + "-" + stores.sessionStore.getBiCodeMachine(item.bi_code!)}
                </Link>}</div>
            },
            {
                title: L('Tiền đơn hàng'), dataIndex: 'bi_money_original', key: 'bi_money_original', width: 120, render: (text: string, item: BillingDto, index: number) =>
                    <div >{AppConsts.formatNumber(item.bi_money_original)}</div>
            },
            {
                title: L('Trạng thái đối soát'), dataIndex: 'bi_reconcile_status', key: 'bi_reconcile_status', width:300, render: (text: string, item: BillingDto, index: number) =>
                    <>
                        {
                            this.props.isPrint != undefined && this.props.isPrint == true ?
                                <>
                                    {valueOfeBillReconcileStatus(item.bi_reconcile_status)}
                                </>
                                :
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
            { title: "Thời gian tạo đối soát", key: "ma_id_bill_index", render: (text: string, item: BillingDto) => <div> {moment(item.bi_reconcile_at).format("DD/MM/YYYY HH:mm:ss")} </div> },
            { title: "Thời gian giao dịch", key: "ma_id_bill_index", render: (text: string, item: BillingDto) => <div> {moment(item.bi_created_at).format("DD/MM/YYYY HH:mm:ss")} </div> },
            {
                title: L('Lý do lỗi'), dataIndex: 'bi_reconcile_reason', key: 'bi_reconcile_reason', render: (text: string, item: BillingDto, index: number) =>
                    <div dangerouslySetInnerHTML={{ __html: item.bi_reconcile_reason! }}></div>
            },
        ]
        if (isPrint != undefined && isPrint === false) {
            columns.push(action);
        }
        return (
            <>
                <Row gutter={[8, 8]} align='bottom'>
                    <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
                        <h2>Danh sách đơn hàng đối soát với hệ thống</h2>
                    </Col>
                    {isPrint != undefined && isPrint === false ?
                        <Row align='bottom' gutter={4} style={{ display: "contents" }}>
                            <Col span={6}>
                                <strong>Mã hóa đơn</strong>
                                <Input
                                    allowClear
                                    placeholder='Nhập...'
                                    onChange={async (e) => {
                                        await this.setState({ bi_code_search: e.target.value == "" ? undefined : e.target.value.trim() });
                                        await this.onSearchStatic();
                                    }}
                                    value={this.state.bi_code_search}>
                                </Input>
                            </Col>
                            <Col span={6} style={{ width: "100%" }}>
                                <strong>Trạng thái đơn hàng</strong>
                                <SelectEnumMulti
                                    eNum={eBillReconcileStatus}
                                    onChangeEnum={async (e) => {
                                        await this.setState({ bi_reconcile_status_search: e });
                                        this.onSearchStatic();
                                    }}
                                    enum_value={this.reconcile_status} />
                            </Col>
                            <Col span={6}>
                                <strong>Hoàn tiền</strong>
                                <SelectEnumMulti
                                    eNum={eBillRequiredFund}
                                    onChangeEnum={async (e) => {
                                        await this.setState({ bi_required_refund_search: e });
                                        this.onSearchStatic()
                                    }}
                                    enum_value={this.required_refund} />
                            </Col>
                            <Col span={6} style={{display:'flex'}}>
                            <Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={this.onSearchStatic} >Tìm kiếm</Button> &nbsp;
                                {
                                    this.state.bi_reconcile_status_search.length > 0 || this.state.bi_required_refund_search.length > 0 || !!this.state.bi_code_search &&
                                    <Button danger icon={<DeleteOutlined />} title={"Xóa tìm kiếm"} onClick={async () => await this.clearSearch()} >{this.shouldChangeText() ? 'Xóa' : 'Xóa tìm kiếm'}</Button>
                                }
                            </Col>
                        </Row>
                        : ""}
                </Row>
                <Table
                    className='centerTable'
                    columns={columns}
                    scroll={this.props.isPrint ? { x: undefined, y: undefined } : { x: 1200, y: 600 }}
                    size='small'
                    bordered={true}
                    locale={{ "emptyText": "Không có dữ liệu" }}
                    dataSource={this.state.bi_reconcile_status_search.length == 0 && this.state.bi_required_refund_search.length == 0 && this.state.bi_code_search === undefined ? this.listDataBill : this.listDataBillFill}
                    pagination={this.props.isPrint ? false :
                        {
                            showTotal: (tot) => "Tổng: " + tot + " "

                        }}
                    rowKey={record => "billing_table" + JSON.stringify(record)}
                />
                <ModalTableBillingViewAdmin
                    billSelected={this.billingSelected}
                    visibleModalBillProduct={this.state.visibleModalBillProduct}
                    onCancel={() => this.setState({ visibleModalBillProduct: false })}
                    listItem={this.billingSelected.entities_id_arr}
                />
                <Modal
                    closable={true}
                    visible={this.state.visibleModalLogReconcile}
                    onCancel={() => this.setState({ visibleModalLogReconcile: false })}
                    maskClosable={false}
                    footer={false}
                    width={"80%"}
                >
                    <ReconcileLogs bi_code={this.billingSelected.bi_code} />
                </Modal>
            </>
        )
    }

}