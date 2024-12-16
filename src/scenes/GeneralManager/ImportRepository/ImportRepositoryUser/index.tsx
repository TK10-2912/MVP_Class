import { DeleteOutlined, ExportOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { ImportRepositoryDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Input, Modal, Row, message } from 'antd';
import * as React from 'react';
import SelectUserMultiple from '@src/components/Manager/SelectUserMultiple';
import { EventTable, cssCol, cssColResponsiveSpan } from '@src/lib/appconst';
import SelectedSupplier from '@src/components/Manager/SelectedSupplier';
import ImportRepositoryTableUser from './components/ImportRepositoryTableUser';
import CreateImportRepositoryUser from './components/CreateImportRepositoryUser';
import ModalExportImportRepositoryUser from './components/ModalExportImportRepositoryUser';
const { confirm } = Modal;

export default class ImportRepositoryUser extends React.Component {
	state = {
		isLoadDone: true,
		im_re_code: undefined,
		su_id_list: undefined,
		us_id_list: undefined,
		visibleModalCreateUpdate: false,
		visibleExportExcelDrink: false,
		skipCount: 0,
		maxResultCount: 10,
		onChangePage: 1,
		pageSize: 10,
		currentPage: 1,
	}
	importRepositorySelected: ImportRepositoryDto = new ImportRepositoryDto();
	listItemDrink: ImportRepositoryDto[] = [];
	async componentDidMount() {
		await this.getAll();
	}

	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.importRepositoryStore.getAll( this.state.im_re_code, this.state.su_id_list, this.state.skipCount, this.state.maxResultCount);
		this.setState({ isLoadDone: true, });
	}

	handleSubmitSearch = async () => {
		this.onChangePage(1, this.state.pageSize);
	}
	createOrUpdateModalOpen = async (input: ImportRepositoryDto) => {
		this.setState({ isLoadDone: false })
		this.importRepositorySelected.init(input);
		await this.setState({ visibleModalCreateUpdate: true, isLoadDone: true });
	}

	actionTable = (importRepositorySelected: ImportRepositoryDto, event: EventTable) => {
		if (importRepositorySelected === undefined || importRepositorySelected.im_re_id === undefined) {
			message.error("Không tìm thấy !");
			return;
		}
		if (event === EventTable.Edit || event === EventTable.RowDoubleClick) {
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
			ma_id_list: undefined,
			us_id_list: undefined,
			im_re_code: undefined,
		})
		this.getAll();
	}
	onRefreshData = () => {
		this.getAll();
	}
	shouldChangeText = () => {
		const isChangeText = window.innerWidth <= 768;
		return !isChangeText;
	}
	render() {
		let self = this;
		const { importRepositoryListResult, totalImportReponsitory } = stores.importRepositoryStore;
		const left = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 12, 10, 10, 10) : cssCol(24);
		const right = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 12, 14, 14, 14) : cssCol(0);
		return (
			<Card>
				<Row gutter={[8, 8]}>
					<Col {...cssColResponsiveSpan(15, 12, 8, 8, 8, 8)}>
						<h2>Nhập kho lưu trữ User</h2>
					</Col>
					<Col {...cssColResponsiveSpan(9, 12, 16, 16, 16, 16)} style={{ display: "flex", flexWrap: "wrap", justifyContent: "end", gap: 8 }}>
						<Button title='Thêm mới' type="primary" icon={<PlusOutlined />} onClick={() => this.createOrUpdateModalOpen(new ImportRepositoryDto())}>{this.shouldChangeText() && 'Thêm mới'}</Button>
						<Button title='Xuất dữ liệu' type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcelDrink: true, select: false })}>{this.shouldChangeText() && 'Xuất dữ liệu'}</Button>
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
					<Col>
						<strong>Mã nhập kho</strong>
						<Input
							allowClear={true}
							onChange={(e) => this.setState({ im_re_code: e.target.value })} placeholder={"Nhập mã..."} />
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 4)}>
						<strong>Nhà cung cấp</strong>
						<SelectedSupplier
							supplierID={this.state.su_id_list}
							onChangeSupplier={async (value) => { await this.setState({ su_id_list: value }); this.getAll() }}
						></SelectedSupplier>
					</Col>
					<Col {...cssColResponsiveSpan(24, 24, 16, 8, 8, 8)} style={{ display: "flex", flexWrap: "wrap", gap: 8 }} >
						<Button type="primary" icon={<SearchOutlined />} title="Tìm kiếm" onClick={() => this.handleSubmitSearch()} >Tìm kiếm</Button>
						{(!!this.state.su_id_list || !!this.state.us_id_list) &&
							<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >Xóa tìm kiếm</Button>
						}
					</Col>
				</Row>
				<Row>
					<Col {...left} >
						<ImportRepositoryTableUser
							actionTable={this.actionTable}
							hasAction={true}
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
									self.onChangePage(current, size)
								},
								onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
							}}
						/>
					</Col>
					<Col  {...right}>
						{this.state.visibleModalCreateUpdate &&
							<CreateImportRepositoryUser
								importRepositorySelected={this.importRepositorySelected}
								onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
								onCreateUpdateSuccess={this.onCreateUpdateSuccess}
							/>
						}
					</Col>
				</Row>
				<ModalExportImportRepositoryUser
					importRepositoryListResult={importRepositoryListResult}
					visible={this.state.visibleExportExcelDrink}
					onCancel={() => this.setState({ visibleExportExcelDrink: false })}
				/>
			</Card>
		)
	}
}
