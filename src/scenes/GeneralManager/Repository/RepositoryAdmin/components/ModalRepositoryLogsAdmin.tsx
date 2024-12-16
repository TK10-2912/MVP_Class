import { RepositoryDto } from '@services/services_autogen';
import { Col, Modal, Row } from 'antd';
import * as React from 'react';
import ActionExport from '@src/components/ActionExport';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { L } from '@src/lib/abpUtility';
import moment from 'moment';
import Table, { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import RepositoryUser from '../../RepositoryUser';
import TableRepositoryUser from '../../RepositoryUser/components/TableRepositoryUser';

export interface IProps {
	repositorySelected: RepositoryDto,
	onCancel?: () => void;
	visible: boolean;
	pagination: TablePaginationConfig | false;
}
export default class ModalRepositoryLogsAdmin extends React.Component<IProps> {
	componentRef: any | null = null;
	state = {
		isLoadDone: true,
		su_id_selected: undefined,

	};
	setComponentRef = (ref) => {
		this.setState({ isLoadDone: false });
		this.componentRef = ref;
		this.setState({ isLoadDone: true });
	}
	render() {
		const { repositorySelected, pagination } = this.props;
		
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row>
						<Col span={12}>
							<h2>{L('Xuất danh sách ') + L('lịch sử kho lưu trữ')}</h2>
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'repository' + ' ' + moment().format('DD_MM_YYYY')}
								idPrint=""
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

				{/* <TableRepositoryUser pagination={false} repositoryListResult={repositorySelected.repositoryDetails!} /> */}
			</Modal>
		)
	}
}