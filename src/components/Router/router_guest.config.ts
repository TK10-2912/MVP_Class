import { AppstoreOutlined, HomeOutlined, SettingOutlined, TagsOutlined, UserOutlined } from '@ant-design/icons';
import LoadableComponent from '@components/Loadable/index';
import { RouterPath } from '@src/lib/appconst';

export const guestRouter: any = [

	{
		path: RouterPath.g_login,
		name: 'login',
		title: 'LogIn',
		component: LoadableComponent(() => import('@scenes/Login')),
		showInMenu: true,
	},
	{
		path: RouterPath.g_exception,
		title: 'exception',
		name: 'exception',
		showInMenu: false,
		component: LoadableComponent(() => import('@scenes/Exception')),
	},
	{
		path: RouterPath.g_forgot,
		name: 'Forgot password',
		title: 'Forgot password',
		component: LoadableComponent(() => import('@scenes/Login/Forgot')),
		showInMenu: true,
	},
	{
		path: '/g/test',
		name: 'login',
		title: 'LogIn',
		component: LoadableComponent(() => import('@scenes/Guest')),
		showInMenu: true,
	},
	{
		path: RouterPath.g_rechargemoney,
		name: 'RechargeMoney',
		title: 'Recharge Money',
		component: LoadableComponent(() => import('@src/scenes/Guest/RechargeMoney')),
		showInMenu: true,
	},
];
