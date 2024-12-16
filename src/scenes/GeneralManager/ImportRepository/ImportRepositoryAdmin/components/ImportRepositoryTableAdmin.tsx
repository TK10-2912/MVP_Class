import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { ImportRepositoryDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Image, Table, Tabs, Tag } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import CreateOrUpdateImportsitoryAdmin from './ImportReponsitoryDetail/CreateOrUpdateImportRepository';
import DetailInfomationImportRepositoryAdmin from './ImportReponsitoryDetail/DetailInfomationImportRepositoryAdmin';

export interface IProps {
	actionTable?: (item: ImportRepositoryDto, event: EventTable) => void;
	pagination: TablePaginationConfig | false;
	isLoadDone?: boolean;
	hasAction?: boolean;
	importRepostitoryListResult: ImportRepositoryDto[],
	noScroll?: boolean;
	isPrint?: boolean,
	onSuccess?:()=>void; 
}
export const tabManager = {
    tab_1: "Thông tin",
}
export default class ImportRepositoryTableAdmin extends AppComponentBase<IProps> {
	state = {
		im_re_id: undefined,
		expandedRowKey:[],
	}
	handleExpand = (expanded, record) => {
        if (expanded) {
            // this.onCancel();
            this.setState({ expandedRowKey: [record.im_re_id] });
        } else {
            this.setState({ expandedRowKey: undefined });
        }
    };
	onSuccess = () => {
        if (!!this.props.onSuccess) {
            this.props.onSuccess();
        }
    }
	render() {
		const { pagination, importRepostitoryListResult } = this.props
		const columns: ColumnsType<ImportRepositoryDto> = [
			{ title: "STT", key: "stt_fresh_drink_index", width: 50, render: (text: string, item: ImportRepositoryDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
			{ title: "Mã nhập kho", key: "im_re_code", render: (text: string, item: ImportRepositoryDto) => <div> {item.im_re_code} </div> },
			{ title: "Tổng số lượng", key: "im_re_code", render: () => <div> {"Chưa có api"} </div> },
			{ title: "Người sở hữu", key: "us_id_import", render: (text: string, item: ImportRepositoryDto) => <div> {stores.sessionStore.getUserNameById(item.us_id_import)} </div> },
			{ title: "Nhà cung cấp", key: "su_id", render: (text: number, item: ImportRepositoryDto) => <div>{stores.sessionStore.getNameSupplier(item.su_id)}</div> },
			{
				title: "Trạng thái", key: "im_re_status", dataIndex: 'im_re_status', render: (text: string, item: ImportRepositoryDto) => (
					item.im_re_status ?
						<Tag color='success'>Đã nhập kho</Tag>
						:
						<Tag color='processing'>Phiếu tạm</Tag>
				)
			},
			{ title: "Người nhập", key: "us_id_owner", render: (text: number, item: ImportRepositoryDto) => <div> {stores.sessionStore.getUserNameById(item.us_id_import)} </div> },
			{ title: "Tổng tiền nhập", key: "im_re_total_money", render: (text: number, item: ImportRepositoryDto) => <div> {AppConsts.formatNumber(item.im_re_total_money) + " đ"} </div> },
			{ title: "Thời gian nhập", key: "im_re_imported_at", render: (text: number, item: ImportRepositoryDto) => <div>{moment(item.im_re_created_at).format("DD/MM/YYYY HH:mm")}</div> },
		];

		return (
			<Table
				scroll={this.props.noScroll == false ? { x: undefined, y: undefined } : { x: 1100, y: 600 }}
				className='centerTable'
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
											<DetailInfomationImportRepositoryAdmin onSuccess={this.onSuccess} listProductImport={record.listProductImport} importRepostitorySelected={record}/> 
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
				locale={{ "emptyText": "Không có dữ liệu" }}
				dataSource={importRepostitoryListResult}
				pagination={this.props.pagination}
				rowClassName={(record) => (this.state.im_re_id === record.im_re_id) ? "bg-click" : "bg-white"}
				rowKey={record => record.im_re_id}
			/>
		)
	}
}