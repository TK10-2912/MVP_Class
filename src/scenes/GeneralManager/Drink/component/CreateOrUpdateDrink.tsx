import { PlusOutlined } from '@ant-design/icons';
import FileAttachmentsTest from '@src/components/FileAttachmentsTest';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import SelectedSupplier from '@src/components/Manager/SelectedSupplier';
import AppConsts from '@src/lib/appconst';
import { eMoney } from '@src/lib/enumconst';
import rules from '@src/scenes/Validation';
import { AttachmentItem, CreateDrinkInput, DrinkDto, UpdateDrinkInput } from '@src/services/services_autogen';
import { stores } from "@src/stores/storeInitializer";
import { Button, Card, Col, Form, Input, InputNumber, Row, message } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { RcFile } from 'antd/lib/upload';
import * as React from 'react';


export interface IProps {
	onCreateUpdateSuccess?: () => void;
	onCancel: () => void;
	drinkSelected: DrinkDto;
}

export default class CreateOrUpdateDrink extends AppComponentBase<IProps>{
	private formRef: any = React.createRef();
	state = {
		isLoadDone: false,
		dr_id: -1,
		dr_image: "",
	}
	drinkSelected: DrinkDto = new DrinkDto();
	fileUpload: any;
	fileAttachmentItem: AttachmentItem = new AttachmentItem();

	async componentDidMount() {
		this.initData(this.props.drinkSelected);
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.drinkSelected.dr_id !== prevState.dr_id) {
			return ({ dr_id: nextProps.drinkSelected.dr_id });
		}
		return null;
	}
	async componentDidUpdate(prevProps, prevState) {
		if (this.state.dr_id !== prevState.dr_id) {
			this.initData(this.props.drinkSelected);
		}
	}
	initData = async (drinkInput: DrinkDto | undefined) => {
		this.setState({ isLoadDone: false });
		if (drinkInput !== undefined && drinkInput.dr_id !== undefined) {
			this.fileAttachmentItem = drinkInput.dr_image != undefined ? drinkInput.dr_image : new AttachmentItem();
			this.drinkSelected = drinkInput!;
			this.getImage();
		} else {
			this.drinkSelected = new DrinkDto();
			this.drinkSelected.dr_desc = "";
		}
		if (this.drinkSelected.dr_id !== undefined) {
			this.setState({ dr_image: this.drinkSelected.dr_image });
		} else {
			this.setState({ dr_image: undefined });
		}
		this.formRef.current.setFieldsValue({ ...this.drinkSelected });
		this.setState({ isLoadDone: true });
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
		const { drinkSelected } = this.props;
		const form = this.formRef.current;
		form!.validateFields().then(async (values: any) => {
			if (drinkSelected.dr_id === undefined || drinkSelected.dr_id < 0) {
				let unitData = new CreateDrinkInput({ ...values });
				unitData.dr_image = this.fileAttachmentItem;
				await stores.drinkStore.createDrink(unitData)
				this.formRef.current.resetFields();
				message.success("Thêm mới thành công!")
				await this.onCreateUpdateSuccess();
			}
			else {
				let unitData = new UpdateDrinkInput({ dr_id: drinkSelected.dr_id, ...values });
				unitData.dr_image = this.fileAttachmentItem;
				await stores.drinkStore.updateDrink(unitData);
				message.success("Chỉnh sửa thành công!")
			}
			await stores.sessionStore.getCurrentLoginInformations();
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
	
	getBase64 = (img: RcFile, callback: (url: string) => void) => {
		const reader = new FileReader();
		reader.addEventListener('load', () => callback(reader.result as string));
		reader.readAsDataURL(img);
	};
	emtyAvatar = () => {
		this.setState({ isLoadDone: !this.state.isLoadDone, dr_image: undefined })
	}
	uploadImage = async (options) => {
		const { onSuccess, file } = options;
		if (!!file) {
			onSuccess("Done");
			this.getBase64(file as RcFile, url => {
				this.setState({ isLoadDone: true, dr_image: url })
			});
		}
	}
	beforeUpload = (file: RcFile) => {
		const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
		if (!isJpgOrPng) {
			message.error('Ảnh phải là tệp JPG/PNG!');
			return isJpgOrPng;
		}
		const limitSize = file.size / 1024 / 1024 < 0.2;
		if (!limitSize) {
			message.error('Ảnh phải nhỏ hơn 0.2MB!');
		}
		return limitSize;
	};
	render() {
		const { drinkSelected } = this.props;

		const uploadButton = (
			<div style={{ borderBlock: "1px" }}>
				<PlusOutlined />
				<div style={{ marginTop: 8 }}>Tải ảnh lên</div>
			</div>
		);

		return (
			<Card>
				<Row>
					<Col span={12}>
						<h3>
							{this.state.dr_id === undefined
								? "Thêm mới sản phẩm có bao bì"
								: "Thông tin " + drinkSelected.dr_name}
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
						<Form.Item label="Tên sản phẩm" {...AppConsts.formItemLayout} name={"dr_name"} rules={[rules.required, rules.noAllSpaces]}>
							<Input placeholder="Tên sản phẩm..." allowClear></Input>
						</Form.Item>
						<Form.Item label="Thông tin sản phẩm" {...AppConsts.formItemLayout} name={"dr_desc"}>
							<TextArea placeholder="Thông tin sản phẩm..." allowClear rows={4}></TextArea>
						</Form.Item>
						<Form.Item label="Nhà cung cấp" {...AppConsts.formItemLayout} name={"su_id"} rules={[rules.required]}>
							<SelectedSupplier
								supplierID={drinkSelected.su_id != 0 ? drinkSelected.su_id : undefined}
								onChangeSupplier={(value) => { this.formRef.current!.setFieldsValue({ su_id: value }) }}
							></SelectedSupplier>
						</Form.Item>
						<Form.Item label="Giá thành (VNĐ)" {...AppConsts.formItemLayout} name={"dr_price"} rules={[rules.messageForNumber]}>
							<InputNumber
								placeholder='Giá thành (VNĐ)'
								style={{ width: '50%' }}
								step={1000}
								min={0}
								max={eMoney.NAM_CHUC.num}
								maxLength={AppConsts.maxLength.price}
								formatter={value => AppConsts.numberWithCommas(value)}
								parser={value => value!.replace(/\D/g, '')}
								onKeyPress={(e) => {
									if (!/[\d,.]/.test(e.key) && e.key !== 'Backspace') {
										e.preventDefault();
									}
								}}
							/>
						</Form.Item>
						<Form.Item label="Ảnh" {...AppConsts.formItemLayout} name={"dr_image"} >
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
			</Card>
		)
	}
}
