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
			path: prefixSystem + '/sale_status_monitor',
			key: '1',
			name: 'dashboard',
			permission: permissionMonitor.Pages_DailyMonitoring_DailySale,
			title: 'Trạng thái bán hàng hôm nay',
			icon: EyeFilled,
			showInMenu: true,
			component: LoadableComponent(() => import('@src/scenes/Monitor/DailySaleMonitoring'))

		},
		{
            path: prefixSystem + '/reportmachine',
			key: '1',
            permission: permissionMonitor.Pages_Manager_General_ReportOfMachine,
            title: 'Tình trạng máy hôm nay',
            name: 'reportmachine',
            icon: EyeFilled,
            showInMenu: true,
            component: LoadableComponent(() => import('@scenes/GeneralManager/ReportOfMachine')),
        },
		{
			path: prefixSystem + '/machine_out_of_stock',
			key: '1',
			permission: permissionMonitor.Pages_DailyMonitoring_OutOfStock,
			title: 'Máy hết hàng hôm nay',
			name: 'reportoutofstockmachine',
			icon: EyeFilled,
			showInMenu: true,
			component: LoadableComponent(() => import('@scenes/Monitor/MachineOutOfStockMonitoring')),
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

