import * as React from 'react';
import { Button, Modal, Popover, Space, Table, Tabs } from 'antd';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { TrashBinDto, TrashBinLogsDto } from '@src/services/services_autogen';
import { CaretDownOutlined, DeleteFilled, EditOutlined, EnvironmentOutlined, SendOutlined, UnorderedListOutlined } from '@ant-design/icons';
import AppConsts, { EventTable } from '@src/lib/appconst';
import moment from 'moment';
import { isGranted } from '@src/lib/abpUtility';
import { valueOfeTrashType } from '@src/lib/enumconst';
import { ExpandableConfig, TableRowSelection } from 'antd/lib/table/interface';
import { stores } from '@src/stores/storeInitializer';
import MapComponent from '@src/components/MapComponent';

export interface IProps {
	actionTable?: (item: TrashBinDto, event: EventTable) => void;
	onCreateSuccess?: () => void;
	onCancel?: () => void;
	trashListResult: TrashBinDto[];
	hasAction?: boolean;
	noScroll?: boolean;
	pagination: TablePaginationConfig | false;
	isPrint: boolean;
	checkExpand: boolean;
	rowSelection?: TableRowSelection<TrashBinDto>
	expandable?: ExpandableConfig<TrashBinDto>;
	tr_id_selected?: number
}

export default class TableTrashBin extends AppComponentBase<IProps> {
	state = {
		isLoadDone: false,
		tr_id_selected: undefined,
		expandedRowKey: [],
		listIdTrashBin: 0,
		sort: undefined,
		clickedAction: true,
		visibleModalGoogleMap: false,
		tr_id_hover: undefined,

	};
	selectedField: string;
	trashBinSelected: TrashBinDto = new TrashBinDto();
	onAction = (item: TrashBinDto, action: EventTable) => {
		const { actionTable } = this.props;
		if (actionTable !== undefined) {
			actionTable(item, action);
		}
	};
	onCancel = () => {
		if (!!this.props.onCancel) {
			this.props.onCancel();
		}
	};
	handleVisibleChangeAction = (visible, item: TrashBinDto) => {
		this.setState({ clickedAction: visible, tr_id_hover: item.tr_id });
	}
	isValidLocation = async (item: TrashBinDto,) => {
		this.trashBinSelected.init(item);
		await this.setState({ visibleModalGoogleMap: true, })
	};
	render() {
		let action: ColumnGroupType<TrashBinDto> = {
			title: 'Chức năng',
			fixed: 'right',
			children: [],
			key: 'action_Supplier_index',
			className: 'no-print center',
			width: 100,
			render: (text: string, item: TrashBinDto) => (
				<Popover style={{ width: 200 }} visible={this.state.clickedAction && this.state.tr_id_hover == item.tr_id} onVisibleChange={(e) => this.handleVisibleChangeAction(e, item)} placement="bottom" content={

					<Space>
						{isGranted(AppConsts.Permission.Pages_Manager_General_Trashbin_Update) && (
							<Button
								type="primary"
								icon={<EditOutlined />}
								title={'Sửa'}
								size="small"
								onClick={(e) => {
									e.stopPropagation();
									this.onAction(item!, EventTable.Edit);
								}}
							></Button>
						)}
						{isGranted(AppConsts.Permission.Pages_Manager_General_Trashbin_Delete) && (
							<Button
								danger
								icon={<DeleteFilled />}
								title={'Xóa'}
								size="small"
								onClick={(e) => {
									e.stopPropagation();
									this.onAction(item!, EventTable.Delete);
								}}
							></Button>
						)}
						{
							AppConsts.isValidLocation(item.tr_lat.toString(), item.tr_lng.toString()) ?
								<>
									<Button title='Vị trí' size='small' icon={<EnvironmentOutlined />} onClick={(event) => {
										event.stopPropagation();
										this.isValidLocation(item,);
									}}>
									</Button>
									<Button
										icon={<SendOutlined />} title={"Chỉ đường"}
										size='small'
										onClick={(e) => {
											AppConsts.actionDirection(item.tr_lat!.toString(), item.tr_lng!.toString());
											e.stopPropagation();
										}}
									></Button>
								</>
								:
								item.tr_urlMap ?
									<Button
										size='small'
										icon={<EnvironmentOutlined />} title={"Vị trí máy"}
										onClick={(e) => {
											e.stopPropagation();
											this.isValidLocation(item);
										}}
									></Button>
									: ""
						}
					</Space>
				} trigger={"hover"} >
					<Button size='small' icon={this.state.clickedAction && this.state.tr_id_hover == item.tr_id ? <CaretDownOutlined /> : <UnorderedListOutlined />}></Button>
				</Popover>
			),
		};
		const columns: ColumnsType<TrashBinDto> = [
			{
				title: 'STT',
				key: 'stt_fresh_drink_index',
				width: 50,
				render: (text: string, item: TrashBinDto, index: number) => (
					<div>
						{this.props.pagination !== false
							? this.props.pagination.pageSize! * (this.props.pagination.current! - 1) + (index + 1)
							: index + 1}
					</div>
				),
			},
			{
				title: 'Tên trạm',
				dataIndex: 'tr_name',
				key: 'tr_name',
				render: (text: string, item: TrashBinDto) => <div> {item.tr_name} </div>,
			},
			{
				title: 'Nhóm thùng rác',
				dataIndex: 'gr_tr_id',
				key: 'gr_tr_id',
				render: (text: string, item: TrashBinDto) => <div> {stores.sessionStore.getNameGroupTrashBin(item.gr_tr_id)} </div>,
			},
			{
				title: 'Địa chỉ MAC',
				dataIndex: 'deviceMAC',
				key: 'deviceMAC',
				render: (text: string, item: TrashBinDto) => <div> {item.deviceMAC} </div>,
			},
			{
				title: 'Tổng lượng rác(kg)',
				dataIndex: 'tr_total_trash',
				key: 'tr_total_trash',
				sorter: (a: TrashBinDto, b: TrashBinDto) => a.tr_total_trash - b.tr_total_trash,
				render: (text: string, item: TrashBinDto) => (
					<div> {AppConsts.formatNumber(item.tr_total_trash / 1000)} </div>
				),
			},

			{
				title: 'Số tiền quy đổi hiện tại / 1kg (VND/kg)',
				dataIndex: 'tr_tien_quy_doi_theo_rac',
				key: 'tr_tien_quy_doi_theo_rac',
				sorter: (a: TrashBinDto, b: TrashBinDto) => a.tr_tien_quy_doi_theo_rac - b.tr_tien_quy_doi_theo_rac,
				render: (text: string, item: TrashBinDto) => (
					<div> {AppConsts.formatNumber(item.tr_tien_quy_doi_theo_rac)} </div>
				),
			},

			{
				title: 'Tổng tiền quy đổi theo rác (VND)',
				dataIndex: 'tr_tong_tien_quy_doi_theo_rac',
				key: 'tr_tong_tien_quy_doi_theo_rac',
				sorter: (a: TrashBinDto, b: TrashBinDto) => a.tr_tong_tien_quy_doi_theo_rac - b.tr_tong_tien_quy_doi_theo_rac,
				render: (text: string, item: TrashBinDto) => (
					<div> {AppConsts.formatNumber(item.tr_tong_tien_quy_doi_theo_rac)} </div>
				),
			},

			{ title: "Loại rác", dataIndex: "tr_type", key: "tr_type", render: (text: string, item: TrashBinDto) => <div> {valueOfeTrashType(item.tr_type)} </div> },
			{
				title: 'Ngày tạo',
				dataIndex: 'tr_created_at',
				key: 'tr_created_at',
				sorter: (a: TrashBinDto, b: TrashBinDto) => {
					const dateA = moment(a.tr_created_at);
					const dateB = moment(b.tr_created_at);
					return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0;
				},
				defaultSortOrder: 'descend',
				render: (text: string, item: TrashBinDto) => (
					<div> {moment(item.tr_created_at).format('DD/MM/YYYY HH:mm')} </div>
				),
			},

			{
				title: 'Ghi chú',
				dataIndex: 'tr_note',
				key: 'tr_note',
				width: "20%",
				render: (text: string, item: TrashBinDto) => <div dangerouslySetInnerHTML={{ __html: item.tr_note! }}></div>,
			},
		];
		if (this.props.hasAction !== undefined && this.props.hasAction) {
			if (
				isGranted(AppConsts.Permission.Pages_Manager_General_Trashbin_Delete) ||
				isGranted(AppConsts.Permission.Pages_Manager_General_Trashbin_Update)
			) {
				columns.push(action);
			}
		}
		return (
			<>
				<Table
					className="centerTable"
					size="small"
					scroll={this.props.isPrint ? { x: undefined, y: undefined } : { x: 1000 }}
					bordered={true}
					dataSource={this.props.trashListResult}
					columns={columns}
					expandable={
						this.props.isPrint
							? {}
							: this.props.expandable
					}
					pagination={this.props.pagination}
					rowClassName={(record, index) =>
						this.props.tr_id_selected === record.tr_id ? 'bg-click' : 'bg-white'
					}
					rowKey={(record) => record.tr_id}
					rowSelection={this.props.rowSelection}
				/>
				<Modal
					centered
					visible={this.state.visibleModalGoogleMap}
					onCancel={() => this.setState({ visibleModalGoogleMap: false })}
					title={<h3>{"Vị trí thùng rác: " + this.trashBinSelected.tr_name}</h3>}
					width={'70vw'}
					footer={null}
				>

					{(this.trashBinSelected.tr_lat && this.trashBinSelected.tr_lng) ?
						<MapComponent
							centerMap={{ lat: this.trashBinSelected.tr_lat, lng: this.trashBinSelected.tr_lng }}
							zoom={15}
							positionList={[{ lat: this.trashBinSelected.tr_lat, lng: this.trashBinSelected.tr_lng, title: "Vị trí máy" }]}
						/>
						:
						<div dangerouslySetInnerHTML={{ __html: this.trashBinSelected.tr_urlMap! }} />
					}
				</Modal>
			</>
		);
	}
}
