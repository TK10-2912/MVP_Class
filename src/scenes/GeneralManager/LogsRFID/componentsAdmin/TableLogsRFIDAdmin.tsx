import * as React from 'react';
import { Col, Row, Table, Tag } from 'antd';
import { ERIFDAction, RfidLogDto } from '@services/services_autogen';
import { L } from '@lib/abpUtility';
import AppConsts, { cssColResponsiveSpan } from '@src/lib/appconst';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { stores } from '@src/stores/storeInitializer';
import { eRIFDAction, valueOfeRIFDAction } from '@src/lib/enumconst';
import moment from 'moment';
import { SorterResult } from 'antd/lib/table/interface';
import RFIDStatsFooter from './RFIDStatsFooter';
import { Link } from 'react-router-dom';

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
			textNotify = `Hóa đơn <b>${textJason.ma_hoa_don}</b> mua ở máy có ID <b>${textJason.ma_may}</b> với số tiền thanh toán <b>${AppConsts.formatNumber(textJason.tien_can_thanh_toan)}đ,</b> tiền thật <b>${AppConsts.formatNumber(textJason.tien_that)}đ,</b> tiền khuyến mại <b>${AppConsts.formatNumber(textJason.tien_khuyen_mai)}đ,</b> tiền dư <b>${AppConsts.formatNumber(textJason.tien_du)}đ</b>`;
		}
		else {
			textNotify = text;
			return textNotify;
		}
		return textNotify;
	}
	render() {
		const { logsRFIDListResult, noPrint, pagination } = this.props;
		const columns: ColumnsType<RfidLogDto> = [
			{ title: L('STT'), width: 50, key: 'stt', render: (text: string, item: RfidLogDto, index: number) => <div>{pagination != false ? pagination!.pageSize! * (pagination!.current! - 1) + (index + 1) : index + 1}</div> },
			{ title: L('Mã RFID'), dataIndex: "rf_code", key: 'rf_code', render: (text: string, item: RfidLogDto) => <div style={{ width: 140 }}>{item.rf_code}</div> },
			{ title: L('Số tiền (VNĐ) '), sorter: true, dataIndex: "rf_lo_money", key: 'rf_lo_money', render: (text: string, item: RfidLogDto) => <div> {AppConsts.formatNumber(item.rf_lo_money)}</div> },
			{ title: L('Nhóm máy'), key: 'gr_ma_id', render: (text: string, item: RfidLogDto) => <div>{
				this.props.noPrint
				?stores.sessionStore.getNameGroupUseMaId(item.ma_id)
				:<Link title="Chi tiết nhóm máy" target='_blank' to={"/general/machine/?gr_id=" + stores.sessionStore.getIDGroupUseMaId(item.ma_id!)}>
				{stores.sessionStore.getNameGroupUseMaId(item.ma_id)}</Link>
				}</div> },
			{
											title: 'Máy bán nước', sorter: this.props.noPrint ? false : true,
											ellipsis: {
													showTitle: false,
											},
											dataIndex: 'ma_display_name', key: 'ma_name', width: 200,
											render: (_: string, item: RfidLogDto) => <div title={`${stores.sessionStore.getMachineCode(item.ma_id)} - ${stores.sessionStore.getNameMachines(item.ma_id)}`} style={{
													overflow: 'hidden',
													textOverflow: 'ellipsis',
											}}>
													<p style={{ margin: 0,color:"#1DA57A" }}>{stores.sessionStore.getMachineCode(item.ma_id)}</p>
													<p style={{
															textOverflow: "ellipsis",
															overflow: "hidden",
															display: "-webkit-box",
															WebkitLineClamp: 2,
															WebkitBoxOrient: "vertical",
															margin: 0,
															color: "gray",
															fontSize: "11px",
													}}>{stores.sessionStore.getNameMachines(item.ma_id)}</p>
											</div>
									},
			{
				title: L('Hoạt động'), dataIndex: "rf_lo_action", key: 'su_desc', render: (text: string, item: RfidLogDto) => {
					if (noPrint == false) {
						return <div>
							{eRIFDAction.ADD_MONEY.num == item.rf_lo_action &&
								<Tag color="blue">{valueOfeRIFDAction(item.rf_lo_action)}</Tag>
							}
							{eRIFDAction.CHANGE_STATUS.num == item.rf_lo_action &&
								<Tag color="processing">{valueOfeRIFDAction(item.rf_lo_action)}</Tag>
							}
							{eRIFDAction.BUY.num == item.rf_lo_action &&
								<Tag color="pink">{valueOfeRIFDAction(item.rf_lo_action)}</Tag>
							}
							{eRIFDAction.CREATE.num == item.rf_lo_action &&
								<Tag color="success">{valueOfeRIFDAction(item.rf_lo_action)}</Tag>
							}
							{eRIFDAction.CHANGE_MONEY.num == item.rf_lo_action &&
								<Tag color="orange">{valueOfeRIFDAction(item.rf_lo_action)}</Tag>
							}
							{eRIFDAction.CHANGE_MONEY_SALE.num == item.rf_lo_action &&
								<Tag color="magenta">{valueOfeRIFDAction(item.rf_lo_action)}</Tag>
							}
							{eRIFDAction.ADD_POINT.num == item.rf_lo_action &&
								<Tag color="geekblue">{valueOfeRIFDAction(item.rf_lo_action)}</Tag>
							}
							{eRIFDAction.DELETE.num == item.rf_lo_action &&
								<Tag color="red">{valueOfeRIFDAction(item.rf_lo_action)}</Tag>
							}
						</div>
					} else {
						return <div>
							{eRIFDAction.ADD_MONEY.num == item.rf_lo_action &&
								<div>Nạp tiền</div>
							}
							{eRIFDAction.ADD_POINT.num == item.rf_lo_action &&
								<div>Cộng điểm quy đổi</div>
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
								<div>Đổi tiền khuyến mãi</div>
							}
							{eRIFDAction.DELETE.num == item.rf_lo_action &&
								<div>Xóa thẻ</div>
							}
						</div>
					}
				}
			},
			{
				title: L('Thông báo'), width: 220, key: 'su_desc', render: (text: string, item: RfidLogDto) => {
					let content = '';
					if (item.rf_lo_action !== 2) {
						content = item.rf_lo_content?.replace(/<\/?[^>]+(>|$)/g, ' ').trim() || '';
					} else {
						content = this.textJsonParse(item.rf_lo_content!, Number(item.rf_lo_action))
							.replace(/<\/?[^>]+(>|$)/g, ' ').trim();
					}
					return <div style={{ width: 200 }}>{content}</div>;
				}
			},
			{ title: L('Ngày'), sorter: true, dataIndex: "rf_lo_created_at", key: 'su_desc', render: (text: string, item: RfidLogDto) => <div>{moment(item.rf_lo_created_at).format("DD/MM/YYYY - HH:mm:ss")}</div> },
		];
		return (
      <Table
        scroll={this.props.noPrint ? { x: undefined, y: undefined } : { x: 1000, y: 600 }}
        className="centerTable"
        loading={this.state.isLoadDone}
        rowClassName={(record, index) =>
          this.state.rf_id_selected === record.rf_lo_id ? 'bg-click' : 'bg-white'
        }
        rowKey={(record) => 'supplier__' + JSON.stringify(record)}
        size={'middle'}
        bordered={true}
        columns={columns}
        dataSource={logsRFIDListResult.length > 0 ? logsRFIDListResult : []}
        pagination={this.props.pagination}
        onChange={(a, b, sort: SorterResult<RfidLogDto> | SorterResult<RfidLogDto>[]) => {
          if (!!this.props.changeColumnSort) {
            this.props.changeColumnSort(sort);
          }
        }}
        footer={() => <RFIDStatsFooter 
			logsRFIDListResult={logsRFIDListResult}
		  />}
      />
    );
	}
}