import * as React from 'react';
import { Col, Row, Button, Card, Form, Input, message, TreeSelect } from 'antd';
import { L } from '@lib/abpUtility';
import { RepositoryDto, AttachmentItem, CreateRepositoryInput, UpdateRepositoryInput, } from '@services/services_autogen';
import { stores } from '@stores/storeInitializer';
import AppConsts from '@src/lib/appconst';
import rules from '@src/scenes/Validation';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { TreeRepositoryDto } from '@src/stores/repositoryStore';
import SelectedColumnDisplay from '@src/components/Manager/SelectedColumnDisplay';
import SelectUser from '@src/components/Manager/SelectUser';

export interface IProps {
	onCreateUpdateSuccess?: (borrowReDto: RepositoryDto) => void;
	onCancel: () => void;
	repositorySelected: RepositoryDto;
	treeReponsitory: TreeRepositoryDto[];
	isCreate: boolean;
	us_id_operator?: number;
	isUpdate?: boolean;
}

export default class CreateOrUpdateRepository extends React.Component<IProps> {
	private formRef: any = React.createRef();
	listAttachmentItem: AttachmentItem[] = [];
	state = {
		isLoadDone: false,
		re_id_selected: undefined,
		content: '',
		re_parent_id: -1,
		re_name: '',
		isCheck: undefined,
		us_operator: undefined,
	}
	repositorySelected: RepositoryDto = new RepositoryDto();
	treeSelect: RepositoryDto = new RepositoryDto();
	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.isUpdate !== prevState.isCheck || nextProps.repositorySelected.re_id !== prevState.re_id_selected || nextProps.repositorySelected.re_parent_id !== prevState.re_parent_id) {
			return ({ isCheck: nextProps.isUpdate, re_id_selected: nextProps.repositorySelected.re_id, re_parent_id: nextProps.repositorySelected.re_parent_id });
		}
		return null;
	}


	async componentDidUpdate(prevProps, prevState) {
		if (this.state.re_id_selected !== prevState.re_id_selected || this.state.re_parent_id !== prevState.re_parent_id || prevProps.isCreate != this.props.isCreate) {
			this.initData(this.props.repositorySelected);
		}
	}
	async componentDidMount() {
		await this.initData(this.props.repositorySelected)
	}
	initData = async (inputRepository: RepositoryDto) => {
		this.setState({ isLoadDone: false });
		if (inputRepository != undefined) {
			this.repositorySelected = inputRepository;
			this.setState({ us_operator: inputRepository.us_id_operator })
			if (this.props.isCreate) {
				await this.setState({ re_name: "", content: "" })
			}
			else await this.setState({ re_name: inputRepository.re_name, content: inputRepository.re_desc })
		}
		this.formRef.current!.setFieldsValue({
			... this.repositorySelected,
		});
		this.setState({ isLoadDone: true });
	}

	onCreateUpdate = () => {
		const { repositorySelected, isCreate } = this.props;
		const form = this.formRef.current;
		form!.validateFields().then(async (values: any) => {
			this.setState({ isLoadDone: false });
			if (isCreate) {
				let unitData = new CreateRepositoryInput(values);
				unitData.re_parent_id = repositorySelected.re_id;
				unitData.re_name = this.state.re_name;
				unitData.us_id_operator = this.state.us_operator!;
				unitData.re_desc = this.state.content;
				await stores.repositoryStore.createRepository(unitData);
				this.formRef.current.resetFields();
				message.success(L("Thêm mới thành công"));
				await stores.sessionStore.getCurrentLoginInformations();
				await this.onCreateUpdateSuccess();
			}
			else {
				let unitData = new UpdateRepositoryInput(values);
				unitData.re_id = repositorySelected.re_id;
				unitData.re_parent_id = this.treeSelect.re_id != undefined ? this.treeSelect.re_id : repositorySelected.re_parent_id;
				unitData.re_name = this.state.re_name;
				unitData.re_desc = this.state.content;
				unitData.us_id_operator = this.state.us_operator!;
				if (unitData.re_id === unitData.re_parent_id) {
					message.error("Không được thay đổi kho vào chính nó!")
				}
				else {
					await stores.repositoryStore.updateRepository(unitData);
					this.formRef.current.resetFields();
					message.success(L("Cập nhật thành công"));
					await stores.sessionStore.getCurrentLoginInformations();
					await this.onCreateUpdateSuccess();
				}

			}
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
			this.props.onCreateUpdateSuccess(this.repositorySelected);
		}
	}

	render() {
		let self = this;
		return (
			<Card >
				<Row style={{ marginTop: 10 }}>
					<Col span={12}><h3>{this.props.isCreate ? L('Thêm mới kho lưu trữ') : `Chỉnh sửa kho ${this.props.repositorySelected.re_name}`}</h3></Col>
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
						<Form.Item label={'Người vận hành'} {...AppConsts.formItemNumber(5, 15)} name={'us_id_operator'} rules={[rules.required]}>
							<SelectUser onChangeUser={data => { this.setState({ us_operator: data }) }} us_id={this.state.us_operator} />
						</Form.Item>
						{
							this.props.isCreate ?
								<Form.Item label={'Tên kho lưu trữ'} {...AppConsts.formItemNumber(5, 15)} rules={[rules.required, rules.noAllSpaces]} >
									<Input value={this.state.re_name} onChange={(e) => this.setState({ re_name: e.target.value })} placeholder="Nhập tên kho lưu trữ..." maxLength={255} />
								</Form.Item> :
								<Form.Item label={'Tên kho lưu trữ'} {...AppConsts.formItemNumber(5, 15)} name={'re_name'} rules={[rules.required, rules.noAllSpaces]} >
									<Input value={this.state.re_name} onChange={(e) => this.setState({ re_name: e.target.value })} placeholder="Nhập tên kho lưu trữ..." maxLength={255} />
								</Form.Item>
						}
						{!this.props.isCreate && this.props.repositorySelected.re_parent_id != -1 &&
							<Form.Item label={L('Thuộc kho')} {...AppConsts.formItemNumber(5, 15)} rules={[rules.required]} name={'re_parent_id'}  >
								<TreeSelect
									style={{ width: '100%' }}
									dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
									treeData={this.props.treeReponsitory}
									treeDefaultExpandAll
									onSelect={(value, node) => { self.setState({ re_parent_id: node.re_id }); this.treeSelect.init(node) }}
								/>
							</Form.Item>
						}
						{
							this.props.isCreate ?
								<Form.Item label={L('Mô tả')} {...AppConsts.formItemNumber(5, 15)} valuePropName='data' rules={[rules.noAllSpaces]}
									getValueFromEvent={(event, editor) => {
										const data = editor.getData();
										return data;
									}}>
									<CKEditor
										editor={ClassicEditor}
										data={this.state.content}
										onChange={(event, editor) => {
											const data = editor.getData();
											this.setState({ content: data });
										}}
									/>
								</Form.Item >
								:
								<Form.Item label={L('Mô tả')} {...AppConsts.formItemNumber(5, 15)} name={'re_desc'} valuePropName='data' rules={[rules.noAllSpaces]}
									getValueFromEvent={(event, editor) => {
										const data = editor.getData();
										return data;
									}}>
									<CKEditor
										editor={ClassicEditor}
										data={this.state.content}
										onChange={(event, editor) => {
											const data = editor.getData();
											this.setState({ content: data });
										}}
									/>
								</Form.Item >
						}

					</Form>
				</Row>
			</Card >
		)
	}
}