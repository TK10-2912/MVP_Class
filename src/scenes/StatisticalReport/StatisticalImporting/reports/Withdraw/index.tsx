
import { isGranted } from '@src/lib/abpUtility';
import * as React from 'react';
import AppConsts from '@src/lib/appconst';
import WithdrawAdmin from './componentAdmin/indexAdmin';
import WithdrawUser from './componentUser/indexUser';

export default class Withdraw extends React.Component {

    render() {

        return (
            <>
                {isGranted(AppConsts.Permission.Pages_Statistic_Admin_MoneyWithdraw) ? <WithdrawAdmin /> : <WithdrawUser />}
            </>
        )
    }
}