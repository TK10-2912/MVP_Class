import { stores } from '@src/stores/storeInitializer';
import { DatePicker, Tabs } from 'antd';
import * as React from 'react';
import AppConsts, { cssCol } from '@src/lib/appconst';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import ReceiveMachineHandover from './ReceiveMachine';
import HandoverMachine from './HandoverMachine';
import { isGranted } from '@src/lib/abpUtility';
const { RangePicker } = DatePicker;

export interface IProps {
	im_re_id: number;
	modalImport: boolean;
}
export const tabManager = {
	tab_1: "Bàn giao",
	tab_2: "Nhận bàn giao",
}
export default class Handover extends AppComponentBase<IProps> {
	render() {
		return (<>
			{isGranted(AppConsts.Permission.Pages_Manager_General_Admin_Handover) == false ?
				<Tabs defaultActiveKey={tabManager.tab_1}>
					<Tabs.TabPane tab={tabManager.tab_1} key={tabManager.tab_1}>
						<HandoverMachine />
					</Tabs.TabPane>
					<Tabs.TabPane tab={tabManager.tab_2} key={tabManager.tab_2}>
						<ReceiveMachineHandover />
					</Tabs.TabPane>
				</Tabs>
				:
				< HandoverMachine />

			}</>
		)
	}
}
