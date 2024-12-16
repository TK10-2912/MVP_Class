import { AuthorizationMachineDto, ExportRepositoryDto, ImportRepositoryDto, RfidLogDto } from '@services/services_autogen';
import { Col, Modal, Row } from 'antd';
import * as React from 'react';

import ActionExport from '@src/components/ActionExport';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { L } from '@src/lib/abpUtility';
import moment from 'moment';
import AuthorizationMachineTable from './ExportRepositoryTableAdmin';
import ImportRepositoryTable from './ExportRepositoryTableAdmin';
import ExportRepositoryTable from './ExportRepositoryTableAdmin';
import ExportRepositoryTableAdmin from './ExportRepositoryTableAdmin';

export interface IProps {
	exportRepositoryListResult: ExportRepositoryDto[],
	onCancel?: () => void;
	visible: boolean;
}
export default class ModalExportExportRepositoryAdmin extends React.Component<IProps> {
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
		const { exportRepositoryListResult } = this.props;
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row>
						<Col span={12}>
							<h2>{L('Xuất danh sách') + L('')}</h2>
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'export_repository' + ' ' + moment().format('DD_MM_YYYY')}
								idPrint="export_repository_print_id"
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

				<Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id='export_repository_print_id'>
					<TitleTableModalExport title='Danh sách xuất kho lưu trữ'></TitleTableModalExport>
					<ExportRepositoryTableAdmin
						exportRepostitoryListResult={exportRepositoryListResult}
						pagination={false}
						noScrool={true}
					/>

				</Col>
			</Modal>
		)
	}
}