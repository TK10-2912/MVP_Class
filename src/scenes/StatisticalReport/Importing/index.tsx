import { isGranted } from '@src/lib/abpUtility';
import AppConsts from '@src/lib/appconst';
import * as React from 'react';
import ImportingAdmin from './componentsAdmin';
import ImportingUser from './componentUser';
export default class Importing extends React.Component {

	render() {
		return (
			<>
				{isGranted(AppConsts.Permission.Pages_History_Admin_LichSuNhapHang) ? <ImportingAdmin /> : <ImportingUser />}
			</>
		)
	}
}