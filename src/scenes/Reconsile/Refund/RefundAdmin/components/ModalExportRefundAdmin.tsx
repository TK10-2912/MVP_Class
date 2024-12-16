import * as React from 'react';
import { Col, Modal, Row } from 'antd';
import { RefundDto, } from '@services/services_autogen';

import { L } from '@src/lib/abpUtility';
import ActionExport from '@src/components/ActionExport';
import moment from 'moment';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import TableRefundAdmin from './TableRefundAdmin';

export interface IProps {
	refundList: RefundDto[],
	onCancel?: () => void;
	visible: boolean;
}
export default class ModalExportRefundAdmin extends React.Component<IProps> {
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
		const { refundList } = this.props;
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row>
						<Col span={12}>
							<h2>{L('Xuất dữ liệu') + L(' hoàn tiền')}</h2>
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'Refund' + ' ' + moment().format('DD_MM_YYYY')}
								idPrint="refund_print_id"
								isExcel={true}
								isWord={true}
								isDestroy={true}
								onCancel={this.props.onCancel}
								componentRef={this.componentRef}
							/>
						</Col>
					</Row>
				}
				closable={false}
				footer={null}
				width='90vw'
				onCancel={this.props.onCancel}
				maskClosable={false}
			>
				<Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id='refund_print_id'>
					<TitleTableModalExport title='Danh sách hoàn tiền'></TitleTableModalExport>
					<TableRefundAdmin
						refundResult={refundList}
						pagination={false}
						hasAction={false}
						export={true}
					/>

				</Col>
			</Modal>
		)
	}
}