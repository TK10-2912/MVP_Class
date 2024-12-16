import * as React from 'react';
import { Checkbox, Input, Tabs, Form, Card, Button, message, Col, Row } from 'antd';
import { L } from '@lib/abpUtility';
import { CreateRepositoryInput, CreateUserDto, RoleDto, UpdateUserInput, UserDto } from '@services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import AppConsts from '@src/lib/appconst';
import CheckboxGroup from 'antd/lib/checkbox/Group';
import rules from '@src/scenes/Validation';

const TabPane = Tabs.TabPane;

export interface IProps {
	onCancel: () => void;
	onCreateOrUpdatedSuccess: () => void;
	userSelected: UserDto;
	userListResult?: UserDto[];
}
class OptionValue {
	lable = '';
	value = '';
	constructor() { }
}
export default class FormCreateOrUpdateUser extends React.Component<IProps> {

	private formRef: any = React.createRef();

	state = {
		isLoadDone: false,
		confirmDirty: false,
		userId: -1,
		isActive: true,
		usIdSelected: undefined
	};
	userSelected: UserDto;
	optionsRoles: any;
	async componentDidMount() {
		await this.initData(this.props.userSelected);
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.userSelected.id !== prevState.userId) {
			return {
				userId: nextProps.userSelected.id,
				isActive: nextProps.userSelected.isActive || true,
				confirmDirty: false,
			};
		}
		return null;
	}
	async componentDidUpdate(prevProps, prevState) {
		if (this.props.userSelected.id !== prevProps.userSelected.id) {
			this.setState({ userId: this.props.userSelected.id });
			await this.initData(this.props.userSelected);
		}
	}

	initData = async (userInput: UserDto | undefined) => {
		this.setState({ isLoadDone: false });
		await stores.userStore.getRoles();
		const { roles } = stores.userStore;

		if (userInput != undefined) {
			this.userSelected = userInput!;
		} else {
			this.userSelected = new UserDto();
		}
		let roleDefault: string[] = [];
		this.optionsRoles = [];
		if (roles && roles.length > 0) {
			roles.map((x: RoleDto) => {
				if (x.isDefault) {
					roleDefault.push(x.name!);
				}
				this.optionsRoles.push({
					label: x.displayName!,
					value: x.name!
				});
			});
		}
		if (this.userSelected.id == undefined) {
			this.userSelected.roleNames = roleDefault;
		}
		this.formRef.current.setFieldsValue({ ...userInput, });
		this.setState({ isLoadDone: true });
	}

	compareToFirstPassword = (rule: any, value: any, callback: any) => {
		const form = this.formRef.current;
		if (value && value !== form!.getFieldValue('password')) {
			return Promise.reject('Mật khẩu không trùng nhau');
		}
		return Promise.resolve();
	};

	validateToNextPassword = (rule: any, value: any, callback: any) => {
		const { validateFields, getFieldValue } = this.formRef.current!;
		this.setState({
			confirmDirty: true,
		});

		if (value && this.state.confirmDirty && getFieldValue('confirm')) {
			validateFields(['confirm']);
		}
		return Promise.resolve();
	};

	onCancel = () => {
		if (this.props.onCancel != undefined) {
			this.props.onCancel();
		}
	}

	onCreateUpdate = () => {
		const form = this.formRef.current;
		form!.validateFields().then(async (values: any) => {
			let roleNames = values.roleNames;
			if (roleNames === undefined) {
				roleNames = [];
			}
			if (this.state.userId === undefined || this.state.userId < 0) {
				let createData = new CreateUserDto(values);
				createData.roleNames = roleNames;
				createData.isActive = this.state.isActive;
				await stores.userStore.create(createData);
				message.success(L("Thêm mới thành công"))
			} else {
				let updateData = new UpdateUserInput({ id: this.state.userId, ...values });
				updateData.roleNames = roleNames;
				updateData.isActive = this.state.isActive;
				await stores.userStore.updateUser(updateData);
				message.success(L("Chỉnh sửa thành công"));
			}

			if (this.props.onCreateOrUpdatedSuccess !== undefined) {
				await this.props.onCreateOrUpdatedSuccess();
			}
			this.setState({ isLoadDone: true });
		});
	}


	render() {

		const { userSelected, userListResult } = this.props;
		const listRole = userSelected.id != undefined ? userSelected.roleNames!.map(item => item.toUpperCase()) : [];
		let userList = userListResult?.slice();
		if (!!userSelected && userSelected.id != undefined) {
			userList = userListResult!.filter(item => item.id !== userSelected!.id!);
		}
		return (
			<Card >
				<Form ref={this.formRef}>
					<Row style={{ marginTop: 10, display: "flex", flexDirection: "row" }}>
						<Col span={12}><h3>{this.state.userId === undefined ? L("Thêm người dùng") : L('Chỉnh sửa người dùng') + ": " + userSelected.fullName}</h3></Col>
						<Col span={12} style={{ textAlign: 'right' }}>
							<Button danger onClick={() => this.onCancel()} style={{ marginLeft: '5px', marginTop: '5px' }}>
								{L("Hủy")}
							</Button>
							<Button type="primary" onClick={() => this.onCreateUpdate()} style={{ marginLeft: '5px', marginTop: '5px' }}>
								{L("Lưu")}
							</Button>
						</Col>
					</Row>

					<Tabs defaultActiveKey={'userInfo'} size={'small'} tabBarGutter={64}>
						<TabPane tab={"Người dùng"} key={'userInfo'}>
							<Form.Item label={L('Tên')} {...AppConsts.formItemLayout} name={'name'} rules={[rules.gioi_han_ten, rules.required, rules.noAllSpaces,]} >
								<Input
									placeholder={'Tên...'}
									maxLength={64}
									onChange={(e) => {
										if (e.target.value.length > 64) {
											e.preventDefault();
										}
									}}
								/>
							</Form.Item>
							<Form.Item label={L('Họ')} {...AppConsts.formItemLayout} name={'surname'} rules={[rules.gioi_han_ten, rules.required, rules.noAllSpaces,]}>
								<Input
									placeholder={'Họ...'}
									maxLength={64}
									onChange={(e) => {
										if (e.target.value.length > 64) {
											e.preventDefault();
										}
									}}
								/>
							</Form.Item>
							<Form.Item label={L('Tên đăng nhập')} {...AppConsts.formItemLayout} name={'userName'} rules={[rules.gioi_han_ten, rules.required, rules.noAllSpaces, ({ getFieldValue }) => ({
								validator(_, value) {
									const isMachineSoft = userList!.some(item => item!.userName!.trim().toLowerCase() === value.trim().toLowerCase());
									if (!value || !isMachineSoft) {
										return Promise.resolve();
									}
									return Promise.reject(new Error('Tên đăng nhập đã tồn tại!'));
								}
							})]}>
								<Input
									placeholder={'Tên đăng nhập...'}
									maxLength={64}
									onChange={(e) => {
										if (e.target.value.length > 64) {
											e.preventDefault();
										}
									}}
								/>
							</Form.Item>
							<Form.Item label={L('Email')} {...AppConsts.formItemLayout} name={'emailAddress'} rules={[rules.required, rules.noAllSpaces, rules.emailAddress, ({ getFieldValue }) => ({
								validator(_, value) {
									const isMachineSoft = userList!.some(item => item!.emailAddress!.trim().toLowerCase() === value.trim().toLowerCase());
									if (!value || !isMachineSoft) {
										return Promise.resolve();
									}
									return Promise.reject(new Error('Email đã được sử dụng!'));
								}
							})]}>
								<Input
									placeholder={'Email...'}
									maxLength={256}
									onChange={(e) => {
										if (e.target.value.length > 256) {
											e.preventDefault();
										}
									}}
								/>
							</Form.Item>
							{this.state.userId === undefined ? (
								<Form.Item
									label={L('Mật khẩu')}
									{...AppConsts.formItemLayout}
									name={'password'}
									rules={[rules.required, { validator: this.validateToNextPassword }]}

								>
									<Input.Password placeholder={'Mật khẩu...'} />
								</Form.Item>
							) : null}
							{this.state.userId === undefined ? (
								<Form.Item
									label={L('Xác nhận mật khẩu')}
									{...AppConsts.formItemLayout}
									name={'confirm'}
									rules={[rules.required, rules.password, { min: 8, message: L('Mật khẩu tối thiểu 8 ký tự ') }, { validator: this.compareToFirstPassword }]}
								>
									<Input.Password placeholder={'Xác nhận mật khẩu...'} />
								</Form.Item>
							) : null}
							<Form.Item label={L('Kích hoạt')} {...AppConsts.formItemLayout} name={'isActive'} valuePropName='checked'>
								<Checkbox onChange={(e) => this.setState({ isActive: e.target.checked })} ></Checkbox>
							</Form.Item>
						</TabPane>
						<TabPane tab={'Vai trò'} key={'rol'}>
							<Form.Item name={'roleNames'}>
								<Checkbox.Group
									options={this.optionsRoles}
									value={listRole}
								/>
							</Form.Item>

						</TabPane>
					</Tabs>
				</Form>
			</Card >
		);
	}
}

