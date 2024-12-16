import { SearchOutlined } from '@ant-design/icons';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { L } from '@lib/abpUtility';
import AppConsts from '@lib/appconst';
import { CreateRoleInput, PermissionDto, RoleDto } from '@src/services/services_autogen';
import { stores } from '@stores/storeInitializer';
import { Button, Card, Checkbox, Col, Divider, Form, Input, Row, Tabs, message } from 'antd';
import CheckboxGroup from 'antd/lib/checkbox/Group';
import * as React from 'react';
import rules from './FormCreateOrUpdateRole.validation';

const TabPane = Tabs.TabPane;

export class ItemPermis {
	label: string;
	value: string;
}

export interface IProps {
	onCancel: () => void;
	onCreateOrUpdatedSuccess: () => void;
	roleSelected: RoleDto;
}

export default class FormCreateOrUpdateRole extends React.Component<IProps> {
	private formRef: any = React.createRef();

	state = {
		isLoadDone: false,
		confirmDirty: false,
		roleId: -1,
		listCheckedRole: [] = [],
		defaultvalue: [] = [],
		checkboxIsDefault: [] = [],
		checkAll: false,
		indeterminate: false,
		role_search: "",
	};
	roleSelected: RoleDto;
	dicDisplayAllPermission: { [key: string]: ItemPermis[]; } = {};
	dicPermissionChecked: { [key: string]: string[]; } = {};


	async componentDidMount() {
		await this.initData(this.props.roleSelected);
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.roleSelected.id !== prevState.roleId) {
			return ({ roleId: nextProps.roleSelected.id });
		}
		return null;
	}
	async componentDidUpdate(prevProps, prevState) {
		if (this.state.roleId !== prevState.roleId) {
			await this.initData(this.props.roleSelected);
		}
	}

	initData = async (roleInput: RoleDto | undefined) => {
		this.setState({ isLoadDone: false });
		if (roleInput != undefined) {
			this.roleSelected = roleInput!;
		}
		else {
			this.roleSelected = new RoleDto();
		}
		if (this.roleSelected.id !== undefined) {
			if (this.roleSelected.description == null) {
				this.roleSelected.description = "";
			}
			this.formRef.current!.setFieldsValue({ ...this.roleSelected });
			let defaultCheckBox: boolean[] = this.state.checkboxIsDefault;
			defaultCheckBox[this.roleSelected.id] = this.roleSelected.isDefault;
			this.setState({ checkboxIsDefault: defaultCheckBox })
		}
		else {
			this.formRef.current!.resetFields();
		}
		await stores.roleStore.getAllPermissions();
		await stores.roleStore.getRoleForEdit(this.state.roleId);

		this.initDicDisplayAllPermission();
		this.initDicPermissionChecked();
		this.getCheckedAllPermission();
		this.checkBoxAll();
		await this.setState({ isLoadDone: true });
	}
	onCreateUpdate = () => {
		const form = this.formRef.current;
		form!.validateFields().then(async (values: any) => {
			let grantedPermissions: string[] = [];
			if (this.dicPermissionChecked != undefined) {
				for (let itemKey in this.dicPermissionChecked) {
					if (!!this.dicPermissionChecked[itemKey] && this.dicPermissionChecked[itemKey].length > 0) {
						for (let itemRes of this.dicPermissionChecked[itemKey]) {
							if (!grantedPermissions.includes(itemRes)) {
								grantedPermissions.push(itemRes);
							}
						}
					}
				}
			}
			if (this.state.roleId === undefined || this.state.roleId < 0) {
				let createData = new CreateRoleInput(values);
				createData.grantedPermissions = grantedPermissions;
				createData.isDefault = this.state.checkboxIsDefault[this.roleSelected.id];
				await stores.roleStore.create(createData);
				message.success(L("them_moi_thanh_cong"))
			} else {
				let updateData = new RoleDto({ id: this.state.roleId, ...values });
				updateData.grantedPermissions = grantedPermissions;
				updateData.isDefault = this.state.checkboxIsDefault[this.state.roleId];
				await stores.roleStore.update(updateData);
				message.success(L("chinh_sua_thanh_cong"));
			}

			if (this.props.onCreateOrUpdatedSuccess !== undefined) {
				await this.props.onCreateOrUpdatedSuccess();
			}
		});
	}

	initDicDisplayAllPermission = () => {
		const { allPermissions } = stores.roleStore;
		for (const [itemKey, itemValue] of Object.entries(AppConsts.Granted_Permissions_Const)) {
			this.dicDisplayAllPermission[itemKey] = [];
			allPermissions.map((item: PermissionDto) => {
				if (item.name && item.name.includes(itemValue.name) && item.name !== AppConsts.Permission.Pages_Admin_Tenants) {
					let itemPer = new ItemPermis();
					itemPer.label = item.displayName!;
					itemPer.value = item.name!;
					this.dicDisplayAllPermission[itemKey].push(itemPer);
				}
			})
		}
	}
	initDicPermissionChecked = () => {
		const { roleEdit } = stores.roleStore;
		for (const [itemKey, itemValue] of Object.entries(AppConsts.Granted_Permissions_Const)) {
			this.dicPermissionChecked[itemKey] = [];
			if (roleEdit != undefined && roleEdit.grantedPermissionNames != undefined && roleEdit.grantedPermissionNames!.length > 0) {
				roleEdit.grantedPermissionNames!.map((item: string) => {
					if (item && item.includes(itemValue.name) && item !== AppConsts.Permission.Pages_Admin_Tenants) {
						this.dicPermissionChecked[itemKey].push(item);
					}
				})
			}
		}
	}
	getCheckedAllPermission = () => {
		const { roleEdit } = stores.roleStore;
		let defaultItem = this.state.defaultvalue;
		let data = roleEdit.grantedPermissionNames != undefined ? roleEdit.grantedPermissionNames : [];

		Object.keys(this.dicDisplayAllPermission).map(key => {
			let item = this.dicDisplayAllPermission[key];
			defaultItem[key] = [];
			item.map(itemValue => {
				if (data.includes(itemValue.value)) {
					defaultItem[key].push(itemValue.value);
				}
			});
		});

		this.setState({ isLoading: false, defaultvalue: defaultItem, confirmDirty: !this.state.confirmDirty })
	}

	onCancel = () => {
		if (this.props.onCancel != undefined) {
			this.props.onCancel();
		}
	}

	onSelectPermission = (arr, key: string) => {
		if (!this.dicPermissionChecked.hasOwnProperty(key)) {
			this.dicPermissionChecked[key] = [];
		}
		this.dicPermissionChecked[key] = arr;
	}
	onCheckPermission = (e, key: string) => {
		let arrayString = e != undefined ? e : [];
		let default1 = this.state.defaultvalue;
		default1[key] = arrayString;
		this.setState({ defaultvalue: default1 })
		this.onSelectPermission(arrayString, key);
		this.checkBoxAll();
	}
	onCheckAllPermission = (e: any, key: string, arr) => {
		let isCheckAll = e.target.checked;
		let arrayString: string[] = [];
		arr.map(item => { arrayString.push(item.value); });

		this.onCheckPermission(isCheckAll ? arrayString : [], key);
		this.setState({ confirmDirty: !this.state.confirmDirty });
	}
	getLengthAllPermisson = () => {
		let x = 0;
		Object.keys(this.dicDisplayAllPermission).map(key => {
			x += this.dicDisplayAllPermission[key].length;
		})
		return x;
	}
	getLengthCheckedPermission = () => {
		let y = 0;
		Object.keys(this.dicPermissionChecked).map(key => {
			y += this.dicPermissionChecked[key].length;
		})
		return y;
	}
	checkBoxAll = async () => {

		const lengthCheckedPermission = await this.getLengthCheckedPermission();
		const lengthAllPermission = await this.getLengthAllPermisson();
		if (lengthAllPermission == lengthCheckedPermission) {

			await this.setState({ checkAll: true, indeterminate: false });
		}
		if (lengthCheckedPermission < lengthAllPermission && lengthCheckedPermission > 0) {
			await this.setState({ indeterminate: true, checkAll: false });
		}
		if (lengthCheckedPermission == 0) {
			await this.setState({ indeterminate: false, checkAll: false });
		}
	}
	checkFullPermission = async (e) => {
		if (!e.target.checked) {
			this.dicPermissionChecked = {};
			this.setState({ defaultvalue: [] });
		} else {
			Object.entries(this.dicDisplayAllPermission).map(([key, value]) => this.dicPermissionChecked[key] = value.map(item => item.value));
			const default1 = this.state.defaultvalue;
			Object.entries(this.dicPermissionChecked).map(([key, value]) => default1[key] = value);
			await this.setState({ defaultvalue: default1 });
		}
		this.checkBoxAll();
	}
	handleSubmitSearch = async () => {
		this.setState({ isLoadDone: false });
		if (!!this.state.role_search) {
			let searchPermis = {};
			Object.keys(this.dicDisplayAllPermission).forEach(permis => {
				searchPermis[permis] = this.dicDisplayAllPermission[permis].filter(item =>
					item.label.toLowerCase().includes(this.state.role_search.toLowerCase())
				);
			});
			this.dicDisplayAllPermission = searchPermis;
		}
		else {
			this.initDicDisplayAllPermission();
		}
		this.setState({ isLoadDone: true });
	}
	renderCheckboxPermission = () => {
		let self = this;
		let content = (
			<>
				<Row gutter={16}>
					<Col span={5} >
						<h4>{L('Tìm kiếm')}</h4>
					</Col>
					<Col span={19} >
						<Input style={{ width: "50%", marginRight: '5px' }} allowClear
							onChange={(e) => this.setState({ role_search: e.target.value })} placeholder={L('nhap_tim_kiem')}
							onPressEnter={this.handleSubmitSearch}
						/>
						<Button type="primary" icon={<SearchOutlined />} title={L('tim_kiem')} onClick={() => this.handleSubmitSearch()} >{L('tim_kiem')}</Button>
					</Col>

				</Row>
				<Checkbox
					onChange={(e) => { this.checkFullPermission(e); }}
					checked={this.state.checkAll}
					indeterminate={this.state.indeterminate}
				>
					{L("ChooseAll")}
				</Checkbox>
				{Object.keys(this.dicDisplayAllPermission) != null && Object.keys(this.dicDisplayAllPermission).map(key => {
					return (
						<React.Fragment key={key}>
							{this.dicDisplayAllPermission[key].length > 0 &&
								<Row key={key + "_row"}>
									<Col span={8}>
										<Checkbox key={key + "_checkbox"}
											onChange={(e) => this.onCheckAllPermission(e, key, this.dicDisplayAllPermission[key])}
											checked={(!!self.state.defaultvalue[key] && self.state.defaultvalue[key].length != 0) && self.state.defaultvalue[key].length == this.dicDisplayAllPermission[key].length}
											indeterminate={(!!self.state.defaultvalue[key] && self.state.defaultvalue[key].length != 0) && self.state.defaultvalue[key].length < this.dicDisplayAllPermission[key].length}
										>
											&nbsp;&nbsp;
											{AppConsts.Granted_Permissions_Const[key].display_name}
										</Checkbox>
									</Col>
									<Col span={16}>
										<CheckboxGroup options={this.dicDisplayAllPermission[key]} onChange={(e) => this.onCheckPermission(e, key)} value={self.state.defaultvalue[key]} defaultValue={self.state.defaultvalue[key]} />
									</Col>
									<Divider />
								</Row>
							}
						</React.Fragment>

					)
				})}
			</>
		)
		return content;
	}
	render() {

		return (
			<Card>
				<Form ref={this.formRef} name="control-ref">
					<Col style={{ textAlign: 'right' }}>
						<Button danger onClick={() => this.onCancel()} style={{ marginLeft: '5px', marginTop: '5px' }}>
							{L("huy")}
						</Button>
						<Button type="primary" onClick={() => this.onCreateUpdate()} style={{ marginLeft: '5px', marginTop: '5px' }}>
							{L("luu")}
						</Button>
					</Col>
					<Tabs defaultActiveKey={'role'} size={'small'} tabBarGutter={64}>
						<TabPane tab={L('thong_tin')} key={'role'}>
							<Form.Item label={L('ten_vai_tro')} name={'name'} rules={rules.name} {...AppConsts.formItemLayout}>
								<Input placeholder={'Tên vai trò...'} />
							</Form.Item>
							<Form.Item label={L('ten_hien_thi')} name={'displayName'} rules={rules.displayName} {...AppConsts.formItemLayout}>
								<Input placeholder={'Tên hiển thị...'} />
							</Form.Item>
							<Form.Item label={L('mo_ta')} name={'description'} {...AppConsts.formItemLayout} valuePropName='data'
								getValueFromEvent={(event, editor) => {
									const data = editor.getData();
									return data;
								}}>
								<CKEditor editor={ClassicEditor} />
							</Form.Item>
							<Form.Item label={L('mac_dinh')} name={'isDefault'} {...AppConsts.formItemLayout}>
								{this.roleSelected != undefined &&
									<Checkbox defaultChecked={this.state.checkboxIsDefault[this.roleSelected.id]} checked={this.state.checkboxIsDefault[this.roleSelected.id]}
										onChange={(e) => {
											let defaultCheckBox: boolean[] = this.state.checkboxIsDefault;
											defaultCheckBox[this.roleSelected.id] = e.target.checked;
											this.setState({ checkboxIsDefault: defaultCheckBox })
										}}
									></Checkbox>
								}
							</Form.Item>
						</TabPane>
						<TabPane tab={L('phan_quyen_vai_tro')} key={'permission'} forceRender={true}>
							{this.renderCheckboxPermission()}
						</TabPane>
					</Tabs>
				</Form>
			</Card>
		);
	}
}
