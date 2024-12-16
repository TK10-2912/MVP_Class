import * as React from 'react';
import { isGranted } from '@src/lib/abpUtility';
import AppConsts from '@src/lib/appconst';
import LogsRFIDAdmin from './componentsAdmin';
import LogsRFIDUser from './componentsUser';
export interface IProps {
	status?: number;
	rf_code?: string;
	tab?:string;
}
export default class LogsRFID extends React.Component<IProps> {
	
	render() {
		return (
			<>
			{isGranted(AppConsts.Permission.Pages_Manager_General_Admin_RFID) ? <LogsRFIDAdmin tab={this.props.tab}/>: <LogsRFIDUser tab={this.props.tab}/>}
			</>
		)
	}
}