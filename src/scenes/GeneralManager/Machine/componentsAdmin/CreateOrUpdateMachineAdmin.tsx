import AppConsts, { cssColResponsiveSpan } from "@src/lib/appconst";
import { Button, Card, Checkbox, Col, Form, Input, Row, Tag, message } from "antd";
import React from "react";
import { CreateMachineLocationLogInput, MachineDto, UpdateMachineInput } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import MapComponent, { PositionMap } from "@src/components/MapComponent";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import SelectedGroupMachine from "@src/components/Manager/SelectedGroupMachine";
import rules from "@src/scenes/Validation";
import { eMainBoard, valueOfeMainBoard } from "@src/lib/enumconst";
import { CloseSquareOutlined, EditOutlined, GlobalOutlined } from "@ant-design/icons";

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
		us_id_operator: undefined,
		gr_ma_id: undefined,
		ma_cameraUrl: undefined,
		changeUrl: false,
		ma_mapName: undefined,
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
				us_id_operator: input.us_id_operator,
				ma_cameraUrl: input.ma_cameraUrl,
				ma_mapName: input.ma_mapName,
			});
			this.centerMap.lat = Number(input.ma_gps_lat);
			this.centerMap.lng = Number(input.ma_gps_lng);
			this.centerMap.title = input.ma_display_name;
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

	onCreateUpdate = (isUpdateMap: boolean) => {
		const { machineSelected } = this.props;
		const form = this.formRef.current;
		this.setState({ isLoadDone: false })
		form!.validateFields().then(async (values: any) => {
			let unitData = new UpdateMachineInput({ ma_id: machineSelected.ma_id, ...values });
			unitData.ma_is_debug = this.state.isDebug!;
			unitData.ma_mapName = machineSelected.ma_mapName;
			unitData.ma_mapUrl = machineSelected.ma_mapUrl;
			if (isUpdateMap) {
				if ((values.ma_mapName && !values.ma_mapUrl) || (!values.ma_mapName && values.ma_mapUrl)) {
					message.error("Điểm đặt hoặc URL không được để trống!");
					return;
				} else {
					const updatedIframeContent = values.ma_mapUrl.replace(/width="\d+"/, '').replace(/style="[^"]*"/, 'style="border:0;width:-webkit-fill-available;"');
					unitData.ma_mapUrl = updatedIframeContent;
					unitData.ma_mapName = values.ma_mapName;
					var createLog = new CreateMachineLocationLogInput();
					createLog.ma_lo_log_mapName = values.ma_mapName;
					createLog.ma_lo_log_mapUrl = updatedIframeContent;
					createLog.ma_id = machineSelected.ma_id;
					await stores.machineStore.createMachineLocationLogs(createLog);
				}
			}
			await stores.machineStore.updateMachine(unitData);
			stores.sessionStore.getCurrentLoginInformations();
			message.success("Chỉnh sửa máy thành công");
			this.createSuccess();
			this.setState({ isLoadDone: true });
		})
	};
	// createMachineLocationLogs = () => {
	// 	const { machineSelected } = this.props;
	// 	const form = this.formRef.current;
	// 	this.setState({ isLoadDone: false })
	// 	form!.validateFields().then(async (values: any) => {
	// 		if ((values.ma_mapName && !values.ma_mapUrl) || (!values.ma_mapName && values.ma_mapUrl)) {
	// 			message.error("Điểm đặt hoặc URL không được để trống!");
	// 			return;
	// 		} else {
	// 			let unitData = new UpdateMachineInput();
	// 			const updatedIframeContent = values.ma_mapUrl.replace(/width="\d+"/, '').replace(/style="[^"]*"/, 'style="border:0;width:-webkit-fill-available;"');
	// 			unitData.ma_mapUrl = updatedIframeContent;
	// 			var createLog = new CreateMachineLocationLogInput();
	// 			createLog.ma_lo_log_mapName = values.ma_mapName;
	// 			createLog.ma_lo_log_mapUrl = updatedIframeContent;
	// 			createLog.ma_id = machineSelected.ma_id;
	// 			await stores.machineStore.createMachineLocationLogs(createLog);
	// 			await stores.machineStore.updateMachine(unitData);
	// 		}
	// 		message.success("Chỉnh sửa vị trí thành công");
	// 		this.createSuccess();
	// 		this.setState({ isLoadDone: true });
	// 	})
	// };

	createSuccess = () => {
		if (!!this.props.createSuccess) {
			this.props.createSuccess();
		}
	}

	componentWillUnmount() {
		this.setState = (_state, _callback) => {
			return;
		};
	}
	render() {
		const { machineSelected } = this.props;

		return (
			<Card>
				<Row>
					<Col>
						<h2>
							{machineSelected?.ma_id === undefined
								? 'Thêm mới máy bán nước'
								: 'Chỉnh sửa thông tin máy ' +
								machineSelected!.ma_display_name +
								`" ${machineSelected!.ma_code}"`}{' '}
							{
								<Button

									size="small"
									type="primary"
									onClick={() => window.open(`/monitor/sale_status_monitor/?ma_id=${machineSelected.ma_id}`, '_blank')}
								>
									Tình trạng bán hàng của máy
								</Button>
							}{' '}
						</h2>
					</Col>
				</Row>
				<Row>
					<Form ref={this.formRef} style={{ width: "100%" }}>
						<Row>
							<Col {...cssColResponsiveSpan(24, 24, 11, 11, 11, 11)}>
								<span><strong>Nhóm máy:</strong></span>
								<Form.Item rules={[rules.required]} {...AppConsts.formItemLayout} name={'gr_ma_id'} >
									<SelectedGroupMachine
										parent="update"
										groupmachineId={this.state.gr_ma_id}
										onChangeGroupMachine={async (value) => {
											await this.formRef.current!.setFieldsValue({ gr_ma_id: value }); await this.setState({ gr_ma_id: value });
										}}
									/>
								</Form.Item>
								<span><span style={{ color: "red" }}>* </span><strong>Mật khẩu máy của người dùng:</strong></span>
								<Form.Item rules={[rules.required, rules.noAllSpaces]} {...AppConsts.formItemLayout} name={'ma_passcode_admin'} >
									<Input placeholder="Mật khẩu máy của người dùng..." />
								</Form.Item>
								<span><span style={{ color: "red" }}>* </span><strong > Mật khẩu máy của người thêm sản phẩm:</strong></span>
								<Form.Item rules={[rules.noAllSpaces, rules.required]} {...AppConsts.formItemLayout} name={'ma_passcode_replenish'} >
									<Input placeholder="Mật khẩu máy của người thêm sản phẩm..." />
								</Form.Item>
								<span><span style={{ color: "red" }}>* </span><strong > Tên cây máy bán nước:</strong></span>
								<Form.Item rules={[rules.required, rules.noAllSpaces]} {...AppConsts.formItemLayout} name={'ma_display_name'} >
									<Input maxLength={AppConsts.maxLength.nameMachine} placeholder="Tên cây máy bán nước..." />
								</Form.Item>

								{this.state.changeUrl === false ?
									<Row>
										<div>
											<strong>Điểm đặt</strong>: {this.state.ma_mapName || 'Chưa có dữ liệu'}
										</div>
										<Button type="primary" size="small" title="Mở form cập nhật vị trí" style={{ margin: 5 }} icon={<EditOutlined />} onClick={() => { this.setState({ changeUrl: !this.state.changeUrl }) }}></Button>
									</Row>
									:
									<>
										<Row>
											<span><strong>Điểm đặt</strong></span>
											<Button type="primary" size="small" title="Cập nhật vị trí" style={{ margin: 5 }} icon={<EditOutlined />} onClick={() => { this.onCreateUpdate(true) }}></Button>
											<Button danger size="small" style={{ margin: 5 }} title="Hủy" icon={<CloseSquareOutlined />} onClick={() => { this.setState({ changeUrl: !this.state.changeUrl }) }}></Button>
										</Row>
										<Form.Item rules={[rules.noAllSpaces]}{...AppConsts.formItemLayout} name={"ma_mapName"}>
											<Input
												placeholder="Điểm đặt..."
												value={this.state.ma_mapName}
											/>
										</Form.Item>
									</>

								}
								{this.state.changeUrl == false ?
									<></> :
									<>
										<span><strong>URL Map</strong></span>
										<Form.Item rules={[rules.noAllSpaces]} {...AppConsts.formItemLayout} name={'ma_mapUrl'}>
											<Input placeholder="Nhập URL..." />
										</Form.Item>
									</>
								}

								<span><strong>URL Camera</strong></span>
								<Form.Item rules={[rules.noAllSpaces]} {...AppConsts.formItemLayout} name={'ma_cameraUrl'}>
									<Input placeholder="Nhập URL..." onChange={async (e) => await this.setState({ ma_cameraUrl: e.target.value })} />
								</Form.Item>
								<span>{this.state.ma_cameraUrl ? <span style={{ color: "red" }}>* </span> : ""}<strong>Tên đăng nhập</strong></span>
								<Form.Item rules={[rules.noAllSpaces, this.state.ma_cameraUrl ? rules.required : rules.noAllSpaces]} {...AppConsts.formItemLayout} name={'ma_cameraUserName'} >
									<Input />
								</Form.Item>
								<span>{this.state.ma_cameraUrl ? <span style={{ color: "red" }}>* </span> : ""}<strong>Mật khẩu</strong></span>
								<Form.Item rules={[rules.noAllSpaces, this.state.ma_cameraUrl ? rules.required : rules.noAllSpaces]} {...AppConsts.formItemLayout} name={'ma_cameraPassword'} >
									<Input.Password />
								</Form.Item>
								<span style={{ marginRight: 8 }}><strong>Gỡ lỗi: </strong></span>
								<Form.Item {...AppConsts.formItemLayout} name={'ma_is_debug'} >
									<Checkbox checked={this.state.isDebug} onChange={(e) => this.setState({ isDebug: e.target.checked })} />
								</Form.Item>
								{this.isGranted(AppConsts.Permission.Pages_Manager_General_Machine_Update) &&
									<Col style={{ display: 'flex', justifyContent: "end", marginBottom: 15 }}>
										<Button type="primary" onClick={() => this.onCreateUpdate(false)}>Lưu</Button>
									</Col>
								}
							</Col>
							{/* <Col {...cssColResponsiveSpan(0, 0, 1, 1, 1, 1)}></Col> */}
							<Col {...cssColResponsiveSpan(24, 24, 13, 13, 13, 13)} style={{ marginBottom: 15 }}>
								{AppConsts.isValidLocation(machineSelected.ma_gps_lat, machineSelected.ma_gps_lng) ?
									<>
										<MapComponent
											centerMap={{ lat: this.centerMap.lat, lng: this.centerMap.lng }}
											zoom={15}
											positionList={[this.centerMap]}
										/>
										<Row justify="center" style={{ marginTop: 10 }}>
											<Button onClick={() => AppConsts.actionDirection(this.centerMap.lat.toString(), this.centerMap.lng.toString())} icon={<GlobalOutlined />}>
												Đường đi
											</Button>
										</Row>
									</>
									:
									(machineSelected.ma_mapUrl) ?
										<div dangerouslySetInnerHTML={{ __html: machineSelected.ma_mapUrl! }} />
										: ""
								}

							</Col>

						</Row>
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
								<Row style={{ border: '1px solid black', margin: "10px 0", fontWeight: 500 }}>
									<Col span={8} style={{ padding: '10px 10px 0 10px' }}>
										<p><span>Số tiền sản phẩm có bao bì đã giao dịch: <b>{AppConsts.formatNumber(this.state.ma_money_drink)} VNĐ</b></span>  </p>
										<p><span>Số tiền sản phẩm không bao bì đã giao dịch: <b>{AppConsts.formatNumber(this.state.ma_money_freshdrink)} VNĐ</b></span> </p>
										<p><span>Số lượng sản phẩm có bao bì đã mua: <b>{AppConsts.formatNumber(this.state.ma_no_drink)} chai</b></span> </p>
										<p><span>Dung tích sản phẩm không bao bì đã mua: <b>{AppConsts.formatNumber(this.state.ma_no_fr_drink)} ml</b></span> </p>
										<p><span>Số lượng sản phẩm có bao bì đã thêm vào: <b>{AppConsts.formatNumber(this.state.ma_no_drink_change)} chai</b></span> </p>
										<p><span>Dung tích sản phẩm không bao bì đã thêm vào: <b>{AppConsts.formatNumber(this.state.ma_no_frdrink_change)} ml</b></span> </p>
										<p><span>Cho phép áp dụng mã giảm giá: <b>{machineSelected.ma_isApplyDiscountCode == true ? <Tag color="green">Cho phép</Tag> : <Tag color="red">Không cho phép</Tag>}</b></span> </p>
									</Col>
									<Col span={8} style={{ borderRight: "1px solid black ", padding: '10px 10px 0 10px' }}>
										<p><span>Thời gian kiểm tra khởi động: <b>{machineSelected.ma_timeRepeatBootCheck / 1000} giây</b></span> </p>
										<p><span>Thời gian kiểm tra thanh toán qua QR: <b> {machineSelected.ma_timeRepeatCheckQRQueue / 1000} giây</b></span></p>
										<p><span>Thời gian khởi động lại máy: <b>{machineSelected.ma_restartMachineAt} giây</b></span> </p>
										<p><span>Có cảm biến rơi: <b>{machineSelected.ma_hasDropSensor == true ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>}</b></span> </p>
										<p><span>Cảm biến đáy cốc: <b>{machineSelected.ma_hasRefillSensor == true ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>}</b></span> </p>
										<p><span>Đơn vị thanh toán: <b>{machineSelected.ma_unitPayment}</b></span> </p>
										<p><span>Kích hoạt: <b>{machineSelected.ma_is_active == true ? <Tag color="green">Đã kích hoạt</Tag> : <Tag color="red">Chưa kích hoạt</Tag>}</b></span> </p>
									</Col>
									<Col span={8} style={{ padding: '10px 10px 0 10px' }}>
										<p><span>Bật/Tắt đèn LED Vending: <b>{machineSelected.ma_turnOnLedVending == true ? <Tag color="green">Bật</Tag> : <Tag color="red">Tắt</Tag>}</b></span> </p>
										<p><span>Số lượng khay tối đa trong Vending: <b>{machineSelected.ma_maxTrayVending}</b></span> </p>
										<p><span>Thời gian hoạt động Led Vending: <b>{machineSelected.workingTimeLedVending}</b></span> </p>
										<p><span>Tập lệnh Vending: <b>{valueOfeMainBoard(machineSelected.ma_commandVending)}</b></span> </p>
										<p><span>Bật sấy kính: {machineSelected.ma_turnOnGlassHeat == true ? <Tag color="green">Bật</Tag> : <Tag color="red">Tắt</Tag>}</span> </p>
										<p><span>Thời gian làm việc của sấy kính: <b>{machineSelected.workingTimeGlassHeat}</b></span> </p>
									</Col>
								</Row>
								<Row>
									<Col span={8}>
										<h3>Thông số thanh toán</h3>
									</Col>
									{
										machineSelected.ma_commandRefill === eMainBoard.NONE.num ||
										<Col span={8}>
											<h3>Thông số Refill</h3>
										</Col>
									}
									<Col span={8}>
										<h3>Thông số chiller</h3>
									</Col>
								</Row>
								<Col span={machineSelected.ma_commandRefill === eMainBoard.NONE.num ? 16 : 24}>
									<Row style={{ border: '1px solid black', margin: "10px 0" }}>
										<Col span={machineSelected.ma_commandRefill === eMainBoard.NONE.num ? 12 : 8} style={{ borderRight: "1px solid black ", padding: '10px 10px 0 10px' }}>
											<p><span style={{ fontWeight: 500 }}>Kích hoạt thanh toán tiền mặt:</span> {machineSelected.ma_activeCashPayment == true ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>}</p>
											<p><span style={{ fontWeight: 500 }}>Kích hoạt thanh toán QR:</span> {machineSelected.ma_activeQrCodePayment == true ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>}</p>
											<p><span style={{ fontWeight: 500 }}>Kích hoạt thanh toán RFID:</span> {machineSelected.ma_activeRifdPayment == true ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>}</p>
										</Col>
										<Col span={machineSelected.ma_commandRefill === eMainBoard.NONE.num ? 0 : 8} style={{ borderRight: "1px solid black ", padding: '10px 10px 0 10px' }}>
											<p><span style={{ fontWeight: 500 }}>Bật/Tắt LED Refill:</span> {machineSelected.ma_turnOnledRefill == true ? <Tag color="green">Bật</Tag> : <Tag color="red">Tắt</Tag>}</p>
											<p><span style={{ fontWeight: 500 }}>Dung tích bơm tối thiểu trong 1 lần:<b>{machineSelected.ma_minFillOneTime} ml</b></span> </p>
											<p><span style={{ fontWeight: 500 }}>Dung tích bình chứa tối đa:<b>{machineSelected.ma_maxTankRefill} ml</b></span> </p>
											<p><span style={{ fontWeight: 500 }}>Thời gian làm việc của LED refill:<b>{machineSelected.workingTimeLedRefill}</b></span> </p>
											<p><span style={{ fontWeight: 500 }}>Kích hoạt refill:</span> {machineSelected.ma_activeRefill == true ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>}</p>
											<p><span style={{ fontWeight: 500 }}>Tập lệnh refill:<b>{valueOfeMainBoard(machineSelected.ma_commandRefill)}</b></span> </p>
										</Col>
										<Col span={machineSelected.ma_commandRefill === eMainBoard.NONE.num ? 12 : 8} style={{ padding: '10px 10px 0 10px' }}>
											<p><span style={{ fontWeight: 500 }}>Nhiệt độ đích cho Chiller:<b>{machineSelected.ma_targetTempRefrigeration} độ</b></span> </p>
											<p><span style={{ fontWeight: 500 }}>sản độ hoạt động của Chiller:<b>{machineSelected.ma_workingModeRefrigeration}</b></span> </p>
											<p><span style={{ fontWeight: 500 }}>Khoá/Mở khóa chế độ bất thường của Chiller:<b>{machineSelected.ma_lockAbnormalRefrigeration}</b></span> </p>
											<p><span style={{ fontWeight: 500 }}>Thời gian hoạt động của Chiller:<b>{machineSelected.workingTimeRefrigeration}</b></span> </p>
											<p><span style={{ fontWeight: 500 }}>Tắt/Bật chiller:</span> {machineSelected.turnOnRefrigeration == true ? <Tag color="green">Bật</Tag> : <Tag color="red">Tắt</Tag>}</p>
										</Col>
									</Row>
								</Col>
							</>
						}
					</Form>
				</Row >
			</Card >
		)
	}
}