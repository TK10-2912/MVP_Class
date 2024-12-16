import { RepositoryDto } from '@services/services_autogen';
import { Col, Modal, Row } from 'antd';
import * as React from 'react';
import ActionExport from '@src/components/ActionExport';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { L } from '@src/lib/abpUtility';
import moment from 'moment';
import TableRepositoryAdmin from './TableRepositoryAdmin';

export interface IProps {
	repositoryListResult: RepositoryDto[],
	onCancel?: () => void;
	visible: boolean;
}
export default class ModalExportRepositoryAdmin extends React.Component<IProps> {
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
		const { repositoryListResult } = this.props;
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row>
						<Col span={8}>
							<h3>{L('Xuất danh sách ') + L('kho lưu trữ')}</h3>
						</Col>
						<Col span={16} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'repository' + ' ' + moment().format('DD_MM_YYYY')}
								idPrint="repository_print_id"
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
				width='75vw'
				onCancel={this.props.onCancel}
				maskClosable={false}
			>

				<Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id='repository_print_id'>
					<TitleTableModalExport title='Danh sách kho lưu trữ'></TitleTableModalExport>
					<TableRepositoryAdmin
						repositoryListResult={repositoryListResult}
						pagination={false}
						hasAction={false}
						isPrint
					/>

				</Col>
			</Modal>
		)
	}
}