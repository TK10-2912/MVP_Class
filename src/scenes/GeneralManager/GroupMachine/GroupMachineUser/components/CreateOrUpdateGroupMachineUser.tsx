import AppConsts from "@src/lib/appconst";
import { Button, Card, Col, Form, Input, Row, message } from "antd";
import React from "react";
import { CreateGroupMachineInput, GroupMachineDto, UpdateGroupMachineInput } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import { PositionMap } from "@src/components/MapComponent";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { L } from "@src/lib/abpUtility";
import rules from "@src/scenes/Validation";
export interface IProps {
	onCancel?: () => void;
	createSuccess?: () => void;
	groupMachineSelected?: GroupMachineDto,
}
export default class CreateOrUpdateGroupMachineUser extends AppComponentBase<IProps> {
	private formRef: any = React.createRef();

	state = {
		isLoadDone: false,
		idSelected: -1,
		isActive: false,

	}
	file: any;
	centerMap: PositionMap = new PositionMap();

	async componentDidMount() {
		await this.initData(this.props.groupMachineSelected);
	}
	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.groupMachineSelected !== undefined && nextProps.groupMachineSelected.gr_ma_id !== prevState.idSelected) {
			return ({ idSelected: nextProps.groupMachineSelected.gr_ma_id });
		}
		return null;
	}

	initData = async (input: GroupMachineDto | undefined) => {
		this.setState({ isLoadDone: false });
		if (input !== undefined && input.gr_ma_id !== undefined) {
			this.formRef.current!.setFieldsValue({ ...input, });
		}
		if (input?.gr_ma_desc == null) {
			input!.gr_ma_desc = ""
		}
		else {
			this.formRef.current.resetFields();
		}
		this.formRef.current!.setFieldsValue({ ...input, });
		this.setState({ isLoadDone: true });
	}

	async componentDidUpdate(prevProps, prevState) {
		if (this.state.idSelected !== prevState.idSelected) {
			this.initData(this.props.groupMachineSelected);
		}
	}

	onCreateUpdate = () => {
		const { groupMachineSelected } = this.props;
		const form = this.formRef.current;
		this.setState({ isLoadDone: false })
		form!.validateFields().then(async (values: any) => {
			if (groupMachineSelected?.gr_ma_id === undefined || groupMachineSelected.gr_ma_id < 0) {
				let unitData = new CreateGroupMachineInput(values);
				await stores.groupMachineStore.createGroupMachine(unitData);
				this.createSuccess();
				this.onCancel();
				message.success("Thêm mới máy thành công!");
			} else {
				let unitData = new UpdateGroupMachineInput({ gr_ma_id: groupMachineSelected.gr_ma_id, ...values });
				await stores.groupMachineStore.updateGroupMachine(unitData);
				this.createSuccess();
				this.onCancel();
				message.success("Chỉnh sửa máy thành công");
			}
			stores.sessionStore.getCurrentLoginInformations();
			this.createSuccess();
			this.setState({ isLoadDone: true });
		})
	};

	createSuccess = () => {
		if (!!this.props.createSuccess) {
			this.props.createSuccess();
		}
	}
	onCancel = () => {
		if (!!this.props.onCancel) {
			this.props.onCancel();
		}
	}
	render() {
		const { groupMachineSelected } = this.props;
		const { groupMachineListResult } = stores.groupMachineStore;
		let groupMachineList = groupMachineListResult?.slice();
		if (!!groupMachineSelected && groupMachineSelected.gr_ma_id != undefined) {
			groupMachineList = groupMachineListResult!.filter(item => item.gr_ma_id !== groupMachineSelected!.gr_ma_id!);
		}
		return (
			<Card>
				<Row style={{ marginBottom: 5 }}>
					<Col span={16} style={{ textAlign: "start" }}>
						<h3>{groupMachineSelected?.gr_ma_id === undefined ? "Thêm mới nhóm máy " : "Chỉnh sửa nhóm máy "} <strong>{groupMachineSelected!.gr_ma_area}</strong></h3>
					</Col>
					<Col span={8} style={{ textAlign: 'end' }}>
						<Button type="primary" onClick={() => this.onCreateUpdate()}>Lưu</Button> &nbsp;&nbsp;
						<Button danger onClick={() => this.onCancel()}>Hủy</Button>
					</Col>
				</Row>
				<Row>
					<Form ref={this.formRef} style={{ width: '100%' }} >
						<Form.Item label={'Nhóm máy'} {...AppConsts.formItemLayout} name={'gr_ma_area'} rules={[rules.required, rules.noAllSpaces, ({ getFieldValue }) => ({
							validator(_, value) {
								const isMachineSoft = groupMachineList!.some(item => item!.gr_ma_area!.trim().toLowerCase() === value.trim().toLowerCase());
								if (!value || !isMachineSoft) {
									return Promise.resolve();
								}
								return Promise.reject(new Error('Nhóm máy đã tồn tại!'));
							}
						})]} >
							<Input placeholder="Nhập nhóm máy..." maxLength={255} />
						</Form.Item>
						<Form.Item label={L('Mô tả')} {...AppConsts.formItemLayout} name={'gr_ma_desc'} valuePropName='data' rules={[rules.maxNameBank, rules.noAllSpaces]}
							getValueFromEvent={(event, editor) => {
								const data = editor.getData();
								return data;
							}}>
							<CKEditor editor={ClassicEditor} />
						</Form.Item >
					</Form>
				</Row>
			</Card >
		)
	}
}