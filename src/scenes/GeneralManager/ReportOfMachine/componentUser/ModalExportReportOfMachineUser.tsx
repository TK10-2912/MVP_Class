import * as React from 'react';
import ActionExport from '@src/components/ActionExport';
import { ReportOfMachineDto } from '@src/services/services_autogen';
import { Col, Modal, Row } from 'antd';
import moment from 'moment';
import TableReportOfMachineUser from './TableReportOfMachineUser';

export interface IProps {
	reportOfMachineListResult: ReportOfMachineDto[];
	onCancel?: () => void;
	visible: boolean;
}

export default class ModalExportReportOfMachineUser extends React.Component<IProps> {
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
				centered
				visible={this.props.visible}
				title={
					<Row >
						<Col span={12}>
							<h3>Xuất danh sách báo cáo tình trạng máy bán nước</h3>
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport= {'reportofmachine'  + ' ' + moment().format('DD_MM_YYYY')}
								idPrint="reportofmachine"
								isExcel={true}
								isWord={true}
								isDestroy={true}
								onCancel={() => { this.props.onCancel!()}}
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
					<TableReportOfMachineUser
						reportOfMachineListResult={reportOfMachineListResult}
						pagination={false}
						checkExpand={true}
						is_Printed={true}
					/>
				</Col>
			</Modal>
		)
	}
}