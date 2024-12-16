
import * as React from 'react';
import { Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { ProductDailyMonitoringDto } from '@src/services/services_autogen';
import AppConsts from '@src/lib/appconst';
export interface Iprops {
    productList: ProductDailyMonitoringDto[];
    is_printed?: boolean;
}
export default class DetailProductOfMachine extends React.Component<Iprops> {
    state = {
        isLoadDone: false,
        skipCount: 0,
        maxResultCount: 10,
        pageSize: 10,
        currentPage: 1,
    }

    render() {
        const { productList, is_printed } = this.props;

        const columns: ColumnsType<ProductDailyMonitoringDto> = [
            {
                title: "STT", key: "stt_machine_index", width: 50, fixed: 'left',
                render: (text: string, item: ProductDailyMonitoringDto, index: number) => <div>{index + 1}</div>,
            },
            {
                title: "Tên sản phẩm", key: "stt_machine_index",
                render: (text: string, item: ProductDailyMonitoringDto, index: number) => <div>{item.pr_name}</div>
            },
            {
                title: "Slot đồ", key: "stt_machine_index",
                render: (text: string, item: ProductDailyMonitoringDto, index: number) => <div>{item.pr_slot_id + 1}</div>
            },
            {
                title: "Giá sản phẩm", key: "stt_machine_index",
                render: (text: string, item: ProductDailyMonitoringDto, index: number) => <div>{AppConsts.formatNumber(item.pr_price)}</div>
            },
            {
                title: "Số lượng/Dung tích trong máy",
                render: (text: string, item: ProductDailyMonitoringDto, index: number) => <div>{AppConsts.formatNumber(item.pr_quantity)}</div>
            },
            {
                title: "Số lượng/Dung tích cần nạp",
                render: (text: string, item: ProductDailyMonitoringDto, index: number) => <div>{AppConsts.formatNumber(6 - item.pr_quantity)}</div>
            },
        ];
        return (
            <Table
                className='centerTable'
                rowKey={record => "product_index__" + JSON.stringify(record)}
                size={'small'}
                bordered={true}
                locale={{ "emptyText": 'Không có dữ liệu' }}
                columns={columns}
                dataSource={productList != undefined ? productList : []}
                pagination={is_printed == true ? false : {
                    total: productList.length,
                    showTotal: (tot) => ("Tổng: ") + tot + "",
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                }} />
        )
    }
}
