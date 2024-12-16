import { ApplicationExtDto } from "@src/services/services_autogen";
import * as React from "react";
import TableApplications from "./TableApplications";
import { Button, Col, Modal, Row } from "antd";
import { L } from "@src/lib/abpUtility";
import ActionExport from "@src/components/ActionExport";

export interface IProps {
	applicationListResult: ApplicationExtDto[],
	onCancel?: () => void;
	visible: boolean;
}

export default class ModalExportApplication extends React.Component<IProps> {
	render() {
		const { applicationListResult } = this.props;
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row>
						<Col span={12}>
							{L("xuat_danh_sach") + " " + L("ung_dung")}
						</Col>
						<Col span={12} style={{ textAlign: "end" }}>
							<ActionExport
								nameFileExport='application'
								idPrint='application_print_id'
								isExcel={true}
								isWord={true}
							/>
							<Button style={{ margin: '0 26px 0 9px' }} danger onClick={this.props.onCancel}>{L("huy")}</Button>
						</Col>
					</Row>
				}
				closable={false}
				cancelButtonProps={{ style: { display: "none" } }}
				onCancel={this.props.onCancel}
				footer={null}
				width="90vw"
				maskClosable={false}
			>
				<div id='application_print_id'>
					<TableApplications
						applicationListResult={applicationListResult}
						isLoadDone={true}
						pagination={false}

					/>
				</div>
			</Modal>
		)
	}
}