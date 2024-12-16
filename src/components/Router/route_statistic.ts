import LoadableComponent from '../Loadable/index';
import { AppstoreOutlined, SettingOutlined } from '@ant-design/icons';
import { L } from '@src/lib/abpUtility';
import AppConsts, { RouterPath } from '@src/lib/appconst';

const prefixSystem = RouterPath.admin_statistic;
const permissionStatic= AppConsts.Permission;
export const appStatisticalRouters: any = {
	path: prefixSystem + '',
	permission:  permissionStatic.Pages_Statistic,
	title: "Thống kê",
	name: "Thống kê",
	icon: SettingOutlined,
	showInMenu: true,
	component: [
		{
			path: prefixSystem + "/bao_cao_theo_san_pham_co_bao_bi",
			permission: permissionStatic.Pages_Statistic_BillingOfProductWithMachine,
			title: (L('Báo cáo theo sản phẩm có bao bì')),
			name: "Product Reports",
			icon: AppstoreOutlined,
			showInMenu: true,
			component: LoadableComponent(() => import('@src/scenes/StatisticalReport/BaoCaoTheoSPCBB'))
		},
		{
			path: prefixSystem + "/bao_cao_theo_san_pham_khong_co_bao_bi",
			permission: permissionStatic.Pages_Statistic_BillingOfProductWithMachine,
			title: (L('Báo cáo theo sản phẩm không có bao bì')),
			name: "Product Reports",
			icon: AppstoreOutlined,
			showInMenu: true,
			component: LoadableComponent(() => import('@src/scenes/StatisticalReport/BaoCaoTheoSPkCBB'))
		},
		{
			path: prefixSystem + "/product_type_reports",
			permission: permissionStatic.Pages_Statistic_DrinkType,
			title: (L('Báo cáo theo loại sản phẩm')),
			name: "Product Type Reports",
			icon: AppstoreOutlined,
			showInMenu: true,
			component: LoadableComponent(() => import('@src/scenes/StatisticalReport/StatisticalImporting/reports/BaoCaoTheoLoaiSanPham'))
		},
		{
			path: prefixSystem + "/price_reports",
			permission: permissionStatic.Pages_Statistic_Admin_PriceUnit,
			title: (L('Báo cáo theo giá bán')),
			name: "Price Reports",
			icon: AppstoreOutlined,
			showInMenu: true,
			component: LoadableComponent(() => import('@src/scenes/StatisticalReport/StatisticalImporting/reports/BaoCaoTheoGiaBan/index'))
		},
		{
			path: prefixSystem + "/billing_of_payment",
			permission: permissionStatic.Pages_Statistic_BillingOfPayment,
			title: (L('Báo cáo theo loại hình thanh toán')),
			name: "Payment Types Report",
			icon: AppstoreOutlined,
			showInMenu: true,
			component: LoadableComponent(() => import('@src/scenes/StatisticalReport/StatisticalImporting/reports/BaoCaoTheoLoaiHinhThanhToan/index'))
		},
		{
			path: prefixSystem + "/turnover_by_machine_report",
			permission: permissionStatic.Pages_Statistic_BillingOfMachine,
			title: (L('Thống kê doanh thu theo máy')),
			name: "Turnover By Machine Report",
			icon: AppstoreOutlined,
			showInMenu: true,
			component: LoadableComponent(() => import('@src/scenes/StatisticalReport/StatisticalImporting/reports/ThongKeDoanhThuTheoMay/index'))
		},
		{
			path: prefixSystem + "/sales_24h_report",
			permission: permissionStatic.Pages_Statistic_BillingOf24h,
			title: (L('Thống kê bán hàng 24 giờ')),
			name: "Sales 24h Report",
			icon: AppstoreOutlined,
			showInMenu: true,
			component: LoadableComponent(() => import('@src/scenes/StatisticalReport/StatisticalImporting/reports/ThongKeBanHang24Gio/index'))
		},
		{
			path: prefixSystem + "/withdraw_report",
			permission: permissionStatic.Pages_Statistic_MoneyWithdraw,
			title: (L('Thống kê rút tiền từ máy bán nước')),
			name: "Sales 24h Report",
			icon: AppstoreOutlined,
			showInMenu: true,
			component: LoadableComponent(() => import('@src/scenes/StatisticalReport/StatisticalImporting/reports/Withdraw/index'))
		},
	]
};

