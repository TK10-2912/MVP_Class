import ActionExport from '@src/components/ActionExport';
import { DailySaleMonitoringDto } from '@src/services/services_autogen';
import { Button, Checkbox, Col, Modal, Row } from 'antd';
import * as React from 'react';
import moment from 'moment';
import TablePaymentOfSaleMonitoring from '@src/scenes/Monitor/DailySaleMonitoring/component/TablePaymentOfSaleMonitoring';
import TableSaleMonitoring from '@src/scenes/Monitor/DailySaleMonitoring/component/TableSaleMonitoring';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { CloseOutlined } from '@ant-design/icons';


export interface IProps {
	onCancel?: () => void;
	dailySaleMonitoringDto?: DailySaleMonitoringDto;
	visible: boolean;
}

export default class ModalExportSalesdetails extends React.Component<IProps> {
	componentRef: any | null = null;
	state = {
		isLoadDone: true,
		visibleTablePayment: true,
		visibleTableVendingMachine: true,
	};
	setComponentRef = (ref) => {
		this.setState({ isLoadDone: false });
		this.componentRef = ref;
		this.setState({ isLoadDone: true });
	}
	render() {
		const self = this;
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row >
						<Col span={12}>
							<h3>Xuất lịch sử chi tiết bán hàng</h3>
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							{this.state.visibleTablePayment == false && this.state.visibleTableVendingMachine == false ?
								<Button
									danger
									title='Hủy'
									icon={<CloseOutlined />}
									onClick={() => { this.props.onCancel!() }}
								>
									{(window.innerWidth >= 768) && 'Hủy'}
								</Button> :
								< ActionExport
									nameFileExport={'lich_su_chi_tiet_ban_hang' + ' ' + moment().format('DD_MM_YYYY')}
									idPrint={this.state.visibleTablePayment && this.state.visibleTableVendingMachine ? "salesDetail_id" : this.state.visibleTablePayment && this.state.visibleTableVendingMachine == false ? "table_daily_sale" : "table_machine"}
									isExcel={true}
									isWord={true}
									componentRef={this.componentRef}
									onCancel={this.props.onCancel}
									isDestroy={true}
								/>}
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
				<Checkbox className='no-print' style={{ marginBottom: "10px" }} defaultChecked onChange={(e) => this.setState({ visibleTablePayment: e.target.checked })}>Hình thức thanh toán</Checkbox><br />
				<Checkbox className='no-print' style={{ marginBottom: "10px" }} defaultChecked onChange={(e) => this.setState({ visibleTableVendingMachine: e.target.checked })}>Máy bán nước</Checkbox>
				<Row id='salesDetail_id' ref={self.setComponentRef}>
					<Col id='table_daily_sale' ref={self.setComponentRef} span={this.state.visibleTablePayment ? 24 : 0} style={{ marginTop: 10 }}>

						<TitleTableModalExport title='Hình thức thanh toán' />
						<TablePaymentOfSaleMonitoring
							dailySaleMonitoringDto={this.props.dailySaleMonitoringDto}
							is_printed={true}
						/>
					</Col>
					<Col ref={self.setComponentRef} id='table_machine' span={this.state.visibleTableVendingMachine ? 24 : 0} style={{ marginTop: 10 }}>
						<TitleTableModalExport title='Máy bán nước'></TitleTableModalExport>
						<TableSaleMonitoring
							billingOfMachine={this.props.dailySaleMonitoringDto!.listBillingOfMachine}
							pagination={false}
							is_printed={true}
						/>
					</Col>
				</Row>
			</Modal >
		)
	}
}