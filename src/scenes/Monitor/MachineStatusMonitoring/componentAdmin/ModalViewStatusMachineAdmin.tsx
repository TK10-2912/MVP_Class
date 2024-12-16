import AppConsts from "@src/lib/appconst";
import { Col, Modal, Row, Tag, message } from "antd";
import React from "react";
import { MachineDto } from "@src/services/services_autogen";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import ActionExport from "@src/components/ActionExport";
import moment from "moment";
import TitleTableModalExport from "@src/components/Manager/TitleTableModalExport";
import { stores } from "@src/stores/storeInitializer";
import { eMainBoard, valueOfeMainBoard } from "@src/lib/enumconst";

export interface IProps {
	machineSelected: MachineDto,
	onCancel?: () => void;
	visible: boolean;
}
export default class ModalViewStatusMachine extends AppComponentBase<IProps> {
	componentRef: any | null = null;

	setComponentRef = (ref) => {
		this.setState({ isLoadDone: false });
		this.componentRef = ref;
		this.setState({ isLoadDone: true });
	}
	componentDidUpdate(): void {
		if (this.props.machineSelected == undefined) {
			message.warning("Không có dữ liệu của máy này!");
		}
	}
	render() {
		const { machineSelected } = this.props;

		return (
			<>
				{machineSelected !== undefined
					&&
					(<Modal
						visible={this.props.visible}
						title={
							<Row >
								<Col span={12}>
									<h3>Trạng thái máy bán nước {machineSelected.ma_code}-{machineSelected.ma_display_name}</h3>
								</Col>
								<Col span={12} style={{ textAlign: 'end' }}>
									<ActionExport
										nameFileExport={'MaStatusMonitor' + ' ' + moment().format('DD_MM_YYYY')}
										idPrint="machine_print_id"
										isExcel={false}
										isWord={true}
										componentRef={this.componentRef}
										isDestroy={true}
										onCancel={this.props.onCancel}
									/>
								</Col>
							</Row>
						}
						centered
						closable={false}
						cancelButtonProps={{ style: { display: "none" } }}
						onCancel={() => { this.props.onCancel!() }}
						footer={null}
						width={!!this.props.machineSelected ? "80vw" : "40vw"}
						maskClosable={false}
					>
						<Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id="machine_print_id">
							<TitleTableModalExport title={
								stores.sessionStore.getNameMachines(machineSelected.ma_id) != undefined ? stores.sessionStore.getNameMachines(machineSelected.ma_id).toUpperCase() : stores.sessionStore.getNameMachines(machineSelected.ma_id)
							}></TitleTableModalExport>
							<h3 style={{ textAlign: 'center', color: 'green' }} >Thông số chung</h3>
							<Row style={{ border: '1px solid black', margin: "10px 0" }}>
								<Col span={12} style={{ borderRight: "2px solid black ", padding: '10px 10px 0 10px' }}>
									<p><span style={{ fontWeight: 500 }}>Số tiền sản phẩm có bao bì đã giao dịch:</span><b> {AppConsts.formatNumber(machineSelected.ma_money_drink)} VNĐ </b></p>
									<p><span style={{ fontWeight: 500 }}>Số tiền sản phẩm không bao bì đã giao dịch:</span><b> {AppConsts.formatNumber(machineSelected.ma_money_freshdrink)} VNĐ</b></p>
									<p><span style={{ fontWeight: 500 }}>Số lượng sản phẩm có bao bì đã mua:</span> <b>{AppConsts.formatNumber(machineSelected.ma_no_drink)} chai</b></p>
									<p><span style={{ fontWeight: 500 }}>Dung tích sản phẩm không bao bì đã mua:</span> <b>{AppConsts.formatNumber(machineSelected.ma_no_fr_drink)} ml</b></p>
									<p><span style={{ fontWeight: 500 }}>Số lượng sản phẩm có bao bì đã thêm vào:</span> <b>{AppConsts.formatNumber(machineSelected.ma_no_drink_change)} chai</b></p>
									<p><span style={{ fontWeight: 500 }}>Dung tích sản phẩm không bao bì đã thêm vào:</span> <b>{AppConsts.formatNumber(machineSelected.ma_no_frdrink_change)} ml</b></p>
									<p><span style={{ fontWeight: 500 }}>Cho phép áp dụng mã giảm giá:</span> {machineSelected.ma_isApplyDiscountCode == true ? <Tag color="green">Cho phép</Tag> : <Tag color="red">Không cho phép</Tag>}</p>
								</Col>
								<Col span={12} style={{ padding: '10px 10px 0 10px' }}>
									<p><span style={{ fontWeight: 500 }}>Thời gian kiểm tra khởi động:</span><b> {machineSelected.ma_timeRepeatBootCheck / 1000} giây</b></p>
									<p><span style={{ fontWeight: 500 }}>Thời gian kiểm tra thanh toán qua Qr:</span> <b>{machineSelected.ma_timeRepeatCheckQRQueue / 1000} giây</b></p>
									<p><span style={{ fontWeight: 500 }}>Thời gian khởi động lại máy:</span> <b>{machineSelected.ma_restartMachineAt} giây</b></p>
									<p><span style={{ fontWeight: 500 }}>Có cảm biến rơi:</span> {machineSelected.ma_hasDropSensor == true ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>}</p>
									<p><span style={{ fontWeight: 500 }}>Cảm biến đáy cốc:</span> {machineSelected.ma_hasRefillSensor == true ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>}</p>
									<p><span style={{ fontWeight: 500 }}>Đơn vị thanh toán:</span> <b>{machineSelected.ma_unitPayment}</b></p>
									<p><span style={{ fontWeight: 500 }}>Kích hoạt:</span> {machineSelected.ma_is_active == true ? <Tag color="green">Đã kích hoạt</Tag> : <Tag color="red">Chưa kích hoạt</Tag>}</p>
								</Col>
							</Row>
							<Row gutter={[16, 16]} style={{ margin: "10px 0" }}>
								<Col span={12} style={{ border: "1px solid black ", padding: '10px 10px 0 10px' }}>
									<h3 style={{ textAlign: 'center', borderBottom: "1px solid black", color: 'green' }}>Thông số Vending</h3>
									<>
										<p><span style={{ fontWeight: 500 }}>Bật/Tắt đèn LED Vending:</span> {machineSelected.ma_turnOnLedVending == true ? <Tag color="green">Bật</Tag> : <Tag color="red">Tắt</Tag>}</p>
										<p><span style={{ fontWeight: 500 }}>Số lượng khay tối đa trong Vending:</span> <b>{machineSelected.ma_maxTrayVending}</b></p>
										<p><span style={{ fontWeight: 500 }}>Thời gian hoạt động Led Vending:</span> <b>{machineSelected.workingTimeLedVending}</b></p>
										<p><span style={{ fontWeight: 500 }}>Tập lệnh Vending:</span> <b>{valueOfeMainBoard(machineSelected.ma_commandVending)}</b></p>
										<p><span style={{ fontWeight: 500 }}>Bật sấy kính:</span> {machineSelected.ma_turnOnGlassHeat == true ? <Tag color="green">Bật</Tag> : <Tag color="red">Tắt</Tag>}</p>
										<p><span style={{ fontWeight: 500 }}>Thời gian làm việc của sấy kính:</span> <b>{machineSelected.workingTimeGlassHeat}</b></p>
									</>
								</Col>
								<Col span={12} style={{ border: "1px solid black ", padding: '10px 10px 0 10px' }}>
									<h3 style={{ borderBottom: "1px solid black", textAlign: 'center', color: 'green' }}>Thông số thanh toán</h3>
									<>
										<p><span style={{ fontWeight: 500 }}>Kích hoạt thanh toán tiền mặt:</span> {machineSelected.ma_activeCashPayment == true ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>}</p>
										<p><span style={{ fontWeight: 500 }}>Kích hoạt thanh toán QR:</span> {machineSelected.ma_activeQrCodePayment == true ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>}</p>
										<p><span style={{ fontWeight: 500 }}>Kích hoạt thanh toán RFID:</span> {machineSelected.ma_activeRifdPayment == true ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>}</p>
									</>
								</Col>
							</Row>
							<Col span={this.props.machineSelected.ma_commandRefill === eMainBoard.NONE.num ? 12 : 24}>
								<Row style={{ margin: "10px 0" }}>
									<Col span={this.props.machineSelected.ma_commandRefill === eMainBoard.NONE.num ? 0 : 12} style={{ border: "1px solid black ", padding: '10px 10px 0 10px' }}>
										<h3 style={{ borderBottom: "1px solid black", textAlign: 'center', color: 'green' }}>Thông số Refill</h3>
										<>
											<p><span style={{ fontWeight: 500 }}>Bật/Tắt LED Refill:</span> {machineSelected.ma_turnOnledRefill == true ? <Tag color="green">Bật</Tag> : <Tag color="red">Tắt</Tag>}</p>
											<p><span style={{ fontWeight: 500 }}>Dung tích bơm tối thiểu trong 1 lần:</span> <b>{machineSelected.ma_minFillOneTime} ml</b></p>
											<p><span style={{ fontWeight: 500 }}>Dung tích bình chứa tối đa:</span><b> {machineSelected.ma_maxTankRefill} ml</b></p>
											<p><span style={{ fontWeight: 500 }}>Thời gian làm việc của LED refill:</span><b> {machineSelected.workingTimeLedRefill}</b></p>
											<p><span style={{ fontWeight: 500 }}>Kích hoạt refill:</span> {machineSelected.ma_activeRefill == true ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>}</p>
											<p><span style={{ fontWeight: 500 }}>Tập lệnh refill:</span><b> {valueOfeMainBoard(machineSelected.ma_commandRefill)}</b></p>
										</>
									</Col>
									<Col span={this.props.machineSelected.ma_commandRefill === eMainBoard.NONE.num ? 24 : 12} style={{ border: "1px solid black ", padding: '10px 10px 0 10px' }}>
										<h3 style={{ borderBottom: "1px solid black", textAlign: 'center', color: 'green' }}>Thông số chiller</h3>
										<>
											<p><span style={{ fontWeight: 500 }}>Nhiệt độ đích cho Chiller:</span> <b>{machineSelected.ma_targetTempRefrigeration} độ</b></p>
											<p><span style={{ fontWeight: 500 }}>sản độ hoạt động của Chiller:</span> <b>{machineSelected.ma_workingModeRefrigeration}</b></p>
											<p><span style={{ fontWeight: 500 }}>Khoá/Mở khóa sản độ bất thường của Chiller:</span><b> {machineSelected.ma_lockAbnormalRefrigeration}</b></p>
											<p><span style={{ fontWeight: 500 }}>Thời gian hoạt động của Chiller:</span><b> {machineSelected.workingTimeRefrigeration}</b></p>
											<p><span style={{ fontWeight: 500 }}>Tắt/Bật chiller:</span> {machineSelected.turnOnRefrigeration == true ? <Tag color="green">Bật</Tag> : <Tag color="red">Tắt</Tag>}</p>
										</>
									</Col>
								</Row>
							</Col>
						</Col>
					</Modal >)

				}
			</>
		)
	}
}