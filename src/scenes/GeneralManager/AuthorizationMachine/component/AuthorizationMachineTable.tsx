import { DeleteFilled, EditOutlined } from '@ant-design/icons';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { valueOfeAuthorizationMachineType } from '@src/lib/enumconst';
import { AuthorizationMachineDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Image, Table, Tooltip } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { SorterResult, TableRowSelection } from 'antd/lib/table/interface';
import moment from 'moment';
import * as React from 'react';
import { Link } from 'react-router-dom';

export interface IProps {
	actionTable?: (item: AuthorizationMachineDto, event: EventTable) => void;
	pagination: TablePaginationConfig | false;
	isLoadDone?: boolean;
	hasAction?: boolean;
	authorizationMachineListResult: AuthorizationMachineDto[],
	noScrool?: boolean;
	rowSelection?: TableRowSelection<AuthorizationMachineDto>;
	changeColumnSort?: (fieldSort: SorterResult<AuthorizationMachineDto> | SorterResult<AuthorizationMachineDto>[]) => void;
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
		const { pagination, authorizationMachineListResult, hasAction, rowSelection } = this.props
		let action: any = {
			title: "Chức năng", width: 90, key: "action_drink_index", className: "no-print", dataIndex: '', fixed: "right",
			render: (text: string, item: AuthorizationMachineDto) => (
				<div>
					<Button
						type="primary" icon={<EditOutlined />} title="Chỉnh sửa"
						style={{ marginLeft: '10px' }}
						size='small'
						onClick={() => this.onAction(item!, EventTable.Edit)}
					></Button>
					<Button
						danger icon={<DeleteFilled />} title="Xóa"
						style={{ marginLeft: '10px' }}
						size='small'
						onClick={() => this.onAction(item!, EventTable.Delete)}
					></Button>
				</div>
			)
		};

		const columns: ColumnsType<AuthorizationMachineDto> = [
			{ title: "STT", key: "stt_fresh_drink_index", width: 50, render: (text: string, item: AuthorizationMachineDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
			{
				title: "Mã máy", width: 110, key: "dr_code", render: (text: string, item: AuthorizationMachineDto) => <div>
					{this.props.actionTable != undefined ?
						<Link title={'Chi tiết máy ' + stores.sessionStore.getCodeMachines(item.ma_id)} target="_blank" to={"/general/machine/?machine=" + stores.sessionStore.getCodeMachines(item.ma_id)} onDoubleClick={() => this.onAction(item, EventTable.View)}>
							{stores.sessionStore.getCodeMachines(item.ma_id)}
						</Link> :
						<div>
							{stores.sessionStore.getCodeMachines(item.ma_id)}
						</div>
					}

				</div>
			},
			{
				title: "Tên máy",
				key: "dr_code",
				width: 200,
				ellipsis: { showTitle: true },
				render: (text: string, item: AuthorizationMachineDto) => (
					<div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
						<div title={stores.sessionStore.getNameMachines(item.ma_id)}>
							{this.props.actionTable != undefined ? (
								<Link target="blank" to={"/general/machine/?machine=" + stores.sessionStore.getCodeMachines(item.ma_id)}>
									{stores.sessionStore.getNameMachines(item.ma_id)}
								</Link>
							) : (
								<div>{stores.sessionStore.getNameMachines(item.ma_id)}</div>
							)}
						</div>
					</div>
				),
			},
			{ title: "Người được uỷ quyền", width: 130, key: "su_id", render: (text: number, item: AuthorizationMachineDto) => <div> {stores.sessionStore.getUserNameById(item.us_id_is_authorized)} </div> },
			{ title: "Loại uỷ quyền", width: 130, key: "au_ma_type", render: (text: number, item: AuthorizationMachineDto) => <div> {valueOfeAuthorizationMachineType(item.au_ma_type)} </div> },
			{ title: "Ngày uỷ quyền", width: 100, key: "au_ma_updated_at", dataIndex: "au_ma_updated_at", sorter: true, render: (text: number, item: AuthorizationMachineDto) => <div> {moment(item.au_ma_updated_at).format("DD/MM/YYYY HH:mm:ss")} </div> },
		];
		if (!!hasAction && hasAction == true) columns.push(action);

		return (
			<Table
				rowSelection={hasAction != undefined ? rowSelection : undefined}
				scroll={this.props.hasAction == false ? { x: undefined, y: undefined } : { x: 1000, y: window.innerHeight }}
				className='centerTable'
				onRow={(record, rowIndex) => {
					return {
						onDoubleClick: (event: any) => { this.onAction(record!, EventTable.RowDoubleClick) }
					};
				}}
				onChange={(a, b, sort: SorterResult<AuthorizationMachineDto> | SorterResult<AuthorizationMachineDto>[]) => {
					if (!!this.props.changeColumnSort) {
						this.props.changeColumnSort(sort);
					}
				}}
				columns={columns}
				size={'middle'}
				bordered={true}
				dataSource={authorizationMachineListResult.length > 0 ? authorizationMachineListResult : []}
				pagination={this.props.pagination}
				rowClassName={(record, index) => (this.state.au_ma_id === record.au_ma_id) ? "bg-click" : "bg-white"}
				rowKey={record => "drink_table" + JSON.stringify(record)}
			/>
		)
	}
}