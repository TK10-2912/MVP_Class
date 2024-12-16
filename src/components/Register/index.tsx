import * as React from 'react';

import { Form, Card, Button, Input, message, Row, Col } from 'antd';
import { L } from '@lib/abpUtility';
import rules from './register.validation';
import { AppConsts, cssCol } from '@lib/appconst'
import FormItem from 'antd/lib/form/FormItem';
import { stores } from '@stores/storeInitializer';
import {
	RegisterOutput,
	RegisterInput,
} from '@services/services_autogen';
import { FormInstance } from 'antd/lib/form';

export interface IRegisterProps {
	onSuccessRegister: () => void;
	onCancel?: () => void;
}

export default class Register extends React.Component<IRegisterProps> {
	private formRef = React.createRef<FormInstance>();
	state = {
		confirmDirty: false,
		rePassword: undefined,
	}
	// luu
	onSave = async () => {
		const form = this.formRef;
		const self = this;
		form.current?.validateFields().then(async (values: any) => {
			if (!AppConsts.testEmail(values.emailAddress)) {
				message.error(L("InvalidEmailAddress"));
				return;
			}
			let input = new RegisterInput({ ...values });
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
	async registerRequest(input: RegisterInput) {
		if (input !== undefined) {
			let res: RegisterOutput = await stores.accountStore.register(input);
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

	render() {
		const { onCancel } = this.props;
		const formItemLayout = {
			labelCol: cssCol(8),
			wrapperCol: cssCol(16),
		};

		return (

			<Row style={{ width: "100%" }}>
				<Form ref={this.formRef} style={{ width: "100%" }}>
					<FormItem label={L('Name')} {...formItemLayout} name={'name'} rules={rules.name}  >
						<Input />
					</FormItem>
					<FormItem label={L('Surname')} {...formItemLayout} name={'surname'} rules={rules.name} >
						<Input />
					</FormItem>
					<FormItem label={L('UserName')} {...formItemLayout} name={'userName'} rules={rules.user_name} >
						<Input />
					</FormItem>
					<FormItem label={L('Email')} {...formItemLayout} name={'emailAddress'} rules={rules.emailAddress} >
						<Input />
					</FormItem>
					<FormItem label={L('Password')} {...formItemLayout} name={'password'} rules={[rules.password, { min: 8, message: 'Mật khẩu có độ dài nhỏ nhất là 8!' }, { validator: this.validateToNextPassword }]} >
						<Input.Password />
					</FormItem>
					<FormItem label={L('ConfirmPassword')} {...formItemLayout} name={'confirm'} rules={[rules.confirm, { min: 8, message: 'Mật khẩu có độ dài nhỏ nhất là 8!' }, { validator: this.compareToFirstPassword }]} >
						<Input.Password onChange={e => this.setState({ rePassword: e.target.value })} />
					</FormItem>
				</Form>
				<Col style={{ textAlign: "right", width: "100%", marginTop: "10px" }}>
					{(onCancel !== undefined) && <Button danger type="default" onClick={() => onCancel()} >{L('Cancel')}</Button>}
					&nbsp;&nbsp;&nbsp;
					<Button type="primary" onClick={() => this.onSave()} >{L('OK')}</Button>
				</Col>
			</Row>
		);
	}
}
