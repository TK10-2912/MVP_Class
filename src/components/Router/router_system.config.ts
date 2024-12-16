import LoadableComponent from '../Loadable/index';
import { UserOutlined, TagsOutlined, AppstoreOutlined, SettingOutlined, HistoryOutlined } from '@ant-design/icons';
import { L } from '@src/lib/abpUtility';
import AppConsts, { RouterPath } from '@src/lib/appconst';

const prefixSystem = RouterPath.admin_system;
export const appSystemRouters: any = {
        path: prefixSystem + '',
        permission: AppConsts.Permission.Pages_Manager_System,
        key: '6',
        title: "Hệ thống",
        name: "System",
        icon: SettingOutlined,
        showInMenu: true,
        component: [
                {
                        path: prefixSystem + '/users',
                        key: '6',
                        permission: AppConsts.Permission.Pages_Manager_System_Users,
                        title: ("Người dùng"),
                        name: 'user',
                        icon: UserOutlined,
                        showInMenu: true,
                        component: LoadableComponent(() => import('@scenes/SystemManager/Users')),
                },
                {
                        path: prefixSystem + '/roles',
                        key: '6',
                        permission: AppConsts.Permission.Pages_Manager_System_Roles,
                        title: ("Vai trò"),
                        name: 'role',
                        icon: TagsOutlined,
                        showInMenu: true,
                        component: LoadableComponent(() => import('@scenes/SystemManager/Roles')),
                },
                {
                        path: prefixSystem + '/auditlogs',
                        key: '6',
                        permission: AppConsts.Permission.Pages_Manager_System_AuditLog,
                        title: ("Nhật ký đăng nhập"),
                        name: 'Audit Log',
                        icon: HistoryOutlined,
                        showInMenu: true,
                        component: LoadableComponent(() => import('@scenes/SystemManager/AuditLog')),
                },
                {
                        path: prefixSystem + '/tenants',
                        key: '6',
                        permission: AppConsts.Permission.Pages_Manager_System_Tenants,
                        title: ("Tenants"),
                        name: 'Tenants',
                        icon: AppstoreOutlined,
                        showInMenu: true,
                        component: LoadableComponent(() => import('@scenes/SystemManager/Tenants')),
                },
                {
                        path: prefixSystem + '/setting',
                        key: '6',
                        // permission: AppConsts.Permission,
                        title: ("Cài đặt"),
                        name: 'setting',
                        icon: SettingOutlined,
                        showInMenu: true,
                        component: LoadableComponent(() => import('@scenes/SystemManager/Setting')),
                },
        ]
};

