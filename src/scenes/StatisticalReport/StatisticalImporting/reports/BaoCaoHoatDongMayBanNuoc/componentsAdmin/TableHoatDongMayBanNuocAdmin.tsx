import * as React from 'react';
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { Table, message } from "antd";
import { ImportSellRemainProductDto, StatisticImportSellRemainProductDto } from '@src/services/services_autogen';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { stores } from '@src/stores/storeInitializer';
import { Link } from 'react-router-dom';
import TableProductDetailAdmin from './TableProductDetailAdmin';
import AppConsts from '@src/lib/appconst';
export interface Iprops {
    pagination: TablePaginationConfig | false;
    is_print: boolean;
    listStatistic: StatisticImportSellRemainProductDto[];
    totalSatistic: StatisticImportSellRemainProductDto;
}
export default class TableHoatDongMayBanNuocAdmin extends AppComponentBase<Iprops> {
    componentRef: any | null = null;
    state = {
        isLoadDone: true,
        visibleModal: false,
        title: "",
    };
    listItemRemain: ImportSellRemainProductDto[] = [];
    importSellRemainProductSelected: StatisticImportSellRemainProductDto = new StatisticImportSellRemainProductDto();
    onClickOpenModal = (input: ImportSellRemainProductDto[],data:StatisticImportSellRemainProductDto, title: string) => {
        this.listItemRemain = input != undefined ? input : [];
        if (this.listItemRemain.length > 0) {
            this.importSellRemainProductSelected.init(data);
            console.log(111,this.importSellRemainProductSelected);
            
            this.setState({ title: title, visibleModal: true })
        }
        else {
            message.warning("Không có sản phẩm!")
            this.setState({ visibleModal: true })
        }
    }
    render() {
        const { pagination } = this.props;
        const columns: ColumnsType<StatisticImportSellRemainProductDto> = [
            { title: "STT", key: "stt", width: 50, render: (text: string, item: StatisticImportSellRemainProductDto, index: number) => <div>{pagination !== false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
            {
                title: "Nhóm máy", fixed: "left", width: 150, key: "groupMachineId", render: (text: string, item: StatisticImportSellRemainProductDto, index: number) =>
                    <div title='Chi tiết nhóm máy'>
                        {this.props.is_print ? item.groupMachineName :
                            <Link target='_blank' to={"/general/machine/?gr_id=" + (stores.sessionStore.getIDGroupUseName(item.groupMachineName!))} title="Chi tiết nhóm máy">
                                {item.groupMachineName ||""}
                            </Link>
                        }
                    </div>,
            },
            {
                title: "Máy bán nước", fixed: "left", width: 150, key: "machineCode", render: (text: string, item: StatisticImportSellRemainProductDto, index: number) =>
                    <div title="Chi tiết mã máy">
                        {this.props.is_print ? item.machineCode :
                            <Link target='blank' to={"/general/machine/?machine=" + item.machineCode}>
                                <div>{item.machineCode}</div>
                                <div  style={{fontSize:11,color:'gray'}}>{item.nameMachine}</div>
                            </Link>
                        }
                    </div>
            },
            { title: "Người vận hành", key: "money", render: (text: string, item: StatisticImportSellRemainProductDto) => <div>{stores.sessionStore.getUserNameById(item.us_id_operator)}</div> },
            {
                title: "Sản phẩm có bao bì", key: "money", children: [
                    {
                        title: "Tổng đã nạp", key: "totalQuantityImportDrink", className: "pointHover",
                        sorter: (a, b) => a.totalQuantityImportDrink - b.totalQuantityImportDrink,
                        onCell: (record) => {
                            return {
                                onClick: () =>
                                    this.onClickOpenModal(record.importDrinkDto!,record, "Tổng sản phẩm đã nạp")
                            }
                        }, render: (item: StatisticImportSellRemainProductDto) => <div>{item.totalQuantityImportDrink}</div>
                    },
                    {
                        title: "Tổng đã bán", key: "totalQuantitySellDrink", className: "pointHover",
                        sorter: (a, b) => a.totalQuantitySellDrink - b.totalQuantitySellDrink,
                        onCell: (record) => {
                            return {
                                onClick: () =>
                                    this.onClickOpenModal(record.sellDrinkDto!,record, "Tổng sản phẩm đã bán")
                            }
                        }, render: (item: StatisticImportSellRemainProductDto) => <div>{item.totalQuantitySellDrink}</div>
                    },
                    {
                        title: "Còn lại trong máy", key: "totalQuantityRemainDrink", className: "pointHover",
                        sorter: (a, b) => a.totalQuantityRemainDrink - b.totalQuantityRemainDrink,
                        onCell: (record) => {
                            return {
                                onClick: () =>
                                    this.onClickOpenModal(record.remainDrinkDto!,record, "Còn lại trong máy")
                            }

                        }, render: (item: StatisticImportSellRemainProductDto) => <div>{item.totalQuantityRemainDrink}</div>
                    },
                ]
            },
            {
                title: "Sản phẩm không có bao bì", key: "money", children: [
                    {
                        title: "Tổng đã nạp (ml)", key: "totalQuantityImportFreshDrink", className: "pointHover",
                        sorter: (a, b) => a.totalQuantityImportFreshDrink - b.totalQuantityImportFreshDrink,
                        onCell: (record) => {
                            return {
                                onClick: () =>
                                    this.onClickOpenModal(record.importFreshDrinkDto!,record, "Tổng sản phẩm đã nạp")
                            }
                        }, render: (item: StatisticImportSellRemainProductDto) => <div>{AppConsts.formatNumber(item.totalQuantityImportFreshDrink*100)}</div>
                    },
                    {
                        title: "Tổng đã bán (ml)", key: "totalQuantitySellFreshDrink", className: "pointHover",
                        sorter: (a, b) => a.totalQuantitySellFreshDrink - b.totalQuantitySellFreshDrink,
                        onCell: (record) => {
                            return {
                                onClick: () =>
                                    this.onClickOpenModal(record.sellFreshDrinkDto!,record,"Tổng sản phẩm đã bán")
                            }
                        }, render: (item: StatisticImportSellRemainProductDto) => <div>{AppConsts.formatNumber(item.totalQuantitySellFreshDrink*100)}</div>
                    },
                    {
                        title: "Còn lại trong máy (ml)", key: "totalQuantityRemainFreshDrink", className: "pointHover",
                        sorter: (a, b) => a.totalQuantityRemainFreshDrink - b.totalQuantityRemainFreshDrink,
                        onCell: (record) => {
                            return {
                                onClick: () =>
                                    this.onClickOpenModal(record.remainFreshDrinkDto!,record, "Còn lại trong máy")
                            }
                        }, render: (item: StatisticImportSellRemainProductDto) => <div>{AppConsts.formatNumber(item.totalQuantityRemainFreshDrink*100)}</div>
                    },
                ]
            },
        ];
        return (
            <>
                <Table
                    className="centerTable"
                    loading={!this.state.isLoadDone}
                    size={'small'}
                    bordered={true}
                    dataSource={this.props.listStatistic}
                    columns={columns}
                    rowKey={(record: StatisticImportSellRemainProductDto) => record.key!}
                    scroll={undefined}
                    
                    pagination={this.props.pagination}
                    summary={
                        this.props.listStatistic.length > 0 ?
                            () => (
                                <>
                                    <Table.Summary.Row >
                                        <Table.Summary.Cell index={0} colSpan={4}><div style={{ display: "flex", justifyContent: "center" }}><b>Tổng</b></div></Table.Summary.Cell>
                                        <Table.Summary.Cell index={1} ><div style={{ textAlign: 'center' }}><b>{this.props.totalSatistic.totalQuantityImportDrink}</b></div></Table.Summary.Cell>
                                        <Table.Summary.Cell index={2}><div style={{ textAlign: 'center' }}><b>{this.props.totalSatistic.totalQuantitySellDrink}</b></div></Table.Summary.Cell>
                                        <Table.Summary.Cell index={3}><div style={{ textAlign: 'center' }}><b>{this.props.totalSatistic.totalQuantityRemainDrink}</b></div></Table.Summary.Cell>
                                        <Table.Summary.Cell index={4}><div style={{ textAlign: 'center' }}><b>{AppConsts.formatNumber(this.props.totalSatistic.totalQuantityImportFreshDrink*100)} ml</b></div></Table.Summary.Cell>
                                        <Table.Summary.Cell index={5}><div style={{ textAlign: 'center' }}><b>{AppConsts.formatNumber(this.props.totalSatistic.totalQuantitySellFreshDrink*100)} ml</b>{/* {record} */}</div></Table.Summary.Cell>
                                        <Table.Summary.Cell index={6}><div style={{ textAlign: 'center' }}><b>{AppConsts.formatNumber(this.props.totalSatistic.totalQuantityRemainFreshDrink*100)} ml</b></div></Table.Summary.Cell>
                                    </Table.Summary.Row>

                                </>
                            ) : undefined
                    }
                />
                {
                    this.listItemRemain.length > 0 && this.state.visibleModal &&
                    <TableProductDetailAdmin
                        ma_code={this.importSellRemainProductSelected.machineCode!}
                        ma_name={this.importSellRemainProductSelected.nameMachine!}
                        groupMachine={this.importSellRemainProductSelected.groupMachineName!}
                        visibleModal={this.state.visibleModal}
                        onCancel={() => this.setState({ visibleModal: false })}
                        listItemRemain={this.listItemRemain}
                        title={this.state.title}
                    />
                }
            </>
        )
    }
}