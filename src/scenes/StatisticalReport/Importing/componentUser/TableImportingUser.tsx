import { EyeFilled } from '@ant-design/icons';
import { isGranted } from '@src/lib/abpUtility';
import AppConsts, { EventTable } from '@src/lib/appconst';
import { ImportingDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Image, Table } from 'antd';
import { ColumnGroupType, ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { SorterResult } from 'antd/lib/table/interface';
import moment from 'moment';
import * as React from 'react';
import { Link } from 'react-router-dom';

export interface IProps {
	actionTable?: (item: ImportingDto, event: EventTable) => void;
	pagination: TablePaginationConfig | false;
	isLoadDone?: boolean;
	importingListResult: ImportingDto[];
	noScroll?: boolean;
	changeColumnSort?: (fieldSort: SorterResult<ImportingDto> | SorterResult<ImportingDto>[]) => void;

}

export default class TableImportingUser extends React.Component<IProps> {
	state = {
		im_id_selected: undefined,
	}
	onAction = (item: ImportingDto, action: EventTable) => {
		this.setState({ im_id_selected: item.im_id });
		const { actionTable } = this.props;
		if (actionTable !== undefined) {
			actionTable(item, action);
		}
	}
	render() {
		const { pagination, actionTable, importingListResult } = this.props;
		let action: ColumnGroupType<ImportingDto> = {
			title: "Chức năng", children: [], key: "action_importing_index", className: "no-print", fixed: "right",
			render: (text: string, item: ImportingDto) => (
				<div>
					{isGranted(AppConsts.Permission.Pages_History_LichSuNhapHang_Detail) &&
						<Button
							type="primary"
							icon={<EyeFilled />} title="Xem thông tin"
							style={{ marginLeft: '10px' }}
							size='small'
							onClick={() => this.onAction(item!, EventTable.View)}
						></Button>
					}
				</div>
			)
		};

		const columns: ColumnsType<ImportingDto> = [
			{
				title: "STT", key: "stt_machine_index", width: 50, fixed: "left",
				render: (text: string, item: ImportingDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div>
			},
			{
				title: 'Mã nhập',width:120, dataIndex: '', key: 'ma_code',
				render: (text: string, item: ImportingDto, index: number) => <div style={{width:"100px"}}>{item.im_code}</div>
			},
			{
				title: 'Đợt nhập thứ', dataIndex: '', key: 'ma_code',
				render: (text: string, item: ImportingDto, index: number) => <div>
					{!!item.im_period ? (item.im_period.match(/Đợt nhập lần (\d+)/) ? item.im_period.match(/Đợt nhập lần (\d+)/)![1] : "") : ""}
				</div>
			},
			{
				title: 'Thời gian nhập', dataIndex: 'im_created_at', key: 'im_created_at', sorter: true,
				render: (text: string, item: ImportingDto, index: number) => <div>
					{moment(item.im_created_at).format("DD/MM/YYYY - HH:mm:ss")}
				</div>
			},
			{
				title: 'Nhóm máy', key: 'ma_name',
				render: (text: string, item: ImportingDto) => <div>
					{this.props.actionTable != undefined ?
						<Link target="_blank" to={"/general/machine/?gr_id=" + stores.sessionStore.getIDGroupUseMaId(item.ma_id)} onDoubleClick={() => this.onAction(item, EventTable.View)} >
							{stores.sessionStore.getNameGroupUseMaId(item.ma_id)}
						</Link> :
						<div>
							{stores.sessionStore.getNameGroupUseMaId(item.ma_id)}
						</div>
					}
				</div>
			},
			{
				title: 'Mã máy', dataIndex: '', key: 'ma_code',
				render: (text: string, item: ImportingDto, index: number) => <div>
					{this.props.actionTable != undefined ?
						<Link target="_blank" to={"/general/machine/?machine=" + stores.sessionStore.getCodeMachines(item.ma_id)} onDoubleClick={() => this.onAction(item, EventTable.View)}>
							{stores.sessionStore.getCodeMachines(item.ma_id)}
						</Link> :
						<div>
							{stores.sessionStore.getCodeMachines(item.ma_id)}
						</div>
					}
				</div>
			},
			{
				title: 'Tên máy', key: 'ma_name',
				render: (text: string, item: ImportingDto) => <div>
					{this.props.actionTable != undefined ?
						<Link target="blank" to={"/general/machine/?machine=" + stores.sessionStore.getCodeMachines(item.ma_id)} onDoubleClick={() => this.onAction(item, EventTable.View)}>
							{stores.sessionStore.getNameMachines(item.ma_id)}
						</Link> :
						<div>
							{stores.sessionStore.getNameMachines(item.ma_id)}
						</div>
					}
				</div>
			},

			{
				title: 'Sản phẩm có bao bì', key: 'ma_name', children: [
					{
						title: 'Tổng trước nhập', key: 'ma_money',
						render: (text: string, item: ImportingDto) => <div style={{}}>
							{item.importingDetails?.reduce((total, e) => {
								if (e.im_de_type == 0 && e.im_de_product_type == 0) {
									return total + e.im_de_quantity
								}
								return total;
							}, 0)}
						</div>
					},
					{
						title: 'Tổng sau nhập', key: 'ma_money',
						render: (text: string, item: ImportingDto) => <div style={{}}>
							{item.importingDetails?.reduce((total, e) => {
								if (e.im_de_type == 1 && e.im_de_product_type == 0) {
									return total + e.im_de_quantity
								}
								return total;
							}, 0)}</div>
					},
					{
						title: 'Tổng đã nạp', key: 'ma_money',
						render: (text: string, item: ImportingDto) => <div> {item.im_total_drink}</div>
					},
				]
			},
			{
				title: 'Sản phẩm không có bao bì', key: 'ma_name', children: [
					{
						title: 'Tổng trước nhập', key: 'ma_money',
						render: (text: string, item: ImportingDto) => <div style={{}}>
							{AppConsts.formatNumber(item.importingDetails?.reduce((total, e) => {
								if (e.im_de_type == 0 && e.im_de_product_type == 1) {
									return total + e.im_de_quantity
								}
								return total;
							}, 0)! * 100)}
						</div>
					},
					{
						title: 'Tổng sau nhập', key: 'ma_money',
						render: (text: string, item: ImportingDto) => <div style={{}}>
							{AppConsts.formatNumber(item.importingDetails?.reduce((total, e) => {
								if (e.im_de_type == 1 && e.im_de_product_type == 1) {
									return total + e.im_de_quantity
								}
								return total;
							}, 0)! * 100)} </div>
					},
					{
						title: 'Tổng đã nhập', key: 'ma_money',
						render: (text: string, item: ImportingDto) => <div>{AppConsts.formatNumber(item.im_total_frdrink * 100)}</div>
					},

				]
			},
			{
				title: 'Tên người nhập', dataIndex: '', key: 'ma_code',
				render: (text: string, item: ImportingDto, index: number) => <div>{item.im_person_charge}</div>
			},


		];
		if (actionTable != undefined && isGranted(AppConsts.Permission.Pages_History_LichSuNhapHang_Detail)) {
			columns.push(action);
		}
		return (
			<Table
				// sticky
				onRow={(record, rowIndex) => {
					return {
						onDoubleClick: (event: any) => {
							{
								isGranted(AppConsts.Permission.Pages_History_LichSuNhapHang_Detail) &&
									this.onAction(record!, EventTable.RowDoubleClick)
							}
						}
					};
				}}
				scroll={this.props.noScroll == true ? { x: undefined, y: undefined } : { x: 1500, y: 500 }}
				className='centerTable'
				loading={!this.props.isLoadDone}
				columns={columns}
				size={'middle'}
				bordered={true}
				locale={{ "emptyText": "Không có dữ liệu" }}
				dataSource={importingListResult.length > 0 ? importingListResult : []}
				pagination={this.props.pagination}
				rowClassName={(record, index) => (this.state.im_id_selected === record.im_id) ? "bg-click" : "bg-white"}
				rowKey={record => "importing_table" + JSON.stringify(record)}
				onChange={(a, b, sort: SorterResult<ImportingDto> | SorterResult<ImportingDto>[]) => {
					if (!!this.props.changeColumnSort) {
						this.props.changeColumnSort(sort);
					}
				}}
			/>
		)
	}
}
