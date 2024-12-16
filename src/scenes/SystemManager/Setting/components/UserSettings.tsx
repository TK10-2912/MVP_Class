import * as React from 'react';
import { Col, Row, Button, Card, Form, Checkbox, message, InputNumber } from 'antd';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { SaveOutlined } from '@ant-design/icons';
import { PasswordComplexitySetting, SecuritySettingsEditDto } from '@src/services/services_autogen';
import { L } from '@src/lib/abpUtility';

export interface IProps {
	onSaveUserSetting?: (item: SecuritySettingsEditDto) => void;
	user_setting: SecuritySettingsEditDto;
}

export default class UserSettings extends AppComponentBase<IProps> {
	private formRef: any = React.createRef();

	async componentDidMount() {
		this.initData(this.props.user_setting);
	}

	async componentDidUpdate(prevProps, prevState) {
		if (this.props.user_setting != prevProps.user_setting) {
			this.initData(this.props.user_setting);
		}
	}

	initData = async (user_setting: SecuritySettingsEditDto) => {
		this.setState({ isLoadDone: false });
		if (user_setting !== undefined) {
			await this.formRef.current!.setFieldsValue({ ...user_setting.passwordComplexity });
		} else {
			this.formRef.current.resetFields();
		}
		this.setState({ isLoadDone: true });
	}

	onSaveUserSetting = () => {
		const form = this.formRef.current;
		form!.validateFields().then(async (values: any) => {
			let user_setting = new SecuritySettingsEditDto();
			let password_setting = new PasswordComplexitySetting({ ...values });
			if (this.props.onSaveUserSetting) {
				user_setting.passwordComplexity = password_setting;
				this.props.onSaveUserSetting(user_setting);
			}
			message.success(L("cap_nhat_thanh_cong"));
		})
	}

	render() {
		const {user_setting} = this.props;
		return (
			<Card>
				<Form ref={this.formRef}>
					<Row style={{ marginTop: "10px" }}>
						<Col span={1}>
							{/* <Form.Item> */}
							<Checkbox onChange={(e) => {e.target.checked && this.formRef.current!.setFieldsValue({ ...user_setting.defaultPasswordComplexity })}}/>
							{/* </Form.Item> */}
						</Col>
						<Col span={23}>{L("su_dung_cac_cai_dat_mac_dinh")}</Col>
						<Col span={24} style={{ marginTop: "10px", marginBottom: "10px", fontSize: "13px", color: "#096dd9" }}><i> {L("chon_cac_cai_dat_mac_dinh")}.</i></Col>
					</Row>
					<Row style={{ marginTop: "10px" }}>
						<Col span={1}><Form.Item name="requireDigit" valuePropName='checked'>
							<Checkbox />
						</Form.Item></Col>
						<Col span={23}>{L("bao_gom_chu_so")}</Col>
						<Col span={24} style={{ marginTop: "10px", marginBottom: "10px", fontSize: "13px", color: "#096dd9" }}><i>{L("mat_khau_bao_gom_chu_so")}.</i></Col>
					</Row>
					<Row style={{ marginTop: "10px" }}>
						<Col span={1}><Form.Item name="requireLowercase" valuePropName='checked'>
							<Checkbox />
						</Form.Item></Col>
						<Col span={23}>{L("bao_gom_chu_thuong")}</Col>
						<Col span={24} style={{ marginTop: "10px", marginBottom: "10px", fontSize: "13px", color: "#096dd9" }}><i>{L("mat_khau_bao_gom_chu_thuong")}.</i></Col>
					</Row>
					<Row style={{ marginTop: "10px" }}>
						<Col span={1}><Form.Item name="requireNonAlphanumeric" valuePropName='checked'>
							<Checkbox />
						</Form.Item></Col>
						<Col span={23}>{L("bao_gom_ky_tu_dac_biet")}</Col>
						<Col span={24} style={{ marginTop: "10px", marginBottom: "10px", fontSize: "13px", color: "#096dd9" }}><i>{L("mat_khau_bao_gom_ky_tu_dac_biet")}.</i></Col>
					</Row>
					<Row style={{ marginTop: "10px" }}>
						<Col span={1}><Form.Item name="requireUppercase" valuePropName='checked'>
							<Checkbox />
						</Form.Item></Col>
						<Col span={23}> {L("bao_gom_chu_hoa")}</Col>
						<Col span={24} style={{ marginTop: "10px", marginBottom: "10px", fontSize: "13px", color: "#096dd9" }}><i>{L("mat_khau_bao_gom_chu_hoa")}.</i></Col>
					</Row>
					<Row gutter={15} style={{ marginTop: "10px" }}>
						<Col span={3}><Form.Item name="requiredLength">
							<InputNumber style={{ width: "100%" }} />
						</Form.Item></Col>
						<Col span={21}>{L("do_dai_yeu_cau")}</Col>
						<Col span={24} style={{ marginTop: "10px", marginBottom: "10px", fontSize: "13px", color: "#096dd9" }}><i>{L("do_dai_mat_khau_yeu_cau")}.</i></Col>
					</Row>
					<Row style={{ marginTop: "10px" }}>
						<Col span={1}><Form.Item name="isEnabled">
							<Checkbox />
						</Form.Item></Col>
						<Col span={23}>{L("khoa_nguoi_dung_khi_co_thu_dang_nhap_qua_nhieu")}</Col>
						<Col span={24} style={{ marginTop: "10px", marginBottom: "10px", fontSize: "13px", color: "#096dd9" }}><i>{L("khoa_nguoi_dung_khi_co_thu_dang_nhap_qua_nhieu")}.</i></Col>
					</Row>
					<hr style={{ marginTop: "20px" }}></hr>
					<Button icon={<SaveOutlined />} type='primary' onClick={this.onSaveUserSetting}>{L("luu_cai_dat")}</Button>
				</Form>
			</Card >
		);
	}
}