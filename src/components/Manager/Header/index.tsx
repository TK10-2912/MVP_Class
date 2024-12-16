import './index.less';
import * as React from 'react';
import { Avatar, Badge, Col, Dropdown, Menu, Row } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined, LogoutOutlined, UserOutlined, SecurityScanOutlined } from '@ant-design/icons';
import { L } from '@lib/abpUtility';
import { Link } from 'react-router-dom';
import profilePicture from '@images/user.png';
import Modal from 'antd/lib/modal/Modal';
import PasswordChanging from '@components/PasswordChanging';
import { RouterPath } from '@src/lib/appconst';
import { stores } from '@src/stores/storeInitializer';
import AppComponentBase from '../AppComponentBase';


export interface IHeaderProps {
	collapsed?: any;
	toggle?: any;

}

export class Header extends AppComponentBase<IHeaderProps> {
	state = {
		isLoadDone: false,
		visibleModal: false,
		urlAvatar: '',
	}

	async componentDidMount() {
		const { currentLogin } = stores.sessionStore;
		if (currentLogin.user!.id >= 0) {
			await stores.userStore.getUserById(currentLogin.user!.id);
			this.getURLAvatar();
		}
		this.setState({ isLoadDone: !this.state.isLoadDone });
	}

	getURLAvatar() {
		const { editUser } = stores.userStore;
		this.setState({ urlAvatar: this.getFile(editUser.us_avatar) });
	}

	render() {
		const userDropdownMenu = (
			<Menu>
				<Menu.Item key="0">
					<Link to={RouterPath.admin_information}>
						<UserOutlined />
						<span> {L('Thông tin người dùng')}</span>
					</Link>

				</Menu.Item>
				<Menu.Item key="1" >
					<SecurityScanOutlined />
					<span onClick={() => this.setState({ visibleModal: true })}>{"Đổi mật khẩu"}</span>

				</Menu.Item>
				<Menu.Item key="2">
					<Link to={RouterPath.admin_logout}>
						<LogoutOutlined />
						<span> {L('Đăng xuất')}</span>
					</Link>
				</Menu.Item>
			</Menu>
		);
		return (
			<Row className={'header-container'}>
				<Col style={{ textAlign: 'left' }} span={12}>
					{this.props.collapsed ? (
						<MenuUnfoldOutlined className="trigger" onClick={this.props.toggle} />
					) : (
						<MenuFoldOutlined className="trigger" onClick={this.props.toggle} />
					)}
				</Col>
				<Col style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }} span={12}>
					<div style={{ marginRight: 24, cursor: 'pointer' }}>
						<Dropdown overlay={userDropdownMenu} trigger={['click']}>
							<Badge count={3}>
								<Avatar style={{ height: 30, width: 30 }} shape="circle" alt={'profile'} src={this.state.urlAvatar ? this.state.urlAvatar : profilePicture} />
							</Badge>
						</Dropdown>
					</div>
				</Col>
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
			</Row>
		);
	}
}

export default Header;
