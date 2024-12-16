import './index.less';
import * as React from 'react';
import { Avatar, Badge, Col, Dropdown, Menu, Popover, Row, Space } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined, LogoutOutlined, UserOutlined, SecurityScanOutlined, BellTwoTone, BellFilled } from '@ant-design/icons';
import { L } from '@lib/abpUtility';
import { Link } from 'react-router-dom';
import profilePicture from '@images/user.png';
import Modal from 'antd/lib/modal/Modal';
import PasswordChanging from '@components/PasswordChanging';
import { RouterPath } from '@src/lib/appconst';
import { stores } from '@src/stores/storeInitializer';
import AppComponentBase from '../AppComponentBase';
import NotificationList from './NotificationList';
import signalRAspNetCoreHelper from '@src/lib/signalRAspNetCoreHelper';
export interface IHeaderProps {
	collapsed?: any;
	toggle?: any;
}

export class Header extends AppComponentBase<IHeaderProps> {
	state = {
		isLoadDone: false,
		visibleModal: false,
		urlAvatar: '',
		count: 0,
		pageSize: 10,
		hasMore: true,
	}
	count: number = 0

	async componentDidMount() {
		const { currentLogin } = stores.sessionStore;
		const userId = currentLogin.user!.id;
		if (userId >= 0) {
			await stores.userStore.getUserById(userId);
			this.getURLAvatar();
			await this.getAllNotification();
			await signalRAspNetCoreHelper.registerNotificationHandler(['updateSupplier', 'createRefund', 'createReport', 'createBilling'], [this.getAllNotification]);
		}
		this.setState({ isLoadDone: !this.state.isLoadDone });
	}

	getAllNotification = async () => {
		var titleNoti = 'Thông báo từ GREEN-TECH';
		var bodyNoti = 'Bạn có 1 thông báo mới';
		await stores.notificationStore.getAll(undefined, undefined);
		const { totalUnreadNotification } = stores.notificationStore;
		this.count = totalUnreadNotification;
		if (this.count > 0) {
			this.showNotification(titleNoti, bodyNoti);
		}
		await this.setState({ isLoadDone: !this.state.isLoadDone, });
	}
	getURLAvatar() {
		const { editUser } = stores.userStore;
		if (editUser.us_avatar) {
			this.setState({ urlAvatar: this.getFile(editUser.us_avatar) });
		}
	}
	updateAllStateNotification = async (typeNotification?: number) => {
		await stores.notificationStore.updateAllStateNotification(typeNotification);
		await this.getAllNotification();
		await this.setState({ isLoadDone: !this.state.isLoadDone });
	};

	render() {
		const { notificationListResult } = stores.notificationStore;
		const { editUser } = stores.userStore;
		const userDropdownMenu = (
			<Menu>
				<Menu.Item className='borderBottom'>
					<Space>
						<Avatar
							size={50}
							src={this.state.urlAvatar || profilePicture}
							alt={'profile'}
						/>
						<span style={{ fontSize: '16px', fontWeight: 600 }}>
							{stores.sessionStore.getNameUserLogin()}</span>
					</Space>
				</Menu.Item>
				<Menu.Item key="0">
					<Link to={RouterPath.admin_information}>
						<UserOutlined />
						<span> {L('Thông tin người dùng')}</span>
					</Link>

				</Menu.Item>
				<Menu.Item key="1" className='borderBottom'>
					<SecurityScanOutlined />
					<span onClick={() => this.setState({ visibleModal: true })}>{"Đổi mật khẩu"}</span>
				</Menu.Item>
				<Menu.Item key="2" >
					<Link to={RouterPath.admin_logout}>
						<LogoutOutlined />
						<span> {L('Đăng xuất')}</span>
					</Link>
				</Menu.Item>
			</Menu>
		);
		return (
			<>
				<Row className='header-container'>
					<Col className='header-container__col-left' span={4}>
						{this.props.collapsed ? (
							<MenuUnfoldOutlined onClick={this.props.toggle} />
						) : (
							<MenuFoldOutlined onClick={this.props.toggle} />
						)}
					</Col>
					<Col className='header-container__col-right' span={20}>
						<Space size={12}>
							{window.innerWidth > 700 &&
								<div className='header-container__username'>
									<span>Xin chào, {editUser != undefined ? editUser.name : 'Anonymous'}</span>
								</div>
							}
							<div className='header-container__dropdown'>
								<Popover
									trigger={'click'}
									placement='bottomRight'
									content={
										<NotificationList
											totalUnreadNotification={this.count}
											updateAllNotification={this.updateAllStateNotification}
											loadDone={this.state.isLoadDone}
											getAllNotification={() => this.getAllNotification()}
											notificationListResult={notificationListResult}
										/>
									}
								>
									<Badge count={this.count} offset={[8, -5]} size='small'>
										<BellFilled className='header-container__bell' />
									</Badge>
								</Popover>
							</div>
							<div className='header-container__avatar'>
								<Dropdown overlay={userDropdownMenu} trigger={['click']}>
									<Avatar shape="circle" alt={'profile'} src={this.state.urlAvatar || profilePicture} />
								</Dropdown>
							</div>
						</Space>
					</Col>
				</Row >
				<Modal
					width={'50vw'}
					destroyOnClose={true}
					visible={this.state.visibleModal}
					footer={null}
					onCancel={() => this.setState({ visibleModal: false })}
					cancelText="Huỷ"
					title="Đổi mật khẩu tài khoản"
				>
					<PasswordChanging
						onClose={() => this.setState({ visibleModal: false })}
					/>
				</Modal>
			</>
		);
	}
}

export default Header;
