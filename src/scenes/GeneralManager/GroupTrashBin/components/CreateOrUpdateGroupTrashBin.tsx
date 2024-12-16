import AppConsts from "@src/lib/appconst";
import { Button, Card, Col, Form, Input, Row, message } from "antd";
import React from "react";
import { CreateGroupMachineInput, CreateGroupTrashbinInput, GroupMachineDto, GroupTrashbinDto, UpdateGroupMachineInput, UpdateGroupTrashbinInput } from "@src/services/services_autogen";
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
	groupTrashBinSelected?: GroupTrashbinDto,
}
export default class CreateOrUpdateGroupTrashBin extends AppComponentBase<IProps> {
	private formRef: any = React.createRef();

	state = {
		isLoadDone: false,
		idSelected: -1,
		isActive: false,
		content: '',
	}
	async componentDidMount() {
		await this.initData(this.props.groupTrashBinSelected);
	}
	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.groupTrashBinSelected !== undefined && nextProps.groupTrashBinSelected.gr_tr_id !== prevState.idSelected) {
			return ({ idSelected: nextProps.groupTrashBinSelected.gr_tr_id });
		}
		return null;
	}

	initData = async (input: GroupTrashbinDto | undefined) => {
		this.setState({ isLoadDone: false });
		if (input !== undefined && input.gr_tr_id !== undefined) {
			this.formRef.current!.setFieldsValue({ ...input, });
		}
		if (input?.gr_tr_desc == null) {
			input!.gr_tr_desc = "";
		}
		else {
			this.formRef.current.resetFields();
		}
		this.formRef.current!.setFieldsValue({ ...input });
		this.setState({ isLoadDone: true });
	}

	async componentDidUpdate(prevProps, prevState) {
		if (this.state.idSelected !== prevState.idSelected) {
			this.initData(this.props.groupTrashBinSelected);
		}
	}

	onCreateUpdate = () => {
		const { groupTrashBinSelected } = this.props;
		const form = this.formRef.current;
		this.setState({ isLoadDone: false })
		form!.validateFields().then(async (values: any) => {
			if (groupTrashBinSelected?.gr_tr_id === undefined || groupTrashBinSelected.gr_tr_id < 0) {
				let unitData = new CreateGroupTrashbinInput(values);
				await stores.groupTrashBinStore.createGroupTrashbin(unitData);
				stores.sessionStore.getCurrentLoginInformations();
				this.createSuccess();
				message.success("Thêm mới thành công!");
			} else {
				let unitData = new UpdateGroupTrashbinInput({ gr_tr_id: groupTrashBinSelected.gr_tr_id, ...values });
				await stores.groupTrashBinStore.updateGroupTrashbin(unitData);
				stores.sessionStore.getCurrentLoginInformations();
				this.createSuccess();
				message.success("Chỉnh sửa thành công");
			}
		})
		stores.sessionStore.getCurrentLoginInformations();
		this.setState({ isLoadDone: true })
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
	handleEditorChange = (event, editor) => {
		const data = editor.getData();
		const plainText = data.replace(/<[^>]+>/g, ''); // Remove HTML tags to get plain text
		const maxLength = 200; // Set your maximum length here

		if (plainText.length <= maxLength) {
			this.setState({ content: data }); // Update state if within the limit
		} else {
			const trimmedContent = plainText.substring(0, maxLength);
			editor.setData(trimmedContent); // Trim content and set it back to the editor
			this.setState({ content: trimmedContent });
		}
	};
	render() {
		const { groupTrashBinSelected } = this.props;
		const { content } = this.state;

		return (
			<Card>
				<Row style={{ marginBottom: 5 }}>
					<Col span={16} style={{ textAlign: "start" }}>
						<h3>{groupTrashBinSelected?.gr_tr_id === undefined ? "Thêm mới nhóm nhóm thùng rác " : "Chỉnh sửa nhóm thùng rác "} <strong>{groupTrashBinSelected!.gr_tr_name}</strong></h3>
					</Col>
					<Col span={8} style={{ textAlign: 'end' }}>
						<Button type="primary" onClick={() => this.onCreateUpdate()}>Lưu</Button> &nbsp;&nbsp;
						<Button danger onClick={() => this.onCancel()}>Hủy</Button>
					</Col>
				</Row>
				<Row>
					<Form ref={this.formRef} style={{ width: '100%' }} >

						<Form.Item label={'Nhóm thùng rác'} {...AppConsts.formItemLayout} name={'gr_tr_name'} rules={[rules.required, rules.noAllSpaces]} >
							<Input placeholder="Nhập nhóm máy..." maxLength={255} />
						</Form.Item>
						<Form.Item label={L('Mô tả')} {...AppConsts.formItemLayout} name={'gr_tr_desc'} valuePropName='data' rules={[rules.noAllSpaces]}
							getValueFromEvent={(event, editor) => {
								const data = editor.getData();
								return data;
							}}>
							<CKEditor
								editor={ClassicEditor}
								data={content}
								onChange={this.handleEditorChange}
							/>
						</Form.Item >
					</Form>
				</Row>
			</Card >
		)
	}
}