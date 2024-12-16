import AppConsts, { EventTable, cssCol, pageSizeOptions } from '@src/lib/appconst';
import { ReconcileProductSupplierDebtDto, ReconcileSupplierDebtDetailDto } from '@src/services/services_autogen';
import { ColumnsType, ColumnGroupType, TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import { Button, Card, Col, Input, Row, Space, Table, Tag } from 'antd';
import { eBillReconcileStatus, eReconcileDebtStatus, valueOfeBillReconcileStatus, valueOfeReconcileDebtStatus, } from '@src/lib/enumconst';
import { CheckSquareOutlined, DeleteOutlined, EditOutlined, EyeOutlined, SearchOutlined, } from '@ant-design/icons';
import { L } from '@src/lib/abpUtility';
import SelectEnumMulti from '@src/components/Manager/SelectEnumMulti';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
export interface IProps {
    reconcileDebtListDto?: ReconcileSupplierDebtDetailDto[];
    isLoadDone?: boolean;
    hasAction?: boolean;
    visible?: boolean;
    actionTableSuppplierOnlyExcel?: (reconcile: ReconcileSupplierDebtDetailDto, event: EventTable) => void;
    pagination?: TablePaginationConfig | false;
}
export default class TableDetailReconcilDebtSupplierOnlyExcel extends React.Component<IProps> {
    state = {
        isLoadDone: true,
        rec_status: undefined,
        code_search: undefined,
        visibleProductList: false,
        reconcile_status_search: [],
        visibleChangeStatus: false,
        visibleUpdateStatusReconcile: false,
        currentPage: 1,
        pageSize: 10,
    }
    listDataReconcile: ReconcileSupplierDebtDetailDto[] = [];
    listDataReconcileFill: ReconcileSupplierDebtDetailDto[] = [];
    productSelected: ReconcileProductSupplierDebtDto = new ReconcileProductSupplierDebtDto();
    re_selected: ReconcileSupplierDebtDetailDto = new ReconcileSupplierDebtDetailDto();
    reconcile_status: number[] = [];
    required_refund: number[] = [];

    actionTableSuppplierOnlyExcel = (item: ReconcileSupplierDebtDetailDto, action: EventTable) => {
        const { actionTableSuppplierOnlyExcel } = this.props;
        if (actionTableSuppplierOnlyExcel !== undefined) {
            actionTableSuppplierOnlyExcel(item, action);
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
            this.setState({ isLoadDone: false });
            await this.initData();
            this.setState({ isLoadDone: true });
        }
    }

    onSearchStatic = async () => {
        this.setState({ isLoadDone: false });
        this.listDataReconcileFill = this.props.reconcileDebtListDto != undefined ? this.props.reconcileDebtListDto : [];
        if (this.state.reconcile_status_search.length > 0) {
            this.reconcile_status = this.state.reconcile_status_search;
            this.listDataReconcileFill = this.listDataReconcileFill.filter(bill => this.reconcile_status?.includes(bill.rec_status));
        }
        if (this.state.code_search != undefined) {
            this.listDataReconcileFill = this.listDataReconcileFill.filter(item => item.rec_im_re_code?.includes(this.state.code_search!));
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
            reconcile_status_search: [],
            code_search: undefined,
        })
        this.reconcile_status = [];
        this.setState({ isLoadDone: false });

    }

    render() {
        const { hasAction, reconcileDebtListDto } = this.props
        const action: ColumnGroupType<ReconcileSupplierDebtDetailDto> = {
            title: "Chức năng",
            width: 100,
            key: "action_billing_reconcile",
            fixed: 'right',
            children: [],
            render: (_: any, record: ReconcileSupplierDebtDetailDto) => {
                return (
                    <>{
                        <Space>
                            {
                                (() => {
                                    const listResult = record ? record.listSupplierDebtOnlyInExcel!.filter(item => item.pr_im_reconcile_status === eBillReconcileStatus.DONE.num) : [];
                                    return (
                                        <>
                                            {record.rec_status == eReconcileDebtStatus.WAIT.num && listResult.length == record.listSupplierDebtOnlyInExcel?.length && (
                                                <Button
                                                    type="primary" icon={<CheckSquareOutlined />} title={L('Cập nhật đối soát')}
                                                    size='small'
                                                    onClick={() => this.actionTableSuppplierOnlyExcel(record, EventTable.Accept)}
                                                ></Button>
                                            )}
                                        </>
                                    );
                                })()
                            }
                            <Button
                                type="primary" icon={<EyeOutlined />} title={L('Xem chi tiết')}
                                size='small'
                                onClick={() => this.actionTableSuppplierOnlyExcel(record, EventTable.ViewDetail)}

                            ></Button>
                        </Space>
                    }
                    </>)
            }
        };
        const columns: ColumnsType<ReconcileSupplierDebtDetailDto> = [
            { title: "STT", key: "stt_drink_index", width: 50, render: (text: string, item: ReconcileSupplierDebtDetailDto, index: number) => <div>{this.state.pageSize! * (this.state.currentPage! - 1) + (index + 1)}</div> },
            {
                title: "Mã phiếu nhập", key: "ex_code", render: (text: string, item: ReconcileSupplierDebtDetailDto, index: number) =>
                    <div>{item.rec_im_re_code}</div>
            },
            {
                title: "Tổng số sản phẩm",
                key: "ex_money",
                sorter: (a: ReconcileSupplierDebtDetailDto, b: ReconcileSupplierDebtDetailDto) =>
                    (a.listSupplierDebtOnlyInExcel?.length || 0) - (b.listSupplierDebtOnlyInExcel?.length || 0),
                render: (text: string, item: ReconcileSupplierDebtDetailDto, index: number) =>
                    <div>{item.listSupplierDebtOnlyInExcel?.length}</div>
            },
            {
                title: "Tổng số lượng",
                key: "rec_total_money_calculated",
                sorter: (a: ReconcileSupplierDebtDetailDto, b: ReconcileSupplierDebtDetailDto) =>
                    (a.listSupplierDebtOnlyInExcel?.reduce((total, currentTotal) => total + currentTotal.pr_quantity, 0) || 0) -
                    (b.listSupplierDebtOnlyInExcel?.reduce((total, currentTotal) => total + currentTotal.pr_quantity, 0) || 0),
                render: (text: string, item: ReconcileSupplierDebtDetailDto, index: number) =>
                    <div>{AppConsts.formatNumber(item.listSupplierDebtOnlyInExcel?.reduce((total, currentTotal) => total + currentTotal.pr_quantity, 0))}</div>
            },
            {
                title: "Tổng tiền hàng",
                key: "rec_total_money_reality",
                sorter: (a: ReconcileSupplierDebtDetailDto, b: ReconcileSupplierDebtDetailDto) =>
                    (a.rec_total_money_reality || 0) - (b.rec_total_money_reality || 0),
                render: (text: string, item: ReconcileSupplierDebtDetailDto, index: number) =>
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
            { title: "Thời gian nhập", sorter: (a, b) => moment(a.rec_created_at).unix() - moment(b.rec_created_at).unix(), key: "ex_created_at", render: (text: string, item: ReconcileSupplierDebtDetailDto) => <div> {moment(item.rec_created_at).format("DD/MM/YYYY HH:mm")} </div> },
            { title: "Thời gian tạo đối soát", sorter: (a, b) => moment(a.rec_created_at).unix() - moment(b.rec_created_at).unix(), key: "ex_reconcile_at", render: (text: string, item: ReconcileSupplierDebtDetailDto) => <div> {moment(item.rec_from).format("DD/MM/YYYY")} - {moment(item.rec_to).format("DD/MM/YYYY")} </div> },
        ]
        if (hasAction != undefined && hasAction === true) {
            columns.push(action);
        }
        const self = this;

        return (
            <Card>
                <Row gutter={[8, 8]} align='bottom' style={{ marginBottom: 20 }}>
                    <Col span={10} style={{ display: "flex" }}>
                        <TitleTableModalExport title='Danh sách nhập hàng chỉ có trong Excel'></TitleTableModalExport>
                    </Col>
                    {(hasAction != undefined && hasAction === true) ?
                        <>
                            <Col span={4} style={{ textAlign: 'left' }}>
                                <strong>Mã phiếu nhập</strong>
                                <Input allowClear placeholder='Mã phiếu nhập' onChange={async (e) => {
                                    await this.setState({ code_search: e.target.value == "" ? undefined : e.target.value.trim() });
                                    await this.onSearchStatic();
                                }}
                                    value={this.state.code_search}>
                                </Input>
                            </Col>
                            <Col span={4} style={{ width: "100%", textAlign: 'left' }}>
                                <strong>Trạng thái đơn hàng</strong>
                                <SelectEnumMulti placeholder='Trạng thái đối soát'
                                    eNum={eReconcileDebtStatus}
                                    onChangeEnum={async (e) => {
                                        await this.setState({ reconcile_status_search: e }); this.onSearchStatic();
                                    }}
                                    enum_value={this.reconcile_status} />
                            </Col>
                            <Col span={6} style={{ display: "flex" }}>
                                <Space>
                                    <Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={() => this.onSearchStatic()} >Tìm kiếm</Button>
                                    {(!!this.state.code_search || this.state.reconcile_status_search.length > 0) &&
                                        <Button danger icon={<DeleteOutlined />} title={"Xóa tìm kiếm"} onClick={async () => await this.clearSearch()} >{this.shouldChangeText() ? 'Xóa' : 'Xóa tìm kiếm'}</Button>
                                    }
                                </Space>
                            </Col>
                        </>

                        : ""}
                </Row>
                <Table
                    className='centerTable customTable'
                    scroll={(hasAction != undefined && hasAction === true) ? { x: 1300, y: 600 } : { x: undefined, y: undefined }}
                    columns={columns}
                    size={'middle'}
                    loading={this.props.isLoadDone}
                    bordered={true}
                    
                    dataSource={(this.state.reconcile_status_search.length > 0 || this.state.code_search != undefined) ? this.listDataReconcileFill : this.listDataReconcile}
                    rowKey={record => "billing_table" + JSON.stringify(record)}
                    pagination={this.props.hasAction && {
                        showTotal: (tot) => "Tổng" + ": " + tot + "",
                        showQuickJumper: true,
                        showSizeChanger: true,
                        pageSizeOptions: pageSizeOptions,
                        onChange(page: number, pageSize?: number) {
                            self.setState({ pageSize: pageSize, currentPage: page })
                        }
                    }}
                />
            </Card>
        )
    }

}