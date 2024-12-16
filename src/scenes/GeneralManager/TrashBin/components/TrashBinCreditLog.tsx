import AppConsts from "@src/lib/appconst";
import { eSort } from "@src/lib/enumconst";
import { TrashBinLogsDto } from "@src/services/services_autogen";
import { Table } from "antd";
import { ColumnsType, SorterResult, TablePaginationConfig } from "antd/lib/table/interface";
import moment from "moment";
import React from "react";

interface IProps {
    trashBinCreditLog: TrashBinLogsDto[];
    pagination?: TablePaginationConfig;
    changeColumnSort?: (fieldSort: SorterResult<TrashBinLogsDto> | SorterResult<TrashBinLogsDto>[]) => void;
}

export default class TrashBinCreditLog extends React.Component<IProps> {
    state = {
        sort: undefined,
        isLoadDone: false,
        tr_id: undefined,
    }
    render() {
        const columns: ColumnsType<TrashBinLogsDto> = [
            { title: "Tổng lượng nhựa thu gom(kg)", sorter: true, key: "total_trash_a_day", render: (_, item: TrashBinLogsDto) => <div> {AppConsts.formatNumber(item.total_trash_a_day / 1000)} </div> },
            { title: "Số tín chỉ nhựa", sorter: true, key: "total_trash_a_day", render: (_, item: TrashBinLogsDto) => <div> {AppConsts.formatNumber(AppConsts.calculatorPlasticCredit(item.total_trash_a_day))} </div> },
            { title: "Số tín chỉ carbon", sorter: true, key: "total_trash_a_day", render: (_, item: TrashBinLogsDto) => <div> {AppConsts.formatNumber(AppConsts.calculatorCarbonCredit(item.total_trash_a_day))} </div> },
            { title: "Tổng Co2 phát thải(tấn)", sorter: true, key: "total_trash_a_day", render: (_, item: TrashBinLogsDto) => <div> {AppConsts.formatNumber(AppConsts.calculatorCarbonCredit(item.total_trash_a_day))} </div> },
            {
                title: 'Ngày quy đổi',
                dataIndex: 'tr_created_at',
                key: 'tr_created_at',
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
                dataSource={this.props.trashBinCreditLog}
                columns={columns}
                pagination={this.props.pagination}
                rowKey={(_record, index) => `keyLog_${index}`}
                onChange={(_a, _b, sort: SorterResult<TrashBinLogsDto> | SorterResult<TrashBinLogsDto>[]) => {
                    if (!!this.props.changeColumnSort) {
                        this.props.changeColumnSort(sort);
                    }
                }}
            />
        )
    }
}