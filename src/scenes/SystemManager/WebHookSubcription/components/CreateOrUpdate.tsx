import * as React from 'react';
import { DownOutlined, MinusCircleOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import AppConsts from '@src/lib/appconst';
import { WebhookSubscription } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Form, Input, Row, Select, Space, message } from 'antd';
import rules from './CreateOrUpdate.validation'
import { L } from '@src/lib/abpUtility';

export interface IProps {
	webHookSubcription?: WebhookSubscription;
	onCreateUpdateSuccess?: () => void;
	onCancel?: () => void;
}
export default class CreateOrUpdateWebHookSubcription extends React.Component<IProps>{
	private formRef: any = React.createRef();

	state = {
		isLoadDone: true,
		hookId: "",
		isUpdate: true,
	}
	header_arr: { name: string, value: string }[] = [];

	async componentDidMount() {
		this.initData(this.props.webHookSubcription);
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.webHookSubcription != undefined) {
			if (nextProps.webHookSubcription.id !== prevState.hookId) {
				return ({ hookId: nextProps.webHookSubcription.id });
			}
		}
		return null;
	}

	async componentDidUpdate(prevProps, prevState) {
		if (this.state.hookId !== prevState.hookId) {
			this.initData(this.props.webHookSubcription);
		}
	}

	initData = async (inputWebhookSubcription: WebhookSubscription | undefined) => {
		this.setState({ isLoadDone: false });
		if (inputWebhookSubcription !== undefined && inputWebhookSubcription.headers !== undefined) {
			this.header_arr = Array.from(Object.entries(inputWebhookSubcription.headers), ([name, value]) => ({ name, value }))
		}
		if (inputWebhookSubcription !== undefined) {
			this.formRef.current!.setFieldsValue({ ...inputWebhookSubcription, headers: this.header_arr });
		} else {
			this.formRef.current.resetFields();
		}

	}

	onCreateUpdate = () => {
		const self = this;
		const { webHookSubcription } = this.props;
		const form = this.formRef.current;
		form!.validateFields().then(async (values: any) => {
			if (webHookSubcription?.id === undefined) {
				let unitData = new WebhookSubscription({ ...values });
				unitData.isActive = false;

				await stores.webHookSubcriptionStore.addSubscription(unitData);
				message.success(L('SuccessfullyAdded'));
			} else {
				let obj_header = {};
				let unitData = new WebhookSubscription({ id: this.state.hookId, ...values });
				for (let unit of values.headers) {
					obj_header[unit.name] = unit.value
				}
				unitData.headers = obj_header;
				await stores.webHookSubcriptionStore.updateSubscription(unitData);
				message.success("Chỉnh sửa thành công");
			}
			this.onCreateUpdateSuccess();
			this.props.onCancel!();
		})
	};
	onCreateUpdateSuccess = () => {
		if (!!this.props.onCreateUpdateSuccess) {
			this.props.onCreateUpdateSuccess();
		}
	}
	deleteHeader = () => {
		const result = delete this.props.webHookSubcription!.headers;
	}
	render() {
		const { webHookSubcription } = this.props;
		return (
			<Card>
				<Form ref={this.formRef} style={{ justifyContent: 'center' }}>
					<h4>WebhookEndpoint*</h4>
					<Form.Item {...AppConsts.formItemLayout} name={'webhookUri'} rules={rules.validation}  >
						<Input addonBefore="http://" />
					</Form.Item>
					<h4>Secret</h4>
					<Form.Item {...AppConsts.formItemLayout} name={'secret'} rules={rules.validation}>
						<Input />
					</Form.Item>
					<h4>WebhookEvents</h4>
					<Form.Item {...AppConsts.formItemLayout} name={'webhooks'} rules={rules.validation}>
						<Select allowClear suffixIcon={<DownOutlined />} mode="multiple" style={{ width: '100%' }} >
							<Select.Option value="testWebhook">App.TestWebhook</Select.Option>
							<Select.Option value="testWebhook1">App.TestWebhook1</Select.Option>
						</Select>
					</Form.Item>
					<h4>Headers</h4>
					<Form.List name="headers">
						{(fields, { add, remove }) => (
							<>
								{fields.map(({ key, name, ...restField }) => (
									<Space key={key} style={{ display: 'flex', marginBottom: 8, width: '67%' }} align="baseline">
										<Form.Item
											{...restField}
											name={[name, 'name']}
											rules={[{ required: true, message: 'Missing first name' }]}
										>
											<Input placeholder="HeaderKey" />
										</Form.Item>
										<Form.Item
											{...restField}
											name={[name, 'value']}
											rules={[{ required: true, message: 'Missing last name' }]}
										>
											<Input placeholder="HeaderValue" />
										</Form.Item>
										<MinusCircleOutlined onClick={() => remove(name)} />
									</Space>
								))}
								<Form.Item style={{ width: '67%' }}>
									<Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
										Add header
									</Button>
								</Form.Item>
							</>
						)}
					</Form.List>
					{
						webHookSubcription != undefined && webHookSubcription!.headers &&
						<div>
							{/*<Input value={(Object.entries(webHookSubcription!.headers).map(item => item.join(': ')).join(', '))} disabled={true} style={{width:'67%',color:'#999'}}/> 		
						<Button danger type='primary' onClick={()=> this.deleteHeader()} >Xóa</Button>*/}

							<Select allowClear suffixIcon={<DownOutlined />} mode="multiple" style={{ width: '100%' }} >
								{Object.entries(webHookSubcription!.headers).map((item, index) =>
									<Select.Option key={"option_webhook" + index} value={item.join(': ')}>{item.join(": ")}</Select.Option>
								)
								}
							</Select>
						</div>

					}
				</Form>
				<Row justify='end' style={{ width: '67%', marginTop: '15px' }}>
					<Button onClick={() => this.props.onCancel!()} style={{ margin: '0 10px 0 0', color: '#1677ff', borderRadius: '5px' }} >{L("Cancel")}</Button>
					<Button icon={<SaveOutlined />} onClick={() => { this.onCreateUpdate() }} style={{ backgroundColor: '#1677ff', borderRadius: '5px', color: '#fff' }}>{L("Save")}</Button>
				</Row>
			</Card>
		)
	}
}