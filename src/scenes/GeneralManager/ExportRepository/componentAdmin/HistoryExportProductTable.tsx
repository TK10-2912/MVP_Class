import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts from '@src/lib/appconst';
import { RepositoryDto, ExportRepositoryDto } from '@src/services/services_autogen';
import { Table, Tag } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import { stores } from '@src/stores/storeInitializer';
import { SorterResult } from 'antd/lib/table/interface';

export interface IProps {
    us_id_operator: number;
    ma_id: number;
    changeColumnSortExportRepository?: (fieldSort: SorterResult<ExportRepositoryDto> | SorterResult<ExportRepositoryDto>[]) => void;
}
export default class HistoryExportProductTable extends AppComponentBase<IProps> {
    state = {
        isLoadDone: true,
        pr_id_selected: undefined,
        listIdProduct: 0,
    }
    listProduct: ExportRepositoryDto[] = [];
    componentDidMount() {
        this.initData();
    }
    initData = () => {
        const { exportRepositoryListResult } = stores.exportRepositoryStore;
        this.setState({ isLoadDone: false });
        this.listProduct = exportRepositoryListResult.filter(item => item.us_id_operator == this.props.ma_id && item.ma_id == this.props.ma_id);
        this.setState({ isLoadDone: true });
    }
    render() {
        const { } = this.props
        const columns: ColumnsType<ExportRepositoryDto> = [
            { title: "STT", key: "stt_fresh_drink_index", width: 50, render: (text: string, item: ExportRepositoryDto, index: number) => <div>{index + 1}</div> },
            { title: "Mã xuất", key: "im_re_code", render: (text: string, item: ExportRepositoryDto) => <div> {item.ex_re_code} </div> },
            { title: "Nhóm máy", key: "im_re_code", render: (text: string, item: ExportRepositoryDto) => <div> {stores.sessionStore.getNameGroupUseMaId(item.ma_id)} </div> },
            { title: "Mã máy", key: "im_re_code", render: (text: string, item: ExportRepositoryDto) => <div> {stores.sessionStore.getMachineCode(item.ma_id)} </div> },
            { title: "Tên máy", key: "im_re_code", render: (text: string, item: ExportRepositoryDto) => <div> {stores.sessionStore.getNameMachines(item.ma_id)} </div> },
            { title: "Tổng mặt hàng", sorter: (a, b) => a.listProductExport!.length - b.listProductExport!.length, key: "im_re_code", render: (text: string, item: ExportRepositoryDto) => <div> {AppConsts.formatNumber(item.listProductExport?.length)} </div> },
            { title: "Tổng số lượng", sorter: (a, b) => a.ex_re_quantity - b.ex_re_quantity, key: "im_re_code", render: (text: string, item: ExportRepositoryDto) => <div> {AppConsts.formatNumber(item.ex_re_quantity)} </div> },
            { title: "Trạng thái", width: 200,key: "im_re_code", render: (text: string, item: ExportRepositoryDto) => <div> chưa có api</div> },
            { title: "Thời gian tạo", key: "ex_re_created_at", render: (text: string, item: ExportRepositoryDto) => <div>{moment(item.ex_re_created_at).format("DD/MM/YYYY HH:mm")}</div> },
            { title: "Thời gian nhập", key: "im_re_imported_at", render: (text: string, item: ExportRepositoryDto) => <div>{moment(item.ex_re_export_at).format("DD/MM/YYYY HH:mm")}</div> },

        ];
        return (
            <Table
                className='centerTable customTable'
                scroll={{ x: 1200, y: 600 }}
                columns={columns}
                onChange={(a, b, sort: SorterResult<ExportRepositoryDto> | SorterResult<ExportRepositoryDto>[]) => {
                    if (!!this.props.changeColumnSortExportRepository) {
                        this.props.changeColumnSortExportRepository(sort);
                    }
                }}
                size={'small'}
                bordered={true}
                
                dataSource={this.listProduct}
                rowKey={record => record.ex_re_id}

            />

        )
    }
}