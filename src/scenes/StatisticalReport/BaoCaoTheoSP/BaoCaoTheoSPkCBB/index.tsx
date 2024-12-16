
import { isGranted } from '@src/lib/abpUtility';
import * as React from 'react';
import AppConsts from '@src/lib/appconst';
import BaoCaoTheoSanPhamKhongCoBaoBiAdmin from './component/BaoCaoTheoSanPhamKBBAdmin';
import BaoCaoTheoSanPhamKhongCoBaoBiUser from './component/BaoCaoTheoSanPhamKBBUser';

export default class BaoCaoTheoSanPhamKhongCoBaoBi extends React.Component {


    render() {

        return (
            <>
                {isGranted(AppConsts.Permission.Pages_Statistic_Admin_BillingOfProduct) ? <BaoCaoTheoSanPhamKhongCoBaoBiAdmin /> : <BaoCaoTheoSanPhamKhongCoBaoBiUser />}
            </>
        )
    }
}