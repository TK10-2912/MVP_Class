import * as React from 'react';
import { Col, Row, Modal } from 'antd';
import GroupMachine from '@src/scenes/GeneralManager/GroupMachine';

export interface IProps {
	fileDocumentListResult?: any[],
	onCancel?: () => void;
	visible: boolean;
}
export default class ModalUpdateSoftWareMachine extends React.Component<IProps> {
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

		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row>
						<Col span={12}>
							<h3>{"Danh sách máy cập nhật phần mềm"}</h3>
						</Col>
					</Row>
				}
				closable={false}
				footer={null}
				width='90vw'
				onCancel={this.props.onCancel}
				maskClosable={false}
			>
				<Col span={24} style={{ marginTop: '10px' }} ref={this.setComponentRef} id='fileDocument_print_id'>
                    <GroupMachine/>
				</Col>
			</Modal>
		)
	}
}