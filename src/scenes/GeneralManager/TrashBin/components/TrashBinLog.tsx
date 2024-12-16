import AppConsts from "@src/lib/appconst";
import { eSort } from "@src/lib/enumconst";
import { TrashBinLogsDto } from "@src/services/services_autogen";
import { Table } from "antd";
import { ColumnsType, SorterResult, TablePaginationConfig } from "antd/lib/table/interface";
import moment from "moment";
import React from "react";

interface IProps {
    trashBinLogs: TrashBinLogsDto[];
    pagination?: TablePaginationConfig;
    changeColumnSort?: (fieldSort: SorterResult<TrashBinLogsDto> | SorterResult<TrashBinLogsDto>[]) => void;
}

export default class TrashBinLog extends React.Component<IProps> {
    state = {
        sort: undefined,
        tr_id: undefined,
        isLoadDone: false,
    }
    render() {
        const columns: ColumnsType<TrashBinLogsDto> = [
            { title: "Tổng lượng rác thu gom(kg)", dataIndex: "total_trash_a_day", sorter: true, key: "total_trash_a_day", render: (_, item: TrashBinLogsDto) => <div> {AppConsts.formatNumber(item.total_trash_a_day / 1000)} </div> },
            { title: "Đơn giá quy đổi(VND)", dataIndex: "tien_quy_doi", sorter: true, key: "tien_quy_doi", render: (_, item: TrashBinLogsDto) => <div> {AppConsts.formatNumber(item.tien_quy_doi)} </div> },
            { title: "Tổng số lần cân", dataIndex: "total_count", sorter: true, key: "total_count", render: (_, item: TrashBinLogsDto) => <div> {AppConsts.formatNumber(item.total_count)} </div> },
            { title: "Tổng tiền(VND)",sorter: (a,b)=> (a.total_trash_a_day * a.tien_quy_doi / 1000)-(b.total_trash_a_day * b.tien_quy_doi / 1000), key: "total_money", render: (_, item: TrashBinLogsDto) => <div> {AppConsts.formatNumber(item.total_trash_a_day * item.tien_quy_doi / 1000)} </div> },
            {
                title: 'Ngày quy đổi', dataIndex: 'tr_created_at', key: 'tr_created_at', 
                sorter: true,
                render: (_, item: TrashBinLogsDto) => (
                    <div> {item.tr_created_at} </div>// đây là trường string không dùng moment()
                ),
            },
        ]
        return (
            <Table
                className='centerTable customTable'
                bordered
                size="small"
                dataSource={this.props.trashBinLogs}
                columns={columns}
                pagination={this.props.pagination}
                rowKey={(record, index) => `keyLog_${index}`}
                onChange={(_, __, sort: SorterResult<TrashBinLogsDto> | SorterResult<TrashBinLogsDto>[]) => {
                    if (!!this.props.changeColumnSort) {
                        this.props.changeColumnSort(sort);
                    }
                }}
            />
        )
    }
}