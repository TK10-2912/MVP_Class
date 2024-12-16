import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { EventTable, pageSizeOptions } from '@src/lib/appconst';
import { ProductTranferDto, TranferRepositoryDto } from '@src/services/services_autogen';
import * as React from 'react';
import Table, { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { Button, Col, Image, InputNumber, Pagination } from 'antd';
import { DeleteFilled } from '@ant-design/icons';
import SelectedUnit from '@src/components/Manager/SelectedUnit';
import { eTranferRepositoryStatus } from '@src/lib/enumconst';

export interface IProps {
    actionTable?: (item: ProductTranferDto, event: EventTable) => void;
    pagination: TablePaginationConfig | false;
    hasAction?: boolean;
    onChangeTransferRepositoryNumberFieldToCreate?: (item: ProductTranferDto, value: number, field: string) => void;
    onChangeTransferRepositoryStringFieldToCreate?: (item: ProductTranferDto, value: string,) => void;
    listProductResult?: ProductTranferDto[];
    loadTable?: boolean,
    edit?: boolean,
    checkChangeQuantity: boolean;
    status?: number;
    onSuccess?: () => void;
    openImportExcelProduct?: () => void;

}
export const tabManager = {
    tab_1: "Thông tin nhập hàng",
}
export default class TableImportTranferRepositoryUser extends AppComponentBase<IProps> {
    state = {
        isLoadDone: true,
        expandedRowKey: [],
        field: '',
        pagesize: 10,
        currentPage: 1,

    }
    listProductImport: ProductTranferDto[] = [];

    onAction = (item: ProductTranferDto, action: EventTable) => {
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action);
        }
    }
    openImportExcelProduct = () => {
        if (this.props.openImportExcelProduct !== undefined) {
            this.props.openImportExcelProduct();
        }
    }
    onChangeTransferRepositoryNumberFieldToCreate = (item: ProductTranferDto, value: number, field: string) => {
        const { onChangeTransferRepositoryNumberFieldToCreate } = this.props;
        if (onChangeTransferRepositoryNumberFieldToCreate !== undefined) {
            onChangeTransferRepositoryNumberFieldToCreate(item, value, field);
        }
    }
    onChangeTransferRepositoryStringFieldToCreate = (item: ProductTranferDto, value: string,) => {
        const { onChangeTransferRepositoryStringFieldToCreate } = this.props;
        if (onChangeTransferRepositoryStringFieldToCreate !== undefined) {
            onChangeTransferRepositoryStringFieldToCreate(item, value,);
        }
    }
    handleExpand = (expanded, record) => {
        if (expanded) {
            this.setState({ expandedRowKey: [record.pr_id] });
        } else {
            this.setState({ expandedRowKey: undefined });
        }
    };
    handlePageChange = (page, pageSize) => {
        this.setState({ currentPage: page, pagesize: pageSize });
    };
    onShowSizeChange = (current, size) => {
        this.handlePageChange(current, size);
    };
    render() {
        const { status } = this.props;
        let action: any = {
            title: "", children: [], fixed: 'right', width: 50, key: "action", render: (text: number, item: ProductTranferDto) => <div>
                <Button
                    danger icon={<DeleteFilled />} title="Xóa"
                    size='small'
                    onClick={() => this.onAction(item!, EventTable.Delete)}
                ></Button>
            </div>
        };
        const columns: ColumnsType<ProductTranferDto> = [
            { title: "STT", key: "stt_fresh_drink_index", dataIndex: 'stt_fresh_drink_index', width: 50, render: (text: string, item: ProductTranferDto, index: number) => <div>{this.state.pagesize! * (this.state.currentPage! - 1) + (index + 1)}</div> },
            {
                title: "Ảnh", key: "image", dataIndex: "pr_tr_name", width: 100, render: (text: string, item: ProductTranferDto) =>

                    <Image className='no-print imageProduct'
                        src={item.fi_id ? this.getImageProduct(item.fi_id?.md5!) : process.env.PUBLIC_URL + '/image/no_image.jpg'}
                        alt='No image available' />
            },
            { title: "Mã SP", key: "pr_tr_name", ellipsis: true, dataIndex: "pr_tr_name", render: (text: string, item: ProductTranferDto) => <div>{item.pr_tr_code} </div> },
            {
                title: "Tên SP", key: "pr_tr_name", dataIndex: "pr_tr_name", render: (text: string, item: ProductTranferDto) => <div>{item.pr_tr_name}</div>
            },
            // {
            //     title: "Đơn giá", width: 150, key: "pr_tr_unit_price", dataIndex: "pr_tr_unit_price", render: (text: number, item: ProductTranferDto) =>
            //         <div>{this.props.edit == true ?
            //             <>
            //                 {this.props.checkChangeQuantity == true || this.props.status == eTranferRepositoryStatus.REQUEST.num ?
            //                     <InputNumber step={1000} style={{ width: '100%' }} autoFocus={this.state.field == 'pr_tr_unit_price'} maxLength={9} max={100000000} defaultValue={item.pr_tr_unit_price} onChange={async (e) => {
            //                         await this.setState({ field: 'pr_tr_unit_price' }); await this.onChangeTransferRepositoryNumberFieldToCreate(item, Number(e) > 100000000 ? 100000000 : Number(e) < 1 ? 1 : Number(e), "pr_tr_unit_price"); await this.onChangeTransferRepositoryNumberFieldToCreate(item, (Number(e) > 100000000 ? 100000000 : Number(e) < 1 ? 1 : Number(e)) * item.pr_tr_quantity, "pr_tr_total_money")
            //                     }} min={1}
            //                         formatter={value => AppConsts.numberWithCommas(value)}
            //                         parser={value => value!.replace(/\D/g, '')}
            //                         value={item.pr_tr_unit_price}
            //                     />
            //                     :
            //                     AppConsts.formatNumber(item.pr_tr_unit_price)
            //                 }

            //             </>
            //             :
            //             <>
            //                 {AppConsts.formatNumber(item.pr_tr_unit_price)}
            //             </>
            //         }
            //         </div>

            // },
            //{ title:"Đơn vị ", key: "pr_tr_unit", dataIndex: "pr_tr_unit", render: (text: number, item: ProductTranferDto) => <div> {item.pr_tr_unit} </div> },
            {
                title: "Đơn vị ", width: 150, key: "pr_im_unit", dataIndex: "pr_im_unit", render: (text: number, item: ProductTranferDto) =>
                    // <div>{this.props.edit == true ?
                    //     <>
                    //         {this.props.checkChangeQuantity == true || this.props.status == eTranferRepositoryStatus.REQUEST.num ?
                    //             <SelectedUnit import={true} unitSelected={item.pr_tr_unit} onChangeUnit={(value) => this.onChangeTransferRepositoryStringFieldToCreate(item, value)}></SelectedUnit>
                    //             :
                    //             item.pr_tr_unit
                    //         }

                    //     </>
                    //     :
                    //     <>
                    //         {item.pr_tr_unit}
                    //     </>
                    // }
                    // </div>
                    <div>{item.pr_tr_unit}</div>
            },
            {
                title: "Số lượng", width: 100, key: "pr_tr_quantity", dataIndex: "pr_tr_quantity", render: (text: string, item: ProductTranferDto) => {
                    return (
                        <div>{(this.props.edit == true || status === eTranferRepositoryStatus.TEMPORARY.num) ?
                            <>
                                {this.props.checkChangeQuantity == true ?
                                    <InputNumber style={{ width: '100%' }} autoFocus={this.state.field == 'pr_tr_quantity'} maxLength={4} max={1000} defaultValue={item.pr_tr_quantity} onChange={async (e) => {
                                        this.setState({ field: 'pr_tr_quantity' });
                                        await this.onChangeTransferRepositoryNumberFieldToCreate(item, Number(e) > 1000 ? 1000 : Number(e) < 1 ? 1 : Number(e), "pr_tr_quantity");
                                        await this.onChangeTransferRepositoryNumberFieldToCreate(item, (Number(e) > 1000 ? 1000 : Number(e) < 1 ? 1 : Number(e)) * item.pr_tr_unit_price, "pr_tr_total_money");
                                    }} min={1}
                                        parser={value => value!.replace(/\D/g, '')}
                                    />
                                    :
                                    AppConsts.formatNumber(item.pr_tr_quantity)
                                }

                            </>
                            :
                            <>
                                {AppConsts.formatNumber(item.pr_tr_quantity)}
                            </>
                        }
                        </div>
                    )
                }
            },
            // {
            //     title: "Thành tiền", width: 150, key: "pr_tr_total_money", dataIndex: "pr_tr_total_money", render: (text: number, item: ProductTranferDto) =>
            //         <div>
            //             {AppConsts.formatNumber(item.pr_tr_total_money) + " VND"}
            //         </div>
            // },
        ];
        if (!!this.props.actionTable && this.props.hasAction == true) {
            columns.push(action)
        }
        const startIndex = (this.state.currentPage - 1) * this.state.pagesize;
        const endIndex = startIndex + this.state.pagesize;
        const currentData = this.props.listProductResult?.slice(startIndex, endIndex);

        return (
            <>
                <Table
                    className='centerTable customTable'
                    scroll={{ x: 1000, y: undefined }}
                    columns={columns}
                    size={'small'}
                    bordered={true}
                    dataSource={currentData}
                    rowKey={record => "drink_table" + JSON.stringify(record)}
                    pagination={false}

                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: "8px" }}>
                    <Pagination
                        size='small'
                        current={this.state.currentPage}
                        pageSize={this.state.pagesize}
                        total={this.props.listProductResult?.length}
                        onChange={this.handlePageChange}
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total) => `Tổng: ${total}`}
                        pageSizeOptions={pageSizeOptions}
                        onShowSizeChange={this.onShowSizeChange}
                    />
                    {!this.props.actionTable &&
                        <div style={{ textAlign: 'right' }}>
                            <div>
                                <div className="info-row">
                                    <span style={{ fontSize: 15 }}>Tổng số lượng:</span>
                                    <b>{this.props.listProductResult?.reduce((sum, item) => sum + item.pr_tr_quantity, 0) || 0}</b>
                                </div>
                                <div className="info-row" style={{ fontSize: 15 }}>
                                    <span>Tổng số mặt hàng:</span>
                                    <b>{this.props.listProductResult?.length}</b>
                                </div>
                                <div className="info-row" style={{ fontSize: 15 }}>
                                    <span>Tổng tiền hàng:</span>
                                    <b>{AppConsts.formatNumber(this.props.listProductResult?.reduce((sum, item) => sum + item.pr_tr_total_money, 0) || 0) + " VND"}</b>
                                </div>
                            </div>

                        </div>
                    }
                </div>
            </>
        )
    }
}
