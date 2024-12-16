import { EyeFilled } from '@ant-design/icons';
import LoadableComponent from '../Loadable/index';
import { EyeOutlined } from '@ant-design/icons';
import AppConsts, { RouterPath } from '@src/lib/appconst';

const prefixSystem = RouterPath.admin_monitor;
const permissionMonitor= AppConsts.Permission;
export const appMonitorRouters: any = {
	path: prefixSystem + '',
	permission: permissionMonitor.Pages_DailyMonitoring,
	title: "Giám sát hoạt động hàng ngày",
	name: "Giám sát hoạt động hàng ngày",
	icon: EyeOutlined,
	showInMenu: true,
	component: [
		{
			path: prefixSystem + "/machine_status_monitor",
			permission: permissionMonitor.Pages_DailyMonitoring,
			title: "Giám sát trạng thái máy",
			name: "billing",
			icon: EyeFilled,
			showInMenu: true,
			component: LoadableComponent(() => import('@src/scenes/Monitor/MachineStatusMonitoring/index'))
		},
		{
			path: prefixSystem + '/sale_status_monitor',
			name: 'dashboard',
			permission: permissionMonitor.Pages_DailyMonitoring_DailySale,
			title: 'Giám sát trạng thái bán hàng',
			icon: EyeFilled,
			showInMenu: true,
			component: LoadableComponent(() => import('@src/scenes/Monitor/DailySaleMonitoring'))

		},
		{
			path: prefixSystem + '/machine_outofstock',
			permission: permissionMonitor.Pages_DailyMonitoring_OutOfStock,
			title: 'Giám sát máy hết hàng',
			name: 'reportmachine',
			icon: EyeFilled,
			showInMenu: true,
			component: LoadableComponent(() => import('@scenes/Monitor/MachineOutOfStockMonitoring')),
		},
	]
};

