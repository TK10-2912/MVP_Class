import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { L } from "@src/lib/abpUtility";
import AppConsts from "@src/lib/appconst";
import rules from "@src/scenes/Validation";
import { CreateDiscountCodeInput, DiscountCodeDto, UpdateDiscountCodeInput } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import { Button, Card, Checkbox, Col, DatePicker, Form, Input, InputNumber, Row, Tree, message } from "antd";
import moment, { Moment } from "moment";
import React from "react";
export interface IProps {
	onCancel?: () => void;
	createSuccess?: () => void;
	discountCodeSelected?: DiscountCodeDto,
	disable?: boolean;
}
const { TreeNode } = Tree;

export default class CreateOrUpdateDiscountCodeUser extends React.Component<IProps>{
	private formRef: any = React.createRef();

	state = {
		isLoadDone: false,
		idSelected: -1,
		isActive: false,
		dateCreate: undefined,
		di_start_at: moment(),
		di_end_at: moment(),
		desc: undefined,
		selectedValues: [],

	}
	disCountCode: DiscountCodeDto = new DiscountCodeDto()
	async componentDidMount() {
		await stores.groupMachineStore.getAll(undefined, undefined, undefined);
		await this.setState({ isLoadDone: false, borrowEndDate: this.createNewMoment(this.state.di_start_at) });
		this.initData(this.props.discountCodeSelected!);
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.discountCodeSelected !== undefined && nextProps.discountCodeSelected.di_id !== prevState.idSelected) {
			return ({ idSelected: nextProps.discountCodeSelected.di_id });
		}
		return null;
	}

	initData = async (input: DiscountCodeDto) => {
		this.setState({ isLoadDone: false });
		await stores.groupMachineStore.getAll(undefined, undefined, undefined);
		if (input.di_id !== undefined) {
			this.setState({ isActive: input.di_active })
			if (input.di_start_at !== undefined) {
				this.setState({ di_start_at: moment(input.di_start_at, "DD/MM/YYYY") });
			}
			if (input.di_end_at !== undefined) {
				this.setState({ di_end_at: moment(input.di_end_at, "DD/MM/YYYY") });
			}
			if (input.di_desc === null) {
				input.di_desc = "";
			}
			if (input.ma_id_list !== undefined) {
				let listItemSelected: string[];
				listItemSelected = input.ma_id_list.map(item => item + "")
				this.setState({ selectedValues: listItemSelected });
			}
		}

		else {
			this.setState({ di_start_at: moment(), di_end_at: moment() })
			if (input.di_desc === undefined) {
				input.di_desc = "";
			}
			this.setState({ isActive: true });
			this.formRef.current.resetFields();
		}
		this.disCountCode.init(this.props.discountCodeSelected)
		this.formRef.current!.setFieldsValue({ ...input, });
		this.setState({ isLoadDone: true });
	}

	async componentDidUpdate(prevProps, prevState) {
		if (this.state.idSelected !== prevState.idSelected) {
			this.initData(this.props.discountCodeSelected!);
		}
	}

	onCreateUpdate = () => {
		const { discountCodeSelected } = this.props;

		const form = this.formRef.current;
		this.setState({ isLoadDone: false })
		form!.validateFields().then(async (values: any) => {

			if (discountCodeSelected?.di_id === undefined || discountCodeSelected.di_id < 0) {
				let unitData = new CreateDiscountCodeInput(values);
				unitData.di_active = this.state.isActive;
				unitData.ma_id_list = this.state.selectedValues.filter(item => !isNaN(Number(item)) && Number(item));
				if (unitData.di_end_at === undefined) {
					unitData.di_end_at = this.state.di_end_at.toDate();
				}
				else if (unitData.di_start_at === undefined) {
					unitData.di_start_at = this.state.di_start_at.toDate();
				}
				await stores.discountCodeStore.createDiscountCode(unitData);
				message.success("Thêm mới thành công !");
			} else {
				let unitData = new UpdateDiscountCodeInput({ di_id: discountCodeSelected.di_id, ...values });
				unitData.ma_id_list = this.state.selectedValues.filter(item => !isNaN(Number(item)) && Number(item));
				if (unitData.di_end_at === undefined) {
					unitData.di_end_at = this.state.di_end_at.toDate();
				}
				else if (unitData.di_start_at === undefined) {
					unitData.di_start_at = this.state.di_start_at.toDate();
				}
				unitData.di_active = this.state.isActive;
				await stores.discountCodeStore.updateDiscount(unitData);
				message.success("Chỉnh sửa thành công !");
			}
			this.createSuccess();
			this.setState({ isLoadDone: true });
		})
	};

	createSuccess = () => {
		if (!!this.props.createSuccess) {
			this.props.createSuccess();
		}
	}
	renderTreeNodes = data =>
		data.map(item => {
			if (item.children) {
				return (
					<TreeNode title={item.title} key={item.key}>{this.renderTreeNodes(item.children)}</TreeNode>
				);
			}
			return <TreeNode key={item.key} {...item} />;
		});
	handleTreeSelectChange = (selectedValues) => {
		this.setState({ selectedValues: selectedValues });
	};
	onChangeStartDate = async (date: Moment | null) => {
		await this.setState({ di_start_at: date });
		let dateValid = this.createNewMoment(this.state.di_start_at);
		if (!this.state.di_end_at.isBetween(this.state.di_start_at, dateValid)) {
			await this.setState({ di_end_at: this.createNewMoment(this.state.di_start_at) });
		}
		await this.formRef.current.setFieldsValue({ di_start_at: date });
	}
	createNewMoment = (date: Moment) => {
		return moment(date, "DD/MM/YYYY");
	}
	render() {
		const { discountCodeSelected, disable } = this.props;
		const { treeGroupMachineUser } = stores.groupMachineStore;
		return (
			<Card>
				<Row justify="end" style={{ marginBottom: 10 }}>
					<Col span={16} style={{ textAlign: "start" }}>
						<h3>{discountCodeSelected?.di_id === undefined ? "Thêm mới mã giảm giá" : "Chỉnh sửa thông tin mã giảm giá " + discountCodeSelected!.di_code}</h3>
					</Col>
					<Col span={8} style={{ display: 'flex', justifyContent: "end" }} >
						<Button danger onClick={this.props.onCancel}>Hủy</Button> &nbsp;
						{this.props.disable ? "" :
							<Button type="primary" onClick={() => this.onCreateUpdate()}>Lưu</Button>
						}
					</Col>
				</Row>
				<Form ref={this.formRef} style={{ width: '100%' }} >
					<Form.Item label={'Mã giảm giá'} {...AppConsts.formItemLayout} rules={[rules.required, rules.noAllSpaces]} name={'di_code'} >
						<Input disabled={disable} placeholder={'Mã giảm giá...'} allowClear />
					</Form.Item>
					<Form.Item label={'Tiền giảm giá (VNĐ)'} {...AppConsts.formItemLayout} rules={[rules.messageForNumber]} name={'di_price'} >
						<InputNumber
							step={1000}
							placeholder={'Tiền giảm giá (VNĐ)'}
							min={0}
							disabled={disable}
							maxLength={AppConsts.maxLength.cost}
							style={{ width: "100%" }}
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
					<Form.Item label={'Số lượng mã tối đa'} {...AppConsts.formItemLayout} rules={[rules.required]} name={'di_quantity_max'} >
						<InputNumber
							min={0}
							maxLength={AppConsts.maxLength.cost}
							style={{ width: "100%" }}
							// Định dạng giá trị hiển thị của InputNumber
							formatter={value => value ? AppConsts.numberWithCommas(value) : ''}
							// Loại bỏ tất cả các ký tự không phải là số 
							parser={value => value ? String(value).replace(/[^\d]/g, '') : ''}
							disabled={disable}
							placeholder={'Số lượng mã tối đa...'} />
					</Form.Item>
					<Form.Item label={'Ngày bắt đầu sử dụng'} {...AppConsts.formItemLayout} name={'di_start_at'} valuePropName='di_start_at'>
						<DatePicker
							allowClear={false}
							onChange={async (date: Moment | null, dateString: string) => await this.onChangeStartDate(date)}
							format={"DD/MM/YYYY"} value={this.state.di_start_at}
							disabled={disable}
							disabledDate={(current) => current ? current <= moment().startOf('day') : false}
						/>
					</Form.Item>

					<Form.Item label={'Ngày kết thúc'} {...AppConsts.formItemLayout} name={'di_end_at'} valuePropName='di_end_at'>
						<DatePicker
							allowClear={false}
							onChange={(date: Moment | null, dateString: string) => { this.setState({ di_end_at: date }); this.formRef.current!.setFieldsValue({ di_end_at: date }); }}
							format={"DD/MM/YYYY"} value={this.state.di_end_at}
							disabled={disable}
							disabledDate={(current => current ? current < moment(this.state.di_start_at) : false)}
						/>
					</Form.Item>
					<Form.Item label={'Kích hoạt'} {...AppConsts.formItemLayout} name={'di_active'} >
						<Checkbox checked={this.state.isActive} onChange={(e) => this.setState({ isActive: e.target.checked })}
							disabled={disable} />
					</Form.Item>
					<Form.Item label={L('Mô tả')} {...AppConsts.formItemLayout} name={'di_desc'} valuePropName='data'
						getValueFromEvent={(event, editor) => {
							const data = editor.getData();
							return data;
						}}>
						<CKEditor editor={ClassicEditor} disabled={disable} />
					</Form.Item >
					<Form.Item label={L('Nhóm máy')} {...AppConsts.formItemLayout}>
						{/* <TreeSelect
							showSearch
							style={{ width: '100%' }}
							dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
							placeholder="Please select"
							allowClear
							treeCheckable
							onSelect={this.handleTreeSelectChange} // Sự kiện onChange để xử lý việc thay đổi giá trị chọn
							value={this.state.selectedValues} 
							treeData={treeGroupMachine}
						>
						</TreeSelect> */}
						<Tree
							disabled={disable}
							checkable
							onCheck={this.handleTreeSelectChange}
							checkedKeys={this.state.selectedValues}
						>
							{this.renderTreeNodes(treeGroupMachineUser)}
						</Tree>
					</Form.Item >
				</Form>

			</Card>
		)
	}
}