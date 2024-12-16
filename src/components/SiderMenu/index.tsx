import './index.less';

import * as React from 'react';

import { Avatar, Col, Layout, Menu } from 'antd';
import { L, isGranted } from '@lib/abpUtility';

// import AppLogo from '@images/logo_mig-1.png';
// import AppLongLogo from '@images/logo_mig-1.png'
// import AppLogo from '@images/greentech-edit-01.jpg';
// import AppLongLogo from '@images/greentech-edit-01.jpg'
import AppLogo from '@images/greentech-edit-01.png';
import AppLongLogo from '@images/greentech-edit-01.png'
import { appRouters } from '@components/Router/router.config';
import utils from '@utils/utils';
import { stores } from '@src/stores/storeInitializer';
import HistoryHelper from '@src/lib/historyHelper';
import { RouterPath } from '@src/lib/appconst';

const { SubMenu } = Menu;
const { Sider } = Layout;

export interface ISiderMenuProps {
	path: any;
	collapsed: boolean;
	onCollapse: any;
	history: any;
	onChangeMenuPath?: () => void;
}

const SiderMenu = (props: ISiderMenuProps) => {
	const { collapsed, history, onCollapse, onChangeMenuPath } = props;

	const changeMenuPath = (path: string, index?: string) => {
		if (!!onChangeMenuPath) {
			onChangeMenuPath();
		}
		history.push(path, index);
	}
	const renderMenu = (route, index) => {
		if (route.permission && !isGranted(route.permission)) return null;
		const user = stores.sessionStore;

		// let menuIndex = route.path.replace("/", "_") + "_" + Math.floor(Math.random() * 1000) + "_" + index;
		let title = L(route.title);
		if (Array.isArray(route.component)) {
			let arrr = route.component;

			return (<SubMenu key={index + "_group"} title={
				<span className="submenu-title-wrapper" style={{ color: "#fff" }} title={title} >
					<route.icon />
					<span >{title}</span>
				</span>
			}>

				{arrr
					.filter((itemChild: any) => !itemChild.isLayout && itemChild.showInMenu)
					.map((routeChild: any, indexChild: number) => {
						return renderMenu(routeChild, index + "_group");
					})}
			</SubMenu>);
		}
		return (

			<Menu.Item key={route.path} onClick={() => changeMenuPath(route.path, index)}>
				<a style={{ color: "#fff" }} title={title}>
					<route.icon />
					<span>{title}</span>
				</a>
			</Menu.Item>

		);

	}
	const clickManagerField = () => {
		HistoryHelper.redirect(RouterPath.admin_dashboard);
	};
	// const currentRoute = utils.getRoute(history.location.pathname);
	return (
		<Sider trigger={null} className={'sidebar'} breakpoint="md" style={{ height: "100vh", }} width={256} collapsible collapsed={collapsed} onCollapse={onCollapse}>
			{collapsed ? (
				<Col style={{ textAlign: 'center', marginTop: 15, marginBottom: 10 }} onClick={clickManagerField}>
					<Avatar shape="circle" style={{ height: 48, width: 48 }} src={AppLogo} />
				</Col>
			) : (
				<Col style={{ textAlign: 'center', marginTop: 15, marginBottom: 10 }} onClick={clickManagerField}>
					{/* <span style={{color:'#fd640e',fontWeight:600}}>MIG-VIET</span> <Avatar shape="square" size={'default'}  src={AppLongLogo} />  */}
					<Avatar style={{ width: "95%", height: 'auto' }} shape="square" size={'default'} src={AppLongLogo} />
				</Col>
			)}

			<Menu defaultOpenKeys={[history.location.state]} style={{ height: "80vh", overflow: "auto" }} defaultSelectedKeys={[history.location.pathname]} theme="dark" mode="inline" className='menuVerticalSiderbarClass' >
				{appRouters
					.filter((item: any) => !item.isLayout && item.showInMenu)
					.map((route: any, index: number) => {
						return renderMenu(route, index + "_");
					})}
			</Menu>
			<div className='end-header'>
				<div className='mig-viet'>
					{!collapsed && <a href='https://migviet.com'>{L('About MIGVIet')}</a>}
					<p>{L('Hotline')}: 0246.329.1989</p>
				</div>
			</div>
		</Sider>
	);
};

export default SiderMenu;
