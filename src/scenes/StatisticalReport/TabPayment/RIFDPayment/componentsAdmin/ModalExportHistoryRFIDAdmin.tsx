import * as React from 'react';
import { Col, Modal, Row } from 'antd';
import { RfidLogDto } from '@services/services_autogen';
import { L } from '@src/lib/abpUtility';
import ActionExport from '@src/components/ActionExport';
import moment from 'moment';
import TableHistoryRFIDAdmin from './TableLogsHistoryRFIDAdmin';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';

export interface IProps {
	logsRFIDListResult: RfidLogDto[],
	onCancel?: () => void;
	visible: boolean;
}
export default class ModalExportHistoryRFIDAdmin extends React.Component<IProps> {
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
		const { logsRFIDListResult } = this.props;
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row>
						<Col span={12}>
							<h3>{L('Xuất danh sách lịch sử thanh toán thẻ bằng RFID') + L('')}</h3>
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'RFIDLOGS ' + moment().format('DD_MM_YYYY')}
								idPrint="rfid_logs_print_id"
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
				footer={null}
				width='90vw'
				onCancel={this.props.onCancel}
				maskClosable={false}
			>

				<Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id='rfid_logs_print_id'>
					<TitleTableModalExport title='Thông tin hoạt động thẻ RFID'></TitleTableModalExport>
					<TableHistoryRFIDAdmin
						logsRFIDListResult={logsRFIDListResult}
						pagination={false}
						isPrinted
					/>

				</Col>
			</Modal>
		)
	}
}