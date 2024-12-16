import * as React from 'react';
import { Col, Row, Button, Card, Tree, Space } from 'antd';
import { stores } from '@stores/storeInitializer';
import { RepositoryDto } from '@services/services_autogen';
import { DeleteFilled, DownOutlined, EditOutlined, ExportOutlined, FolderOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import ModalExportRepositoryAdmin from './components/ModalExportRepositoryAdmin';
import ModalRepositoryLogsAdmin from './components/ModalRepositoryLogsAdmin';
import { SorterResult } from 'antd/lib/table/interface';
import { eSort } from '@src/lib/enumconst';
import { isGranted } from '@src/lib/abpUtility';
import SelectUserMultiple from '@src/components/Manager/SelectUserMultiple';
import { TreeRepositoryDto } from '@src/stores/repositoryStore';
import TableRepositoryAdmin from './components/TableRepositoryAdmin';
import confirm from 'antd/lib/modal/confirm';
import CreateOrUpdateRepository from './components/CreateOrUpdateRepository';
const { TreeNode } = Tree

export default class RepositoryAdmin extends AppComponentBase {
	state = {
		isLoadDone: true,
		visibleExportRepository: false,
		visibleRepositoryLogs: false,
		visibleTable: false,
		skipCount: 0,
		currentPage: 1,
		pageSize: 10,
		sort: undefined,
		selectedField: undefined,
		selectedKeys: undefined,
		us_id_operator_list: undefined,
		visibleModalCreateUpdate: false,
		openAction: false,
		key: undefined,
		isCreate: false,
		us_operator: undefined,
		expandKeys: []
	};
	repositorySelected: RepositoryDto = new RepositoryDto();;
	selectedField: string;
	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.repositoryStore.getAllByAdmin(this.state.us_id_operator_list, this.state.selectedField, this.state.sort, undefined, undefined);
		this.setState({ isLoadDone: true });
	}
	async componentDidMount() {
		stores.productStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined, undefined);
		stores.importRepositoryStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
		stores.exportRepositoryStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined, undefined);
		stores.transferRepositoryStore.getAllAdmin(undefined,undefined, undefined, undefined, undefined, undefined, undefined);
		await this.getAll();
	}
	onSuccess = async () => {
		this.setState({ isLoadDone: true });
		await stores.importRepositoryStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
		this.getAll();
		this.setState({ visibleModalCreateUpdate: false, isLoadDone: false, });
	}
	handleSubmitSearch = async () => {
		this.onChangePage(1, 10);
	}
	onChangePage = async (page: number, pagesize?: number) => {
		if (pagesize !== undefined) {
			await this.setState({ pageSize: pagesize! });
		}
		this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
			this.getAll();
		})
	}

	actionTable = (repositorySelected: RepositoryDto, event: EventTable) => {
		if (event === EventTable.View || event === EventTable.RowDoubleClick) {
			this.repositorySelected = repositorySelected;
			this.setState({ visibleRepositoryLogs: true });
		}
	}
	changeColumnSort = async (sort: SorterResult<RepositoryDto> | SorterResult<RepositoryDto>[]) => {
		await this.setState({
			sort: sort['order'] === undefined ? undefined : (sort['order'] === "descend" ? eSort.DES.num : eSort.ASC.num),
			selectedField: sort['field']
		});
		await this.getAll();
	}
	openTableForm = (selectedKey: any, value: RepositoryDto) => {
		this.repositorySelected.init(value);
		this.setState({ openAction: true, visibleTable: true, visibleModalCreateUpdate: false, selectedKeys: selectedKey, key: selectedKey })
	}
	onMouseLeave = () => {
		this.setState({ selectedKeys: undefined, openAction: false })
	}
	onMouseOver = (selectedKey: any, value: TreeRepositoryDto) => {
		this.setState({ openAction: true, selectedKeys: selectedKey })
	}
	createRepository = async (selectedKey: any, value: RepositoryDto) => {

		await this.repositorySelected.init(value);
		this.setState({ isLoadDone: !this.state.isLoadDone, isCreate: true, us_operator: value.us_id_operator, openAction: true, visibleTable: false, visibleModalCreateUpdate: true, key: selectedKey })
	}
	updateRepository = async (selectedKey: any, value: RepositoryDto) => {
		await this.repositorySelected.init(value);
		this.setState({ isLoadDone: !this.state.isLoadDone, isCreate: false, us_operator: value.us_id_operator, openAction: true, visibleTable: false, visibleModalCreateUpdate: true, key: selectedKey })
	}
	deleteRepository = (value: RepositoryDto) => {
		const self = this;
		confirm({
			title: 'Thông báo',
			content: <span>Bạn có muốn xóa kho: <b>{value.re_name}?</b>. Các thay đổi sẽ chỉ thành công khi bạn nhấn nút lưu</span>,
			okText: 'Xác nhận',
			cancelText: 'Hủy',
			async onOk() {
				self.setState({ isLoadDone: true });
				await stores.repositoryStore.deleteRepository(value.re_id);
				self.onSuccess();
				self.setState({ isLoadDone: false });
			},
			onCancel() {

			},
		});

	}
	loopTreeOrganization = (data: TreeRepositoryDto[]) => {
		return data.map((item, index) =>
			<TreeNode
				data={item}
				key={`tree_${item.key}`}
				title={
					<div onMouseLeave={() => this.onMouseLeave()}
						onMouseOver={() => this.onMouseOver(item.key + "_key", item)} style={{ display: 'flex' }}
						onClick={() => { this.openTableForm(item.key + "_key", item) }}>
						<div>
							<span style={this.state.key !== (item.key + "_key") ? { color: "black", fontSize: '16px' } : { color: "green", fontStyle: "italic", fontSize: '16px', fontWeight: 600 }}>{item.re_name}</span>
							&nbsp;
						</div>
						<div>
							{
								this.state.openAction && this.state.selectedKeys == (item.key + "_key") &&
								<Space>
									<Button onClick={(e) => {
										{ this.createRepository(item.key + "_key", item) };
										e.stopPropagation();
									}}
										type='primary'
										style={{ marginLeft: '3px' }}
										icon={<PlusOutlined />}
										title={'Thêm mới '}
										size="small" ></Button>
									<Button icon={<EditOutlined />}
										onClick={(e) => {
											{ this.updateRepository(item.key + "_key", item) };
											e.stopPropagation();
										}}
										title={"Chỉnh sửa"}
										size="small"  ></Button>
									{item.re_parent_id != -1 &&
										<Button danger icon={<DeleteFilled />} onClick={(e) => { e.stopPropagation(); this.deleteRepository(item) }} title={'Xóa'} size="small"></Button>
									}
								</Space>
							}
						</div>
					</div>}>
				{(item.children && item.children.length) && this.loopTreeOrganization(item.children)}
			</TreeNode>
		);
	}
	render() {
		const self = this;
		const { repositoryListResult, totalReponsitory, treeRepositoryDto } = stores.repositoryStore;
		const left = this.state.visibleTable || this.state.visibleModalCreateUpdate ? cssCol(8) : cssCol(24);
		const right = this.state.visibleTable || this.state.visibleModalCreateUpdate ? cssCol(16) : cssCol(0);
		return (
			<Card>
				<Row gutter={[8, 8]} align='bottom'>
					<Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 4)}>
						<strong>Kho quản lý</strong>
						<SelectUserMultiple onChangeUser={async (e) => { await this.setState({ us_id_operator_list: e }); this.handleSubmitSearch() }} us_id_list={this.state.us_id_operator_list} />
					</Col>
					<Col {...cssColResponsiveSpan(24, 24, 8, 8, 8, 8)} style={{ display: "flex", flexWrap: "wrap", gap: 8 }} >
						<Button type="primary" icon={<SearchOutlined />} title="Tìm kiếm" onClick={() => this.handleSubmitSearch()} >Tìm kiếm</Button>
					</Col>
					{isGranted(AppConsts.Permission.Pages_Manager_General_Repository_Export) &&
						<Col {...cssColResponsiveSpan(9, 12, 8, 12, 12, 12)} style={{ display: "flex", flexWrap: "wrap", justifyContent: "end", gap: 8 }}>
							<Button title='Xuất dữ liệu' type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportRepository: true, select: false })}>{'Xuất dữ liệu'}</Button>
						</Col>}
				</Row>
				<Row >
					<Col {...left}>
						<Tree
							icon={<FolderOutlined />}
							showLine
							switcherIcon={<DownOutlined />}
							selectedKeys={this.state.selectedKeys}
							defaultExpandAll={true}
						>
							{this.loopTreeOrganization([treeRepositoryDto])}
						</Tree>

					</Col>
					{
						this.state.visibleModalCreateUpdate &&
						<Col {...right}>
							<CreateOrUpdateRepository
								onCreateUpdateSuccess={this.onSuccess}
								isCreate={this.state.isCreate}
								us_id_operator={this.state.us_operator}
								onCancel={() => this.setState({ visibleModalCreateUpdate: false, selectedKeys: [], key: undefined })}
								repositorySelected={this.repositorySelected}
								treeReponsitory={[treeRepositoryDto]}
							/>
						</Col>
					}
					{this.state.visibleTable &&
						<Col  {...right}>
							<TableRepositoryAdmin
								onSuccess={this.onSuccess}
								actionTable={this.actionTable}
								repositoryListResult={this.repositorySelected != undefined ? [this.repositorySelected] : []}
								changeColumnSortExportRepository={this.changeColumnSort}
								hasAction={true}
								pagination={{
									pageSize: this.state.pageSize,
									total: totalReponsitory,
									current: this.state.currentPage,
									showTotal: (tot) => "Tổng" + ": " + tot + "",
									showQuickJumper: true,
									showSizeChanger: true,
									pageSizeOptions: pageSizeOptions,
									onShowSizeChange(current: number, size: number) {
										self.onChangePage(current, size)
									},
									onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
								}}
							/>
						</Col>
					}
				</Row>
				{this.state.visibleExportRepository &&
					<ModalExportRepositoryAdmin
						repositoryListResult={repositoryListResult}
						visible={this.state.visibleExportRepository}
						onCancel={() => this.setState({ visibleExportRepository: false })}
					/>
				}
				{this.state.visibleRepositoryLogs &&
					<ModalRepositoryLogsAdmin
						repositorySelected={this.repositorySelected}
						visible={this.state.visibleRepositoryLogs}
						onCancel={() => this.setState({ visibleRepositoryLogs: false })}
						pagination={false}
					/>
				}

			</Card >

		)
	}
}