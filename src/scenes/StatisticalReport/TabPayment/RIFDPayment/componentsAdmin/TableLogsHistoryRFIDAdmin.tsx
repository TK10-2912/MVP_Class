import * as React from 'react';
import { Table } from 'antd';
import { BillingDto, ItemBillingEntity, RfidLogDto } from '@services/services_autogen';
import { L } from '@lib/abpUtility';
import AppConsts from '@src/lib/appconst';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { stores } from '@src/stores/storeInitializer';
import moment from 'moment';
import { Link } from 'react-router-dom';
import ModalTableBillingViewUser from '../../BankingPayment/componentUser/ModalTableBillingViewUser';
import { SorterResult } from 'antd/lib/table/interface';

export interface IProps {
	logsRFIDListResult: RfidLogDto[],
	pagination: TablePaginationConfig | false;
	isPrinted?: boolean;
	changeColumnSort?: (fieldSort: SorterResult<RfidLogDto> | SorterResult<RfidLogDto>[]) => void;
}
export default class TableHistoryRFIDAdmin extends React.Component<IProps> {
	state = {
		isLoadDone: false,
		rf_id_selected: undefined,
		visibleModalBillProduct: undefined,
	};
	listItemProduct: ItemBillingEntity[] = [];
	billingSelected: BillingDto = new BillingDto();
	textJsonParse(text: string, typeString?: string) {
		let firtText = text.charAt(0)
		let textNotify: string = "";
		if (firtText == '{') {
			const textJason = JSON.parse(text);
			switch (typeString) {
				case "Mã hóa đơn":
					textNotify = textJason.ma_hoa_don
					break;
				case "Số tiền nạp vào":
					textNotify = textJason.tien_that
					break;
				case "Tiền khuyến mại":
					textNotify = textJason.tien_khuyen_mai
					break;
				case "Tiền dư":
					textNotify = textJason.tien_du
					break;
				default:
					textNotify = `Hóa đơn <b>${textJason.ma_hoa_don}</b> mua ở máy có ID <b>${textJason.ma_may}</b> với số tiền thanh toán <b>${AppConsts.formatNumber(textJason.tien_can_thanh_toan)}đ</b>, tiền thật <b>${AppConsts.formatNumber(textJason.tien_that)}đ</b>, tiền khuyến mại <b>${AppConsts.formatNumber(textJason.tien_khuyen_mai)}đ</b>, tiền dư <b>${AppConsts.formatNumber(textJason.tien_du)}đ</b>`;
					break;
			}
		}
		else {
			textNotify = text;
			return textNotify;
		}
		return textNotify;
	}
	render() {
		const { logsRFIDListResult, isPrinted } = this.props;
		const { billListResult } = stores.billingStore;
		const columns: ColumnsType<RfidLogDto> = [
			{ title: L('STT'), key: 'stt', width: 50, render: (text: string, item: RfidLogDto, index: number) => <div>{index + 1}</div> },
			{ title: L('Mã thẻ'), key: 'su_name', render: (text: string, item: RfidLogDto) => <div>{item.rf_code}</div> },
			{
				title: L('Nhóm máy'),width: 120, key: 'su_name', render: (text: string, item: RfidLogDto) => <div style={{ width: "100px" }}>
					{this.props.isPrinted ? stores.sessionStore.getNameGroupUseMaId(item.ma_id) :
						<Link target='_blank' to={"/general/machine/?gr_id=" + (stores.sessionStore.getIDGroupUseMaId(item.ma_id))}>
							{stores.sessionStore.getNameGroupUseMaId(item.ma_id)}
						</Link>
					}
				</div>
			},
			{
				title: 'Mã máy', key: 'gr_name', render: (text: string, item: RfidLogDto) => <div>
					{this.props.isPrinted ? stores.sessionStore.getCodeMachines(item.ma_id) :
						<Link target='_blank' to={"/general/machine/?machine=" + stores.sessionStore.getCodeMachines(item.ma_id)} >
							{stores.sessionStore.getCodeMachines(item.ma_id)}
						</Link>
					}
				</div>
			},
			{
				title: 'Tên máy', key: 'ma_name', width: 120,
				render: (text: string, item: RfidLogDto) => <div>
					{this.props.isPrinted ? stores.sessionStore.getNameMachines(item.ma_id) :
						<Link target="blank" to={"/general/machine/?machine=" + stores.sessionStore.getCodeMachines(item.ma_id)}>
							{stores.sessionStore.getNameMachines(item.ma_id)}
						</Link>
					}
				</div>
			},

			// { title: L('Số tiền (VNĐ) '), key: 'su_desc', render: (text: string, item: RfidLogDto) => <div> {AppConsts.formatNumber(item.rf_lo_money)}</div> },
			{
				title: L('Mã hóa đơn'), key: 'su_desc', className: "hoverCell", onCell: (record) => {
					return {
						onClick: () => {
							this.billingSelected = billListResult.find(a => a.bi_code === this.textJsonParse(record.rf_lo_content!, "Mã hóa đơn"))!
							this.listItemProduct = (!!this.billingSelected && !!this.billingSelected.entities_id_arr) ? this.billingSelected.entities_id_arr : [];
							this.setState({ visibleModalBillProduct: true });
						}
					}
				}, render: (text: string, item: RfidLogDto) => <div> {this.textJsonParse(item.rf_lo_content!, "Mã hóa đơn")}</div>
			},
			{
				title: L('Số tiền nạp vào'), key: 'su_desc', className: "hoverCell", render: (text: string, item: RfidLogDto) => <div> {this.textJsonParse(item.rf_lo_content!, "Số tiền nạp vào")}</div>
			},
			{
				title: L('Tiền khuyến mại'), key: 'su_desc', className: "hoverCell", render: (text: string, item: RfidLogDto) => <div> {this.textJsonParse(item.rf_lo_content!, "Tiền khuyến mại")}</div>
			},
			{
				title: L('Tiền dư'), key: 'su_desc', className: "hoverCell", render: (text: string, item: RfidLogDto) => <div> {this.textJsonParse(item.rf_lo_content!, "Tiền dư")}</div>
			},
			{
				title: L('Thông báo'), width: "30%", key: 'su_desc', render: (text: string, item: RfidLogDto) => <div>
					{item.rf_lo_action !== 2 ?
						<div dangerouslySetInnerHTML={{ __html: item.rf_lo_content! }}>
						</div>
						:
						<div dangerouslySetInnerHTML={{ __html: this.textJsonParse(item.rf_lo_content!) }}></div>}
				</div>
			},
			{ title: L('Thời gian giao dịch'), key: 'rf_lo_created_at', dataIndex: "rf_lo_created_at", sorter: true, render: (text: string, item: RfidLogDto) => <div>{moment(item.rf_lo_created_at).format("DD/MM/YYYY - HH:mm:ss")}</div> },
		];
		return (
			<>
				<Table
					// sticky
					className='centerTable'
					loading={this.state.isLoadDone}
					rowClassName={(record, index) => (this.state.rf_id_selected === record.rf_lo_id) ? "bg-click" : "bg-white"}
					rowKey={record => "supplier__" + JSON.stringify(record)}
					size={'middle'}
					bordered={true}
					locale={{ "emptyText": L('No Data') }}
					columns={columns}
					dataSource={logsRFIDListResult.length > 0 ? logsRFIDListResult : []}
					pagination={this.props.pagination}
					scroll={this.props.isPrinted ? { x: undefined, y: undefined } : { x: 800, y: 500 }}
					onChange={(a, b, sort: SorterResult<RfidLogDto> | SorterResult<RfidLogDto>[]) => {
						if (!!this.props.changeColumnSort) {
							this.props.changeColumnSort(sort);
						}
					}}
				/>
				<ModalTableBillingViewUser billSelected={this.billingSelected}
					visibleModalBillProduct={this.state.visibleModalBillProduct}
					onCancel={() => this.setState({ visibleModalBillProduct: false })}
					listItem={this.listItemProduct}
				/>
			</>
		)
	}
}