import * as React from 'react';
import { Form, Button, Input, message, Row, Col, DatePicker } from 'antd';
import { L } from '@lib/abpUtility';
import { AppConsts, cssCol } from '@lib/appconst'
import FormItem from 'antd/lib/form/FormItem';
import { stores } from '@stores/storeInitializer';
import {
	RegisterOutput,
	RegisterMemberInput,
} from '@services/services_autogen';
import { FormInstance } from 'antd/lib/form';
import rules from '../register.validation';
import SelectEnum from '@src/components/Manager/SelectEnum';
import { eGENDER } from '@src/lib/enumconst';
import moment, { Moment } from 'moment';

export interface IRegisterProps {
	onSuccessRegister: () => void;
	onCancel?: () => void;
}

export default class FormCreateAdultMember extends React.Component<IRegisterProps> {
	private formRef = React.createRef<FormInstance>();
	state = {
		confirmDirty: false,
		value: 1,
		rePassword: undefined,
		me_re_sex: undefined,
		birthday: moment() || null,
	}
	async componentDidMount() {
		await this.setState({ birthday: undefined })
	}
	onSave = async () => {
		const form = this.formRef;
		const self = this;
		form.current!.validateFields().then(async (values: any) => {

			if (values.password !== this.state.rePassword) {
				message.error(L("PasswordsDoNotMatch"));
				return;
			}
			if (!AppConsts.testEmail(values.emailAddress)) {
				message.error(L("InvalidEmailAddress"));
				return;
			}
			let input = new RegisterMemberInput({ ...values });
			let flag = await self.registerRequest(input);
			if (flag === undefined || !flag) {
				message.error(L('RegisterErrors'));

			} else {
				message.success(L('RegisterSuccessfully'));
				if (self.props.onSuccessRegister !== undefined) {
					self.props.onSuccessRegister();
				}
			}
		});
	};
	async registerRequest(input: RegisterMemberInput) {
		if (input !== undefined) {
			let res: RegisterOutput = await stores.accountStore.registerMember(input);
			return res.canLogin;
		}
		return false;
	}

	compareToFirstPassword = (rule: any, value: any, callback: any) => {
		const form = this.formRef.current;
		if (value && value !== form!.getFieldValue('password')) {
			return Promise.reject(L('PasswordsDoNotMatch'));
		}
		return Promise.resolve();
	};
	validateToNextPassword = (rule: any, value: any, callback: any) => {
		const { validateFields, getFieldValue } = this.formRef.current!;
		this.setState({
			confirmDirty: true,
		});

		if (value && this.state.confirmDirty && getFieldValue('confirm')) {
			validateFields(['confirm']);
		}
		return Promise.resolve();
	};
	onChange = (e) => {
		this.setState({ value: e.target.value });
	};
	render() {
		const { onCancel } = this.props;
		const formItemLayout = {
			labelCol: cssCol(8),
			wrapperCol: cssCol(16),
		};

		return (

			<Row style={{ width: "100%" }}>
				<Form ref={this.formRef} style={{ width: "100%" }}>
					<Row><strong>{L('PersonalInformation')} </strong></Row>

					<FormItem label={L('Name')} {...formItemLayout} rules={rules.name} name={'me_name'}  >
						<Input />
					</FormItem>
					<FormItem label={L('SurName')} {...formItemLayout} rules={rules.name} name={'me_sur_name'}  >
						<Input />
					</FormItem>
					<FormItem label={L('MemberCode')} {...formItemLayout} rules={rules.code} name={'me_code'}  >
						<Input />
					</FormItem>
					<Form.Item label={L('Gender')} {...AppConsts.formItemLayout} rules={rules.name} name={'me_sex'} hasFeedback>
						<SelectEnum eNum={eGENDER} enum_value={undefined} onChangeEnum={async (value: number) => { await this.setState({ me_sex: value }); await this.formRef.current!.setFieldsValue({ me_sex: value }); }} />
					</Form.Item>
					<Form.Item label={L('Birthday')} {...AppConsts.formItemLayout} rules={rules.birth} name={'me_birthday'} hasFeedback valuePropName='me_birthday'>
						<DatePicker
							onChange={(date: Moment | null, dateString: string) => { this.setState({ birthday: date }); this.formRef.current!.setFieldsValue({ me_birthday: dateString }); }}
							format={"DD/MM/YYYY"} value={this.state.birthday}
						/>
					</Form.Item>
					<FormItem label={L('Identification')} {...formItemLayout} rules={rules.cccd} name={'me_identify'} >
						<Input />
					</FormItem>
					<Row><strong>{L('ContactInformation')} </strong></Row>
					<FormItem label={L('Email')} {...formItemLayout} rules={rules.emailAddress} name={'emailAddress'} hasFeedback>
						<Input />
					</FormItem>
					<FormItem label={L('SĐT')} {...formItemLayout} rules={rules.phone} name={'me_phone'} >
						<Input />
					</FormItem>
					<FormItem label={L('Address')} {...formItemLayout} rules={rules.address} name={'me_address'} >
						<Input />
					</FormItem>
					<Row><strong>{L('LoginInformation')} </strong></Row>
					<FormItem label={L('UserName')} {...formItemLayout} rules={rules.user_name} name={'userName'} >
						<Input />
					</FormItem>
					<FormItem label={L('Password')} {...formItemLayout} name={'password'} rules={[rules.password, { min: 8, message: L('PasswordsMustBeAtLeast8CharactersContainLowercaseUppercaseNumber') }, { validator: this.validateToNextPassword }]} >
						<Input.Password />
					</FormItem>
					<FormItem label={L('ConfirmPassword')} {...formItemLayout} rules={[rules.confirm, { min: 8, message: L('PasswordsMustBeAtLeast8CharactersContainLowercaseUppercaseNumber') }, { validator: this.compareToFirstPassword }]} >
						<Input.Password onChange={e => this.setState({ rePassword: e.target.value })} />
					</FormItem>
				</Form>
				<Col style={{ textAlign: "right", width: "100%", marginTop: "10px" }}>
					{(onCancel !== undefined) && <Button type="default" onClick={() => onCancel()} >{L('Cancel')}</Button>}
					&nbsp;&nbsp;&nbsp;
					<Button type="primary" onClick={() => this.onSave()} >{L('OK')}</Button>
				</Col>
			</Row>
		);
	}
}
