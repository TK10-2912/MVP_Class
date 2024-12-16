import * as React from 'react';
import { Tabs, } from 'antd';
import { L } from '@src/lib/abpUtility';
import BankingPayment from './BankingPayment';
import HistoryPaymentRFID from './RIFDPayment';
import CashPayment from './CashPayment';

export interface Iprops {
}
export const tabManager = {
    tab_1: L("Lịch sử thanh toán bằng ngân hàng"),
    tab_2: L('Lịch sử thanh toán bằng RFID'),
    tab_3: "Lịch sử thanh toán bằng tiền mặt"
}
export default class TabCreateUpdateDocumentDocumentInfor extends React.Component<Iprops> {
    render() {
        return (
            <>
                <Tabs  onChange={(e) => this.setState({ tab: e })} defaultActiveKey={tabManager.tab_1}>
                    <Tabs.TabPane tab={tabManager.tab_1} key={tabManager.tab_1}>
                        <BankingPayment ></BankingPayment>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={tabManager.tab_2} key={tabManager.tab_2} >
                        <HistoryPaymentRFID></HistoryPaymentRFID>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={tabManager.tab_3} key={tabManager.tab_3} >
                        <CashPayment ></CashPayment>
                    </Tabs.TabPane>
                </Tabs>
            </>
        )
    }
}