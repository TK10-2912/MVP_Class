import { CheckCircleOutlined, CheckOutlined, DeleteOutlined, EyeFilled, MoneyCollectOutlined, SearchOutlined, SyncOutlined } from "@ant-design/icons";
import SelectEnum from "@src/components/Manager/SelectEnum";
import SelectUserMultiple from "@src/components/Manager/SelectUserMultiple";
import SelectedGroupMachine from "@src/components/Manager/SelectedGroupMachine";
import SelectedMachineMultiple from "@src/components/Manager/SelectedMachineMultiple";
import { isGranted } from "@src/lib/abpUtility";
import AppConsts, { EventTable, cssColResponsiveSpan } from "@src/lib/appconst";
import { eReconcileStatus, valueOfeReconcileStatus } from "@src/lib/enumconst";
import HistoryHelper from "@src/lib/historyHelper";
import { ReconcileCashDetailDto } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import { Button, Col, Row, Space, Table, Tag } from "antd";
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from "antd/lib/table";
import { SorterResult } from "antd/lib/table/interface";
import moment from "moment";
import React from "react";
import { Link } from "react-router-dom";
import ModalExportCashReconcileDetailAdmin from "./ModalExportCashDetailReconcileAdmin";
import { start } from "repl";
export interface IProps {
    pagination: TablePaginationConfig | false;
    listReconciliationResult?: ReconcileCashDetailDto[];
    has_action: boolean;
    is_printed?: boolean;
    isReload?: boolean;
    actionTable?: (item: ReconcileCashDetailDto, event: EventTable) => void;
    onSuccess?: () => void;
    expandedRowRender?: (item: ReconcileCashDetailDto) => JSX.Element;
    changeColumnSort?: (fieldSort: SorterResult<ReconcileCashDetailDto> | SorterResult<ReconcileCashDetailDto>[]) => void;

}

export default class TableReconcileCashDetailAdmin extends React.Component<IProps> {
    state = {
        visibleModalBillingDetail: false,
        bi_code: "",
        skipCount: 0,
        maxResultCount: 10,
        pageSize: 10,
        currentPage: 1,
        isLoadDone:false,
        expandedRowKey: [],
        keyRow: undefined,
        isReload: undefined,
        gr_id: undefined,
        ma_id:[] as number[] | undefined,
        us_operator_id: undefined,
        re_status: undefined,
        visibleExportExcel: false,
    }
    listData: ReconcileCashDetailDto[] = [];

    onSuccess = () => {
        if (!!this.props.onSuccess) {
            this.props.onSuccess();
        }
    }
    componentDidMount() {
        this.listData = this.props.listReconciliationResult!;
        this.setState({ isLoadDone: !this.state.isLoadDone });

    }
    componentDidUpdate = (prevProps, prevState) => {
        if (this.props.isReload != this.state.isReload) {
            this.listData = this.props.listReconciliationResult !=undefined ? this.props.listReconciliationResult : [];
            this.setState({ isReload: this.props.isReload, isLoadDone: !this.state.isLoadDone })
        }
    }
    handleExpand = (expanded, record) => {
        if (expanded) {
            this.setState({ expandedRowKey: [`${record.ma_id}_${record.rec_id}`], keyRow: `${record.ma_id}_${record.rec_id}` });
        } else {
            this.setState({ expandedRowKey: undefined, keyRow: undefined });
        }
    };
    onAction = (item: ReconcileCashDetailDto, action: EventTable) => {
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action);
        }
    }
    handleSearch = () => {
        
        this.listData = this.props.listReconciliationResult != undefined ? this.props.listReconciliationResult : [];
        if (!!this.state.gr_id) {
            
            this.listData = this.listData.filter(item => stores.sessionStore.getIDGroupUseMaId(item.ma_id) == this.state.gr_id)
        }
        if (this.state.ma_id != undefined && this.state.ma_id.length > 0) {
            this.listData = this.listData.filter(item => this.state.ma_id?.includes(item.ma_id));
        }
        if (!!this.state.us_operator_id) {
            this.listData = this.listData.filter(item => item.us_id_operator == this.state.us_operator_id)
        }
        if (this.state.re_status != undefined) {
            this.listData = this.listData.filter(item => item.rec_status == this.state.re_status)
        }
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }
    clearSearch = () => {
        this.listData = this.props.listReconciliationResult != undefined ? this.props.listReconciliationResult : [];
        this.setState({ gr_id: undefined, ma_id: undefined, us_operator_id: undefined, re_status: undefined })
    }
    render() {
        const { has_action, listReconciliationResult } = this.props;
        let action: ColumnGroupType<ReconcileCashDetailDto> = {
            title: 'Chức năng', children: [], key: 'action_member_index', className: "no-print center", fixed: 'right',
            render: (_: string, item: ReconcileCashDetailDto) => (
                <Space>
                    {
                        isGranted(AppConsts.Permission.Pages_Reconcile_Reconcile_DetailBilling) &&
                        <Button
                            type="primary" icon={<EyeFilled />} title={"Xem chi tiết"}
                            size='small'
                            onClick={() => { }}
                        >
                        </Button>
                    }
                    {item.rec_status == eReconcileStatus.NONE.num && isGranted(AppConsts.Permission.Pages_Reconcile_Reconcile_Confirm) &&
                        <Button
                            type="primary" icon={<CheckOutlined />} title={"Xác nhận"}
                            size='small'
                            onClick={(e) => { e.stopPropagation(); this.onAction(item!, EventTable.Accept) }}
                        >
                        </Button>
                    }
                    {item.rec_status == eReconcileStatus.READY.num && isGranted(AppConsts.Permission.Pages_Reconcile_Reconcile_Withdraw) &&
                        <Button
                            type="primary" icon={<MoneyCollectOutlined />} title={"Rút tiền"}
                            size='small'
                            onClick={(e) => {
                                e.stopPropagation();
                                localStorage.setItem('reconcile_cash', JSON.stringify(item));
                                HistoryHelper.redirect("/statistic/withdraw_report");
                            }}>
                        </Button>
                    }
                </Space>
            )
        }
        const columns: ColumnsType<ReconcileCashDetailDto> = [
            { title: "STT", key: "stt_transaction_index", width: 50, render: (text: string, item: ReconcileCashDetailDto, index: number) => <div>{this.props.pagination != false ? this.props.pagination.pageSize! * (this.props.pagination.current! - 1) + (index + 1) : index + 1}</div> },
            {
                title: "Đợt rút thứ", key: "stt_transaction_index", render: (text: string, item: ReconcileCashDetailDto, index: number) => <div>
                        <div >{item.dot_rut_thu}
                        </div>
                </div>
            },
            {
                title: "Nhóm máy", key: "stt_transaction_index", render: (text: string, item: ReconcileCashDetailDto, index: number) => <div>
                    {this.props.is_printed ? stores.sessionStore.displayGroupMachineUseMaIdTable(item.ma_id) :
                        <div title="Chi tiết nhóm máy">
                            <Link to={"/general/machine/?gr_id=" + stores.sessionStore.getIDGroupUseMaId(item.ma_id)} target="_blank">
                                {stores.sessionStore.displayGroupMachineUseMaIdTable(item.ma_id)}
                            </Link>
                        </div>
                    }
                </div>
            },
            {
                title: 'Máy bán nước', width: 150, key: "ma_may", render: (text: string, item: ReconcileCashDetailDto) => <div>
                    {this.props.is_printed ? stores.sessionStore.getCodeMachines(item.ma_id) :
                        <div title={`Chi tiết máy ${stores.sessionStore.getNameMachines(item.ma_id)}`}>
                            <Link to={"/general/machine/?machine=" + stores.sessionStore.getCodeMachines(item.ma_id)} target="_blank">
                                <div>{stores.sessionStore.getMachineCode(item.ma_id)}</div>
                                <div style={{ fontSize: 11, color: 'gray' }}>{stores.sessionStore.getNameMachines(item.ma_id)}</div>
                            </Link>
                        </div>
                    }
                </div>
            },
            {
                title: "Người vận hành", width: 150, key: "us_id_operator", render: (text: string, item: ReconcileCashDetailDto, index: number) => <div>{stores.sessionStore.getUserNameById(item.us_id_operator)}</div>
            },
            {
                title: "Tiền giao dịch", width: 500, children: [
                    { title: "Tiền từ hệ thống", key: "rec_total_money_calculated", sorter: (a,b)=> a.rec_total_money_calculated -b.rec_total_money_calculated , render: (text: string, item: ReconcileCashDetailDto) => <div> {AppConsts.formatNumber(item.rec_total_money_calculated)} </div> },
                    { title: "Tiền lấy từ máy", key: "rec_total_money_reality", sorter:  (a,b)=> a.rec_total_money_reality -b.rec_total_money_reality, render: (text: string, item: ReconcileCashDetailDto) => <div> {AppConsts.formatNumber(item.rec_total_money_reality)} </div> },
                    { title: "Tiền hoàn trả", key: "rec_refund_money", sorter:  (a,b)=> a.rec_refund_money -b.rec_refund_money, render: (text: string, item: ReconcileCashDetailDto) => <div> {AppConsts.formatNumber(item.rec_refund_money)} </div> },
                ]
            },
            { title: "Tiền thực nhận", dataIndex: 'rec_created_at', sorter: (a,b)=> (a.rec_total_money_calculated - a.rec_refund_money) -(b.rec_total_money_calculated - b.rec_refund_money), key: "rec_created_at", render: (_: string, item: ReconcileCashDetailDto) => <div>{AppConsts.formatNumber(item.rec_total_money_calculated - item.rec_refund_money)}</div> },
            // { title: "Thời gian tạo đối soát", dataIndex: 'rec_created_at', sorter: true, key: "rec_created_at", render: (_: string, item: ReconcileCashDetailDto) => <div>{moment(item.rec_created_at)}</div> },
            {
                title: "Trạng thái đối soát",
                key: "rec_customer_is_confirmed",
                width: "25%",
                render: (text: string, item: ReconcileCashDetailDto) => {
                    return has_action === true
                        ? (
                            <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                {item.rec_status === eReconcileStatus.NONE.num && (
                                    <Tag color="orange" icon={<SyncOutlined spin />} style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                        {valueOfeReconcileStatus(item.rec_status)}
                                    </Tag>
                                )}
                                {item.rec_status === eReconcileStatus.READY.num && (
                                    <Tag color="blue" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                        {valueOfeReconcileStatus(item.rec_status)}
                                    </Tag>
                                )}
                                {item.rec_status === eReconcileStatus.PAID.num && (
                                    <Tag icon={<CheckCircleOutlined />} color="green" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                        {valueOfeReconcileStatus(item.rec_status)}
                                    </Tag>
                                )}
                            </div>
                        )
                        : (
                            <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                {valueOfeReconcileStatus(item.rec_status)}
                            </div>
                        );
                }
            },

        ]
        if (has_action != undefined && has_action == true) {
            columns.push(action);
        }
        return (
            <>
                {this.props.is_printed != true &&
                    <Row gutter={10} align="bottom" style={{ marginBottom: 5 }}>
                        <Col {...cssColResponsiveSpan(24, 12, 8, 5, 4, 3)}>
                            <strong>Nhóm máy</strong>
                            <SelectedGroupMachine groupmachineId={this.state.gr_id} onChangeGroupMachine={async (value) => { await this.setState({ gr_id: value }); await this.handleSearch() }} />
                        </Col>
                        <Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 4)}>
                            <strong>Máy bán nước</strong>
                            <SelectedMachineMultiple
                                onChangeMachine={async (value) => { await this.setState({ ma_id: value }); await this.handleSearch() }} groupMachineId={this.state.gr_id} listMachineId={this.state.ma_id} />
                        </Col>
                        <Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 4)}>
                            <strong>Người vận hành</strong>
                            <SelectUserMultiple
                                onChangeUser={async (value) => { await this.setState({ us_operator_id: value }); await this.handleSearch() }}
                                us_id_list={this.state.us_operator_id}
                            />
                        </Col>
                        <Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 4)}>
                            <strong>Trạng thái đối soát</strong>
                            <SelectEnum
                                eNum={eReconcileStatus}
                                onChangeEnum={async value => {
                                    await this.setState({ re_status: value }); await this.handleSearch();
                                }}
                                enum_value={this.state.re_status}
                            />
                        </Col>
                        <Col  {...cssColResponsiveSpan(24, 24, 16, 7, 5, 6)} style={{ display: "flex", flexWrap: "wrap", padding: 0 }}>
                            <Col>
                                <Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={this.handleSearch} >Tìm kiếm</Button>
                            </Col>
                            {
                                (!!this.state.gr_id || this.state.ma_id != undefined && this.state.ma_id.length > 0 || !!this.state.us_operator_id || this.state.re_status != undefined) &&
                                <Col>
                                    <Button danger icon={<DeleteOutlined />} onClick={() => this.clearSearch()} title={"Xóa tìm kiếm"}  >Xóa tìm kiếm</Button>
                                </Col>
                            }
                        </Col>
                        <Col style={{ textAlign: "end" }} {...cssColResponsiveSpan(24, 12, 24, 24, 24, 3)}>
                            <Button type="primary" icon={<SearchOutlined />} title={'Tìm kiếm'} onClick={() => this.setState({ visibleExportExcel: true })}>Xuất dữ liệu</Button>

                        </Col>
                    </Row>
                }
                <Table
                    className="centerTable"
                    scroll={this.props.is_printed == false ? { x: 1600, y: 600 } : { x: undefined, y: undefined }}
                    size={'small'}
                    rowKey={record => `${record.ma_id}_${record.rec_id}`}
                    onRow={() => ({ title: 'Xem chi tiết', })}
                    bordered={true}
                    pagination={this.props.has_action != false ? this.props.pagination : false}
                    columns={columns}
                    rowClassName={(record) => `pointHover ${this.state.keyRow === `${record.ma_id}_${record.rec_id}` ? "bg-lightGreen" : "bg-white"}`}
                    dataSource={this.listData}
                    onChange={(_a, _b, sort: SorterResult<ReconcileCashDetailDto> | SorterResult<ReconcileCashDetailDto>[]) => {
                        if (!!this.props.changeColumnSort) {
                            this.props.changeColumnSort(sort);
                        }
                    }}
                    expandable={
                        this.props.is_printed
                            ? {}
                            : {
                                expandedRowRender: this.props.expandedRowRender,
                                expandRowByClick: true,
                                expandIconColumnIndex: -1,
                                expandedRowKeys: this.state.expandedRowKey,
                                onExpand: (isGranted(AppConsts.Permission.Pages_Manager_General_Product_Update)) ? this.handleExpand : () => { },
                            }
                    }
                >
                </Table>
                {
                    this.state.visibleExportExcel &&
                    <ModalExportCashReconcileDetailAdmin
                        listReconsile={this.listData}
                        onCancel={() => { this.setState({ visibleExportExcel: false }) }}
                        visible={this.state.visibleExportExcel}
                    />
                }
            </>
        )
    }
}