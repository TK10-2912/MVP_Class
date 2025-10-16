import { AndroidOutlined, AppstoreOutlined, CreditCardOutlined, DeploymentUnitOutlined, GoldOutlined, HddOutlined, LayoutOutlined, PictureOutlined, RestOutlined, ShopOutlined, TagsOutlined, TeamOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { L } from '@src/lib/abpUtility';
import AppConsts, { RouterPath } from '@src/lib/appconst';
import LoadableComponent from '../Loadable/index';

const prefixSystem = RouterPath.admin_general;
const permissionGeneral= AppConsts.Permission;
export const appGeneralRouters: any = {
    path: prefixSystem + '',
    key: '5',
    permission: [permissionGeneral.Pages_Manager_General],
    title: "Quản lý chung",
    name: "Quản lý chung",
    icon: AppstoreOutlined,
    showInMenu: true,
    component: [
        {
            path: prefixSystem + '/machine',
            key: '5',
            permission: permissionGeneral.Pages_Manager_General_Machine,
            title: 'Máy bán nước',
            name: 'machine',
            icon: HddOutlined,
            showInMenu: true,
            component: LoadableComponent(() => import('@scenes/GeneralManager/Machine')),
        },
        {
            path: prefixSystem + '/product',
            key: '5',
            permission: permissionGeneral.Pages_Manager_General_Product,
            title: (L('Sản phẩm')),
            name: 'Product',
            icon: GoldOutlined,
            showInMenu: true,
            component: LoadableComponent(() => import('@scenes/GeneralManager/Product')),
        },
        {
            path: prefixSystem + '/supplier',
            key: '5',
            permission: permissionGeneral.Pages_Manager_General_Supplier,
            title: (L('Nhà cung cấp')),
            name: 'organization',
            icon: ShopOutlined,
            showInMenu: true,
            component: LoadableComponent(() => import('@src/scenes/GeneralManager/Supplier')),
        },
        {
            path: prefixSystem + '/picturemanager',
            key: '5',
            permission: permissionGeneral.Pages_Manager_General_Image,
            title: 'Quản lý ảnh sản phẩm',
            name: 'picturemanager',
            icon: PictureOutlined,
            showInMenu: true,
            component: LoadableComponent(() => import('@scenes/GeneralManager/PictureManager')),
        },
        {
            path: prefixSystem + '/authorization_machine',
            key: '5',
            permission:permissionGeneral.Pages_Manager_General_Authorization_Machine,
            title: 'Uỷ quyền vận hành',
            name: 'authorization_machine',
            icon: TeamOutlined,
            showInMenu: true,
            component: LoadableComponent(() => import('@scenes/GeneralManager/AuthorizationMachine')),
        },
         
        {
            path: prefixSystem + '/repository',
            key: '5',
            permission: permissionGeneral.Pages_Manager_General_Repository,
            title: 'Kho lưu trữ',
            name: 'repository',
            icon: DeploymentUnitOutlined,
            showInMenu: true,
            component: LoadableComponent(() => import('@scenes/GeneralManager/Repository')),
        },
        {
            path: prefixSystem + '/layout',
            key: '5',
            permission: permissionGeneral.Pages_Manager_General_Layout,
            title: 'Bố cục mẫu',
            name: 'layout',
            icon: LayoutOutlined,
            showInMenu: true,
            component: LoadableComponent(() => import('@scenes/GeneralManager/Layout')),
        },
        {
            path: prefixSystem + '/trashbin',
            key: '5',
            permission: "",
            title: 'Thùng rác',
            name: 'trashbin',
            icon: RestOutlined,
            showInMenu: true,
            component: LoadableComponent(() => import('@scenes/GeneralManager/TrashBin')),
        },

    ]
};

