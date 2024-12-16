import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { ImportRepositoryDto, ProductImportDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Table } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';

export interface IProps {
	actionTable?: (item: ImportRepositoryDto, event: EventTable) => void;
	pagination: TablePaginationConfig | false;
	isLoadDone?: boolean;
	hasAction?: boolean;
	importRepostitoryListResult: ImportRepositoryDto[],
	noScrool?: boolean;
}
export default class ImportRepositoryTableUser extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		im_re_id: undefined,
		visibleProduct: false,
	}
	productList: ProductImportDto[] = []

	onAction = (item: ImportRepositoryDto, action: EventTable) => {
		if (!!this.props.hasAction && this.props.hasAction == true) {
			this.setState({ im_re_id: item.im_re_id });
			const { actionTable } = this.props;
			if (actionTable !== undefined) {
				actionTable(item, action);
			}
		}
	}
	detailProduct = (input: ProductImportDto[]) => {
		this.setState({ isLoadDone: false });
		this.productList = input != undefined ? input : [];
		this.setState({ isLoadDone: true, visibleProduct: true });
	}
	render() {
		const { pagination, importRepostitoryListResult, hasAction } = this.props
		const columns: ColumnsType<ImportRepositoryDto> = [
			{ title: "STT", key: "stt_fresh_drink_index", width: 50, render: (text: string, item: ImportRepositoryDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
			{ title: "Mã nhập kho", key: "im_re_code", render: (text: string, item: ImportRepositoryDto) => <div> {item.im_re_code} </div> },
			{ title: "Người nhập", key: "us_id_owner", render: (text: number, item: ImportRepositoryDto) => <div> {stores.sessionStore.getUserNameById(item.us_id_import)} </div> },
			{ title: "Tổng tiền nhập", key: "im_re_total_money", render: (text: number, item: ImportRepositoryDto) => <div> {AppConsts.formatNumber(item.im_re_total_money)} </div> },
			{ title: "Ngày nhập", key: "im_re_imported_at", render: (text: number, item: ImportRepositoryDto) => <div>{moment(item.im_re_created_at).format("DD/MM/YYYY HH:mm")}</div> },
		];
		return (
			<>
				<Table
					scroll={this.props.noScrool == false ? { x: undefined, y: undefined } : { x: 1000, y: window.innerHeight }}
					className='centerTable'
					columns={columns}
					size={'middle'}
					bordered={true}
					locale={{ "emptyText": "Không có dữ liệu" }}
					dataSource={importRepostitoryListResult.length > 0 ? importRepostitoryListResult : []}
					pagination={this.props.pagination}
					rowClassName={(record, index) => (this.state.im_re_id === record.im_re_id) ? "bg-click" : "bg-white"}
					rowKey={record => "drink_table" + JSON.stringify(record)}
				/>
			</>
		)
	}
}