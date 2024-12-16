import * as React from 'react';
import { Button, Table, } from 'antd';
import { DeleteFilled, } from '@ant-design/icons';
import { SupplierDto, } from '@services/services_autogen';
import { L } from '@lib/abpUtility';
import { EventTable } from '@src/lib/appconst';
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { SorterResult, TableRowSelection } from 'antd/lib/table/interface';
import Tabs from 'antd/lib/tabs';
import CreateOrUpdateSupplier from './CreateOrUpdateSupplier';

export interface IProps {
	actionTable?: (item: SupplierDto, event: EventTable) => void;
	supplierListResult: SupplierDto[],
	pagination: TablePaginationConfig | false;
	hasAction?: boolean;
	doId?: number;
	isPrint: boolean
	onCancel?: () => void;
	rowSelection?: TableRowSelection<SupplierDto>
	changeColumnSort?: (fieldSort: SorterResult<SupplierDto> | SorterResult<SupplierDto>[]) => void;
	onCreateUpdateSuccess?: () => void;
	checkExpand?: boolean;

}
export const tabManager = {
	tab_1: L("Thông tin"),
	tab_2: L('Lịch sử nhập trả hàng'),
	tab_3: L("Nợ cần trả NCC"),
}
export default class TableSupplier extends React.Component<IProps> {
	state = {
		isLoadDone: false,
		su_id_selected: undefined,
		expandedRowKey: [],
		selectedRowKey: null,
	};
	handleExpand = (expanded, record) => {
		if (expanded) {
			this.onCancel();
			this.setState({ expandedRowKey: [record.su_id] });
		} else {
			this.setState({ expandedRowKey: undefined });
		}
	};
	supplierSelected: SupplierDto = new SupplierDto();
	onAction = async (item: SupplierDto, action: EventTable) => {
		this.setState({ su_id_selected: item.su_id });
		const { hasAction, actionTable } = this.props;
		if (hasAction !== undefined && hasAction === true && actionTable !== undefined) {
			actionTable(item, action);
		}
	}
	onCreateUpdateSuccess = () => {
		if (!!this.props.onCreateUpdateSuccess) {
			this.props.onCreateUpdateSuccess();
		}
	}
	onCancel = () => {
		if (!!this.props.onCancel) {
			this.props.onCancel();
		}
	}
	render() {
		const { supplierListResult, pagination, hasAction, rowSelection } = this.props;
		const { expandedRowKey } = this.state;
		let action: ColumnGroupType<SupplierDto> = {
			title: 'Chức năng', children: [], key: 'action_Supplier_index', className: "no-print center", width: 100,
			render: (text: string, item: SupplierDto) => (
				<div >
					<Button
						danger icon={<DeleteFilled />} title={L('Xóa')}
						style={{ marginLeft: '10px' }}
						size='small'
						onClick={(e) => { e.stopPropagation(); this.onAction(item!, EventTable.Delete) }}
					></Button>
				</div>
			)
		};
		const columns: ColumnsType<SupplierDto> = [
			{ title: L('STT'), key: 'stt', width: 50, render: (text: string, item: SupplierDto, index: number) => <div>{pagination !== false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
			{ title: L('Tên nhà cung cấp'), sorter: true, dataIndex: 'su_name', key: 'su_name', width: 150, render: (text: string, item: SupplierDto) => <div>{item.su_name}</div> },
			{ title: L('Số điện thoại'), sorter: true, dataIndex: 'su_phone', key: 'su_phone', width: 150, render: (text: string, item: SupplierDto) => <div>{item.su_phone}</div> },
			{ title: L('Địa chỉ'), sorter: true, dataIndex: 'su_address', key: 'su_address', width: 150, render: (text: string, item: SupplierDto) => <div>{item.su_address}</div> },
			{ title: L('Email'), sorter: true, dataIndex: 'su_email', key: 'su_email', width: 150, render: (text: string, item: SupplierDto) => <div style={{width: "130px"}}>{item.su_email}</div> },
			{ title: L('Người liên hệ'), sorter: true, dataIndex: 'su_contact_person', key: 'su_contact_person', width: 150, render: (text: string, item: SupplierDto) => <div>{item.su_contact_person}</div> },
			// { title: L('Tổng mua'), sorter: true, dataIndex: 'su_contact_person', key: 'su_contact_person', width: 150, render: (text: string, item: SupplierDto) => <div>{item.su_contact_person}</div> },
			{ title: L('Ghi chú'), key: 'su_note', width: 150, render: (text: string, item: SupplierDto) => <div style={{width: "130px"}} dangerouslySetInnerHTML={{ __html: item.su_note! }}></div> },
		];
		if (hasAction !== undefined && hasAction === true) {
			columns.push(action);
		}
		return (
			<Table
				rowSelection={hasAction !== undefined ? rowSelection : undefined}
				onChange={(a, b, sort: SorterResult<SupplierDto> | SorterResult<SupplierDto>[]) => {
					if (!!this.props.changeColumnSort) {
						this.props.changeColumnSort(sort);
					}
				}}
				expandable={
					this.props.isPrint
						? {}
						: {
							expandedRowRender: (record) => (
								<>
									<Tabs defaultActiveKey={tabManager.tab_1}>
										<Tabs.TabPane tab={tabManager.tab_1} key={tabManager.tab_1}>
											<CreateOrUpdateSupplier
												onCreateUpdateSuccess={this.onCreateUpdateSuccess}
												onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
												supplierSelected={record}
												layoutDetail={true}
											/>
										</Tabs.TabPane>
										<Tabs.TabPane tab={tabManager.tab_2} key={tabManager.tab_2}></Tabs.TabPane>
										<Tabs.TabPane tab={tabManager.tab_3} key={tabManager.tab_3}></Tabs.TabPane>
									</Tabs>
								</>
							),
							expandRowByClick: true,
							expandIconColumnIndex: -1,
							expandedRowKeys: this.props.checkExpand == true ? [] : expandedRowKey,
							onExpand: this.handleExpand,
						}
				}
				scroll={this.props.isPrint == true ? { x: undefined, y: undefined } : { x: 1000, y: 500 }}
				className='centerTable'
				loading={this.state.isLoadDone}
				rowClassName={(record) => this.state.selectedRowKey === record.su_id ? "bg-click" : "bg-white"}
				onRow={(record) => ({
					onClick: () => {
						this.setState({ selectedRowKey: record.su_id });
					},
				})}
				rowKey={record => record.su_id}
				size={'middle'}
				bordered={true}
				locale={{ "emptyText": L('No Data') }}
				columns={columns}
				dataSource={supplierListResult.length > 0 ? supplierListResult : []}
				pagination={this.props.pagination}
			/>

		)
	}
}