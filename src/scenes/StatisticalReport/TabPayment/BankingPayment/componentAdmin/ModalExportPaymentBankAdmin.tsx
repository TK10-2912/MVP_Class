import ActionExport from '@src/components/ActionExport';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { PaymentBankDto } from '@src/services/services_autogen';
import { Col, Modal, Row } from 'antd';
import moment from 'moment';
import * as React from 'react';
import TableImporting from './TablePaymentBankAdmin';

export interface IProps {
	paymentBankListResult: PaymentBankDto[];
	onCancel?: () => void;
	visible: boolean;
}

export default class ModalExportPaymentBankAdmin extends React.Component<IProps> {
	componentRef: any | null = null;
	state = {
		isLoadDone: true,
	};
	setComponentRef = (ref) => {
		this.setState({ isLoadDone: false });
		this.componentRef = ref;
		this.setState({ isLoadDone: true });
	}
	render() {
		const { paymentBankListResult } = this.props;
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row>
						<Col span={12}>
							<h3>Xuất danh sách lịch sử thanh toán bằng ngân hàng</h3>
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'Lịch sử thanh toán bằng ngân hàng' + ' ' + moment().format('DD_MM_YYYY')}
								idPrint="importing_print_id"
								isExcel={true}
								isWord={true}
								componentRef={this.componentRef}
								onCancel={this.props.onCancel}
								isDestroy={true}
							/>
						</Col>
					</Row>
				}
				closable={false}
				cancelButtonProps={{ style: { display: "none" } }}
				onCancel={() => { this.props.onCancel!() }}
				footer={null}
				width='90vw'
				maskClosable={false}

			>
				<Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id="importing_print_id">
					<TitleTableModalExport title='Lịch sử thanh toán bằng ngân hàng'></TitleTableModalExport>
					<TableImporting
						importingListResult={paymentBankListResult}
						pagination={false}
						isLoadDone={true}
						isPrinted={true}
					/>

				</Col>
			</Modal>
		)
	}
}