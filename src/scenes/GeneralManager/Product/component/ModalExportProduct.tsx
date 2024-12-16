import ActionExport from '@src/components/ActionExport';
import { ProductDto } from '@src/services/services_autogen';
import { Col, Modal, Row } from 'antd';
import * as React from 'react';
import moment from 'moment';
import AppConsts from '@src/lib/appconst';
import * as ExcelJS from 'exceljs';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import ProductTable from './ProductTable';
import { stores } from '@src/stores/storeInitializer';
import FileSaver from 'file-saver';
export interface IProps {
	productListResult: ProductDto[];
	onCancel?: () => void;
	visible: boolean;
	noScroll?: boolean;
	table?: any;
}

export default class ModalExportProduct extends AppComponentBase<IProps> {
	componentRef: any | null = null;
	state = {
		isLoadDone: true,
	};
	listProduct: ProductDto[] = [];
	async componentDidMount() {

		// await stores.productStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined, undefined);
		// const { productListResult } = stores.productStore;
		this.listProduct = this.props.productListResult;
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

	exportToExcel = async () => {
		const { listProduct } = this;

		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('Danh sách sản phẩm');
		worksheet.addRow(['Danh sách sản phẩm']).eachCell((cell) => {
			cell.font = { bold: true, size: 20 };
		});
		// Thêm dòng tiêu đề
		worksheet.addRow(['STT', 'Ảnh minh họa', 'Mã sản phẩm', 'Tên sản phẩm', 'Đơn vị tính', 'Giá', 'Trạng thái']).eachCell((cell) => {
			cell.alignment = { vertical: 'middle', horizontal: 'center' };
		});
		for (const [index, item] of listProduct.entries()) {
			const { pr_code, pr_name, pr_unit, pr_price, pr_is_active, fi_id } = item;

			// Thêm dòng dữ liệu
			const row = worksheet.addRow([index + 1, '', pr_code, pr_name, pr_unit, AppConsts.formatNumber(pr_price), pr_is_active ? "Đang kinh doanh" : "Ngừng kinh doanh"]);
			row.height = 80;
			const column = worksheet.getColumn(index + 2);
			column.width = 30;

			// Nếu có hình ảnh, thêm hình ảnh vào ô
			if (fi_id) {
				try {
					const convertBase64 = await this.convertImageToBase64(this.getImageProduct(fi_id.md5!));

					const imageId = workbook.addImage({
						base64: convertBase64,
						extension: 'png',
					});

					// Thêm hình ảnh vào ô
					worksheet.mergeCells(`B${row.number}:B${row.number}`);
					worksheet.addImage(imageId, {
						tl: { col: 1, row: row.number - 1 },
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
		a.download = 'product ' + moment().format('DD_MM_YYYY') + '.xlsx';
		document.body.appendChild(a);
		a.click();

		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	render() {
		const {productListResult} = this.props;
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
								nameFileExport={'product' + ' ' + moment().format('DD_MM_YYYY')}
								idPrint="product_print_id"
								isExcelWithImage={true}
								isWord={true}
								isPrint={true}
								isDestroy={true}
								onCancel={() => this.props.onCancel!()}
								exportExcelWithImage={this.exportToExcel}
								componentRef={this.componentRef}
								idFooter='ProductTableFooterID'
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
						formatImage={true}
					/>
				</Col>
			</Modal>
		)
	}
}