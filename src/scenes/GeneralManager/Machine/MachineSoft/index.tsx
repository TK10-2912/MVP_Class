import * as React from 'react';
import { Col, Row, Button, Card, Input, message, Space } from 'antd';
import { stores } from '@stores/storeInitializer';
import { isGranted, L } from '@lib/abpUtility';
import { DeleteOutlined, ExportOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import AppConsts, { cssCol, cssColResponsiveSpan } from '@src/lib/appconst';
import ModalUpdateSoftWareMachine from './components/ModalUpdateSoftWareMachine';
import { MachineSoftDto } from '@src/services/services_autogen';
import TableMachineSoft from './components/TableMachineSoft';
import ModalExportMachineSoft from './components/ModalExportMachineSoft';
import CreateOrUpdateMachineSoft from './components/CreateOrUpdateMachineSoft';
import SelectedMachineSoft from '@src/components/Manager/SelectedMachineSoft';

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
	};
	machineSoftSelected: MachineSoftDto = new MachineSoftDto();

	async componentDidMount() {
		await this.getAll();
	}

	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.machineSoftStore.getAll(this.state.ma_so_version_name, this.state.ma_so_version_code, this.state.ma_id, this.state.skipCount, this.state.pageSize);
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
	onDoubleClickRow = (value: MachineSoftDto) => {
		if (value === undefined || value.ma_so_id === undefined) {
			message.error(L('CanNotFound'));
			return;
		}
		this.machineSoftSelected.init(value);
		this.createOrUpdateModalOpen(this.machineSoftSelected);
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
		this.setState = (state, callback) => {
			return;
		};
	}
	shouldChangeText = () => {
		const isChangeText = window.innerWidth >= 576 && window.innerWidth <= 1393;
		return !isChangeText;
	}
	render() {
		const self = this;
		const left = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(0, 0, 0, 12, 12, 12) : cssCol(24);
		const right = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 24, 12, 12, 12) : cssCol(0);
		const { machineSoftListResult, totalMachineSoft } = stores.machineSoftStore;
		return (
			<Card>
				<Row>
					<Col {...cssColResponsiveSpan(18, 12, 12, 12, 12, 12)}>
						<h2 onClick={() => { this.setState({ visibleModalMachineSoftLog: true }) }}>{L('Cập nhật')}</h2>
					</Col>

					<Col {...cssColResponsiveSpan(6, 12, 12, 12, 12, 12)}>
						<Space style={{ display: 'flex', justifyContent: 'right', }}>
							{isGranted(AppConsts.Permission.Pages_Manager_General_Image_Create) &&
								<Button type="primary" icon={<PlusOutlined />} onClick={() => { this.createOrUpdateModalOpen(new MachineSoftDto()); this.setState({ isCreate: true }) }}>{window.innerWidth >= 768 && 'Thêm mới'}</Button>
							}
							{isGranted(AppConsts.Permission.Pages_Manager_General_MachineSoft_Export) &&
								<Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcelDocumentLog: true })}>{window.innerWidth >= 768 && 'Xuất dữ liệu'}</Button>
							}
						</Space>
					</Col>
				</Row>
				<Row gutter={[8, 8]} align='bottom'>
					<Col {...cssColResponsiveSpan(24, 12, 12, 5, 5, 6)}>
						<strong>{L("Phiên bản")}</strong>
						<Input value={this.state.ma_so_version_name} allowClear onChange={(e) => this.setState({ ma_so_version_name: e.target.value.trim() })}
							onPressEnter={this.handleSubmitSearch}
							placeholder={'Nhập tìm kiếm'} />
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 12, 5, 5, 6)}>
						<strong>{L("Mã phiên bản")}</strong>
						<Input
							value={this.state.ma_so_version_code}
							allowClear
							onChange={(e) => {
								const value = e.target.value;
								const sanitizedValue = value.replace(/[^0-9]/g, ''); // Loại bỏ tất cả ký tự không phải là số
								this.setState({ ma_so_version_code: sanitizedValue.trim() });
							}}
							onPressEnter={this.handleSubmitSearch}
							placeholder={'Nhập tìm kiếm'}
						/>
					</Col>

					<Col {...cssColResponsiveSpan(24, 12, 12, 5, 5, 6)}>
						<strong>Máy bán nước</strong><br />
						<SelectedMachineSoft
							onChangeMachine={(value) => { this.setState({ ma_id: value }); this.getAll() }}
							machineId={this.state.ma_id}
						></SelectedMachineSoft>
					</Col>
					<Col {...cssColResponsiveSpan(24, 12, 12, 9, 9, 6)}>
						<Space>
							<Button type="primary" icon={<SearchOutlined />} title="Tìm kiếm" onClick={() => this.handleSubmitSearch()} >Tìm kiếm</Button>
							{(this.state.ma_so_version_name != undefined || this.state.ma_so_version_code || this.state.ma_id != undefined) &&
								<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >{(window.innerWidth < 688) ? 'Xóa' : 'Xóa tìm kiếm'}</Button>
							}
						</Space>
					</Col>
				</Row>
				<Row style={{ marginTop: '10px' }}>
					<Col {...left} style={{ overflowY: "auto" }}>
						<TableMachineSoft
							onCreateUpdateSuccess={this.onCreateUpdateSuccess}
							onDoubleClickRow={this.onDoubleClickRow}
							createOrUpdateModalOpen={this.createOrUpdateModalOpen}
							machineSoftListResult={machineSoftListResult}
							hasAction={true}
							pagination={{
								pageSize: this.state.pageSize,
								total: totalMachineSoft,
								current: this.state.currentPage,
								showTotal: (tot) => "Tổng" + ": " + tot + "",
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
					{this.state.visibleModalCreateUpdate &&
						<Col {...right}>
							<CreateOrUpdateMachineSoft
								machineSoftSelected={this.machineSoftSelected}
								onSuccess={() => this.onCreateUpdateSuccess()}
								onCancel={() => { this.setState({ visibleModalCreateUpdate: false }); this.getAll(); }}
							/>
						</Col>
					}
				</Row>
				<ModalExportMachineSoft
					machineSoftListResult={machineSoftListResult}
					visible={this.state.visibleExportExcelDocumentLog}
					onCancel={() => this.setState({ visibleExportExcelDocumentLog: false })}
				/>
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