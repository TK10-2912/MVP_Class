import * as React from 'react';
import { Table, Tag } from 'antd';
import { ERIFDAction, RfidLogDto } from '@services/services_autogen';
import { L } from '@lib/abpUtility';
import AppConsts from '@src/lib/appconst';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { stores } from '@src/stores/storeInitializer';
import { eRIFDAction } from '@src/lib/enumconst';
import moment from 'moment';
import { SorterResult } from 'antd/lib/table/interface';

export interface IProps {
	logsRFIDListResult: RfidLogDto[],
	pagination: TablePaginationConfig | false;
	noPrint?: boolean;
	changeColumnSort?: (fieldSort: SorterResult<RfidLogDto> | SorterResult<RfidLogDto>[]) => void;
}
export default class TableLogsRFIDAdmin extends React.Component<IProps> {
	state = {
		isLoadDone: false,
		rf_id_selected: undefined,
	};
	textJsonParse(text: string, number: ERIFDAction) {
		let firtText = text.charAt(0)
		let textNotify: string = "";
		if (number == 2 && firtText == '{') {
			const textJason = JSON.parse(text)
			textNotify = `Hóa đơn <b>${textJason.ma_hoa_don}</b> mua ở máy có ID <b>${textJason.ma_may}</b> với số tiền thanh toán <b>${AppConsts.formatNumber(textJason.tien_can_thanh_toan)}đ</b>, tiền thật <b>${AppConsts.formatNumber(textJason.tien_that)}đ</b>, tiền khuyến mại <b>${AppConsts.formatNumber(textJason.tien_khuyen_mai)}đ</b>, tiền dư <b>${AppConsts.formatNumber(textJason.tien_du)}đ</b>`;
		}
		else {
			textNotify= text;
			return textNotify;
		}
		return textNotify;
	}
	render() {
		const { logsRFIDListResult, noPrint } = this.props;
		const columns: ColumnsType<RfidLogDto> = [
			{ title: L('STT'), width: 50, key: 'stt', render: (text: string, item: RfidLogDto, index: number) => <div>{index + 1}</div> },
			{ title: L('Mã RFID'), sorter: true, dataIndex: "rf_code", key: 'su_name', render: (text: string, item: RfidLogDto) => <div>{item.rf_code}</div> },
			{ title: L('Số tiền (VNĐ) '), sorter: true, dataIndex: "rf_lo_money", key: 'su_desc', render: (text: string, item: RfidLogDto) => <div> {AppConsts.formatNumber(item.rf_lo_money)}</div> },
			{ title: L('Nhóm máy'), key: 'su_name', render: (text: string, item: RfidLogDto) => <div>{stores.sessionStore.getNameGroupUseMaId(item.ma_id)}</div> },
			{ title: L('Mã máy'), key: 'su_name', render: (text: string, item: RfidLogDto) => <div>{item.ma_id != undefined && item.ma_id > 0 ? item.ma_id : "Không có mã máy"}</div> },
			{ title: L('Tên máy'), key: 'su_name', render: (text: string, item: RfidLogDto) => <div>{stores.sessionStore.getNameMachines(item.ma_id)}</div> },
			{
				title: L('Hoạt động'), dataIndex: "rf_lo_action", key: 'su_desc', render: (text: string, item: RfidLogDto) => {
					if (noPrint == false) {
						return <div>
							{eRIFDAction.ADD_MONEY.num == item.rf_lo_action &&
								<Tag color="success">Nạp tiền</Tag>
							}
							{eRIFDAction.CHANGE_STATUS.num == item.rf_lo_action &&
								<Tag color="processing">Thay đổi trạng thái</Tag>
							}
							{eRIFDAction.BUY.num == item.rf_lo_action &&
								<Tag color="processing">Giao dịch</Tag>
							}
							{eRIFDAction.CREATE.num == item.rf_lo_action &&
								<Tag color="success">Tạo mới</Tag>
							}
							{eRIFDAction.CHANGE_MONEY.num == item.rf_lo_action &&
								<Tag color="warning">Đổi tiền</Tag>
							}
							{eRIFDAction.CHANGE_MONEY_SALE.num == item.rf_lo_action &&
								<Tag color="magenta">Đổi tiền KM</Tag>
							}
						</div>
					} else {
						return <div>
							{eRIFDAction.ADD_MONEY.num == item.rf_lo_action &&
								<div>Nạp tiền</div>
							}
							{eRIFDAction.CHANGE_STATUS.num == item.rf_lo_action &&
								<div>Thay đổi trạng thái</div>
							}
							{eRIFDAction.BUY.num == item.rf_lo_action &&
								<div>Giao dịch</div>
							}
							{eRIFDAction.CREATE.num == item.rf_lo_action &&
								<div>Tạo mới</div>
							}
							{eRIFDAction.CHANGE_MONEY.num == item.rf_lo_action &&
								<div>Đổi tiền</div>
							}
							{eRIFDAction.CHANGE_MONEY_SALE.num == item.rf_lo_action &&
								<div>Đổi tiền KM</div>
							}
						</div>
					}
				}
			},
			{
				title: L('Thông báo'),width:"30%", key: 'su_desc', render: (text: string, item: RfidLogDto) => <div>
					{item.rf_lo_action !== 2 ?
						<div dangerouslySetInnerHTML={{ __html: item.rf_lo_content! }}>
						</div>
						:
						<div dangerouslySetInnerHTML={{ __html: this.textJsonParse(item.rf_lo_content!, Number(item.rf_lo_action)) }}></div>}
				</div>
			},
			{ title: L('Ngày'), sorter: true, dataIndex: "rf_lo_created_at", key: 'su_desc', render: (text: string, item: RfidLogDto) => <div>{moment(item.rf_lo_created_at).format("DD/MM/YYYY - HH:mm:ss")}</div> },
		];
		return (
			<Table
				className='centerTable'
				loading={this.state.isLoadDone}
				rowClassName={(record, index) => (this.state.rf_id_selected === record.rf_lo_id) ? "bg-click" : "bg-white"}
				rowKey={record => "supplier__" + JSON.stringify(record)}
				size={'middle'}
				bordered={true}
				locale={{ "emptyText": "Thẻ này chưa có giao dịch" }}
				columns={columns}
				dataSource={logsRFIDListResult.length > 0 ? logsRFIDListResult : []}
				pagination={this.props.pagination}
				onChange={(a, b, sort: SorterResult<RfidLogDto> | SorterResult<RfidLogDto>[]) => {
					if (!!this.props.changeColumnSort) {
						this.props.changeColumnSort(sort);
					}
				}}
			/>
		)
	}
}