import * as React from 'react';
import { Row, Card } from 'antd';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import TableSupplierPaymentLog from './components/TableSupplierPaymentLog';
import { SupplierDto } from '@src/services/services_autogen';

export interface IProps {
	supplierSelected?: SupplierDto;
}
export default class SupplierLogPayment extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true
	};

	render() {
		const self = this;
		const { supplierSelected } = this.props;
		return (

			<Row>
				<TableSupplierPaymentLog
					isPrint={false}
					supplierResult={supplierSelected != undefined ? supplierSelected : new SupplierDto()}
				/>
			</Row>
		)
	}
}