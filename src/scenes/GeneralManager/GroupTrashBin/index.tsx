
import { ExportOutlined, PlusCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { isGranted, L } from '@src/lib/abpUtility';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Input, Modal, Row, Space, message } from 'antd';
import confirm from 'antd/lib/modal/confirm';
import * as React from 'react';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import TableGroupTrashBin from './components/TableGroupTrashBin';
import { GroupTrashbinDto } from '@src/services/services_autogen';
import CreateOrUpdateGroupTrashBin from './components/CreateOrUpdateGroupTrashBin';
import ModalExportGroupTrashBin from './components/ModalExportGroupTrashBin';

export default class GroupTrashBin extends React.Component<any> {
	state = {
		isLoadDone: false,
		visibleModalCreateUpdate: false,
		visibleModalViewMachine: false,
		visibleModalExcel: false,
		gr_tr_search: undefined,
		skipCount: 0,
		maxResultCount: 10,
		pageSize: 10,
		currentPage: 1,
	}
	groupTrashBinSelected: GroupTrashbinDto = new GroupTrashbinDto();
	async componentDidMount() {
		await this.getAll();
	}

	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.groupTrashBinStore.getAll(this.state.gr_tr_search, this.state.pageSize, undefined);
		this.setState({ isLoadDone: true });
	}

	onChangePage = async (page: number, pagesize?: number) => {
		if (pagesize !== undefined) {
			await this.setState({ pageSize: pagesize! });
		}
		this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
			this.getAll();
		})
	}

	handleSubmitSearch = async () => {
		this.onChangePage(1, this.state.pageSize);
	}
	createOrUpdateModalOpen = async (input: GroupTrashbinDto) => {
		if (input !== undefined && input !== null) {
			this.groupTrashBinSelected.init(input);
			await this.setState({ visibleModalCreateUpdate: true });
		}
		this.setState({ visibleModalCreateUpdate: true })
	}
	actionTable = (item: GroupTrashbinDto, event: EventTable) => {
		let nhommay = (
			<div>
				Bạn có muốn xoá nhóm thúng rác <strong>{item.gr_tr_name}?</strong>
			</div>
		)
		let self = this;
		if (event === EventTable.Edit || event === EventTable.RowDoubleClick) {
			this.createOrUpdateModalOpen(item);
		}
		if (event === EventTable.Delete) {
			confirm({
				title: nhommay,
				okText: L('Xác nhận'),
				cancelText: L('Hủy'),
				async onOk() {
					self.setState({ isLoadDone: false });
					await stores.groupTrashBinStore.delete(item);
					message.success("Xóa thành công !")
					await self.getAll();
					stores.sessionStore.getCurrentLoginInformations();
					self.setState({ isLoadDone: true });
				},
			});
		}
	}

	createSuccess = () => {
		this.setState({ isLoadDone: false });
		this.getAll();
		this.setState({ isLoadDone: true, visibleModalCreateUpdate: false });
	}
	render() {
		let self = this;
		const left = this.state.visibleModalCreateUpdate ? cssCol(14) : cssCol(24);
		const right = this.state.visibleModalCreateUpdate ? cssCol(10) : cssCol(0);
		const { groupTrashBinListResult, totalGroupTrashBin } = stores.groupTrashBinStore;

		return (
			<Card>
				<Row gutter={[8, 8]}>
					<Col {...cssColResponsiveSpan(24, 24, 12, 16, 16, 16)} style={{ display: 'flex' }}>
						<Input style={{ width: '90%', height: "32px" }} placeholder={"Nhập tìm kiếm nhóm thùng rác..."} allowClear onChange={(e) => { this.setState({ gr_tr_search: e.target.value.trim() }); this.handleSubmitSearch() }} onPressEnter={() => this.handleSubmitSearch()}></Input> &nbsp;
						<Button type='primary' onClick={() => this.handleSubmitSearch()}><SearchOutlined />Tìm kiếm</Button>
					</Col>
					<Col {...cssColResponsiveSpan(24, 24, 12, 8, 8, 8)} style={{ textAlign: 'right' }}>
						<Space>
							{isGranted(AppConsts.Permission.Pages_Manager_General_GroupMachine_Create) &&
								<Button type='primary' icon={<PlusCircleOutlined />} onClick={() => this.createOrUpdateModalOpen(new GroupTrashbinDto())}> Thêm mới</Button>
							}
							{isGranted(AppConsts.Permission.Pages_Manager_General_GroupMachine_Export) &&
								<Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleModalExcel: true })}>Xuất dữ liệu</Button>
							}
						</Space>
					</Col>

				</Row>
				<Row>
					<Col {...left}>
						<TableGroupTrashBin
							groupTrashBinListResult={groupTrashBinListResult}
							hasAction={true}
							actionTable={this.actionTable}
							pagination={{
								position: ['topRight'],
								pageSize: this.state.pageSize,
								total: totalGroupTrashBin,
								current: this.state.currentPage,
								showTotal: (tot) => ("Tổng: ") + tot + "",
								showQuickJumper: true,
								showSizeChanger: true,
								pageSizeOptions: pageSizeOptions,
								onShowSizeChange(current: number, size: number) {
									self.onChangePage(current, size)
								},
								onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
							}} />
					</Col>
					{
						this.state.visibleModalCreateUpdate &&
						<Col {...right}>
							<CreateOrUpdateGroupTrashBin groupTrashBinSelected={this.groupTrashBinSelected} onCancel={() => this.setState({ visibleModalCreateUpdate: false })} createSuccess={this.createSuccess} />
						</Col>
					}
				</Row>
				{
					this.state.visibleModalExcel &&
					<ModalExportGroupTrashBin groupTrashBinListResult={groupTrashBinListResult} onCancel={() => this.setState({ visibleModalExcel: false })} visible={this.state.visibleModalExcel} />
				}
			</Card >
		)
	}
}
