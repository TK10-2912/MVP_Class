import * as React from 'react';
import { Col, Row, Button, Card, Form, Input, message, InputNumber, Checkbox } from 'antd';
import { L } from '@lib/abpUtility';
import { RfidDto, AttachmentItem, CreateRfidInput, } from '@services/services_autogen';
import { stores } from '@stores/storeInitializer';
import AppConsts from '@src/lib/appconst';
import rules from '@src/scenes/Validation';
import SelectTenant from '@src/components/Manager/SelectTenant';

export interface IProps {
	onCreateUpdateSuccess?: (borrowReDto: RfidDto) => void;
	onCancel: () => void;
	RFIDSelected: RfidDto;
	rfidListResult?: RfidDto[];
}

export default class CreateOrUpdateRFID extends React.Component<IProps> {
	private formRef: any = React.createRef();
	listAttachmentItem: AttachmentItem[] = [];
	state = {
		isLoadDone: false,
		isActive: true,
		rf_id_selected: -1,
		rf_money_current: undefined,
		us_id_owner: undefined,
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.RFIDSelected.rf_id !== prevState.rf_id_selected) {
			return ({ rf_id_selected: nextProps.RFIDSelected.rf_id });
		}
		return null;
	}

	async componentDidUpdate(prevProps, prevState) {
		if (this.state.rf_id_selected !== prevState.rf_id_selected) {
			this.initData(this.props.RFIDSelected);
		}
	}

	initData = async (inputRFID: RfidDto) => {
		this.setState({ isLoadDone: false, rf_money_current: undefined });
		if (inputRFID !== undefined && inputRFID.rf_is_active !== undefined) {
			this.setState({ isActive: inputRFID.rf_is_active });
			this.setState({ rf_money_current: inputRFID.rf_money_current });
		}
		else {
			this.setState({ isActive: true })
			this.formRef.current!.setFieldsValue({ ...inputRFID });
		}
		this.formRef.current!.setFieldsValue();
		this.setState({ isLoadDone: true });
	}

	onCreateUpdate = () => {
		const { RFIDSelected } = this.props;
		const form = this.formRef.current;
		form!.validateFields().then(async (values: any) => {
			this.setState({ isLoadDone: false });
			if (RFIDSelected.rf_id === undefined || RFIDSelected.rf_id < 0) {
				let unitData = new CreateRfidInput(values);
				unitData.rf_is_active = this.state.isActive;
				await stores.RFIDStore.create(unitData);
				this.formRef.current.resetFields();
				message.success(L("Thêm mới thành công"));
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
		this.formRef.current.resetFields();
	}
	onCreateUpdateSuccess = () => {
		if (!!this.props.onCreateUpdateSuccess) {
			this.props.onCreateUpdateSuccess(this.props.RFIDSelected);
		}
	}

	render() {
		const { tenant } = stores.sessionStore.currentLogin;
		const { RFIDSelected, rfidListResult } = this.props;
		let rfidList = rfidListResult?.slice();
		if (!!RFIDSelected && RFIDSelected.rf_id != undefined) {
			rfidList = rfidListResult!.filter(item => item.rf_id !== RFIDSelected!.rf_id!);
		}
		return (
			<Card >
				<Row style={{ marginTop: 10 }}>
					<Col span={12}><h3>{L('Thêm mới thẻ RFID')}</h3></Col>
					<Col span={12} style={{ textAlign: 'right' }}>
						<Button danger onClick={() => this.onCancel()} style={{ marginLeft: '5px', marginTop: '5px' }}>
							{L('Hủy')}
						</Button>
						<Button type="primary" onClick={() => this.onCreateUpdate()} style={{ marginLeft: '5px', marginTop: '5px' }}>
							{L('Lưu')}
						</Button>
					</Col>
				</Row>

				<Row style={{ marginTop: 10 }}>
					<Form ref={this.formRef} style={{ width: "100%" }}>
						{!tenant &&
							<Form.Item label="Tenant" {...AppConsts.formItemLayout} name={"tenantId"} rules={[rules.required]}>
								<SelectTenant onChange={async (value) => await this.formRef.current!.setFieldsValue({ tenantId: value })} />
							</Form.Item>
						}
						<Form.Item label="Mã RFID" {...AppConsts.formItemLayout} rules={[rules.required, rules.numberOnly, ({ getFieldValue }) => ({
							validator(_, value) {
								const isMachineSoft = rfidList!.some(item => item!.rf_code!.trim().toLowerCase() === value.trim().toLowerCase());
								if (!value || !isMachineSoft) {
									return Promise.resolve();
								}
								return Promise.reject(new Error('Thẻ đã tồn tại!'));
							}
						})]} name={'rf_code'}  >
							<Input placeholder='Nhập mã RFID...'
								maxLength={20} />
						</Form.Item>
						<Form.Item label="Số dư hiện tại" {...AppConsts.formItemLayout} name={'rf_money_current'} rules={[rules.messageForNumber, rules.rfMoney]} >
							<InputNumber
								style={{ width: "100%" }}
								step={1000}
								placeholder='Vui lòng nhập số dư (VNĐ)'
								min={0}
								max={9999999}
								maxLength={8}
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
						{this.state.us_id_owner !== undefined ?
							<Form.Item label="Người sở hữu" {...AppConsts.formItemLayout} name={'us_id_owner'} >
								<label>{stores.sessionStore.getUserNameById(this.state.us_id_owner!)}</label>
							</Form.Item>
							: ""
						}
						<Form.Item label="Kích hoạt" {...AppConsts.formItemLayout} name={'su_note'} >
							<Checkbox checked={this.state.isActive} onChange={(e) => this.setState({ isActive: e.target.checked })} />
						</Form.Item>
					</Form>
				</Row>
			</Card >
		)
	}
}