import * as React from 'react';
import { Col, Row, Button, Card, Form, Input, message, Space, InputNumber } from 'antd';
import { isGranted, L } from '@lib/abpUtility';
import {
	TrashBinDto,
	CreateTrashBinInput,
	AttachmentItem,
	UpdateTrashBinInput,
} from '@services/services_autogen';
import { stores } from '@stores/storeInitializer';
import AppConsts from '@src/lib/appconst';
import rules from '@src/scenes/Validation';
import SelectEnum from '@src/components/Manager/SelectEnum';
import { eTrashType, valueOfeTrashType } from '@src/lib/enumconst';
import TextArea from 'antd/lib/input/TextArea';
import SelectedGroupTrashBin from '@src/components/Manager/SelectedGroupTrashBin';
import SelectTenant from '@src/components/Manager/SelectTenant';

export interface IProps {
	onCreateUpdateSuccess?: (borrowReDto: TrashBinDto) => void;
	onCancel: () => void;
	trashBinSelected: TrashBinDto;
}

export default class CreateOrUpdateTrashBin extends React.Component<IProps> {
	private formRef: any = React.createRef();
	listAttachmentItem: AttachmentItem[] = [];
	state = {
		isLoadDone: false,
		tr_id_selected: undefined,
		disableInput: true,
		tr_type: undefined,
		gr_tr_id: undefined,
		deviceMAC: undefined,
	};

	async componentDidMount() {
		await this.initData(this.props.trashBinSelected);
	}
	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.trashBinSelected.tr_id !== prevState.tr_id_selected) {
			return { tr_id_selected: nextProps.trashBinSelected.tr_id };
		}
		return null;
	}
	async componentDidUpdate(_prevProps, prevState) {
		if (this.state.tr_id_selected !== prevState.tr_id_selected) {
			await this.initData(this.props.trashBinSelected);
		}
	}

	initData = async (inputTrashBin: TrashBinDto) => {
		if (inputTrashBin !== undefined && inputTrashBin.tr_id !== undefined) {
			if (inputTrashBin.tr_note === undefined) {
				inputTrashBin.tr_note = "";
			}
			this.setState({ tr_type: inputTrashBin.tr_type, gr_tr_id: inputTrashBin.gr_tr_id, deviceMAC: inputTrashBin.deviceMAC })
			this.formRef.current!.setFieldsValue({ ...inputTrashBin });
		}
		else this.formRef.current!.resetFields();
		this.setState({ isLoadDone: !this.state.isLoadDone });
	};

	onCreateUpdate = () => {
		const { trashBinSelected } = this.props;
		const form = this.formRef.current;
		form!.validateFields().then(async (values: any) => {
			if (trashBinSelected.tr_id === undefined || trashBinSelected.tr_id < 0) {
				let unitData = new CreateTrashBinInput(values);
				const updatedIframeContent = values.tr_urlMap?.replace(/width="\d+"/, '').replace(/style="[^"]*"/, 'style="border:0;width:-webkit-fill-available;"');
				unitData.tr_urlMap = updatedIframeContent;
				await stores.trashBinStore.createTrashBin(unitData);
				message.success('Thêm mới thành công');
			} else {
				let unitData = new UpdateTrashBinInput({ tr_id: trashBinSelected.tr_id, ...values });
				const updatedIframeContent = values.tr_urlMap?.replace(/width="\d+"/, '').replace(/style="[^"]*"/, 'style="border:0;width:-webkit-fill-available;"');
				unitData.tr_urlMap = updatedIframeContent;
				await stores.trashBinStore.updateTrashBin(unitData);
				this.setState({ disableInput: true });
				message.success('Chỉnh sửa thành công');
			}
			await this.onCreateUpdateSuccess();
			stores.sessionStore.getCurrentLoginInformations();
		});
		this.setState({ isLoadDone: !this.state.isLoadDone });

	};

	onCancel = () => {
		if (!!this.props.onCancel) {
			this.props.onCancel();
		}
	};
	onCreateUpdateSuccess = () => {
		if (!!this.props.onCreateUpdateSuccess) {
			this.props.onCreateUpdateSuccess(this.props.trashBinSelected);
		}
	};

	render() {
		const isCreate = this.props.trashBinSelected.tr_id === undefined || this.props.trashBinSelected.tr_id < 0;
		const { tenant } = stores.sessionStore.currentLogin;
		return (
			<Card>
				<Row style={{ marginTop: 10 }}>
					<Col span={12}>
						<h3>
							{isCreate ?
								<b>Thêm mới thùng rác</b> :
								<b>Sửa thùng rác: <span style={{ color: 'green' }}>{this.props.trashBinSelected.tr_name!}</span></b>
							}
						</h3>
					</Col>
					<Col span={12} style={{ textAlign: 'right' }}>
						<Space>
							<Button danger onClick={() => this.onCancel()}>
								{L('Hủy')}
							</Button>
							<Button type="primary" onClick={() => this.onCreateUpdate()}>
								{L('Lưu')}
							</Button>
						</Space>
					</Col>
				</Row>

				<Row style={{ marginTop: 10 }}>
					<Form ref={this.formRef} style={{ width: '100%' }}>
						{(isCreate && !tenant) &&
							<Form.Item label="Tenant" {...AppConsts.formItemLayout} name={"tenantId"} rules={[rules.required]}>
								<SelectTenant onChange={async (value) => await this.formRef.current!.setFieldsValue({ tenantId: value })} />
							</Form.Item>
						}
						<Form.Item
							label="Tên trạm"
							{...AppConsts.formItemLayout}
							rules={[rules.required, rules.noAllSpaces]}
							name={'tr_name'}
						>
							<Input placeholder={'Tên trạm...'} maxLength={200} allowClear />
						</Form.Item>
						<Form.Item
							label="Nhóm thùng rác"
							{...AppConsts.formItemLayout}
							rules={[rules.required]}
							name={'gr_tr_id'}
						>
							<SelectedGroupTrashBin
								groupTrashBinID={this.state.gr_tr_id}
								onChangeGroupTrashBin={(value) => { this.setState({ gr_tr_id: value }); this.formRef.current.setFieldsValue({ gr_tr_id: value }) }}
							/>
						</Form.Item>
						<Form.Item
							label="Địa chỉ MAC"
							{...AppConsts.formItemLayout}
							rules={[rules.required, rules.noAllSpaces, rules.MACAdress]}
							name={'deviceMAC'}
						>
							{isCreate
								?
								<Input placeholder={'Địa chỉ MAC...'} maxLength={50} allowClear />
								:
								<b>{this.state.deviceMAC}</b>
							}
						</Form.Item>
						<Form.Item
							label="Loại rác"
							{...AppConsts.formItemLayout}
							name={'tr_type'}
						>
							{
								isCreate || this.props.trashBinSelected.tr_type === eTrashType.NONE.num
									?
									<SelectEnum
										eNum={eTrashType}
										onChangeEnum={(value) => this.formRef.current.setFieldsValue({ tr_type: value })}
										enum_value={this.state.tr_type}
									></SelectEnum>
									:
									<strong>{valueOfeTrashType(this.state.tr_type!)}</strong>
							}
						</Form.Item>
						<Form.Item
							label="Tiền quy đổi 1kg rác"
							{...AppConsts.formItemLayout}
							rules={[rules.required]}
							name={'tr_tien_quy_doi_theo_rac'}
						>
							<InputNumber
								max={99999999}
								step={1000}
								placeholder={'Nhập số tiền....'}
								min={0}
								maxLength={AppConsts.maxLength.cost}
								style={{ width: '100%' }}
								formatter={(value) => AppConsts.numberWithCommas(value)}
								parser={(value) => value!.replace(/\D/g, '')}
								onKeyPress={(e) => {
									if (!/[\d,.]/.test(e.key) && e.key !== 'Backspace') {
										e.preventDefault();
									}
								}}
							/>
						</Form.Item>
						<Form.Item label="Đường dẫn vị trí" rules={[rules.noAllSpaces]} {...AppConsts.formItemLayout} name={'tr_urlMap'}>
							<Input placeholder="Nhập URL(Ex:<iframe>https...)" />
						</Form.Item>
						<Form.Item label="Ghi chú" {...AppConsts.formItemLayout} name={'tr_note'} >
							<TextArea placeholder="Ghi chú..." maxLength={255} allowClear rows={4}></TextArea>
						</Form.Item>
					</Form>
				</Row>
			</Card>
		);
	}
}
