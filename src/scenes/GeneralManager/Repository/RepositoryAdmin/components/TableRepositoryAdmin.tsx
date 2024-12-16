import * as React from 'react';
import { Button, Table, Tabs, Tooltip, } from 'antd';
import { EyeOutlined, } from '@ant-design/icons';
import { ExportRepositoryDto, RepositoryDto } from '@services/services_autogen';
import { isGranted, L } from '@lib/abpUtility';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { stores } from '@src/stores/storeInitializer';
import moment from 'moment';
import TableViewProductInRepository from './TableViewProductInRepository';
import TableImportDetailRepository from './TableImportDetailRepository';
import { SorterResult } from 'antd/lib/table/interface';
import TableExportRepository from './TableExportRepository';
import TableTransferRepository from './TableTransferRepository';
export interface IProps {
	actionTable?: (item: RepositoryDto, event: EventTable) => void;
	repositoryListResult: RepositoryDto[],
	pagination: TablePaginationConfig | false;
	hasAction?: boolean;
	changeColumnSortExportRepository?: (fieldSort: SorterResult<RepositoryDto> | SorterResult<RepositoryDto>[]) => void;
	isPrint?: boolean;
	onSuccess?: () => void;
}
const tabManager = {
	tab_1: "Thông tin kho",
	tab_2: "Lịch sử nhập hàng",
	tab_3: "Lịch sử xuất hàng",
	tab_4: "Lịch sử cấp phát",
}
export default class TableRepositoryAdmin extends React.Component<IProps> {
	state = {
		isLoadDone: false,
		su_id_selected: undefined,
		expandedRowKey: undefined,
		keyRow: undefined,
	};

	onAction = async (item: RepositoryDto, action: EventTable) => {
		this.setState({ su_id_selected: item.re_id });
		const { hasAction, actionTable } = this.props;
		if (hasAction !== undefined && hasAction === true && actionTable !== undefined) {
			actionTable(item, action);
		}
	}

	handleExpand = (expanded, record) => {
		if (expanded) {
			this.setState({ expandedRowKey: [record.re_id], keyRow: record.re_id });
		} else {
			this.setState({ expandedRowKey: undefined });
		}
	};
	render() {
		const { repositoryListResult, pagination, hasAction } = this.props;
		let action: ColumnGroupType<RepositoryDto> = {
			title: L('Chức năng'), children: [], key: 'action_Supplier_index', className: "no-print center",
			render: (text: string, item: RepositoryDto) => (
				<Button
					type="primary" icon={<EyeOutlined />} title={L('Xem chi tiết kho')}
					size='small'
				></Button>
			)
		};
		const columns: ColumnsType<RepositoryDto> = [
			{ title: L('STT'), key: 'stt', width: 50, render: (text: string, item: RepositoryDto, index: number) => <div>{pagination !== false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
			{ title: L('Người vận hành'), dataIndex: 'su_name', key: 'su_name', render: (text: string, item: RepositoryDto) => <div>{stores.sessionStore.getUserNameById(item.us_id_operator)}</div> },
			{
				title: L('Tổng số mặt hàng'),
				dataIndex: 'su_name',
				key: 'su_name',
				render: (text: string, item: RepositoryDto) => <div>{item.so_luong_mat_hang}</div>,
				sorter: (a: RepositoryDto, b: RepositoryDto) => a.so_luong_mat_hang - b.so_luong_mat_hang
			},

			{
				title: L('Tổng tồn kho'),
				dataIndex: 'su_phone',
				key: 'su_phone',
				render: (text: string, item: RepositoryDto) => (
					<div>
						{AppConsts.formatNumber(item.repositoryDetails!.reduce((total, currenttotal) => total + (currenttotal.pr_total_quantity_quydoi), 0))}
					</div>
				),
				sorter: (a: RepositoryDto, b: RepositoryDto) => {
					const totalA = a.repositoryDetails!.reduce((total, current) => total + current.pr_quantity_quydoi, 0);
					const totalB = b.repositoryDetails!.reduce((total, current) => total + current.pr_quantity_quydoi, 0);
					return totalA - totalB;
				},
			},
			{
				title: L('Số mặt hàng sắp hết hàng'),
				dataIndex: 'so_luong_san_pham_sap_het_hang',
				key: 'so_luong_san_pham_sap_het_hang',
				render: (text: string, item: RepositoryDto) => <div>{item.so_luong_san_pham_sap_het_hang}</div>,
				sorter: (a: RepositoryDto, b: RepositoryDto) => a.so_luong_san_pham_sap_het_hang - b.so_luong_san_pham_sap_het_hang,
			},
			{
				title: L('Số mặt hàng hết hàng'),
				dataIndex: 'so_luong_san_pham_het_hang',
				key: 'so_luong_san_pham_het_hang',
				render: (text: string, item: RepositoryDto) => <div>{item.so_luong_san_pham_het_hang}</div>,
				sorter: (a: RepositoryDto, b: RepositoryDto) => a.so_luong_san_pham_het_hang - b.so_luong_san_pham_het_hang,
			},

			{ title: L('Ngày tạo kho'), dataIndex: 're_created_at', sorter: hasAction, key: 're_created_at', render: (text: string, item: RepositoryDto) => <div>{moment(item.re_created_at).format("DD/MM/YYYY  HH:mm")}</div> },
			{ title: L('Thời gian cập nhật'), dataIndex: 're_updated_at', sorter: hasAction, key: 're_updated_at', render: (text: string, item: RepositoryDto) => <div>{moment(item.re_updated_at).format("DD/MM/YYYY HH:mm")}</div> },
		];
		if (hasAction !== undefined && hasAction === true) {
			columns.push(action)
		}

		return (
			<Table
				className='centerTable '
				scroll={this.props.hasAction ? { x: 1000, y: undefined } : { x: undefined, y: undefined }}
				onRow={(record, rowIndex) => {
					return {
						style: { cursor: 'pointer' },
						title: "Xem chi tiết kho",
					};
				}}
				loading={this.state.isLoadDone}
				rowClassName={(record, index) => (this.state.keyRow === record.re_id) ? "bg-click" : "bg-white"}
				rowKey={record => record.re_id}
				size={'middle'}
				bordered={true}
				
				columns={columns}
				onChange={(a, b, sort: SorterResult<RepositoryDto> | SorterResult<RepositoryDto>[]) => {
					if (!!this.props.changeColumnSortExportRepository) {
						this.props.changeColumnSortExportRepository(sort);
					}
				}}
				expandable={
					this.props.hasAction == false
						? {}
						: {
							expandedRowRender: (record) => (
								<>
									<Tabs defaultActiveKey={tabManager.tab_1}>
										<Tabs.TabPane tab={tabManager.tab_1} key={tabManager.tab_1}>
											<TableViewProductInRepository repository={record} re_id={record.re_id} />
										</Tabs.TabPane>
										{record.re_id == 1 &&
											<Tabs.TabPane tab={tabManager.tab_2} key={tabManager.tab_2}>
												<TableImportDetailRepository onSucess={this.props.onSuccess} repository={record} />
											</Tabs.TabPane>
										}
										<Tabs.TabPane tab={tabManager.tab_3} key={tabManager.tab_3}>
											<TableExportRepository repository={record} />
										</Tabs.TabPane>
										<Tabs.TabPane tab={tabManager.tab_4} key={tabManager.tab_4}>
											<TableTransferRepository repository={record} />
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
				dataSource={repositoryListResult.length > 0 ? repositoryListResult : []}
				// pagination={this.props.pagination}
			/>
		)
	}
}