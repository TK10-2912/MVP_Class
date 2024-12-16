import * as React from 'react';
import { Col, Row, Modal, Button, } from 'antd';
import { L } from '@lib/abpUtility';
import TableMainFileDocument from './TableMachineSoft';
import ActionExport from '@src/components/ActionExport';
import moment from 'moment';
import { MachineSoftDto } from '@src/services/services_autogen';

export interface IProps {
	machineSoftListResult?: MachineSoftDto[],
	onCancel?: () => void;
	visible: boolean;
}
export default class ModalExportMachineSoft extends React.Component<IProps> {
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
		const { machineSoftListResult } = this.props;

		return (
			<Modal
				centered
				visible={this.props.visible}
				title={
					<Row>
						<Col span={12}>
							<h3>Xuất danh sách phiên bản cập nhật</h3>
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'Tap_tin_tai_lieu_ngay_' + moment().format('DD_MM_YYYY')}
								idPrint="fileDocument_print_id"
								isExcel={true}
								isWord={true}
								isDestroy={true}
								componentRef={this.componentRef}
								onCancel={() => this.props.onCancel!()}
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
				<Col span={24} style={{ marginTop: '10px' }} ref={this.setComponentRef} id='fileDocument_print_id'>
					<TableMainFileDocument
						machineSoftListResult={machineSoftListResult}
						pagination={false}
						NoScroll={true}
					/>
				</Col>
			</Modal>
		)
	}
}