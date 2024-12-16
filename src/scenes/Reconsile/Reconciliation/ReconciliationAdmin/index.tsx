import * as React from 'react';
import { Tabs, } from 'antd';
import { L } from '@src/lib/abpUtility';
import BankReconciliationAdmin from './components/BankReconsile/BankReconciliationAdmin';
import RFIDReconciliationAdmin from './components/RFIDReconcile/RFIDReconciliationAdmin';
import { stores } from '@src/stores/storeInitializer';
import CashMoneyReconciliationAdmin from './components/CashReconsile/CashMoneyReconciliationAdmin';
import ReconcileDebt from '../../ReconcileDebt';
import ReconcileDebtHistory from '../../ReconcileDebtHistory';


export const tabManager = {
    tab_1: L("Đối soát ngân hàng"),
    tab_2: L('Đối soát tiền mặt'),
    tab_3: L("Đối soát nạp thẻ RFID"),
    tab_4: "Đối soát nhập hàng",
    tab_5: "Lịch sử đối soát nhập hàng",
}
export default class ReconciliationAdmin extends React.Component {
    state = {
        isLoadDone: false,
        rec_month: undefined,
        su_id: undefined,
        tab: tabManager.tab_1,
    }
    historyReconcileDelete = (su_id: number, rec_month: string) => {
        this.setState({ tab: tabManager.tab_5, su_id: su_id, rec_month: rec_month })
    }
    async componentDidMount(){
        await stores.billingStore.getAllByAdmin(undefined,undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    }
    render() {
        return (
            <Tabs onChange={async e => {
                if (e == tabManager.tab_1) {
                   await stores.reconcileStore.getAllBankReconcileByAdmin(undefined,undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined)
                    this.setState({ tab: tabManager.tab_1 })
                }
                else if (e == tabManager.tab_2) {
                    await this.setState({ tab: tabManager.tab_2 })
                    stores.reconcileStore.getAllReconcileCashByAdmin(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
                }
                else if (e == tabManager.tab_3) {
                    await this.setState({ tab: tabManager.tab_3 })
                    stores.reconcileStore.getAllRFIDReconcileByAdmin(undefined,undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined)
                }
                else if (e == tabManager.tab_4) {
                    await stores.reconcileStore.getAllSupplierDebtReconcile(undefined,undefined,undefined,0,10);
                    this.setState({ tab: tabManager.tab_4, su_id: undefined, rec_month: undefined })
                }
                else if (e == tabManager.tab_5) {
                    await stores.reconcileStore.getAllSupplierDebtReconcile(undefined,undefined,undefined,0,10);
                    this.setState({ tab: tabManager.tab_5 })
                }

            }}

                defaultActiveKey={tabManager.tab_1} activeKey={this.state.tab}>
                <Tabs.TabPane tab={tabManager.tab_1} key={tabManager.tab_1}>
                    <BankReconciliationAdmin />
                </Tabs.TabPane>
                <Tabs.TabPane tab={tabManager.tab_2} key={tabManager.tab_2} >
                    <CashMoneyReconciliationAdmin />
                </Tabs.TabPane>
                <Tabs.TabPane tab={tabManager.tab_3} key={tabManager.tab_3} >
                    <RFIDReconciliationAdmin />
                </Tabs.TabPane>
                <Tabs.TabPane tab={tabManager.tab_4} key={tabManager.tab_4} >
                    <ReconcileDebt historyReconcileDelete={this.historyReconcileDelete} />
                </Tabs.TabPane>
                <Tabs.TabPane tab={tabManager.tab_5} key={tabManager.tab_5} >
                    <ReconcileDebtHistory re_month={this.state.rec_month} su_id={this.state.su_id} />
                </Tabs.TabPane>
            </Tabs>
        )
    }
}