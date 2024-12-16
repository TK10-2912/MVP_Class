import { CreateTenantDto, TenantDto, VCBInformationPayment } from '@src/services/services_autogen';
import * as React from 'react';
import { stores } from "@src/stores/storeInitializer";
import { Button, Card, Checkbox, Col, Form, Input, InputNumber, Row, Space, message } from 'antd';
import AppConsts, { cssCol } from '@src/lib/appconst';
import rules from '@src/scenes/Validation';
import AppComponentBase from '@src/components/Manager/AppComponentBase';

export interface IProps {
	onCreateUpdateSuccess?: () => void;
	onCancel: () => void;
	tenantSelected: TenantDto;
}
export default class CreateOrUpdateTenant extends AppComponentBase<IProps> {
	private formRef: any = React.createRef();
	state = {
		isLoadDone: false,
		id: -1,
		isActive: true,
		isVisibleVCBInfo: !!this.props.tenantSelected.vCBInformationPayment?.merchant_site_code,
	}
	tenantSelected: TenantDto;

	async componentDidMount() {
		this.initData(this.props.tenantSelected);
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.tenantSelected.id !== prevState.id) {
			return ({ id: nextProps.tenantSelected.id });
		}
		return null;
	}

	async componentDidUpdate(_prevProps, prevState) {
		if (this.state.id !== prevState.id) {
			this.initData(this.props.tenantSelected);
		}
	}

	initData = async (tenantInput: TenantDto | undefined) => {
		this.setState({ isLoadDone: false });
		if (tenantInput !== undefined && tenantInput.id !== undefined) {
			this.tenantSelected = tenantInput!;
			this.setState({ isActive: this.tenantSelected.isActive });
			this.formRef.current!.setFieldsValue({ ...tenantInput, ...this.props.tenantSelected.vCBInformationPayment });
		} else {
			this.tenantSelected = new TenantDto();
			this.formRef.current!.resetFields();
		}
		this.setState({ isLoadDone: true, isLoadFile: true });
	}
	onCreateUpdate = () => {
		const { tenantSelected } = this.props;
		const form = this.formRef.current;
		form!.validateFields().then(async (values: any) => {
			let vcbPayment = new VCBInformationPayment({
				merchant_site_code: values?.merchant_site_code,
				buyer_fullname: values?.buyer_fullname,
				buyer_email: values?.buyer_email,
				buyer_mobile: values?.buyer_mobile,
			});

			if (tenantSelected.id === undefined || tenantSelected.id < 0) {
				let unitData = new CreateTenantDto({ ...values, ...vcbPayment });
				unitData.isActive = this.state.isActive;
				unitData.connectionString = "";
				await stores.tenantStore.create(unitData);
				message.success("Thêm mới thành công!");
				this.formRef.current.resetFields();
			} else {
				let unitData = new TenantDto({
					id: tenantSelected.id,
					...values,
					vCBInformationPayment: vcbPayment,
				});
				unitData.isActive = this.state.isActive;
				await stores.tenantStore.update(unitData);
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
	componentWillUnmount() {
		this.setState = (_state, _callback) => {
			return;
		};
	}

	render() {
		const { tenantSelected } = this.props;
		const { tenant } = stores.sessionStore.currentLogin;
		return (
			<Card>
				<Row>
					<Col span={12}>
						<h3>
							{this.state.id === undefined
								? "Thêm mới tenant"
								: "Thông tin " + tenantSelected.tenancyName}
						</h3>
					</Col>
					<Col span={12} style={{ textAlign: "right" }}>
						<Space>
							<Button danger onClick={() => this.onCancel()}>Hủy</Button>
							<Button type="primary" onClick={() => this.onCreateUpdate()}>Lưu</Button>
						</Space>
					</Col>
				</Row>
				<Form
					ref={this.formRef}
					style={{ width: '100%' }}
				>
					<Form.Item label="Tên" {...AppConsts.formItemLayoutTitleSmall} name={"name"} rules={[rules.required, rules.noAllSpaces]}>
						<Input placeholder='Name...' allowClear></Input>
					</Form.Item>
					<Form.Item label="Tên tenancty" {...AppConsts.formItemLayoutTitleSmall} name={"tenancyName"} rules={[rules.required, rules.noAllSpaces]}>
						<Input placeholder='tenancyName...' allowClear></Input>
					</Form.Item>
					{this.state.id === undefined &&
						<Form.Item label="Địa chỉ email admin" {...AppConsts.formItemLayoutTitleSmall} name={"adminEmailAddress"} rules={[rules.required, rules.noAllSpaces]}>
							<Input placeholder='adminEmailAddress...' allowClear></Input>
						</Form.Item>
					}
					<Form.Item label="Hoạt động" {...AppConsts.formItemLayoutTitleSmall} >
						<Checkbox checked={this.state.isActive} onChange={e => this.setState({ isActive: e.target.value })}></Checkbox>
					</Form.Item>
					<Form.Item label="Số máy tối đa" rules={[rules.required]} {...AppConsts.formItemLayoutTitleSmall} name='maxNumberOfMachine'>
						<InputNumber max={50} min={1} maxLength={2} onChange={(e)=> this.formRef.current.setFieldsValue({maxNumberOfMachine:e})}></InputNumber>
					</Form.Item>
					<Row>
						<Col style={{ width: '60%' }} span={24} className='user-form-col-16'>
							{this.state.isVisibleVCBInfo && //đổi điều kiện bằng Const cho nhiều phương thức tt
								<Card className={'user-form__card -border-green'}>
									<Form.Item label="merchant_site_code" {...AppConsts.formItemLayout} name={"merchant_site_code"} rules={[rules.required, rules.noAllSpaces]}>
										<Input placeholder='merchant_site_code...' />
									</Form.Item>
									<Form.Item label="buyer_fullname" {...AppConsts.formItemLayout} name={"buyer_fullname"} rules={[rules.required, rules.noAllSpaces]}>
										<Input placeholder='buyer_fullname...' allowClear />
									</Form.Item>
									<Form.Item label="buyer_email" {...AppConsts.formItemLayout} name={"buyer_email"} rules={[rules.required, rules.noAllSpaces, rules.emailAddress]}>
										<Input placeholder='buyer_email...' allowClear />
									</Form.Item>
									<Form.Item label="buyer_mobile" {...AppConsts.formItemLayout} name={"buyer_mobile"} rules={[rules.required, rules.noAllSpaces, rules.phone]}>
										<Input placeholder='buyer_mobile...' allowClear />
									</Form.Item>
								</Card>
							}
						</Col>
					</Row>
					{!tenant &&
						<div className='user-form-bank'>
							<Form.Item label={<span className={`user-form__bank-span ${this.state.isVisibleVCBInfo && '--vcb-checkbox-checked'}`}>Vietcombank</span>} labelCol={cssCol(6)} wrapperCol={cssCol(3)}>
								{/* đổi điều kiện bằng Const */}
								<Checkbox onChange={(e) => this.setState({ isVisibleVCBInfo: e.target.checked })} defaultChecked={!!tenantSelected.vCBInformationPayment?.merchant_site_code}></Checkbox>
							</Form.Item>
						</div>
						//thêm các bank khác vào đây
					}
				</Form>
			</Card >
		)
	}
}