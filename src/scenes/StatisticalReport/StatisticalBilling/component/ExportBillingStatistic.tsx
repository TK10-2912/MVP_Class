import ActionExport from '@src/components/ActionExport';
import { StatisticBillingOfMachineDto } from '@src/services/services_autogen';
import { Button, Col, Modal, Row } from 'antd';
import * as React from 'react';
import TableBillingStatistical from './TableBillingStatistical';

export interface IProps {
	billingStatisticListResult: StatisticBillingOfMachineDto[];
	onCancel?: () => void;
	visible: boolean;
}

export default class ExportBillingStatistic extends React.Component<IProps> {
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
		const { billingStatisticListResult } = this.props;
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
								nameFileExport='Thống kê đơn hàng đã bán'
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
					<Row justify='center'><h2>Danh sách đơn hàng đã bán</h2></Row>
					<TableBillingStatistical
						billingStatisticListResult={billingStatisticListResult}
						isLoadDone={true}

					/>

				</Col>
			</Modal>
		)
	}
}