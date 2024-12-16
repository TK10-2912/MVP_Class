import * as React from 'react';
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { Table } from "antd";
import { stores } from '@src/stores/storeInitializer';
import AppConsts from '@src/lib/appconst';
import { StatisticBillingOfProductWithMachineDto } from '@src/services/services_autogen';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { eFormatPicker } from '@src/components/Manager/StatisticSearch';
import moment from 'moment';
import { SearchInputUser } from '@src/stores/statisticStore';

export interface Iprops {
    inputSearch: SearchInputUser;
    typeDate: string | undefined;
    productType?: string | undefined;
    pagination: TablePaginationConfig | false;
    listBillingOfProductWithMachine: StatisticBillingOfProductWithMachineDto[];
}
export default class BaoCaoSanPhamTheoMay extends AppComponentBase<Iprops> {
    componentRef: any | null = null;

    state = {
        isLoadDone: true,
        skipCount: 0,
        currentPage: 1,
        pageSize: 10,
        isHeaderReport: false,
    };
    setComponentRef = (ref) => {
        this.setState({ isLoadDone: false });
        this.componentRef = ref;
        this.setState({ isLoadDone: true });
    }
    render() {
        const self = this;
        const { pagination, listBillingOfProductWithMachine } = this.props;
        const { typeDate, inputSearch } = this.props;
        const columns: ColumnsType<StatisticBillingOfProductWithMachineDto> = [
            { title: "STT", width: 50, fixed: "left", render: (_: string, __: StatisticBillingOfProductWithMachineDto, index: number) => <div>{index + 1}</div> },
            { title: "Nhóm máy", key: "groupMachineId", render: (_: string, item: StatisticBillingOfProductWithMachineDto) => <div>{item.groupMachineName ?? "Chưa có nhóm máy"}</div> },
            { title: "Mã máy", key: "machineCode", render: (_: string, item: StatisticBillingOfProductWithMachineDto) => <div>{item.machineCode}</div> },
            {
                title: "Tên máy",
                ellipsis: {
                    showTitle: false,
                }, key: "machineName", render: (_: string, item: StatisticBillingOfProductWithMachineDto) => <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', }}>{item.machineName}</div>
            },
            { title: "Người sở hữu", key: "machineName", render: (_: string, item: StatisticBillingOfProductWithMachineDto) => <div>{stores.sessionStore.getUserNameById(item.us_id_owner)}</div> },
            { title: "Tên sản phẩm", key: "productName", render: (_: string, item: StatisticBillingOfProductWithMachineDto) => <div>{item.productname}</div> },
            {
                title: "Loại hình thanh toán", width: "40%", key: "loai_hinh_thanh_toan",
                children: [
                    { title: "Tiền mặt", width: "10%", sorter: (a, b) => a.cash - b.cash, key: "cash", render: (_: string, item: StatisticBillingOfProductWithMachineDto) => <div>{AppConsts.formatNumber(item.cash)}</div> },
                    { title: "Số lượng", width: "5%", key: "cash_count", sorter: (a, b) => a.cash_count - b.cash_count, render: (_: string, item: StatisticBillingOfProductWithMachineDto) => <div>{AppConsts.formatNumber(item.cash_count)}</div> },
                    { title: "Mã QR", width: "10%", key: "moneyQr", sorter: (a, b) => a.moneyQr - b.moneyQr, render: (_: string, item: StatisticBillingOfProductWithMachineDto) => <div>{AppConsts.formatNumber(item.moneyQr)}</div> },
                    { title: "Số lượng", width: "5%", key: "qr_count", sorter: (a, b) => a.qr_count - b.qr_count, render: (_: string, item: StatisticBillingOfProductWithMachineDto) => <div>{AppConsts.formatNumber(item.qr_count)}</div> },
                    { title: "RFID", width: "10%", key: "moneyRFID", sorter: (a, b) => a.moneyRFID - b.moneyRFID, render: (_: string, item: StatisticBillingOfProductWithMachineDto) => <div>{AppConsts.formatNumber(item.moneyRFID)}</div> },
                    { title: "Số lượng", width: "5%", key: "rfid_count", sorter: (a, b) => a.rfid_count - b.rfid_count, render: (_: string, item: StatisticBillingOfProductWithMachineDto) => <div>{AppConsts.formatNumber(item.rfid_count)}</div> },
                ]
            },
            { title: "Tổng số lượng", key: "total", render: (_: string, item: StatisticBillingOfProductWithMachineDto) => <div>{AppConsts.formatNumber(item.totalQuantity)}</div> },
            { title: "Tổng tiền", key: "total_money", render: (_: string, item: StatisticBillingOfProductWithMachineDto) => <div>{AppConsts.formatNumber(item.totalMoney)}</div> },

        ]

        return (
            <div id='baocaosanphamtheomay' ref={this.setComponentRef}>
                <h2 style={{ textAlign: 'center', paddingTop: '10px', }}>
                    <strong>
                        {typeDate === eFormatPicker.date ?
                            (!!inputSearch.start_date && !!inputSearch.end_date) ?
                                ((moment(inputSearch.start_date).format("DD/MM/YYYY") === moment(inputSearch.end_date).format("DD/MM/YYYY") || inputSearch.end_date === undefined) ?
                                    <>{"BÁO CÁO SẢN PHẨM THEO MÁY NGÀY " + moment(inputSearch.start_date).format("DD/MM/YYYY")}</>
                                    :
                                    <>{"BÁO CÁO SẢN PHẨM THEO MÁY TỪ NGÀY " + moment(inputSearch.start_date).format("DD/MM/YYYY") + " ĐẾN NGÀY " + moment(inputSearch.end_date).format("DD/MM/YYYY")}</>
                                )
                                :
                                <>{this.props.productType === "freshdrink" ? "BÁO CÁO THEO SẢN PHẨM KHÔNG BAO BÌ" : "BÁO CÁO THEO SẢN PHẨM CÓ BAO BÌ"}</>
                            :
                            (typeDate === eFormatPicker.month ?
                                <>{"BÁO CÁO SẢN PHẨM THEO MÁY THÁNG " + moment(inputSearch.start_date).format("MM/YYYY")}</>
                                :
                                (typeDate === eFormatPicker.year ?
                                    <>{"BÁO CÁO SẢN PHẨM THEO MÁY NĂM " + moment(inputSearch.start_date).format("YYYY")}</>
                                    : <> </>
                                )
                            )
                        }
                    </strong>
                </h2>
                <Table
                    className="centerTable"
                    size={'small'}
                    bordered={true}
                    scroll={{ x: 1000 }}
                    dataSource={listBillingOfProductWithMachine}
                    columns={columns}
                    pagination={pagination}
                />
            </div>
        )
    }
}