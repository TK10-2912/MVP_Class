import ActionExport from '@src/components/ActionExport';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { GroupMachineDto } from '@src/services/services_autogen';
import { Col, Modal, Row } from 'antd';
import moment from 'moment';
import * as React from 'react';
import TableGroupMachineAdmin from './TableGroupMachine';


export interface IProps {
	groupMachineList: GroupMachineDto[];
	onCancel?: () => void;
	visible: boolean;
}

export default class ModalExportGroupMahineAdmin extends React.Component<IProps> {
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
					<Row >
						<Col span={12}>
							Xuất danh sách nhóm máy
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'GroupMachine ' + moment().format('DD_MM_YYYY')}
								idPrint="group_machine_print_id"
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
				<Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id="group_machine_print_id">
					<TitleTableModalExport title='Danh sách khu vực'></TitleTableModalExport>
					<TableGroupMachineAdmin
						pagination={false}
						groupMachineListResult={this.props.groupMachineList}
					/>

				</Col>
			</Modal>
		)
	}
}