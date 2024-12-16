import { RfidDto, } from '@services/services_autogen';
import { Col, Modal, Row } from 'antd';
import * as React from 'react';

import ActionExport from '@src/components/ActionExport';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import moment from 'moment';
import TableRFIDAdmin from './TableRFIDAdmin';

export interface IProps {
	RFIDListResult: RfidDto[],
	onCancel?: () => void;
	visible: boolean;
}
export default class ModalExportRFID extends React.Component<IProps> {
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
		const { RFIDListResult } = this.props;
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row>
						<Col span={12}><h3>Xuất danh sách thẻ RFID</h3></Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'RFID' + ' ' + moment().format('DD_MM_YYYY')}
								idPrint="RFID_print_id"
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

				<Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id='RFID_print_id'>
					<TitleTableModalExport title='Danh sách thẻ RFID'></TitleTableModalExport>
					<TableRFIDAdmin
						RFIDListResult={RFIDListResult}
						pagination={false}
						hasAction={false}
						export={true}
					/>

				</Col>
			</Modal>
		)
	}
}