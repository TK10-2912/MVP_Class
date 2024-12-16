import * as React from 'react';
import { Col, Row, Button, Table, Input, Tabs, Card, Modal } from 'antd';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { inject, observer } from 'mobx-react';
import { L } from '@lib/abpUtility';
import Stores from '@stores/storeIdentifier';
import './index.css'
import { stores } from '@stores/storeInitializer';
import { AuditLogDto, UserDto, } from '@services/services_autogen';
import moment from 'moment';
import UserConsts from '@lib/userConsts';
import { AppConsts, cssColResponsiveSpan } from '@lib/appconst';
import { DeleteFilled, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import DetailLogLogin from './component/DetailLogLogin';
const { TabPane } = Tabs;
const { confirm } = Modal;
@inject(Stores.AuditLogStore)
@observer

export default class AuditLog extends AppComponentBase {
	state = {
		isLoadDone: false,
		visibleViewLogLogin: false,
		skipCount: 0,
		pageSize: 10,
		browserInfo: "",
		clientIpAddress: "",
		currentPage: 1,
		tabCurrent: "tabslog1",
		us_id: undefined,
	};
	userData: UserDto[] = [];
	logLogin: AuditLogDto[] = [];
	logActionDocument: AuditLogDto[] = [];
	auditLogListResult: AuditLogDto[] = [];
	auditLogSelected: AuditLogDto = new AuditLogDto();

	async componentDidMount() {
		this.setState({ isLoadDone: false });
		await this.getAll();
		this.setState({ isLoadDone: true });
	}


	async getAll() {
		// if (!isGranted(AppConsts.Permission.Pages_EVN_AuditLog)) {
		// 	Modal.error({ title: L("Notifications"), content: L("You have not permissions!") });
		// 	return;
		// }
		this.auditLogListResult = [];
		this.logLogin = [];
		this.setState({ isLoadDone: false });
		let methodname: string = "";
		if (this.state.tabCurrent == "tabslog1") {
			this.auditLogListResult = await stores.auditLogStore.getAll(undefined, undefined, this.state.browserInfo, undefined, this.state.clientIpAddress, this.state.us_id, undefined, undefined, this.state.skipCount, this.state.pageSize);

		} else if (this.state.tabCurrent == "tabslog2") {
			methodname = "Authenticate";
			this.logLogin = await stores.auditLogStore.getAll(undefined, undefined, this.state.browserInfo, undefined, this.state.clientIpAddress, this.state.us_id, methodname, undefined, this.state.skipCount, this.state.pageSize);
		}
		this.setState({ isLoadDone: true, });


	}
	// async componentDidUpdate(prevProps, prevState) {
	// 	if (this.state.tabCurrent !== prevState.tab) {
	// 		this.getAll();
	// 	}
	// }
	handleSubmitSearch = async () => {
		this.onChangePage(1, this.state.pageSize);
	};

	async deleteAuditLog(id: number[]) {
		let self = this;
		confirm({
			title: L("ban_co_chac_muon_xoa"),
			okText: L("xoa"),
			cancelText: L("huy"),
			async onOk() {
				await stores.auditLogStore.deleteAuditLog(id);
				await self.getAll();
			},
			onCancel() {

			},
		});

	}

	deleteAllAuditLog() {
		let self = this;
		confirm({
			title: L("ban_co_chac_muon_xoa_tat_ca"),
			okText: L("xoa"),
			cancelText: L("huy"),
			onOk() {
				stores.auditLogStore.deleteAllAuditLog();
				self.setState({ isLoadDone: false, });
			},
			onCancel() {

			},
		});

	}

	onChangePage = async (page: number, pagesize?: number) => {
		if (pagesize !== undefined) {
			await this.setState({ pageSize: pagesize! });
		}
		this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
			this.getAll();
		})
	}


	onChangeTabs = async (value) => {
		if (!!value) {
			await this.setState({ tabCurrent: value });
		}
		this.getAll();
	}


	viewDetailLogLogin = async (item: AuditLogDto) => {
		this.auditLogSelected = item;
		await this.setState({ visibleViewLogLogin: true });
	}

	// onSelectUser = async (item_arr: ItemUser[]) => {
	// 	const { currentLogin } = stores.sessionStore;
	// 	if (!!item_arr && !isNaN(Number(item_arr[0].id))) {
	// 		await this.setState({ us_id: item_arr[0].id });
	// 	}
	// 	this.setState({ isLoadDone: false });
	// 	// this.memberSelected = ;
	// 	this.setState({ isLoadDone: true });
	// }

	render() {

		const self = this;
		const { totalCount } = stores.auditLogStore;
		const columns = [
			{ title: L("nguoi_dung"), dataIndex: 'userId', key: 'userId', render: (userId: number) => <div>{UserConsts.getUserFullName(userId) || (L("chua_dang_nhap"))}</div> },
			{ title: L("thong_tin_trinh_duyet"), dataIndex: 'browserInfo', key: 'browserInfo', render: (text: any) => <div>{text}</div> },
			{ title: L("ip"), dataIndex: 'clientIpAddress', key: 'clientIpAddress', render: (text: any) => <div>{text}</div> },
			{ title: L("thoi_gian_thuc_hien"), dataIndex: 'executionDuration', key: 'executionDuration', render: (text: any) => <div>{text}</div> },
			{ title: L("dich_vu"), dataIndex: 'serviceName', key: 'serviceName', render: (text: any) => <div>{text}</div> },
			{ title: L("noi_dung"), dataIndex: 'parameters', key: 'parameters', render: (text: any) => <div>{text}</div> },
			{ title: L("thoi_diem_thuc_hien"), dataIndex: 'executionTime', key: 'executionTime', render: (text: any) => <div>{moment(text).format('DD/MM/YYYY')}</div> },
			{
				title: L("chuc_nang"),
				render: (text: string, item: AuditLogDto) => (
					<div >
						<Button
							type="primary" icon={<EyeOutlined />} title={L('xem_chi_tiet')}
							style={{ margin: '5px 0 5px 10px', textAlign: 'center' }}
							onClick={() => this.viewDetailLogLogin(item)}
						></Button>

						{this.isGranted(AppConsts.Permission.Pages_Manager_System_AuditLog_Delete) &&
							<Button danger
								icon={<DeleteFilled />} title={L("xoa")}
								style={{ marginLeft: '10px', marginTop: 'px' }}
								onClick={() => this.deleteAuditLog([item.id!])}
							></Button>
						}
					</div>
				)
			},
		];
		return (
			<Card>
				<Row gutter={16}>
					<Col {...cssColResponsiveSpan(24, 24, 24, 8, 7, 7)} >
						<h1 style={{ fontSize: '30px' }}>{L("Nhật ký hệ thống")}</h1>
					</Col>
					{this.isGranted(AppConsts.Permission.Pages_Manager_System_AuditLog) &&
						<>
							<Col  {...cssColResponsiveSpan(12, 12, 7, 4, 4, 4)}>
								<Input allowClear onPressEnter={() => this.handleSubmitSearch()} placeholder={L("input_thong_tin_trinh_duyet")} value={this.state.browserInfo} style={{ width: '100%' }} onChange={(e) => this.setState({ browserInfo: e.target.value })} />
							</Col>
							<Col  {...cssColResponsiveSpan(12, 12, 7, 4, 4, 4)}>
								<Input allowClear onPressEnter={() => this.handleSubmitSearch()} placeholder={L("input_ip")} value={this.state.clientIpAddress} style={{ width: '100%' }} onChange={(e) => this.setState({ clientIpAddress: e.target.value })} />
							</Col>
							<Col  {...cssColResponsiveSpan(12, 12, 6, 2, 2, 2)}>
								<Button type="primary" icon={<SearchOutlined />} title={L('tim_kiem')} onClick={() => this.handleSubmitSearch()}>
									{L('tim_kiem')}
								</Button>
							</Col>
							<Col {...cssColResponsiveSpan(12, 12, 4, 6, 7, 7)} style={{ textAlign: "right" }}>
								<Button danger title={L('xoa_tat_ca')} onClick={() => this.deleteAllAuditLog()}>
									{L('xoa_tat_ca')}
								</Button>
							</Col>
						</>
					}
				</Row>
				<Modal
					visible={this.state.visibleViewLogLogin}
					title={L('chi_tiet_nhat_ky_kiem_tra')}
					onCancel={() => { this.setState({ visibleViewLogLogin: false }) }}
					width='50vw'
					footer={null}
					maskClosable={false}
				>
					<DetailLogLogin
						auditLogSelected={this.auditLogSelected}
					/>
				</Modal>

				<Tabs defaultActiveKey="tabslog1" onChange={this.onChangeTabs}>
					<TabPane tab={L("nhat_ky_he_thong")} key="tabslog1">
						<Row style={{ overflowY: "auto" }}>
							<Col
								xs={{ span: 24, offset: 0 }}
								sm={{ span: 24, offset: 0 }}
								md={{ span: 24, offset: 0 }}
								lg={{ span: 24, offset: 0 }}
								xl={{ span: 24, offset: 0 }}
								xxl={{ span: 24, offset: 0 }}
							>
								<Table
									// sticky
									onRow={(record, rowIndex) => {
										return {
											onDoubleClick: (event: any) => this.viewDetailLogLogin(record)
										};
									}}
									rowKey={record => JSON.stringify(record) + "tab1"}
									size={'middle'}
									bordered={true}
									locale={{ "emptyText": L("khong_co_du_lieu") }}
									rowClassName={(record, index) => (this.auditLogSelected.id == record.id) ? "bg-click" : "bg-white"}
									columns={columns}
									dataSource={this.auditLogListResult == undefined ? [] : this.auditLogListResult}
									pagination={{
										pageSize: this.state.pageSize,
										total: totalCount,
										current: this.state.currentPage,
										showTotal: (tot) => (L("tong")) + tot + "",
										showQuickJumper: true,
										showSizeChanger: true,
										onShowSizeChange(current: number, size: number) {
											self.onChangePage(current, size)
										},
										onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize),
									}}
								/>
							</Col>
						</Row>
					</TabPane>
					<TabPane tab={L("nhat_ky_dang_nhap")} key="tabslog2">

						<Row style={{ overflowY: "auto" }}>
							<Col
								xs={{ span: 24, offset: 0 }}
								sm={{ span: 24, offset: 0 }}
								md={{ span: 24, offset: 0 }}
								lg={{ span: 24, offset: 0 }}
								xl={{ span: 24, offset: 0 }}
								xxl={{ span: 24, offset: 0 }}
							>
								<Table
									// sticky
									onRow={(record, rowIndex) => {
										return {
											onDoubleClick: (event: any) => this.viewDetailLogLogin(record)
										};
									}}
									rowClassName={(record, index) => (this.auditLogSelected.id == record.id) ? "bg-click" : "bg-white"}
									rowKey={record => JSON.stringify(record) + "tab2"}
									size={'middle'}
									bordered={true}
									loading={!this.state.isLoadDone}
									pagination={{
										pageSize: this.state.pageSize,
										total: totalCount,
										current: this.state.currentPage,
										showTotal: (tot) => (L("tong")) + tot + "",
										showQuickJumper: true,
										showSizeChanger: true,
										pageSizeOptions: ['10', '20', '50', '100'],
										onShowSizeChange(current: number, size: number) {
											self.onChangePage(current, size)
										},
										onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
									}}
									locale={{ "emptyText": "" }}
									columns={columns}
									dataSource={this.logLogin == undefined ? [] : this.logLogin}
								/>
							</Col>
						</Row>
					</TabPane>



				</Tabs>
			</Card>
		);
	}
}