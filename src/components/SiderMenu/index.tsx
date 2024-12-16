import * as React from 'react';

import { Avatar, Layout, Menu, Space } from 'antd';
import { L, isGranted } from '@lib/abpUtility';

import AppLogo from '@images/greentech-logo.png';
import AppLongLogo from '@images/greentech-long-logo.png'
import { appRouters } from '@components/Router/router.config';
import HistoryHelper from '@src/lib/historyHelper';
import { RouterPath } from '@src/lib/appconst';
import './index.less';

const { SubMenu } = Menu;
const { Sider } = Layout;

export interface ISiderMenuProps {
	path: any;
	collapsed: boolean;
	onCollapse: any;
	history: any;
	onChangeMenuPath?: () => void;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
}

const SiderMenu = (props: ISiderMenuProps) => {
	const { collapsed, history, onCollapse, onChangeMenuPath, onMouseEnter, onMouseLeave } = props;
	let openKey: string[] = ['0'];
	const changeMenuPath = (path: string, index?: string) => {
		if (!!onChangeMenuPath) {
			onChangeMenuPath();
		}
		history.push(path, index);
	}
	const handleMouseEnter = () => {
		var isMenu = localStorage.getItem("isMenu");
		if (isMenu == 'true' && onMouseEnter) {
			onMouseEnter();
		}
	};

	const handleMouseLeave = () => {
		var isMenu = localStorage.getItem("isMenu");
		if (isMenu == 'true' && onMouseLeave) {
			onMouseLeave();
		}
	};

	const renderMenu = (route, index) => {
		if (route.permission && !isGranted(route.permission)) return null;
		let title = L(route.title);
		if (Array.isArray(route.component)) {
			let arr = route.component;
			return (<SubMenu key={index + "_group"}
				title={
					<span className='siderbar__submenu' title={title}>
						<span><route.icon /></span>
						<span className={`siderbar__title ${!collapsed || '-display-none'}`}>{title}</span>
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
					<span className={`siderbar__title ${collapsed && index.endsWith('_') && !index.includes('group') && '-display-none'}`}>{title}</span>
				</span>
			</Menu.Item>
		);
	}

	return (
		<Sider className='siderbar' onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} trigger={null} breakpoint="md" width={256} collapsible collapsed={collapsed} onCollapse={onCollapse}>
			<div className='siderbar__block' onClick={() => HistoryHelper.redirect(RouterPath.admin_dashboard)}>
				{collapsed ? (
					<Avatar className='siderbar__icon -size-small' shape="circle" src={AppLogo} />
				) : (
						<Avatar className='siderbar__icon -size-large' shape="square" src={AppLongLogo} />
					)}
			</div>
			<Menu className='siderbar__menu' defaultOpenKeys={openKey} selectedKeys={[history.location.pathname]} theme="dark" mode="inline" >
				{appRouters
					.filter((item: any) => !item.isLayout && item.showInMenu)
					.map((route: any, index: number) => {
						return renderMenu(route, index + "_");
					})}
			</Menu>
			<Space className='siderbar__contact' direction='vertical' size={0}>
				<a className='siderbar__about' href='https://migviet.com'>{L('MigViet')}</a>
				<a className='siderbar__user-manual' rel="noopener noreferrer" target='_blank' href={process.env.PUBLIC_URL + '/HDSD_VendingMachine.pdf'}>Hướng dẫn sử dụng</a>
				{!collapsed && <span>{L('Hotline')}: 0246.329.1989</span>}
			</Space>
		</Sider>
	);
};

export default SiderMenu;
