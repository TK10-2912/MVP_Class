import * as React from 'react';
import { Col, Row, Button, Input, Card, Form, message, InputNumber, Switch } from 'antd';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { SaveOutlined } from '@ant-design/icons';
import { GeneralSettingsEditDto } from '@src/services/services_autogen';
import AppConsts from '@src/lib/appconst';
import { L } from '@src/lib/abpUtility';
import rules from '@src/scenes/Validation';

export interface IProps {
	onSaveGeneralSetting?: (item: GeneralSettingsEditDto) => void;
	general_setting: GeneralSettingsEditDto;
}

export default class GeneralSettings extends AppComponentBase<IProps> {
	state = {
		isLoadDone:false,
		switchMenu: false,
	}
	private formRef: any = React.createRef();

	async componentDidMount() {
		var isMenu = localStorage.getItem("isMenu");
		this.initData(this.props.general_setting);
		await this.setState({ switchMenu: isMenu== 'true' ? true : false,isLoadDone: !this.state.isLoadDone });
	}

	async componentDidUpdate(prevProps, prevState) {
		if (this.props.general_setting != prevProps.general_setting) {
			this.initData(this.props.general_setting);
		}
	}

	initData = async (general_setting: GeneralSettingsEditDto) => {
		this.setState({ isLoadDone: false });
		if (general_setting !== undefined) {
			await this.formRef.current!.setFieldsValue({ ...general_setting });
		} else {
			this.formRef.current.resetFields();
		}
		this.setState({ isLoadDone: !this.state.isLoadDone });
	}

	onSaveGeneralSetting = () => {
		const form = this.formRef.current;
		form!.validateFields().then(async (values: any) => {
			let general_setting = new GeneralSettingsEditDto({ ...values });
			if (this.props.onSaveGeneralSetting) {
				this.props.onSaveGeneralSetting(general_setting);
			}
			message.success(L("cap_nhat_thanh_cong"));
		})
		localStorage.removeItem("isMenu");
		localStorage.setItem("isMenu",`${this.state.switchMenu}` );
	}
	switchMenu= (value: boolean) =>{
		this.setState({switchMenu: value})
	}
	render() {
		return (
			<Card>
				<Form ref={this.formRef}>
					<Row gutter={15} style={{ marginTop: "10px" }}>
						<Col span={4}>
							<Form.Item name={"soLuongSapHetHangVending"}>
								<Input type='number' min={1} addonAfter={L("")} />
							</Form.Item></Col>
						<Col span={20}>{L("Cài đặt số lượng sắp hết hàng Vending")}</Col>
						<Col span={24} style={{ marginTop: "10px", marginBottom: "10px", fontSize: "13px", color: "#096dd9" }}><i>{L("Cài đặt số lượng sản phẩm có bao bì sắp hết hàng theo đơn vị được lưu trong hệ thống: Chai, lon, ....")}</i></Col>
					</Row>
					<Row gutter={15} style={{ marginTop: "10px" }}>
						<Col span={4}>
							<Form.Item name={"soLuongSapHetHangRefill"}>
								<Input type='number' min={1} addonAfter={L("ml")} />
							</Form.Item></Col>
						<Col span={20}>{L("Cài đặt dung tích sắp hết hàng Refill ")}</Col>
						<Col span={24} style={{ marginTop: "10px", marginBottom: "10px", fontSize: "13px", color: "#096dd9" }}><i>{"Cài đặt dung tích sản phẩm không có bao bì sắp hết hàng theo ml"}.</i></Col>
					</Row>
					<Row gutter={15} style={{ marginTop: "10px" }}>
						<Col span={4}>
							<Form.Item name={"soLuongCotToiDaBoCucMau"}>
								<Input type='number' min={1} addonAfter={L("cột")} />
							</Form.Item>
						</Col>
						<Col span={20}>{L("Cài đặt số lượng cột tối đa của bố cục")}</Col>
						<Col span={24} style={{ marginTop: "10px", marginBottom: "10px", fontSize: "13px", color: "#096dd9" }}><i>{L("Cài đặt số lượng cột tối đa của bố cục máy bán nước ")}.</i></Col>
					</Row>
					<Row gutter={15} style={{ marginTop: "10px" }}>
						<Col span={4}>
							<Form.Item name={"soLuongHangToiDaBoCucMau"}>
								<Input type='number' min={1} addonAfter={L("hàng")} />
							</Form.Item>
						</Col>
						<Col span={20}>{L("Cài đặt số lượng hàng tối đa của bố cục")}</Col>
						<Col span={24} style={{ marginTop: "10px", marginBottom: "10px", fontSize: "13px", color: "#096dd9" }}><i>{L("Cài đặt số lượng hàng tối đa của bố cục máy bán nước ")}.</i></Col>
					</Row>
					<Row gutter={15} style={{ marginTop: "10px" }}>
						<Col span={4}>
							<Form.Item name={"thoiGianKiemTraMayOnline"}>
								<Input type='number' min={1} addonAfter={L("phút")} />
							</Form.Item>
						</Col>
						<Col span={20}>{L("Cài đặt thời gian kiểm tra máy online")}</Col>
						<Col span={24} style={{ marginTop: "10px", marginBottom: "10px", fontSize: "13px", color: "#096dd9" }}><i>{L("Cài đặt thời gian kiểm tra máy online")}.</i></Col>
					</Row>
					<Row gutter={15} style={{ marginTop: "10px" }}>
						<Col span={4}>
							<Form.Item>
								<Switch checked={this.state.switchMenu} onChange={e =>this.switchMenu(e) } />
							</Form.Item>
						</Col>
						<Col span={20}>{L("Tự động đóng mở Menu")}</Col>
						<Col span={24} style={{ marginTop: "10px", marginBottom: "10px", fontSize: "13px", color: "#096dd9" }}><i>{L("Tự động đóng mở Menu")}.</i></Col>
					</Row>
				</Form>
				<hr style={{ marginTop: "20px" }}></hr>
				<Button icon={<SaveOutlined />} type='primary' onClick={this.onSaveGeneralSetting}>{L("luu_cai_dat")}</Button>
			</Card >
		);
	}
}