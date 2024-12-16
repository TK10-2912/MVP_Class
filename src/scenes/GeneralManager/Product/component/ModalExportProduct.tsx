import ActionExport from '@src/components/ActionExport';
import { FreshDrinkDto, ProductDto } from '@src/services/services_autogen';
import { Button, Col, Modal, Row } from 'antd';
import * as React from 'react';
import FreshDrinkTable from './ProductTable';
import moment from 'moment';
import AppConsts from '@src/lib/appconst';
import * as ExcelJS from 'exceljs';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import Product from '..';
import ProductTable from './ProductTable';
export interface IProps {
	productListResult: ProductDto[];
	onCancel?: () => void;
	visible: boolean;
	noScroll?: boolean;
}

export default class ModalExportProduct extends AppComponentBase<IProps> {
	componentRef: any | null = null;
	state = {
		isLoadDone: true,
	};
	setComponentRef = (ref) => {
		this.setState({ isLoadDone: false });
		this.componentRef = ref;
		this.setState({ isLoadDone: true });
	}
	// exportToExcel = async () => {
	// 	const { productListResult } = this.props;

	// 	const workbook = new ExcelJS.Workbook();
	// 	const worksheet = workbook.addWorksheet('Danh sách sản phẩm không có bao bì');
	// 	worksheet.addRow(['Danh sách sản phẩm không có bao bì']).eachCell((cell) => {
	// 		cell.font = { bold: true, size: 20 };
	// 	});
	// 	// Thêm dòng tiêu đề
	// 	worksheet.addRow(['STT', 'Ảnh minh họa', 'Mã sp', 'Tên sp', 'Giá', 'Dung tích']).eachCell((cell) => {
	// 		cell.alignment = { vertical: 'middle', horizontal: 'center' };
	// 	});
	// 	productListResult.forEach((item, index) => {
	// 		const { fr_dr_code, fr_dr_name, fr_dr_capacity, fr_dr_image, fr_dr_price, } = item;

	// 		// Thêm dòng dữ liệu
	// 		const row = worksheet.addRow([index + 1, '', fr_dr_code, fr_dr_name, AppConsts.formatNumber(fr_dr_price), AppConsts.formatNumber(fr_dr_capacity),]);
	// 		row.height = 80;
	// 		const column = worksheet.getColumn(index + 2);
	// 		column.width = 30;

	// 		// Nếu có hình ảnh, thêm hình ảnh vào ô
	// 		if (fr_dr_image) {
	// 			const imageId = workbook.addImage({
	// 				base64: this.getFile(fr_dr_image.id), // Lấy phần base64 sau dấu phẩy
	// 				extension: 'png',
	// 			});

	// 		// 	// Thêm hình ảnh vào ô
	// 			worksheet.addImage(imageId, {
	// 				tl: { col: 1, row: row.number - 1 }, // Cột thứ 1 là cột ảnh
	// 				ext: { width: 100, height: 100 }, // Điều chỉnh kích thước của hình ảnh nếu cần
	// 			});
	// 		}

	// 		row.eachCell((cell) => {
	// 			cell.alignment = { vertical: 'middle', horizontal: 'center' };
	// 		});
	// 	});
	// 	const buffer = await workbook.xlsx.writeBuffer();
	// 	const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
	// 	const url = URL.createObjectURL(blob);

	// 	const a = document.createElement('a');
	// 	a.href = url;
	// 	a.download = 'fresh_drink' + ' ' + moment().format('DD_MM_YYYY');
	// 	document.body.appendChild(a);
	// 	a.click();

	// 	document.body.removeChild(a);
	// 	URL.revokeObjectURL(url);
	// };
	render() {
		const { productListResult } = this.props;
		return (
			<Modal
				visible={this.props.visible}
				title={
					<Row>
						<Col span={12}>
							Xuất danh sách sản phẩm
						</Col>
						<Col span={12} style={{ textAlign: 'end' }}>
							<ActionExport
								nameFileExport={'product_print' + ' ' + moment().format('DD_MM_YYYY')}
								idPrint="product_print_id"
								isExcelWithImage={true}
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
				<Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id="product_print_id">
					<TitleTableModalExport title='Danh sách sản phẩm'></TitleTableModalExport>
					<ProductTable
						isPrint={true}
						productListResult={productListResult}
						pagination={false}
						isLoadDone={true}
						noScroll={false}
					/>
				</Col>
			</Modal>
		)
	}
}