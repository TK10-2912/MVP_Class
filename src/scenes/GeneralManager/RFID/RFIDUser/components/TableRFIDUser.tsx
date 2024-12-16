import { DeleteFilled, EditOutlined, InfoCircleOutlined, } from '@ant-design/icons';
import { isGranted, L } from '@lib/abpUtility';
import { RfidDto, } from '@services/services_autogen';
import AppConsts, { cssColResponsiveSpan, EventTable } from '@src/lib/appconst';
import { Button, Col, Row, Space, Switch, Table } from 'antd';
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
		const totalRfidActive = RFIDListResult.filter(item => item.rf_is_active == true);
		const totalRfidUnActive = RFIDListResult.filter(item => item.rf_is_active !== true);
		let action: ColumnGroupType<RfidDto> = {
			title: L('Action'), children: [], key: 'action_Supplier_index', className: "no-print center", width: 150,
			render: (text: string, item: RfidDto) => (
				<Space>
					<Button
						type="primary" icon={<InfoCircleOutlined />} title={L('Lịch sử giao dịch')}
						size='small'
						onClick={() => this.onAction(item!, EventTable.History)}
					></Button>
					{isGranted(AppConsts.Permission.Pages_Manager_General_RFID_Delete) &&
						<Button
							danger icon={<DeleteFilled />} title={L('Xóa')}
							size='small'
							onClick={() => this.onAction(item!, EventTable.Delete)}
						></Button>
					}
				</Space>
			)
		};
		const columns: ColumnsType<RfidDto> = [
			{ title: L('STT'), key: 'stt', width: 50, render: (text: string, item: RfidDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
			{ title: L('Mã thẻ'), sorter: (this.props.export ? false : true), dataIndex: 'rf_code', key: 'rf_code', render: (text: string, item: RfidDto) => <div>{item.rf_code}</div> },
			// { title: L('Người sở hữu'), sorter: (this.props.export?false:true), dataIndex: 'us_id_owner', key: 'su_desc', render: (text: string, item: RfidDto) => <div> {stores.sessionStore.getUserNameById(item.us_id_owner)}</div> },
			{ title: L('Số dư hiện tại (VNĐ)'), sorter: (this.props.export ? false : true), dataIndex: "rf_money_current", key: 'rf_money_current', render: (text: string, item: RfidDto) => <div> {AppConsts.formatNumber(item.rf_money_current)}</div> },
			{ title: L('Số tiền khuyến mãi (VNĐ)'), sorter: (this.props.export ? false : true), dataIndex: 'rf_money_current_sale', key: 'rf_money_current_sale', render: (text: string, item: RfidDto) => <div> {AppConsts.formatNumber(item.rf_money_current_sale)}</div> },
			{ title: L('Ngày tạo'), sorter: (this.props.export ? false : true), dataIndex: 'rf_created_at', key: 'rf_created_at', render: (text: string, item: RfidDto) => <div> {moment(item.rf_created_at).format("DD/MM/YYYY - HH:mm:ss")}</div> },
			{
				title: 'Kích hoạt', dataIndex: 'isActive', key: 'isActive', width: this.props.hasAction == true ? 150 : 0,
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
				
				columns={columns}
				dataSource={RFIDListResult.length > 0 ? RFIDListResult : []}
				pagination={this.props.pagination}
				onChange={(a, b, sort: SorterResult<RfidDto> | SorterResult<RfidDto>[]) => {
					if (!!this.props.changeColumnSort) {
						this.props.changeColumnSort(sort);
					}
				}}
				footer={
					() => <Row id='tableRFIDAdmin'>
						<Col {...cssColResponsiveSpan(24, 24, 8, 8, 8, 8)} style={{ border: '1px solid #e4e1e1', padding: 15, }}>
							<span>Tổng thẻ: <strong style={{ color: '#1DA57A' }}>{RFIDListResult.length}</strong></span>
							<br />
							<span>Tổng thẻ đã kích hoạt: <strong style={{ color: '#1DA57A' }}>{AppConsts.formatNumber(totalRfidActive.length)}</strong></span>
							<br />
							<span>Tổng thẻ chưa kích hoạt: <strong style={{ color: '#1DA57A' }}>{AppConsts.formatNumber(totalRfidUnActive.length)}</strong></span>
						</Col>
						<Col {...cssColResponsiveSpan(24, 24, 8, 8, 8, 8)} style={{ border: '1px solid #e4e1e1', padding: 15, }}>
							<span style={{ color: "green" }}> <b> Đã kích hoạt</b></span>
							<br />
							<span>Tổng tiền: <strong style={{ color: '#1DA57A' }}>{AppConsts.formatNumber(totalRfidActive.reduce((total, record) =>
								total + record.rf_money_current, 0
							))}đ</strong></span>
							<br />
							<span>Tổng tiền khuyến mãi: <strong style={{ color: '#1DA57A' }}>{AppConsts.formatNumber(totalRfidActive.reduce((total, record) =>
								total + record.rf_money_current_sale, 0
							))}đ</strong></span>
						</Col>
						<Col {...cssColResponsiveSpan(24, 24, 8, 8, 8, 8)} style={{ border: '1px solid #e4e1e1', padding: 15, }}>
							<span style={{ color: "red" }}> <b> Chưa kích hoạt</b></span>
							<br />
							<span>Tổng tiền: <strong style={{ color: '#1DA57A' }}>{AppConsts.formatNumber(totalRfidUnActive.reduce((total, record) =>
								total + record.rf_money_current, 0
							))}đ</strong></span>
							<br />
							<span>Tổng tiền khuyến mãi: <strong style={{ color: '#1DA57A' }}>{AppConsts.formatNumber(totalRfidUnActive.reduce((total, record) =>
								total + record.rf_money_current_sale, 0
							))}đ</strong></span>
						</Col>
					</Row>
				}
			/>
		)
	}
}