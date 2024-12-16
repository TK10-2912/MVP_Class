import * as React from 'react';
import AppConsts from '@src/lib/appconst';
import { isGranted } from '@src/lib/abpUtility';
import BankingPaymentForAdmin from './componentAdmin';
import BankingPaymentForUser from './componentUser';

export interface IProps {
	bi_code?: string | undefined;
}
export default class BankingPayment extends React.Component<IProps> {
	private bankingPaymentAdmin = React.createRef<BankingPaymentForAdmin>();
	private bankingPaymentUser = React.createRef<BankingPaymentForAdmin>();
	checkPermission = () => {
		if (isGranted(AppConsts.Permission.Pages_Statistic_Admin_BillingOfPayment)) {
			this.bankingPaymentAdmin.current?.getAll();
		}
		else this.bankingPaymentUser.current?.getAll();
	}
	render() {
		return (
			<>
				{isGranted(AppConsts.Permission.Pages_Statistic_Admin_BillingOfPayment) ? <BankingPaymentForAdmin ref={this.bankingPaymentAdmin} bi_code={this.props.bi_code != undefined ? this.props.bi_code : undefined} /> : <BankingPaymentForUser ref={this.bankingPaymentUser} bi_code={this.props.bi_code != undefined ? this.props.bi_code : undefined} />}
			</>
		)
	}
}