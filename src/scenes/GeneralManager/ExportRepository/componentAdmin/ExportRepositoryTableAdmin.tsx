import { DeleteFilled, EditOutlined, EyeOutlined } from '@ant-design/icons';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { EventTable, FileUploadType } from '@src/lib/appconst';
import { AttachmentItem, AuthorizationMachineDto, DrinkDto, ExportRepositoryDto, ImportRepositoryDto, ProductExportDto, ProductImportDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Col, Image, Modal, Row, Table } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import DetailProductExport from './DetailProductExportAdmin';
import DetailProductExportAdmin from './DetailProductExportAdmin';

export interface IProps {
	actionTable?: (item: ExportRepositoryDto, event: EventTable) => void;
	pagination: TablePaginationConfig | false;
	isLoadDone?: boolean;
	hasAction?: boolean;
	exportRepostitoryListResult: ExportRepositoryDto[],
	noScrool?: boolean;
}
export default class ExportRepositoryTableAdmin extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		ex_re_id: undefined,
		visibleProduct: false,
	}
	productList: ProductExportDto[] = []

	onAction = (item: ExportRepositoryDto, action: EventTable) => {
		if (!!this.props.hasAction && this.props.hasAction == true) {
			this.setState({ ex_re_id: item.ex_re_id });
			const { actionTable } = this.props;
			if (actionTable !== undefined) {
				actionTable(item, action);
			}
		}
	}
	detailProduct = (input: ProductExportDto[]) => {
		this.setState({ isLoadDone: false });
		this.productList = input != undefined ? input : [];
		this.setState({ isLoadDone: true, visibleProduct: true });
	}
	async getImage(input: AttachmentItem) {
		let fileUpload = {
			uid: input.id + "",
			name: 'image.png',
			status: 'done',
			url: this.getFile(input.id),
		};
		return fileUpload

	}

	render() {
		const { pagination, exportRepostitoryListResult, hasAction } = this.props
		const columns: ColumnsType<ExportRepositoryDto> = [
			{ title: "STT", key: "stt_fresh_drink_index", width: 50, render: (text: string, item: ExportRepositoryDto, index: number) => <div>{pagination != false ? pagination.pageSize! * (pagination.current! - 1) + (index + 1) : index + 1}</div> },
			{ title: "Máy bán nước", key: "im_re_code", render: (text: string, item: ExportRepositoryDto) => <div> {stores.sessionStore.getNameMachines(item.ma_id)} </div> },
			{ title: "Tổng số lượng", key: "im_re_code", render: (text: string, item: ExportRepositoryDto) => <div> {item.ex_re_quantity} </div> },
			{ title: "Người sở hữu", key: "us_id_import", render: (text: string, item: ExportRepositoryDto) => <div> {stores.sessionStore.getUserNameById(item.us_id_export)} </div> },
			{ title: "Người uỷ quyền", key: "us_id_owner", render: (text: number, item: ExportRepositoryDto) => <div> {stores.sessionStore.getUserNameById(item.us_id_owner)} </div> },
			{ title: "Tổng tiền nhập", key: "im_re_total_money", render: (text: number, item: ExportRepositoryDto) => <div> {AppConsts.formatNumber(item.ex_re_total_money) + " đ"} </div> },
			{ title: "Ngày xuất hóa đơn", key: "im_re_imported_at", render: (text: number, item: ExportRepositoryDto) => <div>{moment(item.ex_re_created_at).format("DD/MM/YYYY HH:mm")}</div> },
		];

		const columnProduct: ColumnsType<ProductExportDto> = [
			{ title: "STT", key: "stt_fresh_drink_index", width: 50, render: (text: string, item: ProductExportDto, index: number) => <div>{(index + 1)}</div> },
			{ title: "Tên sản phẩm", key: "im_re_code", render: (text: string, item: ProductExportDto) => <div> {item.pr_ex_name} </div> },
			{ title: "Số lượng", key: "us_id_import", render: (text: string, item: ProductExportDto) => <div> {item.pr_ex_quantity} </div> },
			{ title: "Giá nhập ", key: "us_id_owner", render: (text: number, item: ProductExportDto) => <div> {AppConsts.formatNumber(Number(item.pr_ex_sell_money!)) + " đ"} </div> },
			{ title: "Đơn vị ", key: "us_id_owner", render: (text: number, item: ProductExportDto) => <div> {item.pr_ex_unit} </div> },
		];

		return (
			<>
				<Table
					scroll={this.props.noScrool == false ? { x: undefined, y: undefined } : { x: 1000, y: window.innerHeight }}
					className='centerTable'
					expandable={{

						expandedRowRender: (record) =>
							<Row gutter={25} >
								<Col span={12}>
									<h3 style={{ fontWeight: 600 }}>Danh sách sản phẩm xuất kho</h3>
									<Table
										style={{ marginTop: 10, marginRight: 15, marginBottom: 20 }}
										className='centerTable tableProductImport'
										columns={columnProduct}
										size={'middle'}
										pagination={false}
										bordered={true}
										locale={{ "emptyText": "Không có dữ liệu" }}
										dataSource={record.listProductExport != undefined && record.listProductExport.length > 0 ? record.listProductExport : []}
										rowKey={record => "drink_table" + JSON.stringify(record)}
									/>
								</Col>

								<Col span={12} >
									<h3 style={{ fontWeight: 600 }}>Danh sách hình ảnh hóa đơn xuất hàng</h3>
									{
										record.fi_id_list != undefined && record.fi_id_list?.length > 0 ?
											<div>
												{
													record.fi_id_list.map((item, index) =>
														<Image key={"key_image_" + index} className='no-print imgInvoice' src={item.id != undefined ? this.getFile(item.id) : AppConsts.appBaseUrl + "/image/no_image.jpg"}
															alt='No image available' />
													)
												}
											</div>
											:
											""
									}
								</Col>
							</Row>,
					}}
					columns={columns}
					size={'middle'}
					bordered={true}
					locale={{ "emptyText": "Không có dữ liệu" }}
					dataSource={exportRepostitoryListResult.length > 0 ? exportRepostitoryListResult : []}
					pagination={this.props.pagination}
					rowClassName={(record, index) => (this.state.ex_re_id === record.ex_re_id) ? "bg-click" : "bg-white"}
					rowKey={record => "drink_table" + JSON.stringify(record)}
				/>
				<Modal
					visible={this.state.visibleProduct}
					width={"80%"}
					closable={true}
					maskClosable={false}
					footer={false}
					onCancel={() => this.setState({ visibleProduct: false })}
					title={"Chi tiết danh sách sản phẩm nhập kho"}
				>
					<DetailProductExportAdmin productList={this.productList} />

				</Modal>
			</>
		)
	}
}