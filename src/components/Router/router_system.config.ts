import LoadableComponent from '../Loadable/index';
import { UserOutlined, TagsOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons';
import { L } from '@src/lib/abpUtility';
import AppConsts, { RouterPath } from '@src/lib/appconst';

const prefixSystem = RouterPath.admin_system;
export const appSystemRouters: any = {
    path: prefixSystem + '',
    permission: AppConsts.Permission.Pages_Manager_System,
    title: "Hệ thống",
    name: "System",
    icon: SettingOutlined,
    showInMenu: true,
    component: [

        {
            path: prefixSystem + '/users',
            permission: AppConsts.Permission.Pages_Manager_System_Users,
            title: (L('nguoi_dung')),
            name: 'user',
            icon: UserOutlined,
            showInMenu: true,
            component: LoadableComponent(() => import('@scenes/SystemManager/Users')),
        },
        {
            path: prefixSystem + '/roles',
            permission: AppConsts.Permission.Pages_Manager_System_Roles,
            title: (L('vai_tro')),
            name: 'role',
            icon: TagsOutlined,
            showInMenu: true,
            component: LoadableComponent(() => import('@scenes/SystemManager/Roles')),
        },
        {
            path: prefixSystem + '/organization',
            // permission: AppConsts.Permission.System_Organization,
            title: (L('co_cau_to_chuc')),
            name: 'organization',
            icon: AppstoreOutlined,
            showInMenu: true,
            component: LoadableComponent(() => import('@src/scenes/SystemManager/Organization')),
        },
        {
            path: prefixSystem + '/auditlogs',
            permission: AppConsts.Permission.Pages_Manager_System_AuditLog,
            title: (L('nhat_ky_dang_nhap')),
            name: 'Audit Log',
            icon: AppstoreOutlined,
            showInMenu: true,
            component: LoadableComponent(() => import('@scenes/SystemManager/AuditLog')),
        },
        {
            path: prefixSystem + '/setting',
            permission: AppConsts.Permission.Pages_Manager_System_AuditLog,
            title: (L('cai_dat')),
            name: 'Cài đặt',
            icon: AppstoreOutlined,
            showInMenu: true,
            component: LoadableComponent(() => import('@scenes/SystemManager/Setting')),
        },
    ]
};

