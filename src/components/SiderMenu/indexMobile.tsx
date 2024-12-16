import * as React from 'react';

import { Avatar, Button, Col, Dropdown, Layout, Menu, Row, Space } from 'antd';
import { L, isGranted } from '@lib/abpUtility';

import AppLongLogo from '@images/greentech-long-logo.png'
import { appRouters } from '@components/Router/router.config';
import HistoryHelper from '@src/lib/historyHelper';
import { RouterPath } from '@src/lib/appconst';
import './index.less';
import { MenuOutlined } from '@ant-design/icons';
import HeaderMobile from '../Manager/Header/HeaderMobile';

const { SubMenu } = Menu;
const { Header } = Layout;
export interface ISiderMenuProps {
	path: any;
	collapsed: boolean;
	onCollapse?: any;
	history: any;
	onChangeMenuPath?: () => void;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
}

const SiderMenuMobile = (props: ISiderMenuProps) => {
	const { history, onChangeMenuPath } = props;
	let openKey: string[] = ['0'];
	const changeMenuPath = (path: string, index?: string) => {
		if (!!onChangeMenuPath) {
			onChangeMenuPath();
		}
		history.push(path, index);
	}
	const renderMenu = (route, index) => {
		if (route.permission && !isGranted(route.permission)) return null;
		let title = L(route.title);
		if (Array.isArray(route.component)) {
			let arr = route.component;
			return (<SubMenu key={index + "_group"}
				title={
					<span className='siderbar__submenu' title={title}>
						<span><route.icon /></span>
						<span className="siderbar__title">{title}</span>
					</span>
				}
			>
				{arr.filter((itemChild: any) => !itemChild.isLayout && itemChild.showInMenu)
					.map((routeChild: any) => {
						if (routeChild.path === history.location.pathname) {
							openKey[0] = routeChild.key;
						}
						return renderMenu(routeChild, index + "_group");
					})}
			</SubMenu>);
		}
		return (
			<Menu.Item key={route.path} onClick={() => changeMenuPath(route.path, index)}>
				<span className='siderbar__submenu' title={title}>
					<span><route.icon /></span>
					<span className="siderbar__title">{title}</span>
				</span>
			</Menu.Item>
		);
	}

	return (
		<Header>
			<Row style={{ width: "100%" }}>
				<Col span={18}>
					<Space>
						<Dropdown overlay={<Menu defaultOpenKeys={openKey} selectedKeys={[history.location.pathname]} theme="dark" mode="horizontal" >
							{appRouters
								.filter((item: any) => !item.isLayout && item.showInMenu)
								.map((route: any, index: number) => {
									return renderMenu(route, index + "_");
								})}
						</Menu>} trigger={['click', 'hover']} placement="bottomCenter">
							<Button icon={<MenuOutlined />}></Button>
						</Dropdown>
						<div className='siderbar__block' onClick={() => HistoryHelper.redirect(RouterPath.admin_dashboard)}>
							<Avatar className='siderbar__icon -size-large' shape="square" src={AppLongLogo} />
						</div>
					</Space>
				</Col>
				<Col span={6} style={{ textAlign: "right" }}>
					<HeaderMobile />
				</Col>

			</Row>
		</Header>
	);
};

export default SiderMenuMobile;
