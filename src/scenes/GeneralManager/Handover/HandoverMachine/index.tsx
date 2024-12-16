import { HandoverDto, ImportRepositoryDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, DatePicker, Row, Select, Space, message } from 'antd';
import * as React from 'react';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import { DeleteOutlined, ExportOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { SorterResult } from 'antd/lib/table/interface';
import SelectEnum from '@src/components/Manager/SelectEnum';
import { eHandoverStatus, eHandoverType, eSort } from '@src/lib/enumconst';
import moment from 'moment';
import SelectUserMultiple from '@src/components/Manager/SelectUserMultiple';
import CreateHandover from './components/HandoverDetail/CreateHandover';
import ModalExportHandoverUser from './components/ModalExportHandoverUser';
import { eFormatPicker } from '../../Layout';
import TableHandover from './components/TableHandover';
import { isGranted } from '@src/lib/abpUtility';
const { RangePicker } = DatePicker;

export interface IProps {
	im_re_id?: number;
	modalImport?: boolean;
}
export default class HandoverMachine extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		visibleModalCreateUpdate: false,
		visibleExportExcelImportRepository: false,
		skipCount: 0,
		maxResultCount: 10,
		onChangePage: 1,
		pageSize: 10,
		currentPage: 1,
		clicked: false,
		ma_id_list: undefined,
		gr_id: undefined,
		ha_status: undefined,
		ha_type: undefined,
		sort: undefined,
		selectedOption: "date",
		rangeDatetime: undefined,
		start_date: undefined,
		end_date: undefined,
		handover_user: isGranted(AppConsts.Permission.Pages_Manager_General_Admin_Handover) ? undefined : [stores.sessionStore.getUserLogin().id!],
		receive_user: undefined
	}
	handoverSelected: HandoverDto = new HandoverDto();
	listItemDrink: ImportRepositoryDto[] = [];
	keySelected: number[] = [];
	listimportRepository: ImportRepositoryDto[] = [];
	selectedField: string;
	async componentDidMount() {
		await this.getAll();
	}
	async getAll() {
		this.setState({ isLoadDone: false });
		await stores.handoverStore.getAll(this.state.start_date, this.state.end_date, this.state.handover_user, this.state.receive_user, this.state.ha_status, this.state.ha_type, this.selectedField, this.state.sort, this.state.skipCount, undefined);
		await this.setState({ visibleImportRepositoryDetail: this.props.modalImport != undefined ? true : false })
		this.setState({ isLoadDone: true });
	}

	handleSubmitSearch = async () => {
		this.onChangePage(1, this.state.pageSize);
	}
	createOrUpdateModalOpen = async (input: HandoverDto) => {
		this.setState({ isLoadDone: false })
		this.handoverSelected.init(input);
		await this.setState({ visibleModalCreateUpdate: true });
	}

	actionTable = (importRepositorySelected: HandoverDto, event: EventTable) => {
		if (importRepositorySelected === undefined || importRepositorySelected.ha_id === undefined) {
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
	changeColumnSort = async (sort: SorterResult<HandoverDto> | SorterResult<HandoverDto>[]) => {
		this.setState({ isLoadDone: false });
		this.selectedField = sort["field"];
		await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
		await this.getAll();
		this.setState({ isLoadDone: true });
	}

	onCreateUpdateSuccess = () => {
		this.setState({ isLoadDone: false });
		this.getAll();
		this.setState({ isLoadDone: true, visibleModalCreateUpdate: false, })
	}

	clearSearch = async () => {
		await this.setState({
			handover_user: isGranted(AppConsts.Permission.Pages_Manager_General_Admin_Handover) ? undefined : [stores.sessionStore.getUserLogin().id!],
			receive_user: undefined,
			ha_status: undefined,
			ha_type: undefined,
			ma_id_list: undefined,
			rangeDatetime: undefined,
			start_date: undefined,
			end_date: undefined,
		})
		this.onChangePage(1, this.state.pageSize);
	}
	shouldChangeText = () => {
		const isChangeText = window.innerWidth <= 768;
		return !isChangeText;
	}
	exportData = () => {
		this.setState({ visibleExportExcelImportRepository: true, select: false });

	};
	handleChangeDate = async () => {
		let start_date = !!this.state.rangeDatetime ? moment(this.state.rangeDatetime![0]).startOf(this.state.selectedOption as any).toDate() : undefined;
		let end_date = !!this.state.rangeDatetime?.[1] ?
			moment(this.state.rangeDatetime?.[1]).endOf(this.state.selectedOption as any).toDate() :
			undefined
		this.setState({ start_date: start_date, end_date: end_date })
	}
	render() {
		let self = this;
		const { totalCount, handoverListResult } = stores.handoverStore;
		const left = this.state.visibleModalCreateUpdate ? cssCol(0) : cssCol(24);
		const right = this.state.visibleModalCreateUpdate ? cssCol(24) : cssCol(0);
		const table =  <table >
		<thead>
		  <tr>
			<th>Name</th>
			<th>Age</th>
		  </tr>
		</thead>
	  </table>
		return (
			<Card>
				{!this.state.visibleModalCreateUpdate &&
					<Row gutter={[8, 8]} align='bottom'>
						<Col {...cssColResponsiveSpan(24, 24, 12, 12, 12, 12)}>
							<h1 style={{ fontSize: "x-large" }}>Bàn giao</h1>
						</Col>
						<Col {...cssColResponsiveSpan(24, 24, 12, 12, 12, 12)} style={{ textAlign: "end" }}>
							<Space>
								{this.isGranted(AppConsts.Permission.Pages_Manager_General_Handover_Create) &&
									<Button title='Thêm mới' type="primary" icon={<PlusOutlined />} onClick={() => this.createOrUpdateModalOpen(new HandoverDto())}>{this.shouldChangeText() && 'Thêm mới'}</Button>
								}
								{this.isGranted(AppConsts.Permission.Pages_Manager_General_Handover_Export) &&
									<Button title='Xuất dữ liệu' type="primary" icon={<ExportOutlined />} onClick={() => this.exportData()} >{this.shouldChangeText() && 'Xuất dữ liệu'}</Button>
								}
							</Space>
						</Col>
					</Row>}
				{
					!this.state.visibleModalCreateUpdate &&
					<Row align='bottom' gutter={[8, 8]}>
						<Col {...cssColResponsiveSpan(24, 12, 4, 4, 4, 2)}>
							<strong>Loại</strong>
							<Select
								onChange={async (value) => await this.setState({ selectedOption: value })}
								value={this.state.selectedOption}
								style={{ width: '100%' }}
							>
								<Select.Option value={eFormatPicker.date}>Ngày</Select.Option>
								<Select.Option value={eFormatPicker.month}>Tháng</Select.Option>
								<Select.Option value={eFormatPicker.year}>Năm</Select.Option>
							</Select>
						</Col>
						<Col {...cssColResponsiveSpan(24, 12, 12, 8, 8, 4)}>
							<strong>Khoảng thời gian bàn giao</strong>
							<RangePicker
								style={{ width: "100%" }}
								placeholder={this.state.selectedOption === "date" ? ['Từ ngày', 'Đến ngày'] : (this.state.selectedOption === "month" ? ['Từ tháng', 'Đến tháng'] : ['Từ năm', 'Đến năm'])}
								onChange={async value => {
									await this.setState({ rangeDatetime: value });
									this.handleChangeDate();
									this.handleSubmitSearch();
								}}
								picker={this.state.selectedOption as any}
								format={this.state.selectedOption === "date" ? 'DD/MM/YYYY' : (this.state.selectedOption === "month" ? 'MM/YYYY' : 'YYYY')}
								value={this.state.rangeDatetime as any}
								allowEmpty={[false, true]}
								disabledDate={current => current > moment()}
							/>
						</Col>
						{isGranted(AppConsts.Permission.Pages_Manager_General_Admin_Handover) &&
							<Col {...cssColResponsiveSpan(24, 12, 8, 6, 6, 3)}>
								<strong>Người bàn giao</strong>
								<SelectUserMultiple us_id_list={this.state.handover_user} onChangeUser={async (value) => { await this.setState({ handover_user: value }); this.handleSubmitSearch() }}></SelectUserMultiple>
							</Col>}
						<Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 3)}>
							<strong>Người nhận bàn giao</strong>
							<SelectUserMultiple us_id_list={this.state.receive_user} onChangeUser={async (value) => { await this.setState({ receive_user: value }); this.handleSubmitSearch() }}></SelectUserMultiple>
						</Col>
						<Col {...cssColResponsiveSpan(24, 24, 12, 6, 6, 3)}>
							<strong>Loại bàn giao</strong>
							<SelectEnum enum_value={this.state.ha_type} eNum={eHandoverType} onChangeEnum={async (e) => { await this.setState({ ha_type: e }); this.handleSubmitSearch() }} />
						</Col>
						<Col {...cssColResponsiveSpan(24, 24, 12, 6, 6, 3)}>
							<strong>Trạng thái bàn giao</strong>
							<SelectEnum enum_value={this.state.ha_status} eNum={eHandoverStatus} onChangeEnum={async (e) => { await this.setState({ ha_status: e }); this.handleSubmitSearch() }} />
						</Col>
						<Col className='textAlignCenter-col-992' {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)} style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "start" }} >
							<Button type="primary" icon={<SearchOutlined />} title="Tìm kiếm" onClick={() => this.handleSubmitSearch()} >Tìm kiếm</Button>
							{(!!this.state.ha_status || this.state.ha_status! > -1 || this.state.ha_type! > -1 || !!this.state.ha_type || !!this.state.rangeDatetime || (isGranted(AppConsts.Permission.Pages_Manager_General_Admin_Handover) ? !!this.state.handover_user : "") || !!this.state.receive_user) &&
								<Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >Xóa tìm kiếm</Button>
							}
						</Col>
					</Row>
				}
				<Row>
					<Col {...left}>
						<TableHandover
							openUpdateHandover={(item: HandoverDto) => this.createOrUpdateModalOpen(item)}
							changeColumnSort={this.changeColumnSort}
							hasAction={true}
							isPrint={false}
							noScroll={true}
							handoverListResult={handoverListResult}
							isLoadDone={this.state.isLoadDone}
							pagination={{
								position: ['topRight'],
								pageSize: this.state.pageSize,
								total: totalCount,
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
							<CreateHandover
								isVisible={this.state.visibleModalCreateUpdate}
								onCancel={() => { this.setState({ visibleModalCreateUpdate: false, isLoadDone: true }); this.clearSearch() }}
								actionTable={this.actionTable}
								onSuccess={() => this.getAll()}
								handoverSelected={this.handoverSelected}
							/>
						}
					</Col>
				</Row>
				<ModalExportHandoverUser
					handoverListResult={handoverListResult}
					visible={this.state.visibleExportExcelImportRepository}
					onCancel={() => this.setState({ visibleExportExcelImportRepository: false })}
				/>
			</Card >
		)
	}
}
