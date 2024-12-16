import { DeleteFilled, EditOutlined } from '@ant-design/icons';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { AuthorizationMachineDto, DrinkDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Image, Space, Table } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { SorterResult, TableRowSelection } from 'antd/lib/table/interface';
import moment from 'moment';
import * as React from 'react';

export interface IProps {
	actionTable?: (item: AuthorizationMachineDto, event: EventTable) => void;
	pagination: TablePaginationConfig | false;
	isLoadDone?: boolean;
	hasAction?: boolean;
	authorizationMachineListResult: AuthorizationMachineDto[],
	noScrool?: boolean;
}

export default class AuthorizationMachineTable extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		au_ma_id: undefined,
	}

	onAction = (item: AuthorizationMachineDto, action: EventTable) => { 
		if (!!this.props.hasAction && this.props.hasAction == true) {

			this.setState({ au_ma_id: item.au_ma_id });
			const { actionTable } = this.props;
			if (actionTable !== undefined) {
				actionTable(item, action);
			}
		}
	}

	render() {
		const { pagination, authorizationMachineListResult, hasAction } = this.props
		let action: any = {
			title: "Chức năng", key: "action_drink_index", className: "no-print", dataIndex: '', fixed: "right", width: 100,
			render: (text: string, item: AuthorizationMachineDto) => (
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

		const columns: ColumnsType<AuthorizationMachineDto> = [
			{ title: "STT", key: "stt_fresh_drink_index", width: 50, render: (text: string, item: AuthorizationMachineDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
			{ title: "Máy bán nước", key: "dr_code", render: (text: string, item: AuthorizationMachineDto) => <div> {stores.sessionStore.getNameMachines(item.ma_id)} </div> },
			{ title: "Người sở hữu", key: "dr_name", render: (text: string, item: AuthorizationMachineDto) => <div> {stores.sessionStore.getUserNameById(item.au_ma_id)} </div> },
			{ title: "Người uỷ quyền", key: "su_id", render: (text: number, item: AuthorizationMachineDto) => <div> {stores.sessionStore.getUserNameById(item.us_id_is_authorized)} </div> },
			{ title: "Ngày uỷ quyền", key: "su_id", render: (text: number, item: AuthorizationMachineDto) => <div> {moment(item.au_ma_updated_at).format("DD/MM/YYYY")} </div> },
		];
		if (!!hasAction && hasAction == true) columns.push(action);

		return (
			<Table
				scroll={this.props.noScrool == false ? { x: undefined, y: undefined } : { x: 1000, y: window.innerHeight }}
				className='centerTable'
				onRow={(record, rowIndex) => {
					return {
						onDoubleClick: (event: any) => { this.onAction(record!, EventTable.RowDoubleClick) }
					};
				}}
				columns={columns}
				size={'middle'}
				bordered={true}
				locale={{ "emptyText": "Không có dữ liệu" }}
				dataSource={authorizationMachineListResult.length > 0 ? authorizationMachineListResult : []}
				pagination={this.props.pagination}
				rowClassName={(record, index) => (this.state.au_ma_id === record.au_ma_id) ? "bg-click" : "bg-white"}
				rowKey={record => "drink_table" + JSON.stringify(record)}
			/>
		)
	}
}