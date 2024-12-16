import { BillingDto, ReportOfMachineDto } from '@src/services/services_autogen';
import { TablePaginationConfig, ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import { Button, Col, message, Row, Space, Table, Tag } from 'antd';
import { stores } from '@src/stores/storeInitializer';
import { eReportStatus, valueOfeReportStatus } from '@src/lib/enumconst';
import { CheckCircleOutlined, EnvironmentOutlined, EyeOutlined, RollbackOutlined, SendOutlined, SyncOutlined } from '@ant-design/icons';
import AppConsts, { EventTable, cssColResponsiveSpan } from '@src/lib/appconst';
import { Link } from 'react-router-dom';
import ModalTableBillingViewAdmin from '@src/scenes/StatisticalReport/TabPayment/BankingPayment/componentAdmin/ModalTableBillingViewAdmin';
import { ColumnGroupType, SorterResult } from 'antd/lib/table/interface';
import { isGranted } from '@src/lib/abpUtility';
import LogHistoryReport from './LogHistoryReport';

export interface IProps {
    pagination: TablePaginationConfig | false;
    listReportOfMachine: ReportOfMachineDto[];
    hasAction: boolean;
    is_printed: boolean;
    actionTable?: (item: ReportOfMachineDto, event: EventTable, hasMapUrl?: boolean) => void;
    changeColumnSort?: (fieldSort: SorterResult<ReportOfMachineDto> | SorterResult<ReportOfMachineDto>[]) => void;
    onCancel?: () => void;
    checkExpand?: boolean;

}

export default class TableHistoryReport extends React.Component<IProps> {
    state = {
        isLoadDone: true,
        bi_id_selected: undefined,
        visibleModalBillProduct: false,
        visibleLog: false,
        expandedRowKey: undefined,

    }
    billingSelected: BillingDto = new BillingDto();

    onAction = (item: ReportOfMachineDto, action: EventTable, hasMapUrl?: boolean) => {
        this.setState({ bi_id_selected: item.re_id });
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action, hasMapUrl);
        }
    }
    onCancel = () => {
        if (!!this.props.onCancel) {
            this.props.onCancel();
        }
        this.setState({ expandedRowKey: [] });
    }
    handleExpand = (expanded, item: ReportOfMachineDto) => {
        if (expanded) {
            this.onCancel();
            this.setState({ expandedRowKey: [item.re_id], bi_id_selected: item.re_id });
        } else {
            this.setState({ expandedRowKey: undefined });
        }
    };
    render() {
        const { pagination, listReportOfMachine, is_printed, actionTable } = this.props
        let action: ColumnGroupType<ReportOfMachineDto> = {
            title: "Chức năng", key: "action_importing_index", className: "no-print", children: [], fixed: "right", width: 100,
            render: (text: string, item: ReportOfMachineDto) => {
                const maSelected = item.machine;
                return (
                    <Space>
                        {isGranted(AppConsts.Permission.Pages_History_CanhBao) &&
                            <Button
                                type="primary"
                                icon={<EyeOutlined />} title="Xem thông tin"
                                size='small'
                            // onClick={() => this.onAction(item!, EventTable.View)}
                            ></Button>
                        }
                        {
                            AppConsts.isValidLocation(maSelected.ma_gps_lat, maSelected.ma_gps_lng) ?
                                <>
                                    <Button
                                        icon={<EnvironmentOutlined />} title={"Vị trí máy"}
                                        size='small'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            this.onAction(item!, EventTable.ViewMap);
                                        }}
                                    ></Button>

                                    <Button
                                        icon={<SendOutlined />} title={"Chỉ đường"}
                                        size='small'
                                        onClick={() =>
                                            AppConsts.actionDirection(maSelected.ma_gps_lat!, maSelected.ma_gps_lng!)
                                        }
                                    ></Button>
                                </>
                                :
                                maSelected.ma_mapUrl ?
                                    <Button
                                        icon={<EnvironmentOutlined />} title={"Vị trí máy"}
                                        size='small'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            this.onAction(item!, EventTable.ViewMap);
                                        }}
                                    ></Button> : ""
                        }
                    </Space>
                )

            }
        };
        const columns: ColumnsType<ReportOfMachineDto> = [
            { title: "STT", key: "stt_drink_index", fixed: "left", width: 50, render: (text: string, item: ReportOfMachineDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : (index + 1)}</div> },
            {
                title: "Mã hóa đơn", key: "bi_money_bill_index", className: "hoverCell",
                onCell: (record) => {
                    return {
                        onClick: async () => {
                            if (!!record.billing) {
                                this.billingSelected = record.billing;
                                this.setState({ visibleModalBillProduct: true });
                            } else message.error("Mã hoá đơn không hợp lệ!");
                        }
                    }
                },
                render: (text: string, item: ReportOfMachineDto) => <div title="Chi tiết hoá đơn"> {!!item.billing ? item.billing.bi_code : "Đơn không hợp lệ"}</div>
            },
            {
                title: "Nhóm máy", width: 150, key: "bi_money_bill_index", render: (text: string, item: ReportOfMachineDto) => <div>{is_printed == false ?
                    <div title="Chi tiết nhóm máy">
                        <Link target='_blank' to={"/general/machine/?gr_id=" + (item.machine.gr_ma_id)} onClick={() => this.setState({ bi_id_selected: item.re_id })} onDoubleClick={() => this.onAction(item, EventTable.View)} >
                            {stores.sessionStore.displayGroupMachineDisplayTable(item.machine.gr_ma_id)}
                        </Link>
                    </div>
                    :
                    <>
                        {stores.sessionStore.displayGroupMachineDisplayTable(item.machine.gr_ma_id)}
                    </>
                }
                </div>
            },
            {
                title: 'Máy bán nước',
                dataIndex: '',
                key: 'ma_display_name',
                render: (text: string, item: ReportOfMachineDto, index: number) => (
                    <div
                        style={
                            this.props.is_printed
                                ? {}
                                : {
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                }
                        }
                    >
                        {this.props.is_printed ? (
                            <div>
                                <p style={{ margin: 0 }}>{stores.sessionStore.getCodeMachines(item.ma_id)}</p>
                                <p style={{ margin: 0 }}>{stores.sessionStore.getNameMachines(item.ma_id)}</p>
                            </div>
                        ) : (
                            <div title={'Xem chi tiết ' + stores.sessionStore.getNameMachines(item.ma_id)}>
                                <Link
                                    to={'/general/machine/?machine=' + stores.sessionStore.getCodeMachines(item.ma_id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    <div>
                                        <p style={{ margin: 0 }}>{stores.sessionStore.getCodeMachines(item.ma_id)}</p>
                                        <p style={{ margin: 0, color: "gray", fontSize: 11 }}>{stores.sessionStore.getNameMachines(item.ma_id)}</p>
                                    </div>
                                </Link>
                            </div>
                        )}
                    </div>
                ),
            },
            { title: "Người vận hành", sorter: false, dataIndex: "us_id_report", key: "us_id_report_index", render: (text: number, item: ReportOfMachineDto) => <div>{stores.sessionStore.getUserNameById(item.machine.us_id_operator)}</div> },



            { title: "Mô tả báo cáo", key: "bi_money_bill_index", render: (text: string, item: ReportOfMachineDto) => <div> {item.re_display}</div> },
            {
                title: "Trạng thái", width: 120, key: "re_status_index", render: (text: number, item: ReportOfMachineDto) => {
                    if (is_printed == false) {
                        return <div>
                            {item.re_status == eReportStatus.DA_HOAN_THANH.num ? <Tag icon={<CheckCircleOutlined />} color="green">Hoàn thành</Tag> : ""}
                            {item.re_status == eReportStatus.KHOI_TAO.num ? <Tag color="#FFB266" style={{ color: 'black' }}>Khởi tạo</Tag> : ""}
                        </div>
                    } else {
                        return <div>
                            {valueOfeReportStatus(item.re_status)}
                        </div>
                    }
                }
            },
            {
                title: "Ghi chú", key: "bi_money_bill_index", render: (text: string, item: ReportOfMachineDto) => <div title={item.re_note ?? ""} style={{
                    marginTop: "14px", textOverflow: "ellipsis",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    margin: 0,
                }} dangerouslySetInnerHTML={{ __html: item.re_note! }}></div>
            },
            { title: "Ngày tạo", sorter: true, dataIndex: "re_created_at", key: "re_created_at", render: (text: string, item: ReportOfMachineDto) => <div> {moment(item.re_created_at).format("DD/MM/YYYY - HH:mm:ss")}</div> },
            {
                title: "Thời gian xử lý",
                width: 100,
                sorter: true,
                dataIndex: "re_updated_at",
                key: "re_updated_at",
                render: (_: number, item: ReportOfMachineDto) => (
                    <div>
                        {item.re_status === eReportStatus.DA_HOAN_THANH.num
                            ? moment(item.re_updated_at).format("DD/MM/YYYY HH:mm:ss")
                            : <Tag color="#FFB266" style={{ color: 'black' }}>Chưa xử lý</Tag>
                        }
                    </div>
                ),
            },
        ]
        if (actionTable != undefined && isGranted(AppConsts.Permission.Pages_History_CanhBao)) {
            columns.push(action);
        }
        return (
            <>
                <Table
                    className='centerTable'
                    scroll={this.props.is_printed ? { x: undefined, y: undefined } : { x: 1500, y: 600 }}
                    columns={columns}
                    size={'middle'}
                    bordered={true}
                    onChange={(a, b, sort: SorterResult<ReportOfMachineDto> | SorterResult<ReportOfMachineDto>[]) => {
                        if (!!this.props.changeColumnSort) {
                            this.props.changeColumnSort(sort);
                        }
                    }}
                    dataSource={listReportOfMachine.length! > 0 ? listReportOfMachine : []}
                    pagination={this.props.pagination}
                    rowKey={record => record.re_id}
                    rowClassName={(record) => (this.state.bi_id_selected === record.re_id) ? "bg-click" : "bg-white"}
                    expandable={
                        this.props.is_printed
                            ? {}
                            : {
                                expandedRowRender: (record) => (
                                    <LogHistoryReport
                                        isLoadDone={this.state.isLoadDone}
                                        pagination={false}
                                        onCancel={() => this.setState({ expandedRowKey: [] })}
                                        reportOfMachineDto={record}
                                    ></LogHistoryReport>
                                ),
                                expandRowByClick: true,
                                expandIconColumnIndex: -1,
                                expandedRowKeys: this.props.checkExpand == true ? [] : this.state.expandedRowKey,
                                onExpand: (isGranted(AppConsts.Permission.Pages_Manager_General_Product_Update)) ? this.handleExpand : () => { },
                            }
                    }
                    footer={(record) => {
                        const list = [...record];
                        const totalMachine = new Set(list.map(item => item.ma_id)).size;
                        const totalDone = record.filter(item => item.re_status == eReportStatus.DA_HOAN_THANH.num);
                        const totalError = list.filter(item => item.re_status == eReportStatus.KHOI_TAO.num);   
                        return (
                            <Row gutter={8} id="footer_id">
                                <Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)} style={{ border: '1px solid #e4e1e1', padding: 8 }}>
                                    <span>Tổng số máy lỗi: <b style={{ color: "#1DA57A" }}>{totalMachine}</b></span>
                                </Col>
                                <Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)} style={{ border: '1px solid #e4e1e1', padding: 8 }}>
                                    <span>Tổng số lỗi: <b style={{ color: "#1DA57A" }}>{totalDone.length + totalError.length}</b></span>
                                </Col>
                                <Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)} style={{ border: '1px solid #e4e1e1', padding: 8 }}>
                                    <span>Lỗi đã sửa: <b style={{ color: "#1DA57A" }}>{totalDone.length}</b></span>
                                </Col>
                                <Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)} style={{ border: '1px solid #e4e1e1', padding: 8 }}>
                                    <span>Lỗi chưa sửa: <b style={{ color: "orange" }}>{totalError.length}</b></span>
                                </Col>
                            </Row>
                        )
                    }}
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