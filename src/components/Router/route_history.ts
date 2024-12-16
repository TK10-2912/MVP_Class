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
			path: prefixSystem + '/importing',
			key: '2',
			name: 'dashboard',
			permission: permissionHistory.Pages_History_LichSuNhapHang,
			title: 'Lịch sử nhập sản phẩm',
			icon: AppstoreOutlined,
			showInMenu: true,
			component: LoadableComponent(() => import('@scenes/StatisticalReport/Importing')),
		},
		{
			path: prefixSystem + '/cash_payment',
			key: '2',
			permission: permissionHistory.Pages_History_LichSuThanhToan,
			title: 'Lịch sử thanh toán',
			name: 'reportmachine',
			icon: AppstoreOutlined,
			showInMenu: true,
			component: LoadableComponent(() => import('@scenes/StatisticalReport/TabPayment')),
		},
		{
			path: prefixSystem + "/transaction_detail",
			key: '2',
			permission: permissionHistory.Pages_History_ChiTietGiaoDichTheoTungMay,
			title: "Chi tiết giao dịch cho từng máy",
			name: "transaction_detail",
			icon: AppstoreOutlined,
			showInMenu: true,
			component: LoadableComponent(() => import('@scenes/HistoryMVP/LichSuChiTietGiaoDichTungMay')),
		},
		{
			path: prefixSystem + "/history_report",
			key: '2',
			permission: permissionHistory.Pages_History_CanhBao,
			title: "Lịch sử cảnh báo",
			name: "history_report",
			icon: AppstoreOutlined,
			showInMenu: true,
			component: LoadableComponent(() => import('@scenes/HistoryMVP/LichSuCanhBao')),
		},
		{
			path: prefixSystem + "/sales_detail",
			key: '2',
			permission: permissionHistory.Pages_History_ChiTietBanHang,
			title: "Lịch sử chi tiết bán hàng",
			name: "sales_detail",
			icon: AppstoreOutlined,
			showInMenu: true,
			component: LoadableComponent(() => import('@scenes/HistoryMVP/LichSuChiTietBanHang')),
		},
	]
};

