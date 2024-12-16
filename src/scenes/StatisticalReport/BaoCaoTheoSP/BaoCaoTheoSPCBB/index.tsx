
import { isGranted } from '@src/lib/abpUtility';
import * as React from 'react';
import AppConsts from '@src/lib/appconst';
import BaoCaoTheoSanPhamCoBaoBiAdmin from './component/BaoCaoTheoSanPhamCoBaoBiAdmin';
import BaoCaoTheoSanPhamCoBaoBiUser from './component/BaoCaoTheoSanPhamCoBaoBiUser';

export default class BaoCaoTheoSanPhamCoBaoBi extends React.Component {
    render() {
        return (
            <>
                {isGranted(AppConsts.Permission.Pages_Statistic_Admin_BillingOfProduct)
                    ?
                    <BaoCaoTheoSanPhamCoBaoBiAdmin />
                    :
                    <BaoCaoTheoSanPhamCoBaoBiUser />
                }
            </>
        )
    }
}
