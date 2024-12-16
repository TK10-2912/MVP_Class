import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { cssColResponsiveSpan } from '@src/lib/appconst';
import { RepositoryDto, ExportRepositoryDto, ProductExportDto } from '@src/services/services_autogen';
import { Button, Col, Modal, Row, Table, Tabs, Tag } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import { stores } from '@src/stores/storeInitializer';
import { SorterResult, TablePaginationConfig } from 'antd/lib/table/interface';
import TableProductExport from './TableProductExport';
import { Link } from 'react-router-dom';
import { EyeOutlined } from '@ant-design/icons';

export interface IProps {
	repository?: ExportRepositoryDto[];
	changeColumnSortExportRepository?: (fieldSort: SorterResult<ExportRepositoryDto> | SorterResult<ExportRepositoryDto>[]) => void;
	pagination: TablePaginationConfig | false;
	isPrint?: boolean;
	pageSize?: number;
	currentPage?: number;
}
export const tabManager = {
	tab_1: "Danh sách sản phẩm xuất kho",
}
export default class ExportRepositoryTableAdmin extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		expandedRowKey: [],
		keyRow: undefined,
		visibleModalProductExport: false,
	}
	listProduct: ExportRepositoryDto[] = [];
	listProductExport: ProductExportDto[] = [];
	handleExpand = (expanded, record) => {
		if (expanded) {
			this.listProductExport = record.listProductExport;
			this.setState({ expandedRowKey: [record.ex_re_id], keyRow: record.ex_re_id });
		} else {
			this.setState({ expandedRowKey: undefined });
		}
	};
	render() {
		const { repository, pagination } = this.props
		const columns: ColumnsType<ExportRepositoryDto> = [
			{ title: "STT", key: "stt_table", width: 50, render: (text: string, item: ExportRepositoryDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
			{
				title: "Mã xuất", key: "im_re_code", render: (text: string, item: ExportRepositoryDto) => <div> {item.ex_re_code} </div>
			},
			{
				title: 'Nhóm máy', key: 'ma_name',
				render: (text: string, item: ExportRepositoryDto) => <div>
					{!this.props.pagination ? stores.sessionStore.getNameGroupUseMaId(item.ma_id) :
						<div title={`Xem chi tiết nhóm máy ${stores.sessionStore.getNameGroupUseMaId(item.ma_id)}`}>
							<Link target="_blank" to={"/general/machine/?gr_id=" + stores.sessionStore.getIDGroupUseMaId(item.ma_id)} onClick={e => { e.stopPropagation() }} >
								{stores.sessionStore.getNameGroupUseMaId(item.ma_id)}
							</Link>
						</div>
					}
				</div>
			},
			{
				title: "Máy bán nước", sorter: false, dataIndex: "ma_id", key: "ma_id", render: (text: number, item: ExportRepositoryDto) => <div title="Chi tiết máy">
					{!this.props.pagination ? `${stores.sessionStore.getCodeMachines(item.ma_id)} - ${stores.sessionStore.getNameMachines(item.ma_id)}` :
						<Link target='_blank' to={"/general/machine/?machine=" + stores.sessionStore.getCodeMachines(item.ma_id)} >
							<p>{stores.sessionStore.getCodeMachines(item.ma_id)}</p>
							<p title={stores.sessionStore.getNameMachines(item.ma_id)} style={{
								textOverflow: "ellipsis",
								overflow: "hidden",
								display: "-webkit-box",
								WebkitLineClamp: 2,
								WebkitBoxOrient: "vertical",
								margin: 0
							}}>{stores.sessionStore.getNameMachines(item.ma_id)}</p>
						</Link>
					}
				</div>
			},
			{ title: "Người vận hành", key: "im_re_code", render: (text: string, item: ExportRepositoryDto) => <div> {stores.sessionStore.getUserNameById(item.us_id_operator!)} </div> },
			{ title: "Tổng số sản phẩm", sorter: pagination != false ? (a, b) => a.listProductExport!.length - b.listProductExport!.length : false, key: "im_re_code", render: (text: string, item: ExportRepositoryDto) => <div> {AppConsts.formatNumber(item.listProductExport?.length)} </div> },
			{ title: "Tổng số lượng", sorter: pagination != false ? (a, b) => a.ex_re_quantity - b.ex_re_quantity : false, key: "im_re_code", render: (text: string, item: ExportRepositoryDto) => <div> {AppConsts.formatNumber(item.ex_re_quantity)} </div> },
			{ title: "Thời gian xuất", sorter: pagination != false ? true : false, key: "ex_re_created_at", render: (text: string, item: ExportRepositoryDto) => <div>{moment(item.ex_re_created_at).format("DD/MM/YYYY HH:mm")}</div> },
		];
		let action: any = {
			title: "Chức năng", width: 90, key: "action_drink_index", className: "no-print", dataIndex: '', fixed: "right",
			render: (text: string, item: ExportRepositoryDto) => (
				<div>
					<Button
						type="primary" icon={<EyeOutlined />} title="Xem chi tiết"
						size='small'
					></Button>
				</div>
			)
		};
		if (this.props.pagination) {
			columns.push(action);
		}
		return (
			<>
				<Table
					className='centerTable'
					scroll={this.props.isPrint == true ? { y: undefined } : { y: 600 }}
					columns={columns}
					rowClassName={(record, index) => (this.state.keyRow === record.ex_re_id) ? "bg-click" : "bg-white"}
					onChange={(a, b, sort: SorterResult<ExportRepositoryDto> | SorterResult<ExportRepositoryDto>[]) => {
						if (!!this.props.changeColumnSortExportRepository) {
							this.props.changeColumnSortExportRepository(sort);
						}
					}}
					size={'small'}
					bordered={true}
					dataSource={repository}
					rowKey={record => record.ex_re_id}
					pagination={pagination}
					expandable={
						!this.props.pagination
							? {}
							: {
								expandedRowRender: (record) => (

									<Tabs defaultActiveKey={tabManager.tab_1}>
										<Tabs.TabPane tab={tabManager.tab_1} key={tabManager.tab_1}>
											<TableProductExport
												listProduct={this.listProductExport}
												isModal={false}
											/>
										</Tabs.TabPane>
									</Tabs>
								),
								expandRowByClick: true,
								expandIconColumnIndex: -1,
								expandedRowKeys: this.state.expandedRowKey,
								onExpand: this.handleExpand,
							}
					}
					// footer={() => (
					// 	<Row style={{ marginTop: '8px', fontSize: 14 }}>
					// 		<Col span={5} style={{ alignContent: "center" }}>
					// 			<span>
					// 				Tổng số phiếu xuất kho:{' '}
					// 				<strong style={{ color: '#1DA57A' }}>
					// 					{
					// 						AppConsts.formatNumber(repository!
					// 							.slice((this.props.currentPage! - 1) * this.props.pageSize!,
					// 								this.props.currentPage! * this.props.pageSize!)
					// 							.length)
					// 					}
					// 				</strong>
					// 			</span>
					// 		</Col>
					// 		<Col span={5} style={{ alignContent: "center" }}>
					// 			<span>
					// 				Tổng số loại sản phẩm đã xuất: {' '}
					// 				<strong style={{ color: '#1DA57A' }}>
					// 					{
					// 						AppConsts.formatNumber(repository!.slice(
					// 							(this.props.currentPage! - 1) * this.props.pageSize!,
					// 							this.props.currentPage! * this.props.pageSize!)
					// 							.reduce((sum, ExportRepositoryDto) => sum + (ExportRepositoryDto.listProductExport?.length || 0), 0))
					// 					}
					// 				</strong>
					// 			</span>
					// 		</Col>
					// 		<Col span={5} style={{ alignContent: "center" }}>
					// 			<span>
					// 				Tổng số lượng sản phẩm đã xuất: {' '}
					// 				<strong style={{ color: '#1DA57A' }}>
					// 					{
					// 						AppConsts.formatNumber(repository!.slice(
					// 							(this.props.currentPage! - 1) * this.props.pageSize!,
					// 							this.props.currentPage! * this.props.pageSize!)
					// 							.filter(WithdrawDto => valueOfeBillMethod(WithdrawDto.wi_payment_type) == "Ngân hàng")
					// 							.reduce((sum, ExportRepositoryDto) => sum + (ExportRepositoryDto.ex_re_quantity || 0), 0))
					// 					}
					// 				</strong>
					// 			</span>
					// 		</Col>
					// 	</Row>
					// )}

					footer={
						() => (
							<Row gutter={8} id="exportRepositoryTableAdmin">
								<Col {...cssColResponsiveSpan(24, 24, 24, 8, 8, 8)} style={{ border: '1px solid #e4e1e1', display: 'flex', flexDirection: 'column' }}>
									<span>Tổng số phiếu xuất kho: <strong style={{ color: '#1DA57A' }}>
										{
											AppConsts.formatNumber(repository!.slice(
												(this.props.currentPage! - 1) * this.props.pageSize!,
												this.props.currentPage! * this.props.pageSize!)
												.reduce((sum, ExportRepositoryDto) => sum + (ExportRepositoryDto.listProductExport?.length || 0), 0))
										}
									</strong></span>
								</Col>
								<Col {...cssColResponsiveSpan(24, 24, 24, 8, 8, 8)} style={{ border: '1px solid #e4e1e1', display: 'flex', flexDirection: 'column' }}>
									<span>
										Tổng số loại sản phẩm đã xuất: {' '}
										<strong style={{ color: '#1DA57A' }}>
											{
												AppConsts.formatNumber(repository!.slice(
													(this.props.currentPage! - 1) * this.props.pageSize!,
													this.props.currentPage! * this.props.pageSize!)
													.reduce((sum, ExportRepositoryDto) => sum + (ExportRepositoryDto.listProductExport?.length || 0), 0))
											}
										</strong>
									</span>
								</Col>
								<Col {...cssColResponsiveSpan(24, 24, 24, 8, 8, 8)} style={{ border: '1px solid #e4e1e1', display: 'flex', flexDirection: 'column' }}>
									<span>
										Tổng số lượng sản phẩm đã xuất: {' '}
										<strong style={{ color: '#1DA57A' }}>
											{
												AppConsts.formatNumber(repository!.slice(
													(this.props.currentPage! - 1) * this.props.pageSize!,
													this.props.currentPage! * this.props.pageSize!)
													// .filter(WithdrawDto => valueOfeBillMethod(WithdrawDto.wi_payment_type) == "Ngân hàng")
													.reduce((sum, ExportRepositoryDto) => sum + (ExportRepositoryDto.ex_re_quantity || 0), 0))
											}
										</strong>
									</span>
								</Col>
							</Row>

						)}
				/>
			</>

		)
	}
}