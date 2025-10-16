import { HomeOutlined } from '@ant-design/icons';
import LoadableComponent from '@components/Loadable/index';
import { RouterPath } from '@src/lib/appconst';
import { guestRouter } from './router_guest.config';
import { appSystemRouters } from './router_system.config';
import { appGeneralRouters } from './route_general';
import { appStatisticalRouters } from './route_statistic';
import { appHistoryRouters } from './route_history';
import { appMonitorRouters } from './route_monitor';



export const appRouters: any = [
	{
		path: RouterPath.admin_dashboard,
		key: '0',
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
	appGeneralRouters,
	appSystemRouters,

	{
		path: RouterPath.admin_information,
		permission: '',
		key: '0',
		title: 'UserInformation',
		name: 'UserInformation',
		icon: 'info-circle',
		showInMenu: false,
		component: LoadableComponent(() => import('@scenes/UserInformation'))
	},
	{
		path: RouterPath.admin_logout,
		permission: '',
		key: '0',
		title: 'Logout',
		name: 'logout',
		icon: 'info-circle',
		showInMenu: false,
		component: LoadableComponent(() => import('@components/Logout'))
	},
];

export const routers = [...guestRouter, ...appRouters];
