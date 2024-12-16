import * as React from 'react';
import { Tabs, } from 'antd';
import { L, isGranted } from '@src/lib/abpUtility';
import AppConsts from '@src/lib/appconst';
import BankReconciliationAdmin from './components/BankReconsile/BankReconciliationAdmin';
import CashMoneyReconciliationAdmin from './components/CashReconsile/CashMoneyReconciliationAdmin';
import RFIDReconciliationAdmin from './components/RFIDReconcile/RFIDReconciliationAdmin';
import { stores } from '@src/stores/storeInitializer';


export const tabManager = {
    tab_1: L("Đối soát ngân hàng"),
    tab_2: L('Đối soát tiền mặt'),
    tab_3: L("Đối soát RFID"),
}
export default class ReconciliationAdmin extends React.Component {
    render() {
        return (
            <Tabs onChange={e => {
                if (e == tabManager.tab_1) {
                    stores.reconcileStore.getAllBankReconcileByAdmin(undefined,undefined, undefined, undefined, undefined, 1, 10)
                }
                else if (e == tabManager.tab_2) {
                    stores.reconcileStore.getAllReconcileCashByAdmin(undefined, undefined, undefined, 1, 10);
                }
                else if (e == tabManager.tab_3) {
                    stores.reconcileStore.getAllRFIDReconcileByAdmin(undefined,undefined, undefined,undefined, undefined, 1, 10)
                }
            }}
             defaultActiveKey={tabManager.tab_1}>
                    <Tabs.TabPane tab={tabManager.tab_1} key={tabManager.tab_1}>
                        <BankReconciliationAdmin/>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={tabManager.tab_2} key={tabManager.tab_2} >
                        <CashMoneyReconciliationAdmin/>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={tabManager.tab_3} key={tabManager.tab_3} >
                        <RFIDReconciliationAdmin/>
                    </Tabs.TabPane>
                </Tabs>
        )
    }
}