import { DeleteOutlined, ExportOutlined, PlusOutlined, SearchOutlined, WarningOutlined } from '@ant-design/icons';
import { ExportRepositoryDto, ImportRepositoryDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Modal, Row, message } from 'antd';
import * as React from 'react';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';
import AuthorizationMachineTable from './ExportRepositoryTableAdmin';
import CreateOrUpdateAuthorizationMachine from './CreateExportRepositoryAdmin';
import ModalExportAuthorizationMachine from './ModalExportExportRepositoryAdmin';
import SelectUserMultiple from '@src/components/Manager/SelectUserMultiple';
import { EventTable, cssCol, cssColResponsiveSpan } from '@src/lib/appconst';
import SelectedSupplier from '@src/components/Manager/SelectedSupplier';
import CreateImportRepository from './CreateExportRepositoryAdmin';
import ImportRepositoryTable from './ExportRepositoryTableAdmin';
import ExportRepositoryTable from './ExportRepositoryTableAdmin';
import ModalExportExportRepository from './ModalExportExportRepositoryAdmin';
import SelectUser from '@src/components/Manager/SelectUser';
import ExportRepositoryTableAdmin from './ExportRepositoryTableAdmin';
import CreateExportRepositoryAdmin from './CreateExportRepositoryAdmin';
import ModalExportExportRepositoryAdmin from './ModalExportExportRepositoryAdmin';
const { confirm } = Modal;

export default class ExportRepositoryAdmin extends React.Component {
	state = {
		isLoadDone: true,
		im_re_code: undefined,
		ma_id_list: undefined,
		us_id_list: undefined,
		visibleModalCreateUpdate: false,
		visibleExportExcelDrink: false,
		visibleModalImport: false,
		visibleInfoDrink: false,
		skipCount: 0,
		maxResultCount: 10,
		onChangePage: 1,
		pageSize: 10,
		currentPage: 1,
		expandRowKeys: [],
	}
	exportRepositorySelected: ExportRepositoryDto = new ExportRepositoryDto();
	listItemDrink: ImportRepositoryDto[] = [];
	async componentDidMount() {
		await this.getAll();
	}

	async getAll() {
		this.setState({ isLoadDone: false })
		await stores.exportRepositoryStore.getAllByAdmin(this.state.us_id_list, this.state.ma_id_list, this.state.skipCount, this.state.maxResultCount);
		this.setState({ isLoadDone: true, });
	}

	handleSubmitSearch = async () => {
		this.onChangePage(1, this.state.pageSize);
	}
	createOrUpdateModalOpen = async (input: ExportRepositoryDto) => {
		this.setState({ isLoadDone: false })
		this.exportRepositorySelected.init(input);
		await this.setState({ visibleModalCreateUpdate: true, isLoadDone: true });
	}

	actionTable = (exportRepositorySelected: ExportRepositoryDto, event: EventTable) => {
		if (exportRepositorySelected === undefined || exportRepositorySelected.ex_re_id === undefined) {
			message.error("Không tìm thấy !");
			return;
		}
		if (event === EventTable.Edit || event === EventTable.RowDoubleClick) {
			this.createOrUpdateModalOpen(exportRepositorySelected);
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
		const { exportRepositoryListResult, totalExportReponsitory } = stores.exportRepositoryStore;
		const left = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 12, 10, 10, 10) : cssCol(24);
		const right = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 12, 14, 14, 14) : cssCol(0);
		return (
			<Card>
				<Row gutter={[8, 8]}>
					<Col {...cssColResponsiveSpan(15, 12, 8, 8, 8, 8)}>
						<h2>Xuất kho lưu trữ</h2>
					</Col>
					<Col {...cssColResponsiveSpan(9, 12, 16, 16, 16, 16)} style={{ display: "flex", flexWrap: "wrap", justifyContent: "end", gap: 8 }}>
						<Button title='Thêm mới' type="primary" icon={<PlusOutlined />} onClick={() => this.createOrUpdateModalOpen(new ExportRepositoryDto())}>{this.shouldChangeText() && 'Thêm mới'}</Button>
						<Button title='Xuất dữ liệu' type="primary" icon={<ExportOutlined />} onClick={() => this.exportData()} >{this.shouldChangeText() && 'Xuất dữ liệu'}</Button>
					</Col>
				</Row>
				<Row gutter={[8, 8]} align='bottom'>
					<Col {...cssColResponsiveSpan(24, 12, 8, 8, 8, 8)}>
						<strong>Người sở hữu</strong>
						<SelectUserMultiple
							us_id_list={this.state.us_id_list}
							onChangeUser={async (value) => { await this.setState({ us_id_list: value }); this.getAll() }}
						></SelectUserMultiple>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 8, 8, 8, 8)}>
						<strong>Máy bán nước</strong>
						<SelectedMachineMultiple
							listMachineId={this.state.ma_id_list}
							onChangeMachine={async (value) => { await this.setState({ ma_id_list: value }); this.getAll() }}
						></SelectedMachineMultiple>
					</Col>
					<Col {...cssColResponsiveSpan(24, 24, 16, 8, 8, 8)} style={{ display: "flex", flexWrap: "wrap", gap: 8 }} >
						{(!!this.state.ma_id_list || !!this.state.us_id_list) &&
							<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >Xóa tìm kiếm</Button>
						}
					</Col>
				</Row>
				<Row>
					<Col {...left} >
						<ExportRepositoryTableAdmin
							actionTable={this.actionTable}
							hasAction={true}
							exportRepostitoryListResult={exportRepositoryListResult}
							isLoadDone={this.state.isLoadDone}
							pagination={{
								pageSize: this.state.pageSize,
								total: totalExportReponsitory,
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
							<CreateExportRepositoryAdmin
								exportRepositorySelected={this.exportRepositorySelected}
								onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
								onCreateUpdateSuccess={this.onCreateUpdateSuccess}
							/>
						}
					</Col>
				</Row>
				<ModalExportExportRepositoryAdmin
					exportRepositoryListResult={exportRepositoryListResult}
					visible={this.state.visibleExportExcelDrink}
					onCancel={() => this.setState({ visibleExportExcelDrink: false })}
				/>
			</Card>
		)
	}
}
