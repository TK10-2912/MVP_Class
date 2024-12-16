import { DeleteFilled, EditOutlined, InfoCircleOutlined, } from '@ant-design/icons';
import { isGranted, L } from '@lib/abpUtility';
import { RfidDto, } from '@services/services_autogen';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { Button, Space, Switch, Table } from 'antd';
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { SorterResult, TableRowSelection } from 'antd/lib/table/interface';
import moment from 'moment';
import * as React from 'react';

export interface IProps {
	actionTable?: (item: RfidDto, event: EventTable, checked?) => void;
	RFIDListResult: RfidDto[],
	pagination: TablePaginationConfig | false;
	hasAction?: boolean;
	doId?: number;
	rowSelection?: TableRowSelection<RfidDto>
	export?: boolean;
	activateOrDeActive?: (item: RfidDto) => void;
	changeColumnSort?: (fieldSort: SorterResult<RfidDto> | SorterResult<RfidDto>[]) => void;
}
export default class TableRFIDUser extends React.Component<IProps> {
	state = {
		isLoadDone: false,
		rf_id_selected: undefined,
	};

	onAction = async (item: RfidDto, action: EventTable, checked?: boolean) => {
		this.setState({ rf_id_selected: item.rf_id });
		const { hasAction, actionTable } = this.props;
		if (hasAction != undefined && hasAction === true && actionTable !== undefined) {
			actionTable(item, action, checked);
		}
	}
	activateOrDeActive = (item: RfidDto) => {
		if (!!this.props.activateOrDeActive) {
			this.props.activateOrDeActive(item);
		}
	}

	render() {
		const { RFIDListResult, pagination, hasAction, rowSelection } = this.props;
		let action: ColumnGroupType<RfidDto> = {
			title: 'Chức năng', children: [], key: 'action_Supplier_index', className: "no-print center", width: 150,
			render: (text: string, item: RfidDto) => (
				<Space>
					<Button
						type="primary" icon={<InfoCircleOutlined />} title={L('Lịch sử giao dịch')}
						size='small'
						onClick={() => this.onAction(item!, EventTable.History)}
					></Button>
					{isGranted(AppConsts.Permission.Pages_Manager_General_RFID_Delete) &&
						<Button
							danger icon={<DeleteFilled />} title={L('Delete')}
							size='small'
							onClick={() => this.onAction(item!, EventTable.Delete)}
						></Button>
					}
				</Space>
			)
		};
		const columns: ColumnsType<RfidDto> = [
			{ title: L('STT'), key: 'stt', width: 50, render: (text: string, item: RfidDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
			{ title: L('Mã RFID'), sorter: true, dataIndex: 'rf_code', key: 'rf_code',  render: (text: string, item: RfidDto) => <div>{item.rf_code}</div> },
			// { title: L('Người sở hữu'), sorter: true, dataIndex: 'us_id_owner', key: 'su_desc', render: (text: string, item: RfidDto) => <div> {stores.sessionStore.getUserNameById(item.us_id_owner)}</div> },
			{ title: L('Số tiền hiện tại (VNĐ)'), sorter: true, dataIndex: 'rf_money_current', key: 'rf_money_current', render: (text: string, item: RfidDto) => <div> {AppConsts.formatNumber(item.rf_money_current)}</div> },
			{ title: L('Số tiền khuyến mãi (VNĐ)'), sorter: true, dataIndex: 'rf_money_current_sale', key: 'rf_money_current_sale', render: (text: string, item: RfidDto) => <div> {AppConsts.formatNumber(item.rf_money_current_sale)}</div> },
			{ title: L('Ngày tạo'), sorter: true, dataIndex: 'rf_created_at', key: 'rf_created_at', render: (text: string, item: RfidDto) => <div> {moment(item.rf_created_at).format("DD/MM/YYYY - HH:mm:ss")}</div> },
			{
				title: 'Kích hoạt', dataIndex: 'isActive', key: 'isActive', 
				render: (text: string, item: RfidDto) =>
					<>
						{this.props.export ?
							item.rf_is_active == true ? "Đang kích hoạt" : "Chưa kích hoạt"
							:
							<>
								<Switch checked={item.rf_is_active} onClick={(checked: boolean) => this.onAction(item, EventTable.ChangeStatus, checked)}></Switch>
							</>
						}
					</>
			},

		];
		if (hasAction != undefined && hasAction === true) {
			columns.push(action);
		}
		return (
			<Table
				className='centerTable'
				loading={this.state.isLoadDone}
				scroll={this.props.hasAction === false ? { x: undefined, y: undefined } : { x: 1000, y: window.innerHeight }}
				rowSelection={hasAction != undefined ? rowSelection : undefined}
				rowClassName={(record, index) => (this.state.rf_id_selected === record.rf_id) ? "bg-click" : "bg-white"}
				rowKey={record => "supplier__" + JSON.stringify(record)}
				size={'middle'}
				bordered={true}
				locale={{ "emptyText": L('No Data') }}
				columns={columns}
				dataSource={RFIDListResult.length > 0 ? RFIDListResult : []}
				pagination={this.props.pagination}
				onChange={(a, b, sort: SorterResult<RfidDto> | SorterResult<RfidDto>[]) => {
					if (!!this.props.changeColumnSort) {
						this.props.changeColumnSort(sort);
					}
				}}
			/>
		)
	}
}