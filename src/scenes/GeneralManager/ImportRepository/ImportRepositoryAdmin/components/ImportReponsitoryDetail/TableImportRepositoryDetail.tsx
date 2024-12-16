import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { ProductImportDto } from '@src/services/services_autogen';
import * as React from 'react';
import Table, { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { Button, Image, InputNumber, Tabs } from 'antd';
import { DeleteFilled } from '@ant-design/icons';
import CreateOrUpdateImportsitoryAdmin from './CreateOrUpdateImportRepository';
import { stores } from '@src/stores/storeInitializer';

export interface IProps {
    actionTable?: (item: ProductImportDto, event: EventTable) => void;
    pagination: TablePaginationConfig | false;
    hasAction?: boolean;
    onChangeQuantity?: (item: ProductImportDto, value: number) => void;
    listProductResult?: ProductImportDto[];
    loadTable?: boolean,
    checkChangeQuantity: boolean;
    openImportExcelProduct?: () => void;

}
export const tabManager = {
    tab_1: "Thông tin",
}
export default class TableImportRepositoryDetailAdmin extends AppComponentBase<IProps> {

    state = {
        isLoadDone: true,
        expandedRowKey: [],

    }
    listProductImport: ProductImportDto[] = [];
    async componentDidMount() {
        // this.initData();
    }
    // initData = () => {
    //     this.setState({ isLoadDone: false })
    //     if (this.props.listProductResult != undefined) {
    //         this.listProductImport = this.props.listProductResult;
    //     }
    //     else this.listProductImport = [];
    //     this.setState({ isLoadDone: true })
    // }
    // async componentDidUpdate(prevProps, prevState) {
    //     if (prevProps.loadTable != this.props.loadTable) {
    //         await this.initData();
    //     }
    // }
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
            // this.onCancel();
            this.setState({ expandedRowKey: [record.pr_id] });
        } else {
            this.setState({ expandedRowKey: undefined });
        }
    };

    render() {
        let action = {
            title: "", key: "action", render: (text: number, item: ProductImportDto) => <div>

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
                        <Image className='no-print imageProduct' src={item.fi_id != undefined && item.fi_id.id != undefined ? this.getFile(item.fi_id.id) : AppConsts.appBaseUrl + "/image/no_image.jpg"} alt='No image available' />
                    </div>

            },
            { title: "Mã sản phẩm", key: "pr_im_name", dataIndex: "pr_im_name", render: (text: string, item: ProductImportDto) => <div> { stores.sessionStore.getCodeProductUseName(item.pr_im_name!) } </div> },
            { title: "Tên sản phẩm", key: "pr_im_name", dataIndex: "pr_im_name", render: (text: string, item: ProductImportDto) => <div> {item.pr_im_name} </div> },
            { title: "Đơn vị ", key: "pr_im_unit", dataIndex: "pr_im_unit", render: (text: number, item: ProductImportDto) => <div> {item.pr_im_unit} </div> },
            {
                title: "Số lượng", key: "pr_im_quantity", dataIndex: "pr_im_quantity", render: (text: string, item: ProductImportDto) => {
                    return (
                        <div>
                            {this.props.checkChangeQuantity == true ?
                                <InputNumber type='number' defaultValue={item.pr_im_quantity} onChange={(e) => this.onChangeQuantity(item, Number(e))} min={0} />
                                :
                                item.pr_im_quantity
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
                    className='centerTable'

                    columns={columns}
                    size={'small'}
                    pagination={false}
                    bordered={true}
                    locale={{
                        "emptyText":
                            <Button type='primary' onClick={this.openImportExcelProduct}>Nhập dữ liệu</Button>
                    }}
                    dataSource={this.props.listProductResult}
                    rowKey={record => "drink_table" + JSON.stringify(record)}
                />

            </>
        )
    }
}
