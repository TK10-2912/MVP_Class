import { EyeOutlined } from "@ant-design/icons";
import FileAttachments from "@src/components/FileAttachments";
import FileAttachmentsLog from "@src/components/FileAttachmentsLog";
import { EventTable, FileUploadType } from "@src/lib/appconst";
import { eBillReconcileStatus, valueOfeBillReconcileStatus, } from "@src/lib/enumconst";
import { AttachmentItem, ReconcileLogsDto } from "@src/services/services_autogen";
import { Button, Table, Tag } from "antd";
import { ColumnsType, TablePaginationConfig } from "antd/lib/table";
import moment from "moment";
import React from "react";
export interface IProps {
    pagination: TablePaginationConfig | false;
    reconcileLogsList: ReconcileLogsDto[];
    is_printed?: boolean;
    actionTable?: (item: ReconcileLogsDto, event: EventTable) => void;
    hasAction?: boolean;
    bi_code: string;

}
export default class TableReconcilelLogs extends React.Component<IProps> {
    state = {
        isLoadDone: false,
        visibleModal: false,
    }
    reconcileLog: ReconcileLogsDto = new ReconcileLogsDto();

    actionTable = (item: ReconcileLogsDto, action: EventTable) => {
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action);
        }
    }
    render() {
        const { reconcileLogsList, is_printed, hasAction, pagination } = this.props;
        const columns: ColumnsType<ReconcileLogsDto> = [
            { title: "STT", key: "stt_transaction_index", width: 50, render: (text: string, item: ReconcileLogsDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
            { title: "Mã hóa đơn", key: "money", render: (text: string, item: ReconcileLogsDto) => <div> {item.rec_lo_code}</div> },
            {
                title: "Trạng thái đối soát", key: "date_time", render: (text: string, item: ReconcileLogsDto) => <div>
                    <>
                        {
                            eBillReconcileStatus.DONE.num == item.rec_lo_reconcile_status && <Tag color='green'>{valueOfeBillReconcileStatus(item.rec_lo_reconcile_status)}</Tag>
                        }
                        {
                            eBillReconcileStatus.DOING.num == item.rec_lo_reconcile_status && <Tag color='blue'>{valueOfeBillReconcileStatus(item.rec_lo_reconcile_status)}</Tag>
                        }
                        {
                            eBillReconcileStatus.ERROR.num == item.rec_lo_reconcile_status && <Tag color='orange'>{valueOfeBillReconcileStatus(item.rec_lo_reconcile_status)}</Tag>
                        }
                        {
                            eBillReconcileStatus.NONE.num == item.rec_lo_reconcile_status && <Tag color='red'>{valueOfeBillReconcileStatus(item.rec_lo_reconcile_status)}</Tag>
                        }
                    </>
                </div>
            },

            {
                title: "Tệp đính kèm", key: "file", render: (text: string, item: ReconcileLogsDto) => 
                <div className="file_acttach_ment">
                    {
                        item.fi_id_list!.length > 0 ?
                            <>
                                <FileAttachmentsLog
                                    files={item.fi_id_list}
                                    isLoadFile={this.state.isLoadDone}
                                    allowRemove={true}
                                    isMultiple={true}
                                    componentUpload={FileUploadType.Avatar}
                                    onSubmitUpdate={async (itemFile: AttachmentItem[]) => {
                                        item.fi_id_list = itemFile;
                                    }}
                                    isUpLoad={false}
                                />
                            </>
                            :
                            "Không có file dữ liệu"
                    }
                </div>
            },
            { title: "Lý do", key: "Ngày đối soát", render: (text: string, item: ReconcileLogsDto) => <div dangerouslySetInnerHTML={{ __html: item.rec_lo_reconcile_reason! }}></div> },
            { title: "Ngày cập nhật đối soát", key: "ma_id_bill_index", render: (text: string, item: ReconcileLogsDto) => <div> {moment(item.rec_lo_created_at).format("DD/MM/YYYY HH:mm:ss")} </div> },
        ]
        return (
            <>
                <Table
                    className="centerTable"
                    scroll={this.props.is_printed ? { x: undefined, y: undefined } : { x: 1200, y: 600 }}
                    rowKey={record => "supplier__" + JSON.stringify(record)}
                    size={'middle'}
                    bordered={true}
                    locale={{ "emptyText": "Không có dữ liệu" }}
                    pagination={this.props.hasAction != false ? this.props.pagination : false}
                    columns={columns}
                    dataSource={reconcileLogsList}
                >
                </Table>
            </>
        )
    }
}