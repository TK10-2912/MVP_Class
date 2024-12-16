import { EyeFilled } from '@ant-design/icons';
import { L, isGranted } from '@lib/abpUtility';
import { WithdrawDto } from '@services/services_autogen';
import AppConsts, { cssColResponsiveSpan } from '@src/lib/appconst';
import { eBillMethod, valueOfeBillMethod } from '@src/lib/enumconst';
import { stores } from '@src/stores/storeInitializer';
import { Button, Col, Row, Space, Table, Tabs, } from 'antd';
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { SorterResult, TableRowSelection } from 'antd/lib/table/interface';
import moment from 'moment';
import * as React from 'react';
import { Link } from 'react-router-dom';
import DetailWithDraw from './DetailWithdraw';
import HistoryHelper from '@src/lib/historyHelper';

export interface IProps {
    withdrawListResult: WithdrawDto[],
    pagination: TablePaginationConfig | false;
    hasAction?: boolean;
    doId?: number;
    rowSelection?: TableRowSelection<WithdrawDto>
    isLoadDone?: boolean;
    is_Printed?: boolean;
    checkExpand?: boolean;
    changeColumnSort?: (fieldSort: SorterResult<WithdrawDto> | SorterResult<WithdrawDto>[]) => void;
    pageSize?: number;
    currentPage?: number;
    isModal?: boolean

}
export const tabManager = {
    tab_1: L("Thông tin chi tiết rút tiền"),

}
export default class TableWithdrawAdmin extends React.Component<IProps> {
    state = {
        isLoadDone: false,
        wi_id_selected: undefined,
        expandedRowKey: undefined,
        openExpand: false,
        keyRow: undefined,
    };
    withdrawSelect: WithdrawDto = new WithdrawDto();
    handleExpand = (expanded, record) => {
        if (expanded) {
            this.setState({ expandedRowKey: [record.wi_id], wi_id_selected: record.wi_id });
        } else {
            this.setState({ expandedRowKey: undefined, record: undefined });
        }
    };
    render() {
        const { withdrawListResult, pagination, hasAction, rowSelection, is_Printed, isModal } = this.props;
        let action: ColumnGroupType<any> = {
            title: 'Chức năng', children: [], key: 'action_Supplier_index', className: "no-print center", width: 100, fixed: "right",
            render: (text: string, item: WithdrawDto) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EyeFilled />} title="Xem thông tin"
                        style={{ marginLeft: '10px' }}
                        size='small'
                    ></Button>
                </Space>
            )
        };
        const columns: ColumnsType<WithdrawDto> = [
            { title: L('STT'), key: 'stt', width: 50, render: (text: string, item: WithdrawDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
            {
                title: L('Nhóm máy'), key: 'wi_total_money_reality', render: (text: string, item: WithdrawDto) => <div>
                    {this.props.is_Printed ?
                        <>
                            {stores.sessionStore.displayGroupMachineUseMaIdTable(item.ma_id)}
                        </>
                        :
                        <div title="Chi tiết nhóm máy">

                            <Link target="_blank" to={"/general/machine/?gr_id=" + stores.sessionStore.getIdGroupMachinesStatistic(stores.sessionStore.getNameGroupUseMaId(item.ma_id))} >
                                {stores.sessionStore.displayGroupMachineUseMaIdTable(item.ma_id)}
                            </Link>
                        </div>

                    }
                </div>
            },
            {
                title: 'Máy bán nước', key: 'ma_name', width: 200,
                render: (text: string, item: WithdrawDto) => <div style={this.props.is_Printed ? {} : {
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical"
                }}>
                    {this.props.is_Printed == true ?
                        <div>
                            <div>{stores.sessionStore.getCodeMachines(item.ma_id)}</div>
                            <div>{stores.sessionStore.getNameMachines(item.ma_id)}</div>
                        </div>
                        :
                        <div title={`Chi tiết máy ${stores.sessionStore.getNameMachines(item.ma_id)}`}>
                            <Link target="blank" to={"/general/machine/?machine=" + stores.sessionStore.getCodeMachines(item.ma_id)}>
                                <div>{stores.sessionStore.getCodeMachines(item.ma_id)}</div>
                                <div style={{ color: "gray" }}>{stores.sessionStore.getNameMachines(item.ma_id)}</div>
                            </Link>
                        </div>

                    }
                </div>
            },
            {
                title: L('Người vận hành'), key: 'us_id_operator', render: (text: string, item: WithdrawDto) => <div>
                    {stores.sessionStore.getUserNameById(item.us_id_operator)}
                </div>
            },
            {
                title: L('Phương thức đối soát'),
                className: "hoverCell",
                onCell: () => {
                    return {
                        onClick: (e) => {
                            e.stopPropagation();
                            HistoryHelper.redirect("/reconsile/reconsile_money");
                        }
                    }
                },
                key: 'wi_payment_type', render: (text: string, item: WithdrawDto) => <div>{valueOfeBillMethod(item.wi_payment_type)}</div>
            },
            { title: L('Tổng tiền rút'), key: 'wi_total_money', dataIndex: "wi_total_money_reality", sorter: true, render: (text: string, item: WithdrawDto) => <div>{AppConsts.formatNumber(item.wi_total_money_reality)}</div> },
            { title: L('Thời gian tạo rút tiền'), dataIndex: 'wi_created_at', key: "wi_created_at", sorter: true, render: (text: string, item: WithdrawDto) => <div>{moment(item.wi_created_at).format("DD/MM/YYYY HH:mm:ss")}</div> },
            { title: L('Tháng đối soát'), dataIndex: 'wi_created_at', key: "wi_created_at", sorter: true, render: (text: string, item: WithdrawDto) => <div>{moment(item.wi_end_date).format("MM/YYYY")}</div> },
            {
                title: "Ghi chú", width: 250, ellipsis: this.props.is_Printed == true ? undefined : {
                    showTitle: false
                }, key: "wi_note", render: (text: string, item: WithdrawDto) =>
                    <>{this.props.is_Printed == true ?
                        <div dangerouslySetInnerHTML={{ __html: item.wi_note! }}></div> :
                        <div style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            paddingTop: "14px"
                        }} dangerouslySetInnerHTML={{ __html: item.wi_note! }}></div>
                    }</>
            },
        ];
        if (is_Printed == false) {
            columns.push(action);
        }

        return (
            <Table
                rowSelection={hasAction != undefined ? rowSelection : undefined}
                className='centerTable'
                scroll={this.props.is_Printed ? { x: undefined } : { x: 1000, y: 600 }}
                loading={this.state.isLoadDone}
                rowClassName={(record, index) => (this.state.wi_id_selected === record.wi_id) ? "bg-click" : "bg-white"}
                rowKey={record => record.wi_id}
                size={'small'}
                expandable={
                    this.props.is_Printed
                        ? {}
                        : {
                            expandedRowRender: (record) => (
                                <Tabs defaultActiveKey={tabManager.tab_1}>
                                    <Tabs.TabPane tab={tabManager.tab_1} key={tabManager.tab_1}>
                                        <DetailWithDraw withdraw={record} />
                                    </Tabs.TabPane>
                                </Tabs>
                            ),
                            expandRowByClick: true,
                            expandIconColumnIndex: -1,
                            expandedRowKeys: this.state.expandedRowKey,
                            onExpand: this.handleExpand,
                        }
                }
                bordered={true}
                
                columns={columns}
                dataSource={withdrawListResult.length > 0 ? withdrawListResult : []}
                pagination={this.props.pagination}
                onChange={(a, b, sort: SorterResult<WithdrawDto> | SorterResult<WithdrawDto>[]) => {
                    if (!!this.props.changeColumnSort) {
                        this.props.changeColumnSort(sort);
                    }
                }}
                footer={() => (
                    <Row style={{ marginTop: '8px', fontSize: 14 }} id='TableWithdrawAdmin'>
                        <Col {...cssColResponsiveSpan(24, 24, 8, 8, 8, 8)} style={{ border: '1px solid #e4e1e1', padding: 15, alignContent: "center" }}>
                            <span>
                                Tổng số lần rút tiền:{' '}
                                <strong style={{ color: '#1DA57A' }}>
                                    {withdrawListResult!.length || 0}
                                </strong>
                            </span>
                            <br />
                            <span>
                                Tổng số tiền đã rút:{' '}
                                <strong style={{ color: '#1DA57A' }}>
                                    {AppConsts.formatNumber(withdrawListResult!.reduce((sum, WithdrawDto) => sum + (WithdrawDto.wi_total_money_reality || 0), 0))
                                    } đ
                                </strong>
                            </span>
                        </Col>
                        <Col {...cssColResponsiveSpan(24, 24, 8, 8, 8, 8)} style={{ border: '1px solid #e4e1e1', padding: 10, alignContent: "center" }}>
                            <span>
                                Số lần rút tiền mặt:{' '}
                                <strong style={{ color: '#1DA57A' }}>
                                    {AppConsts.formatNumber(withdrawListResult.filter(WithdrawDto => WithdrawDto.wi_payment_type == eBillMethod.TIEN_MAT.num)
                                        .length! || 0
                                    )}
                                </strong>
                            </span>
                            <br />
                            <span>
                                Số lần rút ngân hàng:{' '}
                                <strong style={{ color: '#1DA57A' }}>
                                    {AppConsts.formatNumber(withdrawListResult.filter(WithdrawDto => WithdrawDto.wi_payment_type == eBillMethod.MA_QR.num)
                                        .length! || 0
                                    )}
                                </strong>
                            </span>
                            <br />
                            <span>
                                Số lần rút RFID:{' '}
                                <strong style={{ color: '#1DA57A' }}>
                                    {AppConsts.formatNumber(withdrawListResult.filter(WithdrawDto => WithdrawDto.wi_payment_type == eBillMethod.RFID.num)
                                        .length! || 0
                                    )}
                                </strong>
                            </span>
                            <br />
                        </Col>
                        <Col {...cssColResponsiveSpan(24, 24, 8, 8, 8, 8)} style={{ border: '1px solid #e4e1e1', padding: 15, alignContent: "center" }}>
                            <span>
                                Tổng số tiền mặt đã rút: {' '}
                                <strong style={{ color: '#1DA57A' }}>
                                    {AppConsts.formatNumber(withdrawListResult.filter(WithdrawDto => (WithdrawDto.wi_payment_type) == eBillMethod.TIEN_MAT.num)
                                        .reduce((sum, WithdrawDto) => sum + (WithdrawDto.wi_total_money_reality || 0), 0))} đ
                                </strong>
                            </span>
                            <br />
                            <span>
                                Tổng số tiền ngân hàng đã rút: {' '}
                                <strong style={{ color: '#1DA57A' }}>
                                    {AppConsts.formatNumber(withdrawListResult.filter(WithdrawDto => (WithdrawDto.wi_payment_type) == eBillMethod.MA_QR.num)
                                        .reduce((sum, WithdrawDto) => sum + (WithdrawDto.wi_total_money_reality || 0), 0))} đ
                                </strong>
                            </span>
                            <br />
                            <span>
                                Tổng số tiền RFID đã rút: {' '}
                                <strong style={{ color: '#1DA57A' }}>
                                    {AppConsts.formatNumber(withdrawListResult.filter(WithdrawDto => (WithdrawDto.wi_payment_type) == eBillMethod.RFID.num)
                                        .reduce((sum, WithdrawDto) => sum + (WithdrawDto.wi_total_money_reality || 0), 0))} đ
                                </strong>
                            </span>
                            <br />
                        </Col>
                    </Row>
                )}
            />
        )
    }
}