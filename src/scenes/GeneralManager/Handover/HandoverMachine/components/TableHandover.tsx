import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { isGranted } from '@src/lib/abpUtility';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { HandoverDto } from '@src/services/services_autogen';
import { Button, Image, Table, Tabs, Tag } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { ColumnGroupType, SorterResult } from 'antd/lib/table/interface';
import moment from 'moment';
import * as React from 'react';
import { stores } from '@src/stores/storeInitializer';
import { eHandoverStatus, eHandoverType, valueOfeHandoverStatus, valueOfeHandoverType } from '@src/lib/enumconst';
import DetailInfomationHandOver from './HandoverDetail/DetailInfomationHandOver';
import { EyeOutlined } from '@ant-design/icons';
export interface IProps {
	actionTable?: (item: HandoverDto, event: EventTable) => void;
	pagination: TablePaginationConfig | false;
	isLoadDone?: boolean;
	hasAction?: boolean;
	handoverListResult: HandoverDto[];
	noScroll?: boolean;
	isPrint: boolean;
	onCancel?: () => void;
	openUpdateHandover?: (item: HandoverDto) => void;
	checkExpand?: boolean;
	changeColumnSort?: (fieldSort: SorterResult<HandoverDto> | SorterResult<HandoverDto>[]) => void;
	formatImage?: boolean;
}

export const tabManager = {
	tab_1: "Thông tin bàn giao", 
}
export default class TableHandover extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		ha_id_selected: undefined,
		expandedRowKey: [],
	}
	listIdProduct: number[] = [];
	listItemProduct: HandoverDto[] = [];
	handleExpand = (expanded, record) => {
		if (expanded) {
			this.onCancel();
			this.setState({ expandedRowKey: [record.ha_id], ha_id_selected: record.ha_id });
		} else {
			this.setState({ expandedRowKey: undefined, ha_id_selected: undefined });
		}
	};
	onAction = (item: HandoverDto, action: EventTable) => {
		this.setState({ ha_id_selected: item.ha_id });
		const { actionTable } = this.props;
		if (actionTable !== undefined) {
			actionTable(item, action);
		}
	}

	openUpdateHandover = (item: HandoverDto) => {
		if (!!this.props.openUpdateHandover) {
			this.props.openUpdateHandover(item);
		}
	}
	onCancel = () => {
		if (!!this.props.onCancel) {
			this.props.onCancel();
		}
	}
	render() {
		const { pagination, handoverListResult, hasAction } = this.props
		const { expandedRowKey } = this.state;
		let action: ColumnGroupType<HandoverDto> = {
			title: "", children: [], fixed: 'right', width: 40, key: "action", render: () => <div>
				<Button
					type='primary'
					icon={<EyeOutlined />}
					title="Xem chi tiết"
					size='small'
				></Button>
			</div>
		};
		const columns: ColumnsType<HandoverDto> = [
			{ title: "STT", key: "stt_fresh_drink_index", width: 50, render: (_: string, __: HandoverDto, index: number) => <div>{pagination !== false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
			{
				title: "Ảnh", key: "image", dataIndex: "pr_im_name", width: 100, render: (text: string, item: HandoverDto) =>
					<div style={{ textAlign: "center" }}>
						<Image
							title={item.fi_id_list![0].key}
							className='no-print'
							src={(item.fi_id_list![0] != undefined && item.fi_id_list![0].id != undefined) 
								? item.fi_id_list![0].key!.endsWith(".doc")|| item.fi_id_list![0].key!.endsWith(".docx")
									? "/icon_file_sample/word_icon.png" 
									: item.fi_id_list![0].key!.endsWith(".xlsx")||item.fi_id_list![0].key!.endsWith(".xls")
									  ? "/icon_file_sample/excel_icon.png"
									  : this.getFile(item.fi_id_list![0].id)
								: "error"}
							  
							alt='No image available'
							fallback="data:image/png;base64,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"
						/>
					</div>

			},
			{ title: "Người bàn giao", dataIndex: "handover_user_name", key: "handover_user_name", render: (_: string, item: HandoverDto) => <div> {stores.sessionStore.getUserNameById(item.handover_user)} </div> },
			{ title: "Người nhận bàn giao", dataIndex: "receive_user_name", key: "receive_user_name", render: (_: string, item: HandoverDto) => <div> {stores.sessionStore.getUserNameById(item.receive_user)} </div> },
			{ title: "Số lượng máy bàn giao", sorter: hasAction ? (a: HandoverDto, b: HandoverDto) => (a.ma_id_list?.length || 0) - (b.ma_id_list?.length || 0) : false, dataIndex: "ma_id_list", key: "ma_id_list", render: (_: string, item: HandoverDto) => <div> {item.ma_id_list?.length} </div> },
			{
				title: "Số lượng sản phẩm bàn giao", sorter: hasAction ? (a: HandoverDto, b: HandoverDto) => {
					const totalA = a.productHandoverInputs?.reduce((total, product) => total + product.pr_quantity, 0) || 0;
					const totalB = b.productHandoverInputs?.reduce((total, product) => total + product.pr_quantity, 0) || 0;
					return totalB - totalA;
				} : false, dataIndex: "productHandoverInputs", key: "productHandoverInputs", render: (_: string, item: HandoverDto) => <div> {item.productHandoverInputs?.reduce((total, product) => total + product.pr_quantity, 0)} </div>
			},
			{
				title: "Loại bàn giao",
				width: 150,
				dataIndex: "ha_status",
				key: "ha_status",
				render: (_: string, item: HandoverDto) => (
					<div>
						{hasAction ?
							<>
								{item.ha_type === eHandoverType.HANDOVER_BOTH.num && (
									<Tag color="success">{valueOfeHandoverType(item.ha_type)}</Tag>
								)}
								{item.ha_type === eHandoverType.HANDOVER_ONLYMACHINE.num && (
									<Tag color="warning">{valueOfeHandoverType(item.ha_type)}</Tag>
								)}
								{item.ha_type === eHandoverType.HANDOVER_ONLYPRODUCT.num && (
									<Tag color="gold">{valueOfeHandoverType(item.ha_type)}</Tag>
								)}
								{item.ha_type === eHandoverType.NONE.num && (
									<Tag color="error">{valueOfeHandoverType(item.ha_type)}</Tag>
								)}
							</> :
							valueOfeHandoverType(item.ha_type)
						}
					</div>
				)
			},
			{
				title: "Trạng thái bàn giao",
				width: 150,
				dataIndex: "ha_status",
				key: "ha_status",
				render: (_: string, item: HandoverDto) => (
					<div>
						{hasAction ? (
							<>
								{item.ha_status === eHandoverStatus.HANDOVER_COMPLETE.num && (
									<Tag color="success">Đã hoàn thành</Tag>
								)}
								{item.ha_status === eHandoverStatus.HANDOVER_ONEPART.num && (
									<Tag color="warning">Bàn giao 1 phần</Tag>
								)}
								{item.ha_status === eHandoverStatus.NONE.num && (
									<Tag color="error">Chưa bàn giao</Tag>
								)}
							</>
						) : (
							valueOfeHandoverStatus(item.ha_status)
						)}
					</div>
				)
			},
			{
				title: "Ghi chú", dataIndex: "ha_note", ellipsis: true, key: "ha_note", render: (_: string, item: HandoverDto) => <div
					style={{ marginTop: "14px", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
					dangerouslySetInnerHTML={{ __html: item.ha_note! }}>
				</div>
			},
			{ title: "Ngày tạo", sorter: hasAction, dataIndex: "ha_created_at", key: "ha_created_at", render: (_: string, item: HandoverDto) => <div> {moment(item.ha_created_at).format("DD/MM/YYYY HH:mm:ss")} </div> },
			{ title: "Thời gian cập nhật", sorter: hasAction, dataIndex: "ha_created_at", key: "ha_updated_at", render: (_: string, item: HandoverDto) => <div> {moment(item.ha_updated_at).format("DD/MM/YYYY HH:mm:ss")} </div> },
		];
		if (this.props.hasAction == true) {
			columns.push(action)
		}

		return (
			<Table
				className='centerTable'
				scroll={this.props.noScroll === false ? { x: undefined, y: undefined } : { x: 1200, y: 600 }}
				expandable={
					this.props.isPrint
						? {}
						: {
							expandedRowRender: (record) => (
								<>
									<Tabs defaultActiveKey={tabManager.tab_1}>
										<Tabs.TabPane tab={tabManager.tab_1} key={tabManager.tab_1}>
											<DetailInfomationHandOver
												handoverSelected={record}
												openUpdateHandover={this.openUpdateHandover} />
										</Tabs.TabPane>
									</Tabs>
								</>
							),
							expandRowByClick: true,
							expandIconColumnIndex: -1,
							expandedRowKeys: this.props.checkExpand == true ? [] : expandedRowKey,
							onExpand: (isGranted(AppConsts.Permission.Pages_Manager_General_Handover_Create)) ? this.handleExpand : () => { },
						}
				}
				loading={!this.props.isLoadDone}
				columns={columns}
				size={'small'}
				onChange={(_a, _b, sort: SorterResult<HandoverDto> | SorterResult<HandoverDto>[]) => {
					if (!!this.props.changeColumnSort) {
						this.props.changeColumnSort(sort);
					}
				}}
				onRow={(record) => {
					return {
						onDoubleClick: () => { this.onAction(record!, EventTable.RowDoubleClick) }
					};
				}}
				bordered={true}
				dataSource={handoverListResult.length > 0 ? handoverListResult : []}
				pagination={this.props.pagination}
				rowClassName={(record) => (this.state.ha_id_selected === record.ha_id) ? "bg-click" : "bg-white"}
				rowKey={record => record.ha_id}
			/>
		)
	}
}