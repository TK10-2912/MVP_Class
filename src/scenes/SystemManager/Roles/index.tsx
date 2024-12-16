import * as React from 'react';
import { Button, Card, Col, Input, Modal, Row, Skeleton, Table, message } from 'antd';
import CreateOrUpdateRole from './components/FormCreateOrUpdateRole';
import { L } from '@lib/abpUtility';
import { DeleteFilled, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import AppConsts, { pageSizeOptions, RouterPath } from '@lib/appconst';
import { stores } from '@stores/storeInitializer';
import { TablePaginationConfig } from 'antd/lib/table';
import { RoleDto } from '@src/services/services_autogen';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import HistoryHelper from '@src/lib/historyHelper';
import PassWordLevel2 from '../Users/components/PassWordLevel2';
import PassWord from '../Users/components/PassWord';

const confirm = Modal.confirm;

export default class Role extends AppComponentBase {
	state = {
		isLoadDone: false,
		modalCreateUpdate: false,
		modalChangePassWord: false,
		pageSize: 10,
		skipCount: 0,
		currentPage: 1,
		roleId: 0,
		filter: '',
		visiblePassWordModalOpen: false,
		isCheckPassword2: false,
		hasPasswordLever2: false,
	};
	roleSelected: RoleDto = new RoleDto();

	async componentDidMount() {
		const sessionData = await stores.sessionStore.currentLogin
		this.setState({ hasPasswordLever2: sessionData.user.hasPassword2 })
		await this.setState({ isCheckPassword2: true, visiblePassWordModalOpen: true });
	}

	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.roleStore.getAll(this.state.filter, this.state.skipCount, this.state.pageSize);
		this.setState({ isLoadDone: true, modalCreateUpdate: false, modalChangePassWord: false });
	}

	handleTableChange = (pagination: TablePaginationConfig) => {
		this.setState({ skipCount: (pagination.current! - 1) * this.state.pageSize! }, async () => await this.getAll());
	};

	delete = (item: RoleDto) => {
		let self = this;
		confirm({
			title: (L('Thông báo')),
			content:
				<span>Các bạn có muốn xóa vai trò <b>{item.displayName}</b>?</span>,
			async onOk() {
				self.setState({ isLoadDone: false });
				await stores.roleStore.delete(item.id);
				await self.getAll();
				message.success(L("Xóa thành công"));
				self.setState({ isLoadDone: true });
			},
			onCancel() {
			},
		});
	}

	createOrUpdateModalOpen = async (inputRole: RoleDto) => {
		if (inputRole !== undefined && inputRole !== null) {
			await this.setState({ isLoadDone: false });
			this.roleSelected = inputRole;
			await this.setState({isLoadDone: true, modalCreateUpdate: true, modalChangePassWord: false });
		}
	}
	async changePassWordModalOpen(inputRole: RoleDto) {
		this.roleSelected = inputRole;
		await this.setState({ modalChangePassWord: true, modalCreateUpdate: false });
	}

	handleSubmitSearch = async () => {
		this.onChangePage(1, 10);
	};

	onChangePage = async (page: number, pageSize?: number) => {
		if (pageSize !== undefined) {
			await this.setState({ pageSize: pageSize });
		}
		await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page, pageSize: this.state.pageSize });
		await this.getAll()
	};


	onsavePassWord = async (val: boolean) => {
		if (val != undefined && val == true) {
			this.setState({ filter: undefined })
			await this.getAll();
			this.setState({ checkModal: true, visiblePassWordModalOpen: false });
		} else {
			Modal.error({ title: ("Thông báo"), content: ("Không được truy cập") });
			HistoryHelper.redirect(RouterPath.admin_home);
		}
	}

	onCancelUsersPassWord = () => {
		this.setState({ visiblePassWordModalOpen: false });
		if (this.state.isCheckPassword2 == true) {
			HistoryHelper.redirect(RouterPath.admin_home);
		}
	}
	public render() {

		const left = this.state.modalCreateUpdate ? AppConsts.cssPanel(12) : AppConsts.cssPanel(24);
		const right = this.state.modalCreateUpdate ? AppConsts.cssPanel(12) : AppConsts.cssPanel(0);
		const { roles } = stores.roleStore;
		const columns: any = [
			{ title: L('STT'), dataIndex: 'userName', key: 'userName', width: 50, render: (text: string, item, index: number) => <div>{this.state.pageSize! * (this.state.currentPage! - 1) + (index + 1)}</div> },
			{ title: L('Tên hiển thị'), dataIndex: 'displayName', key: 'displayName', width: 150, render: (text: string) => <div>{text}</div> },
			{ title: L('Tên vai trò'), dataIndex: 'name', key: 'name', width: 150, render: (text: string) => <div>{text}</div> },
		];
		if (this.isGranted(AppConsts.Permission.Pages_Manager_System_Roles_Edit) || this.isGranted(AppConsts.Permission.Pages_Manager_System_Roles_Delete)) {
			columns.push({
				title: L('Chức năng'),
				width: 150,
				render: (text: string, item: RoleDto) => (
					<div>
						{this.isGranted(AppConsts.Permission.Pages_Manager_System_Roles_Edit) &&
							<Button
								type="primary" icon={<EditOutlined />} title={L('Chỉnh sửa')}
								style={{ marginLeft: '10px' }}
								onClick={() => this.createOrUpdateModalOpen(item)}>
							</Button>
						}
						{this.isGranted(AppConsts.Permission.Pages_Manager_System_Roles_Delete) &&
							<Button
								danger icon={<DeleteFilled />} title={L('Xóa')}
								style={{ marginLeft: '10px' }}
								onClick={() => this.delete(item)}>
							</Button>
						}
					</div>
				),
			})
		}
		return (
			<>
				<Skeleton active loading={this.state.visiblePassWordModalOpen}>
					<Card>
						<Row gutter={16}>
							<Col span={5} >
								<h2>{L('Vai trò')}</h2>
							</Col>
							<Col span={5}>
								<Input
									allowClear
									onPressEnter={() => this.handleSubmitSearch()}
									value={this.state.filter}
									placeholder={L("Nhập tìm kiếm")}
									onChange={(e) => { this.setState({ filter: e.target.value }); this.handleSubmitSearch() }}
								/>
							</Col>
							<Col span={5}>
								<Button type='primary' icon={<SearchOutlined />} onClick={this.handleSubmitSearch}>{L("Tìm kiếm")}</Button>
							</Col>
							{this.isGranted(AppConsts.Permission.Pages_Manager_System_Roles_Create) &&
								<Col span={9} style={{ textAlign: "right" }}>
									<Button type="primary" title='Thêm vai trò' onClick={() => this.createOrUpdateModalOpen(new RoleDto())} >Thêm mới</Button>
								</Col>
							}
						</Row>
						<Row style={{ marginTop: 20 }}>
							<Col {...left} style={{ overflow: 'auto', maxHeight: "60vh" }}>
								<Table
									rowKey="id"
									onRow={(record, rowIndex) => {
										return {
											onDoubleClick: (event: any) => {
												{
													this.isGranted(AppConsts.Permission.Pages_Manager_System_Roles_Edit) &&
														this.createOrUpdateModalOpen(record!)
												}
											}
										};
									}}
									className='centerTable'
									bordered={true}
									rowClassName={(record, index) => (this.roleSelected.id == record.id ? 'bg-click' : 'bg-white')}
									pagination={{
										position: ['topRight'],
										pageSize: this.state.pageSize,
										total: roles === undefined ? 0 : roles.totalCount,
										defaultCurrent: 1,
										current: this.state.currentPage,
										showTotal: (total) => (L("Tổng: ")) + AppConsts.formatNumber(total),
										showQuickJumper: true,
										showSizeChanger: true,
										onChange: this.onChangePage,
										onShowSizeChange: this.onChangePage,
										pageSizeOptions: pageSizeOptions,
									}} columns={columns}
									loading={roles === undefined ? true : false}
									dataSource={roles === undefined ? [] : roles.items}
									onChange={this.handleTableChange}
								/>
							</Col>
							<Col {...right}>
								{this.state.modalCreateUpdate &&
									<CreateOrUpdateRole
										onCancel={() =>
											this.setState({ modalCreateUpdate: false, })
										}
										onCreateOrUpdatedSuccess={() => { this.getAll() }}
										roleSelected={this.roleSelected}
									/>}
							</Col>
						</Row>
					</Card>
				</Skeleton>
				<Modal
					title={this.state.hasPasswordLever2 ? 'Mật khẩu cấp 2' : 'Mật khẩu'}
					visible={this.state.visiblePassWordModalOpen}
					onCancel={() => this.onCancelUsersPassWord()}
					cancelText={L("Hủy")}
					footer={null}
					className="UsersPassWordLevel2ModalClass"
					destroyOnClose={true}
					width={"50vw"}
				>
					{
						this.state.hasPasswordLever2
							?
							<PassWordLevel2
								oncancel={() => this.setState({ visiblePassWordModalOpen: false })}
								onsave={this.onsavePassWord}
								isCheckPassword2={this.state.isCheckPassword2}
							/>
							:
							<PassWord
								oncancel={() => this.setState({ visiblePassWordModalOpen: false })}
								onsave={this.onsavePassWord}
								isCheckPassword2={this.state.isCheckPassword2}
							/>
					}
				</Modal>
			</>
		);
	}
}

