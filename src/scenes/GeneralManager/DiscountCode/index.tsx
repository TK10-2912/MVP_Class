
import { isGranted } from '@src/lib/abpUtility';
import AppConsts from '@src/lib/appconst';
import * as React from 'react';
import DiscountCodeAdmin from './DiscountCodeAdmin';
import DiscountCodeUser from './DiscountCodeUser';


export default class DiscountCode extends React.Component<any> {	
	render() {
		return (
			<>{isGranted(AppConsts.Permission.Pages_Manager_General_Admin_Discount) ? <DiscountCodeAdmin />:<DiscountCodeUser /> }</>
		)
	}
}
