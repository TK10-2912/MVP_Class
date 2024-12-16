import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { ProductImportDto } from '@src/services/services_autogen';
import * as React from 'react';
import Table, { ColumnGroupType, ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { Button, Col, Image, InputNumber } from 'antd';
import { DeleteFilled } from '@ant-design/icons';
import { stores } from '@src/stores/storeInitializer';
import { eStatusImportRepository } from '@src/lib/enumconst';

export interface IProps {
    actionTable?: (item: ProductImportDto, event: EventTable) => void;
    pagination: TablePaginationConfig | false;
    hasAction?: boolean;
    onChangeQuantity?: (item: ProductImportDto, value: number) => void;
    listProductResult?: ProductImportDto[];
    loadTable?: boolean,
    edit?: boolean,
    checkChangeQuantity: boolean;
    status?: number;

    openImportExcelProduct?: () => void;

}
export const tabManager = {
    tab_1: "Thông tin",
}
export default class TableImportRepositoryDetail extends AppComponentBase<IProps> {

    state = {
        isLoadDone: true,
        expandedRowKey: [],

    }
    listProductImport: ProductImportDto[] = [];

    onAction = (item: ProductImportDto, action: EventTable) => {
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
    onChangeQuantity = (item: ProductImportDto, value: number) => {
        const { onChangeQuantity } = this.props;
        if (onChangeQuantity !== undefined) {
            onChangeQuantity(item, value);
        }
    }
    handleExpand = (expanded, record) => {
        if (expanded) {
            this.setState({ expandedRowKey: [record.pr_id] });
        } else {
            this.setState({ expandedRowKey: undefined });
        }
    };
    
    render() {
        let action: ColumnGroupType<ProductImportDto> = {
            title: "", children: [], fixed: 'right', key: "action", render: (text: number, item: ProductImportDto) => <div>
                <Button
                    danger icon={<DeleteFilled />} title="Xóa"
                    style={{ marginLeft: '10px' }}
                    size='small'
                    onClick={() => this.onAction(item!, EventTable.Delete)}
                ></Button>
            </div>
        };
        const columns: ColumnsType<ProductImportDto> = [
            { title: "STT", key: "stt_fresh_drink_index", dataIndex: 'stt_fresh_drink_index', width: 50, render: (text: string, item: ProductImportDto, index: number) => <div>{(index + 1)}</div> },
            {
                title: "Ảnh", key: "image", dataIndex: "pr_im_name", width: 200, render: (text: string, item: ProductImportDto) =>
                    <div style={{ textAlign: "center" }}>
                        <Image className='no-print imageProduct'
                            src={item.fi_id ? this.getImageProduct(item.fi_id?.md5!) : process.env.PUBLIC_URL + '/image/no_image.jpg'}
                            alt='No image available' />
                    </div>

            },
            { title: "Mã sản phẩm", key: "pr_im_name", dataIndex: "pr_im_name", render: (text: string, item: ProductImportDto) => <div> {stores.sessionStore.getCodeProductUseName(item.pr_im_name!)} </div> },
            { title: "Tên sản phẩm", key: "pr_im_name", dataIndex: "pr_im_name", render: (text: string, item: ProductImportDto) => <div> {item.pr_im_name} </div> },
            { title: "Đơn vị ", key: "pr_im_unit", dataIndex: "pr_im_unit", render: (text: number, item: ProductImportDto) => <div> {item.pr_im_unit} </div> },
            {
                title: "Số lượng", key: "pr_im_quantity", dataIndex: "pr_im_quantity", render: (text: string, item: ProductImportDto) => {
                    return (
                        <div>{this.props.edit == true ?
                            <>
                                {this.props.checkChangeQuantity == true || this.props.status == eStatusImportRepository.PHIEU_TAM.num ?
                                    <InputNumber autoFocus maxLength={4} max={1000} defaultValue={item.pr_im_quantity} onChange={async (e) => {
                                        await this.onChangeQuantity(item, Number(e)); console.log(e)
                                    }} min={1} />
                                    :
                                    item.pr_im_quantity
                                }

                            </>
                            :
                            <>
                                {item.pr_im_quantity}
                            </>
                        }
                        </div>
                    )
                }
            },
            { title: "Đơn giá", key: "pr_im_unit_price", dataIndex: "pr_im_unit_price", render: (text: number, item: ProductImportDto) => <div> {AppConsts.formatNumber(item.pr_im_unit_price) + " đ"} </div> },
            { title: "Thành tiền", key: "pr_im_total_money", dataIndex: "pr_im_total_money", render: (text: number, item: ProductImportDto) => <div> {AppConsts.formatNumber(item.pr_im_quantity * item.pr_im_unit_price) + " đ"} </div> },
        ];
        if (!!this.props.actionTable && this.props.hasAction == true) {
            columns.push(action)
        }
        return (
            <>
                <Table
                    className='centerTable customTable'
                    scroll={{ x: 1000, y: undefined }}
                    columns={columns}
                    size={'small'}
                    pagination={false}
                    bordered={true}
                    dataSource={this.props.listProductResult}
                    rowKey={record => "drink_table" + JSON.stringify(record)}
                />

            </>
        )
    }
}
