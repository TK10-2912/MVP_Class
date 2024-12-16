import { AuthorizationMachineDto, RfidLogDto } from '@services/services_autogen';
import { Col, Modal, Row } from 'antd';
import * as React from 'react';

import ActionExport from '@src/components/ActionExport';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { L } from '@src/lib/abpUtility';
import moment from 'moment';
import AuthorizationMachineTable from './AuthorizationMachineTable';

export interface IProps {
	authorizationMachineListResult: AuthorizationMachineDto[],
	onCancel?: () => void;
	visible: boolean;
}
export default class ModalExportAuthorizationMachine extends React.Component<IProps> {
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
		const { authorizationMachineListResult } = this.props;
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row>
						<Col span={12}>
							<h3>Xuất danh sách uỷ quyền</h3>
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'Danh_sach_uy_quyen' + ' ' + moment().format('DD_MM_YYYY')}
								idPrint="authorization_machine_print_id"
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

				<Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id='authorization_machine_print_id'>
					<TitleTableModalExport title='Danh sách uỷ quyền'></TitleTableModalExport>
					<AuthorizationMachineTable
						authorizationMachineListResult={authorizationMachineListResult}
						pagination={false}
						noScrool={true}
						hasAction={false}
					/>

				</Col>
			</Modal>
		)
	}
}