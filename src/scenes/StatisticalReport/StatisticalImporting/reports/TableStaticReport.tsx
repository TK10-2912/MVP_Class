import AppConsts from '@src/lib/appconst';
import { StatisticBillingOfProductDto } from '@src/services/services_autogen';
import { TablePaginationConfig, ColumnsType } from 'antd/lib/table';
import * as React from 'react';
import { Table } from 'antd';
import { SorterResult } from 'antd/lib/table/interface';

export interface IProps {
    pagination: TablePaginationConfig | false;
    isLoadDone?: boolean;
    isPrint?: boolean;
    type?: string;
    listBillingOfDrinkProduct: StatisticBillingOfProductDto[];
    changeColumnSort?: (fieldSort: SorterResult<StatisticBillingOfProductDto> | SorterResult<StatisticBillingOfProductDto>[]) => void;

}

export default class TableStaticReport extends React.Component<IProps> {
    render() {
        const { pagination, listBillingOfDrinkProduct } = this.props
        const columns: ColumnsType<StatisticBillingOfProductDto> = [
            { title: "STT", key: "stt", width: 50, render: (text: string, item: StatisticBillingOfProductDto, index: number) => <div>{pagination !== false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
            {
                title: "Tên sản phẩm", key: "productname", width: 180, render: (text: string, item: StatisticBillingOfProductDto) => <div>{item.productname}</div>
            },
            {
                title: "Loại hình thanh toán", key: "loai_hinh_thanh_toan", children: [
                    { title: "Tiền mặt", width: 110, sorter: (a, b) => a.cash - b.cash, key: "cash", render: (text: string, item: StatisticBillingOfProductDto) => <div>{AppConsts.formatNumber(item.cash)}</div> },
                    { title: "Số lượng " + this.props.type, width: 110, sorter: (a, b) => a.cash_quantity - b.cash_quantity, key: "cash_count", render: (text: string, item: StatisticBillingOfProductDto) => <div>{AppConsts.formatNumber(item.cash_quantity)}</div> },
                    { title: "Mã QR", key: "moneyQr", width: 110, sorter: (a, b) => a.moneyQr - b.moneyQr, render: (text: string, item: StatisticBillingOfProductDto) => <div>{AppConsts.formatNumber(item.moneyQr)}</div> },
                    { title: "Số lượng " + this.props.type, width: 110, key: "qr_count", sorter: (a, b) => a.qr_quantity - b.qr_quantity, render: (text: string, item: StatisticBillingOfProductDto) => <div>{AppConsts.formatNumber(item.qr_quantity)}</div> },
                    { title: "RFID", width: 110, key: "moneyRFID", sorter: (a, b) => a.moneyRFID - b.moneyRFID, render: (text: string, item: StatisticBillingOfProductDto) => <div>{AppConsts.formatNumber(item.moneyRFID)}</div> },
                    { title: "Số lượng " + this.props.type, key: "rfid_count", width: 110, sorter: (a, b) => a.rfid_quantity - b.rfid_quantity, render: (text: string, item: StatisticBillingOfProductDto) => <div>{AppConsts.formatNumber(item.rfid_quantity)}</div> },
                ]
            },
            { title: "Tổng số lượng sản phẩm " + this.props.type, key: "totalQuantity", width: 140, sorter: (a, b) => a.totalQuantity - b.totalQuantity, render: (text: string, item: StatisticBillingOfProductDto) => <div>{AppConsts.formatNumber(item.totalQuantity)}</div> },
            { title: "Tổng cộng (VNĐ)", key: "total", sorter: (a, b) => a.totalMoney - b.totalMoney, width: 140, render: (text: string, item: StatisticBillingOfProductDto) => <div>{AppConsts.formatNumber(item.totalMoney)}</div> },
        ]
        return (
            <>
                <Table
                    className='centerTable'
                    scroll={this.props.isPrint ? { x: undefined, y: undefined } : { x: 1000, y: 500 }}
                    columns={columns}
                    size={'small'}
                    bordered={true}
                    locale={{ "emptyText": "Không có dữ liệu" }}
                    dataSource={listBillingOfDrinkProduct.length > 0 ? listBillingOfDrinkProduct : []}
                    pagination={this.props.pagination}
                    rowKey={record => "billing_table" + JSON.stringify(record)}
                    onChange={(a, b, sort: SorterResult<StatisticBillingOfProductDto> | SorterResult<StatisticBillingOfProductDto>[]) => {
                        if (!!this.props.changeColumnSort) {
                            this.props.changeColumnSort(sort);
                        }
                    }}
                />
            </>
        )
    }

}