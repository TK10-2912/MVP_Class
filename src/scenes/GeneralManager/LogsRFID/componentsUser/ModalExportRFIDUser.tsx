import { RfidLogDto } from '@services/services_autogen';
import { Col, Modal, Row } from 'antd';
import * as React from 'react';

import ActionExport from '@src/components/ActionExport';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { L } from '@src/lib/abpUtility';
import moment from 'moment';
import TableLogsRFIDUser from './TableLogsRFIDUser';

export interface IProps {
	logsRFIDListResult: RfidLogDto[],
	onCancel?: () => void;
	visible: boolean;
}
export default class ModalExportLogsRFIDUser extends React.Component<IProps> {
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
							<h2>{L('Xuất danh sách hoạt động thẻ RFID') + L('')}</h2>
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'RFIDLOGS' + ' ' + moment().format('DD_MM_YYYY')}
								idPrint="rfid_logs_print_id"
								isExcel={true}
								isWord={true}
								isDestroy={true}
								onCancel={this.props.onCancel}
								componentRef={this.componentRef}
								idFooter='RFIDStatsFooter'
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
					<TitleTableModalExport title='Danh sách hoạt động thẻ RFID'></TitleTableModalExport>
					<TableLogsRFIDUser
						logsRFIDListResult={logsRFIDListResult}
						pagination={false}
						noPrint={true}
					/>

				</Col>
			</Modal>
		)
	}
}