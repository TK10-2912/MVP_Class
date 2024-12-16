import * as React from 'react';
import { Col, Modal, Row } from 'antd';
import { ReconcileSupplierDebtDto } from '@services/services_autogen';
import { L } from '@src/lib/abpUtility';
import ActionExport from '@src/components/ActionExport';
import moment from 'moment';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import TableReconcileDebt from './TableReconcileDebt';

export interface IProps {
	reconcileListResult: ReconcileSupplierDebtDto[],
	onCancel?: () => void;
	visible: boolean;
}
export default class ModalExportReconcileDebt extends React.Component<IProps> {
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
		const { reconcileListResult } = this.props;
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row>
						<Col span={12}>
							<h2 style={{fontSize:23}}>{L('Xuất dữ liệu') + L(' danh sách công nợ')}</h2>
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'reconcile_debt ' + moment().format('DD_MM_YYYY')}
								idPrint="reconcile_debt_id"
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

				<Col ref={this.setComponentRef} id='reconcile_debt_id' span={24} style={{ marginTop: '10px' }} >
					<TitleTableModalExport title='Danh sách đối soát công nợ'></TitleTableModalExport>
					<TableReconcileDebt
						listReconsile={reconcileListResult}
						pagination={false}
						is_printed={true}
					/>

				</Col>
			</Modal>
		)
	}
}