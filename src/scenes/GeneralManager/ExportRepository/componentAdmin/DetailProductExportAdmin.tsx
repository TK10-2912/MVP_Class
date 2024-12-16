import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts from '@src/lib/appconst';
import { ProductExportDto, ProductImportDto, } from '@src/services/services_autogen';
import { Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import * as React from 'react';

export interface IProps {
	productList: ProductExportDto[];
}
export default class DetailProductExportAdmin extends AppComponentBase<IProps> {
	state = {
		isLoadDone: true,
		im_re_id: undefined,
		visibleProduct: false,
	}
	render() {
		const { productList } = this.props;
		console.log("product", productList);

		const columns: ColumnsType<ProductExportDto> = [
			{ title: "STT", key: "stt_fresh_drink_index", width: 50, render: (text: string, item: ProductExportDto, index: number) => <div>{(index + 1)}</div> },
			{ title: "Tên sản phẩm", key: "im_re_code", render: (text: string, item: ProductExportDto) => <div> {item.pr_ex_name} </div> },
			{ title: "Số lượng", key: "us_id_import", render: (text: string, item: ProductExportDto) => <div> {item.pr_ex_quantity} </div> },
			{ title: "Tổng tiền ", key: "us_id_owner", render: (text: number, item: ProductExportDto) => <div> {AppConsts.formatNumber(Number(item.pr_ex_sell_money)) + " đ"} </div> },
		];
		return (
			<Table
				className='centerTable'
				columns={columns}
				size={'middle'}
				bordered={true}
				locale={{ "emptyText": "Không có dữ liệu" }}
				dataSource={productList != undefined ? productList : []}
				rowKey={record => "drink_table" + JSON.stringify(record)}
			/>
		)
	}
}