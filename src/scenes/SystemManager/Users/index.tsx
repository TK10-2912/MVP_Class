import { DeleteFilled, DeleteOutlined, EditOutlined, LockOutlined, LoginOutlined, LogoutOutlined, PlusOutlined, SearchOutlined, SettingOutlined, UserAddOutlined } from '@ant-design/icons';
import PasswordChanging from '@components/PasswordChange';
import { L } from '@lib/abpUtility';
import AppConsts, { cssCol, cssColResponsiveSpan, pageSizeOptions, RouterPath } from '@lib/appconst';
import HistoryHelper from '@lib/historyHelper';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import SelectEnum from '@src/components/Manager/SelectEnum';
import { eActive } from '@src/lib/enumconst';
import { Int64EntityDto, UserDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Input, Modal, Row, Skeleton, Space, Switch, Table, message } from 'antd';
import { TablePaginationConfig } from 'antd/lib/table';
import CreateOrUpdateUser from './components/FormCreateOrUpdateUser';
import PassWordLevel2 from './components/PassWordLevel2';
import './index.css';
import * as React from 'react';
import PassWord from './components/PassWord';
import debounce from "lodash.debounce";

const confirm = Modal.confirm;

export default class User extends AppComponentBase {
	debouncedSearch: () => void;
    constructor(props) {
        super(props);
        this.debouncedSearch = debounce(this.handleSubmitSearch, 500);
    }
	state = {
		isLoadDone: false,
		modalCreateUpdate: false,
		modalChangePassWord: false,
		pageSize: 10,
		skipCount: 0,
		currentPage: 1,
		userId: 0,
		filter: '',
		isActive: undefined,
		visiblePassWordModalOpen: true,
		isCheckPassword2: false,
		checkModal: false,
		hasPasswordLever2: false,
		checkTitle: false,
	};
	userSelected: UserDto = new UserDto();

	async componentDidMount() {
		this.handleClearSearch();
		const sessionData = await stores.sessionStore.currentLogin
		this.setState({ hasPasswordLever2: sessionData.user.hasPassword2 })
		await this.setState({ isCheckPassword2: true, visiblePassWordModalOpen: true });
	}
	checkTurnOfModal = async (input: boolean) => {
		await this.setState({ checkModal: input })
	}
	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.userStore.getAll(this.state.filter, this.state.isActive, this.state.skipCount, this.state.pageSize);
		this.setState({ isLoadDone: true });
	}

	handleTableChange = (pagination: TablePaginationConfig) => {
		this.setState({ skipCount: (pagination.current! - 1) * this.state.pageSize! }, async () => await this.getAll());
	};

	async activateOrDeActive(checked: boolean, id: number) {
		this.setState({ isLoadDone: false });
		let item_id = new Int64EntityDto();
		item_id.id = id;
		if (checked) {
			await stores.userStore.activate(item_id);
			message.success(L("Bật thành công"));
		} else {
			await stores.userStore.deActivate(item_id);
			message.success(L("Tắt thành công"));
		}
		await this.getAll();
		this.setState({ isLoadDone: true });
	}

	delete = (id: number) => {
		let self = this;
		confirm({
			title: L('Bạn muốn xóa người dùng này?'),
			async onOk() {
				self.setState({ isLoadDone: false });
				await stores.userStore.deleteUser(id);
				self.setState({ isLoadDone: true, modalCreateUpdate: false, });
				message.success("Xóa thành công");
			},
			onCancel() {
				console.log('Cancel');
			},
		});
	}

	async createOrUpdateModalOpen(inputUser: UserDto) {
		await this.setState({ isLoadDone: false })
		this.userSelected = inputUser;
		await this.setState({ isLoadDone: true, modalChangePassWord: false, modalCreateUpdate: true });
	}
	async changePassWordModalOpen(inputUser: UserDto) {
		this.userSelected = inputUser;
		await this.setState({ modalCreateUpdate: false, modalChangePassWord: true });
	}

	handleSubmitSearch = async () => {
		this.onChangePage(1, this.state.pageSize);
	};

	handleClearSearch = async () => {
		await this.setState({
			isActive: undefined,
			filter: undefined
		})
		this.onChangePage(1, this.state.pageSize);
	}

	openModalPassWordLevel2 = async (isCheckPassword2: boolean) => {
		this.setState({
			isCheckPassword2: isCheckPassword2,
			visiblePassWordModalOpen: !this.state.visiblePassWordModalOpen,
		});
	};

	onsavePassWord = async (val: boolean) => {
		if (val != undefined && val == true) {
			await this.setState({ checkModal: true, visiblePassWordModalOpen: false })
			await this.getAll();
			this.setState({ checkTitle: true })
		} else {
			Modal.error({ title: L("Thông báo"), content: L("Không được truy cập") });
			HistoryHelper.redirect(RouterPath.admin_home);
		}
	}

	onCancelUsersPassWord = () => {
		this.setState({ visiblePassWordModalOpen: false });
		if (this.state.isCheckPassword2 == true) {
			HistoryHelper.redirect(RouterPath.admin_home);
		}
	}

	onChangePage = async (page: number, pageSize?: number) => {
		if (pageSize !== undefined) {
			await this.setState({ pageSize: pageSize });
		}
		await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page, pageSize: this.state.pageSize });
		await this.getAll();
	};
	onRedirect = () => {
		HistoryHelper.redirect(RouterPath.admin_home);
	}
	loginUser = async (user: UserDto) => {
		confirm({
			title: L('Bạn muốn đăng nhập vào tài khoản người dùng này không?'),
			async onOk() {
				await stores.authenticationStore.adminLoginUserWithoutPassword(user.id);
			},
			onCancel() {
				console.log('Cancel');
			},
		});
	}
	searchKeyword = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ filter: e.target.value })
        this.debouncedSearch();
    }
	public render() {
		const left = this.state.modalChangePassWord || this.state.modalCreateUpdate ? AppConsts.cssRightMain.left : AppConsts.cssPanelMain.left;
		const right = this.state.modalChangePassWord || this.state.modalCreateUpdate ? AppConsts.cssPanelMain.right : AppConsts.cssRightMain.right;
		const { users, totalUser } = stores.userStore;
		const columns: any = [
			{ title: L('STT'), dataIndex: 'userName', key: 'userName', width: 50, render: (text: string, item, index: number) => <div>{this.state.pageSize! * (this.state.currentPage! - 1) + (index + 1)}</div> },
			...(!stores.sessionStore.getTenant() ? [
				{
					title: L('Tenant Name'),
					dataIndex: 'tenantName',
					key: 'tenantName',
					render: (text: string, item: UserDto) => <div>{item.tenantName}</div>,
				}
			] : []),
			{ title: L('Tên đăng nhập'), dataIndex: 'userName', key: 'userName', render: (text: string) => <div>{text}</div> },
			{ title: L('Họ tên'), dataIndex: 'fullName', key: 'fullName', render: (text: string) => <div>{text}</div> },
			{ title: L('Email'), dataIndex: 'emailAddress', key: 'emailAddress', render: (text: string) => <div>{text}</div> },
			{ title: L('Quyền'), dataIndex: 'roleNames', key: 'roleNames', render: (text: string[]) => <div>{text.join(', ')}</div> },
			{
				title: L('Kích hoạt'), dataIndex: 'isActive', key: 'isActive',
				render: (text: string, item: UserDto) => <Switch checked={item.isActive} onClick={(checked: boolean) => this.activateOrDeActive(checked, item.id)}></Switch>
			},
			{
				title: L('Chức năng'), fixed: 'right',
				render: (text: string, item: UserDto) => (
					<div>
						{this.isGranted(AppConsts.Permission.Pages_Manager_System_Users_Edit) &&
							<Button
								type="primary" icon={<EditOutlined />} title={L('Chỉnh sửa')}
								style={{ marginLeft: '10px' }}
								onClick={() => this.createOrUpdateModalOpen(item!)}
								size='middle'
							></Button>
						}
						<Button
							type="primary" icon={<LockOutlined />} title={L('Đổi mật khẩu')}
							style={{ marginLeft: '10px' }}
							onClick={() => this.changePassWordModalOpen(item!)}
							size='middle'
						></Button>

						{this.isGranted(AppConsts.Permission.Pages_Manager_System_Users_Delete) &&
							<Button
								danger icon={<DeleteFilled />} title={L('Xóa')}
								style={{ marginLeft: '10px' }}
								onClick={() => this.delete(item.id!)}
								size='middle'
							></Button>
						}
						{this.isGranted(AppConsts.Permission.Pages_Manager_System_Tenants) &&
							<Button
								icon={<LogoutOutlined />} title={L('Đăng nhập user')}
								style={{ marginLeft: '10px' }}
								onClick={() => this.loginUser(item)}
								size='middle'
							></Button>
						}
					</div>
				),
			},
		];

		return (
			<>
				<Skeleton active loading={this.state.visiblePassWordModalOpen}>
					<Card onClick={this.state.checkModal == false ? this.onRedirect : undefined}>
						<Row>
							<Col span={4}><h2 >{L('Người dùng')}</h2></Col>
							<Col span={14}>
								<Row gutter={8}>
									<Col span={6}>
										<Input onPressEnter={() => this.handleSubmitSearch()} value={this.state.filter} allowClear onChange={async (e) => this.searchKeyword(e)} placeholder={L("Tên đăng nhập, họ tên, email")} />
									</Col>
									<Col span={6}>
										<SelectEnum
											enum_value={this.state.isActive == undefined ? undefined : (this.state.isActive == true ? 1 : 0)}
											onChangeEnum={async (value) => {
												await this.setState({ isActive: value == 1 ? true : (value == undefined ? undefined : false) });
												this.onChangePage(1, this.state.pageSize)
											}}
											eNum={eActive}
											placeholder='Trạng thái'
										>
										</SelectEnum>
									</Col>
									<Col span={12}>
										<Space>
											<Button type='primary' icon={<SearchOutlined />} onClick={this.handleSubmitSearch}>Tìm kiếm</Button>
											{(!!this.state.filter || this.state.isActive == true || this.state.isActive == false) &&
												<Button danger icon={<DeleteOutlined />} onClick={this.handleClearSearch}>Xóa tìm kiếm</Button>
											}
										</Space>
									</Col>
								</Row>
							</Col>
							<Col span={6} style={{ textAlign: "right" }}>
								<Space>
									{this.isGranted(AppConsts.Permission.Pages_Manager_System_Users_Create) &&
										<Button type="primary" title="Thêm thành viên mới" icon={<UserAddOutlined />} onClick={() => this.createOrUpdateModalOpen(new UserDto())} >Thêm thành viên mới</Button>
									}
									<Button type="primary" icon={<SettingOutlined />} title={L("Cài đặt mật khẩu cấp 2")} onClick={() => this.openModalPassWordLevel2(false)}>{L("Cài đặt mật khẩu cấp 2")}</Button>
								</Space>
							</Col>
						</Row>
						<Row style={{ marginTop: 20 }}>
							<Col {...left}>
								<Table
									scroll={{ x: 1000 }}
									rowKey={(record) => record.id!.toString()}
									onRow={(record) => {
										return {
											onDoubleClick: (event: any) => { this.createOrUpdateModalOpen(record!) }
										};
									}}
									className='centerTable'
									size={'middle'}
									bordered={true}
									rowClassName={(record) => (this.userSelected.id == record.id ? 'bg-click' : 'bg-white')}
									columns={columns}
									pagination={{
										position: ['topRight'],
										pageSize: this.state.pageSize,
										total: users === undefined ? 0 : totalUser,
										defaultCurrent: 1,
										current: this.state.currentPage,
										showTotal: (total) => L("Tổng: ") + AppConsts.formatNumber(total),
										showQuickJumper: true,
										showSizeChanger: true,
										onChange: this.onChangePage,
										onShowSizeChange: this.onChangePage,
										pageSizeOptions: pageSizeOptions,
									}}
									// loading={!this.state.isLoadDone}
									dataSource={users === undefined ? [] : users}
									onChange={this.handleTableChange}
								/>
							</Col>
							<Col {...right}>
								{this.state.modalCreateUpdate &&
									<CreateOrUpdateUser
										userListResult={users}
										onCancel={() => {
											this.setState({ modalCreateUpdate: false, });
										}}
										onCreateOrUpdatedSuccess={async () => { await this.getAll(); this.setState({ modalCreateUpdate: false }) }}
										userSelected={this.userSelected}
									/>
								}
								{this.state.modalChangePassWord &&
									<PasswordChanging
										onClose={() => this.setState({ modalChangePassWord: false })}
										userSelected={this.userSelected}
									/>
								}
							</Col>
						</Row>
					</Card>
				</Skeleton>
				<Modal
					title={this.state.hasPasswordLever2 ? 'Mật khẩu cấp 2' : this.state.checkTitle == true ? "Thay đổi mật khẩu cấp 2" : 'Mật khẩu tài khoản'}
					visible={this.state.visiblePassWordModalOpen}
					onCancel={() => this.onCancelUsersPassWord()}
					cancelText={L("Hủy")}
					footer={null}
					className="UsersPassWordLevel2ModalClass"
					destroyOnClose={true}
					width={"50vw"}
				>
					{this.state.hasPasswordLever2
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
							checkTitle={this.state.checkTitle}
							isCheckPassword2={this.state.isCheckPassword2}
						/>
					}
				</Modal>
			</>
		);
	}
}
