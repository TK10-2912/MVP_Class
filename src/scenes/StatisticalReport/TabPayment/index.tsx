import * as React from 'react';
import { Tabs, } from 'antd';
import { isGranted, L } from '@src/lib/abpUtility';
import BankingPayment from './BankingPayment';
import HistoryPaymentRFID from './RIFDPayment';
import CashPayment from './CashPayment';
import AppConsts from '@src/lib/appconst';
import { stores } from '@src/stores/storeInitializer';

export interface Iprops {
}
export const tabManager = {
    tab_1: L("Lịch sử thanh toán bằng ngân hàng"),
    tab_2: L('Lịch sử thanh toán bằng RFID'),
    tab_3: "Lịch sử thanh toán bằng tiền mặt"
}
export default class TabCreateUpdateDocumentDocumentInfor extends React.Component<Iprops> {
    private paymentBank = React.createRef<BankingPayment>();
    private historyPaymentRFID = React.createRef<HistoryPaymentRFID>();
    private cashPayment = React.createRef<CashPayment>();

    render() {
        return (
            <>
                <Tabs onChange={async e => {
                    if (e == tabManager.tab_1) {
                        this.paymentBank.current?.checkPermission();
                    }
                    if (e == tabManager.tab_2) {
                        this.historyPaymentRFID.current?.checkPermission();
                    }
                    if (e == tabManager.tab_3) {
                        this.cashPayment.current?.getAll();
                    }
                }} defaultActiveKey={tabManager.tab_1} style={{ padding: 0, margin: 0 }}>
                    <Tabs.TabPane tab={tabManager.tab_1} key={tabManager.tab_1}>
                        <BankingPayment ref={this.paymentBank} ></BankingPayment>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={tabManager.tab_2} key={tabManager.tab_2} >
                        <HistoryPaymentRFID ref={this.historyPaymentRFID}></HistoryPaymentRFID>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={tabManager.tab_3} key={tabManager.tab_3} >
                        <CashPayment ref={this.cashPayment}></CashPayment>
                    </Tabs.TabPane>
                </Tabs>
            </>
        )
    }
}