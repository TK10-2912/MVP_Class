import ActionExport from '@src/components/ActionExport';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { ImportingDto } from '@src/services/services_autogen';
import { Col, Modal, Row } from 'antd';
import moment from 'moment';
import * as React from 'react';
import TableImportingAdmin from './TableImportingAdmin';

export interface IProps {
	importingListResult: ImportingDto[];
	onCancel?: () => void;
	visible: boolean;
	skipCount: number;
	pageSize: number;
}

export default class ModalExportImportingAdmin extends React.Component<IProps> {

	componentRef: any | null = null;
	state = {
		isLoadDone: true,
		ListExportImporting: [],
	};

	setComponentRef = (ref) => {
		this.setState({ isLoadDone: false });
		this.componentRef = ref;
		this.setState({ isLoadDone: true });
	}


	render() {
		const { importingListResult } = this.props;
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row>
						<Col span={12}>
							<h3>Xuất danh sách nhập sản phẩm</h3>
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'importing ' + moment().format('DD_MM_YYYY')}
								idPrint="importing_print_id"
								isExcel={true}
								isWord={true}
								componentRef={this.componentRef}
								onCancel={this.props.onCancel}
								isDestroy={true}
								idFooter='TableImportingAdmin'
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
				<Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id="importing_print_id">
					<TitleTableModalExport title='Danh sách nhập sản phẩm'></TitleTableModalExport>
					<TableImportingAdmin
						importingListResult={importingListResult}
						pagination={false}
						isLoadDone={true}
						noScroll={true}
					/>

				</Col>
			</Modal>
		)
	}
}