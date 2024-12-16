import ActionExport from '@src/components/ActionExport';
import { WithdrawDto } from '@src/services/services_autogen';
import { Col, Modal, Row } from 'antd';
import * as React from 'react';
import moment from 'moment';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import TableWithdrawAdmin from './TableWithdrawAdmin';


export interface IProps {
	withdrawListResult: WithdrawDto[];
	onCancel?: () => void;
	visible: boolean;
}

export default class ModalExportWithdrawAdmin extends React.Component<IProps> {
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
		const { withdrawListResult } = this.props;
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row >
						<Col span={12}>
							Xuất danh sách rút tiền
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'withdraw ' + moment().format('DD_MM_YYYY')}
								isExcelWithImage={true}
								idPrint="withdraw"
								isWord={true}
								isDestroy={true}
								onCancel={() => this.props.onCancel!()}
								componentRef={this.componentRef}
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
				<Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id="withdraw">
					<TitleTableModalExport title='Danh sách rút tiền'></TitleTableModalExport>
					<TableWithdrawAdmin
						withdrawListResult={withdrawListResult}
						pagination={false}
						isLoadDone={true}
						is_Printed={true}
					/>
				</Col>
			</Modal>
		)
	}
}