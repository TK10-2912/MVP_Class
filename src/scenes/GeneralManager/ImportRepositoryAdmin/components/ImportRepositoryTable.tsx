import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { ImportRepositoryDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Table, Tabs, Tag, Tooltip } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import DetailInfomationImportRepositoryAdmin from './ImportReponsitoryDetail/DetailInfomationImportRepositoryAdmin';
import { SorterResult } from 'antd/lib/table/interface';
import { EyeOutlined } from '@ant-design/icons';

export interface IProps {
	actionTable?: (item: ImportRepositoryDto, event: EventTable) => void;
	pagination: TablePaginationConfig | false;
	isLoadDone?: boolean;
	hasAction?: boolean;
	importRepostitoryListResult: ImportRepositoryDto[],
	noScroll?: boolean;
	isPrint?: boolean,
	onSuccess?: () => void;
	onUpdate?: () => void;
	openBillImportRepository?: (item: ImportRepositoryDto) => void;
	changeColumnSort?: (fieldSort: SorterResult<ImportRepositoryDto> | SorterResult<ImportRepositoryDto>[]) => void;

}
export const tabManager = {
	tab_1: "Thông tin phiếu nhập",
}
export default class ImportRepositoryTableAdmin extends AppComponentBase<IProps> {
	state = {
		im_re_id: undefined,
		expandedRowKey: [],
		keyRow: undefined,
	}
	handleExpand = (expanded, record) => {
		if (expanded) {
			// this.onCancel();
			this.setState({ expandedRowKey: [record.im_re_id], keyRow: record.im_re_id });
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
	openBillImportRepository = (input: ImportRepositoryDto) => {
		if (!!this.props.openBillImportRepository) {
			this.props.openBillImportRepository(input)
		}
	}
	render() {
		const { pagination, importRepostitoryListResult, isPrint } = this.props
		const columns: ColumnsType<ImportRepositoryDto> = [
			{ title: "STT", key: "stt_fresh_drink_index", width: 50, render: (text: string, item: ImportRepositoryDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
			{ title: "Mã nhập kho", key: "im_re_code", render: (text: string, item: ImportRepositoryDto) => <div> {item.im_re_code} </div> },
			{ title: "Tổng số lượng", sorter: true, key: "im_re_total_quantity", render: (text: string, item: ImportRepositoryDto) => <div> {AppConsts.formatNumber(item.im_re_total_quantity)} </div> },
			{ title: "Tổng tiền nhập", sorter: true, key: "im_re_total_money", render: (text: number, item: ImportRepositoryDto) => <div> {AppConsts.formatNumber(item.im_re_total_money) + " đ"} </div> },
			{
				title: "Trạng thái", key: "im_re_status", dataIndex: 'im_re_status', render: (text: string, item: ImportRepositoryDto) => (
					<>{isPrint ?
						<>
							{item.im_re_status ?
								<>Đã nhập kho</>
								:
								<>Phiếu tạm</>
							}
						</> :
						<>
							{item.im_re_status ?
								<Tag color='success'>Đã nhập kho</Tag>
								:
								<Tag color='processing'>Phiếu tạm</Tag>}
						</>
					}</>


				)
			},
			{ title: "Nhà cung cấp", key: "su_id", ellipsis: true, render: (text: number, item: ImportRepositoryDto) => <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stores.sessionStore.getNameSupplier(item.su_id)}</div> },
			{ title: "Người vận hành", key: "us_id_import", render: (text: string, item: ImportRepositoryDto) => <div> {stores.sessionStore.getUserNameById(item.us_id_import)} </div> },
			{ title: "Thời gian cập nhật", sorter: true, key: "im_re_imported_at", render: (text: number, item: ImportRepositoryDto) => <div>{moment(item.im_re_created_at).format("DD/MM/YYYY HH:mm")}</div> },
			{
				title: "Ghi chú",
				key: "im_re_note", ellipsis: { showTitle: false }, render: (text: number, item: ImportRepositoryDto) =>
					<div style={{
						textOverflow: "ellipsis",
						overflow: "hidden",
					}} title={item.im_re_note}>{item.im_re_note}</div>
			},

		];
		let action: any =
		{
			title: "Chức năng", key: "im_re_note", render: (text: number, item: ImportRepositoryDto) => <div><Button
				type="primary" icon={<EyeOutlined />} title={'Xem chi tiết'}
				size='small'
			></Button></div>
		}
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
											<DetailInfomationImportRepositoryAdmin onUpdate={() => this.onUpdate()} openBillImportRepository={() => this.openBillImportRepository(record)} onSuccess={this.onSuccess} listProductImport={record.listProductImport} importRepostitorySelected={record} />
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
				
				dataSource={importRepostitoryListResult}
				pagination={this.props.pagination}
				rowClassName={(record) => (this.state.keyRow === record.im_re_id) ? "bg-click" : "bg-white"}
				rowKey={record => record.im_re_id}
				onChange={(a, b, sort: SorterResult<ImportRepositoryDto> | SorterResult<ImportRepositoryDto>[]) => {
					if (!!this.props.changeColumnSort) {
						this.props.changeColumnSort(sort);
					}
				}}
			/>
		)
	}
}