import AppConsts, { EventTable, cssColResponsiveSpan } from "@src/lib/appconst";
import { eBillReconcileStatus, eReconcileStatus, valueOfeReconcileStatus } from "@src/lib/enumconst";
import { ReconcileDto } from "@src/services/services_autogen";
import { Button, Col, Row, Space, Table, Tag } from "antd";
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from "antd/lib/table";
import moment from "moment";
import React from "react";
import { stores } from "@src/stores/storeInitializer";
import { CheckCircleOutlined, CheckOutlined, DeleteOutlined, EyeFilled, MoneyCollectOutlined, SearchOutlined, SyncOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import HistoryHelper from "@src/lib/historyHelper";
import { isGranted } from "@src/lib/abpUtility";
import { SorterResult } from "antd/lib/table/interface";
import SelectedGroupMachine from "@src/components/Manager/SelectedGroupMachine";
import SelectedMachineMultiple from "@src/components/Manager/SelectedMachineMultiple";
import SelectUserMultiple from "@src/components/Manager/SelectUserMultiple";
import SelectEnum from "@src/components/Manager/SelectEnum";
import ModalExportRFIDReconcolelAdmin from "./ModalExportRFIDReconcoleAdmin";
export interface IProps {
    pagination: TablePaginationConfig | false;
    listReconsile?: ReconcileDto[];
    is_printed?: boolean;
    hasAction?: boolean;
    actionTable?: (item: ReconcileDto, event: EventTable) => void;
    changeColumnSort?: (fieldSort: SorterResult<ReconcileDto> | SorterResult<ReconcileDto>[]) => void;
    expandedRowRender?: (item: ReconcileDto) => JSX.Element;
    isReload?: boolean,
}
export default class TableReconcileRFIDAdmin extends React.Component<IProps> {
    state = {
        visibleModal: false,
        expandedRowKey: [],
        keyRow: undefined,
        gr_id: undefined,
        ma_id:[] as number[] | undefined,
        us_operator_id: undefined,
        re_status: undefined,
        visibleExportExcel: false,
        isReload: undefined,
    }
    listData: ReconcileDto[] = [];
    onAction = (item: ReconcileDto, action: EventTable) => {
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action);
        }
    }
    componentDidMount() {
        this.setState({ isLoadDone: false });
        this.listData = this.props.listReconsile != undefined ? this.props.listReconsile : [];
        this.setState({ isLoadDone: true });
    }
    handleExpand = (expanded, record) => {
        if (expanded) {
            this.setState({ expandedRowKey: [`${record.rec_id}_${record.rec_created_at}`], keyRow: `${record.rec_id}_${record.rec_created_at}` });
        } else {
            this.setState({ expandedRowKey: undefined, keyRow: undefined });
        }
    };
    componentDidUpdate = () => {
        if (this.props.isReload != this.state.isReload) {
            this.listData = this.props.listReconsile!;
            this.setState({ isReload: this.props.isReload })
        }
    }
    handleSearch = () => {
        this.setState({ isLoadDone: false });
        this.listData = this.props.listReconsile != undefined ? this.props.listReconsile : [];
        if (!!this.state.gr_id) {
            this.listData = this.listData.filter(item => stores.sessionStore.getIDGroupUseMaId(item.ma_id) == this.state.gr_id)
        }
        if (this.state.ma_id != undefined && this.state.ma_id.length > 0) {
            this.listData = this.listData.filter(item => this.state.ma_id?.includes(item.ma_id))
        }
        if (!!this.state.us_operator_id) {
            this.listData = this.listData.filter(item => item.us_id_operator == this.state.us_operator_id)
        }
        if (!!this.state.re_status) {
            this.listData = this.listData.filter(item => item.rec_status == this.state.re_status)
        }
        this.setState({ isLoadDone: true });
    }
    clearSearch = () => {
        this.listData = this.props.listReconsile != undefined ? this.props.listReconsile : [];
        this.setState({ gr_id: undefined, ma_id: undefined, us_operator_id: undefined, re_status: undefined })
    }
    render() {
        const { billListResult } = stores.billingStore;
        let action: ColumnGroupType<ReconcileDto> = {
            title: "Chức năng", key: "action_drink_index", className: "no-print center ", fixed: 'right', children: [],
            render: (text: string, item: ReconcileDto) => {
                let checkBillingStatus = billListResult.length > 0 && billListResult.filter(bill => item.listBillingId?.includes(bill.bi_id)).map(value => value.bi_reconcile_status === eBillReconcileStatus.DONE.num).length > 0
                let listBillingOnlyExcelStatus = item.listBillingOnlyInExcel != undefined ? item.listBillingOnlyInExcel.filter(bill => bill.ex_reconcile_status == eBillReconcileStatus.DONE.num) : [];
                let checkBillingOnlyExcelStatus = listBillingOnlyExcelStatus.length == item.listBillingOnlyInExcel?.length ? true : false;
                return (
                    <Space>
                        {isGranted(AppConsts.Permission.Pages_Reconcile_Reconcile_DetailBilling) &&
                            <Button
                                type="primary" icon={<EyeFilled />} title={"Chi tiết nạp tiền"}
                                size='small'
                            >
                            </Button>
                        }
                        {(item.rec_status == eReconcileStatus.NONE.num && isGranted(AppConsts.Permission.Pages_Reconcile_Reconcile_Confirm) && checkBillingOnlyExcelStatus) &&
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
                                    localStorage.setItem('reconcile_rfid', JSON.stringify(item));
                                    HistoryHelper.redirect("/statistic/withdraw_report");
                                }}>
                            </Button>
                        }
                    </Space>
                )
            }

        };

        const { listReconsile, hasAction, pagination } = this.props;
        const columns: ColumnsType<ReconcileDto> = [
            { title: "STT", key: "stt_transaction_index", width: 50, render: (text: string, item: ReconcileDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
            {
                title: "Nhóm máy", key: "stt_transaction_index", render: (text: string, item: ReconcileDto, index: number) => <div>
                    {this.props.is_printed ? stores.sessionStore.displayGroupMachineUseMaIdTable(item.ma_id) :
                        <div title="Chi tiết nhóm máy">
                            <Link to={"/general/machine/?gr_id=" + stores.sessionStore.getIDGroupUseMaId(item.ma_id)} target="_blank" >
                                {stores.sessionStore.displayGroupMachineUseMaIdTable(item.ma_id)}
                            </Link>
                        </div>
                    }
                </div>
            },
            {
                title: 'Máy bán nước', width: 150, key: "ma_may", render: (text: string, item: ReconcileDto) => <div>
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
            { title: "Người vận hành", key: "rec_total_money_calculated", render: (text: string, item: ReconcileDto) => <div> {stores.sessionStore.getUserNameById(item.us_id_operator)} </div> },
            {
                title: "Tiền giao dịch",
                width: 750,
                children: [
                    {
                        title: "Tiền hệ thống",
                        key: "rec_total_money_calculated",
                        dataIndex: "rec_total_money_calculated",
                        sorter: (a: ReconcileDto, b: ReconcileDto) =>
                            a.rec_total_money_calculated - b.rec_total_money_calculated,
                        render: (_: string, item: ReconcileDto) => (
                            <div>{AppConsts.formatNumber(item.rec_total_money_calculated)}</div>
                        ),
                    },
                    {
                        title: "Tiền ngân hàng",
                        key: "rec_total_money_reality",
                        dataIndex: "rec_total_money_reality",
                        sorter: (a: ReconcileDto, b: ReconcileDto) =>
                            a.rec_total_money_reality - b.rec_total_money_reality,
                        render: (_: string, item: ReconcileDto) => (
                            <div>{AppConsts.formatNumber(item.rec_total_money_reality)}</div>
                        ),
                    },
                    {
                        title: "Tiền hoàn trả",
                        key: "rec_refund_money",
                        dataIndex: "rec_refund_money",
                        sorter: (a: ReconcileDto, b: ReconcileDto) =>
                            a.rec_refund_money - b.rec_refund_money,
                        render: (_: string, item: ReconcileDto) => (
                            <div>{AppConsts.formatNumber(item.rec_refund_money)}</div>
                        ),
                    },
                ],
            },
            {
                title: "Trạng thái đối soát", width: hasAction === true ? 300 : 110, key: "rec_customer_is_confirmed", render: (text: string, item: ReconcileDto) => {
                    if (hasAction !== undefined && hasAction === true) {
                        return <div>
                            {item.rec_status === eReconcileStatus.NONE.num ? <Tag className="no_ellipsis" color="orange" >{valueOfeReconcileStatus(item.rec_status)}</Tag> : ""}
                            {item.rec_status === eReconcileStatus.READY.num ? <Tag className="no_ellipsis" icon={<SyncOutlined spin />} color="blue" >{valueOfeReconcileStatus(item.rec_status)}</Tag> : ""}
                            {item.rec_status === eReconcileStatus.PAID.num ? <Tag className="no_ellipsis" icon={<CheckCircleOutlined />} color="green" >{valueOfeReconcileStatus(item.rec_status)}</Tag> : ""}
                        </div>
                    } else {
                        return <div>
                            {valueOfeReconcileStatus(item.rec_status)}
                        </div>
                    }
                }
            },
            {
                title: "Thời gian tạo đối soát",
                dataIndex: "rec_created_at",
                sorter: (a: ReconcileDto, b: ReconcileDto) =>
                    moment(a.rec_created_at).unix() - moment(b.rec_created_at).unix(),
                key: "rec_created_at",
                render: (_: string, item: ReconcileDto) => (
                    <div>{moment(item.rec_created_at).format("DD/MM/YYYY HH:mm:ss")}</div>
                ),
            },
            {
                title: "Khoảng thời gian đối soát",
                dataIndex: "rec_from",
                sorter: (a: ReconcileDto, b: ReconcileDto) =>
                    moment(a.rec_from).unix() - moment(b.rec_from).unix(),
                key: "rec_from",
                render: (_: string, item: ReconcileDto) => (
                    <div>
                        {moment(item.rec_from).add(7, "hours").format("DD/MM/YYYY") +
                            " - " +
                            moment(item.rec_to).format("DD/MM/YYYY")}
                    </div>
                ),
            },
        ]
        if (hasAction !== undefined && hasAction === true) {
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
                                (!!this.state.gr_id ||this.state.ma_id != undefined && this.state.ma_id.length > 0 || !!this.state.us_operator_id || this.state.re_status != undefined) &&
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
                    scroll={(hasAction != undefined && hasAction === true) ? { x: 1650, y: 600 } : { x: undefined, y: undefined }}
                    rowKey={record => `${record.rec_id}_${record.rec_created_at}`}
                    size={'middle'}
                    bordered={true}
                    onChange={(a, b, sort: SorterResult<ReconcileDto> | SorterResult<ReconcileDto>[]) => {
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
                    rowClassName={(record) => `pointHover ${this.state.keyRow === `${record.rec_id}_${record.rec_created_at}` ? "bg-lightGreen" : "bg-white"}`}
                    pagination={this.props.pagination}
                    columns={columns}
                    dataSource={this.listData}>
                </Table>
                {this.state.visibleExportExcel &&
                    <ModalExportRFIDReconcolelAdmin
                        listReconsile={this.listData}
                        onCancel={() => { this.setState({ visibleExportExcel: false }) }}
                        visible={this.state.visibleExportExcel}
                    />
                }
            </>
        )
    }
}