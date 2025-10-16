import LoadableComponent from '../Loadable/index';
import { AppstoreOutlined, BarChartOutlined } from '@ant-design/icons';
import { L } from '@src/lib/abpUtility';
import AppConsts, { RouterPath } from '@src/lib/appconst';

const prefixSystem = RouterPath.admin_statistic;
const permissionStatic = AppConsts.Permission;
export const appStatisticalRouters: any = {
    path: prefixSystem + '',
    key: '3',
    permission: permissionStatic.Pages_Statistic,
    title: 'Thống kê',
    name: 'Thống kê',
    icon: BarChartOutlined,
    showInMenu: true,
    component: [
        {
            path: prefixSystem + '/report_by_product',
            key: '3',
            permission: permissionStatic.Pages_Statistic_BillingOfProductWithMachine,
            title: L('Báo cáo theo sản phẩm'),
            name: 'Product Reports',
            icon: AppstoreOutlined,
            showInMenu: true,
            component: LoadableComponent(() => import('@src/scenes/StatisticalReport/BaoCaoTheoSP')),
        },
        {
            path: prefixSystem + '/price_reports',
            key: '3',
            permission: permissionStatic.Pages_Statistic_PriceUnit,
            title: L('Báo cáo theo giá bán'),
            name: 'Price Reports',
            icon: AppstoreOutlined,
            showInMenu: true,
            component: LoadableComponent(
                () =>
                    import(
                        '@src/scenes/StatisticalReport/StatisticalImporting/reports/BaoCaoTheoGiaBan/index'
                    )
            ),
        },
        {
            path: prefixSystem + '/billing_of_payment',
            key: '3',
            permission: permissionStatic.Pages_Statistic_BillingOfPayment,
            title: L('Báo cáo theo loại hình thanh toán'),
            name: 'Payment Types Report',
            icon: AppstoreOutlined,
            showInMenu: true,
            component: LoadableComponent(
                () =>
                    import(
                        '@src/scenes/StatisticalReport/StatisticalImporting/reports/BaoCaoTheoLoaiHinhThanhToan/index'
                    )
            ),
        },
        {
            path: prefixSystem + '/turnover_by_machine_report',
            key: '3',
            permission: permissionStatic.Pages_Statistic_BillingOfMachine,
            title: L('Thống kê doanh thu theo máy'),
            name: 'Turnover By Machine Report',
            icon: AppstoreOutlined,
            showInMenu: true,
            component: LoadableComponent(
                () =>
                    import(
                        '@src/scenes/StatisticalReport/StatisticalImporting/reports/ThongKeDoanhThuTheoMay/index'
                    )
            ),
        }
    ],
};
