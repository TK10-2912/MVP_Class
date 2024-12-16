import * as React from 'react';
import { Button, Card, Col, Input, Modal, Row, Table, message } from 'antd';
import CreateOrUpdateRole from './components/FormCreateOrUpdateRole';
import { L } from '@lib/abpUtility';
import { DeleteFilled, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import AppConsts, { RouterPath } from '@lib/appconst';
import { stores } from '@stores/storeInitializer';
import { TablePaginationConfig } from 'antd/lib/table';
import { RoleDto } from '@src/services/services_autogen';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import HistoryHelper from '@src/lib/historyHelper';
import PassWordLevel2 from '../Users/components/PassWordLevel2';

const confirm = Modal.confirm;

export default class Role extends AppComponentBase {
	state = {
		isLoadDone: false,
		modalCreateUpdate: false,
		modalChangePassWord: false,
		pageSize: 10,
		skipCount: 0,
		currentPage: 1,
		roleId: 0,
		filter: '',
		visiblePassWordLevel2ModalOpen: false,
		isCheckPassword2: false,
	};
	roleSelected: RoleDto = new RoleDto();

	async componentDidMount() {
		await this.getAll();
		this.setState({ isCheckPassword2: true, visiblePassWordLevel2ModalOpen: true });
	}

	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.roleStore.getAll(this.state.filter, this.state.skipCount, this.state.pageSize);
		this.setState({ isLoadDone: true, modalCreateUpdate: false, modalChangePassWord: false, visiblePassWordLevel2ModalOpen: false });
	}

	handleTableChange = (pagination: TablePaginationConfig) => {
		this.setState({ skipCount: (pagination.current! - 1) * this.state.pageSize! }, async () => await this.getAll());
	};

	delete = (id: number) => {
		let self = this;
		confirm({
			title: (L('ban_chac_chan_muon_xoa_vai_tro_nay')),
			async onOk() {
				self.setState({ isLoadDone: false });
				await stores.roleStore.delete(id);
				message.success(L("xoa_thanh_cong"));
				self.setState({ isLoadDone: true });
			},
			onCancel() {
				console.log('Cancel');
			},
		});
	}

	createOrUpdateModalOpen = async (inputRole: RoleDto) => {
		this.roleSelected = inputRole;
		await this.setState({ modalCreateUpdate: true, modalChangePassWord: false });
	}
	async changePassWordModalOpen(inputRole: RoleDto) {
		this.roleSelected = inputRole;
		await this.setState({ modalChangePassWord: true, modalCreateUpdate: false });
	}

	handleSubmitSearch = async () => {
		this.onChangePage(1, 10);
	};

	onChangePage = async (page: number, pageSize?: number) => {
		if (pageSize !== undefined) {
			await this.setState({ pageSize: pageSize });
		}
		await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page, pageSize: this.state.pageSize });
		await this.getAll()
	};
	openModalPassWordLevel2 = async (isCheckPassword2: boolean) => {
		this.setState({
			isCheckPassword2: isCheckPassword2,
			visiblePassWordLevel2ModalOpen: !this.state.visiblePassWordLevel2ModalOpen,
		});
	};

	onsavePassWordLevel2 = async (val: boolean) => {
		if (val != undefined && val == true) {
			await this.getAll();
		} else {
			console.log("val", val);
			Modal.error({ title: ("Thông báo"), content: ("Không được truy cập") });
			HistoryHelper.redirect(RouterPath.admin_home);
		}
	}

	onCancelUsersPassWordLevel2 = () => {
		this.setState({ visiblePassWordLevel2ModalOpen: false });
		if (this.state.isCheckPassword2 == true) {
			HistoryHelper.redirect(RouterPath.admin_home);
		}
	}
	public render() {

		const left = this.state.modalCreateUpdate ? AppConsts.cssRightMain.left : AppConsts.cssPanelMain.left;
		const right = this.state.modalCreateUpdate ? AppConsts.cssPanelMain.right : AppConsts.cssRightMain.right;
		const { roles } = stores.roleStore;
		const columns: any = [
			{ title: L('STT'), dataIndex: 'userName', key: 'userName', width: 50, render: (text: string, item, index: number) => <div>{this.state.pageSize! * (this.state.currentPage! - 1) + (index + 1)}</div> },
			{ title: L('ten_vai_tro'), dataIndex: 'name', key: 'name', width: 150, render: (text: string) => <div>{text}</div> },
			{ title: L('ten_hien_thi'), dataIndex: 'displayName', key: 'displayName', width: 150, render: (text: string) => <div>{text}</div> },

		];
		if (this.isGranted(AppConsts.Permission.Pages_Manager_System_Roles_Edit) || this.isGranted(AppConsts.Permission.Pages_Manager_System_Roles_Delete)) {
			columns.push({
				title: L('chuc_nang'),
				width: 150,
				render: (text: string, item: any) => (
					<div>
						{this.isGranted(AppConsts.Permission.Pages_Manager_System_Roles_Edit) &&
							<Button
								type="primary" icon={<EditOutlined />} title={L('chinh_sua')}
								style={{ marginLeft: '10px' }}
								onClick={() => this.createOrUpdateModalOpen(item)}>
							</Button>
						}
						{this.isGranted(AppConsts.Permission.Pages_Manager_System_Roles_Delete) &&
							<Button
								danger icon={<DeleteFilled />} title={L('xoa')}
								style={{ marginLeft: '10px' }}
								onClick={() => this.delete(item.id)}>
							</Button>
						}
					</div>
				),
			})
		}
		return (
			<Card>

				<Row gutter={16}>
					<Col span={4} >
						<h2>{L('vai_tro')}</h2>
					</Col>
					<Col span={10}>
						<Input onPressEnter={() => this.handleSubmitSearch()} style={{ width: '60%', marginRight: '5px' }} allowClear value={this.state.filter} onChange={(e) => this.setState({ filter: e.target.value })} placeholder={'Nhập tìm kiếm'} />
						<Button type='primary' icon={<SearchOutlined />} onClick={this.handleSubmitSearch}>{L("tim_kiem")}</Button>
					</Col>
					{this.isGranted(AppConsts.Permission.Pages_Manager_System_Roles_Create) &&
						<Col span={10} style={{ textAlign: "right" }}>
							<Button type="primary" shape="circle" icon={<PlusOutlined />} onClick={() => this.createOrUpdateModalOpen(new RoleDto())} />
						</Col>
					}
				</Row>
				<Row gutter={16} >
				</Row>
				<Row style={{ marginTop: 20 }}>
					<Col {...left} style={{ overflow: 'auto', maxHeight: "60vh" }}>
						<Table
							// sticky
							rowKey="id"
							onRow={(record, rowIndex) => {
								return {
									onDoubleClick: (event: any) => {
										{
											this.isGranted(AppConsts.Permission.Pages_Manager_System_Roles_Edit) &&
												this.createOrUpdateModalOpen(record!)
										}
									}
								};
							}}
							className='centerTable'
							bordered={true}
							rowClassName={(record, index) => (this.state.roleId == record.id ? 'bg-click' : 'bg-white')}
							pagination={{
								pageSize: this.state.pageSize,
								total: roles === undefined ? 0 : roles.totalCount,
								defaultCurrent: 1,
								current: this.state.currentPage,
								showTotal: (total) => (L("tong")) + AppConsts.formatNumber(total),
								showQuickJumper: true,
								showSizeChanger: true,
								onChange: this.onChangePage,
								onShowSizeChange: this.onChangePage,
								pageSizeOptions: ['10', '20', '50', '100'],
							}} columns={columns}
							loading={roles === undefined ? true : false}
							dataSource={roles === undefined ? [] : roles.items}
							onChange={this.handleTableChange}
						/>
					</Col>
					<Col {...right}>
						{this.state.modalCreateUpdate &&
							<CreateOrUpdateRole
								onCancel={() =>
									this.setState({ modalCreateUpdate: false, })
								}
								onCreateOrUpdatedSuccess={() => { this.getAll() }}
								roleSelected={this.roleSelected}
							/>}

					</Col>
				</Row>
				<Modal
					title={L("mat_khau_cap_2")}
					visible={this.state.visiblePassWordLevel2ModalOpen}
					onCancel={() => this.onCancelUsersPassWordLevel2()}
					cancelText={L("Hủy")}
					footer={null}
					className="UsersPassWordLevel2ModalClass"
					destroyOnClose={true}
                    width={"50vw"}
				>
					<PassWordLevel2
						oncancel={() => this.setState({ visiblePassWordLevel2ModalOpen: false })}
						onsave={this.onsavePassWordLevel2}
						isCheckPassword2={this.state.isCheckPassword2}
					/>
				</Modal>
			</Card>
		);
	}
}

