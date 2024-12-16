import { ImportRepositoryDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Input, Row, message } from 'antd';
import * as React from 'react';
import { EventTable, cssCol, cssColResponsiveSpan } from '@src/lib/appconst';
import SelectUserMultiple from '@src/components/Manager/SelectUserMultiple';
import SelectedSupplierMultiple from '@src/components/Manager/SelectedSupplierMultiple';
import { DeleteOutlined, ExportOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import ImportRepositoryTableAdmin from './components/ImportRepositoryTableAdmin';
import ModalExportImportRepositoryAdmin from './components/ModalExportImportRepositoryAdmin';
import ImportRepositoryDetailAdmin from './components/ImportReponsitoryDetail/ImportRepositoryDetail';

export default class ImportRepositoryAdmin extends React.Component {
	state = {
		isLoadDone: true,
		im_re_code: undefined,
		su_id_list: undefined,
		us_id_list: undefined,
		visibleModalCreateUpdate: false,
		visibleExportExcelDrink: false,
		visibleImportRepositoryDetail: false,
		skipCount: 0,
		maxResultCount: 10,
		onChangePage: 1,
		pageSize: 10,
		currentPage: 1,
		expandRowKeys: [],
	}
	importRepositorySelected: ImportRepositoryDto = new ImportRepositoryDto();
	listItemDrink: ImportRepositoryDto[] = [];
	async componentDidMount() {
		await this.getAll();
	}

	async getAll() {
		this.setState({ isLoadDone: false })
		await stores.importRepositoryStore.getAll(this.state.im_re_code, this.state.su_id_list, this.state.skipCount, this.state.maxResultCount);
		this.setState({ isLoadDone: true,visibleModalCreateUpdate:false });
	}

	handleSubmitSearch = async () => {
		this.onChangePage(1, this.state.pageSize);
	}
	createOrUpdateModalOpen = async (input: ImportRepositoryDto) => {
		this.setState({ isLoadDone: false })
		this.importRepositorySelected.init(input);
		await this.setState({ visibleImportRepositoryDetail: true});
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
		})
		this.getAll();
	}
	onRefreshData = () => {
		this.setState({ visibleModalImport: false });
		this.getAll();
	}
	shouldChangeText = () => {
		const isChangeText = window.innerWidth <= 768;
		return !isChangeText;
	}
	exportData = () => {
		this.setState({ visibleExportExcelDrink: true, select: false });

	};

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
							<Row gutter={[8, 8]}>
								<Col {...cssColResponsiveSpan(15, 12, 8, 8, 8, 8)}>
									<h2>Nhập kho lưu trữ</h2>
								</Col>
								<Col {...cssColResponsiveSpan(9, 12, 16, 16, 16, 16)} style={{ display: "flex", flexWrap: "wrap", justifyContent: "end", gap: 8 }}>
									<Button title='Nhập hàng' type="primary" icon={<PlusOutlined />} onClick={() => this.setState({ visibleImportRepositoryDetail: true })}>{this.shouldChangeText() && 'Nhập hàng'}</Button>
									<Button title='Xuất dữ liệu' type="primary" icon={<ExportOutlined />} onClick={() => this.exportData()} >{this.shouldChangeText() && 'Xuất dữ liệu'}</Button>
								</Col>
							</Row>
							<Row gutter={[8, 8]} align='bottom'>
								<Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 4)}>
									<strong>Người sở hữu</strong>
									<SelectUserMultiple
										us_id_list={this.state.us_id_list}
										onChangeUser={async (value) => { await this.setState({ us_id_list: value }); this.getAll() }}
									></SelectUserMultiple>
								</Col>
								<Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 4)}>
									<strong>Mã nhập kho</strong>
									<Input
										allowClear={true}
										onChange={(e) => this.setState({ im_re_code: e.target.value })} placeholder={"Nhập mã..."}
										value={this.state.im_re_code} />
								</Col>
								<Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 4)}>
									<strong>Nhà cung cấp</strong>
									<SelectedSupplierMultiple
										listSupplierId={this.state.su_id_list}
										onChangeSupplier={async (value) => { await this.setState({ su_id_list: value }); this.getAll() }}
									></SelectedSupplierMultiple>
								</Col>
								<Col {...cssColResponsiveSpan(24, 24, 16, 8, 8, 8)} style={{ display: "flex", flexWrap: "wrap", gap: 8 }} >
									<Button type="primary" icon={<SearchOutlined />} title="Tìm kiếm" onClick={() => this.handleSubmitSearch()} >Tìm kiếm</Button>
									{(!!this.state.su_id_list || !!this.state.im_re_code || !!this.state.us_id_list) &&
										<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >Xóa tìm kiếm</Button>
									}
								</Col>
							</Row>
							<Row>
								<Col {...left} >
									<ImportRepositoryTableAdmin
										actionTable={this.actionTable}
										hasAction={true}
										isPrint={false}
										onSuccess={()=>this.getAll()}
										importRepostitoryListResult={importRepositoryListResult}
										isLoadDone={this.state.isLoadDone}
										pagination={{
											pageSize: this.state.pageSize,
											total: totalImportReponsitory,
											current: this.state.currentPage,
											showTotal: (tot) => ("Tổng: ") + tot + "",
											showQuickJumper: true,
											showSizeChanger: true,
											pageSizeOptions: ['10', '20', '50', '100'],
											onShowSizeChange(current: number, size: number) {
												self.onChangePage(current, size);
											},
											onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
										}}
									/>
								</Col>
								<Col {...right}>
									{this.state.visibleModalCreateUpdate &&
										<ImportRepositoryDetailAdmin
										isVisible={this.state.visibleImportRepositoryDetail}
										onCancel={() => this.setState({ visibleImportRepositoryDetail: false })}
										actionTable={this.actionTable}
										importRepostitorySelected={this.importRepositorySelected}
										/>
									}
								</Col>
							</Row>

							<ModalExportImportRepositoryAdmin
								importRepositoryListResult={importRepositoryListResult}
								visible={this.state.visibleExportExcelDrink}
								onCancel={() => this.setState({ visibleExportExcelDrink: false })}
							/>
						</Card>
						:
						<ImportRepositoryDetailAdmin
							isVisible={this.state.visibleImportRepositoryDetail}
							onCancel={() => this.setState({ visibleImportRepositoryDetail: false })}
							actionTable={this.actionTable}
							importRepostitorySelected={this.importRepositorySelected}
						/>
				}
			</>
		)
	}
}
