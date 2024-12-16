import { DeleteFilled, EditOutlined, LockOutlined, PlusOutlined, SearchOutlined, SettingOutlined } from '@ant-design/icons';
import PasswordChanging from '@components/PasswordChange';
import { L } from '@lib/abpUtility';
import AppConsts, { RouterPath } from '@lib/appconst';
import HistoryHelper from '@lib/historyHelper';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import SelectEnum from '@src/components/Manager/SelectEnum';
import { eActive } from '@src/lib/enumconst';
import { Int64EntityDto, UserDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Input, Modal, Row, Switch, Table, message } from 'antd';
import { TablePaginationConfig } from 'antd/lib/table';
import CreateOrUpdateUser from './components/FormCreateOrUpdateUser';
import PassWordLevel2 from './components/PassWordLevel2';
import './index.css';
import * as React from 'react';

const confirm = Modal.confirm;

export default class User extends AppComponentBase {

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
		visiblePassWordLevel2ModalOpen: false,
		isCheckPassword2: false,
	};
	userSelected: UserDto = new UserDto();

	async componentDidMount() {
		await this.getAll();
		await this.setState({ isCheckPassword2: true, visiblePassWordLevel2ModalOpen: true });
	}

	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.userStore.getAll(this.state.filter, this.state.isActive, this.state.skipCount, this.state.pageSize);
		this.setState({ isLoadDone: true, modalCreateUpdate: false, modalChangePassWord: false });
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

	createOrUpdateModalOpen = async (inputUser: UserDto) => {
		this.userSelected = inputUser;
		await this.setState({ modalCreateUpdate: true, modalChangePassWord: false });
	}
	async changePassWordModalOpen(inputUser: UserDto) {
		this.userSelected = inputUser;
		await this.setState({ modalChangePassWord: true, modalCreateUpdate: false });
	}

	handleSubmitSearch = async () => {
		this.onChangePage(1, this.state.pageSize);
	};

	openModalPassWordLevel2 = async (isCheckPassword2: boolean) => {
		this.setState({
			isCheckPassword2: isCheckPassword2,
			visiblePassWordLevel2ModalOpen: !this.state.visiblePassWordLevel2ModalOpen,
		});
	};

	onsavePassWordLevel2 = async (val: boolean) => {
		if (val != undefined && val == true) {
			await this.getAll();
		} else {

			Modal.error({ title: L("Thông báo"), content: L("Không được truy cập") });
			HistoryHelper.redirect(RouterPath.admin_home);
		}
	}

	onCancelUsersPassWordLevel2 = () => {
		this.setState({ visiblePassWordLevel2ModalOpen: false });
		if (this.state.isCheckPassword2 == true) {
			HistoryHelper.redirect(RouterPath.admin_home);
		}
	}

	onChangePage = async (page: number, pageSize?: number) => {
		if (pageSize !== undefined) {
			await this.setState({ pageSize: pageSize });
		}
		await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page, pageSize: this.state.pageSize });
		await this.getAll()
	};

	public render() {
		const left = this.state.modalChangePassWord || this.state.modalCreateUpdate ? AppConsts.cssRightMain.left : AppConsts.cssPanelMain.left;
		const right = this.state.modalChangePassWord || this.state.modalCreateUpdate ? AppConsts.cssPanelMain.right : AppConsts.cssRightMain.right;
		const { users, totalUser } = stores.userStore;
		const columns: any = [
			{ title: L('STT'), dataIndex: 'userName', key: 'userName', width: 50, render: (text: string, item, index: number) => <div>{this.state.pageSize! * (this.state.currentPage! - 1) + (index + 1)}</div> },
			{ title: L('Tên đăng nhập'), dataIndex: 'userName', key: 'userName', width: 150, render: (text: string) => <div>{text}</div> },
			{ title: L('Họ tên'), dataIndex: 'fullName', key: 'fullName', width: 150, render: (text: string) => <div>{text}</div> },
			{ title: L('Email'), dataIndex: 'emailAddress', key: 'emailAddress', width: 150, render: (text: string) => <div>{text}</div> },
			{
				title: L('Kích hoạt'), dataIndex: 'isActive', key: 'isActive', width: 150,
				render: (text: string, item: UserDto) => <Switch checked={item.isActive} onClick={(checked: boolean) => this.activateOrDeActive(checked, item.id)}></Switch>
			},
			{
				title: L('Chức năng'), width: 150, fixed: 'right',
				render: (text: string, item: any) => (
					<div>
						{this.isGranted(AppConsts.Permission.Pages_Manager_System_Users_Edit) &&
							<Button
								type="primary" icon={<EditOutlined />} title={L('chinh_sua')}
								style={{ marginLeft: '10px' }}
								onClick={() => this.createOrUpdateModalOpen(item!)}
							></Button>
						}
						<Button
							type="primary" icon={<LockOutlined />} title={L('Đổi mật khẩu')}
							style={{ marginLeft: '10px' }}
							onClick={() => this.changePassWordModalOpen(item!)}
						></Button>

						{this.isGranted(AppConsts.Permission.Pages_Manager_System_Users_Delete) &&
							<Button
								danger icon={<DeleteFilled />} title={L('Xóa')}
								style={{ marginLeft: '10px' }}
								onClick={() => this.delete(item.id!)}
							></Button>
						}
					</div>
				),
			},
		];

		return (
			<Card>
				<Row gutter={16}>
					<Col span={3} >
						<h2 >{L('nguoi_dung')}</h2>
					</Col>
					<Col span={5}>
						<Input onPressEnter={() => this.handleSubmitSearch()} value={this.state.filter} allowClear={true} onChange={(e) => this.setState({ filter: e.target.value })} placeholder={L("Tên đăng nhập, họ tên, email")} />
					</Col>
					<Col span={5}>
						<SelectEnum
							enum_value={this.state.isActive == undefined ? undefined : (this.state.isActive == true ? 1 : 0)}
							onChangeEnum={async (value) => {
								await this.setState({ isActive: value == 1 ? true : (value == undefined ? undefined : false) });
								await this.getAll();
							}}
							eNum={eActive}
							placeholder='Trạng thái'
						>
						</SelectEnum>
					</Col>
					<Col span={3}>
						<Button type='primary' icon={<SearchOutlined />} onClick={this.handleSubmitSearch}>{L("tim_kiem")}</Button>
					</Col>
					<Col span={8} style={{ textAlign: "right" }}>
						{this.isGranted(AppConsts.Permission.Pages_Manager_System_Users_Create) &&
							<Button type="primary" shape="circle" icon={<PlusOutlined />} onClick={() => this.createOrUpdateModalOpen(new UserDto())} />
						}
						&nbsp;&nbsp;
						<Button type="primary" icon={<SettingOutlined />} title={L("cai_dat_mat_khau_cap_2")} onClick={() => this.openModalPassWordLevel2(false)}>{L("cai_dat_mat_khau_cap_2")}</Button>
					</Col>
				</Row>
				<Row style={{ marginTop: 20 }}>
					<Col {...left} style={{ overflow: 'auto', maxHeight: "60vh" }}>
						<Table
							// sticky
							rowKey={(record) => record.id!.toString()}
							onRow={(record, rowIndex) => {
								return {
									onDoubleClick: (event: any) => { this.createOrUpdateModalOpen(record!) }
								};
							}}
							className='centerTable'
							size={'middle'}
							bordered={true}
							rowClassName={(record, index) => (this.userSelected.id == record.id ? 'bg-click' : 'bg-white')}
							columns={columns}
							pagination={{
								pageSize: this.state.pageSize,
								total: users === undefined ? 0 : totalUser,
								defaultCurrent: 1,
								current: this.state.currentPage,
								showTotal: (total) => L("tong") + AppConsts.formatNumber(total),
								showQuickJumper: true,
								showSizeChanger: true,
								onChange: this.onChangePage,
								onShowSizeChange: this.onChangePage,
								pageSizeOptions: ['10', '20', '50', '100'],
							}}
							loading={!this.state.isLoadDone}
							dataSource={users === undefined ? [] : users}
							onChange={this.handleTableChange}
						/>
					</Col>
					<Col {...right}>
						{this.state.modalCreateUpdate &&
							<CreateOrUpdateUser
								onCancel={() => {
									this.setState({ modalCreateUpdate: false, });
								}}
								onCreateOrUpdatedSuccess={async () => { await this.getAll() }}
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

				<Modal
					title={L("mat_khau_cap_2")}
					visible={this.state.visiblePassWordLevel2ModalOpen}
					onCancel={() => this.onCancelUsersPassWordLevel2()}
					cancelText={L("Hủy")}
					footer={null}
					className="UsersPassWordLevel2ModalClass"
					destroyOnClose={true}
				>
					<PassWordLevel2
						oncancel={() => this.setState({ visiblePassWordLevel2ModalOpen: false })}
						onsave={this.onsavePassWordLevel2}
						isCheckPassword2={this.state.isCheckPassword2}
					/>
				</Modal>
			</Card>
		);
	}
}
