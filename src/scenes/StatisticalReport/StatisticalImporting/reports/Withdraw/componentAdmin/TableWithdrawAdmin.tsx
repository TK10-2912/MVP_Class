import * as React from 'react';
import { Button, Table, Tag, } from 'antd';
import { CheckCircleOutlined, DeleteFilled, DollarOutlined, EditOutlined, EyeOutlined, RollbackOutlined } from '@ant-design/icons';
import { WithdrawDto, } from '@services/services_autogen';
import { L } from '@lib/abpUtility';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { SorterResult, TableRowSelection } from 'antd/lib/table/interface';
import { stores } from '@src/stores/storeInitializer';
import moment from 'moment';
import { eWithdrawStatus, valueOfePaymentMethod, valueOfeWithdrawStatus } from '@src/lib/enumconst';
import { Link } from 'react-router-dom';

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

}
export default class TableWithdrawAdmin extends React.Component<IProps> {
    state = {
        isLoadDone: false,
        wi_id_selected: undefined,
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
        const columns: ColumnsType<WithdrawDto> = [
            { title: L('STT'), key: 'stt', width: 50, render: (text: string, item: WithdrawDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
            {
                title: L('Nhóm máy'), key: 'wi_total_money_reality', render: (text: string, item: WithdrawDto) => <div>
                    {
                        <Link to={"/general/machine/?gr_id=" + stores.sessionStore.getIdGroupMachinesStatistic(stores.sessionStore.getNameGroupUseMaId(item.ma_id))} onDoubleClick={() => this.onAction(item, EventTable.View)} >
                            {stores.sessionStore.getNameGroupUseMaId(item.ma_id)}
                        </Link>
                    }
                </div>
            },
            {
                title: L('Mã máy'), key: 'wi_total_money_reality', render: (text: string, item: WithdrawDto) => <div>
                    {
                        <Link to={"/general/machine/?machine=" + stores.sessionStore.getMachineCode(item.ma_id)} onDoubleClick={() => this.onAction(item, EventTable.View)}>
                            {stores.sessionStore.getCodeMachines(item.ma_id)}
                        </Link>
                    }
                </div>
            },
            {
                title: L('Tên máy '), key: 'wi_total_money_reality', render: (text: string, item: WithdrawDto) => <div>
                    {
                        <Link to={"/general/machine/?machine=" + stores.sessionStore.getMachineCode(item.ma_id)} onDoubleClick={() => this.onAction(item, EventTable.View)}>
                            {stores.sessionStore.getNameMachines(item.ma_id)}
                        </Link>
                    }
                </div>
            },
            { title: L('Tổng tiền rút'), key: 'wi_total_money', render: (text: string, item: WithdrawDto) => <div>{AppConsts.formatNumber(item.wi_total_money_reality)}</div> },
            { title: L('Hình thức rút'), key: 'wi_payment_type', render: (text: string, item: WithdrawDto) => <div>{valueOfePaymentMethod(item.wi_payment_type)}</div> },
            { title: L('Thời gian tạo rút tiền'), key: 'wi_created_at', render: (text: string, item: WithdrawDto) => <div>{moment(item.wi_start_date).format("DD/MM/YYYY HH:mm:ss") + " - " + moment(item.wi_end_date).format("DD/MM/YYYY HH:mm:ss")}</div> },
            { title: L('Thời gian rút tiền'), dataIndex: "wi_created_at", key: 'wi_created_at', sorter: true, render: (text: string, item: WithdrawDto) => <div>{moment(item.wi_created_at).format("DD/MM/YYYY HH:mm:ss")}</div> },
            { title: "Ghi chú", key: "wi_note", render: (text: string, item: WithdrawDto) => <div style={{ paddingTop: "14px" }} dangerouslySetInnerHTML={{ __html: item.wi_note! }}></div> },
        ];
        return (
            <Table
                rowSelection={hasAction != undefined ? rowSelection : undefined}
                className='centerTable'
                scroll={this.props.is_Printed ? { x: undefined } : { x: 1100 }}
                loading={this.state.isLoadDone}
                rowClassName={(record, index) => (this.state.wi_id_selected === record.wi_id) ? "bg-click" : "bg-white"}
                rowKey={record => "supplier__" + JSON.stringify(record)}
                size={'small'}
                bordered={true}
                locale={{ "emptyText": L('No Data') }}
                columns={columns}
                dataSource={withdrawListResult.length > 0 ? withdrawListResult : []}
                pagination={this.props.pagination}
                onChange={(a, b, sort: SorterResult<WithdrawDto> | SorterResult<WithdrawDto>[]) => {
                    if (!!this.props.changeColumnSort) {
                        this.props.changeColumnSort(sort);
                    }
                }}
            />
        )
    }
}