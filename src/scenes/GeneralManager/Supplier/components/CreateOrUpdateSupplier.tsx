import * as React from 'react';
import { Col, Row, Button, Card, Form, Input, message, Space } from 'antd';
import { L } from '@lib/abpUtility';
import { SupplierDto, CreateSupplierInput, UpdateSupplierInput, AttachmentItem, ActiveOrDeactiveSupplierInput } from '@services/services_autogen';
import { stores } from '@stores/storeInitializer';
import AppConsts from '@src/lib/appconst';
import TextArea from 'antd/lib/input/TextArea';
import { CheckOutlined, EditOutlined, LockOutlined } from '@ant-design/icons';
import rules from '@src/scenes/Validation';
import { session } from '@src/lib/abp';
import confirm from 'antd/lib/modal/confirm';

export interface IProps {
	onCreateUpdateSuccess?: (borrowReDto: SupplierDto) => void;
	onCancel: () => void;
	supplierSelected: SupplierDto;
	layoutDetail?: boolean;
	suppilerListResult?: SupplierDto[];
}

export default class CreateOrUpdateSupplier extends React.Component<IProps> {
	private formRef: any = React.createRef();
	listAttachmentItem: AttachmentItem[] = [];
	state = {
		isLoadDone: false,
		su_id_selected: -1,
		disableInput: true,
	}

	async componentDidMount() {
		await this.initData(this.props.supplierSelected);
	}
	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.supplierSelected.su_id !== prevState.su_id_selected) {
			return ({ su_id_selected: nextProps.supplierSelected.su_id });
		}
		return null;
	}

	async componentDidUpdate(prevProps, prevState) {
		if (this.state.su_id_selected !== prevState.su_id_selected) {
			await this.initData(this.props.supplierSelected);
		}
	}

	initData = async (inputSupplier: SupplierDto) => {
		this.setState({ isLoadDone: false });
		if (inputSupplier.su_id !== undefined) {
			if (inputSupplier.su_note === undefined) {
				inputSupplier.su_note = "";
			}
		} else {
			this.formRef.current.resetFields();
		}
		this.formRef.current!.setFieldsValue({ ...inputSupplier });
		this.setState({ isLoadDone: true });

	}

	componentWillUnmount() {
		this.setState({ isLoadDone: false });
	}
	onCreateUpdate = () => {
		const { supplierSelected } = this.props;

		const form = this.formRef.current;
		form!.validateFields().then(async (values: any) => {
			this.setState({ isLoadDone: false });
			if (supplierSelected.su_id === undefined || supplierSelected.su_id < 0) {
				let unitData = new CreateSupplierInput(values);
				await stores.supplierStore.createSupplier(unitData);
				message.success('Thêm mới nhà cung cấp thành công');
			} else {
				let unitData = new UpdateSupplierInput({ su_id: supplierSelected.su_id, ...values });
				await stores.supplierStore.updateSupplier(unitData);
				this.setState({ disableInput: true });
				message.success('Sửa nhà cung cấp thành công');
			}
			await this.onCreateUpdateSuccess();
			stores.sessionStore.getCurrentLoginInformations();
			this.setState({ isLoadDone: true });
		})
	};
	activeOrDeactiveSupplier = async () => {
		this.setState({ isLoadDone: false })
		const self = this;
		confirm({
			title: self.props.supplierSelected.su_is_active === true ? (
				<span>
					Bạn có muốn <label style={{ color: 'red' }}>ngừng hoạt động</label> của nhà cung cấp này?
				</span>
			)
				: <span>
					Bạn có muốn cho phép nhà cung cấp trở lại<label style={{ color: 'green' }}> hoạt động?</label>
				</span>,
			okText: 'Xác nhận',
			cancelText: 'Hủy',
			async onOk() {
				self.setState({ isLoadDone: true });
				let data: ActiveOrDeactiveSupplierInput = new ActiveOrDeactiveSupplierInput();
				data.su_id = self.props.supplierSelected.su_id;
				data.su_is_active = self.props.supplierSelected.su_is_active == true ? 0 : 1;
				await stores.supplierStore.activeOrDeactive(data);
				await stores.sessionStore.getCurrentLoginInformations();
				await self.onCreateUpdateSuccess();
				self.setState({ isLoadDone: false });
			},
			onCancel() {
			}
		});

		this.setState({ isLoadDone: true })
	}
	onCancel = () => {
		if (!!this.props.onCancel) {
			this.props.onCancel();
		}

	}
	onCreateUpdateSuccess = () => {
		if (!!this.props.onCreateUpdateSuccess) {
			this.props.onCreateUpdateSuccess(this.props.supplierSelected);
		}
	}

	openEdit = async () => {
		await this.setState({ isLoadDone: false, disableInput: false });
		await this.setState({ isLoadDone: true })
	}
	render() {
		const { supplierSelected, layoutDetail, suppilerListResult } = this.props;
		let updatedSupplierList;
		if (!!supplierSelected) {
			updatedSupplierList = suppilerListResult!.filter(supplier => supplier.su_id !== supplierSelected.su_id);
		}
		return (
			<Card >
				<Row style={{ marginTop: 10 }}>
					{
						layoutDetail != undefined && layoutDetail == false ?
							<>
								<Col span={12}><h3>{this.state.su_id_selected === undefined ? L('Thêm mới nhà cung cấp') : L('Sửa nhà cung cấp') + " " + supplierSelected.su_name + ": "}</h3></Col>
								<Col span={12} style={{ textAlign: 'right' }}>
									<Space>
										<Button danger onClick={() => this.onCancel()} >
											{L('Hủy')}
										</Button>
										<Button type="primary" onClick={() => this.onCreateUpdate()}>
											{L('Lưu')}
										</Button>
									</Space>
								</Col>
							</>
							:
							""
					}
				</Row>

				<Row style={{ marginTop: 10 }}>
					{
						layoutDetail != undefined && layoutDetail == false ?

							<Form ref={this.formRef} style={{ width: "100%" }}>
								<Form.Item
									label="Tên nhà cung cấp"
									{...AppConsts.formItemLayout}
									name={'su_name'}
									hasFeedback={this.state.disableInput ? false : true}
									rules={[
										rules.required,
										rules.noAllSpaces,
										({ getFieldValue }) => ({
											validator(_, value) {
												const isSupplierExist = suppilerListResult!.some(supplier => supplier!.su_name!.trim().toLowerCase() === value.trim().toLowerCase());
												if (!value || !isSupplierExist) {
													return Promise.resolve();
												}
												return Promise.reject(new Error('Nhà cung cấp đã tồn tại!'));
											}
										})
									]}
								>
									<Input
										placeholder={'Tên nhà cung cấp...'}
										maxLength={50}
										allowClear
									/>
								</Form.Item>
								<Form.Item label="Số điện thoại" {...AppConsts.formItemLayout} rules={[rules.required, rules.noAllSpaces, rules.phone]} name={'su_phone'} hasFeedback >
									<Input placeholder={'Số điện thoại...'} maxLength={10} allowClear />
								</Form.Item>
								<Form.Item label="Địa chỉ" {...AppConsts.formItemLayout} rules={[rules.required, rules.noAllSpaces]} name={'su_address'} hasFeedback >
									<Input placeholder={'Địa chỉ...'} maxLength={100} allowClear />
								</Form.Item>
								<Form.Item label="Email" {...AppConsts.formItemLayout} rules={[rules.required, rules.noAllSpaces, rules.emailAddress]} name={'su_email'} hasFeedback >
									<Input placeholder={'Email...'} allowClear />
								</Form.Item>
								<Form.Item label="Người liên hệ" {...AppConsts.formItemLayout} rules={[rules.required, rules.noAllSpaces,
								{ validator: (_, value) => rules.userName(value) }]} name={'su_contact_person'} hasFeedback >
									<Input placeholder={'Người liên hệ...'} maxLength={50} allowClear />
								</Form.Item>
								<Form.Item label="Ghi chú" {...AppConsts.formItemLayout} name={'su_note'} >
									<TextArea placeholder="Ghi chú..." maxLength={255} allowClear rows={4}></TextArea>
								</Form.Item>
							</Form>
							:
							<Form ref={this.formRef} style={{ width: "100%" }}>
								<Row>
									<Col span={8}>
										<Form.Item label="Mã nhà cung cấp"  {...AppConsts.formItemLayout} name={'su_id'}>
											<label style={{ fontWeight: "bold" }}>{this.props.supplierSelected != undefined ? this.props.supplierSelected.su_code : "Không có mã nhà cung cấp"}</label>
										</Form.Item>
										<Form.Item
											label="Tên nhà cung cấp"
											{...AppConsts.formItemLayout}
											name={'su_name'}
											hasFeedback={this.state.disableInput ? false : true}
											rules={[
												rules.required,
												rules.noAllSpaces,
												({ getFieldValue }) => ({
													validator(_, value) {
														const isSupplierExist = updatedSupplierList!.some(supplier => supplier!.su_name!.trim().toLowerCase() === value.trim().toLowerCase());
														if (!value || !isSupplierExist) {
															return Promise.resolve();
														}
														return Promise.reject(new Error('Nhà cung cấp đã tồn tại!'));
													}
												})
											]}
										>
											<Input
												disabled={this.state.disableInput}
												placeholder={'Tên nhà cung cấp...'}
												maxLength={50}
												allowClear
											/>
										</Form.Item>
										<Form.Item label="Số điện thoại" {...AppConsts.formItemLayout} rules={[rules.required, rules.noAllSpaces, rules.phone]} name={'su_phone'} hasFeedback={this.state.disableInput ? false : true} >
											<Input placeholder={'Số điện thoại...'} disabled={this.state.disableInput} maxLength={10} allowClear />
										</Form.Item>
									</Col>
									<Col span={8}>
										<Form.Item label="Địa chỉ" {...AppConsts.formItemLayout} rules={[rules.required, rules.noAllSpaces]} name={'su_address'} hasFeedback={this.state.disableInput ? false : true} >
											<Input placeholder={'Địa chỉ...'} disabled={this.state.disableInput} maxLength={100} allowClear />
										</Form.Item>
										<Form.Item label="Email" {...AppConsts.formItemLayout} rules={[rules.required, rules.noAllSpaces, rules.emailAddress]} name={'su_email'} hasFeedback={this.state.disableInput ? false : true} >
											<Input placeholder={'Email...'} disabled={this.state.disableInput} allowClear />
										</Form.Item>
										<Form.Item label="Người liên hệ" {...AppConsts.formItemLayout} rules={[rules.required, rules.noAllSpaces, { validator: (_, value) => rules.userName(value) }]} name={'su_contact_person'} hasFeedback={this.state.disableInput ? false : true} >
											<Input placeholder={'Người liên hệ...'} disabled={this.state.disableInput} maxLength={50} allowClear />
										</Form.Item>
									</Col>
									<Col span={8}>
										<Form.Item label="Ghi chú" {...AppConsts.formItemLayout} name={'su_note'} >
											<TextArea placeholder="Ghi chú..." allowClear disabled={this.state.disableInput} rows={6} maxLength={255}></TextArea>
										</Form.Item>
									</Col>
								</Row>


								<Row justify='end'>
									{this.state.disableInput == true ?
										<Button type='primary' onClick={this.openEdit} icon={<EditOutlined />}>Cập nhật</Button>
										:
										<Space>
											<Button danger onClick={() => { this.setState({ disableInput: true }); this.initData(this.props.supplierSelected) }} >Hủy</Button>
											<Button onClick={this.onCreateUpdate} icon={<CheckOutlined />} >Lưu</Button>
										</Space>
									}
									{
										supplierSelected != undefined &&
										<>
											{
												supplierSelected.su_is_active == true ?
													<Button style={{ marginLeft: 10 }} onClick={() => this.activeOrDeactiveSupplier()} type='primary' icon={<LockOutlined />} danger >Ngưng hoạt động </Button>
													:
													<Button style={{ marginLeft: 10 }} onClick={() => this.activeOrDeactiveSupplier()} type='primary' icon={<LockOutlined />}  >Cho phép hoạt động</Button>
											}
										</>

									}
								</Row>
							</Form>
					}

				</Row>
			</Card >
		)
	}
}