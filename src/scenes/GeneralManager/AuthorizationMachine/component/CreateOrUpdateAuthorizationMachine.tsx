import AppComponentBase from '@src/components/Manager/AppComponentBase';
import SelectEnum from '@src/components/Manager/SelectEnum';
import SelectUser from '@src/components/Manager/SelectUser';
import SelectedMachine from '@src/components/Manager/SelectedMachine';
import AppConsts from '@src/lib/appconst';
import { eAuthorizationMachineType } from '@src/lib/enumconst';
import rules from '@src/scenes/Validation';
import { AttachmentItem, AuthorizationMachineDto, CreateAuthorizationMachineInput, MachineAbstractDto, UpdateAuthorizationMachineInput } from '@src/services/services_autogen';
import { stores } from "@src/stores/storeInitializer";
import { Button, Card, Checkbox, Col, Form, Input, Row, Space, Tree, message } from 'antd';
import * as React from 'react';


export interface IProps {
	onCreateUpdateSuccess?: () => void;
	onCancel: () => void;
	authorizationMachineSelected: AuthorizationMachineDto;
	ma_id_list?: number[];
}
const { TreeNode } = Tree;
const { Search } = Input;
export default class CreateOrUpdateAuthorizationMachine extends AppComponentBase<IProps> {
	private formRef: any = React.createRef();
	state = {
		isLoadDone: false,
		au_ma_id: -1,
		au_ma_type: undefined,
		ma_id_list: undefined,
		ma_id: undefined,
		us_id_is_authorized: undefined,
		searchValue: '',
		expandedKeys: [],
		autoExpandParent: true,
		checkedKeys: [],
		selectedKeys: [],
		selectedValues: [],

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
			if (this.props.authorizationMachineSelected.au_ma_id == undefined) {
				this.setState({ selectedValues: [] });
			}
		}
	}
	initData = async (authorizationMachine: AuthorizationMachineDto | undefined) => {
		this.setState({ isLoadDone: false });
		if (authorizationMachine !== undefined && authorizationMachine.au_ma_id !== undefined) {
			this.authorizationMachineSelected = authorizationMachine;
			await this.setState({ ma_id: authorizationMachine.ma_id, us_id_is_authorized: authorizationMachine.us_id_is_authorized,au_ma_type: authorizationMachine.au_ma_type  });
			this.formRef.current.setFieldsValue({ ...this.authorizationMachineSelected });
		} else {
			this.authorizationMachineSelected = new AuthorizationMachineDto();
		}
		this.setState({ isLoadDone: true });
	}
	onCreateUpdate = () => {
		const { authorizationMachineSelected } = this.props;
		const form = this.formRef.current;
		form!.setFieldsValue({ ma_id_list: this.state.selectedValues });
		form!.validateFields().then(async (values: any) => {
			if (authorizationMachineSelected.au_ma_id === undefined || authorizationMachineSelected.au_ma_id < 0) {
				let unitData = new CreateAuthorizationMachineInput({ ...values });
				unitData.ma_id_list = this.state.selectedValues.filter(item => !isNaN(Number(item)) && Number(item));
				unitData.us_id_is_authorized = this.state.us_id_is_authorized!;
				unitData.au_ma_type = this.state.au_ma_type!;
				await stores.authorizationMachineStore.createAuthorizationMachine(unitData)
				this.formRef.current.resetFields();
				message.success("Thêm mới thành công!")
				await this.onCreateUpdateSuccess();
				stores.sessionStore.getCurrentLoginInformations();
			}
			else {
				let unitData = new UpdateAuthorizationMachineInput({ au_ma_id: authorizationMachineSelected.au_ma_id, ...values });
				unitData.us_id_is_authorized = this.state.us_id_is_authorized!;
				unitData.ma_id = this.state.ma_id!;
				await stores.authorizationMachineStore.updateAuthorizationMachine(unitData);
				message.success("Chỉnh sửa thành công!");
				stores.sessionStore.getCurrentLoginInformations();
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
	handleTreeSelectChange = async (selectedValues) => {
		await this.setState({ selectedValues: selectedValues });
		await this.formRef.current!.setFieldsValue({ ma_id: selectedValues });

	};
	renderTreeNodes = data =>
		data.map(item => {
			const index = item.title?.toLowerCase().indexOf(this.state.searchValue.toLowerCase());
			const beforeStr = item.title?.substr(0, index);
			const afterStr = item.title?.substr(index + this.state.searchValue.length);
			const title =
				index > -1 ? (
					<span>
						{beforeStr}
						<span style={{ color: '#f50' }}>{this.state.searchValue}</span>
						{afterStr}
					</span>
				) : (
					<span>{item.title}</span>
				);
			const containsSearchValue = this.findInTree(item, this.state.searchValue);
			if (!containsSearchValue) {
				return null;
			}
			if (item.children) {
				return (
					<TreeNode title={title} key={item.key} >
						{this.renderTreeNodes(item.children)}
					</TreeNode>
				);
			}
			return <TreeNode {...item} title={title} key={item.key} />;
		});
	findInTree = (node, searchValue) => {
		if (node.title?.toLowerCase().includes(searchValue?.toLowerCase())) {
			return true;
		}
		if (node.children) {
			for (let child of node.children) {
				if (this.findInTree(child, searchValue)) {
					return true;
				}
			}
		}
		return false;
	};
	onSearchChange = e => {
		const { value } = e.target;
		this.setState({
			searchValue: value,
			expandedKeys: [],
			autoExpandParent: true,
		});
	};
	onCheckAllChange = checked => {
		const treeMachine = stores.sessionStore.getAllTreeMachinesWithGroupMachinebyUser(this.props.ma_id_list!);
		const checkedKeys = checked ? this.getAllKeys(treeMachine) : [];
		this.setState({ selectedValues: checkedKeys });
	};
	getAllKeys = (data: any[]): (string | number)[] => {
		let keys: (string | number)[] = [];
		data.forEach(item => {
			keys.push(item.key);
			if (item.children) {
				keys = keys.concat(this.getAllKeys(item.children));
			}
		});
		return keys;
	};
	render() {
		const treeMachine = stores.sessionStore.getAllTreeMachinesWithGroupMachinebyUser(this.props.ma_id_list!)
		const machineSelect = this.state.ma_id != undefined ? stores.sessionStore.getMachineUseMaId(this.state.ma_id!) : new MachineAbstractDto();
		return (
			<Card>
				<Row style={{ marginBottom: 8 }}>
					<Col span={12}>
						<h3>
							{this.state.au_ma_id === undefined
								? "Thêm mới uỷ quyền"
								: "Thông tin uỷ quyền"}
						</h3>
					</Col>
					<Col span={12} style={{ textAlign: "right" }}>
						<Space>
							<Button
								danger
								onClick={() => this.onCancel()}
							>
								Hủy
							</Button>
							{
								// treeMachine.length > 0 &&
								<Button
									type="primary"
									onClick={() => this.onCreateUpdate()}
								>
									Lưu
								</Button>
							}
						</Space>
					</Col>
				</Row>
				<Row>
					<Form ref={this.formRef} style={{ width: '100%' }}>
						<Form.Item label="Người nhận uỷ quyền" {...AppConsts.formItemLayout} rules={[rules.required]} name={"us_id_is_authorized"} >
							<SelectUser checkAuthorization={false} us_id={this.state.us_id_is_authorized} onChangeUser={async (value) => { await this.setState({ us_id_is_authorized: value }); this.formRef.current?.setFieldsValue({ us_id_is_authorized: value }) }} />
						</Form.Item>
						<Form.Item label="Loại ủy quyền" {...AppConsts.formItemLayout} rules={[rules.required]} name={"au_ma_type"} >
							<SelectEnum enum_value={this.state.au_ma_type} eNum={eAuthorizationMachineType} onChangeEnum={(value) =>{ this.setState({ au_ma_type: value });this.formRef.current?.setFieldsValue({ au_ma_type: value })}}> </SelectEnum>
						</Form.Item>
						{this.state.au_ma_id != undefined &&
							<>

								<Form.Item label="Máy bán nước" {...AppConsts.formItemLayout} name={"ma_id"} rules={[rules.required]}>
									<b>{machineSelect != undefined ? `${machineSelect.ma_code}-${machineSelect.ma_display_name}` : 'Không có máy'}</b>
									{/* <SelectedMachine machineId={this.state.ma_id} onChangeMachine={async (value) => { await this.setState({ ma_id: value }); this.formRef.current?.setFieldsValue({ ma_id: value }) }} /> */}
								</Form.Item>
							</>

						}
						{this.state.au_ma_id === undefined &&
							<Form.Item label="Chọn máy" {...AppConsts.formItemLayout} name={'ma_id'} rules={[rules.required]} >
								{(treeMachine.length > 0) ?
									<>
										<Search style={{ marginBottom: 8 }} placeholder="Search" onChange={this.onSearchChange} allowClear />
										<Checkbox
											indeterminate={this.state.selectedValues.length > 0 && this.state.selectedValues.length < this.getAllKeys(treeMachine).length}
											checked={this.state.selectedValues.length === this.getAllKeys(treeMachine).length}
											onChange={e => this.onCheckAllChange(e.target.checked)}
										>
											Chọn tất cả
										</Checkbox>
									</> : <label>Tất cả máy đã được uỷ quyền</label>}
								<Tree
									checkable
									onCheck={this.handleTreeSelectChange}
									checkedKeys={this.state.selectedValues}
									onExpand={keys => {
										this.setState({
											expandedKeys: keys,
											autoExpandParent: false,
										});
									}}
								>
									{this.renderTreeNodes(treeMachine)}
								</Tree>
							</Form.Item>
						}
					</Form>
				</Row>
			</Card>
		)
	}
}
