import ActionExport from '@src/components/ActionExport';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { GroupTrashbinDto } from '@src/services/services_autogen';
import { Col, Modal, Row } from 'antd';
import moment from 'moment';
import * as React from 'react';
import TableGroupTrashBin from './TableGroupTrashBin';


export interface IProps {
	groupTrashBinListResult: GroupTrashbinDto[];
	onCancel?: () => void;
	visible: boolean;
}

export default class ModalExportGroupTrashBin extends React.Component<IProps> {
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
		const { groupTrashBinListResult } = this.props;
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row >
						<Col span={12}>
							Xuất danh sách nhóm thùng rác
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'GroupTrashBin_' + moment().format('DD_MM_YYYY')}
								idPrint="group_trash_bin_print_id"
								isExcel={true}
								isWord={true}
								componentRef={this.componentRef}
								onCancel={this.props.onCancel}
								isDestroy={true}
							/>
						</Col>
					</Row>
				}
				closable={false}
				cancelButtonProps={{ style: { display: "none" } }}
				onCancel={() => { this.props.onCancel!() }}
				footer={null}
				width='60vw'
				maskClosable={false}

			>
				<Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id="group_trash_bin_print_id">
					<TitleTableModalExport title='Danh sách nhóm thùng rác'></TitleTableModalExport>
					<TableGroupTrashBin
						pagination={false}
						groupTrashBinListResult={groupTrashBinListResult}
						hasAction={false}
					/>

				</Col>
			</Modal>
		)
	}
}