import AppConsts, { EventTable } from '@src/lib/appconst';
import { ExcelReconcileDto } from '@src/services/services_autogen';
import { ColumnsType, ColumnGroupType, TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import { Button, Col, Input, Modal, Row, Table, Tag } from 'antd';
import { eBillReconcileStatus, valueOfeBillReconcileStatus, } from '@src/lib/enumconst';
import { DeleteOutlined, EyeOutlined, SearchOutlined, } from '@ant-design/icons';
import { L } from '@src/lib/abpUtility';
import SelectEnumMulti from '@src/components/Manager/SelectEnumMulti';
import ReconcileLogs from '@src/scenes/Reconsile/ReconcilLogs';


export interface IProps {
    isLoadDone?: boolean;
    billListResult?: ExcelReconcileDto[];
    actionTable?: (item: ExcelReconcileDto, event: EventTable) => void;
    hasAction?: boolean;
    onSuccess?: () => void;
    pagination?: TablePaginationConfig | false;

}

export default class TableListBillingOnlyInExcelAdmin extends React.Component<IProps> {
    state = {
        isLoadDone: true,
        ex_code: undefined,
        ex_reconcile_status: undefined,
        ex_reconcile_reason: undefined,
        visibleModalPayment: false,
        visibleModalBillProduct: false,
        bi_reconcile_status_search: [] as number[],
        bi_code_search: undefined,
        visibleModalLogReconcile: false,
    }
    listDataBill: ExcelReconcileDto[] = [];
    billingSelected: ExcelReconcileDto = new ExcelReconcileDto();
    listDataBillFill: ExcelReconcileDto[] = [];
    reconcile_status: number[] = [];
    required_refund: number[] = [];
    private form: any = React.createRef();

    onSuccess = () => {
        if (!!this.props.onSuccess) {
            this.props.onSuccess();
        }
    }

    componentDidMount = async () => {
        this.setState({ isLoadDone: true });
        if (!!this.props.billListResult) {
            this.listDataBill = this.props.billListResult;
        }
        this.setState({ isLoadDone: true });

    }
    actionTable = (item: ExcelReconcileDto, action: EventTable) => {
        this.setState({ ex_id_selected: item.ex_code });
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action);
        }
    }
    cancel = () => {
        this.setState({ editingKey: undefined, ex_id_selected: undefined });
    };
    onSearchStatic = async () => {
        this.setState({ isLoadDone: false });
        let filteredList = this.listDataBill || [];
        if (this.state.bi_reconcile_status_search.length > 0) {
            filteredList = filteredList.filter(bill => this.state.bi_reconcile_status_search.includes(bill.ex_reconcile_status));
        }
        if (this.state.bi_code_search) {
            filteredList = filteredList?.filter(item => item.ex_code?.includes(this.state.bi_code_search!));
        }
        this.listDataBillFill = filteredList;
        this.setState({ isLoadDone: true });
    }
    shouldChangeText = () => {
        const isChangeText = window.innerWidth >= 576 && window.innerWidth <= 992;
        return !!isChangeText;
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
    render() {
        const { hasAction } = this.props
        const action: ColumnGroupType<ExcelReconcileDto> = {
            title: "Chức năng",
            width: 100,
            key: "action_billing_reconcile",
            fixed: 'right',
            children: [],
            render: (_: any, record: ExcelReconcileDto) => {
                return (
                    <Button
                        type="primary" icon={<EyeOutlined />} title={L('Lịch sửa đối soát')}
                        size='small'
                        onClick={() => this.setState({ visibleModalLogReconcile: true })}
                    >
                    </Button>
                )
            }
        };
        const columns: ColumnsType<ExcelReconcileDto> = [
            { title: "STT", key: "stt_drink_index", width: 50, render: (text: string, item: ExcelReconcileDto, index: number) => <div>{index + 1}</div> },
            {
                title: "Mã hóa đơn", key: "ex_code", width: 150, render: (text: string, item: ExcelReconcileDto, index: number) =>
                    <div>{item.ex_code}</div>
            },
            {
                title: "Số tiền thanh toán", key: "bi_money", width: 150, render: (text: string, item: ExcelReconcileDto, index: number) =>
                    <div>{AppConsts.formatNumber(item.ex_money)}</div>
            },
            {
                title: L('Trạng thái đối soát'), width: 300, dataIndex: 'ex_reconcile_status', key: 'ex_reconcile_status', render: (text: string, item: ExcelReconcileDto, index: number) =>
                    <div>
                        {
                            this.props.hasAction != undefined && this.props.hasAction == true
                                ?
                                <>
                                    {
                                        eBillReconcileStatus.DONE.num == item.ex_reconcile_status && <Tag color='green'>{valueOfeBillReconcileStatus(item.ex_reconcile_status)}</Tag>
                                    }
                                    {
                                        eBillReconcileStatus.DOING.num == item.ex_reconcile_status && <Tag color='blue'>{valueOfeBillReconcileStatus(item.ex_reconcile_status)}</Tag>
                                    }
                                    {
                                        eBillReconcileStatus.ERROR.num == item.ex_reconcile_status && <Tag color='orange'>{valueOfeBillReconcileStatus(item.ex_reconcile_status)}</Tag>
                                    }
                                    {
                                        eBillReconcileStatus.NONE.num == item.ex_reconcile_status && <Tag color='red'>{valueOfeBillReconcileStatus(item.ex_reconcile_status)}</Tag>
                                    }
                                </>
                                :
                                <>{valueOfeBillReconcileStatus(item.ex_reconcile_status)}</>
                        }
                    </div>
            },
            {
                title: L('Lý do lỗi'), dataIndex: 'ex_reconcile_reason', key: 'ex_reconcile_reason', render: (text: string, item: ExcelReconcileDto, index: number) =>
                    <div>{item.ex_reconcile_reason} </div>
            },
            { title: "Thời gian tạo giao dịch", key: "ex_created_at", render: (text: string, item: ExcelReconcileDto) => <div> {moment(item.ex_created_at).format("DD/MM/YYYY HH:mm:ss")} </div> },
            { title: "Thời gian tạo đối soát", key: "ex_reconcile_at", render: (text: string, item: ExcelReconcileDto) => <div> {moment(item.ex_reconcile_at).format("DD/MM/YYYY HH:mm:ss")} </div> },
        ]
        if (hasAction != undefined && hasAction === true) {
            columns.push(action);
        }
        return (
            <>
                <Row gutter={[8, 8]} align='bottom' style={{ marginTop: 20 }}>
                    <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
                        <h2>Danh sách đơn hàng chỉ có trong Excel</h2>
                    </Col>
                    {(hasAction != undefined && hasAction === true) ?
                        <Row align='bottom' gutter={8} style={{ display: "contents" }}>
                            <Col span={8} >
                                <strong>Mã hóa đơn</strong>
                                <Input
                                    placeholder='Nhập mã hóa đơn'
                                    allowClear
                                    onChange={async (e) => {
                                        await this.setState({ bi_code_search: e.target.value == "" ? undefined : e.target.value.trim() });
                                        await this.onSearchStatic();
                                    }}
                                    value={this.state.bi_code_search}>
                                </Input>
                            </Col>
                            <Col span={8} style={{ width: "100%" }}>
                                <strong>Trạng thái đơn hàng</strong>
                                <SelectEnumMulti
                                    eNum={eBillReconcileStatus}
                                    onChangeEnum={async (e) => {
                                        await this.setState({ bi_reconcile_status_search: e });
                                        this.onSearchStatic();
                                    }}
                                    enum_value={this.reconcile_status} />
                            </Col>
                            <Col span={8} style={{ display: 'flex' }}>
                                <Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={this.onSearchStatic} >Tìm kiếm</Button> &nbsp;
                                {
                                    this.state.bi_reconcile_status_search.length > 0 || !!this.state.bi_code_search &&
                                    <Button danger icon={<DeleteOutlined />} title={"Xóa tìm kiếm"} onClick={async () => await this.clearSearch()} >{this.shouldChangeText() ? 'Xóa' : 'Xóa tìm kiếm'}</Button>
                                }
                            </Col>
                        </Row>
                        : ""}
                </Row>
                <Table
                    className='centerTable'
                    scroll={(hasAction != undefined && hasAction === true) ? { x: 1150, y: 600 } : { x: undefined, y: undefined }}
                    columns={columns}
                    size='small'
                    bordered={true}
                    locale={{ "emptyText": "Không có dữ liệu" }}
                    dataSource={this.state.bi_reconcile_status_search.length === 0 && this.state.bi_code_search === undefined ? this.listDataBill : this.listDataBillFill}
                    rowKey={record => "billing_table" + JSON.stringify(record)}
                    pagination={this.props.hasAction != false ? {
                        showTotal: (tot) => "Tổng" + ": " + tot + "",
                        showQuickJumper: true,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100', '200', '300', '400', '500'],
                    } : false} />
                <Modal
                    closable={true}
                    visible={this.state.visibleModalLogReconcile}
                    onCancel={() => this.setState({ visibleModalLogReconcile: false })}
                    maskClosable={false}
                    footer={false}
                    width={"80%"}
                >
                    <ReconcileLogs bi_code={this.billingSelected.ex_code} />
                </Modal>
            </>
        )
    }

}