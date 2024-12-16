import * as React from 'react';
import { Col, Row, Button, Input, Card, Form, message, InputNumber } from 'antd';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { SaveOutlined } from '@ant-design/icons';
import { GeneralSettingsEditDto } from '@src/services/services_autogen';
import AppConsts from '@src/lib/appconst';
import { L } from '@src/lib/abpUtility';

export interface IProps {
	onSaveGeneralSetting?: (item: GeneralSettingsEditDto) => void;
	general_setting: GeneralSettingsEditDto;
}

export default class GeneralSettings extends AppComponentBase<IProps> {
	private formRef: any = React.createRef();

	async componentDidMount() {
		this.initData(this.props.general_setting);
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
		this.setState({ isLoadDone: true });
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
	}

	render() {
		return (
			<Card>
				<Form ref={this.formRef}>
					<Row gutter={15} style={{ marginTop: "10px" }}>
						<Col span={4}><Form.Item name={"defaultCheckTime"}>
							<Input type='number' min={1} addonAfter={L("ngay")} />
						</Form.Item></Col>
						<Col span={20}>{L("thoi_gian_kiem_ke_mac_dinh")}</Col>
						<Col span={24} style={{ marginTop: "10px", marginBottom: "10px", fontSize: "13px", color: "#096dd9" }}><i>{L("cai_dat_chu_ky_thoi_gian_cho_cac_lan_kiem_ke")}.</i></Col>
					</Row>
					<Row gutter={15} style={{ marginTop: "10px" }}>
						<Col span={4}><Form.Item name={"defaultBorrowMaxTime"}>
							<Input type='number' min={1} addonAfter={L("ngay")} />
						</Form.Item></Col>
						<Col span={20}>{L("thoi_gian_muon_toi_da")}</Col>
						<Col span={24} style={{ marginTop: "10px", marginBottom: "10px", fontSize: "13px", color: "#096dd9" }}><i>{L("cai_dat_thoi_gian_muon_tai_lieu_toi_da")}.</i></Col>
					</Row>
					<Row gutter={15} style={{ marginTop: "10px" }}>
						<Col span={4}><Form.Item name={"deleteRegisterBorrowMaxTime"}>
							<Input type='number' min={1} addonAfter={L("ngay")} />
						</Form.Item></Col>
						<Col span={20}>{L("tu_dong_xoa_dang_ky_muon_sau_bao_nhieu_ngay_khi_doc_gia_khong_den_lay")}</Col>
						<Col span={24} style={{ marginTop: "10px", marginBottom: "10px", fontSize: "13px", color: "#096dd9" }}><i>{L("xoa_dang_ky_muon_neu_doc_gia_dang_ky_muon_nhung_khong_lay_sau_so_ngay_nhat_dinh")}.</i></Col>
					</Row>
					{/* <Row gutter={15} style={{ marginTop: "10px" }}>
						<Col span={4}><Form.Item>
							<Input type='number' min={0} max={100} addonAfter={"%"} />
						</Form.Item></Col>
						<Col span={20}>Cho phép mượn dựa trên số tiền trong thẻ</Col>
						<Col span={24} style={{ marginTop: "10px", marginBottom: "10px", fontSize: "13px", color: "#096dd9" }}><i>Cho phép mượn dựa trên số tiền trong thẻ lớn hơn tiền sách số phần trăm.</i></Col>
					</Row> */}
					<Row gutter={15} style={{ marginTop: "10px" }}>
						<Col span={4}><Form.Item name={"defaultMoneyOutOfDate"}>
							<InputNumber style={{width:'75%'}}
								formatter={a => AppConsts.numberWithCommas(a)}
								parser={a => a!.replace(/\$s?|(,*)/g, '')} />
						</Form.Item></Col>
						<Col span={20}>{L("cai_dat_phat_tien_khi_qua_han ")}(VNĐ)</Col>
						<Col span={24} style={{ marginTop: "10px", marginBottom: "10px", fontSize: "13px", color: "#096dd9" }}><i>{L("tien_phat_khi_qua_han_muon_tai_lieu")}.</i></Col>
					</Row>
					<Row gutter={15} style={{ marginTop: "10px" }}>
						<Col span={4}><Form.Item name={"defaultLostDocument"}>
							<InputNumber style={{width:'75%'}}
								formatter={a => AppConsts.numberWithCommas(a)}
								parser={a => a!.replace(/\$s?|(,*)/g, '')}/>  
						</Form.Item></Col>
						<Col span={20}>{L("cai_dat_phat_tien_khi_mat ")}(VNĐ) </Col>
						<Col span={24} style={{ marginTop: "10px", marginBottom: "10px", fontSize: "13px", color: "#096dd9" }}><i>{L("tien_phat_khi_lam_mat_tai_lieu")}.</i></Col>
					</Row>
					<Row gutter={15} style={{ marginTop: "10px" }}>
						<Col span={4}><Form.Item name={"dueDateMaxTimes"} >
							<InputNumber type='number' min={0} style={{ width: "100%" }} />
						</Form.Item></Col>
						<Col span={20}>{L("cai_dat_so_lan_gia_han_mac_dinh")}</Col>
						<Col span={24} style={{ marginTop: "10px", marginBottom: "10px", fontSize: "13px", color: "#096dd9" }}><i>{L("so_lan_gia_han")}.</i></Col>
					</Row>
				</Form>
				<hr style={{ marginTop: "20px" }}></hr>
				<Button icon={<SaveOutlined />} type='primary' onClick={this.onSaveGeneralSetting}>{L("luu_cai_dat")}</Button>
			</Card >
		);
	}
}