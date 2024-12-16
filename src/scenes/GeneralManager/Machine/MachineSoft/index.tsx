import * as React from 'react';
import { Col, Row, Button, Card, Input, message, Space } from 'antd';
import { stores } from '@stores/storeInitializer';
import { isGranted, L } from '@lib/abpUtility';
import { DeleteOutlined, ExportOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import AppConsts, { cssCol, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import ModalUpdateSoftWareMachine from './components/ModalUpdateSoftWareMachine';
import { MachineSoftDto } from '@src/services/services_autogen';
import TableMachineSoft from './components/TableMachineSoft';
import ModalExportMachineSoft from './components/ModalExportMachineSoft';
import CreateOrUpdateMachineSoft from './components/CreateOrUpdateMachineSoft';
import SelectedMachineSoft from '@src/components/Manager/SelectedMachineSoft';
import { SorterResult } from 'antd/lib/table/interface';
import { eSort } from '@src/lib/enumconst';

export default class MachineSoft extends React.Component {
	state = {
		isLoadDone: true,
		visibleModalCreateUpdate: false,
		visibleExportExcelFileDocument: false,
		skipCount: 0,
		currentPage: 1,
		pageSize: 10,
		au_version: undefined,
		ma_id: undefined,
		isCreate: false,
		visibleExportExcelDocumentLog: false,
		visibleUpdateMachine: false,
		visibleModalMachineSoftLog: false,
		ma_so_version_name: undefined,
		ma_so_version_code: undefined,
		sort: undefined
	};
	machineSoftSelected: MachineSoftDto = new MachineSoftDto();
	selectedField: string;
	async componentDidMount() {
		await this.getAll();
	}

	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.machineSoftStore.getAll(this.state.ma_so_version_name, this.state.ma_so_version_code, this.selectedField, this.state.sort, this.state.skipCount, this.state.pageSize);
		this.setState({ isLoadDone: true, visibleModalCreateUpdate: false, visibleExportExcelFileDocument: false, visibleExportExcelDocumentLog: false, });
	}
	clearSearch = async () => {
		await this.setState({
			au_version: undefined,
			ma_id: undefined,
			ma_so_version_code: undefined,
			ma_so_version_name: undefined,
		})
		await this.getAll();
	}
	handleSubmitSearch = async () => {
		this.onChangePage(1, this.state.pageSize);
	}

	createOrUpdateModalOpen = async (input: MachineSoftDto) => {
		if (input !== undefined && input !== null) {
			this.machineSoftSelected.init(input);
		}
		await this.setState({ visibleModalCreateUpdate: true });
	}
	onCreateUpdateSuccess = async () => {
		await this.getAll();
	}

	handleSearch = (value: string) => {
		this.setState({ filter: value }, async () => await this.getAll());
	};
	onDoubleClickRow = async (value: MachineSoftDto) => {
		if (value === undefined || value.ma_so_id === undefined) {
			message.error(L('CanNotFound'));
			return;
		}
		this.machineSoftSelected.init(value);
		this.setState({ visibleModalCreateUpdate: true });
	};
	updateSoftWareMachine = () => {
		this.setState({ visibleUpdateMachine: true });
	}
	onChangePage = async (page: number, pagesize?: number) => {
		if (pagesize !== undefined) {
			await this.setState({ pageSize: pagesize! });
		}
		this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
			this.getAll();
		})
	}
	componentWillUnmount() {
		this.setState = (_state, _callback) => {
			return;
		};
	}
	shouldChangeText = () => {
		const isChangeText = window.innerWidth >= 576 && window.innerWidth <= 1393;
		return !isChangeText;
	}
	changeColumnSort = async (sort: SorterResult<MachineSoftDto> | SorterResult<MachineSoftDto>[]) => {
		this.selectedField = sort['field'];
		await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
		await this.getAll();
		this.setState({ isLoadDone: this.state.isLoadDone });

	}
	render() {
		const self = this;
		const left = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(0, 0, 0, 12, 12, 12) : cssCol(24);
		const right = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 24, 12, 12, 12) : cssCol(0);
		const { machineSoftListResult, totalMachineSoft } = stores.machineSoftStore;
		return (
			<Card>
				<Row gutter={[8, 8]}>
					<Col style={{ display: 'flex', alignItems: 'end' }} {...cssColResponsiveSpan(18, 12, 12, 12, 12, 4)} order={1}>
						<h2 style={{ margin: 0 }} onClick={() => { this.setState({ visibleModalMachineSoftLog: true }) }}>{L('Cập nhật phiên bản')}</h2>
					</Col>

					<Col
						xs={{ span: 24, order: 3 }}
						sm={{ span: 12, order: 3 }}
						md={{ span: 8, order: 3 }}
						lg={{ span: 8, order: 3 }}
						xl={{ span: 8, order: 3 }}
						xxl={{ span: 4, order: 2 }}
					>
						<strong>{L("Phiên bản cập nhật")}</strong>
						<Input
							type='number'
							value={this.state.ma_so_version_code}
							allowClear
							onChange={(e) => {
								const value = e.target.value;
								this.setState({ ma_so_version_code: value });
								this.handleSubmitSearch();
							}}
							placeholder={'Nhập tìm kiếm'}
						/>
					</Col>
					<Col
						xs={{ span: 24, order: 4 }}
						sm={{ span: 12, order: 4 }}
						md={{ span: 8, order: 4 }}
						lg={{ span: 8, order: 4 }}
						xl={{ span: 8, order: 4 }}
						xxl={{ span: 4, order: 3 }}
					>
						<strong>{L("Mã phiên bản cập nhật")}</strong>
						<Input value={this.state.ma_so_version_name} allowClear onChange={async (e) => { await this.setState({ ma_so_version_name: e.target.value.trim() }); this.handleSubmitSearch() }}
							placeholder={'Nhập tìm kiếm'} />
					</Col>

					<Col style={{ display: "flex", alignItems: 'end' }} {...cssColResponsiveSpan(24, 12, 12, 5, 5, 6)}
						xs={{ span: 24, order: 5 }}
						sm={{ span: 12, order: 5 }}
						md={{ span: 8, order: 5 }}
						lg={{ span: 8, order: 5 }}
						xl={{ span: 8, order: 5 }}
						xxl={{ span: 6, order: 4 }}
					>

						<Button type="primary" icon={<SearchOutlined />} title="Tìm kiếm" onClick={() => this.handleSubmitSearch()} >Tìm kiếm</Button>
						&nbsp;&nbsp;
						{(!!this.state.ma_so_version_name || !!this.state.ma_so_version_code || !!this.state.ma_id) &&
							<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >{(window.innerWidth < 688) ? 'Xóa' : 'Xóa tìm kiếm'}</Button>
						}
					</Col>
					<Col style={{ display: "flex", alignItems: 'end', justifyContent: 'end' }}
						xs={{ span: 24, order: 22 }}
						sm={{ span: 12, order: 2 }}
						md={{ span: 12, order: 2 }}
						lg={{ span: 12, order: 2 }}
						xl={{ span: 12, order: 2 }}
						xxl={{ span: 6, order: 5 }}
					>

						{isGranted(AppConsts.Permission.Pages_Manager_General_MachineSoft_Create) &&
							<Button type="primary" icon={<PlusOutlined />} onClick={() => { this.createOrUpdateModalOpen(new MachineSoftDto()); this.setState({ isCreate: true }) }}>{window.innerWidth >= 768 && 'Thêm mới'}</Button>
						}
						&nbsp;&nbsp;
						{isGranted(AppConsts.Permission.Pages_Manager_General_MachineSoft_Export) &&
							<Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcelDocumentLog: true })}>{window.innerWidth >= 768 && 'Xuất dữ liệu'}</Button>
						}
					</Col>
				</Row>
				<Row style={{ marginTop: '10px' }}>
					<Col {...left} style={{ overflowY: "auto" }}>
						<TableMachineSoft
							changeColumnSort={this.changeColumnSort}
							onCreateUpdateSuccess={this.onCreateUpdateSuccess}
							onDoubleClickRow={this.onDoubleClickRow}
							createOrUpdateModalOpen={this.createOrUpdateModalOpen}
							machineSoftListResult={machineSoftListResult}
							hasAction={true}
							pagination={{
								position: ['topRight'],
								pageSize: this.state.pageSize,
								total: totalMachineSoft,
								current: this.state.currentPage,
								showTotal: (tot) => <>Tổng: <b>{tot}</b></>,
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
					{this.state.visibleModalCreateUpdate &&
						<Col {...right}>
							<CreateOrUpdateMachineSoft
								machineSoftListResult={machineSoftListResult}
								machineSoftSelected={this.machineSoftSelected}
								onSuccess={() => this.onCreateUpdateSuccess()}
								onCancel={() => { this.setState({ visibleModalCreateUpdate: false }); this.onChangePage(1, this.state.pageSize); }}
							/>
						</Col>
					}
				</Row>
				{
					this.state.visibleExportExcelDocumentLog &&
					<ModalExportMachineSoft
						machineSoftListResult={machineSoftListResult}
						visible={this.state.visibleExportExcelDocumentLog}
						onCancel={() => this.setState({ visibleExportExcelDocumentLog: false })}
					/>
				}
				{this.state.visibleModalCreateUpdate &&
					<ModalUpdateSoftWareMachine
						visible={this.state.visibleUpdateMachine}
						onCancel={() => this.setState({ visibleExportExcelDocumentLog: false })}
					/>
				}
			</Card>

		)
	}
}