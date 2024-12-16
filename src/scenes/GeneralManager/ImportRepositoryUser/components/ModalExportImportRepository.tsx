import { ImportRepositoryDto } from '@services/services_autogen';
import { Col, Modal, Row } from 'antd';
import * as React from 'react';

import ActionExport from '@src/components/ActionExport';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { L } from '@src/lib/abpUtility';
import moment from 'moment';
import ImportRepositoryTable from './ImportRepositoryTable';

export interface IProps {
	importRepositoryListResult: ImportRepositoryDto[],
	onCancel?: () => void;
	visible: boolean;
}
export default class ModalExportImportRepositoryAdmin extends React.Component<IProps> {
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
		const { importRepositoryListResult } = this.props;
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row>
						<Col span={12}>
							<h2>Xuất danh sách nhập kho lưu trữ</h2>
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'import_repository' + ' ' + moment().format('DD_MM_YYYY')}
								idPrint="import_repository_print_id"
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

				<Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id='import_repository_print_id'>
					<TitleTableModalExport title='Danh sách nhập kho lưu trữ'></TitleTableModalExport>
					<ImportRepositoryTable
						importRepostitoryListResult={importRepositoryListResult}
						pagination={false}
						noScroll={false}
						isPrint={true}
						hasAction={false}
					/>

				</Col>
			</Modal>
		)
	}
}