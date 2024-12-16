import { AuthorizationMachineDto, ImportRepositoryDto, LayoutDto, RfidLogDto } from '@services/services_autogen';
import { Col, Modal, Row } from 'antd';
import * as React from 'react';

import ActionExport from '@src/components/ActionExport';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { L } from '@src/lib/abpUtility';
import moment from 'moment';
import TableLayout from './TableLayout';


export interface IProps {
	layoutListResult: LayoutDto[],
	onCancel?: () => void;
	visible: boolean;
}
export default class ModalExportLayout extends React.Component<IProps> {
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
		const { layoutListResult } = this.props;
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row>
						<Col span={12}>
							<h2>Xuất dữ liệu</h2>
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'layout' + ' ' + moment().format('DD_MM_YYYY')}
								idPrint="layout_print_id"
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

				<Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id='layout_print_id'>
					<TitleTableModalExport title='Danh sách bố cục'></TitleTableModalExport>
					<TableLayout
						layoutListResult={layoutListResult}
						pagination={false}
						noScrool={true}
						hasAction={false}
						isLoadDone={this.state.isLoadDone}
					/>

				</Col>
			</Modal>
		)
	}
}