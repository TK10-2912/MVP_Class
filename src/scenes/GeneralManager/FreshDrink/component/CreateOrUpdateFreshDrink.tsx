import { AttachmentItem, CreateFreshDrinkInput, FreshDrinkDto, UpdateFreshDrinkInput } from '@src/services/services_autogen';
import * as React from 'react';
import { stores } from "@src/stores/storeInitializer";
import { Button, Card, Col, Form, Input, InputNumber, Row, message, Upload } from 'antd';
import AppConsts, { FileUploadType } from '@src/lib/appconst';
import SelectedSupplier from '@src/components/Manager/SelectedSupplier';
import { UploadChangeParam, UploadProps } from 'antd/lib/upload';
import { RcFile, UploadFile } from 'antd/lib/upload/interface';
import { PlusOutlined } from '@ant-design/icons';
import rules from '@src/scenes/Validation';
import { eMoney } from '@src/lib/enumconst';
import FileAttachments from '@src/components/FileAttachments';
import FileAttachmentsTest from '@src/components/FileAttachmentsTest';
import AppComponentBase from '@src/components/Manager/AppComponentBase';

export interface IProps {
	onCreateUpdateSuccess?: () => void;
	onCancel: () => void;
	freshDrinkSelected: FreshDrinkDto;
}
export default class CreateOrUpdateFreshDrink extends AppComponentBase<IProps>{
	private formRef: any = React.createRef();
	state = {
		isLoadDone: false,
		isLoadFile: false,
		fr_dr_id: -1,
		fr_dr_image: "",
		fr_dr_capacity: undefined,
		fr_dr_price: undefined,
	}
	fileUpload: any;
	fileAttachmentItem: AttachmentItem = new AttachmentItem();
	freshDrinkSelected: FreshDrinkDto;

	async componentDidMount() {
		this.initData(this.props.freshDrinkSelected);
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.freshDrinkSelected.fr_dr_id !== prevState.fr_dr_id) {
			return ({ fr_dr_id: nextProps.freshDrinkSelected.fr_dr_id });
		}
		return null;
	}

	async componentDidUpdate(prevProps, prevState) {
		if (this.state.fr_dr_id !== prevState.fr_dr_id) {
			this.initData(this.props.freshDrinkSelected);
		}
	}

	initData = async (drinkInput: FreshDrinkDto | undefined) => {
		this.setState({ isLoadDone: false });
		if (drinkInput !== undefined && drinkInput.fr_dr_id !== undefined) {
			this.fileAttachmentItem = drinkInput.fr_dr_image != undefined ? drinkInput.fr_dr_image : new AttachmentItem();
			this.freshDrinkSelected = drinkInput!;
			this.getImage();
		} else {
			this.freshDrinkSelected = new FreshDrinkDto();
		}
		await this.setState({ fr_dr_capacity: this.freshDrinkSelected.fr_dr_capacity });
		if (this.freshDrinkSelected.fr_dr_id !== undefined) {
			this.formRef.current.setFieldsValue({ ...this.freshDrinkSelected });
		} else {
			this.formRef.current!.resetFields();
		}
		this.setState({ isLoadDone: true, isLoadFile: true });
	}
	async getImage() {
		this.fileUpload = {
			uid: this.fileAttachmentItem.id + "",
			name: 'image.png',
			status: 'done',
			url: this.getFile(this.fileAttachmentItem.id),
		};
	}
	onCreateUpdate = () => {
		const { freshDrinkSelected } = this.props;
		const form = this.formRef.current;
		form!.validateFields().then(async (values: any) => {
			if (freshDrinkSelected.fr_dr_id === undefined || freshDrinkSelected.fr_dr_id < 0) {
				let unitData = new CreateFreshDrinkInput({ ...values });
				unitData.fr_dr_image = this.fileAttachmentItem;
				await stores.freshDrinkStore.createFreshDrink(unitData);
				message.success("Thêm mới thành công!");
				this.formRef.current.resetFields();

			}
			else {
				let unitData = new UpdateFreshDrinkInput({ fr_dr_id: freshDrinkSelected.fr_dr_id, ...values });
				unitData.fr_dr_image = this.fileAttachmentItem;
				await stores.freshDrinkStore.updateFreshDrink(unitData);
				message.success("Chỉnh sửa thành công!");
			}
			await stores.sessionStore.getCurrentLoginInformations();
			await this.onCreateUpdateSuccess();
			this.setState({ isLoadDone: true, isLoadFile: true });
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
	}
	getBase64 = (img: RcFile, callback: (url: string) => void) => {
		const reader = new FileReader();
		reader.addEventListener('load', () => callback(reader.result as string));
		reader.readAsDataURL(img);
	};
	componentWillUnmount() {
		this.setState = (state, callback) => {
			return;
		};
	}

	render() {
		const self = this;
		const { freshDrinkSelected } = this.props;
		return (
			<Card>
				<Row>
					<Col span={12}>
						<h3>
							{this.state.fr_dr_id === undefined
								? "Thêm mới sản phẩm không có bao bì"
								: "Thông tin " + freshDrinkSelected.fr_dr_name}
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

						<Form.Item label="Tên sản phẩm" {...AppConsts.formItemLayout} name={"fr_dr_name"} rules={[rules.required, rules.noAllSpaces]}>
							<Input placeholder='Nhập tên sản phẩm...' allowClear></Input>
						</Form.Item>
						<Form.Item label="Dung tích (ml)" {...AppConsts.formItemLayout} name={"fr_dr_capacity"} rules={[rules.messageForNumber]}>
							<InputNumber
								step={1000}
								placeholder='Nhập dung tích...'
								min={0}
								style={{ width: '100%' }}
								maxLength={AppConsts.maxLength.price}
								formatter={value => AppConsts.numberWithCommas(value)}
								// Loại bỏ các ký tự không phải số
								parser={value => value!.replace(/\D/g, '')}
								// Chỉ cho phép nhập số và các ký tự liên quan
								onKeyPress={(e) => {
									if (!/[\d,.]/.test(e.key) && e.key !== 'Backspace') {
										e.preventDefault();
									}
								}}
							/>
						</Form.Item>
						<Form.Item label="Nhà cung cấp" {...AppConsts.formItemLayout} name={"su_id"}>
							<SelectedSupplier
								supplierID={this.props.freshDrinkSelected.su_id > 0 ? this.props.freshDrinkSelected.su_id : undefined}
								onChangeSupplier={(value) => (<>
									{this.props.freshDrinkSelected.fr_dr_is_deleted == true ? "Nhà cung cấp đã bị xóa" :
										this.formRef.current!.setFieldsValue({ su_id: value })}
								</>)}
							></SelectedSupplier>
						</Form.Item>
						<Form.Item label="Giá thành (VNĐ)" {...AppConsts.formItemLayout} name={"fr_dr_price"} rules={[rules.messageForNumber]}>
							<InputNumber
								placeholder='Giá thành (VNĐ)'
								style={{ width: '50%' }}
								step={1000}
								min={0}
								max={eMoney.NAM_CHUC.num}
								maxLength={AppConsts.maxLength.price}
								formatter={value => AppConsts.numberWithCommas(value)}
								// Loại bỏ các ký tự không phải số
								parser={value => value!.replace(/\D/g, '')}
								// Chỉ cho phép nhập số và các ký tự liên quan
								onKeyPress={(e) => {
									if (!/[\d,.]/.test(e.key) && e.key !== 'Backspace') {
										e.preventDefault();
									}
								}}
							/>
						</Form.Item>
						<Form.Item label="Ảnh" {...AppConsts.formItemLayout} >
							<FileAttachmentsTest
								onSubmitUpdate={(fileAttachmentItem: AttachmentItem) => this.fileAttachmentItem = fileAttachmentItem}
								file={this.fileUpload}
								lengthUpload={1}
								isMultiple={false}
								checkSize={(input) => this.setState({ checkSize: input })}
							/>
						</Form.Item>

					</Form>
				</Row>
			</Card >
		)
	}
}