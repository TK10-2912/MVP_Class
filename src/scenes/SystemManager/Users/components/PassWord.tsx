import { L } from '@lib/abpUtility';
import { RouterPath } from '@lib/appconst';
import HistoryHelper from '@lib/historyHelper';
import { UpdatePassword2Input } from '@services/services_autogen';
import { stores } from '@stores/storeInitializer';
import { Button, Card, Col, Input, Row } from 'antd';
import * as React from 'react';

export interface IPassWordLevel2Props {
	oncancel: () => void;
	onsave: (isCorrectPass: boolean) => void;
	isCheckPassword2: boolean;
}

export default class PassWord extends React.Component<IPassWordLevel2Props> {
	state = {
		password: "",
		ischeckequalconfirmpass: true,
	};

	onSubmit = async () => {
		let re = await this.checkPassword();
		if (!!this.props.onsave) {
			this.props.onsave((!!re && re.result != undefined) ? re.result : false);
		}
	}
	checkPassword = () => {
		let input: UpdatePassword2Input = new UpdatePassword2Input();
		input.id = stores.sessionStore!.currentLogin.user!.id!;
		input.password = this.state.password;
		let result = stores.userStore.checkPasswordUser(input);
		if (!!result) {
			return result;
		}
		return null;
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
	render() {

		return (
			<Card >
				<Row style={{ marginTop: '10px' }}>
					<Col
						xs={{ span: 24, offset: 0 }}
						sm={{ span: 24, offset: 0 }}
						md={{ span: 24, offset: 0 }}
						lg={{ span: 24, offset: 0 }}
						xl={{ span: 24, offset: 0 }}
						xxl={{ span: 24, offset: 0 }}
					>
						<Row>
							<Col xs={{ span: 6 }} sm={{ span: 6 }} md={{ span: 5 }}>{L('Mật khẩu')}: </Col>
							<Col xs={{ span: 18 }} sm={{ span: 18 }} md={{ span: 19 }}>
								<Input.Password
									allowClear={true}
									placeholder={L('Nhập mật khẩu')}
									style={{ width: '100%' }}
									onChange={(e) => this.onchangeInputPass(e.target.value)}
								/>
							</Col>
						</Row>
					</Col>
				</Row>
				<Row justify='end' style={{ marginTop: '20px' }}>
					<Button danger onClick={() => { this.onCancel(); this.onRedirect(); }} >
						{L('huy')}
					</Button>
					<Button type="primary" onClick={() => this.onSubmit()} style={{ marginLeft: '5px' }}>
						{L('xac_nhan')}
					</Button>
				</Row>
			</Card>
		);
	}
}

