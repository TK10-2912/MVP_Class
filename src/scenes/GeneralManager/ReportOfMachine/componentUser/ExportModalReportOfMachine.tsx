import * as React from 'react';
import ActionExport from '@src/components/ActionExport';
import { ReportOfMachineDto } from '@src/services/services_autogen';
import { Col, Modal, Row } from 'antd';
import TableReportOfMachine from './TableReportOfMachine';
import moment from 'moment';

export interface IProps {
	reportOfMachineListResult: ReportOfMachineDto[];
	onCancel?: () => void;
	visible: boolean;
}

export default class ModalExportReportOfMachine extends React.Component<IProps> {
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
		const { reportOfMachineListResult } = this.props;
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row >
						<Col span={12}>
						<h3>Xuất danh sách báo cáo tình trạng máy bán nước</h3>
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'reportofmachine ' + moment().format('DD_MM_YYYY')}
								idPrint="reportofmachine"
								isExcel={true}
								isWord={true}
								isDestroy={true}
								onCancel={() => { this.props.onCancel!() }}
								componentRef={this.componentRef}
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
				<Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id="reportofmachine">
					<Row justify='center'><h2>Danh sách báo cáo tình trạng máy bán nước</h2></Row>
					<TableReportOfMachine
						reportOfMachineListResult={reportOfMachineListResult}
						pagination={false}
						isLoadDone={true}
						noPrint={true}

					/>

				</Col>
			</Modal>
		)
	}
}