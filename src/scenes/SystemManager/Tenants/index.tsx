import * as React from 'react';

import { Button, Card, Col, Input, Modal, Row, Table, Tag, message } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { inject, observer } from 'mobx-react';

import AppComponentBase from '@src/components/Manager/AppComponentBase';
import CreateOrUpdateTenant from './components/createOrUpdateTenant';
import { L } from '@lib/abpUtility';
import Stores from '@stores/storeIdentifier';
import TenantStore from '@stores/tenantStore';
import { DeleteFilled, EditOutlined, PlusOutlined } from '@ant-design/icons';

export interface ITenantProps {
	tenantStore: TenantStore;
}

export interface ITenantState {
	modalVisible: boolean;
	maxResultCount: number;
	skipCount: number;
	tenantId: number;
	filter: string;
}
const confirm = Modal.confirm;
const Search = Input.Search;

@inject(Stores.TenantStore)
@observer
class Tenant extends AppComponentBase<ITenantProps, ITenantState> {
	formRef = React.createRef<FormInstance>();

	state = {
		modalVisible: false,
		maxResultCount: 10,
		skipCount: 0,
		tenantId: 0,
		filter: '',
	};

	async componentDidMount() {
		await this.getAll();
	}

	async getAll() {
		await this.props.tenantStore.getAll(this.state.filter, undefined, this.state.skipCount, this.state.maxResultCount);
	}

	handleTableChange = (pagination: any) => {
		this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll());
	};

	Modal = () => {
		this.setState({
			modalVisible: !this.state.modalVisible,
		});
	};

	async createOrUpdateModalOpen(id: number) {
		if (id === 0) {
			this.props.tenantStore.createTenant();
		} else {
			await this.props.tenantStore.get(id);
		}

		this.setState({ tenantId: id });
		this.Modal();

		setTimeout(() => {
			if (id !== 0) {
				this.formRef.current?.setFieldsValue({
					...this.props.tenantStore.tenantModel,
				});
			} else {
				this.formRef.current?.resetFields();
			}
		}, 100);
	}

	delete(id: number) {
		const self = this;
		confirm({
			title: 'Do you Want to delete these items?',
			onOk() {
				self.props.tenantStore.delete(id);
			},
			onCancel() { },
		});
	}

	handleCreate = async () => {
		this.formRef.current?.validateFields().then(async (values: any) => {
			if (this.state.tenantId === 0) {
				await this.props.tenantStore.create(values);
				message.success(L("them_moi_thanh_cong"))
			} else {
				await this.props.tenantStore.update({ id: this.state.tenantId, ...values });
				message.success(L("chinh_sua_thanh_cong"));
			}

			await this.getAll();
			this.setState({ modalVisible: false });
			this.formRef.current?.resetFields();
		});
	};

	handleSearch = (value: string) => {
		this.setState({ filter: value }, async () => await this.getAll());
	};

	public render() {
		const cssPanelMain = {
			left: {
				xs: { span: 24 },
				sm: { span: 24 },
				md: { span: 24 },
				lg: { span: 24 },
				xl: { span: 24 },
				xxl: { span: 24 },
			},
			right: {
				xs: { span: 10 },
				sm: { span: 10 },
				md: { span: 10 },
				lg: { span: 10 },
				xl: { span: 10 },
				xxl: { span: 10 },
			},
		};
		const cssRightMain = {
			left: {

				xs: { span: 14 },
				sm: { span: 14 },
				md: { span: 14 },
				lg: { span: 14 },
				xl: { span: 14 },
				xxl: { span: 14 },
			},
			right: {
				xs: { span: 0 },
				sm: { span: 0 },
				md: { span: 0 },
				lg: { span: 0 },
				xl: { span: 0 },
				xxl: { span: 0 },
			},
		};
		const left = this.state.modalVisible ? cssRightMain.left : cssPanelMain.left;
		const right = this.state.modalVisible ? cssPanelMain.right : cssRightMain.right;
		const { tenants } = this.props.tenantStore;
		const columns = [
			{ title: L('TenancyName'), dataIndex: 'tenancyName', key: 'tenancyName', width: 150, render: (text: string) => <div>{text}</div> },
			{ title: L('Name'), dataIndex: 'name', key: 'name', width: 150, render: (text: string) => <div>{text}</div> },
			{
				title: L('IsActive'),
				dataIndex: 'isActive',
				key: 'isActive',
				width: 150,
				render: (text: boolean) => (text === true ? <Tag color="#2db7f5">{L('Yes')}</Tag> : <Tag color="red">{L('No')}</Tag>),
			},
			{
				title: L('Actions'),
				width: 150,
				render: (text: string, item: any) => (
					<div>

						<Button
							type="primary" icon={<EditOutlined />} title='Chỉnh sửa'
							style={{ marginLeft: '10px' }}
							onClick={() => this.createOrUpdateModalOpen(item.id)}>
						</Button>
						<Button
							danger icon={<DeleteFilled />} title='Xóa'
							style={{ marginLeft: '10px' }}
							onClick={() => this.delete(item.id)}>
						</Button>

					</div>
				),
			},
		];

		return (
			<Card>
				<Row gutter={16}>
					<Col span={4}>
						<h2>{L('Tenants')}</h2>
					</Col>
					<Col span={17}>
						<Search style={{ width: '50%' }} placeholder={this.L('Filter')} onSearch={this.handleSearch} />
					</Col>
					<Col span={3}>
						<Button style={{ justifyContent: 'end' }} type="primary" shape="circle" title='Thêm mới Tenant' icon={<PlusOutlined />} onClick={() => this.createOrUpdateModalOpen(0)} />
					</Col>
				</Row>
				<Row style={{ marginTop: 20 }}>
					<Col
						{...left}
					>
						<Table
							// sticky
							className='centerTable'
							rowKey="id"
							onRow={(record, rowIndex) => {
								return {
									onDoubleClick: (event: any) => { this.createOrUpdateModalOpen(record.id!) }
								};
							}}
							bordered={true}
							rowClassName={(record, index) => (this.state.tenantId == record.id ? 'bg-click' : 'bg-white')}
							pagination={{ pageSize: this.state.maxResultCount, total: tenants === undefined ? 0 : tenants.totalCount, defaultCurrent: 1 }}
							columns={columns}
							loading={tenants === undefined ? true : false}
							dataSource={tenants === undefined ? [] : tenants.items}
							onChange={this.handleTableChange}
						/>
					</Col>
					<Col {...right}>
						<CreateOrUpdateTenant
							formRef={this.formRef}
							visible={this.state.modalVisible}
							onCancel={() =>
								this.setState({
									modalVisible: false,
								})
							}
							modalType={this.state.tenantId === 0 ? 'edit' : 'create'}
							onCreate={this.handleCreate}
						/>
					</Col>
				</Row>

			</Card>
		);
	}
}

export default Tenant;
