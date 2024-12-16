import AppConsts, { EventTable, pageSizeOptions } from '@src/lib/appconst';
import { ProductImportDto, ReconcileSupplierDebtDetailDto } from '@src/services/services_autogen';
import { ColumnsType, ColumnGroupType, TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import { Button, Col, Input, Row, Space, Table, Tag } from 'antd';
import { eBillReconcileStatus, eReconcileDebtStatus, valueOfeBillReconcileStatus, valueOfeReconcileDebtStatus, } from '@src/lib/enumconst';
import { CheckSquareOutlined, DeleteOutlined, EyeOutlined, SearchOutlined, } from '@ant-design/icons';
import { L } from '@src/lib/abpUtility';
import SelectEnumMulti from '@src/components/Manager/SelectEnumMulti';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';


export interface IProps {
    reconcileDebtListDto?: ReconcileSupplierDebtDetailDto[];
    isLoadDone?: boolean;
    hasAction?: boolean;
    actionTableSuppplier?: (reconcile: ReconcileSupplierDebtDetailDto, event: EventTable) => void;
    visible?: boolean;
    pagination?: TablePaginationConfig | false;
}

export default class TableDetailReconcileDebtSupplierHistory extends React.Component<IProps> {
    state = {
        isLoadDone: true,
        ex_code: undefined,
        rec_status: undefined,
        ex_reconcile_reason: undefined,
        rec_code_search: undefined,
        bi_reconcile_status_search: [],
    }
    listDataReconcile: ReconcileSupplierDebtDetailDto[] = [];
    listDataReconcileFill: ReconcileSupplierDebtDetailDto[] = [];
    reconcile_status: number[] = [];
    listProduct: ProductImportDto[] = [];
    required_refund: number[] = [];
    re_selected: ReconcileSupplierDebtDetailDto = new ReconcileSupplierDebtDetailDto();
    actionTableSuppplier = (item: ReconcileSupplierDebtDetailDto, action: EventTable) => {
        const { actionTableSuppplier } = this.props;
        if (actionTableSuppplier !== undefined) {
            actionTableSuppplier(item, action);
        }
    }
    componentDidMount = async () => {
        this.setState({ isLoadDone: false });
        await this.initData();
        this.setState({ isLoadDone: true });

    }
    initData = () => {
        this.setState({ isLoadDone: false });
        this.listDataReconcile = this.props.reconcileDebtListDto != undefined ? this.props.reconcileDebtListDto : [];
        this.setState({ isLoadDone: true });
    }
    async componentDidUpdate(prevProps) {
        if (this.props.isLoadDone != prevProps.isLoadDone) {
            this.setState({ isLoadDone: true });
            await this.initData();
            this.setState({ isLoadDone: true });
        }
    }
    onSearchStatic = async () => {
        this.setState({ isLoadDone: false });
        if (this.state.bi_reconcile_status_search.length) {
            this.reconcile_status = this.state.bi_reconcile_status_search;
            this.listDataReconcileFill = this.listDataReconcileFill.filter(bill => this.reconcile_status?.includes(bill.rec_status)) ;
        }
        if (this.state.rec_code_search) {
            this.listDataReconcileFill = this.listDataReconcileFill.filter(item => item.rec_im_re_code?.includes(this.state.rec_code_search!)) ;
        }
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
            rec_code_search: undefined,
        })
        this.reconcile_status = [];
        this.setState({ isLoadDone: false });

    }

    render() {
        const { hasAction, reconcileDebtListDto } = this.props
        const action: ColumnGroupType<ReconcileSupplierDebtDetailDto> = {
            title: "",
            width: 100,
            key: "action_billing_reconcile",
            fixed: 'right',
            children: [],
            render: (_: any, record: ReconcileSupplierDebtDetailDto) => {
                return (
                    <>
                        <Space>
                            <Button
                                type="primary" icon={<EyeOutlined />} title={L('Xem chi tiết')}
                                size='small'
                                onClick={() => this.actionTableSuppplier(record, EventTable.ViewDetail)}
                            ></Button>
                        </Space>
                    </>
                )
            }
        };
        const columns: ColumnsType<ReconcileSupplierDebtDetailDto> = [
            { title: "STT", key: "stt_drink_index", width: 50, render: (text: string, item: ReconcileSupplierDebtDetailDto, index: number) => <div>{index + 1}</div> },
            {
                title: "Mã phiếu nhập", key: "ex_code", render: (text: string, item: ReconcileSupplierDebtDetailDto, index: number) =>
                    <div>{item.rec_im_re_code}</div>
            },
            {
                title: "Tổng số sản phẩm", key: "ex_money", render: (text: string, item: ReconcileSupplierDebtDetailDto, index: number) =>
                    <div>{AppConsts.formatNumber(item.listProductImport?.length)}</div>
            },
            {
                title: "Tổng số lượng", key: "rec_total_money_calculated", render: (text: string, item: ReconcileSupplierDebtDetailDto, index: number) =>
                    <div>{AppConsts.formatNumber(item.listProductImport?.reduce((total, currentTotal) => {
                        return total + currentTotal.pr_im_quantity
                    }, 0))}</div>
            },
            {
                title: "Tổng tiền hàng", key: "rec_total_money_reality", render: (text: string, item: ReconcileSupplierDebtDetailDto, index: number) =>
                    <div>{AppConsts.formatNumber(item.rec_total_money_reality)}</div>
            },
            {
                title: L('Trạng thái đối soát'), width: "25%", dataIndex: 'rec_status', key: 'rec_status', render: (text: string, item: ReconcileSupplierDebtDetailDto, index: number) =>
                    <div>
                        {this.props.hasAction != undefined && this.props.hasAction == true ?
                            <>
                                {
                                    eReconcileDebtStatus.SUCCESS.num == item.rec_status && <Tag color='green'>{valueOfeReconcileDebtStatus(item.rec_status)}</Tag>
                                }
                                {
                                    eReconcileDebtStatus.WAIT.num == item.rec_status && <Tag color='blue'>{valueOfeReconcileDebtStatus(item.rec_status)}</Tag>
                                }
                            </>
                            : <>{valueOfeBillReconcileStatus(item.rec_status)}</>
                        }
                    </div>
            },
            { title: "Thời gian nhập", key: "ex_created_at", render: (text: string, item: ReconcileSupplierDebtDetailDto) => <div> {moment(item.rec_created_at).format("DD/MM/YYYY hh:mm")} </div> },
            { title: "Thời gian tạo đối soát", key: "ex_reconcile_at", render: (text: string, item: ReconcileSupplierDebtDetailDto) => <div> {moment(item.rec_from).format("DD/MM/YYYY hh:mm")} - {moment(item.rec_to).format("DD/MM/YYYY hh:mm")} </div> },
        ]
        if (hasAction != undefined && hasAction === true) {
            columns.push(action);
        }
        return (
            <div>
                <Row gutter={[8, 8]} align='bottom' >
                    <Col span={10} style={{ display: "flex" }}>
                        <TitleTableModalExport title='Danh sách nhập hàng trên hệ thống'></TitleTableModalExport>
                    </Col>
                    {(hasAction != undefined && hasAction === true) ?
                        <>
                            <Col span={4} style={{ textAlign: 'left' }}>
                                <strong>Mã hóa đơn</strong>
                                <Input placeholder='Mã hóa đơn' allowClear onChange={async (e) => {
                                    await this.setState({ rec_code_search: e.target.value == "" ? undefined : e.target.value.trim() });
                                    await this.onSearchStatic();
                                }}
                                    value={this.state.rec_code_search}>
                                </Input>
                            </Col>
                            <Col span={4} style={{ width: "100%", textAlign: 'left' }}>
                                <strong>Trạng thái đơn hàng</strong>
                                <SelectEnumMulti
                                    placeholder='Trạng thái đơn hàng'
                                    eNum={eReconcileDebtStatus}
                                    onChangeEnum={async (e) => {
                                        await this.setState({ bi_reconcile_status_search: e }); this.onSearchStatic();
                                    }}
                                    enum_value={this.reconcile_status} />
                            </Col>
                            <Col span={6} style={{ display: "flex" }}>
                                <Space>
                                    <Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={() => this.onSearchStatic()} >Tìm kiếm</Button>
                                    {(!!this.state.rec_code_search || this.state.bi_reconcile_status_search.length > 0) &&
                                        <Button danger icon={<DeleteOutlined />} title={"Xóa tìm kiếm"} onClick={async () => await this.clearSearch()} >{this.shouldChangeText() ? 'Xóa' : 'Xóa tìm kiếm'}</Button>
                                    }
                                </Space>
                            </Col>
                        </>
                        : ""}
                </Row>
                <Table
                    className='centerTable customTable'
                    scroll={(hasAction != undefined && hasAction === true) ? { x: 1000, y: 600 } : { x: undefined, y: undefined }}
                    columns={columns}
                    size={'middle'}
                    loading={this.props.isLoadDone}
                    bordered={true}
                    
                    dataSource={this.state.bi_reconcile_status_search.length > 0 ? this.listDataReconcileFill : this.listDataReconcile}
                    rowKey={record => "billing_table" + JSON.stringify(record)}
                    pagination={this.props.hasAction != false ? {
                        showTotal: (tot) => "Tổng" + ": " + tot + "",
                        showQuickJumper: true,
                        showSizeChanger: true,
                        pageSizeOptions: pageSizeOptions,
                    } : false} />
            </div>
        )
    }

}