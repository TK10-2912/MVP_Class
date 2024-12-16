import AppComponentBase from '@src/components/Manager/AppComponentBase';
import SelectUser from '@src/components/Manager/SelectUser';
import SelectedMachine from '@src/components/Manager/SelectedMachine';
import AppConsts from '@src/lib/appconst';
import rules from '@src/scenes/Validation';
import { AttachmentItem, AuthorizationMachineDto, CreateAuthorizationMachineInput, UpdateAuthorizationMachineInput } from '@src/services/services_autogen';
import { stores } from "@src/stores/storeInitializer";
import { Button, Card, Col, Form, Row, message } from 'antd';
import * as React from 'react';


export interface IProps {
	onCreateUpdateSuccess?: () => void;
	onCancel: () => void;
	authorizationMachineSelected: AuthorizationMachineDto;
}

export default class CreateOrUpdateAuthorizationMachine extends AppComponentBase<IProps>{
	private formRef: any = React.createRef();
	state = {
		isLoadDone: false,
		au_ma_id: -1,
		ma_id: undefined,
		us_id_is_authorized: undefined,
	}
	authorizationMachineSelected: AuthorizationMachineDto = new AuthorizationMachineDto();
	fileUpload: any;
	fileAttachmentItem: AttachmentItem = new AttachmentItem();

	async componentDidMount() {
		this.initData(this.props.authorizationMachineSelected);
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.authorizationMachineSelected.au_ma_id !== prevState.au_ma_id) {
			return ({ au_ma_id: nextProps.authorizationMachineSelected.au_ma_id });
		}
		return null;
	}
	async componentDidUpdate(prevProps, prevState) {
		if (this.state.au_ma_id !== prevState.au_ma_id) {
			this.initData(this.props.authorizationMachineSelected);
		}
	}
	initData = async (authorizationMachine: AuthorizationMachineDto | undefined) => {
		this.setState({ isLoadDone: false });
		if (authorizationMachine !== undefined && authorizationMachine.au_ma_id !== undefined) {
			this.authorizationMachineSelected = authorizationMachine;
			this.setState({ ma_id: authorizationMachine.ma_id, us_id_is_authorized: authorizationMachine.us_id_is_authorized });
		} else {
			this.authorizationMachineSelected = new AuthorizationMachineDto();
		}
		this.formRef.current.setFieldsValue({ ...this.authorizationMachineSelected });
		this.setState({ isLoadDone: true });
	}
	onCreateUpdate = () => {
		const { authorizationMachineSelected } = this.props;
		const form = this.formRef.current;
		form!.validateFields().then(async (values: any) => {
			if (authorizationMachineSelected.au_ma_id === undefined || authorizationMachineSelected.au_ma_id < 0) {
				let unitData = new CreateAuthorizationMachineInput({ ...values });
				unitData.ma_id = this.state.ma_id!;
				unitData.us_id_is_authorized = this.state.us_id_is_authorized!;
				await stores.authorizationMachineStore.createAuthorizationMachine(unitData)
				this.formRef.current.resetFields();
				message.success("Thêm mới thành công!")
				await this.onCreateUpdateSuccess();
			}
			else {
				let unitData = new UpdateAuthorizationMachineInput({ au_ma_id: authorizationMachineSelected.au_ma_id, ...values });
				unitData.us_id_is_authorized = this.state.us_id_is_authorized!;
				unitData.ma_id = this.state.ma_id!;
				await stores.authorizationMachineStore.updateAuthorizationMachine(unitData);
				message.success("Chỉnh sửa thành công!")
			}
			await this.onCreateUpdateSuccess();
			this.setState({ isLoadDone: true });
		})
	};

	onCancel = () => {
		if (!!this.props.onCancel) {
			this.props.onCancel();
		}
	};
	onCreateUpdateSuccess = () => {
		if (!!this.props.onCreateUpdateSuccess) {
			this.props.onCreateUpdateSuccess();
		}
		this.setState({ isLoadDone: true });
	};

	render() {
		return (
			<Card>
				<Row>
					<Col span={12}>
						<h3>
							{this.state.au_ma_id === undefined
								? "Thêm mới uỷ quyền"
								: "Thông tin uỷ quyền"}
						</h3>
					</Col>
					<Col span={12} style={{ textAlign: "right" }}>
						<Button
							danger
							onClick={() => this.onCancel()}
							style={{ marginLeft: "5px", marginTop: "5px", marginBottom: "20px" }}
						>
							Hủy
						</Button>
						<Button
							type="primary"
							onClick={() => this.onCreateUpdate()}
							style={{ marginLeft: '5px', marginTop: '5px', marginBottom: "20px" }}
						>
							Lưu
						</Button>
					</Col>
				</Row>
				<Row>
					<Form ref={this.formRef} style={{ width: '100%' }}>
						<Form.Item label="Máy bán nước" {...AppConsts.formItemLayout} name={"ma_id"}>
							<SelectedMachine machineId={this.state.ma_id} onChangeMachine={async (value) => { await this.setState({ ma_id: value }) }} />
						</Form.Item>
						<Form.Item label="Người uỷ quyền" {...AppConsts.formItemLayout} name={"us_id_is_authorized"} >
							<SelectUser us_id={this.state.us_id_is_authorized} onChangeUser={async (value) => { await this.setState({ us_id_is_authorized: value }) }} />
						</Form.Item>
					</Form>
				</Row>
			</Card>
		)
	}
}
