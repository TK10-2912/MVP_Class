import * as React from 'react';
import TransactionDetail from '@src/scenes/HistoryMVP/LichSuChiTietGiaoDichTungMay';

export default class CashPayment extends React.Component {
	render() {
		return (
			<>
				<TransactionDetail
					cash_payment={true} />
			</>
		)
	}
}