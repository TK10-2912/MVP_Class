import { L } from '@lib/abpUtility';
import { BillingDto, EPaidStatus, ItemBillingEntity, RefundDto, RfidLogDto } from '@services/services_autogen';
import AppConsts, { cssColResponsiveSpan } from '@src/lib/appconst';
import { stores } from '@src/stores/storeInitializer';
import { Col, message, Row, Space, Table } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import { Link } from 'react-router-dom';
import ModalTableBillingViewUser from '../../BankingPayment/componentUser/ModalTableBillingViewUser';
import { SorterResult } from 'antd/lib/table/interface';
import ModalTableBillingViewAdmin from '../../BankingPayment/componentAdmin/ModalTableBillingViewAdmin';
import { ePaidStatus } from '@src/lib/enumconst';

export interface IProps {
	logsRFIDListResult: RfidLogDto[],
	pagination: TablePaginationConfig | false;
	isPrinted?: boolean;
	changeColumnSort?: (fieldSort: SorterResult<RfidLogDto> | SorterResult<RfidLogDto>[]) => void;
}
export default class TableHistoryRFIDUser extends React.Component<IProps> {
	state = {
		isLoadDone: false,
		rf_id_selected: undefined,
		visibleModalBillProduct: false,
	};
	listItemProduct: ItemBillingEntity[] = [];
	refundSelectd: RefundDto;
	billingSelected: BillingDto = new BillingDto();
	textJsonParse(text: string, typeString?: string) {
		let firtText = text.charAt(0)
		let textNotify: string = "";
		if (typeString != undefined && firtText == '{') {
			const textJason = JSON.parse(text);
			switch (typeString) {
				case "Mã hóa đơn":
					textNotify = textJason.ma_hoa_don
					break;
				case "Số tiền nạp vào":
					textNotify = AppConsts.formatNumber(Number(textJason.tien_that));
					break;
				case "Tiền khuyến mại":
					textNotify = AppConsts.formatNumber(Number(textJason.tien_khuyen_mai));
					break;
				case "Tiền dư":
					textNotify = AppConsts.formatNumber(Number(textJason.tien_du))
					break;
				case "Tiền cần thanh toán":
					textNotify = AppConsts.formatNumber(Number(textJason.tien_can_thanh_toan));
					break;
				default:
					textNotify = `Hóa đơn <b>${textJason.ma_hoa_don}</b> mua ở máy có ID <b>${textJason.ma_may}</b> với số tiền thanh toán <b>${AppConsts.formatNumber(textJason.tien_can_thanh_toan)}đ</b>, tiền thật <b>${AppConsts.formatNumber(textJason.tien_that)}đ</b>, tiền khuyến mại <b>${AppConsts.formatNumber(textJason.tien_khuyen_mai)}đ</b>, tiền dư <b>${AppConsts.formatNumber(textJason.tien_du)}đ</b>`;
					break;
			}
		}
		else if (firtText != '"') {
			const regex = /<b>.*?<\/b>/g;
			const matches = text.match(regex);
			const results = matches?.map(match => match.replace(/<\/?b>/g, ''));
			if (results != undefined) {
				switch (typeString) {
					case "Mã hóa đơn":
						{

							textNotify = results[results.length - 1];
							break;
						}
					case "Số tiền nạp vào":
						{
							const stringText = results[0].split(" ")
							textNotify = stringText[7];
							break;
						}
					case "Tiền khuyến mại":
						{
							const stringText = results[0].split(" ")
							textNotify = stringText[2];
							break;
						}
					case "Tiền cần thanh toán":
						{
							const stringText = results[0].split(" ")
							textNotify = stringText[0];
							break;
						}
					case "Tiền dư":
						{
							const stringText = results[0].split(" ")
							const tiennap = stringText[7] != undefined && stringText[7] != null ? parseFloat(stringText[7].replace(/,/g, '')) : 0;
							const tienthanhtoan = stringText[0] != undefined && stringText[0] != null ? parseFloat(stringText[0].replace(/,/g, '')) : 0;
							const tiendu = tiennap - tienthanhtoan;
							textNotify = tiendu > 0 ? AppConsts.formatNumber(tiendu) : "0"
							break;
						}
					default:
						textNotify = `Thiếu thông tin`;
						break;
				}
			}
		}
		else {
			textNotify = text;
			return textNotify;
		}
		return textNotify;
	}
	renderTotalFooter = (paidStatus?: EPaidStatus) => {
		const { logsRFIDListResult } = this.props;
		let theFirstCellOfCol = <></>;
		let totalCard = 0;
		const arrRFIDPaymentLogFiltered = logsRFIDListResult.filter(item => paidStatus !== undefined ? item.bi_paid_status === paidStatus : item)
		///Tổng đơn hàng
		let totalOrder = arrRFIDPaymentLogFiltered.length;
		///Tiền đơn hàng
		let totalOrderAmount = arrRFIDPaymentLogFiltered
			.map(item => this.textJsonParse(item.rf_lo_content!, "Tiền cần thanh toán"))
			.reduce((sum, cur) => +sum + +cur, 0);
		///Tiền nạp vào 
		let totalDepositAmount = arrRFIDPaymentLogFiltered
			.map(item => this.textJsonParse(item.rf_lo_content!, "Số tiền nạp vào"))
			.reduce((sum, cur) => +sum + +cur, 0);
		///Tiền thành công
		let totalSuccessfulAmount = arrRFIDPaymentLogFiltered
			.map(item => this.textJsonParse(item.rf_lo_content!, "Tiền cần thanh toán"))
			.reduce((sum, cur) => +sum + +cur, 0);
		///Tiền dư
		let totalRemainingAmount = arrRFIDPaymentLogFiltered
			.map(item => this.textJsonParse(item.rf_lo_content!, "Tiền dư"))
			.reduce((sum, cur) => +sum + +cur, 0);

		if (paidStatus === undefined) {
			const set = new Set();
			logsRFIDListResult.map(item => set.add(item.rf_code));
			totalCard = set.size;
			theFirstCellOfCol = <span><b>Tổng số thẻ giao dịch: <span style={{ color: '#1DA57A' }}>{`${totalCard}`}</span></b></span>
		}
		else if (paidStatus === ePaidStatus.CREATE.num) {
			theFirstCellOfCol = <span style={{ color: '#FAAD14' }}><b>Quá trình tạo đơn hàng</b></span>
		}
		else if (paidStatus === ePaidStatus.SUCCESS.num) {
			theFirstCellOfCol = <span style={{ color: '#52C41A' }}><b>Trả hàng thành công</b></span>
		}
		else if (paidStatus === ePaidStatus.PART_SUCCESS.num) {
			theFirstCellOfCol = <span style={{ color: '#1890FF' }}><b>Trả hàng thành công 1 phần</b></span>
		}
		else if (paidStatus === ePaidStatus.ERROR.num) {
			theFirstCellOfCol = <span style={{ color: '#FF4D4F' }}><b>Lỗi</b></span>
		}
		return (
			<Space direction='vertical' size={1} style={{ fontSize: 12 }}>
				<span>{theFirstCellOfCol}</span>
				<span>Tổng số đơn hàng: <strong style={{ color: '#1DA57A' }}>{AppConsts.formatNumber(+totalOrder)}</strong></span>
				<span>Tổng số tiền đơn hàng: <strong style={{ color: '#1DA57A' }}>{AppConsts.formatNumber(+totalOrderAmount)}</strong></span>
				<span>Tổng số tiền nạp vào: <strong style={{ color: '#1DA57A' }}>{AppConsts.formatNumber(+totalDepositAmount)}</strong></span>
				<span>Tổng số tiền thành công: <strong style={{ color: '#1DA57A' }}>{AppConsts.formatNumber(+totalSuccessfulAmount)}</strong></span>
				<span>Tổng số tiền dư: <strong style={{ color: '#1DA57A' }}>{AppConsts.formatNumber(+totalRemainingAmount)}</strong></span>
			</Space>
		)
	}
	render() {
		const { logsRFIDListResult, isPrinted } = this.props;
		const { billListResult } = stores.billingStore;
		const columns: ColumnsType<RfidLogDto> = [
			{ title: L('STT'), key: 'stt', width: 50, render: (_: string, _item: RfidLogDto, index: number) => <div>{index + 1}</div> },
			{
				title: L('Mã thẻ'), width: 120, key: 'su_name', render: (_: string, item: RfidLogDto) => <div title={item.rf_code} style={{
					textOverflow: "ellipsis",
					overflow: "hidden",
					display: "-webkit-box",
					WebkitLineClamp: 2,
					WebkitBoxOrient: "vertical"
				}}>{item.rf_code}</div>
			},
			{
				title: L('Nhóm máy'), width: 150, key: 'su_name', render: (_: string, item: RfidLogDto) => <div>
					{
						this.props.isPrinted ? (
							stores.sessionStore.getNameGroupUseMaId(item.ma_id) === undefined
								? "Không có nhóm máy"
								: stores.sessionStore.getNameGroupUseMaId(item.ma_id)
						) : (
							<div title="Chi tiết nhóm máy">
								<Link target='_blank' to={`/general/machine/?gr_id=${stores.sessionStore.getIDGroupUseMaId(item.ma_id)}`}>
									{stores.sessionStore.getNameGroupUseMaId(item.ma_id) === undefined
										? "Không có nhóm máy"
										: stores.sessionStore.getNameGroupUseMaId(item.ma_id)}
								</Link>
							</div>
						)
					}

				</div>
			},
			{
				title: 'Máy bán nước', key: 'ma_name', width: 200,
				render: (_: string, item: RfidLogDto) => <div style={this.props.isPrinted ? {} : {
					textOverflow: "ellipsis",
					overflow: "hidden",
					display: "-webkit-box",
					WebkitLineClamp: 2,
					WebkitBoxOrient: "vertical"
				}}>
					{this.props.isPrinted == true ?
						<div>
							<div>{stores.sessionStore.getCodeMachines(item.ma_id)}</div>
							<div>{stores.sessionStore.getNameMachines(item.ma_id)}</div>
						</div>
						:
						<div title={`Chi tiết máy ${stores.sessionStore.getNameMachines(item.ma_id)}`}>
							<Link target="blank" to={"/general/machine/?machine=" + stores.sessionStore.getCodeMachines(item.ma_id)} >
								<div>{stores.sessionStore.getCodeMachines(item.ma_id)}</div>
								<div style={{ color: 'gray', fontSize: 11 }}>{stores.sessionStore.getNameMachines(item.ma_id)}</div>
							</Link>
						</div>

					}
				</div>
			},
			{
				title: L('Mã hóa đơn'), width: 135, key: 'su_desc', className: "hoverCell", onCell: (record) => {
					return {
						onClick: () => {
							this.billingSelected = billListResult.find(a => a.bi_code === this.textJsonParse(record.rf_lo_content!, "Mã hóa đơn"))!;
							this.listItemProduct = (!!this.billingSelected && !!this.billingSelected.entities_id_arr) ? this.billingSelected.entities_id_arr : [];
							if (this.billingSelected == undefined) {
								message.warning("Đơn hàng bị lỗi")
								this.setState({ visibleModalBillProduct: false })
							}
							else {
								this.setState({ visibleModalBillProduct: true });
							}
						}
					}
				}, render: (_: string, item: RfidLogDto) => <div title="Chi tiết hoá đơn"> {this.textJsonParse(item.rf_lo_content!, "Mã hóa đơn")}</div>
			},
			{
				title: L('Số tiền thanh toán'),
				width: 90,
				key: 'su_desc',
				sorter: (a: RfidLogDto, b: RfidLogDto) => {
					const aValue = +this.textJsonParse(a.rf_lo_content!, "Tiền cần thanh toán") || 0;
					const bValue = +this.textJsonParse(b.rf_lo_content!, "Tiền cần thanh toán") || 0;
					return aValue - bValue;
				},
				render: (_: string, item: RfidLogDto) =>
					<div>{AppConsts.formatNumber(+this.textJsonParse(item.rf_lo_content!, "Tiền cần thanh toán"))}</div>
			},
			{
				title: "Tiền giao dịch", children: [
					{
						title: L('Số tiền nạp vào'),
						width: 90,
						key: 'su_desc',
						sorter: (a: RfidLogDto, b: RfidLogDto) => {
							const aValue = +this.textJsonParse(a.rf_lo_content!, "Số tiền nạp vào") || 0;
							const bValue = +this.textJsonParse(b.rf_lo_content!, "Số tiền nạp vào") || 0;
							return aValue - bValue;
						},
						render: (_: string, item: RfidLogDto) =>
							<div>{AppConsts.formatNumber(+this.textJsonParse(item.rf_lo_content!, "Số tiền nạp vào"))}</div>
					},
					{
						title: L('Tiền khuyến mãi'),
						width: 90,
						key: 'su_desc',
						sorter: (a: RfidLogDto, b: RfidLogDto) => {
							const aValue = +this.textJsonParse(a.rf_lo_content!, "Tiền khuyến mại") || 0;
							const bValue = +this.textJsonParse(b.rf_lo_content!, "Tiền khuyến mại") || 0;
							return aValue - bValue;
						},
						render: (_: string, item: RfidLogDto) =>
							<div>{AppConsts.formatNumber(+this.textJsonParse(item.rf_lo_content!, "Tiền khuyến mại"))}</div>
					},
					{
						title: L('Tiền dư'),
						width: 90,
						key: 'su_desc',
						sorter: (a: RfidLogDto, b: RfidLogDto) => {
							const aValue = +this.textJsonParse(a.rf_lo_content!, "Tiền dư") || 0;
							const bValue = +this.textJsonParse(b.rf_lo_content!, "Tiền dư") || 0;
							return aValue - bValue;
						},
						render: (_: string, item: RfidLogDto) =>
							<div>{AppConsts.formatNumber(+this.textJsonParse(item.rf_lo_content!, "Tiền dư"))}</div>
					},

				]
			},
			{ title: L('Thời gian giao dịch'), width: 170, key: 'rf_lo_created_at', dataIndex: "rf_lo_created_at", sorter: true, render: (_: string, item: RfidLogDto) => <div>{moment(item.rf_lo_created_at).format("DD/MM/YYYY - HH:mm:ss")}</div> },
		];
		return (
			<>
				<Table
					className='centerTable'
					loading={this.state.isLoadDone}
					rowClassName={(record) => (this.state.rf_id_selected === record.rf_lo_id) ? "bg-click" : "bg-white"}
					rowKey={record => "supplier__" + JSON.stringify(record)}
					size={'middle'}
					bordered={true}
					
					columns={columns}
					dataSource={logsRFIDListResult.length > 0 ? logsRFIDListResult : []}
					pagination={this.props.pagination}
					scroll={this.props.isPrinted ? { x: undefined, y: undefined } : { x: 1500, y: 500 }}
					onChange={(a, b, sort: SorterResult<RfidLogDto> | SorterResult<RfidLogDto>[]) => {
						if (!!this.props.changeColumnSort) {
							this.props.changeColumnSort(sort);
						}
					}}
					footer={() =>
						<Row style={{ fontSize: 14 }}>
							{[undefined, ePaidStatus.SUCCESS.num, ePaidStatus.PART_SUCCESS.num, ePaidStatus.CREATE.num, ePaidStatus.ERROR.num]
								.map(item => (
									<>
										<Col {...cssColResponsiveSpan(24, 24, 24, 4, 4, 4)}>
											{this.renderTotalFooter(item)}
										</Col>
										<Col span={1}></Col>
									</>
								))
							}
						</Row>
					}
				/>
				<ModalTableBillingViewAdmin
					refundSelected={this.refundSelectd}
					billSelected={this.billingSelected}
					visibleModalBillProduct={this.state.visibleModalBillProduct}
					onCancel={() => this.setState({ visibleModalBillProduct: false })}
					listItem={this.listItemProduct}
				/>
			</>
		)
	}
}