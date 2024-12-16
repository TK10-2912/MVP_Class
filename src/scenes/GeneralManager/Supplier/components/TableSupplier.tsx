import * as React from 'react';
import { Button, Col, Modal, Row, Space, Table, Tag, } from 'antd';
import { DeleteFilled, } from '@ant-design/icons';
import { ReconcileSupplierDebtDto, SupplierDto, } from '@services/services_autogen';
import { isGranted, L } from '@lib/abpUtility';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { SorterResult, TableRowSelection } from 'antd/lib/table/interface';
import Tabs from 'antd/lib/tabs';
import CreateOrUpdateSupplier from './CreateOrUpdateSupplier';
import TableImportDetailRepositorySupplier from './TableImportDetailRepository';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { stores } from '@src/stores/storeInitializer';
import TableReconcileDebt from '@src/scenes/Reconsile/ReconcileDebt/components/TableReconcileDebt';
import TableReconcileDebtSupplier from './TableReconcileDebtSupplier';
import PaymentSupplierDebt from './PaymentSupplierDebt';
import SupplierLogPayment from '../../LogSupplierDebt';
import moment from 'moment';
import SupplierTableFooter from './SupplierTableFooter';

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
	handleExpand?: (expanded, record) => void;
}
export const tabManager = {
	tab_1: L("Thông tin"),
	tab_2: L('Lịch sử nhập hàng'),
	tab_3: L("Nợ cần trả NCC"),
}
export default class TableSupplier extends AppComponentBase<IProps> {
	state = {
		isLoadDone: false,
		su_id_selected: undefined,
		expandedRowKey: [],
		selectedRowKey: undefined,
		visiblePayment: false,
		visibleHistory: false,
	};
	reconcileDebt: ReconcileSupplierDebtDto = new ReconcileSupplierDebtDto();
	listDebtReconcile: ReconcileSupplierDebtDto[] = [];
	supplierSelected: SupplierDto = new SupplierDto();

	handleExpand = (expanded, record) => {
		if (expanded) {
			this.onCancel();
			this.setState({ isLoadDone: false });
			this.supplierSelected.init(record);
			const { reconcileDebtSupplierDto } = stores.reconcileStore;
			this.listDebtReconcile = reconcileDebtSupplierDto.filter(item => item.su_id === record.su_id);
			this.setState({ expandedRowKey: [record.su_id] });
			this.setState({ selectedRowKey: record.su_id });
			this.setState({ isLoadDone: true });
		} else {
			this.setState({ selectedRowKey: undefined });
			this.setState({ expandedRowKey: undefined });
		}
	};

	onAction = async (item: SupplierDto, action: EventTable) => {
		this.setState({ su_id_selected: item.su_id });
		const { hasAction, actionTable } = this.props;
		if (hasAction !== undefined && hasAction === true && actionTable !== undefined) {
			actionTable(item, action);
		}
	}
	onCreateUpdateSuccess = async () => {
		this.setState({ isLoadDone: false });
		if (!!this.props.onCreateUpdateSuccess) {
			this.setState({ visiblePayment: false })
			const { reconcileDebtSupplierDto } = stores.reconcileStore;
			this.listDebtReconcile = await reconcileDebtSupplierDto.filter(item => item.su_id === this.supplierSelected.su_id);
			this.props.onCreateUpdateSuccess();
		}
		this.setState({ isLoadDone: true });
	}
	onCancel = () => {
		if (!!this.props.onCancel) {
			this.props.onCancel();
		}
	}
	actionTableReconcileBank = async (reconcile: ReconcileSupplierDebtDto, event: EventTable, checked?: boolean) => {
		if (event === EventTable.Accept) {
			this.reconcileDebt.init(reconcile);
			this.setState({ visiblePayment: true })
		}
		if (event === EventTable.History) {
			this.setState({ visibleHistory: true })
		}
	}

	render() {
		const { supplierListResult, pagination, hasAction, rowSelection } = this.props;
		const { expandedRowKey } = this.state;
		let action: ColumnGroupType<SupplierDto> = {
			title: 'Chức năng', fixed: 'right', children: [], key: 'action_Supplier_index', className: "no-print center", width: 100,
			render: (text: string, item: SupplierDto) => (
				<Space>
					{isGranted(AppConsts.Permission.Pages_Manager_General_Supplier_Delete) &&
						<Button
							danger icon={<DeleteFilled />} title={L('Xóa')}
							size='small'
							onClick={(e) => { e.stopPropagation(); this.onAction(item!, EventTable.Delete) }}
						></Button>
					}
				</Space>
			)
		};
		const columns: ColumnsType<SupplierDto> = [
			{ title: L('STT'), key: 'stt', width: 50, render: (text: string, item: SupplierDto, index: number) => <div>{pagination !== false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
			{ title: L('Mã nhà cung cấp'), dataIndex: 'su_code', key: 'su_code', sorter: true, width: 150, render: (text: string, item: SupplierDto) => <div>{item.su_code}</div> },
			{ title: L('Tên nhà cung cấp'), dataIndex: 'su_name', key: 'su_name', width: 150, render: (text: string, item: SupplierDto) => <div>{item.su_name}</div> },
			{ title: L('Số điện thoại'), dataIndex: 'su_phone', key: 'su_phone', width: 150, render: (text: string, item: SupplierDto) => <div>{item.su_phone}</div> },
			{ title: L('Địa chỉ'), dataIndex: 'su_address', key: 'su_address', width: 150, render: (text: string, item: SupplierDto) => <div>{item.su_address}</div> },
			{ title: L('Tổng tiền nhập hàng'), sorter: true, dataIndex: 'su_total_money_import', key: 'su_addresu_total_money_importss', width: 150, render: (text: string, item: SupplierDto) => <div>{AppConsts.formatNumber(item.su_total_money_import)}đ</div> },
			{ title: L('Tổng tiền đã trả'), sorter: true, dataIndex: 'su_total_money_import', key: 'su_addresu_total_money_importss', width: 150, render: (text: string, item: SupplierDto) => <div>{AppConsts.formatNumber(item.su_total_money_import - item.su_debt)}đ</div> },
			{ title: L('Tiền nợ nhà cung cấp'), sorter: true, dataIndex: 'su_debt', key: 'su_debt', width: 150, render: (text: string, item: SupplierDto) => <div>{AppConsts.formatNumber(item.su_debt)}đ</div> },
			{
				title: L('Trạng thái'), dataIndex: 'su_address', key: 'su_address', width: 150, render: (text: string, item: SupplierDto) => <div>{
					this.props.isPrint == true ?
						<>
							{item.su_is_active == true ? 'Đang hoạt động' : 'Ngưng hoạt động'}
						</>
						:
						<>
							{item.su_is_active == true ?
								<Tag color='success'>Đang hoạt động</Tag>
								:
								<Tag color="red">Ngưng hoạt động</Tag>}
						</>

				}</div>
			},

			// { title: L('Email'), dataIndex: 'su_email', key: 'su_email', width: 150, render: (text: string, item: SupplierDto) => <div>{item.su_email}</div> },
			// { title: L('Người liên hệ'), dataIndex: 'su_contact_person', key: 'su_contact_person', width: 150, render: (text: string, item: SupplierDto) => <div>{item.su_contact_person}</div> },
			// { title: L('Ngày tạo'), dataIndex: 'su_created_at', key: 'su_created_at', sorter: true, width: 150, render: (text: string, item: SupplierDto) => <div>{moment(item.su_created_at).format("DD/MM/YYYY")}</div> },
			// { title: L('Ghi chú'), key: 'su_note', width: 150, render: (text: string, item: SupplierDto) => <div dangerouslySetInnerHTML={{ __html: item.su_note! }}></div> },
		];
		if (hasAction !== undefined && hasAction === true && isGranted(AppConsts.Permission.Pages_Manager_General_Supplier_Delete)) {
			columns.push(action);
		}
		return (
			<>
				<Table
					rowSelection={hasAction !== undefined ? rowSelection : undefined}
					expandable={
						this.props.isPrint
							? {}
							: {
								expandedRowRender: (record) => (
									<>
										<Tabs defaultActiveKey={tabManager.tab_1}>
											<Tabs.TabPane tab={tabManager.tab_1} key={tabManager.tab_1}>
												<CreateOrUpdateSupplier
													suppilerListResult={supplierListResult}
													onCreateUpdateSuccess={this.onCreateUpdateSuccess}
													onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
													supplierSelected={record}
													layoutDetail={true}
												/>
											</Tabs.TabPane>
											<Tabs.TabPane tab={tabManager.tab_2} key={tabManager.tab_2}>
												<TableImportDetailRepositorySupplier su_id={record.su_id} />
											</Tabs.TabPane>
											{/* <Tabs.TabPane tab={tabManager.tab_3} key={tabManager.tab_3}>
												<TableReconcileDebtSupplier actionTable={this.actionTableReconcileBank} listReconsile={this.listDebtReconcile} hasAction={true} pagination={false} />
											</Tabs.TabPane> */}
										</Tabs>
									</>
								),
								expandRowByClick: true,
								expandIconColumnIndex: -1,
								expandedRowKeys: this.props.checkExpand == true ? [] : expandedRowKey,
								onExpand: isGranted(AppConsts.Permission.Pages_Manager_General_Supplier_Update) ? this.handleExpand : () => { },
							}
					}
					onChange={(a, b, sort: SorterResult<SupplierDto> | SorterResult<SupplierDto>[]) => {
						if (!!this.props.changeColumnSort) {
							this.props.changeColumnSort(sort);
						}
					}}
					scroll={this.props.isPrint == true ? { x: undefined, y: undefined } : { x: 1250 }}
					className='centerTable'
					rowClassName={(record) => this.state.selectedRowKey === record.su_id ? "bg-lightGreen" : "bg-white"}
					rowKey={record => record.su_id}
					size={'middle'}
					bordered={true}
					
					columns={columns}
					dataSource={supplierListResult.length > 0 ? supplierListResult : []}
					pagination={this.props.pagination}
					footer={() => (<SupplierTableFooter
						supplierListResult={this.props.supplierListResult}
					/>)
					}
				/>
				{
					this.state.visiblePayment &&
					<Modal
						visible={this.state.visiblePayment}
						onCancel={() => { this.setState({ visiblePayment: false }) }}
						closable={true}
						maskClosable={false}
						footer={false}
						width={"60%"}
					>
						<PaymentSupplierDebt onCancel={() => this.setState({ visiblePayment: false })} onSuccess={() => this.onCreateUpdateSuccess()} debt_money={this.reconcileDebt.rec_remain_supplier_debt} su_id={this.reconcileDebt.su_id} />
					</Modal>
				}
				{
					this.state.visibleHistory &&
					<Modal
						visible={this.state.visibleHistory}
						onCancel={() => { this.setState({ visibleHistory: false }) }}
						closable={true}
						maskClosable={false}
						title={`Lịch sử thanh toán công nợ của nhà cung cấp "${this.supplierSelected.su_name}"`}
						footer={false}
						width={"60%"}
					>
						<SupplierLogPayment supplierSelected={this.supplierSelected} />
					</Modal>
				}

			</>
		)
	}
}