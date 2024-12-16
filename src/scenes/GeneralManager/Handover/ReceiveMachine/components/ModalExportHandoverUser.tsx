import ActionExport from '@src/components/ActionExport';
import { HandoverDto } from '@src/services/services_autogen';
import { Col, Modal, Row } from 'antd';
import * as React from 'react';
import moment from 'moment';
import AppConsts from '@src/lib/appconst';
import * as ExcelJS from 'exceljs';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { valueOfeHandoverStatus } from '@src/lib/enumconst';
import { stores } from '@src/stores/storeInitializer';
import TableHandover from './TableHandover';
export interface IProps {
	handoverListResult: HandoverDto[];
	onCancel?: () => void;
	visible: boolean;
	noScroll?: boolean;
}

export default class ModalExportHandoverUser extends AppComponentBase<IProps> {
	componentRef: any | null = null;
	state = {
		isLoadDone: true,
	};
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

	exportToExcel = async () => {
		const { handoverListResult } = this.props;

		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('Danh sách bàn giao');
		worksheet.addRow(['Danh sách bàn giao']).eachCell((cell) => {
			cell.font = { bold: true, size: 20 };
		});
		// Thêm dòng tiêu đề
		worksheet.addRow(['STT', 'Ảnh', 'Người bàn giao', 'Người nhận bàn giao', 'Số lượng máy bàn giao', 'Số lượng sản phẩm bàn giao', 'Trạng thái bàn giao', 'Ghi chú', 'Ngày tạo']).eachCell((cell) => {
			cell.alignment = { vertical: 'middle', horizontal: 'center' };
		});
		for (const [index, item] of handoverListResult.entries()) {
			const { fi_id_list, handover_user, receive_user, ma_id_list, productHandoverInputs, ha_status, ha_note, ha_created_at } = item;

			// Thêm dòng dữ liệu
			const row = worksheet.addRow([index + 1, '', stores.sessionStore.getUserNameById(handover_user), stores.sessionStore.getUserNameById(receive_user), ma_id_list?.length, productHandoverInputs?.length, valueOfeHandoverStatus(ha_status), ha_note, moment(ha_created_at).format("DD/MM/YYYY HH:mm") ]);
			row.height = 80;
			const column = worksheet.getColumn(index + 2);
			column.width = 30;

			// Nếu có hình ảnh, thêm hình ảnh vào ô
			if (fi_id_list) {
				try {
					const convertBase64 = (fi_id_list[0].ext === ".png" || fi_id_list[0].ext === ".jpg") ? await this.convertImageToBase64(
						this.getFile(fi_id_list[0].id)
					) : "data:image/png;base64,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"
					const imageId = workbook.addImage({
						base64: convertBase64,
						extension: 'png',
					});
					row.height = 113;
					column.width = 13.5;
					// Thêm hình ảnh vào ô
					worksheet.addImage(imageId, {
						tl: { col: 1, row: row.number - 1 },
						ext: { width: 100, height: 100 },
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
		a.download = 'handover ' + moment().format('DD_MM_YYYY') + '.xlsx';
		document.body.appendChild(a);
		a.click();

		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};


	render() {
		const { handoverListResult } = this.props;
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row>
						<Col span={12}>
							Xuất danh sách bàn giao
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'handover' + ' ' + moment().format('DD_MM_YYYY')}
								idPrint="handover_print_id"
								isExcelWithImage={true}
								isWord={true}
								isDestroy={true}
								onCancel={() => this.props.onCancel!()}
								exportExcelWithImage={this.exportToExcel}
								componentRef={this.componentRef}
							/>
						</Col>
					</Row>
				}
				closable={false}
				cancelButtonProps={{ style: { display: "none" } }}
				onCancel={() => { this.props.onCancel!() }}
				footer={null}
				width='90vw'
				maskClosable={false}

			>
				<Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id="handover_print_id">
					<TitleTableModalExport title='Danh sách bàn giao'></TitleTableModalExport>
					<TableHandover
						isPrint={true}
						handoverListResult={handoverListResult}
						pagination={false}
						isLoadDone={true}
						noScroll={false}
					/>
				</Col>
			</Modal>
		)
	}
}