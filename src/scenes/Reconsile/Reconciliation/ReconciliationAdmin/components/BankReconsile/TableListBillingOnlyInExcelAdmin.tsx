import AppConsts, { EventTable, pageSizeOptions } from '@src/lib/appconst';
import { ExcelReconcileDto, ReconcileDto } from '@src/services/services_autogen';
import { ColumnsType, ColumnGroupType, TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import { Button, Col, Input, Row, Table, Tag } from 'antd';
import { eBillReconcileStatus, valueOfeBillReconcileStatus, } from '@src/lib/enumconst';
import { DeleteOutlined, EditOutlined, EyeOutlined, HistoryOutlined, SearchOutlined, } from '@ant-design/icons';
import { L } from '@src/lib/abpUtility';
import SelectEnumMulti from '@src/components/Manager/SelectEnumMulti';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import ModalExportBankReconcoleOnlyExcelUserDetailAdmin from './ModalExportBankReconcoleOnlyExcelUserDetailAdmin';


export interface IProps {
    reconcileListDto?: ReconcileDto[];
    isLoadDone?: boolean;
    billListResult?: ExcelReconcileDto[];
    actionTable?: (item: ExcelReconcileDto, event: EventTable) => void;
    hasAction?: boolean;
    visible?: boolean;
    is_confirmed?: boolean;
    rec_id?: number;
    onSuccess?: () => void;
    pagination?: TablePaginationConfig | false;
    onChangeData?: (item: ExcelReconcileDto[]) => void;
}

export default class TableListBillingOnlyInExcelAdmin extends React.Component<IProps> {
    state = {
        isLoadDone: true,
        ex_code: undefined,
        ex_reconcile_status: undefined,
        ex_reconcile_reason: undefined,
        visibleModalPayment: false,
        visibleExport: false,
        bi_code_search: "",
        bi_reconcile_status_search: [],
        rowSelection: undefined,
        page: 10,
        currentPage: 1,
    }
    listDataBill: ExcelReconcileDto[] = [];
    billingSelected: ExcelReconcileDto = new ExcelReconcileDto();
    listDataBillFill: ExcelReconcileDto[] = [];
    reconcile_status: number[] = [];
    required_refund: number[] = [];
    onSuccess = () => {
        if (!!this.props.onSuccess) {
            this.props.onSuccess();
        }
    }

    componentDidMount = async () => {
        this.setState({ isLoadDone: true });
        if (!this.props.hasAction) { this.listDataBill = this.props.billListResult! }
        else this.listDataBill = this.props.reconcileListDto?.filter(item => item.rec_id === this.props.rec_id)?.[0]?.listBillingOnlyInExcel!;
        this.setState({ isLoadDone: true });

    }
    componentDidUpdate(prevProps) {
        if (this.props.isLoadDone != prevProps.isLoadDone) {
            this.setState({ isLoadDone: true });
            if (!this.props.hasAction) { this.listDataBill = this.props.billListResult! }
            else this.listDataBill = this.props.reconcileListDto?.filter(item => item.rec_id === this.props.rec_id)?.[0]?.listBillingOnlyInExcel!;
            this.setState({ isLoadDone: true });
        }
    }
    actionTable = (item: ExcelReconcileDto, action: EventTable) => {
        this.setState({ bi_id_selected: item.ex_code });
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action);
        }
    }
    onSearchStatic = async () => {
        await this.setState({ isLoadDone: false });

        this.listDataBillFill = this.props.billListResult != undefined ? this.props.billListResult : [];
        if (this.state.bi_reconcile_status_search.length > 0) {
            this.reconcile_status = this.state.bi_reconcile_status_search;
            this.listDataBillFill = this.listDataBillFill.filter(bill => this.reconcile_status?.includes(bill.ex_reconcile_status))
        }
        if (!!this.state.bi_code_search && this.state.bi_code_search!.length > 0) {
            const codeBiLower = this.state.bi_code_search.toLowerCase();
            this.listDataBillFill = this.listDataBillFill.filter(item => item.ex_code && item.ex_code.toLowerCase().includes(codeBiLower));
        }
        this.props.onChangeData!(this.listDataBillFill);
        await this.setState({ isLoadDone: true });
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
        this.onSearchStatic();
        this.setState({ isLoadDone: false });
    }
    render() {
        const { hasAction } = this.props

        const action: ColumnGroupType<ExcelReconcileDto> = {
            title: "",
            width: 100,
            key: "action_billing_reconcile",
            fixed: 'right',
            children: [],
            render: (_: any, record: ExcelReconcileDto) => {
                return (
                    <>{record.ex_reconcile_status === eBillReconcileStatus.DONE.num ?
                        <Button
                            type="primary" icon={<HistoryOutlined />} title={L('Lịch sửa đối soát')}
                            size='small'
                            onClick={() => this.actionTable(record, EventTable.View)}

                        ></Button> :
                        <>
                            {!this.props.is_confirmed &&
                                <Button
                                    type="primary" icon={<EditOutlined />} title={L('Cập nhật trạng thái đối soát đơn hàng')}
                                    size='small'
                                    onClick={() => this.actionTable(record, EventTable.Edit)}>
                                </Button>
                            }
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
        const columns: ColumnsType<ExcelReconcileDto> = [
            { title: "STT", key: "stt_drink_index", width: 50, render: (text: string, item: ExcelReconcileDto, index: number) => <div>{this.state.page! * (this.state.currentPage! - 1) + (index + 1)}</div> },
            {
                title: "Mã hóa đơn", key: "ex_code", render: (text: string, item: ExcelReconcileDto, index: number) =>
                    <div>{item.ex_code}</div>
            },
            {
                title: "Số tiền thanh toán", key: "ex_money", render: (text: string, item: ExcelReconcileDto, index: number) =>
                    <div>{AppConsts.formatNumber(item.ex_money)}</div>
            },
            {
                title: L('Trạng thái đối soát'), width: "25%", dataIndex: 'ex_reconcile_status', key: 'ex_reconcile_status', render: (text: string, item: ExcelReconcileDto, index: number) =>
                    <div title={valueOfeBillReconcileStatus(item.ex_reconcile_status)}>
                        {this.props.hasAction != undefined && this.props.hasAction == true ?
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
                            : <>{valueOfeBillReconcileStatus(item.ex_reconcile_status)}</>
                        }
                    </div>
            },
            {
                title: L('Lý do lỗi'), dataIndex: 'ex_reconcile_reason', key: 'ex_reconcile_reason', render: (text: string, item: ExcelReconcileDto, index: number) =>
                    <div dangerouslySetInnerHTML={{ __html: item.ex_reconcile_reason! }}></div>
            },
            { title: "Thời gian tạo giao dịch", sorter: (a: ExcelReconcileDto, b: ExcelReconcileDto) => moment(a.ex_created_at).unix() - moment(b.ex_created_at).unix(), key: "ex_created_at", render: (text: string, item: ExcelReconcileDto) => <div> {moment(item.ex_created_at).format("DD/MM/YYYY hh:mm")} </div> },
            { title: "Thời gian tạo đối soát", sorter: (a: ExcelReconcileDto, b: ExcelReconcileDto) => moment(a.ex_reconcile_at).unix() - moment(b.ex_reconcile_at).unix(), key: "ex_reconcile_at", render: (text: string, item: ExcelReconcileDto) => <div> {moment(item.ex_reconcile_at).format("DD/MM/YYYY hh:mm")} </div> },
        ]
        if (hasAction != undefined && hasAction === true) {
            columns.push(action);
        }
        return (
            <>
                <Row gutter={[8, 8]} align='bottom'>
                    <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
                        <h2>Danh sách đơn hàng chỉ có trong Excel</h2>
                    </Col>
                    {(hasAction != undefined && hasAction === true) ?
                        <>
                            <Col span={5} style={{ width: "100%", textAlign: 'left' }}>
                                <strong>Mã hóa đơn</strong>
                                <Input allowClear placeholder='Mã hóa đơn' onChange={async (e) => {
                                    await this.setState({ bi_code_search: e.target.value == "" ? undefined : e.target.value.trim() });
                                    await this.onSearchStatic();
                                }}
                                    value={this.state.bi_code_search}>
                                </Input>
                            </Col>
                            <Col span={7} style={{ width: "100%", textAlign: 'left' }}>
                                <strong>Trạng thái đối soát</strong>
                                <SelectEnumMulti
                                    eNum={eBillReconcileStatus}
                                    placeholder='Trạng thái đối soát'
                                    onChangeEnum={async (e) => {
                                        await this.setState({ bi_reconcile_status_search: e }); await this.onSearchStatic();
                                    }}
                                    enum_value={this.reconcile_status} />
                            </Col>
                            <Col span={6} style={{ display: 'flex', justifyContent: 'start' }}>
                                <Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={() => this.onSearchStatic()} >Tìm kiếm</Button>&nbsp;
                                {(!!this.state.bi_code_search || this.state.bi_reconcile_status_search.length > 0) &&
                                    <Button danger icon={<DeleteOutlined />} title={"Xóa tìm kiếm"} onClick={async () => await this.clearSearch()} >{this.shouldChangeText() ? 'Xóa' : 'Xóa tìm kiếm'}</Button>
                                }
                            </Col>
                            <Col span={6} style={{ display: 'flex', justifyContent: 'end' }} >
                                <Button type='primary' onClick={() => this.setState({ visibleExport: true })}> Xuất dữ liệu</Button>
                            </Col>
                        </>
                        : ""}
                </Row>
                <Table
                    className='centerTable customTable'
                    scroll={(hasAction != undefined && hasAction === true) ? { x: 1000, y: 600 } : { x: undefined, y: undefined }}
                    columns={columns}
                    size={'middle'}
                    bordered={true}
                    dataSource={this.state.bi_reconcile_status_search.length > 0 || (this.state.bi_code_search != undefined && this.state.bi_code_search.length > 0) ? this.listDataBillFill : this.listDataBill}
                    rowKey={record => "billing_table" + JSON.stringify(record)}
                    pagination={this.props.hasAction != false ? {
                        position: ['topRight'],
                        onChange: (page: number, pageSize?: number | undefined) => {
                            this.setState({ page: pageSize, currentPage: page })
                        },
                        showTotal: (tot) => "Tổng" + ": " + tot + "",
                        showQuickJumper: true,
                        showSizeChanger: true,
                        pageSizeOptions: pageSizeOptions,
                    } : false}
                    onRow={(record) => {
                        return {
                            onDoubleClick: (event: any) => {
                                this.setState({ rowSelection: record })
                                this.actionTable(record, EventTable.Edit)
                            }
                        };
                    }}
                    rowClassName={(record, index) => (this.state.rowSelection === record) ? "bg-click" : "bg-white"}
                />
                {this.state.visibleExport &&

                    <ModalExportBankReconcoleOnlyExcelUserDetailAdmin
                        visible={this.state.visibleExport}
                        onCancel={() => this.setState({ visibleExport: false })}
                        exBillListResult={(this.state.bi_code_search != undefined && this.state.bi_code_search.length > 0 || this.state.bi_reconcile_status_search.length > 0) ? this.listDataBillFill : (this.props.billListResult! != undefined ? this.props.billListResult : [])}

                    />
                }
            </>
        )
    }

}