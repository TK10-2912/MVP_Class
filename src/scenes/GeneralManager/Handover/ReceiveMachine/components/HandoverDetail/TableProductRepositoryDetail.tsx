import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { EventTable } from '@src/lib/appconst';
import * as React from 'react';
import Table, { ColumnGroupType, ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { Button, Image, InputNumber, Tabs } from 'antd';
import { DeleteFilled } from '@ant-design/icons';
import { ListProductHandOver } from './CreateHandover';
import { stores } from '@src/stores/storeInitializer';

export interface IProps {
    actionTable?: (item: ListProductHandOver, event: EventTable) => void;
    pagination: TablePaginationConfig | false;
    hasAction?: boolean;
    onChangeQuantity?: (item: ListProductHandOver, value: number) => void;
    listProductResult?: ListProductHandOver[];
    loadTable?: boolean,
    edit: boolean;
    openImportExcelProduct?: () => void;

}
export const tabManager = {
    tab_1: "Thông tin bàn giao",
}
export default class TableProductRepositoryDetail extends AppComponentBase<IProps> {

    state = {
        isLoadDone: true,
        expandedRowKey: [],

    }
    listProductImport: ListProductHandOver[] = [];

    onAction = (item: ListProductHandOver, action: EventTable) => {
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
    onChangeQuantity = (item: ListProductHandOver, value: number) => {
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
        let action: ColumnGroupType<ListProductHandOver> = {
            title: "", children: [], fixed: 'right', width: 40, key: "action", render: (text: number, item: ListProductHandOver) => <div>
                <Button
                    danger icon={<DeleteFilled />} title="Xóa"
                    size='small'
                    onClick={() => this.onAction(item!, EventTable.Delete)}
                ></Button>
            </div>
        };
        const columns: ColumnsType<ListProductHandOver> = [
            { title: "STT", key: "stt_fresh_drink_index", dataIndex: 'stt_fresh_drink_index', width: 50, render: (text: string, item: ListProductHandOver, index: number) => <div>{(index + 1)}</div> },
            {
                title: "Ảnh", key: "image", dataIndex: "pr_im_name", width: 200, render: (text: string, item: ListProductHandOver) =>
                    <div style={{ textAlign: "center" }}>
                        <Image className='no-print imageProduct' src={item.fi_id != undefined && item.fi_id.id != undefined ? this.getFile(item.fi_id.id) : AppConsts.appBaseUrl + "/image/no_image.jpg"} alt='No image available' />
                    </div>

            },
            { title: "Mã sản phẩm", key: "pr_im_name", dataIndex: "pr_im_name", render: (text: string, item: ListProductHandOver) => <div> {stores.sessionStore.getCodeProductByID(item.pr_id)} </div> },
            { title: "Tên sản phẩm", key: "pr_im_name", dataIndex: "pr_im_name", render: (text: string, item: ListProductHandOver) => <div> {item.pr_name} </div> },
            { title: "Đơn vị", key: "pr_im_name", dataIndex: "pr_im_name", render: (text: string, item: ListProductHandOver) => <div> {item.pr_unit} </div> },
            {
                title: "Số lượng", key: "pr_im_quantity", dataIndex: "pr_im_quantity", render: (text: string, item: ListProductHandOver) => {
                    return (
                        <div>
                            {this.props.edit == true ?
                                <InputNumber autoFocus maxLength={item.pr_quantity_max.toString().length} max={item.pr_quantity_max} defaultValue={item.pr_quantity} onChange={async (e) => {
                                    await this.onChangeQuantity(item, Number(e));
                                }} min={1} />
                                :
                                item.pr_quantity
                            }

                        </div>
                    )
                }
            },
        ];
        if (!!this.props.actionTable && this.props.hasAction == true) {
            columns.push(action)
        }
        return (
            <>
                <Table
                    className='centerTable customTable'
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
