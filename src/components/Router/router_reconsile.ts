import LoadableComponent from '../Loadable/index';
import { AppstoreOutlined, MoneyCollectOutlined, ReconciliationOutlined  } from '@ant-design/icons';
import { L } from '@src/lib/abpUtility';
import AppConsts, { RouterPath } from '@src/lib/appconst';

const prefixSystem = RouterPath.admin_reconsile;
const permissionReconcile= AppConsts.Permission;
export const appRefundRouters: any = {
	path: prefixSystem + '',
	key: '4',
	permission: permissionReconcile.Pages_Reconcile,
	title: "Đối soát",
	name: "Đối soát",
	icon: ReconciliationOutlined,
	showInMenu: true,
	component: [
		{
			path: prefixSystem + "/refund",
			key: '4',
			permission: permissionReconcile.Pages_Reconcile_Refund,
			title: (L('Hoàn tiền')),
			name: "Refund",
			icon: AppstoreOutlined,
			showInMenu: true,
			component: LoadableComponent(() => import('@src/scenes/Reconsile/Refund'))
		},
		{
			path: prefixSystem + "/reconsile_money",
			key: '4',
			permission:permissionReconcile.Pages_Reconcile_Reconcile,
			title: (L('Đối soát')),
			name: "Reconsile Bank",
			icon: AppstoreOutlined,
			showInMenu: true,
			component: LoadableComponent(() => import('@src/scenes/Reconsile/Reconciliation/'))
		},
		
	]
};

