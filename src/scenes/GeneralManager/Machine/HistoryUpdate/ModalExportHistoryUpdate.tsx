import * as React from 'react';
import { Col, Row, Modal, Button, } from 'antd';
import ActionExport from '@src/components/ActionExport';
import moment from 'moment';
import { MachineDto, MachineSoftLogsDto } from '@src/services/services_autogen';
import TableHistoryUpdate from './TableHistoryUpdate';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';

export interface IProps {
	machineSelected: MachineDto,
	machineSoftLogsServiceListResult?: MachineSoftLogsDto[],
	onCancel?: () => void;
	visible: boolean;
}
export default class ModalExportHistoryUpdate extends React.Component<IProps> {
	componentRef: any | null = null;
	state = {
		isHeaderReport: false,
		isLoadDone: false,
	};
	setComponentRef = (ref) => {
		this.setState({ isLoadDone: false });
		this.componentRef = ref;
		this.setState({ isLoadDone: true });
	}
	render() {
		const { machineSoftLogsServiceListResult } = this.props;

		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row>
						<Col span={12}>
							<h3>Danh sách cập nhật phần mềm</h3>
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'export ' + moment().format('DD_MM_YYYY')}
								idPrint="fileDocument_print_id"
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
				<Col span={24} style={{ marginTop: '10px' }} ref={this.setComponentRef} id='fileDocument_print_id'>
					<TitleTableModalExport title={`Lịch sử cập nhật phần mềm của máy: ${this.props.machineSelected.ma_display_name} - ${this.props.machineSelected.ma_code}`}/>					<TableHistoryUpdate
						machineSoftLogsServiceListResult={machineSoftLogsServiceListResult}
						pagination={false}
						is_printed
					/>
				</Col>
			</Modal>
		)
	}
}