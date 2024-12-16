import { L } from '@lib/abpUtility';
import { RouterPath } from '@lib/appconst';
import HistoryHelper from '@lib/historyHelper';
import { UpdatePassword2Input } from '@services/services_autogen';
import { stores } from '@stores/storeInitializer';
import { Button, Card, Col, Input, Row } from 'antd';
import * as React from 'react';
import CryptoJS from 'crypto-js';

export interface IPassWordLevel2Props {
	oncancel: () => void;
	onsave: (isCorrectPass: boolean) => void;
	isCheckPassword2: boolean;
	checkTurnOfModal?: (input: boolean) => void;
	checkTitle?: boolean;
}

export default class PassWord extends React.Component<IPassWordLevel2Props> {
	state = {
		password: "",
		ischeckequalconfirmpass: true,
		checkTurnOffModal: false,
	};

	onSubmit = async () => {
		if (this.props.isCheckPassword2 != undefined && this.props.isCheckPassword2 == true) {
			let re = await this.checkPassword();
			if (!!this.props.onsave) {
				this.props.onsave(re);
			}
		} else {
			await this.changePassword2();
		}
		this.onCancel();
	}

	changePassword2 = () => {
		if (!this.state.ischeckequalconfirmpass) {
			return;
		}
		let input: UpdatePassword2Input = new UpdatePassword2Input();
		input.id = stores.sessionStore!.currentLogin.user!.id!;
		input.password = CryptoJS.MD5(this.state.password).toString();
		let result = stores.userStore.changePassword2(input);
		return result;
	}

	checkPassword = async () => {
		let input: UpdatePassword2Input = new UpdatePassword2Input();
		input.id = stores.sessionStore!.currentLogin.user!.id!;
		input.password = this.state.password;
		let result = await stores.userStore.checkPasswordUser(input);
		return result
	}
	checkTurnOfModal(input: boolean) {
		if (!!this.props.checkTurnOfModal) {
			this.props.checkTurnOfModal(input)
		}
	}
	onCancel = () => {
		if (this.props.oncancel != undefined) {
			this.props.oncancel();
		}
	}
	onRedirect = () => {
		if (this.props.isCheckPassword2 != undefined) {
			if (this.props.isCheckPassword2 == true) {
				HistoryHelper.redirect(RouterPath.admin_home);
			}
		}
	}
	onchangeInputPass = (e) => {
		if (e != undefined && e != null) {
			this.setState({ password: e });
		}
	}
	onchangeConfirmInputPass = (e) => {
		if (e != undefined && e != null) {
			if (this.state.password == e) {
				this.setState({ ischeckequalconfirmpass: true });
			} else {
				this.setState({ ischeckequalconfirmpass: false });
			}
		}
	}
	render() {
		return (
			<Card style={{ marginTop: 10 }}>
				<Row>
					<Col
						xs={{ span: 24, offset: 0 }}
						sm={{ span: 24, offset: 0 }}
						md={{ span: 24, offset: 0 }}
						lg={{ span: 24, offset: 0 }}
						xl={{ span: 24, offset: 0 }}
						xxl={{ span: 24, offset: 0 }}
					>
						<Row>
							<Col xs={{ span: 6 }} sm={{ span: 6 }} md={{ span: 5 }}>{this.props.checkTitle != undefined && this.props.checkTitle == true ? "Mật khẩu cấp 2" : L('Mật khẩu')}:</Col>
							<Col xs={{ span: 18 }} sm={{ span: 18 }} md={{ span: 19 }}>
								<Input.Password
									style={{ width: '100%' }}
									allowClear={true}
									placeholder={this.props.checkTitle != undefined && this.props.checkTitle == true ? "Mật khẩu cấp 2" : L('Nhập mật khẩu')}
									onChange={(e) => this.onchangeInputPass(e.target.value)}
								/>
							</Col>
						</Row>
					</Col>
					{(this.props.isCheckPassword2 != undefined && this.props.isCheckPassword2 == true) ? null : (
						<Col
							xs={{ span: 24, offset: 0 }}
							sm={{ span: 24, offset: 0 }}
							md={{ span: 24, offset: 0 }}
							lg={{ span: 24, offset: 0 }}
							xl={{ span: 24, offset: 0 }}
							xxl={{ span: 24, offset: 0 }}
							style={{ marginTop: '15px' }}
						>
							<Row>
								<Col xs={{ span: 6 }} sm={{ span: 6 }} md={{ span: 5 }}>{L('Xác nhận mật khẩu cấp 2')} </Col>
								<Col xs={{ span: 18 }} sm={{ span: 18 }} md={{ span: 19 }}>
									<Input.Password
										allowClear={true}
										placeholder={L('Nhập xác nhận mật khẩu cấp 2')}
										style={{ width: '100%' }}
										onChange={(e) => this.onchangeConfirmInputPass(e.target.value)}
									/>
									{(!this.state.ischeckequalconfirmpass) ? (<span style={{ color: "red" }}>{stores.sessionStore!.currentLogin.user!.hasPassword2 == true ? "Mật khẩu cấp 2" : "Mật khẩu"}</span>) : null}
								</Col>
							</Row>
						</Col>
					)}
				</Row>
				<Row justify='end' style={{ marginTop: '20px' }}>
					<Button danger onClick={() => { this.onCancel(); this.onRedirect(); }} >
						Hủy
					</Button>
					<Button type="primary" onClick={() => this.onSubmit()} style={{ marginLeft: '5px' }}>
						Xác nhận
					</Button>
				</Row>
			</Card>
		);
	}
}

