import { EyeFilled } from '@ant-design/icons';
import LoadableComponent from '../Loadable/index';
import { EyeOutlined } from '@ant-design/icons';
import AppConsts, { RouterPath } from '@src/lib/appconst';

const prefixSystem = RouterPath.admin_monitor;
const permissionMonitor= AppConsts.Permission;
export const appMonitorRouters: any = {
	path: prefixSystem + '',
	key: '1',
	permission: permissionMonitor.Pages_DailyMonitoring,
	title: "Hoạt động hàng ngày",
	name: "Hoạt động hàng ngày",
	icon: EyeOutlined,
	showInMenu: true,
	component: [
		{
			path: prefixSystem + "/machine_status_monitor",
			key: '1',
			permission: permissionMonitor.Pages_DailyMonitoring,
			title: "Trạng thái máy hôm nay",
			name: "billing",
			icon: EyeFilled,
			showInMenu: true,
			component: LoadableComponent(() => import('@src/scenes/Monitor/MachineStatusMonitoring/index'))
		},
		{
			path: prefixSystem + "/transaction_detail_today",
			key: '1',
			permission: permissionMonitor.Pages_History_ChiTietGiaoDichTheoTungMay,
			title: "Giao dịch từng máy hôm nay",
			name: "transaction_detail_today",
			icon: EyeFilled,
			showInMenu: true,
			component: LoadableComponent(() => import('@scenes/Monitor/TransactionDetailToday')),
		},
	]
};

