
import { isGranted } from '@src/lib/abpUtility';
import * as React from 'react';
import AppConsts from '@src/lib/appconst';
import BaoCaoHoatDongMayBanNuocAdmin from './componentsAdmin';
import BaoCaoHoatDongMayBanNuocUser from './componentsUser';

export default class BaoCaoHoatDongMayBanNuoc extends React.Component {


    render() {

        return (
            <>
                {isGranted(AppConsts.Permission.Pages_Statistic_Admin_ImportSellRemainProduct) ? <BaoCaoHoatDongMayBanNuocAdmin /> : <BaoCaoHoatDongMayBanNuocUser />}
            </>
        )
    }
}
