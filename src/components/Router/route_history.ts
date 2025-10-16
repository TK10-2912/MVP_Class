import { AppstoreOutlined, HistoryOutlined } from '@ant-design/icons';
import AppConsts, { RouterPath } from '@src/lib/appconst';
import LoadableComponent from '../Loadable/index';

const prefixSystem = RouterPath.admin_history;
const permissionHistory = AppConsts.Permission;
export const appHistoryRouters: any = {
	path: prefixSystem + '',
	key: '2',
	permission: [permissionHistory.Pages_History],
	title: "Lịch sử",
	name: "Lịch sử",
	icon: HistoryOutlined,
	showInMenu: true,
	component: [
		{
			path: prefixSystem + "/transaction_detail",
			key: '2',
			permission: permissionHistory.Pages_History_ChiTietGiaoDichTheoTungMay,
			title: "Chi tiết giao dịch cho từng máy",
			name: "transaction_detail",
			icon: AppstoreOutlined,
			showInMenu: true,
			component: LoadableComponent(() => import('@scenes/HistoryMVP/LichSuChiTietGiaoDichTungMay')),
		}
	]
};

