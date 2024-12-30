import { ActiveOrDeactiveProductInput, AttachmentItem, CreateProductInput, FileParameter, ImageProductDto, ProductDto, UpdateProductInput } from '@src/services/services_autogen';
import * as React from 'react';
import { stores } from "@src/stores/storeInitializer";
import { Button, Card, Col, Form, Image, Input, InputNumber, Row, Space, message } from 'antd';
import AppConsts, { FileUploadType } from '@src/lib/appconst';
import rules from '@src/scenes/Validation';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import SelectedUnit from '@src/components/Manager/SelectedUnit';
import { CheckOutlined, EditOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';
import confirm from 'antd/lib/modal/confirm';
import FileAttachmentsProduct from '@src/components/FileAttachmentsProduct';
import SelectTenant from '@src/components/Manager/SelectTenant';
export interface IProps {
	onCreateUpdateSuccess?: () => void;
	onCancel?: () => void;
	productSelected: ProductDto;
	layoutDetail?: boolean;
	productListResult?: ProductDto[];
}
export default class CreateOrUpdateProduct extends AppComponentBase<IProps> {
	private formRef: any = React.createRef();
	state = {
		isLoadDone: false,
		isLoadFile: false,
		pr_id: -1,
		pr_type: undefined,
		pr_unit: undefined,
		disableInput: true,
		su_id: undefined,
	}
	fileUpload: any;
	fileAttachmentItem: AttachmentItem[] = [];
	productSelected: ProductDto;
	fileParameter: FileParameter | undefined;
	async componentDidMount() {
		await this.initData(this.props.productSelected);
		this.setState({ isLoadDone: !this.state.isLoadDone });
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.productSelected.pr_id !== prevState.pr_id) {
			return ({ pr_id: nextProps.productSelected.pr_id });
		}
		return null;
	}

	async componentDidUpdate(prevProps, prevState) {
		if (this.state.pr_id !== prevState.pr_id) {
			this.setState({ isLoadFile: !this.state.isLoadFile });
			this.initData(this.props.productSelected);
		}
	}

	initData = async (productInput: ProductDto | undefined) => {
		this.setState({ isLoadDone: false });
		if (productInput !== undefined && productInput.pr_id !== undefined) {
			this.productSelected = productInput!;
			this.setState({ isLoadDone: !this.state.isLoadDone });

			if (productInput.fi_id != undefined) {
				this.fileAttachmentItem[0] = productInput.fi_id;
				await this.getImage();
			}
			if (productInput.pr_unit != undefined) {
				this.setState({ pr_unit: productInput.pr_unit })
			}
			this.formRef.current!.setFieldsValue(productInput);
			this.setState({ isLoadDone: !this.state.isLoadDone });
		} else {
			this.setState({ pr_unit: undefined })
			this.fileAttachmentItem[0] = new AttachmentItem();
			await this.getImage();
			this.productSelected = new ProductDto();
			this.formRef.current!.resetFields();
		}
		this.setState({ isLoadFile: !this.state.isLoadFile, isLoadDone: true });
	}

	async getImage() {
		this.setState({ isLoadDone: false });
		this.fileUpload = {
			uid: this.fileAttachmentItem[0].id + "",
			name: 'image.png',
			status: 'done',
			url: this.getFile(this.fileAttachmentItem[0].id),
		};
		this.setState({ isLoadDone: true });
	}

	onCreateUpdate = async () => {
		const { productSelected } = this.props;
		this.setState({ isLoadDone: false });
		const form = this.formRef.current;
		form!.validateFields().then(async (values: any) => {
			if (productSelected.pr_id === undefined || productSelected.pr_id < 0) {
				let unitData = new CreateProductInput({ ...values });
				// this.fileAttachmentItem[0].isdelete = false;
				let result: ImageProductDto = await stores.imageProductStore.createFile(this.fileParameter!.fileName, this.fileParameter);
				if (!!result && result.im_pr_id != undefined) {
					let attachmentItem = new AttachmentItem();
					attachmentItem.id = result.im_pr_id;
					attachmentItem.key = result.im_pr_name;
					attachmentItem.ext = result.im_pr_extension;
					attachmentItem.md5 = result.im_pr_md5;
					attachmentItem.isdelete = false;
					unitData.fi_id = attachmentItem;
				}
				await stores.productStore.createProduct(unitData);
				await stores.sessionStore.getCurrentLoginInformations();
				await this.onCreateUpdateSuccess();
				this.formRef.current?.resetFields();
				message.success("Thêm mới thành công!");
			}
			else {
				let unitData = new UpdateProductInput({ ...values });
				unitData.pr_id = productSelected.pr_id;
				unitData.fi_id = this.fileAttachmentItem[0];
				await stores.productStore.updateProduct(unitData);
				await this.onCreateUpdateSuccess();
				this.setState({ disableInput: true })
				message.success("Chỉnh sửa thành công!");
			}
			this.setState({ isLoadFile: !this.state.isLoadFile, isLoadDone: true });
		})
	};
	openEdit = async () => {
		await this.setState({ disableInput: false });
	}
	onCancel = () => {
		if (!!this.props.onCancel) {
			this.props.onCancel();
			this.fileAttachmentItem.length = 0;
		}
	};
	onCreateUpdateSuccess = () => {
		if (!!this.props.onCreateUpdateSuccess) {
			this.props.onCreateUpdateSuccess();
		}
		this.setState({ isLoadDone: true });
	}
	componentWillUnmount() {
		this.setState = (_state, _callback) => {
			return;
		};
	}

	activeOrDeactive = async (input: ProductDto) => {
		const self = this;
		confirm({
			title: input.pr_is_active == true ? "Bạn có muốn ngừng kinh doanh sản phẩm này ?" : "Bạn muốn cho phép kinh doanh sản phẩm này ?",
			okText: 'Xác nhận',
			cancelText: 'Hủy',
			async onOk() {
				self.setState({ isLoadDone: false });
				const dataInput: ActiveOrDeactiveProductInput = new ActiveOrDeactiveProductInput();
				dataInput.pr_id = input.pr_id;
				dataInput.pr_is_active = input.pr_is_active == true ? 0 : 1;
				await stores.productStore.activeOrDeactive(dataInput)
				await self.onCreateUpdateSuccess();
				self.setState({ isLoadDone: true });


			},
			onCancel() {
			},
		});
	}

	render() {
		const self = this;
		const { productSelected, productListResult } = this.props;
		const { tenant } = stores.sessionStore.currentLogin;
		let productList = productListResult?.slice();
		if (!!productSelected && productSelected.pr_id != undefined) {
			productList = productListResult!.filter(item => item.pr_id !== productSelected!.pr_id!);
		}
		return (
			<Card>
				{this.props.layoutDetail == false &&
					<Row style={{ marginBottom: 8 }}>
						<Col span={12}>
							<h3>
								{this.state.pr_id === undefined
									? "Thêm mới sản phẩm"
									: "Thông tin " + productSelected.pr_name}
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
								<Button
									type="primary"
									onClick={() => this.onCreateUpdate()}
								>
									Lưu
								</Button>
							</Space>
						</Col>
					</Row>
				}

				<Row>
					{this.props.layoutDetail == false ?
						<Form ref={this.formRef} style={{ width: '100%' }}>
							{(this.state.pr_id === undefined && !tenant) &&
								<Form.Item label="Tenant" {...AppConsts.formItemLayout} name={"tenantId"} rules={[rules.required]}>
									<SelectTenant onChange={async (value) => await this.formRef.current!.setFieldsValue({ tenantId: value })} />
								</Form.Item>
							}
							<Form.Item label="Tên sản phẩm" {...AppConsts.formItemLayout} name={"pr_name"} rules={[rules.required, rules.noAllSpaces, rules.maxName,
							({ getFieldValue }) => ({
								validator(_, value) {
									if (!value) {
										return Promise.resolve();
									}
									const isMachineSoft = productList?.some(
										(item) =>
											item?.pr_name?.trim().toLowerCase() === value.trim().toLowerCase()
									);
									if (!isMachineSoft) {
										return Promise.resolve();
									}
									return Promise.reject(new Error('Sản phẩm đã tồn tại!'));
								},
							}),
							]}>
								<Input maxLength={64} placeholder='Nhập tên sản phẩm...' allowClear></Input>
							</Form.Item>
							<Form.Item label={'Giá bán(VNĐ)'} {...AppConsts.formItemLayout} rules={[rules.messageForNumber]} name={'pr_price'} >
								<InputNumber
									step={1000}
									max={99999999}
									placeholder={'Nhập số tiền....'}
									min={0}
									maxLength={AppConsts.maxLength.cost}
									style={{ width: "100%" }}
									formatter={value => AppConsts.numberWithCommas(value)}
									parser={value => value!.replace(/\D/g, '')}
									onKeyPress={(e) => {
										if (!/[\d,.]/.test(e.key) && e.key !== 'Backspace') {
											e.preventDefault();
										}
									}}
								/>
							</Form.Item>
							<Form.Item label="Đơn vị tính" {...AppConsts.formItemLayout} name={"pr_unit"} rules={[rules.required]}>
								<SelectedUnit unitSelected={this.state.pr_unit} onChangeUnit={async (value) => await this.formRef.current!.setFieldsValue({ pr_unit: value })}></SelectedUnit>
							</Form.Item>
							<Form.Item label="Ghi chú" {...AppConsts.formItemLayout} name={'pr_desc'} >
								<TextArea placeholder={productSelected.pr_desc} rows={4} maxLength={255}></TextArea>
							</Form.Item>
							<Form.Item label="Ảnh sản phẩm" {...AppConsts.formItemLayout} rules={[rules.required]} name={"fi_id"} >
								<FileAttachmentsProduct
									maxLength={1}
									files={self.fileAttachmentItem}
									isLoadFile={this.state.isLoadFile}
									allowRemove={true}
									isUpLoad={self.fileAttachmentItem.some(file => file.id !== undefined) ? false : true}
									isMultiple={true}
									componentUpload={FileUploadType.Avatar}
									onSubmitUpdate={async (itemFile: AttachmentItem[], file) => {
										self.fileAttachmentItem = itemFile;
										self.fileParameter = file;
										await this.formRef.current!.setFieldsValue({ fi_id: file });
									}}
								/>
							</Form.Item>
						</Form>
						:
						<>
							<Row style={{ width: "100%" }}>
								<Col span={8}>
									<h3 style={{ color: "#2d2d8c", fontWeight: "bold", textAlign: "center" }}>{productSelected.pr_name}</h3>
								</Col>
							</Row>
							<Form ref={this.formRef} style={{ width: '100%' }}>
								<Row>
									<Col span={8}>
										{this.state.disableInput ?
											<Image
												style={{ width: 80, height: 80 }}
												className='no-print imageDetailProduct'
												src={(this.fileAttachmentItem[0] != undefined && this.fileAttachmentItem[0].id != undefined) ? this.getImageProduct(this.fileAttachmentItem[0].md5 != undefined ? this.fileAttachmentItem[0].md5 : "") : AppConsts.appBaseUrl + "/image/no_image.jpg"}
												alt='No image available' />
											:
											<Form.Item label="Ảnh sản phẩm" {...AppConsts.formItemLayout} name={"fi_id"} rules={[rules.required]} >
												<FileAttachmentsProduct
													maxLength={1}
													files={self.fileAttachmentItem}
													isLoadFile={this.state.isLoadFile}
													allowRemove={true}
													isUpLoad={true}
													isMultiple={false}
													componentUpload={FileUploadType.Avatar}
													onSubmitUpdate={async (itemFile: AttachmentItem[], file) => {
														self.fileAttachmentItem = itemFile;
														self.fileParameter = file;
														await this.formRef.current!.setFieldsValue({ fi_id: file });
													}}
												/>
											</Form.Item>
										}
									</Col>
									<Col span={8}>
										<Form.Item label="Mã sản phẩm" {...AppConsts.formItemLayout} name={"pr_code"} >
											<label>{productSelected.pr_code}</label>
										</Form.Item>
										<Form.Item label="Tên sản phẩm" {...AppConsts.formItemLayout} name={"pr_name"} rules={[rules.required, rules.noAllSpaces, rules.gioi_han_ten, ({ getFieldValue }) => ({
											validator(_, value) {
												const isMachineSoft = productList!.some(item => item!.pr_name!.trim().toLowerCase() === value.trim().toLowerCase());
												if (!value || !isMachineSoft) {
													return Promise.resolve();
												}
												return Promise.reject(new Error('Sản phẩm đã tồn tại!'));
											}
										})]}>
											<Input disabled={this.state.disableInput} placeholder='Nhập tên sản phẩm...' allowClear></Input>
										</Form.Item>
										<Form.Item label={'Giá bán(VNĐ)'} {...AppConsts.formItemLayout} rules={[rules.messageForNumber]} name={'pr_price'} >
											<InputNumber
												step={1000}
												placeholder={'Nhập số tiền....'}
												min={0}
												max={99999999}
												disabled={this.state.disableInput}
												maxLength={AppConsts.maxLength.cost}
												style={{ width: "100%" }}
												formatter={value => AppConsts.numberWithCommas(value)}
												parser={value => value!.replace(/\D/g, '')}

												onKeyPress={(e) => {
													if (!/[\d,.]/.test(e.key) && e.key !== 'Backspace') {
														e.preventDefault();
													}
												}}
											/>
										</Form.Item>
									</Col>
									<Col span={8}>
										<Form.Item label="Đơn vị tính" {...AppConsts.formItemLayout} name={"pr_unit"} rules={[rules.required]}>
											<SelectedUnit disable={this.state.disableInput} unitSelected={this.state.pr_unit} onChangeUnit={async (value) => await this.formRef.current!.setFieldsValue({ pr_unit: value ? value : undefined })}  ></SelectedUnit>
										</Form.Item>
										<Form.Item label="Ghi chú" {...AppConsts.formItemLayout} name={'pr_desc'} >
											<TextArea disabled={this.state.disableInput} placeholder={productSelected.pr_desc} readOnly={this.state.disableInput} rows={4} maxLength={255}></TextArea>
										</Form.Item>
									</Col>
								</Row>
								<Row justify='end'>
									{this.state.disableInput == true ?
										<Button type='primary' onClick={this.openEdit} icon={<EditOutlined />}>Cập nhật</Button>
										:
										<Space >
											<Button danger onClick={async () => { this.setState({ disableInput: true }); await this.formRef.current?.resetFields(); this.initData(this.props.productSelected); }} >Hủy</Button>
											<Button type='primary' onClick={this.onCreateUpdate} icon={<CheckOutlined />} >Lưu</Button>
										</Space>
									}
									{this.props.productSelected != undefined && this.props.productSelected.pr_is_active == true ?
										<Button style={{ marginLeft: 10 }} type='primary' icon={<LockOutlined />} onClick={() => this.activeOrDeactive(this.props.productSelected)} danger >Ngừng kinh doanh</Button>
										:
										<Button style={{ marginLeft: 10 }} type='primary' icon={<UnlockOutlined />} onClick={() => this.activeOrDeactive(this.props.productSelected)} color='success' >Cho phép kinh doanh</Button>
									}
								</Row>
							</Form>
						</>
					}
				</Row>
			</Card >
		)
	}
}