import GoogleMap, { PositionMap } from "@src/components/MapComponent";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import SelectUser from "@src/components/Manager/SelectUser";
import SelectedGroupMachine from "@src/components/Manager/SelectedGroupMachine";
import AppConsts from "@src/lib/appconst";
import rules from "@src/scenes/Validation";
import { MachineDto, UpdateMachineInput } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import { Button, Card, Checkbox, Col, Form, Input, Row, Tag, message } from "antd";
import React from "react";
import MapComponent from "@src/components/MapComponent";

export interface IProps {
	onCancel?: () => void;
	createSuccess?: () => void;
	machineSelected: MachineDto,
}
export default class CreateOrUpdateMachineAdmin extends AppComponentBase<IProps> {
	private formRef: any = React.createRef();

	state = {
		isLoadDone: false,
		idSelected: -1,
		isDebug: false,
		ma_money_drink: undefined,
		ma_money_freshdrink: undefined,
		ma_no_drink: undefined,
		ma_no_fr_drink: undefined,
		ma_no_drink_change: undefined,
		ma_no_frdrink_change: undefined,
		us_id_owner: undefined,
		gr_ma_id: undefined,
	}
	file: any;
	centerMap: PositionMap = new PositionMap();

	async componentDidMount() {
		await this.initData(this.props.machineSelected);
	}
	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.machineSelected != undefined && nextProps.machineSelected.ma_id !== prevState.idSelected) {
			return ({ idSelected: nextProps.machineSelected.ma_id });
		}
		return null;
	}

	initData = async (input: MachineDto | undefined) => {
		this.setState({ isLoadDone: false });
		if (input !== undefined && input.ma_id !== undefined) {
			await this.setState({
				isDebug: input.ma_is_debug,
				ma_money_drink: input.ma_money_drink,
				ma_money_freshdrink: input.ma_money_freshdrink,
				ma_no_drink: input.ma_no_drink,
				ma_no_fr_drink: input.ma_no_fr_drink,
				ma_no_drink_change: input.ma_no_drink_change,
				ma_no_frdrink_change: input.ma_no_frdrink_change,
				gr_ma_id: input.gr_ma_id,
				us_id_owner: input.us_id_owner,
			});
			this.centerMap.lat = Number(input.ma_gps_lat);
			this.centerMap.lng = Number(input.ma_gps_lng);
			this.centerMap.title = input.ma_display_name!;
			this.formRef.current!.setFieldsValue({ ...input, });
		} else {
			this.formRef.current.resetFields();
		}
		this.setState({ isLoadDone: true });
	}

	async componentDidUpdate(prevProps, prevState) {
		if (this.state.idSelected !== prevState.idSelected) {
			this.initData(this.props.machineSelected);
		}
	}

	onCreateUpdate = () => {
		const { machineSelected } = this.props;
		const form = this.formRef.current;
		this.setState({ isLoadDone: false })
		form!.validateFields().then(async (values: any) => {
			let unitData = new UpdateMachineInput({ ma_id: machineSelected.ma_id, ...values });
			unitData.ma_is_debug = this.state.isDebug!;
			await stores.machineStore.updateMachine(unitData);
			stores.sessionStore.getCurrentLoginInformations();
			message.success("Chỉnh sửa máy thành công");
			this.createSuccess();
			stores.sessionStore.getCurrentLoginInformations();
			this.setState({ isLoadDone: true });
		})
	};

	createSuccess = () => {
		if (!!this.props.createSuccess) {
			this.props.createSuccess();
		}
	}

	componentWillUnmount() {
		this.setState = (state, callback) => {
			return;
		};
	}
	render() {
		const { machineSelected } = this.props;

		return (
			<Card>
				<Row>
					<Col span={16} style={{ textAlign: "start" }}>
						<h3>{machineSelected?.ma_id === undefined ? "Thêm mới máy bán nước" : "Chỉnh sửa thông tin máy " + machineSelected!.ma_display_name}</h3>
					</Col>
				</Row>
				<Row>
					<Form ref={this.formRef} style={{ width: '100%' }} >
						<Row>
							<Col span={12} style={{ paddingRight: '15px' }}>
								<Form.Item label={'Nhóm máy'} {...AppConsts.formItemLayout} name={'gr_ma_id'} >
									<SelectedGroupMachine
										groupmachineId={this.state.gr_ma_id}
										onChangeGroupMachine={(value) => this.formRef.current!.setFieldsValue({ gr_ma_id: value })}
									/>
								</Form.Item>
								{/* <Form.Item label="Ảnh" {...AppConsts.formItemLayout} >
									<FileAttachmentsTest onSubmitUpdate={(fi_id: number) => this.setState({ ma_bg_image: fi_id })} file={this.file} lengthUpload={1} />
								</Form.Item> */}
								<Form.Item label={'Mật khẩu máy của người dùng'} rules={[rules.noAllSpaces, rules.required]} {...AppConsts.formItemLayout} name={'ma_passcode_admin'} >
									<Input placeholder="Mật khẩu máy của người dùng..." />
								</Form.Item>
								<Form.Item label={'Mật khẩu máy của người thêm sản phẩm'} rules={[rules.noAllSpaces, rules.required]} labelCol={{ span: 12 }} wrapperCol={{ span: 12 }} name={'ma_passcode_replenish'} >
									<Input placeholder="Mật khẩu máy của người thêm sản phẩm..." />
								</Form.Item>
								<Form.Item label={'Tên cây máy bán nước'} rules={[rules.required, rules.noAllSpaces]} {...AppConsts.formItemLayout} name={'ma_display_name'} >
									<Input max={AppConsts.maxLength.nameMachine} placeholder="Tên cây máy bán nước..." />
								</Form.Item>
								<Form.Item label={'Người sở hữu'} rules={[rules.required]}{...AppConsts.formItemLayout} name={'us_id_owner'} >
									<SelectUser
										us_id={this.state.us_id_owner}
										onChangeUser={(value) => this.formRef.current!.setFieldsValue({ us_id_owner: value })
										}
									></SelectUser>
								</Form.Item>
								<Form.Item label={'Gỡ lỗi'} {...AppConsts.formItemLayout} name={'ma_is_debug'} >
									<Checkbox checked={this.state.isDebug} onChange={(e) => this.setState({ isDebug: e.target.checked })} />
								</Form.Item>
								<Col style={{ display: 'flex', justifyContent: "end", marginBottom: "10px" }}>
									<Button type="primary" onClick={() => this.onCreateUpdate()}>Lưu</Button></Col>
							</Col>
							<Col span={12}>
								<MapComponent
									centerMap={{ lat: this.centerMap.lat, lng: this.centerMap.lng }}
									zoom={15}
									positionList={[this.centerMap]}
								/>
							</Col>
						</Row>
						ma_restartPaymentAfter!: MachineResetPayment; reset tiền sau khi trả hàng
						{!!machineSelected &&
							<>
								<Row>
									<Col span={8}>
										<h3>Thông số chung</h3>
									</Col>
									<Col span={8} offset={8}>
										<h3>Thông số Vending</h3>
									</Col>

								</Row>
								<Row style={{ border: '1px solid black', margin: "10px 0" }}>
									<Col span={8} style={{ padding: '10px 10px 0 10px' }}>
										<p><span style={{ fontWeight: 500 }}>Số tiền sản phẩm có bao bì đã giao dịch:</span> {AppConsts.formatNumber(this.state.ma_money_drink)} VNĐ</p>
										<p><span style={{ fontWeight: 500 }}>Số tiền sản phẩm không bao bì đã giao dịch:</span> {AppConsts.formatNumber(this.state.ma_money_freshdrink)} VNĐ</p>
										<p><span style={{ fontWeight: 500 }}>Số lượng sản phẩm có bao bì đã mua:</span> {AppConsts.formatNumber(this.state.ma_no_drink)} chai</p>
										<p><span style={{ fontWeight: 500 }}>Dung tích sản phẩm không bao bì đã mua:</span> {AppConsts.formatNumber(this.state.ma_no_fr_drink)} ml</p>
										<p><span style={{ fontWeight: 500 }}>Số lượng sản phẩm có bao bì đã thêm vào:</span> {AppConsts.formatNumber(this.state.ma_no_drink_change)}	chai</p>
										<p><span style={{ fontWeight: 500 }}>Dung tích sản phẩm không bao bì đã thêm vào:</span> {AppConsts.formatNumber(this.state.ma_no_frdrink_change)} ml</p>
										<p><span style={{ fontWeight: 500 }}>Cho phép áp dụng mã giảm giá:</span> {machineSelected.ma_isApplyDiscountCode == true ? <Tag color="green">Cho phép</Tag> : <Tag color="red">Không cho phép</Tag>}</p>
									</Col>
									<Col span={8} style={{ borderRight: "1px solid black ", padding: '10px 10px 0 10px' }}>
										<p><span style={{ fontWeight: 500 }}>Thời gian kiểm tra khởi động:</span> {machineSelected.ma_timeRepeatBootCheck / 1000} giây</p>
										<p><span style={{ fontWeight: 500 }}>Thời gian kiểm tra thanh toán qua QR:</span> {machineSelected.ma_timeRepeatCheckQRQueue / 1000} giây</p>
										<p><span style={{ fontWeight: 500 }}>Thời gian khởi động lại máy:</span> {machineSelected.ma_restartMachineAt} giây</p>
										<p><span style={{ fontWeight: 500 }}>Có cảm biến rơi:</span> {machineSelected.ma_hasDropSensor == true ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>}</p>
										<p><span style={{ fontWeight: 500 }}>Cảm biến đáy cốc:</span> {machineSelected.ma_hasRefillSensor == true ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>}</p>
										<p><span style={{ fontWeight: 500 }}>Đơn vị thanh toán:</span> {machineSelected.ma_unitPayment}</p>
										<p><span style={{ fontWeight: 500 }}>Kích hoạt:</span> {machineSelected.ma_is_active == true ? <Tag color="green">Đã kích hoạt</Tag> : <Tag color="red">Chưa kích hoạt</Tag>}</p>
									</Col>
									<Col span={8} style={{ padding: '10px 10px 0 10px' }}>
										<p><span style={{ fontWeight: 500 }}>Bật/Tắt đèn LED Vending:</span> {machineSelected.ma_turnOnLedVending == true ? <Tag color="green">Bật</Tag> : <Tag color="red">Tắt</Tag>}</p>
										<p><span style={{ fontWeight: 500 }}>Số lượng khay tối đa trong Vending:</span> {machineSelected.ma_maxTrayVending}</p>
										<p><span style={{ fontWeight: 500 }}>Thời gian hoạt động Led Vending:</span> {machineSelected.workingTimeLedVending}</p>
										<p><span style={{ fontWeight: 500 }}>Tập lệnh Vending:</span> {machineSelected.ma_commandVending}</p>
										<p><span style={{ fontWeight: 500 }}>Bật sấy kính:</span> {machineSelected.ma_turnOnGlassHeat == true ? <Tag color="green">Bật</Tag> : <Tag color="red">Tắt</Tag>}</p>
										<p><span style={{ fontWeight: 500 }}>Thời gian làm việc của sấy kính:</span> {machineSelected.workingTimeGlassHeat}</p>
									</Col>
								</Row>
								<Row>
									<Col span={8}>
										<h3>Thông số thanh toán</h3>
									</Col>
									<Col span={8}>
										<h3>Thông số Refill</h3>
									</Col>
									<Col span={8}>
										<h3>Thông số chiller</h3>
									</Col>
								</Row>
								<Row style={{ border: '1px solid black', margin: "10px 0" }}>

									<Col span={8} style={{ borderRight: "1px solid black ", padding: '10px 10px 0 10px' }}>
										<p><span style={{ fontWeight: 500 }}>Kích hoạt thanh toán tiền mặt:</span> {machineSelected.ma_activeCashPayment == true ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>}</p>
										<p><span style={{ fontWeight: 500 }}>Kích hoạt thanh toán QR:</span> {machineSelected.ma_activeQrCodePayment == true ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>}</p>
										<p><span style={{ fontWeight: 500 }}>Kích hoạt thanh toán RFID:</span> {machineSelected.ma_activeRifdPayment == true ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>}</p>
									</Col>
									<Col span={8} style={{ borderRight: "1px solid black ", padding: '10px 10px 0 10px' }}>
										<p><span style={{ fontWeight: 500 }}>Bật/Tắt LED Refill:</span> {machineSelected.ma_turnOnledRefill == true ? <Tag color="green">Bật</Tag> : <Tag color="red">Tắt</Tag>}</p>
										<p><span style={{ fontWeight: 500 }}>Dung tích bơm tối thiểu trong 1 lần:</span> {machineSelected.ma_minFillOneTime} ml</p>
										<p><span style={{ fontWeight: 500 }}>Dung tích bình chứa tối đa:</span> {machineSelected.ma_maxTankRefill} ml</p>

										<p><span style={{ fontWeight: 500 }}>Thời gian làm việc của LED refill:</span> {machineSelected.workingTimeLedRefill}</p>
										<p><span style={{ fontWeight: 500 }}>Kích hoạt refill:</span> {machineSelected.ma_activeRefill == true ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>}</p>
										<p><span style={{ fontWeight: 500 }}>Tập lệnh refill:</span> {machineSelected.ma_commandRefill}</p>
									</Col>
									<Col span={8} style={{ padding: '10px 10px 0 10px' }}>
										<p><span style={{ fontWeight: 500 }}>Nhiệt độ đích cho Chiller:</span> {machineSelected.ma_targetTempRefrigeration} độ</p>
										<p><span style={{ fontWeight: 500 }}>sản độ hoạt động của Chiller:</span> {machineSelected.ma_workingModeRefrigeration}</p>
										<p><span style={{ fontWeight: 500 }}>Khoá/Mở khóa chế độ bất thường của Chiller:</span> {machineSelected.ma_lockAbnormalRefrigeration}</p>
										<p><span style={{ fontWeight: 500 }}>Thời gian hoạt động của Chiller:</span> {machineSelected.workingTimeRefrigeration}</p>
										<p><span style={{ fontWeight: 500 }}>Tắt/Bật chiller:</span> {machineSelected.turnOnRefrigeration == true ? <Tag color="green">Bật</Tag> : <Tag color="red">Tắt</Tag>}</p>
									</Col>
								</Row>
							</>
						}
					</Form>
				</Row >
			</Card >
		)
	}
}