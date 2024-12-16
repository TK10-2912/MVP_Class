import { LockOutlined } from '@ant-design/icons';
import { L } from '@lib/abpUtility';
import { AppConsts } from '@lib/appconst';
import HistoryHelper from '@lib/historyHelper';
import { ResetPasswordDto, UserDto } from '@services/services_autogen';
import { stores } from '@stores/storeInitializer';
import { Button, Card, Col, Input, Row, message } from 'antd';
import * as React from 'react';

export interface IProps {
	onClose: () => void;
	userSelected: UserDto;
}

export interface IState {
	password1: string;
	password2: string;
}

export default class PasswordChanging extends React.Component<IProps, IState> {
	state = {
		password1: "",
		password2: "",
	};

	onClose = () => {
		if (this.props.onClose !== undefined) {
			this.props.onClose();
		}
	}

	onSubmit = async () => {
		const { password1, password2 } = this.state;
		if (password1 === undefined || password1.length < 8) {
			message.error(L("PasswordLongerThan8Characters"));
			return;
		}
		if (password1 !== password2) {
			message.error(L("PasswordDoNotMatch"));
			return;
		}
		if (!AppConsts.formatPassword(password1)) {
			message.error(L("PasswordsMustBeAtLeast8Characters,ContainALowercase,Uppercase,AndNumber"));
			return;
		}
		let input = new ResetPasswordDto();
		input.userId = this.props.userSelected.id;
		input.newPassword = password1;
		await stores.userStore.resetPassword(input);
		message.success(L("PasswordChanged"));
		if (this.props.userSelected.id === -1) {
			HistoryHelper.redirect("/logout");
		}
		this.props.onClose();
	}

	render() {
		const { password1, password2 } = this.state;
		const { userSelected } = this.props;

		return (
			<Card className="wrapper">
				<Row style={{ marginTop: 10, display: "flex", flexDirection: "row" }}>
					<Col span={12}><h3>{L('ChangePasswordUser') + ": " + userSelected.fullName}</h3></Col>
					<Col span={12} style={{ textAlign: 'right' }}>
						<Button danger onClick={this.onClose}>{L("Cancel")}</Button>
						&nbsp;&nbsp;
						<Button type="primary" onClick={this.onSubmit}>{L("xac_nhan")}</Button>
					</Col>
				</Row>
				<Row style={{ marginTop: 10 }}>
					<Col span={8}>{L("NewPassword")}:</Col>
					<Col span={16}>

						<Input.Password
							placeholder="Mật khẩu mới..."
							value={password1}
							prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
							type="password"
							size="large"
							onChange={(e) => this.setState({ password1: e.target.value })}
						/>
					</Col>
				</Row>
				<Row style={{ marginTop: 10 }}>
					<Col span={8}>{L("RePassword")}: </Col>
					<Col span={16}>
						<Input.Password
							placeholder="Mật khẩu cũ..."
							value={password2}
							prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
							type="password"
							size="large"
							onChange={(e) => this.setState({ password2: e.target.value })}
						/>

					</Col>
				</Row>

			</Card>
		);
	}
}