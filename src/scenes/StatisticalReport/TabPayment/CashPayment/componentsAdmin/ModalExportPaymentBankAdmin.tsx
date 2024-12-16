import ActionExport from '@src/components/ActionExport';
import { PaymentBankDto } from '@src/services/services_autogen';
import { Col, Modal, Row } from 'antd';
import * as React from 'react';
import TableImporting from './TablePaymentBankAdmin';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';

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
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row>
						<Col span={12}>Xuất danh sách lịch sử thanh toán bằng ngân hàng</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport='Lịch sử thanh toán bằng ngân hàng'
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
						pagination={false}
						isLoadDone={true}

					/>

				</Col>
			</Modal>
		)
	}
}