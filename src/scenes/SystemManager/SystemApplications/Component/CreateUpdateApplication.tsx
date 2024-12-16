import * as React from "react";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import AppConsts from "@src/lib/appconst";
import { ApplicationExtDto, CreateApplicationExtInput, UpdateApplicationExtInput } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import { Button, Card, Checkbox, Col, Form, Input, Row, message } from "antd";
import { L } from '@lib/abpUtility';


export interface IProps {
	onCreateUpdateSuccess?: (applicationExtDto: ApplicationExtDto) => void;
	onCancel: () => void;
	applicationSelected: ApplicationExtDto;
}

export default class CreateOrUpdateApplication extends AppComponentBase<IProps>{
	private formRef: any = React.createRef();

	state = {
		isLoadDone: false,
		ap_id: -1,
		checkTrust: false,
		checkConfiden: false,
	}
	userSelected: ApplicationExtDto;

	async componentDidMount() {
		this.initData(this.props.applicationSelected)
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.applicationSelected.ap_id !== prevState.ap_id) {
			return ({ ap_id: nextProps.applicationSelected.ap_id });
		}
		return null;
	}
	async componentDidUpdate(prevProps, prevState) {
		if (this.state.ap_id !== prevState.ap_id) {
			 this.setState({ap_id: this.props.applicationSelected.ap_id});
			this.initData(this.props.applicationSelected);
		}
	}
	initData = async (userInput: ApplicationExtDto | undefined) => {
		this.setState({ isLoadDone: false });
		if (userInput != undefined) {
			this.userSelected = userInput!;
		} else {
			this.userSelected = new ApplicationExtDto();
		}
		if (this.userSelected.ap_id !== undefined) {
			this.setState({checkTrust:this.userSelected.ap_trust,checkConfiden:this.userSelected.ap_confidential})
			this.formRef.current.setFieldsValue({ ...this.userSelected });
		} else {
			this.formRef.current!.resetFields();
		}
		await stores.userStore.getRoles();
		this.setState({ isLoadDone: true });
	}
	onCreateUpdate = () => {
		const { applicationSelected } = this.props;
		const form = this.formRef.current;
		form!.validateFields().then(async (values: any) => {
			if (applicationSelected.ap_id === undefined || applicationSelected.ap_id < 0) {
				let unitData = new CreateApplicationExtInput({ ...values });
				unitData.ap_trust = this.state.checkTrust;
				unitData.ap_confidential = this.state.checkConfiden;
				let result = await stores.applicationStore.createApplication(unitData)
				this.formRef.current.resetFields();
				await this.onCreateUpdateSuccess(result);
				message.success(L("them_moi_thanh_cong"))
			}
			else {
				let unitData = new UpdateApplicationExtInput({ ap_id: applicationSelected.ap_id, ...values });
				unitData.ap_trust = this.state.checkTrust;
				unitData.ap_confidential = this.state.checkConfiden;
				let result = await stores.applicationStore.updateApplication(unitData);
				await this.onCreateUpdateSuccess(result);
			}
			this.setState({ isLoadDone: true });
		});
	};

	onCancel = () => {
		if (!!this.props.onCancel) {
			this.props.onCancel();
		}
	};
	onCreateUpdateSuccess = (application: ApplicationExtDto) => {
		if (!!this.props.onCreateUpdateSuccess) {
			this.props.onCreateUpdateSuccess(application);
			message.success(L("chinh_sua_thanh_cong"))
		}
	};
	render() {
		const seft = this;
		const { applicationSelected } = this.props;

		return (
			<Card>
				<Row>
					<Col span={12}>
						<h3>
							{this.state.ap_id === undefined
								? L("them_moi")
								: L("ung_dung") + " " + applicationSelected.ap_code}
						</h3>
					</Col>
					<Col span={12} style={{ textAlign: "right" }}>
						<Button
							danger
							onClick={() => this.onCancel()}
							style={{ marginLeft: "5px", marginTop: "5px", marginBottom: "20px" }}
						>
							{L("huy")}
						</Button>
						<Button
							type="primary"
							onClick={() => this.onCreateUpdate()}
							style={{ marginLeft: '5px', marginTop: '5px', marginBottom: "20px" }}
						>
							{L("luu")}
						</Button>
					</Col>
				</Row>
				<Row>
					<Form ref={this.formRef} style={{ width: '100%' }}>
						<Form.Item
							label={L("ma")} {...AppConsts.formItemLayout} name={"ap_code"}>
							<Input />
						</Form.Item>
						<Form.Item label={L("duong_dan_url")} {...AppConsts.formItemLayout} name={"ap_callback_url"}>
							<Input />
						</Form.Item>
						<Form.Item label={L("ma_bao_mat")} {...AppConsts.formItemLayout} name={"ap_secret"}>
							<Input />
						</Form.Item>
						<Form.Item label={L("tin_tuong")} {...AppConsts.formItemLayout} name={'ap_trust'}>
								<Checkbox 					
								checked={this.state.checkTrust} onChange={(e) => this.setState({ checkTrust: e.target.checked })} ></Checkbox>
						</Form.Item>
						<Form.Item label={L("cong_khai")} {...AppConsts.formItemLayout} name={'ap_confidential'} >
							<Checkbox checked={this.state.checkConfiden} onChange={(e) => this.setState({ checkConfiden: e.target.checked })}></Checkbox>
						</Form.Item>
 
					</Form>
				</Row>
			</Card>
		)
	}
}