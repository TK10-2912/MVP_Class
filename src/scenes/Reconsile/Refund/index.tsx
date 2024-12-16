import * as React from 'react';
import { Tabs, } from 'antd';
import { L, isGranted } from '@src/lib/abpUtility';
import AppConsts from '@src/lib/appconst';
import RefundUser from './RefundUser';
import RefundAdmin from './RefundAdmin';

export interface Iprops {

}
export default class Refund extends React.Component<Iprops> {
    render() {
        return (
            <>
                {(isGranted(AppConsts.Permission.Pages_Reconcile_Admin_Reconcile)) ? <RefundAdmin /> : <RefundUser />}
            </>
        )
    }
}