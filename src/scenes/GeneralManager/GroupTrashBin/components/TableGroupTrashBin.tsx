import {
	ClusterOutlined,
	DeleteFilled,
	DeleteOutlined,
	EditOutlined,
	ExportOutlined,
	WarningOutlined,
} from '@ant-design/icons';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { isGranted } from '@src/lib/abpUtility';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { GroupTrashbinDto } from '@src/services/services_autogen';
import { Modal, Badge, Button, Col, message, Popover, Row, Table } from 'antd';

import { ColumnGroupType, ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import React from 'react';
import TrashBin from '../../TrashBin';
import { TableRowSelection } from 'antd/lib/table/interface';
import L from 'leaflet';
import { stores } from '@src/stores/storeInitializer';
const { confirm } = Modal;
export interface IProps {
	groupTrashBinListResult?: GroupTrashbinDto[];
	pagination: TablePaginationConfig | false;
	hasAction?: boolean;
	actionTable?: (item: GroupTrashbinDto, event: EventTable) => void;
}
export default class TableGroupTrashBin extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		visibleModalCreateUpdate: false,
		gr_tr_id_selected: undefined,
		visibleModalListTrashBin: false,
		numberSelected: 0,
		clicked: false,
		skipCount: 0,
		currentPage: 1,
		pageSize: 10,

	};
	GroupTrashbinSelected: GroupTrashbinDto = new GroupTrashbinDto();
	keySelected: number[] = [];
	listTrashBin: GroupTrashbinDto[] = [];
	rowSelection: TableRowSelection<GroupTrashbinDto> = {
		onChange: async (listItemProduct: React.Key[], listGroupTrashBin: GroupTrashbinDto[]) => {
			this.setState({ isLoadDone: false });
			this.listTrashBin = listGroupTrashBin;
			this.keySelected = listGroupTrashBin.map((item) => item.gr_tr_id);
			await this.setState({ select: !!this.listTrashBin.length });
			this.setState({ isLoadDone: true, numberSelected: listGroupTrashBin.length });
		},
	};

	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.groupTrashBinStore.getAll(
			this.GroupTrashbinSelected.gr_tr_name,
			this.state.skipCount,
			undefined
		);
		this.setState({ isLoadDone: true });
	}
	onChangePage = async (page: number, pagesize?: number) => {
		if (pagesize !== undefined) {
			await this.setState({ pageSize: pagesize! });
		}
		await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
			this.getAll();
		})
	}

	onAction = (item: GroupTrashbinDto, action: EventTable) => {
		this.setState({ gr_tr_id_selected: item.gr_tr_id });
		const { actionTable } = this.props;
		if (actionTable !== undefined) {
			actionTable(item, action);
		}
		if (action == EventTable.View) {
			this.setState({ visibleModalListTrashBin: true });
			this.GroupTrashbinSelected = item;
		}
	};
	handleVisibleChange = (visible) => {
		this.setState({ clicked: visible });
	};

	deleteMulti = async (listIdTrashBin: number[]) => {
		if (listIdTrashBin.length < 1) {
			await message.warning(("Hãy chọn 1 hàng trước khi xoá"));
		}
		else {
			const self = this;
			const { totalGroupTrashBin } = stores.groupTrashBinStore;
			confirm({
				icon: false,
				title: <span><WarningOutlined style={{ fontSize: "23px", color: "orange" }} /> Bạn có muốn <span style={{ color: "red" }}>xóa hàng loạt</span> {listIdTrashBin.length} dữ liệu ? Thao tác này khi xác nhận <span style={{ color: "red" }}>không thể hoàn tác</span>.</span>,
				okText: ('Xác nhận'),
				cancelText: ('Huỷ'),
				async onOk() {
					if (self.state.currentPage > 1 && (totalGroupTrashBin - self.keySelected.length) % 10 == 0) self.onChangePage(self.state.currentPage - 1, self.state.pageSize)
					await stores.groupTrashBinStore.deleteMulti(listIdTrashBin);
					self.keySelected = [];
					await self.getAll();
					stores.sessionStore.getCurrentLoginInformations();
					self.setState({ isLoadDone: true, numberSelected: 0 });
					message.success(("Xoá thành công") + "!")
				},
				onCancel() {
				},
			});
		}
	}
	deleteAll() {
		let self = this;
		let titleConfirm = (
			<div>
				<div style={{ color: 'orange', textAlign: 'center', fontSize: '23px' }}>
					<WarningOutlined style={{}} /> Cảnh báo
				</div>{' '}
				<br />
				<span>
					{' '}
					Bạn có muốn <span style={{ color: 'red' }}>xóa tất cả</span> dữ liệu ? Thao tác này khi
					xác nhận <span style={{ color: 'red' }}>không thể hoàn tác</span>.
				</span>
			</div>
		);
		let cancelText = <div style={{ color: 'red' }}>Hủy</div>;
		this.setState({ isLoadDone: false });
		confirm({
			icon: false,
			title: titleConfirm,
			okText: 'Xác nhận',
			cancelText: cancelText,
			async onOk() {
				await stores.groupTrashBinStore.deleteAll();
				stores.sessionStore.getCurrentLoginInformations();
				await self.getAll();
				message.success('Xóa thành công');
			},
			onCancel() { },
		});
		this.setState({ isLoadDone: true });
	}
	hide = () => {
		this.setState({ clicked: false });
	};

	render() {
		const { hasAction, pagination } = this.props;
		const { groupTrashBinListResult } = stores.groupTrashBinStore;
		let action: ColumnGroupType<GroupTrashbinDto> = {
			title: 'Chức năng',
			children: [],
			key: 'action_member_index',
			className: 'no-print center',
			width: 150,
			render: (text: string, item: GroupTrashbinDto) => (
				<div>
					{isGranted(AppConsts.Permission.Pages_Manager_General_GroupMachine_Update) && (
						<Button
							type="primary"
							icon={<EditOutlined />}
							title={'Chỉnh sửa'}
							size="small"
							style={{ marginLeft: '10px', marginTop: '5px' }}
							onClick={() => this.onAction(item, EventTable.Edit)}
						></Button>
					)}
					<Button
						type="primary"
						icon={<ClusterOutlined />}
						title={'Danh sách thùng rác thuộc nhóm: ' + item.gr_tr_name}
						size="small"
						style={{ marginLeft: '10px', marginTop: '5px' }}
						onClick={() => this.onAction(item, EventTable.View)}
					></Button>
					{isGranted(AppConsts.Permission.Pages_Manager_General_GroupMachine_Delete) && (
						<Button
							danger
							icon={<DeleteFilled />}
							title={'Xoá'}
							size="small"
							style={{ marginLeft: '10px', marginTop: '5px' }}
							onClick={() => this.onAction(item, EventTable.Delete)}
						></Button>
					)}
				</div>
			),
		};
		const columns: ColumnsType<GroupTrashbinDto> = [
			{
				title: 'STT',
				key: 'stt_machine_index',
				width: 50,
				fixed: 'left',
				render: (text: string, item: GroupTrashbinDto, index: number) => (
					<div>
						{pagination !== false
							? pagination.pageSize! * (pagination.current! - 1) + (index + 1)
							: index + 1}
					</div>
				),
			},
			{
				title: 'Nhóm thùng rác',
				dataIndex: '',
				key: 'gr_tr_name',
				render: (text: string, item: GroupTrashbinDto, index: number) => (
					<div>{item.gr_tr_name}</div>
				),
			},
			{
				title: 'Mô tả',
				width: '60%',
				key: 'gr_tr_desc',
				render: (text: string, item: GroupTrashbinDto) => (
					<div dangerouslySetInnerHTML={{ __html: item.gr_tr_desc! }}></div>
				),
			},
		];

		if (hasAction !== undefined && hasAction === true) {
			columns.push(action);
		}

		return (
			<>
				{this.props.hasAction == true &&
					<Col span={12}>
						<Badge count={this.state.numberSelected}>
							<Popover
								style={{ width: 200 }}
								visible={this.state.clicked}
								onVisibleChange={(e) => this.handleVisibleChange(e)}
								placement="right"
								content={
									<>
										{this.keySelected.length > 0 ? (
											<>
												{isGranted(AppConsts.Permission.Pages_Manager_General_Product_Delete) && (
													<Row style={{ alignItems: 'center', marginTop: '10px' }}>
														<Button
															danger
															icon={<DeleteFilled />}
															title={'Delete'}
															style={{ marginLeft: '10px' }}
															size="small"
															onClick={() => {
																this.deleteMulti(this.keySelected);
																this.hide();
															}}
														></Button>
														<a
															style={{ paddingLeft: '10px', color: 'red' }}
															onClick={() => {
																this.deleteMulti(this.keySelected);
																this.hide();
															}}
														>
															{'Xóa hàng loạt'}
														</a>
													</Row>
												)}
											</>
										) : (
											<></>
										)}
										{isGranted(AppConsts.Permission.Pages_Manager_General_Product_Export) && (
											<Row style={{ alignItems: 'center', marginTop: '10px' }}>
												<Button
													type="primary"
													icon={<ExportOutlined />}
													title={'Xuất dữ liệu'}
													style={{ marginLeft: '10px' }}
													size="small"
													onClick={async () => {
														if (this.keySelected.length < 1) {
															await message.warning('Hãy chọn một hàng muốn xuất dữ liệu');
														} else {
															await this.setState({
																select: true,
																visibleExportExcelFreshDrink: true,
															});
														}
													}}
												></Button>
												<a
													style={{ paddingLeft: '10px' }}
													onClick={async () => {
														if (this.keySelected.length < 1) {
															await message.warning('Hãy chọn một hàng muốn xuất dữ liệu');
														} else {
															await this.setState({
																select: true,
																visibleExportExcelFreshDrink: true,
															});
														}
													}}
												>
													{'Xuất dữ liệu'}
												</a>
											</Row>
										)}
										{isGranted(AppConsts.Permission.Pages_Manager_General_Product_Delete) &&
											this.keySelected.length < 1 && (
												<Row style={{ alignItems: 'center', marginTop: '10px' }}>
													<Button
														type="primary"
														danger
														icon={<DeleteOutlined />}
														title={'Xoá tất cả'}
														style={{ marginLeft: '10px' }}
														size="small"
														onClick={async () => {
															await this.deleteAll();
														}}
													></Button>
													<a
														style={{ paddingLeft: '10px', color: 'red' }}
														onClick={async () => {
															await this.deleteAll();
														}}
													>
														{'Xoá tất cả'}
													</a>
												</Row>
											)}
									</>
								}
								trigger={['hover']}
							>
								<Button type="primary">Thao tác hàng loạt</Button>
							</Popover>
						</Badge>
					</Col>
				}
				{ !this.state.visibleModalListTrashBin && <Table
					rowSelection={this.rowSelection}
					className="centerTable"
					onRow={(record) => {
						return {
							onDoubleClick: () => {
								this.onAction(record, EventTable.RowDoubleClick);
							},
						};
					}}
					rowClassName={
						(record) => (record.gr_tr_id ? 'text-black' : 'text-red') 
					}
					loading={!this.state.isLoadDone}
					rowKey={(record) => 'quanlymaybannuoc_index__' + JSON.stringify(record)}
					size="middle"
					bordered
					columns={columns}
					dataSource={groupTrashBinListResult}
					pagination={this.props.pagination}
				/>}
				{this.state.visibleModalListTrashBin ? (
					<Modal
						visible={this.state.visibleModalListTrashBin}
						onCancel={() => this.setState({ visibleModalListTrashBin: false })}
						footer={false}
						title={
							<Row>
								Danh sách thùng rác của nhóm &nbsp;<b>{this.GroupTrashbinSelected.gr_tr_name}</b>
							</Row>
						}
						width={'80%'}
					>
						<TrashBin GroupTrashBinSelected={this.GroupTrashbinSelected} isModal={true} />
					</Modal>
				) : (
					<></>
				)}
			</>
		);
	}
}
