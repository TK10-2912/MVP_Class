import AppConsts from '@src/lib/appconst';
import * as React from 'react';
import { isGranted } from '@src/lib/abpUtility';
import HistoryPaymentRFIDAdmin from './componentsAdmin';
import HistoryPaymentRFIDUser from './componentsUser';

export default class RIFDPayment extends React.Component {
	private historyPaymentRFIDAdmin = React.createRef<HistoryPaymentRFIDAdmin>();
	private historyPaymentRFIDUser = React.createRef<HistoryPaymentRFIDUser>();
	checkPermission = () => {
		if (isGranted(AppConsts.Permission.Pages_Manager_General_Admin_RFID)) {
			this.historyPaymentRFIDAdmin.current?.getAll();
		}
		else this.historyPaymentRFIDUser.current?.getAll();
	}
	render() {
		return (
			<>
				{isGranted(AppConsts.Permission.Pages_Manager_General_Admin_RFID) ? <HistoryPaymentRFIDAdmin ref={this.historyPaymentRFIDAdmin} /> : <HistoryPaymentRFIDUser ref={this.historyPaymentRFIDUser} />}
			</>
		)
	}
}