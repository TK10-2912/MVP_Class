import { MinusCircleOutlined } from '@ant-design/icons';
import FileAttachmentsImages from '@src/components/FileAttachmentsImages';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import SelectedProduct from '@src/components/Manager/SelectedProduct';
import SelectedSupplier from '@src/components/Manager/SelectedSupplier';
import AppConsts, { FileUploadType } from '@src/lib/appconst';
import rules from '@src/scenes/Validation';
import { AttachmentItem, CreateImportRepositoryInput, CreateProductInput, ImportRepositoryDto, ProductImportDto } from '@src/services/services_autogen';
import { stores } from "@src/stores/storeInitializer";
import { Button, Card, Col, DatePicker, Form, Input, InputNumber, Row, Space, message } from 'antd';
import confirm from 'antd/lib/modal/confirm';
import moment, { Moment } from 'moment';
import * as React from 'react';

export interface IProps {
	onCreateUpdateSuccess?: () => void;
	onCancel: () => void;
	importRepositorySelected: ImportRepositoryDto;
}

export default class CreateImportRepositoryUser extends AppComponentBase<IProps> {
	private formRef: any = React.createRef();

	state = {
		isLoadDone: false,
		im_re_id: -1,
		im_re_create_at: moment(),
		su_id: undefined,
		count: 0,
	};

	importRepositorySelected: ImportRepositoryDto = new ImportRepositoryDto();
	fileUpload: any;
	productListImport: ProductImportDto[] = [];
	listAttachmentItem_file: AttachmentItem[] = [];

	// async componentDidMount() {
	// 	this.initData(this.props.importRepositorySelected);
	// }

	// static getDerivedStateFromProps(nextProps, prevState) {
	// 	if (nextProps.importRepositorySelected.im_re_id !== prevState.im_re_id) {
	// 		return ({ im_re_id: nextProps.importRepositorySelected.im_re_id });
	// 	}
	// 	return null;
	// }

	// async componentDidUpdate(prevProps, prevState) {
	// 	if (this.state.im_re_id !== prevState.im_re_id) {
	// 		this.initData(this.props.importRepositorySelected);
	// 	}
	// }

	// initData = async (importRepositorySelected: ImportRepositoryDto | undefined) => {
	// 	console.log("aaaaa", importRepositorySelected);

	// 	this.setState({ isLoadDone: false });

	// 	const form = this.formRef.current;
	// 	if (importRepositorySelected !== undefined && importRepositorySelected.im_re_id !== undefined) {
	// 		this.importRepositorySelected = importRepositorySelected;
	// 		this.listAttachmentItem_file = importRepositorySelected.fi_id_list != undefined ? importRepositorySelected.fi_id_list : [];
	// 		this.setState({ su_id: importRepositorySelected.su_id });
	// 		this.formRef.current.setFieldsValue({ ...this.importRepositorySelected });
	// 		if (importRepositorySelected.listProductImport != undefined && importRepositorySelected.listProductImport.length > 0) {
	// 			form!.validateFields().then(async (values: any) => {
	// 				values.listProductImport.forEach((element, index) => {
	// 					this.setState({ isLoadDone: false })
	// 					importRepositorySelected?.listProductImport?.forEach((product, productIndex) => {
	// 						this.setState({ isLoadDone: false })
	// 						if (productIndex === index) {
	// 							element.pr_im_name = product.pr_im_name;
	// 							element.pr_im_total_money = product.pr_im_total_money;
	// 							element.pr_im_quantity = product.pr_im_quantity;
	// 						}
	// 					});
	// 					this.setState({ isLoadDone: true })
	// 				});
	// 			});
	// 		}
	// 		else if (importRepositorySelected.im_re_created_at != undefined) {
	// 			this.setState({ im_re_create_at: importRepositorySelected.im_re_created_at })
	// 		}
	// 	}
	// 	else {
	// 		this.importRepositorySelected = new ImportRepositoryDto();
	// 		this.setState({ su_id: undefined, im_re_create_at: undefined })
	// 		this.formRef.current.setFieldsValue({ ...this.importRepositorySelected});
	// 		const formValues = this.formRef.current.getFieldsValue();
	// 	}
	// 	this.setState({ isLoadDone: true });
	// }

	onCreateUpdate = () => {
		const { importRepositorySelected } = this.props;
		const form = this.formRef.current;
		let self = this;
		form!.setFieldsValue({ fi_id_list: self.listAttachmentItem_file, product_list: this.state.count > 0 ? this.state.count : undefined });
		form!.validateFields().then(async (values: any) => {

			try {
				let unitData = new CreateImportRepositoryInput({ ...values });
				if (values.listProductImport != undefined) {
					values.listProductImport.forEach((element, index) => {
						let product: ProductImportDto = new ProductImportDto();
						product.pr_im_no = index + 1;
						product.pr_im_name = element.pr_im_name;
						product.pr_im_total_money = Number(element.pr_im_total_money);
						product.pr_im_unit = element.pr_im_unit;
						product.pr_im_quantity = Number(element.pr_im_quantity);
						product.pr_im_unit_price = Number(element.pr_im_unit_price);
						this.productListImport.push(product);
					});
				}
				unitData.im_re_imported_at = this.state.im_re_create_at.toDate();
				unitData.fi_id_list = this.listAttachmentItem_file;
				unitData.listProductImport = this.productListImport;
				self.setState({ isLoadDone: true });
				await stores.importRepositoryStore.createImportRepository(unitData);
				if (!!unitData.listProductImport) {
					// await stores.productStore.createProduct(unitData.listProductImport.map(a => CreateProductInput.fromJS({ pr_name: a.pr_im_name })));
				}
				self.formRef.current.resetFields();
				await self.onCreateUpdateSuccess();
				message.success("Thêm mới thành công!");
				self.setState({ isLoadDone: false });
				this.setState({ isLoadDone: true });
			} catch (error) {
				console.error('Error:', error);
				message.error("Có lỗi xảy ra!");
			}
		}).catch(errorInfo => {
			console.log('Validate Failed:', errorInfo);
		});
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

	onChangeStartDate = async (date: Moment | null) => {
		if (date && moment.isMoment(date)) {
			await this.setState({ im_re_create_at: date });
			await this.formRef.current.setFieldsValue({ im_re_create_at: date });
		}
	}
	createNewMoment = (date: Moment) => {
		return moment(date, "DD/MM/YYYY");
	}

	render() {
		const self = this;
		return (
			<Card>
				<Row>
					<Col span={12}>
						<h3>
							{"Thêm mới nhập kho"}
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
						<Form.Item label="Mã nhập" rules={[rules.required]} {...AppConsts.formItemLayout} name={"im_re_code"}>
							<Input placeholder='Hãy nhập mã....' />
						</Form.Item>
						<Form.Item label="Nhà cung cấp" {...AppConsts.formItemLayout} name={"su_id"} rules={[rules.required]}>
							<SelectedSupplier
								supplierID={this.state.su_id}
								onChangeSupplier={(value: number | undefined) => {
									this.formRef.current!.setFieldsValue({ su_id: value });
								}} />
						</Form.Item>
						<Form.Item label={'Ngày xuất hóa đơn'} rules={[rules.required]} {...AppConsts.formItemLayout} name={'im_re_create_at'}>
							<DatePicker
								allowClear={false}
								onChange={async (date: Moment | null, dateString: string) => await this.onChangeStartDate(date)}
								format={"DD/MM/YYYY"}
								disabledDate={(current) => current ? current >= moment().endOf('day') : false}
							/>
						</Form.Item>
						<Form.Item label="Nhập sản phẩm" rules={[rules.required]} name={"product_list"} {...AppConsts.formItemLayout}>
							<Form.List name="listProductImport">
								{(fields, { add, remove }) => (
									<>
										{fields.map(({ key, name, ...restField }) => (
											<div key={key}>
												<Row gutter={16}>
													<Col span={12}>
														{/* <Form.Item
															{...restField}
															name={[name, 'pr_im_name']}
															rules={[rules.required]}
														>
															<SelectedProduct onChangeProduct={(value: number | undefined) => {
																const listProductImport = this.formRef.current!.getFieldValue('listProductImport') || [];
																listProductImport[name] = { ...listProductImport[name], pr_im_name: stores.sessionStore.getNameProduct(value != undefined ? value : -1) };
																this.formRef.current!.setFieldsValue({ listProductImport });
															}} />
														</Form.Item> */}
														<Form.Item
															{...restField}
															name={[name, 'pr_im_name']}
															rules={[{ required: true, message: 'Không được để trống!' }]}
														>
															<Input placeholder='Tên sản phẩm....' />
														</Form.Item>
													</Col>
													<Col span={12}>
														<Form.Item
															{...restField}
															name={[name, 'pr_im_unit']}
															rules={[{ required: true, message: 'Bạn phải nhập đơn vị tính' }]}
														>
															<Input placeholder='Đơn vị tính....' />
														</Form.Item>
													</Col>
												</Row>
												<Row gutter={16}>
													<Col span={8}>
														<Form.Item
															{...restField}
															name={[name, 'pr_im_quantity']}
															rules={[{ required: true, message: 'Bạn phải nhập số lượng' }]}>
															<InputNumber
																placeholder='Số lượng...'
																min={0}
																maxLength={4}
																style={{ width: '100%' }}
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
														<Form.Item
															{...restField}
															name={[name, 'pr_im_total_money']}
															rules={[{ required: true, message: 'Bạn phải nhập tổng tiền sản phẩm' }]}
														>
															<InputNumber
																step={1000}
																placeholder='Tổng tiền sản phẩm...'
																min={0}
																maxLength={12}
																style={{ width: '100%' }}
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
													<Col span={7}>
														<Form.Item
															{...restField}
															name={[name, 'pr_im_unit_price']}
															rules={[{ required: true, message: 'Bạn phải nhập đơn giá' }]}
														>
															<InputNumber
																step={1000}
																placeholder='Đơn giá...'
																min={0}
																maxLength={12}
																style={{ width: '100%' }}
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
													<Col span={1}>
														<Form.Item
															{...restField}
															name={[name, 'delete']}
														>
															<MinusCircleOutlined onClick={async () => { remove(name); await this.setState({ count: this.state.count - 1 }) }} />
														</Form.Item>
													</Col>
												</Row>
											</div>
										))}
										<Form.Item style={{ width: '67%' }}>
											<Button type="dashed" onClick={async () => { add(); await this.setState({ count: this.state.count + 1 }) }} block>
												Thêm sản phẩm
											</Button>
										</Form.Item>
									</>
								)}
							</Form.List>
						</Form.Item>
						<Form.Item label="Tổng tiền" {...AppConsts.formItemLayout} rules={[rules.required]} name={"im_re_total_money"}>
							<InputNumber
								step={1000}
								placeholder='Tổng tiền...'
								min={0}
								maxLength={15}
								style={{ width: '100%' }}
								formatter={value => AppConsts.numberWithCommas(value)}
								parser={value => value!.replace(/\D/g, '')}
								onKeyPress={(e) => {
									if (!/[\d,.]/.test(e.key) && e.key !== 'Backspace') {
										e.preventDefault();
									}
								}}
							/>
						</Form.Item>
						<Form.Item label="Ảnh" {...AppConsts.formItemLayout} rules={[rules.required]} name={"fi_id_list"} >
							<FileAttachmentsImages
								files={self.listAttachmentItem_file}
								isLoadFile={this.state.isLoadDone}
								allowRemove={true}
								isMultiple={true}
								componentUpload={FileUploadType.Avatar}
								onSubmitUpdate={async (itemFile: AttachmentItem[]) => {
									self.listAttachmentItem_file = itemFile;
									await this.formRef.current!.setFieldsValue({ fi_id_list: itemFile });
								}}
							/>
						</Form.Item>
					</Form>
				</Row>
			</Card>
		)
	}
}
