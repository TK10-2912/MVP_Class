import { ArrowRightOutlined, RedoOutlined, SettingOutlined, SmileOutlined, SolutionOutlined, UserOutlined } from '@ant-design/icons';
import { AppConsts, RouterPath } from '@lib/appconst';
import { L } from '@src/lib/abpUtility';
import { stores } from '@src/stores/storeInitializer';
import { Button, Col, Input, Result, Row, Steps, message } from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';

export interface IResetPasswordProps {
	onSuccessChangePass?: () => void;
	onCancel?: () => void;
}

export interface IState {
	isLoadDone: boolean;
	email: string,
	currentStep: 0 | 1 | 2 | undefined,
	statusStep: "process" | "error" | "wait" | "finish" | undefined,
	token: string,
	password1: string,
	password2: string,
}

export default class ResetPassword extends React.Component<IResetPasswordProps, IState> {
	state = {
		isLoadDone: true,
		email: "",
		currentStep: undefined,
		statusStep: undefined,
		token: "",
		password1: "",
		password2: "",

	};
	componentDidMount() {
		let params = new URLSearchParams(window.location.search);

		const tokenURL = params.get('token');
		const emailURL = params.get('email');
		if (emailURL !== undefined && emailURL !== null && tokenURL !== undefined && tokenURL !== null && AppConsts.testEmail(emailURL)) {
			this.setState({ currentStep: 1, email: emailURL, token: tokenURL });

		}
	}

	onSubmitStep1 = async () => {
		this.setState({ statusStep: 'wait' });

		const { email } = this.state;
		if (email === undefined || email.length < 3) {
			this.setState({ statusStep: 'error' });
			return;
		}

		if (!AppConsts.testEmail(email)) {
			this.setState({ statusStep: 'error' });

			message.error("InvalidEmail");
			return;
		}
		let result = await stores.accountStore.forgotPasswordViaEmail(email);
		if (result.result) {
			this.setState({ currentStep: 1, statusStep: 'process' });
		} else {
			message.error("InvalidEmail");
		}


	};


	onSubmitStep2 = async () => {
		this.setState({ statusStep: 'wait' });

		const { token, password1, password2, email } = this.state;
		if (token === undefined || token.length === 0) {
			message.error("EnterToken");
			this.setState({ statusStep: 'error' });
			return;
		}
		if (password1 === undefined || password1.length < 8) {
			message.error("PasswordLongerThan8Characters");
			this.setState({ statusStep: 'error' });
			return;
		}
		if (password1 !== password2) {
			message.error("PasswordDoNotMatch");
			this.setState({ statusStep: 'error' });
			return;
		}
		let result = await stores.accountStore.resetPasswordViaEmail(token, email, password1);
		if (result.result === true) {
			this.setState({ currentStep: 2, statusStep: 'finish' });
		} else {
			message.error("InvalidEmail");
		}


		if (this.props.onSuccessChangePass !== undefined) {
			this.props.onSuccessChangePass();
		}
	}
	renderInputEmail = () => {
		const { email } = this.state;

		return <div>
			<Input
				placeholder={L("EnterEmail")}
				value={email}
				onChange={(e) => { this.setState({ email: e.target.value }) }}
				onPressEnter={this.onSubmitStep1}
				addonAfter={
					<>
						<ArrowRightOutlined onClick={() => this.onSubmitStep1()} />
					</>
				}
			/>
		</div>;
	}
	renderGotToken = () => {
		const self = this;
		const { email, token, password1, password2 } = this.state;
		return <div>
			<div style={{ textAlign: "center" }}>
				<span style={{ color: "green" }}>MVP has been sent you code. Please enter code and password for </span><span style={{ color: "red", fontWeight: 'bold' }}>{email}</span>
			</div>
			<div>
				<Input
					placeholder={"Token..."}
					value={token}
					onChange={(e) => { this.setState({ token: e.target.value, }) }}
					addonAfter={<RedoOutlined onClick={() => self.onSubmitStep1()} title="Gửi lại mã" ><span>Resend code</span></RedoOutlined>}
				/>
			</div>
			<div>
				<Input
					placeholder={L("Password")}
					value={password1}
					type="password"
					onChange={(e) => { self.setState({ password1: e.target.value }) }}
				/>
			</div>
			<div>
				<Input
					placeholder={L("Password")}
					value={password2}
					type="password"
					onChange={(e) => { self.setState({ password2: e.target.value, }) }}
				/>
			</div>
			<div style={{ alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "row" }}>
				<div style={{ paddingRight: 5 }}>
					<Button type="default" onClick={() => { self.setState({ currentStep: 0, statusStep: "process" }) }} >{L("Back")}</Button>
				</div>
				<div style={{ paddingLeft: 5 }}>
					<Button type="primary" onClick={self.onSubmitStep2}>{L("xac_nhan")}</Button>
				</div>
			</div>
		</div>;
	}

	renderFinish = () => {
		return <Result
			status="success"
			title="Successfully changed password!"
			extra={[
				<Button type="primary" key="console">
					<Link to={RouterPath.g_}>	<SettingOutlined />	<span>Go Manager?</span>	</Link>
				</Button>,
				<Button key="buy" onClick={() => { this.setState({ currentStep: 1, statusStep: "process" }) }} >Back</Button>,

			]}
		/>
	}
	render() {
		const { currentStep, statusStep } = this.state;
		return (
			<Row>
				<Col style={{ margin: "0 auto" }}>
					<Row style={{ marginBottom: 35 }}>
						<Steps current={currentStep} status={statusStep}>
							<Steps.Step title="Nhập Email" icon={<UserOutlined />} />
							<Steps.Step title="Xác minh" icon={<SolutionOutlined />} />
							<Steps.Step title="Hoàn thành" icon={<SmileOutlined />} />
						</Steps>
					</Row>
					{(currentStep === undefined || currentStep === 0) && this.renderInputEmail()}
					{currentStep === 1 && this.renderGotToken()}
					{currentStep === 2 && this.renderFinish()}
				</Col>
			</Row>
		);
	}
}