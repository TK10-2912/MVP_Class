import SelectEnum from "@src/components/Manager/SelectEnum";
import { L } from "@src/lib/abpUtility";
import AppConsts from "@src/lib/appconst";
import { eGENDER } from "@src/lib/enumconst";
import { AttachmentItem, UpdateUserInput, UserDto } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import { Button, Card, Col, DatePicker, Form, Input, Row, message } from "antd";
import moment, { Moment } from "moment";
import * as React from "react";
import rules from "../Validation";
export interface IProps {
	onCancel: () => void;
	userInfo?: UserDto;
	updateSuccess?: () => void;
}

export default class FormEditInforUser extends React.Component<IProps>
{
	state = {
		isLoadDone: true,
		idMember: -1,
		birthday: moment() || null,
		me_sex: undefined,
	}
	private formRef: any = React.createRef();
	fileAttachmentItem: AttachmentItem = new AttachmentItem();

	async componentDidMount() {
		this.initData(this.props.userInfo);
	}

	updateSuccess = () => {
		if (!!this.props.updateSuccess) {
			this.props.updateSuccess();
		}
	}

	onCancel = () => {
		if (this.props.onCancel) {
			this.props.onCancel();
		}
	}

	initData = async (input: UserDto | undefined) => {
		this.setState({ isLoadDone: false, birthday: undefined });
		if (input !== undefined) {
			if (input.us_dob !== undefined) {
				this.setState({ birthday: moment(input.us_dob, "DD/MM/YYYY") })
			}
			await this.formRef.current!.setFieldsValue({ ...input });
		} else {
			this.formRef.current.resetFields();
		}

		this.setState({ isLoadDone: true });
	}

	onUpdate = async () => {
		const form = this.formRef.current;
		const { userInfo } = this.props;
		form!.validateFields().then(async (values: any) => {
			if (userInfo !== undefined && userInfo.id !== undefined) {
				let unitData = new UpdateUserInput({ id: userInfo.id, ...values });
				unitData.userName = userInfo.userName;
				await stores.userStore.updateUser(unitData);
				await this.updateSuccess();
				message.success(L("SuccessfullyEdited"));
			}
		})
	}
	render() {
		return (
			<Card>
				<h2 style={{ textAlign: 'center' }}>Chỉnh sửa thông tin người dùng</h2>

				<Form ref={this.formRef}>
					<Form.Item label={L('Tên đăng nhập')} {...AppConsts.formItemLayout} hasFeedback>
						<span>{this.props.userInfo?.userName}</span>
					</Form.Item>
					<Form.Item label={L('Tên người dùng')} rules={[rules.required, rules.noAllSpaces]}  {...AppConsts.formItemLayout} name={'name'} hasFeedback>
						<Input maxLength={64} />
					</Form.Item>
					<Form.Item label={L('Họ')} rules={[rules.required, rules.noAllSpaces]} {...AppConsts.formItemLayout} name={'surname'} hasFeedback>
						<Input maxLength={64} />
					</Form.Item>
					<Form.Item label={L('Email')} rules={[rules.required, rules.noAllSpaces]} {...AppConsts.formItemLayout} name={'emailAddress'} hasFeedback>
						<Input maxLength={256} type="email" />
					</Form.Item>
					<Form.Item label={L('Ngày sinh')} {...AppConsts.formItemLayout} name={'us_dob'} hasFeedback valuePropName='us_dob'>
						<DatePicker
							onChange={(date: Moment | null, dateString: string) => { this.setState({ birthday: date }); this.formRef.current.setFieldsValue({ me_birthday: dateString }); }}
							format={"DD/MM/YYYY"}
							value={this.state.birthday}
						/>
					</Form.Item>
					<Form.Item label={L('Địa chỉ')} {...AppConsts.formItemLayout} name={'us_address'} hasFeedback>
						<Input />
					</Form.Item>
					<Form.Item label={L('Giới tính')} {...AppConsts.formItemLayout} name={'us_gender'} hasFeedback>
						<SelectEnum eNum={eGENDER} enum_value={this.props.userInfo?.us_gender} onChangeEnum={async (value: number) => { await this.setState({ me_sex: value }); await this.formRef.current.setFieldsValue({ us_gender: value }); }} />
					</Form.Item>
					<Form.Item label={L('Vai trò')} {...AppConsts.formItemLayout} hasFeedback>
						<span>{this.props.userInfo?.roleNames}</span>
					</Form.Item>
					<Col style={{ display: "none" }}>
						<Form.Item label={L('Kích hoạt')} {...AppConsts.formItemLayout} name={'isActive'} hasFeedback>
						</Form.Item>
					</Col>

				</Form>
				<Row style={{ justifyContent: 'end' }}><Button type="primary" onClick={() => this.onUpdate()}>Cập nhật</Button></Row>

			</Card>
		)
	}
}