import ActionExport from '@src/components/ActionExport';
import { StatisticImportOfMachineDto } from '@src/services/services_autogen';
import { Button, Col, Modal, Row } from 'antd';
import * as React from 'react';
import TableImportingStatistical from './TableImportingStatistical';

export interface IProps {
	importingStatisticListResult: StatisticImportOfMachineDto[];
	onCancel?: () => void;
	visible: boolean;
}

export default class ExportImportingStatistic extends React.Component<IProps> {
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
		const { importingStatisticListResult } = this.props;
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row >
						<Col span={12}>
							Xuất danh sách hóa đơn
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport='Thống kê các lần nhập hàng'
								idPrint="drink_print_id"
								isExcel={true}
								isWord={true}
								componentRef={this.componentRef}
							/>
							<Button style={{ margin: '0 26px 0 9px' }} danger onClick={() => { this.props.onCancel!() }}>Hủy</Button>
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
				<Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id="drink_print_id">
					<Row justify='center'><h2>Danh sách thống kê các lần nhập hàng</h2></Row>
					<TableImportingStatistical
						importingStatisticListResult={importingStatisticListResult}
						isLoadDone={true}

					/>

				</Col>
			</Modal>
		)
	}
}