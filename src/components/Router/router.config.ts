import { HomeOutlined } from '@ant-design/icons';
import LoadableComponent from '@components/Loadable/index';
import { RouterPath } from '@src/lib/appconst';
import { guestRouter } from './router_guest.config';

import { appSystemRouters } from './router_system.config';
import { appGeneralRouters } from './route_general';
import { appStatisticalRouters } from './route_statistic';
import { appHistoryRouters } from './route_history';
import { appMonitorRouters } from './route_monitor';
import { appRefundRouters } from './router_reconsile';


export const appRouters: any = [

	{
		path: RouterPath.admin_dashboard,
		name: 'dashboard',
		permission: '',
		title: 'Trang chủ',
		icon: HomeOutlined,
		showInMenu: true,
		component: LoadableComponent(() => import('@scenes/Dashboard')),
	},
	appMonitorRouters,
	appHistoryRouters,
	appStatisticalRouters,
	appRefundRouters,
	appGeneralRouters,
	appSystemRouters,
	{
		path: RouterPath.admin_information,
		permission: '',
		title: 'UserInformation',
		name: 'UserInformation',
		icon: 'info-circle',
		showInMenu: false,
		component: LoadableComponent(() => import('@scenes/UserInformation'))
	},
	{
		path: RouterPath.admin_logout,
		permission: '',
		title: 'Logout',
		name: 'logout',
		icon: 'info-circle',
		showInMenu: false,
		component: LoadableComponent(() => import('@components/Logout'))
	},


];


export const routers = [...guestRouter, ...appRouters];
