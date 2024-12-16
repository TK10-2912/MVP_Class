import * as React from 'react';
import { Table, Row, Modal, Col, Button, Tag, Space, Input, } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, SearchOutlined, } from '@ant-design/icons';
import { L } from '@lib/abpUtility';
import { TablePaginationConfig } from 'antd/lib/table';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { EventTable, cssCol, pageSizeOptions } from '@src/lib/appconst';
import { stores } from '@src/stores/storeInitializer';
import { BillingDto, ReconcileDto } from '@src/services/services_autogen';
import { eBillReconcileStatus, eBillRequiredFund, valueOfeBillReconcileStatus, valueOfeBillRequiredFund } from '@src/lib/enumconst';
import moment from 'moment';
import ModalTableBillingViewAdmin from '@src/scenes/StatisticalReport/TabPayment/BankingPayment/componentAdmin/ModalTableBillingViewAdmin';
import { Link } from 'react-router-dom';
import SelectEnumMulti from '@src/components/Manager/SelectEnumMulti';
import ReconcileLogs from '@src/scenes/Reconsile/ReconcilLogs';
import UpdateBillingReconcileAdmin from '../BankReconsile/UpateBillingReconcileAdmin';
export interface IProps {
    actionTable?: (item: ReconcileDto, event: EventTable) => void;
    onSuccess?: () => void;
    pagination?: TablePaginationConfig | false;
    isLoadDone?: boolean;
    is_confirmed?: boolean;
    onCancel?: () => void;
    rec_id?: number;
    title?: string;
    isPrint?: boolean;
    reconcile: ReconcileDto;
}
export default class ModalBilingDetailReconciliationAdmin extends AppComponentBase<IProps> {
    state = {
        visibleUpdateBilling: false,
        bi_id_selected: undefined,
        visibleModalViewFile: false,
        visibleModalBillProduct: false,
        bi_reconcile_reason: "",
        bi_reconcile_status: undefined,
        bi_reconcile_status_search: [],
        bi_required_refund_search: [],
        isValidInput: true,
        visibleModalLogReconcile: false,
        bi_code: undefined,
        currentPage: 1,
        pageSize: 10,
    };
    billingListResult: BillingDto[] = [];
    billingListResult1: BillingDto[] = [];
    billingSelected: BillingDto = new BillingDto();
    reconcile_status: number[] = [];
    required_refund: number[] = [];
    actionTableBilling = async (bill: BillingDto, event: EventTable) => {
        if (event == EventTable.Edit) {
            this.billingSelected.init(bill)
            this.setState({ visibleUpdateBilling: true });
        }
        if (event == EventTable.View) {
            this.billingSelected.init(bill)
            this.setState({ visibleModalLogReconcile: true });

        }
    }
    onCreateUpdateSuccess = () => {
        if (!!this.props.onSuccess) {
            this.props.onSuccess();
            this.setState({ visibleUpdateBilling: false });
        }

    }
    onCancel = () => {
        if (!!this.props.onCancel) {
            this.props.onCancel();
        }
    }
    async componentDidMount() {
        this.setState({ isLoadDone: false });
        const { billListResult } = stores.billingStore;
        const idSet = new Set(this.props.reconcile!.listBillingId!);

        this.billingListResult = billListResult.filter(bill => idSet.has(bill.bi_id));

        this.setState({ isLoadDone: true });
    }
    async componentDidUpdate(prevProps) {
        if (this.props.isLoadDone != prevProps.isLoadDone) {
            this.setState({ isLoadDone: false });
            await stores.billingStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
            const { billListResult } = stores.billingStore;
            const idSet = new Set(this.props.reconcile.listBillingId);
            this.billingListResult = billListResult.filter(bill => idSet.has(bill.bi_id));
            this.setState({ isLoadDone: true });
        }
    }
    onSearchStatic = async () => {
        this.setState({ isLoadDone: false });
        this.billingListResult1 = this.billingListResult;
        if (this.state.bi_reconcile_status_search.length > 0) {
            this.reconcile_status = this.state.bi_reconcile_status_search;
            this.billingListResult1 = this.billingListResult1.filter(bill => this.reconcile_status?.includes(bill.bi_reconcile_status));
        }
        if (this.state.bi_required_refund_search.length > 0) {
            this.required_refund = this.state.bi_required_refund_search;
            this.billingListResult1 = this.billingListResult1.filter(bill => this.required_refund?.includes(bill.bi_required_refund));
        }
        if (this.state.bi_code != undefined) {
            this.billingListResult1 = (this.billingListResult1 || []).filter(bill => bill.bi_code?.includes(this.state.bi_code || ""));
        }
        this.setState({ isLoadDone: true });
    }
    clearSearch = async () => {
        this.setState({ isLoadDone: true });
        await this.setState({
            bi_reconcile_status_search: [],
            bi_required_refund_search: [],
            bi_code: undefined,
        })
        this.reconcile_status = [];
        this.required_refund = [];
        this.setState({ isLoadDone: false });

    }
    shouldChangeText = () => {
        const isChangeText = window.innerWidth >= 576 && window.innerWidth <= 992;
        return !!isChangeText;
    }

    render() {
        const left = this.state.visibleUpdateBilling ? cssCol(15) : cssCol(24);
        const right = this.state.visibleUpdateBilling ? cssCol(9) : cssCol(0);
        const self = this;
        const { is_confirmed } = this.props;
        const action: any = {
            title: "",
            dataIndex: 'Action',
            fixed: 'right',
            width: 100,
            render: (_: any, record: BillingDto) => {
                return (
                    <>{record.bi_reconcile_status === eBillReconcileStatus.DONE.num ?
                        <Button
                            type="primary" icon={<EyeOutlined />} title={L('Lịch sửa đối soát')}
                            size='small'
                            onClick={() => this.actionTableBilling(record, EventTable.View)}

                        ></Button> :
                        <>
                            {!this.props.is_confirmed &&
                                <Button
                                    type="primary" icon={<EditOutlined />} title={L('Cập nhật trạng thái đối soát đơn hàng')}
                                    size='small'
                                    onClick={() => this.actionTableBilling(record, EventTable.Edit)}>
                                </Button>}
                            &nbsp;
                            <Button
                                type="primary" icon={<EyeOutlined />} title={L('Lịch sử đối soát')}
                                size='small'
                                onClick={() => this.actionTableBilling(record, EventTable.View)}>
                            </Button>
                        </>
                    }
                    </>)

            },
        };
        const columns = [
            { title: L('STT'), dataIndex: "", width: 50, key: 'no_languages_index', render: (text: string, item: BillingDto, index: number) => <div>{this.state.pageSize! * (this.state.currentPage! - 1) + (index + 1)}</div> },
            {
                title: "Mã đơn hàng", key: "im_code", className: "hoverCell",
                onCell: (record: BillingDto) => {
                    return {
                        onClick: async () => {
                            if (record.bi_required_refund === eBillRequiredFund.NONE.num) {
                                this.billingSelected = record;
                                this.setState({ visibleModalBillProduct: true });
                            }
                        }
                    }
                },
                render: (text: string, item: BillingDto) => (
                    <div>
                        {item.bi_required_refund === eBillRequiredFund.NONE.num ? (
                            item.bi_code
                        ) : (
                            this.props.isPrint ? (
                                item.bi_code
                            ) : (
                                <Link to={"/reconsile/refund?bi_code=" + item.bi_code} target="_blank">
                                    {item.bi_code}
                                </Link>
                            )
                        )}
                    </div>
                )
            },
            {
                title: "Trạng thái hoàn tiền",
                key: "ma_id_bill_index",
                render: (text: string, item: BillingDto) => (
                    <div>
                        {item.bi_required_refund === eBillRequiredFund.REQUEST_REFUND.num ? (
                            <Link
                                to={`/reconsile/refund?bi_code=${item.bi_code}`}
                                target="_blank"
                            >
                                {valueOfeBillRequiredFund(item.bi_required_refund)}
                            </Link>
                        ) : (
                            valueOfeBillRequiredFund(item.bi_required_refund)
                        )}
                    </div>
                ),
            },
            {
                title: L('Trạng thái đối soát'), dataIndex: 'bi_reconcile_status', key: 'bi_reconcile_status', width: "23%", render: (text: string, item: BillingDto, index: number) =>
                    <div>{
                        !this.props.isPrint ?
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
                            </> : valueOfeBillReconcileStatus(item.bi_reconcile_status)
                    }
                    </div>
            },
            {
                title: L('Lý do lỗi'), dataIndex: 'bi_reconcile_reason', key: 'no_languages_title', editable: true, required: true, render: (text: string, item: BillingDto, index: number) =>
                    <div dangerouslySetInnerHTML={{ __html: item.bi_reconcile_reason! }}></div>
            },
            {
                title: "Thời gian giao dịch",
                key: "ma_id_bill_index",
                sorter: (a: BillingDto, b: BillingDto) => moment(a.bi_created_at).unix() - moment(b.bi_created_at).unix(),
                render: (text: string, item: BillingDto) => (
                    <div>{moment(item.bi_created_at).format("DD/MM/YYYY HH:mm:ss A")}</div>
                ),
            },
            {
                title: "Ngày tạo đối soát",
                key: "ma_id_bill_index",
                sorter: (a: BillingDto, b: BillingDto) => moment(a.bi_reconcile_at).unix() - moment(b.bi_reconcile_at).unix(),
                render: (text: string, item: BillingDto) => (
                    <div>{moment(item.bi_reconcile_at).format("DD/MM/YYYY - HH:mm:ss")}</div>
                ),
            }

        ];
        if (is_confirmed == false) {
            columns.push(action);
        }
        return (
            <>
                {!this.props.isPrint &&
                    <Row gutter={[8, 8]} align='bottom'>
                        <Col span={24}>
                            <h2>{this.props.title}</h2>
                        </Col>
                        <Row align='bottom' gutter={8} style={{ display: "contents" }}>
                            <Col span={4} style={{ textAlign: 'left' }}>
                                <strong>Mã đơn hàng</strong>
                                <Input allowClear placeholder='Mã đơn hàng' onChange={async (e) => {
                                    await this.setState({ bi_code: e.target.value == "" ? undefined : e.target.value.trim() });
                                    await this.onSearchStatic();
                                }}
                                    value={this.state.bi_code}>
                                </Input>
                            </Col>
                            <Col span={7} style={{ width: "100%" }}>
                                <strong>Trạng thái đơn hàng</strong>
                                <SelectEnumMulti
                                    eNum={eBillReconcileStatus}
                                    onChangeEnum={async (e) => {
                                        await this.setState({ bi_reconcile_status_search: e }); this.onSearchStatic();
                                    }}
                                    enum_value={this.reconcile_status} />
                            </Col>
                            <Col span={7}>
                                <strong>Hoàn tiền</strong>
                                <SelectEnumMulti
                                    eNum={eBillRequiredFund}
                                    onChangeEnum={async (e) => { await this.setState({ bi_required_refund_search: e }); this.onSearchStatic() }}
                                    enum_value={this.required_refund} />
                            </Col>
                            <Col span={6}>
                                <Space>
                                    <Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={() => this.onSearchStatic()} >Tìm kiếm</Button>
                                    {
                                        (this.state.bi_reconcile_status_search.length > 0 || this.state.bi_required_refund_search.length > 0 || !!this.state.bi_code) &&
                                        <Button danger icon={<DeleteOutlined />} title={"Xóa tìm kiếm"} onClick={async () => await this.clearSearch()} >{this.shouldChangeText() ? 'Xóa' : 'Xóa tìm kiếm'}</Button>
                                    }
                                </Space>
                            </Col>

                        </Row>
                    </Row>
                }
                <Row>
                    <Col {...left}>
                        <Table
                            className="centerTable"
                            rowClassName={(record, index) => (this.state.bi_id_selected === record.bi_id) ? "bg-click" : "bg-white"}
                            rowKey={record => "languages_table_" + JSON.stringify(record)}
                            scroll={this.props.isPrint ? { x: undefined, y: undefined } : { y: 700 }}
                            size={'middle'}
                            bordered={true}
                            
                            columns={columns}
                            dataSource={(this.reconcile_status.length > 0 || this.required_refund.length > 0 || !!this.state.bi_code) ? this.billingListResult1 : this.billingListResult}
                            pagination={{
                                position: ['topRight'],
                                total: (this.reconcile_status.length > 0 || this.required_refund.length > 0 || !!this.state.bi_code) ? this.billingListResult1.length : this.billingListResult.length,
                                showTotal: (tot) => "Tổng" + ": " + tot + "",
                                showQuickJumper: true,
                                showSizeChanger: true,
                                pageSizeOptions: pageSizeOptions,
                                onChange: (page: number, pageSize?: number | undefined) => {
                                    this.setState({ pageSize: pageSize, currentPage: page })
                                }
                            }}
                        />
                    </Col>
                    <Col {...right}>
                        {this.state.visibleUpdateBilling &&
                            <UpdateBillingReconcileAdmin onCancel={() => this.setState({ visibleUpdateBilling: false })} onSuccess={this.onCreateUpdateSuccess} bill_select={this.billingSelected} reconcileSelect={this.props.rec_id!} />
                        }
                    </Col>
                </Row>
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
                    title='Lịch sử đối soát'
                    width={"80%"}
                >
                    <ReconcileLogs bi_code={this.billingSelected.bi_code} />
                </Modal>
            </>
        )
    }
}