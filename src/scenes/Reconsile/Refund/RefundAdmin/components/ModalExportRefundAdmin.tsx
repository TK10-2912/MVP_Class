import * as React from 'react';
import { Col, Modal, Row } from 'antd';
import { RefundDto, } from '@services/services_autogen';

import { L } from '@src/lib/abpUtility';
import ActionExport from '@src/components/ActionExport';
import moment from 'moment';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import TableRefundAdmin from './TableRefundAdmin';
import AppConsts from '@src/lib/appconst';
import * as ExcelJS from 'exceljs';
import { stores } from '@src/stores/storeInitializer';
import { valueOfeBillMethod, valueOfeRefundReasonType } from '@src/lib/enumconst';

export interface IProps {
	refundList: RefundDto[],
	onCancel?: () => void;
	visible: boolean;
}
export default class ModalExportRefundAdmin extends React.Component<IProps> {
	componentRef: any | null = null;
	state = {
		isLoadDone: true,
	};
	listRefund: RefundDto[] = [];
	async componentDidMount() {
		this.listRefund = this.props.refundList;
	}
	setComponentRef = (ref) => {
		this.setState({ isLoadDone: false });
		this.componentRef = ref;
		this.setState({ isLoadDone: true });
	}
	convertImageToBase64 = async (imageUrl: string): Promise<string> => {
		this.setState({ isLoadDone: false });
		let headers = new Headers();
		headers.append('Content-Type', 'application/json');
		headers.append('Accept', 'application/json');
		headers.append('Origin', AppConsts.appBaseUrl + "");

		try {
			const response = await fetch(imageUrl, {
				mode: 'cors',
				credentials: 'include',
				method: 'POST',
				headers: headers,
			});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const blob = await response.blob();

			// Chuyển đổi blob thành base64
			const reader = new FileReader();
			const base64Promise = new Promise<string>((resolve, reject) => {
				reader.onloadend = () => {
					resolve(reader.result as string);
				};
				reader.onerror = reject;
				reader.readAsDataURL(blob);
			});

			const base64Data = await base64Promise;

			this.setState({ isLoadDone: true });

			return base64Data;
		} catch (error) {
			console.error('Error in convertImageToBase64:', error);
			this.setState({ isLoadDone: true });
			throw error; // Hoặc xử lý lỗi theo cách bạn muốn
		}
	};
	getFile(fi_id: number) {
		let fi_id_modified = encodeURI(fi_id + "");
		return AppConsts.remoteServiceBaseUrl + "download/file?path=" + fi_id_modified;
	}
	exportToExcel = async () => {
		const { refundList } = this.props;
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('Danh sách hoàn tiền');
		worksheet.addRow(['Danh sách hoàn tiền']).eachCell((cell) => {
			cell.font = { bold: true, size: 20 };
		});
		// Thêm dòng tiêu đề
		worksheet.addRow(['STT', 'Mã đơn hàng', 'Nhóm máy', 'Mã máy', 'Tên máy', 'Người vận hành', 'Ảnh giao dịch', 'Lý do hoàn tiền', 'Phương thức thanh toán', 'Trạng thái hoàn tiền', 'Số tài khoản', 'Số tiền hoàn', 'Ngày tạo', 'Ngày hoàn trả']).eachCell((cell) => {
			cell.alignment = { vertical: 'middle', horizontal: 'center' };
		});

		for (const [index, item] of refundList.entries()) {
			// const { pr_code, pr_name, pr_unit, pr_price, pr_is_active, fi_id } = item;

			// Thêm dòng dữ liệu
			const row = worksheet.addRow([index + 1, item.bi_code, stores.sessionStore.getNameGroupUseMaId(item.ma_id!), stores.sessionStore.getCodeMachines(item.ma_id), stores.sessionStore.getNameMachines(item.ma_id), stores.sessionStore.getUserNameById(item.machine.us_id_operator!), '', valueOfeRefundReasonType(item.ref_reason_type), item.ref_namebank, valueOfeBillMethod(item.ref_refund_type), item.ref_refund_at != null ? "Đã hoàn tiền" : "Chưa hoàn tiền", item.ref_codebank, AppConsts.formatNumber(item.ref_money), moment(item.ref_created_at).format("DD/MM/YYYY - HH:mm:ss"), item.ref_refund_at != null ? moment(item.ref_refund_at).format("DD/MM/YYYY - HH:mm:ss") : ""]);
			row.height = 80;
			const column = worksheet.getColumn(index + 2);
			column.width = 30;

			// Nếu có hình ảnh, thêm hình ảnh vào ô
			if (item.fi_id_list) {
				try {
					const convertBase64 = ((item.fi_id_list[0].ext === ".png" || item.fi_id_list[0].ext === ".jpg") && item.fi_id_list.length > 0) ? await this.convertImageToBase64(
						this.getFile(item.fi_id_list[0].id)
					) : "data:image/png;base64,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"

					const imageId = workbook.addImage({
						base64: convertBase64,
						extension: 'png',
					});

					// Thêm hình ảnh vào ô
					// worksheet.mergeCells(`B${row.number}:B${row.number}`);
					worksheet.addImage(imageId, {
						tl: { col: 6, row: row.number - 1 },
						ext: { width: 100, height: 100 },
						editAs: "oneCell",
					});
				} catch (error) {
					console.error('Error converting image to base64:', error);
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
		a.download = 'Refund ' + moment().format('DD_MM_YYYY') + '.xlsx';
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
							<h3>{L('Xuất dữ liệu') + L(' hoàn tiền')}</h3>
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'Refund' + ' ' + moment().format('DD_MM_YYYY')}
								idPrint="refund_print_id"
								isExcel={true}
								isWord={true}
								isDestroy={true}
								exportExcelWithImage={this.exportToExcel}
								isExcelWithImage={true}
								onCancel={this.props.onCancel}
								componentRef={this.componentRef}
								idFooter='TableRefundAdminID'
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
				<Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id='refund_print_id'>
					<TitleTableModalExport title='Danh sách hoàn tiền'></TitleTableModalExport>
					<TableRefundAdmin
						isPrinted={true}
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