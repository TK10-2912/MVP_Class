import * as React from 'react';
import { Col, Modal, Row } from 'antd';
import { RefundDto } from '@services/services_autogen';
import * as ExcelJS from 'exceljs';
import { L } from '@src/lib/abpUtility';
import ActionExport from '@src/components/ActionExport';
import moment from 'moment';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import TableRefundUser from './TableRefundUser';
import { stores } from '@src/stores/storeInitializer';
import { valueOfePaymentMethod } from '@src/lib/enumconst';
import AppConsts from '@src/lib/appconst';
import AppComponentBase from '@src/components/Manager/AppComponentBase';

export interface IProps {
	refundList: RefundDto[],
	onCancel?: () => void;
	visible: boolean;
}
export default class ModalExportRefundUser extends AppComponentBase<IProps> {
	componentRef: any | null = null;
	state = {
		isLoadDone: true,
	};
	setComponentRef = (ref) => {
		this.setState({ isLoadDone: false });
		this.componentRef = ref;
		this.setState({ isLoadDone: true });
	}
	fetchImageAsBase64 = async (url: string): Promise<Buffer> => {
		const response = await fetch(url);
		const blob = await response.blob();
		return new Promise<Buffer>((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => {
				resolve(Buffer.from(reader.result as ArrayBuffer));
			};
			reader.onerror = reject;
			reader.readAsArrayBuffer(blob);
		});
	}
	exportToExcel = async () => {
		const { refundList } = this.props;
		const session = stores.sessionStore;

		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('Sheet 1');
		// Thêm dòng tiêu đề

		worksheet.addRow(['Danh sách sản phẩm có bao bì']).eachCell((cell) => {
			cell.font = { bold: true, size: 20 };
		});
		worksheet.addRow(['STT', "Mã đơn hàng", "Nhóm máy", 'Mã máy', "Tên máy", 'Ảnh giao dịch', 'Lý do hoàn tiền', 'Ngân hàng', 'Số tài khoản', "Chủ tài khoản", 'Số tiền hoàn trả', "Trạng thái hoàn tiền", 'Phương thức thanh toán đơn hàng', 'Ngày tạo hoản trả', 'Ngày hoàn trả']).eachCell((cell) => {
			cell.alignment = { vertical: 'middle', horizontal: 'center' };
		});
		for (const [index, item] of refundList.entries()) {
			const { ma_id, bi_code, ref_nameAccountBank, fi_id_list, ref_reason, ref_namebank, ref_refund_at, ref_refund_type, ref_codebank, ref_money, ref_created_at } = item;

			// Thêm dòng dữ liệu
			const row = worksheet.addRow([index + 1, bi_code, session.getGroupMachineByMaId(ma_id), session.getCodeMachines(ma_id), session.getNameMachines(ma_id), '', ref_reason, ref_namebank, ref_codebank, ref_nameAccountBank, AppConsts.formatNumber(ref_money), ref_refund_at != null ? "Đã hoàn tiền" : "Chưa hoàn tiền", valueOfePaymentMethod(ref_refund_type), moment(ref_created_at).format("DD/MM/YYYY HH:mm"), moment(ref_refund_at).format("DD/MM/YYYY HH:mm")]);
			row.height = 80;
			worksheet.getColumn(5).width = 30;  // Cột thứ 5 là cột chứa ảnh

			// Nếu có hình ảnh, thêm hình ảnh vào ô
			if (fi_id_list && fi_id_list.length > 0) {
				const imageUrl = fi_id_list[0].key;
				const imageExt = (fi_id_list[0].ext || 'png') as 'png' | 'jpeg' | 'gif';
				if (imageUrl) {
					const imageBuffer = await this.fetchImageAsBase64(imageUrl);
					const imageId = workbook.addImage({
						buffer: imageBuffer,
						extension: imageExt,
					});

					// Thêm hình ảnh vào ô
					worksheet.addImage(imageId, {
						tl: { col: 4, row: row.number - 1 }, // Cột thứ 4 là cột ảnh
						ext: { width: 100, height: 100 }, // Điều chỉnh kích thước của hình ảnh nếu cần
					});
				}
			}

			row.eachCell((cell) => {
				cell.alignment = { vertical: 'middle', horizontal: 'center' };
			});
		}
		const buffer = await workbook.xlsx.writeBuffer();
		const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = 'drink' + ' ' + moment().format('DD_MM_YYYY');
		document.body.appendChild(a);
		a.click();

		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};
	render() {
		const { refundList } = this.props;
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row>
						<Col span={12}>
							<h2>{L('Xuất dữ liệu') + L(' hoàn tiền')}</h2>
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'Refund' + ' ' + moment().format('DD_MM_YYYY')}
								idPrint="Refund_user_print_id"
								isExcel={true}
								isWord={true}
								isDestroy={true}
								onCancel={this.props.onCancel}
								componentRef={this.componentRef}
							/>
						</Col>
					</Row>
				}
				closable={false}
				footer={null}
				width='90vw'
				onCancel={this.props.onCancel}
				maskClosable={false}
			>

				<Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id='Refund_user_print_id'>
					<TitleTableModalExport title='Danh sách hoàn tiền'></TitleTableModalExport>
					<TableRefundUser
						refundResult={refundList}
						pagination={false}
						hasAction={false}
						export={true}
					/>

				</Col>
			</Modal>
		)
	}
}