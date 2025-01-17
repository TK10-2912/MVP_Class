import { CreateRefundInput } from '@src/services/services_autogen';
import * as React from 'react';
import { stores } from "@src/stores/storeInitializer";
import { Button, Col, Form, Input, InputNumber, Row, Space, message } from 'antd';
import AppConsts from '@src/lib/appconst';
import rules from '@src/scenes/Validation';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import moment from 'moment';
export interface IProps {
	onCreateUpdateSuccess?: () => void;
	onCancel?: () => void;
}
export default class CreateRefundAdmin extends AppComponentBase<IProps> {
	private formRef: any = React.createRef();
	state = {
		isLoadDone: false,
		ma_id: undefined,
	}
	componentDidMount(){
		this.formRef.current!.setFieldsValue({ref_money:5000});
		
	}
	onCreateUpdate = async () => {
		this.setState({ isLoadDone: false });
		const form = this.formRef.current;
		form!.validateFields().then(async (values: any) => {
			let unitData = new CreateRefundInput({ ...values });
			unitData.ref_status = "NOTREFUND";
			unitData.ref_code = "RefundMoney_" + moment().format("YYYYMMDDHHss");
			await stores.hardWareStore.createRefund(unitData);
			await this.onCreateUpdateSuccess();
			this.setState({ disableInput: true })
			message.success("Tạo mới hoàn tiền thành công");
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
	}
	render() {
		return (
			<>
				<Row>
					<Form ref={this.formRef} style={{ width: '80%' }}>
						<Form.Item label="Mã đơn hàng" {...AppConsts.formItemLayout} name={"bi_code"} rules={[rules.required, rules.noAllSpaces, rules.maxName]}>
							<Input maxLength={64} placeholder='Nhập mã đơn hàng...' allowClear></Input>
						</Form.Item>
						<Form.Item label="Số tiền hoàn" {...AppConsts.formItemLayout} name={"ref_money"} rules={[rules.messageForNumber,
						{
							validator: (_, value) =>
								value >= 5000 ? Promise.resolve() : Promise.reject("Số tiền tối thiểu là 5.000đ"),
						},]}>
							<InputNumber
								step={1000}
								max={99999999}
								placeholder={'Nhập số tiền....'}
								min={5000}
								defaultValue={5000}
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
					</Form>
				</Row>

				<Row style={{ marginBottom: 8 }}>
					<Col span={24} style={{ textAlign: "right" }}>
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
			</ >
		)
	}
}