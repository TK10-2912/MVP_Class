import * as React from 'react';
import { Tabs, } from 'antd';
import { L, isGranted } from '@src/lib/abpUtility';
import AppConsts from '@src/lib/appconst';
import ReconciliationAdmin from './ReconciliationAdmin';
export interface Iprops {

}
export default class Reconciliation extends React.Component<Iprops> {
    render() {
        return (
            <>
                {(isGranted(AppConsts.Permission.Pages_Reconcile_Admin_Reconcile)) && <ReconciliationAdmin /> }
            </>
        )
    }
}