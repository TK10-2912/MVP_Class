import * as React from 'react';
import { Col, Modal, Row } from 'antd';
import { SupplierDto, } from '@services/services_autogen';
import TableSupplier from './TableSupplier';
import { L } from '@src/lib/abpUtility';
import ActionExport from '@src/components/ActionExport';
import moment from 'moment';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';

export interface IProps {
	supplierListResult: SupplierDto[],
	onCancel?: () => void;
	visible: boolean;
}
export default class ModalExportSupplier extends React.Component<IProps> {
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
		const { supplierListResult } = this.props;
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row>
						<Col span={12}>
							<h2>{L('Xuất dữ liệu') + L(' nhà cung cấp')}</h2>
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'Supplier ' + moment().format('DD_MM_YYYY')}
								idPrint="Supplier_print_id"
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

				<Col ref={this.setComponentRef} id='Supplier_print_id' span={24} style={{ marginTop: '10px' }} >
					<TitleTableModalExport title='Danh sách nhà cung cấp'></TitleTableModalExport>
					<TableSupplier
						supplierListResult={supplierListResult}
						pagination={false}
						isPrint={true}
					/>

				</Col>
			</Modal>
		)
	}
}