import { Row } from 'antd';
import * as React from 'react';
import TransactionDetail from '@src/scenes/HistoryMVP/LichSuChiTietGiaoDichTungMay';

export default class CashPaymentForAdmin extends React.Component {
	render() {
		return (
			<Row style={{ width: '100%' }}>
				<TransactionDetail
					cash_payment={true} />
			</Row>
		)
	}
}