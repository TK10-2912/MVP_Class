import ActionExport from '@src/components/ActionExport';
import { ReportOfMachineDto } from '@src/services/services_autogen';
import { Col, Modal, Row } from 'antd';
import * as React from 'react';
import moment from 'moment';
import TableHistoryReport from './TableHistoryReport';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';

export interface IProps {
	listReportOfMachine: ReportOfMachineDto[];
	onCancel?: () => void;
	visible: boolean;
}

export default class ModalExportMachineReport extends React.Component<IProps> {
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
		const { listReportOfMachine } = this.props;
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row >
						<Col span={12}>
							<h3>Xuất lịch sử cảnh báo</h3>
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'lich_su_canh_bao ' + moment().format('DD_MM_YYYY')}
								idPrint="table_id"
								idFooter="footer_id"
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
				<Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id="table_id">
					<TitleTableModalExport title='Lịch sử cảnh báo'></TitleTableModalExport>
					<TableHistoryReport
						hasAction={false}
						listReportOfMachine={listReportOfMachine}
						pagination={false}
						is_printed={true}
					/>
				</Col>
			</Modal>
		)
	}
}