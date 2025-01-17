import AppConsts from "@src/lib/appconst";
import { Col, Row, Tag } from "antd";
import React from "react";
import { MachineDto } from "@src/services/services_autogen";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { valueOfeMainBoard } from "@src/lib/enumconst";

export interface IProps {
	machineSelected: MachineDto,
}
export default class ViewStatusMachine extends AppComponentBase<IProps>{
	render() {
		const { machineSelected } = this.props;
		return (
			<>
				{!!machineSelected ?
					<>
						<h3>Thông số chung</h3>
						<Row style={{ border: '1px solid black', margin: "10px 0" }}>
							<Col span={12} style={{ borderRight: "2px solid black ", padding: '10px 10px 0 10px' }}>
								<p><span style={{ fontWeight: 500 }}>Số tiền sản phẩm có bao bì đã giao dịch:</span> {AppConsts.formatNumber(machineSelected.ma_money_drink)} VNĐ</p>
								<p><span style={{ fontWeight: 500 }}>Số tiền sản phẩm không bao bì đã giao dịch:</span> {AppConsts.formatNumber(machineSelected.ma_money_freshdrink)} VNĐ</p>
								<p><span style={{ fontWeight: 500 }}>Số lượng sản phẩm có bao bì đã mua:</span> {AppConsts.formatNumber(machineSelected.ma_no_drink)} chai</p>
								<p><span style={{ fontWeight: 500 }}>Dung tích sản phẩm không bao bì đã mua:</span> {AppConsts.formatNumber(machineSelected.ma_no_fr_drink)} ml</p>
								<p><span style={{ fontWeight: 500 }}>Số lượng sản phẩm có bao bì đã thêm vào:</span> {AppConsts.formatNumber(machineSelected.ma_no_drink_change)}	chai</p>
								<p><span style={{ fontWeight: 500 }}>Dung tích sản phẩm không bao bì đã thêm vào:</span> {AppConsts.formatNumber(machineSelected.ma_no_frdrink_change)} ml</p>
								<p><span style={{ fontWeight: 500 }}>Cho phép áp dụng mã giảm giá:</span> {machineSelected.ma_isApplyDiscountCode == true ? <Tag color="green">Cho phép</Tag> : <Tag color="red">Không cho phép</Tag>}</p>
							</Col>
							<Col span={12} style={{ padding: '10px 10px 0 10px' }}>
								<p><span style={{ fontWeight: 500 }}>Thời gian kiểm tra khởi động:</span> {machineSelected.ma_timeRepeatBootCheck / 1000} giây</p>
								<p><span style={{ fontWeight: 500 }}>Thời gian kiểm tra thanh toán qua Qr:</span> {machineSelected.ma_timeRepeatCheckQRQueue / 1000} giây</p>
								<p><span style={{ fontWeight: 500 }}>Thời gian khởi động lại máy:</span> {machineSelected.ma_restartMachineAt} giây</p>
								<p><span style={{ fontWeight: 500 }}>Có cảm biến rơi:</span> {machineSelected.ma_hasDropSensor == true ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>}</p>
								<p><span style={{ fontWeight: 500 }}>Cảm biến đáy cốc:</span> {machineSelected.ma_hasRefillSensor == true ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>}</p>
								<p><span style={{ fontWeight: 500 }}>Đơn vị thanh toán:</span> {machineSelected.ma_unitPayment}</p>
								<p><span style={{ fontWeight: 500 }}>Kích hoạt:</span> {machineSelected.ma_is_active == true ? <Tag color="green">Đã kích hoạt</Tag> : <Tag color="red">Chưa kích hoạt</Tag>}</p>
							</Col>
						</Row>
						<Row>
							<Col span={12}>
								<h3>Thông số Vending</h3>
							</Col>
							<Col span={12}>
								<h3>Thông số thanh toán</h3>
							</Col>
						</Row>
						<Row gutter={[16, 16]} style={{ margin: "10px 0" }}>
							<Col span={12} style={{ border: "1px solid black ", borderRight: 'none', padding: '10px 10px 0 10px' }}>
								<p><span style={{ fontWeight: 500 }}>Bật/Tắt đèn LED Vending:</span> {machineSelected.ma_turnOnLedVending == true ? <Tag color="green">Bật</Tag> : <Tag color="red">Tắt</Tag>}</p>
								<p><span style={{ fontWeight: 500 }}>Số lượng khay tối đa trong Vending:</span> {machineSelected.ma_maxTrayVending}</p>
								<p><span style={{ fontWeight: 500 }}>Thời gian hoạt động Led Vending:</span> {machineSelected.workingTimeLedVending}</p>
								<p><span style={{ fontWeight: 500 }}>Tập lệnh Vending:</span> {valueOfeMainBoard(machineSelected.ma_commandVending)}</p>
								<p><span style={{ fontWeight: 500 }}>Bật sấy kính:</span> {machineSelected.ma_turnOnGlassHeat == true ? <Tag color="green">Bật</Tag> : <Tag color="red">Tắt</Tag>}</p>
								<p><span style={{ fontWeight: 500 }}>Thời gian làm việc của sấy kính:</span> {machineSelected.workingTimeGlassHeat}</p>
							</Col>
							<Col span={12} style={{ border: "1px solid black ", padding: '10px 10px 0 10px' }}>
								<p><span style={{ fontWeight: 500 }}>Kích hoạt thanh toán tiền mặt:</span> {machineSelected.ma_activeCashPayment == true ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>}</p>
								<p><span style={{ fontWeight: 500 }}>Kích hoạt thanh toán QR:</span> {machineSelected.ma_activeQrCodePayment == true ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>}</p>
								<p><span style={{ fontWeight: 500 }}>Kích hoạt thanh toán RFID:</span> {machineSelected.ma_activeRifdPayment == true ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>}</p>
							</Col>
						</Row>
						<Row>
							<Col span={12}>
								<h3>Thông số chiller</h3>
							</Col>
							<Col span={12}>
								<h3>Thông số Refill</h3>
							</Col>
						</Row>
						<Row style={{ margin: "10px 0" }}>
							<Col span={12} style={{ border: "1px solid black ", borderRight: 'none', padding: '10px 10px 0 10px' }}>
								<p><span style={{ fontWeight: 500 }}>Bật/Tắt LED Refill:</span> {machineSelected.ma_turnOnledRefill == true ? <Tag color="green">Bật</Tag> : <Tag color="red">Tắt</Tag>}</p>
								<p><span style={{ fontWeight: 500 }}>Dung tích bơm tối thiểu trong 1 lần:</span> {machineSelected.ma_minFillOneTime} ml</p>
								<p><span style={{ fontWeight: 500 }}>Dung tích bình chứa tối đa:</span> {machineSelected.ma_maxTankRefill} ml</p>

								<p><span style={{ fontWeight: 500 }}>Thời gian làm việc của LED refill:</span> {machineSelected.workingTimeLedRefill}</p>
								<p><span style={{ fontWeight: 500 }}>Kích hoạt refill:</span> {machineSelected.ma_activeRefill == true ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>}</p>
								<p><span style={{ fontWeight: 500 }}>Tập lệnh refill:</span> {valueOfeMainBoard(machineSelected.ma_commandRefill)}</p>
							</Col>
							<Col span={12} style={{ border: "1px solid black ", padding: '10px 10px 0 10px' }}>
								<p><span style={{ fontWeight: 500 }}>Nhiệt độ đích cho Chiller:</span> {machineSelected.ma_targetTempRefrigeration} độ</p>
								<p><span style={{ fontWeight: 500 }}>sản độ hoạt động của Chiller:</span> {machineSelected.ma_workingModeRefrigeration}</p>
								<p><span style={{ fontWeight: 500 }}>Khoá/Mở khóa sản độ bất thường của Chiller:</span> {machineSelected.ma_lockAbnormalRefrigeration}</p>
								<p><span style={{ fontWeight: 500 }}>Thời gian hoạt động của Chiller:</span> {machineSelected.workingTimeRefrigeration}</p>
								<p><span style={{ fontWeight: 500 }}>Tắt/Bật chiller:</span> {machineSelected.turnOnRefrigeration == true ? <Tag color="green">Bật</Tag> : <Tag color="red">Tắt</Tag>}</p>
							</Col>
						</Row>
					</>
					:
					<Row justify="center">
						<h2>Không có dữ liệu</h2>
					</Row>
				}

			</>
		)
	}
}