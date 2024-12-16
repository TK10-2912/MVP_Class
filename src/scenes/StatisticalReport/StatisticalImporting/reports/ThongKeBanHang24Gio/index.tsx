
import { isGranted } from '@src/lib/abpUtility';
import * as React from 'react';
import AppConsts from '@src/lib/appconst';
import ThongKeBanHang24GioAdmin from './ThongKeBanHang24GioAdmin';
import ThongKeBanHang24GioUser from './ThongKeBanHang24GioUser';

export default class ThongKeBanHang24Gio extends React.Component {


    render() {

        return (
            <>
                {isGranted(AppConsts.Permission.Pages_Statistic_Admin_BillingOf24h) ? <ThongKeBanHang24GioAdmin /> : <ThongKeBanHang24GioUser />}
            </>
        )
    }
}
