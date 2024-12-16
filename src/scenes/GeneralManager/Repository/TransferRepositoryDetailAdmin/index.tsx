import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Input, Modal, Row, message } from 'antd';
import * as React from 'react';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import SelectUserMultiple from '@src/components/Manager/SelectUserMultiple';
import { DeleteOutlined, ExportOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { SorterResult } from 'antd/lib/table/interface';
import { eSort, eTranferRepositoryStatus, valueOfeTranferRepositoryStatus, } from '@src/lib/enumconst';
import SelectEnumMulti from '@src/components/Manager/SelectEnumMulti';
import { ChangeStatusTranferRepositoryInput, TranferRepositoryDto } from '@src/services/services_autogen';
import TranferRepositoryTableAdmin from './components/TranferRepositoryTable';
import TranferRepositoryDetailAdmin from './components/Detail/TranferRepositoryDetail';
import ModalExportTranferRepositoryAdmin from './components/ModalExportTranferRepository';
export interface IProps {
	tr_re_id?: number;
	modalImport?: boolean;
}
const { confirm } = Modal;

export default class TransferRepositoryDetailAdmin extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		tr_re_id: undefined,
		tr_re_code: undefined,
		us_id_list: undefined,
		visibleModalCreateUpdate: false,
		visibleExportExcelTranferRepository: false,
		visibleTranferRepositoryDetail: false,
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
	tranferRepositoryDetailSelected: TranferRepositoryDto = new TranferRepositoryDto();
	listItemDrink: TranferRepositoryDto[] = [];
	keySelected: number[] = [];
	listtranferRepository: TranferRepositoryDto[] = [];

	async componentDidMount() {
		await this.getAll();
	}
	async getAll() {
		this.setState({ isLoadDone: false })
		await stores.transferRepositoryStore.getAllAdmin(this.state.us_id_list, this.state.tr_re_code, this.state.status, this.state.fieldSort, this.state.sort, this.state.skipCount, undefined);
		const { transferRepositoryResult } = stores.transferRepositoryStore;
		const result = this.props.tr_re_id != undefined ? transferRepositoryResult.find(item => item.tr_re_id == this.props.tr_re_id) : new TranferRepositoryDto();
		this.tranferRepositoryDetailSelected = result != undefined ? result : new TranferRepositoryDto();
		await this.setState({ visibleTranferRepositoryDetail: this.props.modalImport != undefined ? true : false })
		this.setState({ isLoadDone: true });
	}

	onUpdateSuccess = () => {
		this.setState({ isLoadDone: false });
		this.setState({ isLoadDone: true, })
	}
	handleSubmitSearch = async () => {
		this.onChangePage(1, this.state.pageSize);
	}
	createOrUpdateModalOpen = async (input: TranferRepositoryDto) => {
		this.setState({ isLoadDone: false })
		this.tranferRepositoryDetailSelected.init(input);

		await this.setState({ visibleTranferRepositoryDetail: true });
	}

	actionTable = (tranferRepositoryDetailSelected: TranferRepositoryDto, event: EventTable, status?: number) => {
		if (tranferRepositoryDetailSelected === undefined || tranferRepositoryDetailSelected.tr_re_id === undefined) {
			message.error("Không tìm thấy !");
			return;
		}
		if (event === EventTable.RowDoubleClick) {
			this.createOrUpdateModalOpen(tranferRepositoryDetailSelected);
		}
		else if (event === EventTable.ChangeStatus) {
			const self = this;
			confirm({
				title: <span>Bạn chắc chắn muốn thay đổi trạng thái thành <span style={{ color: "green" }}>{valueOfeTranferRepositoryStatus(tranferRepositoryDetailSelected.tr_re_status + 1)}</span>?</span>,
				okText: ('Xác nhận'),
				cancelText: ('Huỷ'),
				async onOk() {
					var changeStatusTranferRepositoryInput = new ChangeStatusTranferRepositoryInput();
					changeStatusTranferRepositoryInput.tr_re_id = tranferRepositoryDetailSelected.tr_re_id;
					changeStatusTranferRepositoryInput.tr_re_status = status!;
					await stores.transferRepositoryStore.changeStatus(changeStatusTranferRepositoryInput);
					message.success("Đổi trạng thái thành công!")
					self.setState({ isLoadDone: !self.state.isLoadDone, numberSelected: 0 });
				},
				onCancel() {
				},
			})
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
	changeColumnSort = async (sort: SorterResult<TranferRepositoryDto> | SorterResult<TranferRepositoryDto>[]) => {
		this.setState({ isLoadDone: false });
		await this.setState({ fieldSort: sort['columnKey'] });
		await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
		await this.getAll();
		this.setState({ isLoadDone: true });
	}
	// deleteMulti = async (listIdProduct: number[]) => {
	// 	if (listIdProduct.length < 1) {
	// 		await message.error("Hãy chọn 1 hàng trước khi xóa");
	// 	}
	// 	else {
	// 		let self = this;
	// 		const { totalTransferRepository } = stores.transferRepositoryStore;
	// 		confirm({
	// 			icon: false,
	// 			title: <span><WarningOutlined style={{ fontSize: "23px", color: "orange" }} /> Bạn có muốn <span style={{ color: "red" }}>xóa hàng loạt</span> {listIdProduct.length} dữ liệu ? Thao tác này khi xác nhận <span style={{ color: "red" }}>không thể hoàn tác</span>.</span>,
	// 			okText: 'Xác nhận',
	// 			cancelText: 'Hủy',
	// 			async onOk() {
	// 				if (self.state.currentPage > 1 && (totalTransferRepository - self.keySelected.length) % 10 == 0) self.onChangePage(self.state.currentPage - 1, self.state.pageSize)
	// 				await stores.transferRepositoryStore.deleteMulti(listIdProduct);
	// 				await self.getAll();
	// 				self.keySelected = [];
	// 				message.success("Xóa thành công" + "!")
	// 				self.setState({ isLoadDone: true, numberSelected: 0 });
	// 			},
	// 			onCancel() {
	// 			},
	// 		});
	// 	}
	// }
	onCreateUpdateSuccess = () => {
		this.setState({ isLoadDone: false });
		this.getAll();
		this.setState({ isLoadDone: true, visibleModalCreateUpdate: false, })
	}

	clearSearch = async () => {
		await this.setState({
			tr_re_code: undefined,
			us_id_list: undefined,
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
		this.setState({ visibleExportExcelTranferRepository: true, select: false });

	};
	openBillTranferRepository = async (record: TranferRepositoryDto) => {
		this.setState({ isLoadDone: false });
		await this.tranferRepositoryDetailSelected.init(record);
		console.log(1111111);

		this.setState({ visibleTranferRepositoryDetail: true, isLoadDone: true });
	}
	render() {
		let self = this;
		const { transferRepositoryResult, totalTransferRepository } = stores.transferRepositoryStore;
		const left = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 12, 10, 10, 10) : cssCol(24);
		const right = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 12, 14, 14, 14) : cssCol(0);
		return (
			<>
				{
					!this.state.visibleTranferRepositoryDetail ?
						<Card>
							<Row gutter={[8, 8]} align='bottom'>
								<Col {...cssColResponsiveSpan(24, 12, 12, 6, 4, 3)}>
									<strong>Mã cấp phát</strong>
									<Input
										allowClear={true}
										onChange={async (e) => { await this.setState({ tr_re_code: e.target.value }); this.handleSubmitSearch() }} placeholder={"Nhập mã..."}
										value={this.state.tr_re_code}
										onPressEnter={(e) => this.onChangePage(1, this.state.pageSize)}
									/>

								</Col>
								
									<Col {...cssColResponsiveSpan(24, 12, 12, 6, 4, 3)}>
										<strong>Người vận hành</strong>
										<SelectUserMultiple
											us_id_list={this.state.us_id_list}
											onChangeUser={async (value) => { await this.setState({ us_id_list: value }); this.handleSubmitSearch() }}
										></SelectUserMultiple>
									</Col>

								
								<Col {...cssColResponsiveSpan(24, 12, 12, 6, 4, 3)}>
									<strong>Trạng thái</strong>
									<SelectEnumMulti
										enum_value={this.state.status}
										eNum={eTranferRepositoryStatus}
										onChangeEnum={async (value) => { await this.setState({ status: value }); this.handleSubmitSearch() }}
									></SelectEnumMulti>
								</Col>
								<Col {...cssColResponsiveSpan(24, 24, 12, 12, 8, 6)} style={{ display: "flex", flexWrap: "wrap", gap: 8 }} >
									<Button type="primary" icon={<SearchOutlined />} title="Tìm kiếm" onClick={() => this.handleSubmitSearch()} >Tìm kiếm</Button>
									{( !!this.state.tr_re_code || !!this.state.us_id_list || !!this.state.status) &&
										<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >Xóa tìm kiếm</Button>
									}
								</Col>

								<Col {...cssColResponsiveSpan(24, 24, 12, 12, 8, 9)}style={{ display: "flex", flexWrap: "wrap", justifyContent: "end", gap: 8 }}>
									{/* {!this.isGranted(AppConsts.Permission.Pages_Manager_General_TransferRepository_Create) &&

										<Button title='Nhập hàng' type="primary" icon={<PlusOutlined />} onClick={() => { this.setState({ visibleTranferRepositoryDetail: true }); this.tranferRepositoryDetailSelected = new TranferRepositoryDto() }}>{this.shouldChangeText() && 'Nhập hàng'}</Button>
									} */}
									{!this.isGranted(AppConsts.Permission.Pages_Manager_General_TransferRepository_Export) &&
										<Button title='Xuất dữ liệu' type="primary" icon={<ExportOutlined />} onClick={() => this.exportData()} >{this.shouldChangeText() && 'Xuất danh sách nhập kho dữ liệu'}</Button>
									}
								</Col>

							</Row>
							<Row>
								<Col {...left} >
									<TranferRepositoryTableAdmin
										changeColumnSort={this.changeColumnSort}
										actionTable={this.actionTable}
										hasAction={true}
										onUpdate={() => this.onUpdateSuccess()}
										isPrint={false}
										noScroll={true}
										openBillTranferRepository={this.openBillTranferRepository}
										onSuccess={() => this.handleSubmitSearch()}
										transferRepostitoryListResult={transferRepositoryResult}
										isLoadDone={this.state.isLoadDone}
										pagination={{
											position: ['topRight'],
											pageSize: this.state.pageSize,
											total: totalTransferRepository,
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
										<TranferRepositoryDetailAdmin
											isVisible={this.state.visibleTranferRepositoryDetail}
											onCancel={() => this.setState({ visibleTranferRepositoryDetail: false })}
											actionTable={this.actionTable}
											onSuccess={() => this.onChangePage(1, this.state.pageSize)}
											tranferRepositorySelected={this.tranferRepositoryDetailSelected}
										/>
									}
								</Col>
							</Row>

							<ModalExportTranferRepositoryAdmin
								tranferRepositoryListResult={this.state.select ? this.listtranferRepository : transferRepositoryResult}
								visible={this.state.visibleExportExcelTranferRepository}
								onCancel={() => this.setState({ visibleExportExcelTranferRepository: false })}
							/>
						</Card>
						:
						<TranferRepositoryDetailAdmin
							onSuccess={() => this.onChangePage(1, this.state.pageSize)}
							isVisible={this.props.modalImport != undefined ? this.props.modalImport : this.state.visibleTranferRepositoryDetail}
							onCancel={() => this.setState({ visibleTranferRepositoryDetail: false })}
							actionTable={this.actionTable}
							tranferRepositorySelected={this.tranferRepositoryDetailSelected}
						/>
				}
			</>
		)
	}
}
