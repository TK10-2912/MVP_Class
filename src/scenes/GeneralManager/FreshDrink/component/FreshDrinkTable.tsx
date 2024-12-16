import { DeleteFilled, EditOutlined } from '@ant-design/icons';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { FreshDrinkDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Table, Image, Space } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { SorterResult, TableRowSelection } from 'antd/lib/table/interface';
import * as React from 'react';

export interface IProps {
    actionTable?: (item: FreshDrinkDto, event: EventTable) => void;
    pagination: TablePaginationConfig | false;
    isLoadDone?: boolean;
    hasAction?: boolean;
    freshDrinkListResult: FreshDrinkDto[];
    changeColumnSort?: (fieldSort: SorterResult<FreshDrinkDto> | SorterResult<FreshDrinkDto>[]) => void;
    rowSelection?: TableRowSelection<FreshDrinkDto>
    noScroll?: boolean;
}

export default class FreshDrinkTable extends AppComponentBase<IProps> {
    state = {
        isLoadDone: true,
        fr_dr_id_selected: undefined,
        listIdFreshDrink: 0
    }
    listIdFreshDrink: number[] = [];
    listItemFreshDrink: FreshDrinkDto[] = [];

    onAction = (item: FreshDrinkDto, action: EventTable) => {
        this.setState({ fr_dr_id_selected: item.fr_dr_id });
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action);
        }
    }


    render() {
        const { pagination, freshDrinkListResult, rowSelection, hasAction } = this.props
        let action = {
            title: "Chức năng", width: 100, key: "action_fresh_drink_index", className: "no-print", dataIndex: '',
            render: (text: string, item: FreshDrinkDto) => (
                <Space>
                    <Button
                        type="primary" icon={<EditOutlined />} title="Chỉnh sửa"
                        size='small'
                        onClick={() => this.onAction(item!, EventTable.Edit)}
                    ></Button>
                    <Button
                        danger icon={<DeleteFilled />} title="Xóa"
                        size='small'
                        onClick={() => this.onAction(item!, EventTable.Delete)}
                    ></Button>
                </Space>
            )
        };

        const columns: ColumnsType<FreshDrinkDto> = [
            { title: "STT", key: "stt_fresh_drink_index", width: 50, render: (text: string, item: FreshDrinkDto, index: number) => <div>{pagination !== false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
            {
                title: "Ảnh minh họa",
                key: "fr_dr_id_drink_index",
                width: 160,
                render: (text: string, item: FreshDrinkDto, index: number) => (
                    <div style={{ textAlign: "center" }}>
                        <Image src={(item.fr_dr_image != undefined && item.fr_dr_image.id != undefined) ? this.getFile(item.fr_dr_image.id) : AppConsts.appBaseUrl + "/image/no_image.jpg"} style={{ height: "20vh", width: "100%" }}
                            alt='No image available' />
                    </div>
                )
            },
            { title: "Mã sản phẩm", sorter: true, dataIndex: "fr_dr_code", key: "fr_dr_code_drink_index", render: (text: string, item: FreshDrinkDto) => <div> {item.fr_dr_code} </div> },
            { title: "Tên sản phẩm", sorter: true, dataIndex: "fr_dr_name", key: "fr_dr_name_drink_index", render: (text: string, item: FreshDrinkDto) => <div> {item.fr_dr_name} </div> },
            { title: "Dung tích (ml)", key: "fr_dr_capacity_drink_index", render: (text: number, item: FreshDrinkDto) => <div> {AppConsts.formatNumber(item.fr_dr_capacity)}</div> },
            { title: "Giá thành (VNĐ)", sorter: true, dataIndex: "fr_dr_price", key: "fr_price_drink_index", render: (text: number, item: FreshDrinkDto) => <div> {AppConsts.formatNumber(item.fr_dr_price)}</div> },
            { title: "Nhà cung cấp", key: "su_id_drink_index", render: (text: number, item: FreshDrinkDto) => <div> {stores.sessionStore.getNameSupplier(item.su_id)} </div> },
        ];
        if (!!hasAction && hasAction === true) {
            columns.push(action);
        }

        return (
            <Table
                className='centerTable'
                scroll={this.props.noScroll === false ? { x: undefined, y: undefined } : { x: 1100, y: 600 }}
                onRow={(record, rowIndex) => {
                    return {
                        onDoubleClick: (event: any) => { this.onAction(record!, EventTable.RowDoubleClick) }
                    };
                }}
                onChange={(a, b, sort: SorterResult<FreshDrinkDto> | SorterResult<FreshDrinkDto>[]) => {
                    if (!!this.props.changeColumnSort) {
                        this.props.changeColumnSort(sort);
                    }
                }}
                rowSelection={this.props.actionTable !== undefined ? rowSelection : undefined}
                loading={!this.props.isLoadDone}
                columns={columns}
                size={'middle'}
                bordered={true}
                locale={{ "emptyText": "Không có dữ liệu" }}
                dataSource={freshDrinkListResult.length > 0 ? freshDrinkListResult : []}
                pagination={this.props.pagination}
                rowClassName={(record, index) => (this.state.fr_dr_id_selected === record.fr_dr_id) ? "bg-click" : "bg-white"}
                rowKey={record => "fresh_drink_table_" + JSON.stringify(record)}
            />
        )
    }
}