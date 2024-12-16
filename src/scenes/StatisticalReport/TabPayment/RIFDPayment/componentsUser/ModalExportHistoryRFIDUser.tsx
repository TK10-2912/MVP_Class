import { RfidLogDto } from '@services/services_autogen';
import ActionExport from '@src/components/ActionExport';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { Col, Modal, Row } from 'antd';
import moment from 'moment';
import * as React from 'react';
import TableHistoryRFIDUser from './TableHistoryRFIDUser';
export interface IProps {
	logsRFIDListResult: RfidLogDto[],
	onCancel?: () => void;
	visible: boolean;
}
export default class ModalExportHistoryRFIDUser extends React.Component<IProps> {
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
							<h3>Xuất danh sách lịch sử thanh toán thẻ bằng RFID</h3>

						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'RFIDLOGS' + ' ' + moment().format('DD_MM_YYYY')}
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
					<TableHistoryRFIDUser
						logsRFIDListResult={logsRFIDListResult}
						pagination={false}
						isPrinted={true}
					/>

				</Col>
			</Modal>
		)
	}
}