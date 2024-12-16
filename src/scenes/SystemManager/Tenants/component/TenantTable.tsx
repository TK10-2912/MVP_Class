import { DeleteFilled, EditOutlined, LoginOutlined } from '@ant-design/icons';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { isGranted } from '@src/lib/abpUtility';
import AppConsts, { EventTable } from '@src/lib/appconst';
import {  TenantDto } from '@src/services/services_autogen';
import { Button, Table, Image, Space } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import * as React from 'react';

export interface IProps {
    actionTable?: (item: TenantDto, event: EventTable) => void;
    pagination: TablePaginationConfig | false;
    isLoadDone?: boolean;
    hasAction?: boolean;
    tenantListResult: TenantDto[];
}

export default class TenantTable extends AppComponentBase<IProps> {
    state = {
        isLoadDone: true,
        id:undefined,
    }
    onAction = (item: TenantDto, action: EventTable) => {
        this.setState({ id: item.id });
        const { actionTable } = this.props;
        if (actionTable !== undefined) {
            actionTable(item, action);
        }
    }

    render() {
        const { pagination, tenantListResult, hasAction } = this.props
        let action = {
            title: "Chức năng", width: 150, key: "action_fresh_drink_index", className: "no-print", dataIndex: '',
            render: (text: string, item: TenantDto) => (
                <Space>
                    <Button
                        type="primary" icon={<EditOutlined />} title="Chỉnh sửa"
                        size='small'
                        onClick={() => this.onAction(item!, EventTable.Edit)}
                    ></Button>
                    {/* {(isGranted(AppConsts.Permission.Pages_Manager_General_Product_Delete)) && */}
                        <Button
                            danger icon={<DeleteFilled />} title="Xóa"
                            size='small'
                            onClick={() => this.onAction(item!, EventTable.Delete)}
                        ></Button>
                        <Button
                            type="primary" icon={<LoginOutlined />} title="Đăng nhập"
                            size='small'
                            onClick={() => this.onAction(item!, EventTable.Login)}
                        ></Button>
                        {/* } */}
                </Space>
            )
        };

        const columns: ColumnsType<TenantDto> = [
            { title: "STT", key: "stt", width: 50, render: (text: string, item: TenantDto, index: number) => <div>{pagination !== false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
            { title: "Name", dataIndex: "name", key: "name", render: (text: string, item: TenantDto) => <div> {item.name} </div> },
            { title: "Tenancy Name", dataIndex: "tenancyName", key: "tenancyName", render: (text: string, item: TenantDto) => <div> {item.tenancyName} </div> },
            { title: "Số máy tối đa", dataIndex: "maxNumberOfMachine", key: "maxNumberOfMachine", render: (text: string, item: TenantDto) => <div> {item.maxNumberOfMachine} </div> },
        ];
        if (!!hasAction && hasAction === true) {
            columns.push(action);
        }

        return (
            <Table
                className='centerTable'
                scroll={this.props.hasAction === false ? { x: undefined, y: undefined } : { x: 500 }}
                onRow={(record, rowIndex) => {
                    return {
                        onDoubleClick: (event: any) => { this.onAction(record!, EventTable.RowDoubleClick) }
                    };
                }}
                loading={!this.props.isLoadDone}
                columns={columns}
                size={'middle'}
                bordered={true}
                
                dataSource={tenantListResult.length > 0 ? tenantListResult : []}
                pagination={this.props.pagination}
                rowClassName={(record, index) => (this.state.id === record.id) ? "bg-click" : "bg-white"}
                rowKey={record => "tenant_table_" + JSON.stringify(record)}
            />
        )
    }
}