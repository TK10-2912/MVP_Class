import AppConsts from '@src/lib/appconst';
import * as React from 'react';
import { isGranted } from '@src/lib/abpUtility';
import HistoryPaymentRFIDAdmin from './componentsAdmin';
import HistoryPaymentRFIDUser from './componentsUser';

export default class RIFDPayment extends React.Component {
	render() {
		return (
			<>
				{isGranted(AppConsts.Permission.Pages_Manager_General_Admin_RFID) ? <HistoryPaymentRFIDAdmin /> : <HistoryPaymentRFIDUser/>}
			</>
		)
	}
}