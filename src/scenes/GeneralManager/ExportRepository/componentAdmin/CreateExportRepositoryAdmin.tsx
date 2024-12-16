import { MinusCircleOutlined } from '@ant-design/icons';
import FileAttachments from '@src/components/FileAttachments';
import FileAttachmentsImages from '@src/components/FileAttachmentsImages';
import FileAttachmentsTest from '@src/components/FileAttachmentsTest';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import SelectedMachine from '@src/components/Manager/SelectedMachine';
import SelectedRepository from '@src/components/Manager/SelectedRepository';
import SelectedSupplier from '@src/components/Manager/SelectedSupplier';
import AppConsts, { FileUploadType } from '@src/lib/appconst';
import rules from '@src/scenes/Validation';
import { AttachmentItem, CreateExportRepositoryInput, CreateImportRepositoryInput, ExportRepositoryDto, ImportRepositoryDto, ProductExportDto, ProductImportDto } from '@src/services/services_autogen';
import { stores } from "@src/stores/storeInitializer";
import { Button, Card, Col, DatePicker, Form, Input, InputNumber, Row, Space, message } from 'antd';
import confirm from 'antd/lib/modal/confirm';
import { log } from 'console';
import moment, { Moment } from 'moment';
import * as React from 'react';

export interface IProps {
	onCreateUpdateSuccess?: () => void;
	onCancel: () => void;
	exportRepositorySelected: ExportRepositoryDto;
}

export default class CreateExportRepositoryAdmin extends AppComponentBase<IProps> {
	private formRef: any = React.createRef();

	state = {
		isLoadDone: false,
		im_re_id: -1,
		im_re_create_at: moment(),
		su_id: undefined,
		dr_id: undefined,
		ma_id: undefined,
		count: 0,
	};

	exportRepositorySelected: ExportRepositoryDto = new ExportRepositoryDto();
	fileUpload: any;
	productListExport: ProductExportDto[] = [];
	listAttachmentItem_file: AttachmentItem[] = [];
	async componentDidMount() {
		this.setState({ isLoadDone: true });
		await stores.repositoryStore.getAll(undefined, undefined, undefined);
		this.setState({ isLoadDone: false });
	}
	onCreateUpdate = () => {
		const form = this.formRef.current;
		let self = this;
		form!.setFieldsValue({ fi_id_list: self.listAttachmentItem_file, ma_id: self.state.ma_id, product_list: this.state.count > 0 ? this.state.count : undefined });
		form!.validateFields().then(async (values: any) => {
			try {
				let unitData = new CreateExportRepositoryInput({ ...values });
				if (values.listProductExport != undefined) {
					values.listProductExport.forEach((element, index) => {
						let product: ProductExportDto = new ProductExportDto();
						product.pr_ex_no = index + 1;
						product.pr_ex_name = element.pr_ex_name;
						product.pr_ex_sell_money = element.pr_ex_sell_money;
						product.pr_ex_unit = element.pr_ex_unit;
						product.pr_ex_quantity = Number(element.pr_ex_quantity);
						this.productListExport.push(product);
					});
				}
				unitData.ma_id = this.state.ma_id!;
				unitData.fi_id_list = this.listAttachmentItem_file;
				unitData.listProductExport = this.productListExport;
				confirm({
					title: ('Hãy chắc chắn thông tin bạn nhập là đúng!'),
					okText: ('Xác nhận'),
					cancelText: ('Huỷ'),
					async onOk() {
						self.setState({ isLoadDone: true });
						await stores.exportRepositoryStore.createExportRepository(unitData);
						self.formRef.current.resetFields();
						await self.onCreateUpdateSuccess();
						message.success("Thêm mới thành công!");
						self.setState({ isLoadDone: false });
					},
				});
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
	render() {
		const self = this;
		const { repositoryListResult } = stores.repositoryStore;
		console.log(this.state.count);

		return (
			<Card>
				<Row>
					<Col span={12}>
						<h3>{"Thêm mới xuất kho lưu trữ"}</h3>
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
						<Form.Item label="Máy bán nước" {...AppConsts.formItemLayout} rules={[rules.required]} name={"ma_id"} >
							<SelectedMachine
								machineId={this.state.ma_id}
								onChangeMachine={(value) => this.setState({ ma_id: value })} />
						</Form.Item>
						<Form.Item label="Chọn sản phẩm" rules={[rules.required]} name={"product_list"} {...AppConsts.formItemLayout}>
							<Form.List name="listProductExport">
								{(fields, { add, remove }) => (
									<>
										{fields.map(({ key, name, ...restField }) => (
											<div key={key}>
												<Row gutter={16}>
													<Col span={24}>
														<Form.Item
															{...restField}
															name={[name, 'pr_ex_name']}
															rules={[{ required: true, message: 'Bạn phải nhập sản phẩm' }]}
														>
															<SelectedRepository
																listProductExport={this.formRef.current!.getFieldValue('listProductExport').map(item => item != undefined ? item.pr_ex_name : "")}
																onChangeRepository={async (value: number | undefined) => {
																	const listProductExport = this.formRef.current!.getFieldValue('listProductExport') || [];
																	let repositoryItem = repositoryListResult.filter(item => item.re_id == value);
																	listProductExport[name] = { ...listProductExport[name], pr_ex_name: repositoryItem[0].pr_name, pr_stock: repositoryItem[0].pr_quantity };
																	this.formRef.current!.setFieldsValue({ listProductExport });
																}} />
														</Form.Item>
													</Col>
												</Row>
												<Row gutter={16}>
													<Col span={8}>
														<Form.Item
															{...restField}
															name={[name, 'pr_ex_quantity']}
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
															name={[name, 'pr_ex_total_money']}
															rules={[{ required: true, message: 'Bạn phải nhập giá' }]}
														>
															<InputNumber
																step={1000}
																placeholder='Giá thành...'
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
															name={[name, 'pr_ex_unit']}
															rules={[{ required: true, message: 'Bạn phải nhập đơn giá' }]}
														>
															<Input placeholder='Đơn vị tính....' />
														</Form.Item>
													</Col>
													<Col span={1}>
														<MinusCircleOutlined onClick={async () => { remove(name); await this.setState({ count: this.state.count - 1 }) }} />
													</Col>
												</Row>
											</div>
										))}
										<Form.Item style={{ width: '67%' }}>
											<Button type="dashed" onClick={async () => {
												add(); await this.setState({ count: this.state.count + 1 });
											}} block>
												Thêm sản phẩm
											</Button>
										</Form.Item>
									</>
								)}
							</Form.List>
						</Form.Item>
						<Form.Item label="Ảnh" {...AppConsts.formItemLayout} name={"fi_id_list"} rules={[rules.required]} >
							<FileAttachmentsImages
								files={self.listAttachmentItem_file}
								isLoadFile={this.state.isLoadDone}
								allowRemove={true}
								isMultiple={true}
								componentUpload={FileUploadType.Avatar}
								onSubmitUpdate={async (itemFile: AttachmentItem[]) => {
									self.listAttachmentItem_file = itemFile;
								}}
							/>
						</Form.Item>
					</Form>
				</Row>
			</Card>
		)
	}
}
