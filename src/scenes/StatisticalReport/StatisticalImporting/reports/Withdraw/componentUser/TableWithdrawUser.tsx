import { EyeFilled } from '@ant-design/icons';
import { L } from '@lib/abpUtility';
import { WithdrawDto, } from '@services/services_autogen';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { valueOfeBillMethod } from '@src/lib/enumconst';
import { stores } from '@src/stores/storeInitializer';
import { Button, Col, Row, Space, Table, Tabs, Tag, Tooltip, } from 'antd';
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { SorterResult, TableRowSelection } from 'antd/lib/table/interface';
import moment from 'moment';
import * as React from 'react';
import { Link } from 'react-router-dom';
import DetailWithDraw from '../componentAdmin/DetailWithdraw';
import HistoryHelper from '@src/lib/historyHelper';

export interface IProps {
    actionTable?: (item: WithdrawDto, event: EventTable, status?: number) => void;
    withdrawListResult: WithdrawDto[],
    pagination: TablePaginationConfig | false;
    hasAction?: boolean;
    doId?: number;
    rowSelection?: TableRowSelection<WithdrawDto>
    isLoadDone?: boolean;
    is_Printed?: boolean
    changeColumnSort?: (fieldSort: SorterResult<WithdrawDto> | SorterResult<WithdrawDto>[]) => void;
    pageSize?: number;
    currentPage?: number;

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
            this.setState({ expandedRowKey: undefined, wi_id_selected: undefined });
        }
    };
    onAction = async (item: WithdrawDto, action: EventTable, status?: number) => {
        this.setState({ wi_id_selected: item.wi_id });
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action, status);
        }
    }

    render() {
        const { withdrawListResult, pagination, hasAction, rowSelection, actionTable, is_Printed } = this.props;
        let action: ColumnGroupType<any> = {
            title: 'Chức năng', children: [], key: 'action_Supplier_index', className: "no-print center", width: 100, fixed: "right",
            render: (text: string, item: WithdrawDto) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EyeFilled />} title="Xem thông tin"
                        style={{ marginLeft: '10px' }}
                        size='small'
                        onClick={() => this.setState({ expandedRowKey: [item.wi_id] })}
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
                                <div>{stores.sessionStore.getNameMachines(item.ma_id)}</div>
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
                        onClick: this.props.is_Printed == false ? (e) => {
                            e.stopPropagation();
                            HistoryHelper.redirect("/reconsile/reconsile_money");
                        }
                            : undefined
                    }
                },
                key: 'wi_payment_type', render: (text: string, item: WithdrawDto) => <div>{valueOfeBillMethod(item.wi_payment_type)}</div>
            },
            { title: L('Tổng tiền rút'), key: 'wi_total_money', dataIndex: "wi_total_money_reality", sorter: true, render: (text: string, item: WithdrawDto) => <div>{AppConsts.formatNumber(item.wi_total_money_reality)}</div> },
            { title: L('Thời gian tạo rút tiền'), dataIndex: 'wi_created_at', key: "wi_created_at", sorter: true, render: (text: string, item: WithdrawDto) => <div>{moment(item.wi_created_at).format("DD/MM/YYYY HH:mm:ss")}</div> },
            { title: L('Tháng đối soát'), dataIndex: 'wi_created_at', key: "wi_created_at", sorter: true, render: (text: string, item: WithdrawDto) => <div>{moment(item.wi_end_date).format("MM/YYYY")}</div> },
            {
                title: "Ghi chú", ellipsis: this.props.is_Printed == true ? undefined : {
                    showTitle: false
                }, key: "wi_note", render: (text: string, item: WithdrawDto) => <div style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    paddingTop: "14px"
                }} dangerouslySetInnerHTML={{ __html: item.wi_note! }}></div>
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
                rowClassName={(record) => (this.state.wi_id_selected === record.wi_id) ? "bg-click" : "bg-white"}
                rowKey={record => record.wi_id}
                size={'small'}
                bordered={true}
                columns={columns}
                dataSource={withdrawListResult.length > 0 ? withdrawListResult : []}
                pagination={this.props.pagination}
                onChange={(_a, _b, sort: SorterResult<WithdrawDto> | SorterResult<WithdrawDto>[]) => {
                    if (!!this.props.changeColumnSort) {
                        this.props.changeColumnSort(sort);
                    }
                }}
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
                            onExpand: this.handleExpand
                        }
                }
                footer={() => (
                    <Row style={{ marginTop: '8px', fontSize: 14 }} id='TableWithdrawAdmin'>
                        <Col span={8} style={{ border: '1px solid #e4e1e1', padding: 15, alignContent: "center" }}>
                            <span>
                                Tổng số lần rút tiền:{' '}
                                <strong style={{ color: '#1DA57A' }}>
                                    {withdrawListResult
                                        .slice((this.props.currentPage! - 1) * this.props.pageSize!,
                                            this.props.currentPage! * this.props.pageSize!)
                                        .length}
                                </strong>
                            </span>
                        </Col>
                        <Col span={8} style={{ border: '1px solid #e4e1e1', padding: 15, alignContent: "center" }}>
                            <span>
                                Tổng số tiền mặt đã rút: {' '}
                                <strong style={{ color: '#1DA57A' }}>
                                    {AppConsts.formatNumber(withdrawListResult.slice(
                                        (this.props.currentPage! - 1) * this.props.pageSize!,
                                        this.props.currentPage! * this.props.pageSize!)
                                        .filter(WithdrawDto => valueOfeBillMethod(WithdrawDto.wi_payment_type) == "Tiền mặt")
                                        .reduce((sum, WithdrawDto) => sum + (WithdrawDto.wi_total_money_reality || 0), 0))} đ
                                </strong>
                            </span>
                            <br />
                            <span>
                                Tổng số tiền ngân hàng đã rút: {' '}
                                <strong style={{ color: '#1DA57A' }}>
                                    {AppConsts.formatNumber(withdrawListResult.slice(
                                        (this.props.currentPage! - 1) * this.props.pageSize!,
                                        this.props.currentPage! * this.props.pageSize!)
                                        .filter(WithdrawDto => valueOfeBillMethod(WithdrawDto.wi_payment_type) == "Ngân hàng")
                                        .reduce((sum, WithdrawDto) => sum + (WithdrawDto.wi_total_money_reality || 0), 0))} đ
                                </strong>
                            </span>
                            <br />
                            <span>
                                Tổng số tiền RFID đã rút: {' '}
                                <strong style={{ color: '#1DA57A' }}>
                                    {AppConsts.formatNumber(withdrawListResult.slice(
                                        (this.props.currentPage! - 1) * this.props.pageSize!,
                                        this.props.currentPage! * this.props.pageSize!)
                                        .filter(WithdrawDto => valueOfeBillMethod(WithdrawDto.wi_payment_type) == "RFID")
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