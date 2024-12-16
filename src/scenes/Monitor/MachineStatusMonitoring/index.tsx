import { isGranted } from '@src/lib/abpUtility';
import AppConsts from '@src/lib/appconst';
import * as React from 'react';
import MachineStatusMonitoringAdmin from './componentAdmin';
import MachineStatusMonitoringUser from './componentUser';
export default class MachineStatusMonitoring extends React.Component {
	render() {
		return (
			<>
				{isGranted(AppConsts.Permission.Pages_DailyMonitoring_Admin_Monitor) ? <MachineStatusMonitoringAdmin /> : <MachineStatusMonitoringUser />}
			</>
		)
	}
}