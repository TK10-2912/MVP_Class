import { AttachmentItem, CreateProductInput, FileParameter, ProductDto } from '@src/services/services_autogen';
import * as React from 'react';
import { stores } from "@src/stores/storeInitializer";
import { Button, Card, Col, Form, Image, Input, InputNumber, Row, message } from 'antd';
import AppConsts, { FileUploadType } from '@src/lib/appconst';
import rules from '@src/scenes/Validation';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import FileAttachmentsTest from '@src/components/FileAttachmentsTest';
import SelectedUnit from '@src/components/Manager/SelectedUnit';
import { CheckOutlined, EditOutlined, LockOutlined } from '@ant-design/icons';
import SelectedSupplier from '@src/components/Manager/SelectedSupplier';
import TextArea from 'antd/lib/input/TextArea';
import FileAttachmentsImages from '@src/components/FileAttachmentsImages';

export interface IProps {
	onCreateUpdateSuccess?: () => void;
	onCancel?: () => void;
	productSelected: ProductDto;
	layoutDetail: boolean;
}
export default class CreateOrUpdateProduct extends AppComponentBase<IProps>{
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

	async componentDidMount() {
		this.setState({ isLoadDone: false });
		await this.initData(this.props.productSelected);
		this.setState({ isLoadDone: true });
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
				// console.log("co khong",this.fileUpload);

			}
			if (productInput.pr_unit != undefined) {
				this.setState({ pr_unit: productInput.pr_unit })
			}
			if (productInput.su_id != undefined) {
				this.setState({ su_id: productInput.su_id })

			}
			this.formRef.current!.setFieldsValue(productInput);
			this.setState({ isLoadDone: !this.state.isLoadDone });
		} else {
			this.setState({ pr_unit: undefined })
			this.fileAttachmentItem[0] = new AttachmentItem();
			await this.getImage();
			//  this.fileUpload = undefined;
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
	onCreateUpdate = () => {
		const { productSelected } = this.props;
		const form = this.formRef.current;
		form!.validateFields().then(async (values: any) => {
			if (productSelected.pr_id === undefined || productSelected.pr_id < 0) {
				let unitData = new CreateProductInput({ ...values });
				this.fileAttachmentItem[0].isdelete = false;
				unitData.fi_id = this.fileAttachmentItem[0];
				// let file : FileParameter = {
				// 	data: this.fileAttachmentItem[0],
				// 	fileName: this.fileAttachmentItem[0].key!
				// }
				// await stores.imageProductStore.createFile(1,file)
				await stores.productStore.createProduct(unitData);
				message.success("Thêm mới thành công!");
				this.formRef.current.resetFields();

			}
			await stores.sessionStore.getCurrentLoginInformations();
			await this.onCreateUpdateSuccess();
			this.setState({ isLoadFile: !this.state.isLoadFile, isLoadDone: true });
		})
	};
	openEdit = async () => {
		await this.setState({ isLoadDone: false, disableInput: false });
		await this.setState({ isLoadDone: true })
	}
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
	}
	componentWillUnmount() {
		this.setState = (state, callback) => {
			return;
		};
	}

	render() {
		const self = this;
		const { productSelected } = this.props;
		return (
			<Card>
				{this.props.layoutDetail == false &&
					<Row>
						<Col span={12}>
							<h3>
								{this.state.pr_id === undefined
									? "Thêm mới sản phẩm"
									: "Thông tin " + productSelected.pr_name}
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
				}

				<Row>
					{this.props.layoutDetail == false ?

						<Form ref={this.formRef} style={{ width: '100%' }}>
							<Form.Item label="Tên sản phẩm" {...AppConsts.formItemLayout} name={"pr_name"} rules={[rules.required, rules.noAllSpaces, rules.gioi_han_ten]}>
								<Input placeholder='Nhập tên sản phẩm...' allowClear></Input>
							</Form.Item>
							<Form.Item label={'Tiền sản phẩm(VNĐ)'} {...AppConsts.formItemLayout} rules={[rules.messageForNumber]} name={'pr_price'} >
								<InputNumber
									step={1000}
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
							<Form.Item label="Loại sản phẩm" {...AppConsts.formItemLayout} name={"pr_type"} rules={[rules.required]}>
								<Input placeholder='Nhập loại sản phẩm...' allowClear></Input>
							</Form.Item>
							<Form.Item label="Đơn vị tính" {...AppConsts.formItemLayout} name={"pr_unit"} rules={[rules.required]}>
								<SelectedUnit unitSelected={this.state.pr_unit} onChangeUnit={async (value) => await this.formRef.current!.setFieldsValue({ pr_unit: value })}  ></SelectedUnit>
							</Form.Item>
							<Form.Item label="Nhà cung cấp" {...AppConsts.formItemLayout} name={"su_id"} rules={[rules.required]}>
								<SelectedSupplier supplierID={this.state.su_id} onChangeSupplier={async (value) => await this.formRef.current!.setFieldsValue({ su_id: value })}  ></SelectedSupplier>
							</Form.Item>
							<Form.Item label="Ảnh sản phẩm" {...AppConsts.formItemLayout} rules={[rules.required]} name={"fi_id_list"} >
								<FileAttachmentsImages
									files={self.fileAttachmentItem}
									isLoadFile={this.state.isLoadDone}
									allowRemove={true}
									isMultiple={false}
									componentUpload={FileUploadType.Avatar}
									onSubmitUpdate={async (itemFile: AttachmentItem[]) => {
										self.fileAttachmentItem = itemFile;
										await this.formRef.current!.setFieldsValue({ fi_id_list: itemFile });
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
										<Image className='no-print imageDetailProduct' src={(productSelected.fi_id != undefined && productSelected.fi_id.id != undefined) ? this.getFile(productSelected.fi_id.id) : AppConsts.appBaseUrl + "/image/no_image.jpg"} alt='No image available' />
									</Col>
									<Col span={8}>
										<Form.Item label="Mã sản phẩm" {...AppConsts.formItemLayout} name={"pr_code"} >
											<label>{productSelected.pr_code}</label>
										</Form.Item>
										<Form.Item label="Tên sản phẩm" {...AppConsts.formItemLayout} name={"pr_name"} rules={[rules.required, rules.noAllSpaces]}>
											<Input readOnly placeholder='Nhập tên sản phẩm...' allowClear></Input>
										</Form.Item>
										<Form.Item label={'Tiền sản phẩm(VNĐ)'} {...AppConsts.formItemLayout} rules={[rules.messageForNumber]} name={'pr_price'} >
											<InputNumber
												step={1000}
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
												readOnly
											/>
										</Form.Item>
										<Form.Item label="Loại sản phẩm" {...AppConsts.formItemLayout} name={"pr_type"} rules={[rules.required]}>
											<Input readOnly placeholder='Nhập loại sản phẩm...' allowClear></Input>
										</Form.Item>

									</Col>
									<Col span={8}>
										<Form.Item label="Đơn giá" {...AppConsts.formItemLayout} name={"pr_unit"} rules={[rules.required]}>
											<SelectedUnit disable={this.state.disableInput} unitSelected={this.state.pr_unit} onChangeUnit={async (value) => await this.formRef.current!.setFieldsValue({ pr_unit: value })}  ></SelectedUnit>
										</Form.Item>
										<Form.Item label="Nhà cung cấp" {...AppConsts.formItemLayout} name={"su_id"} rules={[rules.required]}>
											<SelectedSupplier disable={this.state.disableInput} supplierID={this.state.su_id} onChangeSupplier={async (value) => await this.formRef.current!.setFieldsValue({ su_id: value })}  ></SelectedSupplier>
										</Form.Item>
										<Form.Item label="Ghi chú" {...AppConsts.formItemLayout} name={'pr_desc'} >
											<TextArea placeholder="Ghi chú..." allowClear readOnly rows={4}></TextArea>
										</Form.Item>
									</Col>
								</Row>
								<Row justify='end'>
									<Button style={{ marginLeft: 10 }} type='primary' icon={<LockOutlined />} danger >Ngưng hoạt động</Button>
								</Row>
							</Form>
						</>
					}
				</Row>
			</Card >
		)
	}
}