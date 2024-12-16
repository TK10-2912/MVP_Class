import { ImportRepositoryDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Input, Row, message } from 'antd';
import * as React from 'react';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import { DeleteOutlined, ExportOutlined, PlusOutlined, SearchOutlined, WarningOutlined } from '@ant-design/icons';
import ModalExportImportRepository from './components/ModalExportImportRepository';
import ImportRepositoryDetail from './components/ImportReponsitoryDetail/ImportRepositoryDetail';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import confirm from 'antd/lib/modal/confirm';
import { SorterResult } from 'antd/lib/table/interface';
import { eSort, eStatusImportRepository } from '@src/lib/enumconst';
import SelectEnumMulti from '@src/components/Manager/SelectEnumMulti';
import ImportRepositoryTableUser from './components/ImportRepositoryTable';
import ImportRepositoryDetailUser from './components/ImportReponsitoryDetail/ImportRepositoryDetail';
export interface IProps {
	im_re_id: number;
	modalImport: boolean;
}
export default class ImportRepositoryUser extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		im_re_code: undefined,
		su_id_list: undefined,
		us_id_list: undefined,
		visibleModalCreateUpdate: false,
		visibleExportExcelImportRepository: false,
		visibleImportRepositoryDetail: false,
		skipCount: 0,
		onChangePage: 1,
		pageSize: 10,
		currentPage: 1,
		expandRowKeys: [],
		numberSelected: undefined,
		select: false,
		clicked: false,
		sort: undefined,
		fieldSort: undefined,
		status: undefined,
	}
	importRepositorySelected: ImportRepositoryDto = new ImportRepositoryDto();
	listItemDrink: ImportRepositoryDto[] = [];
	keySelected: number[] = [];
	listimportRepository: ImportRepositoryDto[] = [];

	async componentDidMount() {
		await this.getAll();
	}
	async getAll() {
		this.setState({ isLoadDone: false })
		const user_id = stores.sessionStore.getUserLogin().id;
		await stores.importRepositoryStore.getAll(this.state.im_re_code, this.state.status, this.state.su_id_list, [user_id], undefined, undefined, this.state.skipCount, undefined);
		const { importRepositoryListResult } = stores.importRepositoryStore;
		const result = this.props.im_re_id != undefined ? importRepositoryListResult.find(item => item.im_re_id == this.props.im_re_id) : new ImportRepositoryDto();
		this.importRepositorySelected = result != undefined ? result : new ImportRepositoryDto();
		await this.setState({ visibleImportRepositoryDetail: this.props.modalImport != undefined ? true : false })
		this.setState({ isLoadDone: true });
	}

	onUpdateSuccess = () => {
		this.setState({ isLoadDone: false });
		this.setState({ isLoadDone: true, })
	}
	handleSubmitSearch = async () => {
		this.onChangePage(1, this.state.pageSize);
	}
	createOrUpdateModalOpen = async (input: ImportRepositoryDto) => {
		this.setState({ isLoadDone: false })
		this.importRepositorySelected.init(input);

		await this.setState({ visibleImportRepositoryDetail: true });
	}

	actionTable = (importRepositorySelected: ImportRepositoryDto, event: EventTable) => {
		if (importRepositorySelected === undefined || importRepositorySelected.im_re_id === undefined) {
			message.error("Không tìm thấy !");
			return;
		}
		if (event === EventTable.RowDoubleClick) {
			this.createOrUpdateModalOpen(importRepositorySelected);
		}
	}
	onChangePage = async (page: number, pagesize?: number) => {
		if (pagesize !== undefined) {
			await this.setState({ pageSize: pagesize! });
		}
		await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
			this.getAll();
		})
	}
	changeColumnSort = async (sort: SorterResult<ImportRepositoryDto> | SorterResult<ImportRepositoryDto>[]) => {
		this.setState({ isLoadDone: false });
		await this.setState({ fieldSort: sort['columnKey'] });
		await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
		await this.getAll();
		this.setState({ isLoadDone: true });
	}
	deleteMulti = async (listIdProduct: number[]) => {
		if (listIdProduct.length < 1) {
			await message.error("Hãy chọn 1 hàng trước khi xóa");
		}
		else {
			let self = this;
			const { totalImportReponsitory } = stores.importRepositoryStore;
			confirm({
				icon: false,
				title: <span><WarningOutlined style={{ fontSize: "23px", color: "orange" }} /> Bạn có muốn <span style={{ color: "red" }}>xóa hàng loạt</span> {listIdProduct.length} dữ liệu ? Thao tác này khi xác nhận <span style={{ color: "red" }}>không thể hoàn tác</span>.</span>,
				okText: 'Xác nhận',
				cancelText: 'Hủy',
				async onOk() {
					if (self.state.currentPage > 1 && (totalImportReponsitory - self.keySelected.length) % 10 == 0) self.onChangePage(self.state.currentPage - 1, self.state.pageSize)
					await stores.importRepositoryStore.deleteMulti(listIdProduct);
					await self.getAll();
					self.keySelected = [];
					message.success("Xóa thành công" + "!")
					self.setState({ isLoadDone: true, numberSelected: 0 });
				},
				onCancel() {
				},
			});
		}
	}
	onCreateUpdateSuccess = () => {
		this.setState({ isLoadDone: false });
		this.getAll();
		this.setState({ isLoadDone: true, visibleModalCreateUpdate: false, })
	}

	clearSearch = async () => {
		await this.setState({
			im_re_code: undefined,
			us_id_list: undefined,
			su_id_list: undefined,
			status: undefined,
		})
		this.handleSubmitSearch();
	}
	hide = () => {
		this.setState({ clicked: false });
	}
	handleVisibleChange = (visible) => {
		this.setState({ clicked: visible });
	}
	shouldChangeText = () => {
		const isChangeText = window.innerWidth <= 768;
		return !isChangeText;
	}
	exportData = () => {
		this.setState({ visibleExportExcelImportRepository: true, select: false });

	};
	openBillImportRepository = async (record: ImportRepositoryDto) => {
		this.setState({ isLoadDone: false });
		await this.importRepositorySelected.init(record);
		this.setState({ visibleImportRepositoryDetail: true, isLoadDone: true });
	}
	render() {
		let self = this;
		const { importRepositoryListResult, totalImportReponsitory } = stores.importRepositoryStore;
		const left = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 12, 10, 10, 10) : cssCol(24);
		const right = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 12, 14, 14, 14) : cssCol(0);
		return (
			<>
				{
					!this.state.visibleImportRepositoryDetail ?
						<Card>
							<Row gutter={[8, 8]} align='bottom'>
								<Col {...cssColResponsiveSpan(24, 12, 12, 6, 4, 3)}>
									<strong>Mã nhập kho</strong>
									<Input
										allowClear={true}
										onChange={async (e) => { await this.setState({ im_re_code: e.target.value }); this.handleSubmitSearch() }} placeholder={"Nhập mã..."}
										value={this.state.im_re_code}
										onPressEnter={(e) => this.onChangePage(1, this.state.pageSize)}

									/>

								</Col>
								<Col {...cssColResponsiveSpan(24, 12, 12, 6, 4, 3)}>
									<strong>Trạng thái</strong>
									<SelectEnumMulti
										enum_value={this.state.status}
										eNum={eStatusImportRepository}
										onChangeEnum={async (value) => { await this.setState({ status: value }); this.handleSubmitSearch() }}
									></SelectEnumMulti>
								</Col>
								<Col {...cssColResponsiveSpan(24, 24, 12, 12, 8, 6)} style={{ display: "flex", flexWrap: "wrap", gap: 8 }} >
									<Button type="primary" icon={<SearchOutlined />} title="Tìm kiếm" onClick={() => this.handleSubmitSearch()} >Tìm kiếm</Button>
									{(!!this.state.su_id_list || !!this.state.im_re_code || !!this.state.us_id_list || !!this.state.status) &&
										<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >Xóa tìm kiếm</Button>
									}
								</Col>
								<Col span={24} style={{ display: "flex", flexWrap: "wrap", justifyContent: "end", gap: 8 }}>
									{this.isGranted(AppConsts.Permission.Pages_Manager_General_ImportRepository_Create) &&

										<Button title='Tạo phiếu nhập hàng' type="primary" icon={<PlusOutlined />} onClick={() => { this.setState({ visibleImportRepositoryDetail: true }); this.importRepositorySelected = new ImportRepositoryDto() }}>{this.shouldChangeText() && 'Tạo phiếu nhập hàng'}</Button>
									}
									{this.isGranted(AppConsts.Permission.Pages_Manager_General_ImportRepository_Export) &&
										<Button title='Xuất dữ liệu' type="primary" icon={<ExportOutlined />} onClick={() => this.exportData()} >{this.shouldChangeText() && 'Xuất danh sách nhập kho dữ liệu'}</Button>
									}
								</Col>
							</Row>
							<Row>
								<Col {...left} >
									<ImportRepositoryTableUser
										changeColumnSort={this.changeColumnSort}
										actionTable={this.actionTable}
										hasAction={true}
										onUpdate={() => this.onUpdateSuccess()}
										isPrint={false}
										noScroll={true}
										openBillImportRepository={this.openBillImportRepository}
										onSuccess={() => this.handleSubmitSearch()}
										importRepostitoryListResult={importRepositoryListResult}
										isLoadDone={this.state.isLoadDone}
										pagination={{
											position: ['topRight'],
											pageSize: this.state.pageSize,
											total: totalImportReponsitory,
											current: this.state.currentPage,
											showTotal: (tot) => ("Tổng: ") + tot + "",
											showQuickJumper: true,
											showSizeChanger: true,
											pageSizeOptions: pageSizeOptions,
											onShowSizeChange(current: number, size: number) {
												self.onChangePage(current, size);
											},
											onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
										}}
									/>
								</Col>
								<Col {...right}>
									{this.state.visibleModalCreateUpdate &&
										<ImportRepositoryDetailUser
											isVisible={this.state.visibleImportRepositoryDetail}
											onCancel={() => this.setState({ visibleImportRepositoryDetail: false })}
											actionTable={this.actionTable}
											onSuccess={() => this.onChangePage(1, this.state.pageSize)}
											importRepostitorySelected={this.importRepositorySelected}
										/>
									}
								</Col>
							</Row>

							<ModalExportImportRepository
								importRepositoryListResult={this.state.select ? this.listimportRepository : importRepositoryListResult}
								visible={this.state.visibleExportExcelImportRepository}
								onCancel={() => this.setState({ visibleExportExcelImportRepository: false })}
							/>
						</Card>
						:
						<ImportRepositoryDetail
							onSuccess={() => this.onChangePage(1, this.state.pageSize)}
							isVisible={this.props.modalImport != undefined ? this.props.modalImport : this.state.visibleImportRepositoryDetail}
							onCancel={() => this.setState({ visibleImportRepositoryDetail: false })}
							actionTable={this.actionTable}
							importRepostitorySelected={this.importRepositorySelected}
						/>
				}
			</>
		)
	}
}
