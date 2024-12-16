import * as React from 'react';
import { Tabs, } from 'antd';
import { L, isGranted } from '@src/lib/abpUtility';
import LogsRFID from '../LogsRFID';
import AppConsts from '@src/lib/appconst';
import RFIDAdmin from './RFIDAdmin';
import RFIDUser from './RFIDUser';
export interface Iprops {
}
export const tabManager = {
    tab_1: "Quản lý thẻ RFID",
    tab_2: 'Hoạt động thẻ RFID',
}
export default class TabRFID extends React.Component<Iprops> {
    state = {
        tab: "",
    }
    render() {
        return (
            <>
                <Tabs onChange={(e) => this.setState({ tab: e })} defaultActiveKey={tabManager.tab_1} style={{ fontSize: 30 }}>
                    <Tabs.TabPane tab={tabManager.tab_1} key={tabManager.tab_1}>
                        {(isGranted(AppConsts.Permission.Pages_Manager_General_Admin_RFID)) ?
                            <RFIDAdmin /> : <RFIDUser />
                        }
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={tabManager.tab_2} key={tabManager.tab_2} >
                        <LogsRFID tab={this.state.tab} ></LogsRFID>
                    </Tabs.TabPane>
                </Tabs>
            </>
        )
    }
}