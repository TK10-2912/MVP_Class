import * as React from 'react';
import { Button, message, Table } from 'antd';
import { EditOutlined, EyeOutlined, } from '@ant-design/icons';
import { AttachmentItem, MachineLocationLogDto, MachineSoftLogs } from '@services/services_autogen';
import { isGranted, L } from '@lib/abpUtility';
import { TablePaginationConfig } from 'antd/lib/table';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import moment from 'moment';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { ColumnsType, SorterResult } from 'antd/lib/table/interface';
import { eMachineSoftLogsStatus } from '@src/lib/enumconst';
import { stores } from '@src/stores/storeInitializer';

export interface IProps {
    actionTable?: (item: MachineLocationLogDto, event: EventTable) => void;
    createOrUpdateModalOpen?: (item: MachineLocationLogDto) => void;
    listResult?: MachineLocationLogDto[],
    pagination: TablePaginationConfig | false;
    hasAction?: boolean;
    onCreateUpdateSuccess?: () => void;
    NoScroll?: boolean;
    changeColumnSort?: (fieldSort: SorterResult<MachineLocationLogDto> | SorterResult<MachineLocationLogDto>[]) => void;
}
export default class TableLocationLogMachine extends AppComponentBase<IProps> {
    state = {
        isLoadDone: true,
        visibleModalCreateUpdate: false,
        visibleFile: false,
        itemAttachment: new AttachmentItem(),
        urlFileView: "",
        extFileView: "",
        visibleModalMachineSoftLog: false,
        visibleModalMachineSoftLogNotUpdate: false,
        idSelected: -1,

    };
    itemSelected: MachineSoftLogs[] = [];
    actionTable = (item: MachineLocationLogDto, event: EventTable) => {
        if (!!this.props.actionTable) {
            this.props.actionTable(item,event);
        }
    }


    render() {
        const { listResult, pagination, hasAction } = this.props;

        let action = {
            title: "Chức năng",
            dataIndex: "",
            key: "action_fileDocument_index",
            className: "no-print center",
            render: (text: string, item: MachineLocationLogDto) => {
                return (
                    <div>
                        {isGranted(AppConsts.Permission.Pages_Manager_General_MachineLocationLogs_ViewDetail) &&
                            <Button
                                type="primary"
                                icon={<EyeOutlined />}
                                title={("Xem")}
                                style={{ marginLeft: '10px' }}
                                size="small"
                                onClick={() => { this.actionTable(item!, EventTable.View) }}
                            ></Button>
                        }
                    </div>
                );
            }
        };

        const columns: ColumnsType<MachineLocationLogDto> = [
            { title: L('STT'), key: 'no_fileDocument_index', render: (text: string, item: MachineLocationLogDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
            { title: L('Máy bán nước'), key: 'ma_id', render: (text: string, item: MachineLocationLogDto) => <div>{stores.sessionStore.getNameMachines(item.ma_id)}</div> },
            { title: L('Địa điểm đặt máy'), key: 'ma_lo_log_mapName', render: (text: string, item: MachineLocationLogDto) => <div>{item.ma_lo_log_mapName}</div> },
            { title: L('Từ ngày'), key: 'ma_lo_log_from', dataIndex: "ma_lo_log_from", sorter: true, render: (text: string, item: MachineLocationLogDto) => <div>{moment(item.ma_lo_log_from).format("DD/MM/YYYY HH:mm:ss")}</div> },
            { title: L('Tới ngày'), key: 'ma_lo_log_to', dataIndex: "ma_lo_log_to", sorter: true, render: (text: string, item: MachineLocationLogDto) => <div>{item.ma_lo_log_to === null ? "nay" : moment(item.ma_lo_log_to).format("DD/MM/YYYY HH:mm:ss")}</div> },

        ];
        if (hasAction !== undefined && hasAction === true && isGranted(AppConsts.Permission.Pages_Manager_General_MachineLocationLogs_ViewDetail)) {
            columns.push(action);
        }
        return (
            <>
                <Table
                    // scroll={this.props.NoScroll == false ? { x: 1500, y: 1000 } : { x: undefined, y: undefined }}
                    scroll={{ x: 1500, y: 1000 }}
                    className='centerTable'
                    loading={!this.state.isLoadDone}
                    rowClassName={(record, index) => (this.state.idSelected == record.ma_lo_log_id) ? "bg-click" : "bg-white"}
                    rowKey={record => "quanlyhocvien_index__" + JSON.stringify(record)}
                    size={'middle'}
                    bordered={true}
                    
                    columns={columns}
                    dataSource={listResult != undefined ? listResult : []}
                    pagination={this.props.pagination}
                    onChange={(a, b, sort: SorterResult<MachineLocationLogDto> | SorterResult<MachineLocationLogDto>[]) => {
                        if (!!this.props.changeColumnSort) {
                            this.props.changeColumnSort(sort);
                        }
                    }}
                />

            </>
        )
    }
}