import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { TranferRepositoryDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Space, Table, Tabs, Tag, Tooltip } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import { SorterResult } from 'antd/lib/table/interface';
import { CheckCircleOutlined, CheckOutlined, EyeOutlined, FileDoneOutlined, ForwardOutlined } from '@ant-design/icons';
import DetailInfomationTranferRepositoryAdmin from './Detail/DetailInfomationTranferRepositoryAdmin';
import { eTranferRepositoryStatus, valueOfeTranferRepositoryStatus } from '@src/lib/enumconst';

export interface IProps {
	actionTable?: (item: TranferRepositoryDto, event: EventTable, status?: number) => void;
	pagination: TablePaginationConfig | false;
	isLoadDone?: boolean;
	hasAction?: boolean;
	transferRepostitoryListResult: TranferRepositoryDto[],
	noScroll?: boolean;
	isPrint?: boolean,
	onSuccess?: () => void;
	onUpdate?: () => void;
	openBillTranferRepository?: (item: TranferRepositoryDto) => void;
	changeColumnSort?: (fieldSort: SorterResult<TranferRepositoryDto> | SorterResult<TranferRepositoryDto>[]) => void;

}
export const tabManager = {
	tab_1: "Thông tin phiếu nhập",
}
export default class TranferRepositoryTableAdmin extends AppComponentBase<IProps> {
	state = {
		tr_re_id: undefined,
		expandedRowKey: [],
		keyRow: undefined,
	}

	handleExpand = (expanded, record) => {
		if (expanded) {
			// this.onCancel();
			this.setState({ expandedRowKey: [record.tr_re_id], keyRow: record.tr_re_id });
		} else {
			this.setState({ expandedRowKey: undefined });
		}
	};
	onSuccess = () => {
		if (!!this.props.onSuccess) {
			this.props.onSuccess();
		}
	}
	onUpdate = () => {
		if (!!this.props.onUpdate) {
			this.props.onUpdate();
		}
	}
	openBillTranferRepository = (input: TranferRepositoryDto) => {
		if (!!this.props.openBillTranferRepository) {
			this.props.openBillTranferRepository(input)
		}
	}
	render() {
		const { pagination, transferRepostitoryListResult, isPrint, actionTable } = this.props
		const columns: ColumnsType<TranferRepositoryDto> = [
			{ title: "STT", key: "stt_fresh_drink_index", width: 50, render: (text: string, item: TranferRepositoryDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
			{ title: "Mã cấp phát", key: "tr_re_code", render: (text: string, item: TranferRepositoryDto) => <div> {item.tr_re_code} </div> },
			{ title: "Người tạo", key: "us_id_receiver", render: (text: string, item: TranferRepositoryDto) => <div> {stores.sessionStore.getUserNameById(item.us_id_receiver)}</div> },
			{ title: "Tổng SL ", sorter: true, key: "tr_re_total_quantity", render: (text: number, item: TranferRepositoryDto) => <div> {AppConsts.formatNumber(item.tr_re_total_quantity)} </div> },
			{ title: "Tổng giá trị", sorter: true, key: "tr_re_total_money", render: (text: number, item: TranferRepositoryDto) => <div> {AppConsts.formatNumber(item.tr_re_total_money)} </div> },
			{
				title: "Trạng thái", sorter: true, key: "tr_re_status", render: (text: string, item: TranferRepositoryDto) =>
					<div>
						{isPrint ?
							valueOfeTranferRepositoryStatus(item.tr_re_status)
							:
							<>
								{item.tr_re_status === eTranferRepositoryStatus.TEMPORARY.num && (
									<Tag color="magenta">{valueOfeTranferRepositoryStatus(item.tr_re_status)}</Tag>
								)}
								{item.tr_re_status === eTranferRepositoryStatus.REQUEST.num && (
									<Tag color="processing">{valueOfeTranferRepositoryStatus(item.tr_re_status)}</Tag>
								)}
								{item.tr_re_status === eTranferRepositoryStatus.RECEIVED.num && (
									<Tag color="gold">{valueOfeTranferRepositoryStatus(item.tr_re_status)}</Tag>
								)}
								{item.tr_re_status === eTranferRepositoryStatus.CONFIRM.num && (
									<Tag color="geekblue">{valueOfeTranferRepositoryStatus(item.tr_re_status)}</Tag>
								)}
								{item.tr_re_status === eTranferRepositoryStatus.IMPORTED.num && (
									<Tag color="success">{valueOfeTranferRepositoryStatus(item.tr_re_status)}</Tag>
								)}
							</>
						}
					</div>
			},
			{ title: "Thời gian tạo", sorter: true, key: "tr_re_created_at", render: (text: number, item: TranferRepositoryDto) => <div>{moment(item.tr_re_created_at).format("DD/MM/YYYY HH:mm:ss")}</div> },
			{
				title: "Ghi chú",
				key: "tr_re_note", ellipsis: { showTitle: false }, render: (text: number, item: TranferRepositoryDto) =>
					<div style={{
						textOverflow: "ellipsis",
						overflow: "hidden",
					}} title={item.tr_re_note}>{item.tr_re_note}</div>
			},

		];
		let action: any =

		{
			title: "Chức năng", key: "tr_re_note", className: "no-print center", render: (text: number, item: TranferRepositoryDto) =>

				<Space>
					<Button
						type="primary" icon={<EyeOutlined />} title={'Xem chi tiết'}
						size='small'
					></Button>
					

					{
						item.tr_re_status == eTranferRepositoryStatus.REQUEST.num &&
						<Button
							type="primary" icon={<CheckCircleOutlined />} title={'Xác nhận yêu cầu'}
							size='small'
							onClick={(e) => { e.stopPropagation(); actionTable!(item, EventTable.ChangeStatus, eTranferRepositoryStatus.CONFIRM.num) }}
						></Button>

					}

				</Space>
		};
		if (!!this.props.hasAction) {
			columns.push(action);
		}
		return (
			<Table
				scroll={this.props.noScroll == false ? { x: undefined, y: undefined } : { x: 1100, y: 600 }}
				className='centerTable '
				onRow={(record, rowIndex) => {
					return {
						style: { cursor: 'pointer' },
						title: "Xem chi tiết",
					};
				}}
				columns={columns}
				bordered={true}
				size={'small'}
				expandable={
					this.props.isPrint
						? {}
						: {
							expandedRowRender: (record) => (
								<>
									{/* {this.props.onCancel != undefined && this.props.onCancel()} */}
									<Tabs defaultActiveKey={tabManager.tab_1}>
										<Tabs.TabPane tab={tabManager.tab_1} key={tabManager.tab_1}>
											<DetailInfomationTranferRepositoryAdmin onUpdate={() => this.onUpdate()} openBillTranferRepository={() => this.openBillTranferRepository(record)} onSuccess={this.onSuccess} listProductTranfer={record.listProductTranfer} transferRepostitorySelected={record} />
										</Tabs.TabPane>
									</Tabs>
								</>
							),
							expandRowByClick: true,
							expandIconColumnIndex: -1,
							expandedRowKeys: this.state.expandedRowKey,
							onExpand: this.handleExpand,
						}
				}
				
				dataSource={transferRepostitoryListResult}
				pagination={this.props.pagination}
				rowClassName={(record) => (this.state.keyRow === record.tr_re_id) ? "bg-click" : "bg-white"}
				rowKey={record => record.tr_re_id}
				onChange={(a, b, sort: SorterResult<TranferRepositoryDto> | SorterResult<TranferRepositoryDto>[]) => {
					if (!!this.props.changeColumnSort) {
						this.props.changeColumnSort(sort);
					}
				}}
			/>
		)
	}
}