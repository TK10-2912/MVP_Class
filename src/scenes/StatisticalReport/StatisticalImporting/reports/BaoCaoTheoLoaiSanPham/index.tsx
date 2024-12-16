
import { isGranted } from '@src/lib/abpUtility';
import * as React from 'react';
import AppConsts from '@src/lib/appconst';
import BaoCaoTheoLoaiSanPhamAdmin from './BaoCaoTheoLoaiSanPhamAdmin';
import BaoCaoTheoLoaiSanPhamUser from './BaoCaoTheoLoaiSanPhamUser';

export default class ThongKeBanHang24Gio extends React.Component {


    render() {

        return (
            <>
                {isGranted(AppConsts.Permission.Pages_Statistic_Admin_DrinkType) ? <BaoCaoTheoLoaiSanPhamAdmin /> : <BaoCaoTheoLoaiSanPhamUser />}
            </>
        )
    }
}