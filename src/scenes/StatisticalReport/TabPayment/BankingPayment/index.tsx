import * as React from 'react';
import AppConsts from '@src/lib/appconst';
import { isGranted } from '@src/lib/abpUtility';
import BankingPaymentForAdmin from './componentAdmin';
import BankingPaymentForUser from './componentUser';

export interface IProps {
	bi_code?: string | undefined;
}
export default class BankingPayment extends React.Component<IProps> {
	render() {
		return (
			<>
				{isGranted(AppConsts.Permission.Pages_Statistic_Admin_BillingOfPayment) ? <BankingPaymentForAdmin bi_code={this.props.bi_code != undefined ? this.props.bi_code : undefined} /> : <BankingPaymentForUser bi_code={this.props.bi_code != undefined ? this.props.bi_code : undefined} />}
			</>
		)
	}
}