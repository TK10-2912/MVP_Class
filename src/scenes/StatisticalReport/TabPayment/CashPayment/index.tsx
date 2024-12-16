import * as React from 'react';
import TransactionDetail from '@src/scenes/HistoryMVP/LichSuChiTietGiaoDichTungMay';

export default class CashPayment extends React.Component {
	private transactionDetailRef = React.createRef<TransactionDetail>();
	getAll = () => {
		this.transactionDetailRef.current?.getAll();
	}
	render() {
		return (
			<TransactionDetail
				ref={this.transactionDetailRef}
				parent={"history"}
				cash_payment={true} />
		)
	}
}