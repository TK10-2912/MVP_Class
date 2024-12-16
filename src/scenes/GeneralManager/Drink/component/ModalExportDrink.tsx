import ActionExport from '@src/components/ActionExport';
import { DrinkDto } from '@src/services/services_autogen';
import { Button, Col, Modal, Row } from 'antd';
import * as React from 'react';
import DrinkTable from './DrinkTable';
import moment from 'moment';
import * as ExcelJS from 'exceljs';
import AppConsts from '@src/lib/appconst';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';


export interface IProps {
	drinkListResult: DrinkDto[];
	onCancel?: () => void;
	visible: boolean;
}

export default class ModalExportDrink extends React.Component<IProps> {
	componentRef: any | null = null;
	state = {
		isLoadDone: true,
	};
	setComponentRef = (ref) => {
		this.setState({ isLoadDone: false });
		this.componentRef = ref;
		this.setState({ isLoadDone: true });
	}
	exportToExcel = async () => {
		const { drinkListResult } = this.props;

		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('Sheet 1');
		// Thêm dòng tiêu đề

		worksheet.addRow(['Danh sách sản phẩm có bao bì']).eachCell((cell) => {
			cell.font = { bold: true, size: 20 };
		});
		worksheet.addRow(['STT', 'Ảnh minh họa', 'Mã sp', 'Tên sp', 'Giá', 'Mô tả']).eachCell((cell) => {
			cell.alignment = { vertical: 'middle', horizontal: 'center' };
		});
		drinkListResult.forEach((item, index) => {
			const { dr_code, dr_name, dr_desc, dr_image, dr_price, } = item;

			// Thêm dòng dữ liệu
			const row = worksheet.addRow([index + 1, '', dr_code, dr_name, AppConsts.formatNumber(dr_price), dr_desc,]);
			row.height = 80;
			const column = worksheet.getColumn(index + 2);
			column.width = 30;

			// Nếu có hình ảnh, thêm hình ảnh vào ô
			// if (dr_image) {
			// 	const imageId = workbook.addImage({
			// 		base64: dr_image, // Lấy phần base64 sau dấu phẩy
			// 		extension: 'png',
			// 	});

			// 	// Thêm hình ảnh vào ô
			// 	worksheet.addImage(imageId, {
			// 		tl: { col: 1, row: row.number - 1 }, // Cột thứ 1 là cột ảnh
			// 		ext: { width: 100, height: 100 }, // Điều chỉnh kích thước của hình ảnh nếu cần
			// 	});
			// }

			row.eachCell((cell) => {
				cell.alignment = { vertical: 'middle', horizontal: 'center' };
			});
		});
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
		const { drinkListResult } = this.props;
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row >
						<Col span={12}>
							Xuất danh sách sản phẩm có bao bì
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'drink' + ' ' + moment().format('DD_MM_YYYY')}
								isExcelWithImage={true}
								exportExcelWithImage={this.exportToExcel}
								idPrint="drink_print_id"
								isWord={true}
								isDestroy={true}
								onCancel={() => this.props.onCancel!()}
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
				<Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id="drink_print_id">
					<TitleTableModalExport title='Danh sách sản phẩm có bao bì'></TitleTableModalExport>
					<DrinkTable
						drinkListResult={drinkListResult}
						pagination={false}
						isLoadDone={true}
						noScrool={false}
					/>
				</Col>
			</Modal>
		)
	}
}