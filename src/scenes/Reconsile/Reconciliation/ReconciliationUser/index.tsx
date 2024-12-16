import * as React from 'react';
import { Tabs, } from 'antd';
import { L } from '@src/lib/abpUtility';
import BankReconciliationUser from './components/BankReconcile/BankReconciliationUser';
import CashMoneyReconciliationUser from './components/CashReconsile/CashMoneyReconciliationUser';
import RFIDReconciliationUser from './components/RFIDReconcile/RFIDReconciliationUser';
import { stores } from '@src/stores/storeInitializer';
export const tabManager = {
    tab_1: L("Đối soát ngân hàng"),
    tab_2: L('Đối soát tiền mặt'),
    tab_3: L("Đối soát RFID"),
}
export default class ReconciliationUser extends React.Component {
    state = {
        tab: "Đối soát ngân hàng",
    }
    render() {
        return (
            <Tabs defaultActiveKey={tabManager.tab_1}>
                <Tabs.TabPane tab={tabManager.tab_1} key={tabManager.tab_1} >
                    <BankReconciliationUser />
                </Tabs.TabPane>
                <Tabs.TabPane tab={tabManager.tab_2} key={tabManager.tab_2} >
                    <CashMoneyReconciliationUser />
                </Tabs.TabPane>
                <Tabs.TabPane tab={tabManager.tab_3} key={tabManager.tab_3} >
                    <RFIDReconciliationUser />
                </Tabs.TabPane>
            </Tabs>
        )
    }
}