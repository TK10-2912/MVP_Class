import { ReportOfMachineDto } from '@src/services/services_autogen';
import { TablePaginationConfig, ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import { Table, Tag } from 'antd';
import { stores } from '@src/stores/storeInitializer';
import { eReportLevel, eReportStatus, valueOfeReportLevel, valueOfeReportStatus } from '@src/lib/enumconst';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { EventTable } from '@src/lib/appconst';
import { Link } from 'react-router-dom';

export interface IProps {
    pagination: TablePaginationConfig | false;
    listReportOfMachine: ReportOfMachineDto[];
    hasAction: boolean;
    isLoadDone: boolean;
    is_printed: boolean;
    actionTable?: (item: ReportOfMachineDto, event: EventTable) => void;
}

export default class TableHistoryReport extends React.Component<IProps> {
    state = {
        isLoadDone: true,
        bi_id_selected: undefined,
    }
    onAction = (item: ReportOfMachineDto, action: EventTable) => {
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action);
        }
    }
    render() {
        const { pagination, listReportOfMachine, hasAction, is_printed } = this.props
        const columns: ColumnsType<ReportOfMachineDto> = [
            { title: "STT", key: "stt_drink_index", width: 50, render: (text: string, item: ReportOfMachineDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : (index + 1)}</div> },
            {
                title: "Mã báo cáo", key: "report_code", width: 110, render: (text: string, item: ReportOfMachineDto) => <div style={{ width: "90px" }}>{is_printed == false ?
                    <Link target='_blank' to={"/general/reportmachine/?re_code=" + (item.re_code)} onDoubleClick={() => this.onAction(item, EventTable.View)}>
                        {(item.re_code)}
                    </Link>
                    :
                    (item.re_code)
                }
                </div>
            },
            {
                title: "Nhóm máy", key: "bi_money_bill_index", render: (text: string, item: ReportOfMachineDto) => <div>{is_printed == false ?
                    <Link target='_blank' to={"/general/machine/?gr_id=" + (item.machine.gr_ma_id)} onDoubleClick={() => this.onAction(item, EventTable.View)} >
                        {stores.sessionStore.getNameGroupMachines(item.machine.gr_ma_id)}
                    </Link>
                    :
                    <>
                        {stores.sessionStore.getNameGroupMachines(item.machine.gr_ma_id)}
                    </>
                }
                </div>
            },
            {
                title: "Mã máy", key: "bi_id_bill_index", width: 110, render: (text: string, item: ReportOfMachineDto) => <div style={{ width: "90px" }}>{is_printed == false ?
                    <Link to={"/general/machine/?machine=" + stores.sessionStore.getCodeMachines(item.ma_id)} onDoubleClick={() => this.onAction(item, EventTable.View)}>
                        {stores.sessionStore.getCodeMachines(item.ma_id)}
                    </Link>
                    : <>
                        {stores.sessionStore.getCodeMachines(item.ma_id)}
                    </>
                }

                </div>
            },
            {
                title: "Tên máy", key: "ma_id_bill_index", render: (text: string, item: ReportOfMachineDto) => <div>
                    <Link to={"/general/machine/?machine=" + stores.sessionStore.getCodeMachines(item.ma_id)} onDoubleClick={() => this.onAction(item, EventTable.View)}>
                        {stores.sessionStore.getNameMachines(item.ma_id)}
                    </Link>
                </div>
            },

            { title: "Vị trí khay", key: "bi_money_bill_index", render: (text: string, item: ReportOfMachineDto) => <div> {item.machineDetail?.ma_de_slot_id}</div> },
            { title: "Tên lỗi", key: "bi_money_bill_index", render: (text: string, item: ReportOfMachineDto) => <div> {item.re_display}</div> },
            {
                title: "Trạng thái", width: 120, key: "re_status_index", render: (text: number, item: ReportOfMachineDto) => {
                    if (is_printed == false) {
                        return <div>
                            {item.re_status == eReportStatus.DANG_XU_LY.num ? <Tag icon={<SyncOutlined spin />} color="blue" >Đang xử lý</Tag> : ""}
                            {item.re_status == eReportStatus.DA_HOAN_THANH.num ? <Tag icon={<CheckCircleOutlined />} color="green">Hoàn thành</Tag> : ""}
                            {item.re_status == eReportStatus.KHOI_TAO.num ? <Tag color="yellow">Khởi tạo</Tag> : ""}
                        </div>
                    } else {
                        return <div>
                            {valueOfeReportStatus(item.re_status)}
                        </div>
                    }
                }
            },
            {
                title: "Mức nghiêm trọng", width: 100, key: "re_status_index", render: (text: number, item: ReportOfMachineDto) => {
                    if (is_printed == false) {
                        return <div>
                            {item.re_level == eReportLevel.CANH_BAO.num ? <Tag icon={<ExclamationCircleOutlined />} color="warning" >Cảnh báo</Tag> : <Tag icon={<CloseCircleOutlined />} color="error">Có lỗi</Tag>}
                        </div>
                    } else {
                        return <div>
                            {valueOfeReportLevel(item.re_level)}
                        </div>
                    }
                }
            },
            { title: "Người cảnh báo", key: "bi_money_bill_index", render: (text: string, item: ReportOfMachineDto) => <div> {stores.sessionStore.getUserNameById(item.us_id_report)}</div> },
            { title: "Mô tả", key: "bi_money_bill_index", width: 100, render: (text: string, item: ReportOfMachineDto) => <div style={{ marginTop: "14px",width:80 }} dangerouslySetInnerHTML={{ __html: item.re_note! }}></div> },
            { title: "Thời gian cảnh báo", key: "di_id_bill_index", render: (text: string, item: ReportOfMachineDto) => <div> {moment(item.re_created_at).format("DD/MM/YYYY - HH:mm:ss")}</div> },
            { title: "Tiến trình thời gian", key: "bi_created_at_bill_index", render: (text: string, item: ReportOfMachineDto) => <div> {moment(item.re_updated_at).format("DD/MM/YYYY - HH:mm:ss")} </div> },
        ]

        return (
            <>
                <Table
                    className='centerTable'
                    scroll={this.props.is_printed ? { x: undefined, y: undefined } : { x: 1500, y: 600 }}
                    columns={columns}
                    size={'middle'}
                    bordered={true}
                    locale={{ "emptyText": "Không có dữ liệu" }}
                    dataSource={listReportOfMachine.length > 0 ? listReportOfMachine : []}
                    pagination={this.props.pagination}
                    rowKey={record => "billing_table" + JSON.stringify(record)}
                />
            </>
        )
    }

}