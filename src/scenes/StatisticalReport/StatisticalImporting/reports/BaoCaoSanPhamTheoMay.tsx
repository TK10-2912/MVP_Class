import * as React from 'react';
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { Table } from "antd";
import { stores } from '@src/stores/storeInitializer';
import { L } from '@lib/abpUtility';
import AppConsts from '@src/lib/appconst';
import {  StatisticBillingOfProductWithMachineDto } from '@src/services/services_autogen';
import { ColumnsType } from 'antd/lib/table';
import { eFormatPicker } from '@src/components/Manager/StatisticSearch';
import moment from 'moment';
import { SearchInputAdmin, SearchInputUser } from '@src/stores/statisticStore';

export interface Iprops {
    getAll: () => void;
    inputSearch: SearchInputUser;
    typeDate: string | undefined;
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

    onChangePage = async (page: number, pagesize?: number) => {
        const { listBillingOfProductWithMachine } = stores.statisticStore;
        if (pagesize === undefined || isNaN(pagesize)) {
            pagesize = listBillingOfProductWithMachine.length;
            page = 1;
        }
        await this.setState({ pageSize: pagesize! });
        await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            this.props.getAll();
        });
    }
    setComponentRef = (ref) => {
        this.setState({ isLoadDone: false });
        this.componentRef = ref;
        this.setState({ isLoadDone: true });
    }
    render() {
        const self = this;
        const { listBillingOfProductWithMachine, } = stores.statisticStore;
        const { typeDate, inputSearch } = this.props;
        const columns: ColumnsType<StatisticBillingOfProductWithMachineDto> = [
            { title: "STT", width: 50, fixed: "left", render: (text: string, item: StatisticBillingOfProductWithMachineDto, index: number) => <div>{index + 1}</div> },
            { title: "Tên nhóm máy", key: "groupMachineId", render: (text: string, item: StatisticBillingOfProductWithMachineDto) => <div>{item.groupMachineName}</div> },
            { title: "Mã máy", key: "machineCode", render: (text: string, item: StatisticBillingOfProductWithMachineDto) => <div>{item.machineCode}</div> },
            { title: "Tên máy", key: "machineName", render: (text: string, item: StatisticBillingOfProductWithMachineDto) => <div>{item.machineName}</div> },
            { title: "Người sở hữu", key: "machineName", render: (text: string, item: StatisticBillingOfProductWithMachineDto) => <div>{stores.sessionStore.getUserNameById(item.us_id_owner)}</div> },
            { title: "Tên sản phẩm", key: "productName", render: (text: string, item: StatisticBillingOfProductWithMachineDto) => <div>{item.productname}</div> },
            {
                title: "Loại hình thanh toán", width: "40%", key: "loai_hinh_thanh_toan",
                children: [
                    { title: "Tiền mặt", width: "10%", key: "cash", render: (text: string, item: StatisticBillingOfProductWithMachineDto) => <div>{AppConsts.formatNumber(item.cash)}</div> },
                    { title: "Số lượng", width: "5%", key: "cash_count", render: (text: string, item: StatisticBillingOfProductWithMachineDto) => <div>{AppConsts.formatNumber(item.cash_count)}</div> },
                    { title: "Mã QR", width: "10%", key: "moneyQr", render: (text: string, item: StatisticBillingOfProductWithMachineDto) => <div>{AppConsts.formatNumber(item.moneyQr)}</div> },
                    { title: "Số lượng", width: "5%", key: "qr_count", render: (text: string, item: StatisticBillingOfProductWithMachineDto) => <div>{AppConsts.formatNumber(item.qr_count)}</div> },
                    { title: "RFID", width: "10%", key: "moneyRFID", render: (text: string, item: StatisticBillingOfProductWithMachineDto) => <div>{AppConsts.formatNumber(item.moneyRFID)}</div> },
                    { title: "Số lượng", width: "5%", key: "rfid_count", render: (text: string, item: StatisticBillingOfProductWithMachineDto) => <div>{AppConsts.formatNumber(item.rfid_count)}</div> },
                ]
            },
            { title: "Tổng số lượng", key: "total", render: (text: string, item: StatisticBillingOfProductWithMachineDto) => <div>{AppConsts.formatNumber(item.totalQuantity)}</div> },
            { title: "Tổng tiền", key: "total_money", render: (text: string, item: StatisticBillingOfProductWithMachineDto) => <div>{AppConsts.formatNumber(item.totalMoney)}</div> },

        ]

        return (
            <>
                <div id='baocaosanphamtheomay' ref={this.setComponentRef}>
                    <h2 style={{ textAlign: 'center', paddingTop: '10px' }}>
                        {typeDate === eFormatPicker.date ?
                            (!!inputSearch.start_date && !!inputSearch.end_date) ?
                                ((moment(inputSearch.start_date).format("DD/MM/YYYY") === moment(inputSearch.end_date).format("DD/MM/YYYY") || inputSearch.end_date === undefined) ?

                                    <>{"BÁO CÁO SẢN PHẨM THEO MÁY NGÀY " + moment(inputSearch.start_date).format("DD/MM/YYYY")}</>
                                    :
                                    <>{"BÁO CÁO SẢN PHẨM THEO MÁY TỪ NGÀY " + moment(inputSearch.start_date).format("DD/MM/YYYY") + " ĐẾN NGÀY " + moment(inputSearch.end_date).format("DD/MM/YYYY")}</>
                                )
                                :
                                <> BÁO CÁO THEO LOẠI SẢN PHẨM THEO MÁY</>

                            :
                            (typeDate === eFormatPicker.month ?
                                <>{"BÁO CÁO SẢN PHẨM THEO MÁY THÁNG " + moment(inputSearch.start_date).format("MM/YYYY")}</>
                                :
                                (typeDate === eFormatPicker.year ?
                                    <>{"BÁO CÁO SẢN PHẨM THEO MÁY NĂM " + moment(inputSearch.start_date).format("YYYY")}</>
                                    : <> BÁO CÁO THEO LOẠI SẢN PHẨM THEO MÁY</>)
                            )
                        }
                    </h2>
                    <Table
                        // sticky
                        className="centerTable"
                        size={'small'}
                        bordered={true}
                        scroll={{ x: 1000 }}
                        dataSource={listBillingOfProductWithMachine}
                        columns={columns}
                        pagination={{
                            className: "ant-table-pagination ant-table-pagination-right no-print noprintExcel ",
                            pageSize: this.state.pageSize,
                            total: listBillingOfProductWithMachine.length - 1,
                            current: this.state.currentPage,
                            showTotal: (tot) => "Tổng: " + tot + "",
                            showQuickJumper: true,
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '20', '50', '100', L('All')],
                            onShowSizeChange(current: number, size: number) {
                                self.onChangePage(current, size)
                            },
                            onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
                        }}
                    />
                </div>
            </>
        )
    }
}