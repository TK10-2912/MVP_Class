import * as React from 'react';
import { Badge, Button, Row, Table, Tag, message } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { CreateExportRepositoryInput, ProductDailyMonitoringDto, ProductExportDto } from '@src/services/services_autogen';
import AppConsts, { pageSizeOptions } from '@src/lib/appconst';
import { TableRowSelection } from 'antd/lib/table/interface';
import { stores } from '@src/stores/storeInitializer';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import App from '@src/App';

export interface Iprops {
	productList: ProductDailyMonitoringDto[];
	is_printed?: boolean;
	ma_id?: number;
}


export default class DetailProductExport extends AppComponentBase<Iprops> {
	static dictionary: { [key: number]: ProductDailyMonitoringDto[] }[] = [];
	state = {
		isLoadDone: false,
		skipCount: 0,
		maxResultCount: 10,
		pageSize: 10,
		currentPage: 1,
	};
	listMaid: number[] = [];
	listDataExportRepository: { key: number; listProduct: ProductExportDto[] }[] = [];;
	listCreateExportRepositoryInput: CreateExportRepositoryInput[] = [];

	getStatus = (item: ProductDailyMonitoringDto) => { 
		const { machineListResult } = stores.machineStore;
		const quantityProduct = item.pr_quantityInRepository;
		const machine = machineListResult.find(item => item.ma_id == this.props.ma_id);
		if (machine != undefined && quantityProduct!= undefined) {
			if (quantityProduct > 0 && (machine.ma_maxTrayVending - item.pr_quantityInMachine) > 0 && quantityProduct >= (machine.ma_maxTrayVending- item.pr_quantityInMachine)) {
        
				return <Tag color='success'>Còn hàng</Tag>
			}
			else if (quantityProduct == 0) {
				return <Tag color='error'>Hết hàng</Tag>
			}
			else {
				return <Tag color='warning'>Không đủ hàng</Tag>
			} 
		}
        else{
            return <Tag color='warning'>Sản phẩm không còn sử dụng trên máy này</Tag>
        }
	}

	handleRowSelection = async (listItemProduct: React.Key[], listItem: ProductDailyMonitoringDto[]) => {
		this.setState({ isLoadDone: false });
		const key = this.props.ma_id!;
		const index = DetailProductExport.dictionary.findIndex(item => item.hasOwnProperty(key));
		if (index !== -1) {
			DetailProductExport.dictionary[index][key] = listItem;
		} else {
			DetailProductExport.dictionary.push({ [key]: listItem });
		}
		this.setState({ isLoadDone: true });
	}
	createDicList = async () => {
		this.setState({ isLoadDone: false });
		const { machineListResult } = stores.machineStore;
		const machine = machineListResult.find(item => item.ma_id == this.props.ma_id);
		if (Object.entries(DetailProductExport.dictionary).length > 0) {
			for (const [keyStr, value] of Object.entries(DetailProductExport.dictionary)) {
				const key = Number(Object.keys(value)[0]);
				const productList = Object.values(value)[0];
				const listProduct: ProductExportDto[] = [];
				productList.forEach(item => {
					const data: ProductExportDto = new ProductExportDto();
					console.log("aaaa", machine!.ma_maxTrayVending);

					data.pr_ex_no = item.pr_slot_id;
					data.pr_ex_quantity = machine!.ma_maxTrayVending - item.pr_quantityInMachine;
					data.pr_id = stores.sessionStore.getIdProductUseName(item.pr_name!);
					listProduct.push(data);
				})
				const existingEntry = this.listDataExportRepository.find(entry => entry.key === key);
				if (existingEntry) {
					existingEntry.listProduct = listProduct;
				} else {
					this.listDataExportRepository.push({ key, listProduct });
				}
			}
		}
		this.setState({ isLoadDone: true });
	}

	createExportRepository = () => {
		this.createDicList();
		if (Object.entries(this.listDataExportRepository).length > 0) {
			for (const [keyStr, value] of Object.entries(this.listDataExportRepository)) {
				const data: CreateExportRepositoryInput = new CreateExportRepositoryInput();
				data.ma_id = value.key;
				data.listProductExport = value.listProduct;
				this.listCreateExportRepositoryInput.push(data);
			}
			stores.exportRepositoryStore.createExportRepository(this.listCreateExportRepositoryInput);
			DetailProductExport.dictionary = [];
		}
	}
	render() {
		const { productList, is_printed } = this.props;

		const rowSelection: TableRowSelection<ProductDailyMonitoringDto> = {
			onChange: this.handleRowSelection
		};

		const columns: ColumnsType<ProductDailyMonitoringDto> = [
			{
				title: "STT", key: "stt_machine_index", width: 50, fixed: 'left',
				render: (text: string, item: ProductDailyMonitoringDto, index: number) => <div>{index + 1}</div>,
			},
			{
				title: "Tên sản phẩm", key: "stt_machine_index",
				render: (text: string, item: ProductDailyMonitoringDto) => <div>{item.pr_name}</div>
			},
			{
				title: "Vị trí khay", key: "stt_machine_index",
				render: (text: string, item: ProductDailyMonitoringDto) => <div>{item.pr_slot_id + 1}</div>
			},
			{
				title: "Giá sản phẩm", key: "stt_machine_index",
				render: (text: string, item: ProductDailyMonitoringDto) => <div>{AppConsts.formatNumber(item.pr_price)}</div>
			},
			{
				title: "Số lượng/Dung tích trong máy",
				render: (text: string, item: ProductDailyMonitoringDto) => <div>{AppConsts.formatNumber(item.pr_quantityInMachine)}</div>
			},
			{
				title: "Số lượng/Dung tích cần nạp",
				render: (text: string, item: ProductDailyMonitoringDto) => <div>{AppConsts.formatNumber(item.ma_de_max - item.pr_quantityInMachine)}</div>
			},
			{
				title: "Số lượng trong kho",
				render: (text: string, item: ProductDailyMonitoringDto) => <div>{item.pr_quantityInRepository}</div>
			},
			{
				title: "Trạng thái",width:200,
				render: (text: string, item: ProductDailyMonitoringDto) => <div>
					{this.getStatus(item)}
				</div>
			},
		];

		return (
			<>
				<Row justify='end' style={{ marginBottom: 10 }}>
					{(this.isGranted(AppConsts.Permission.Pages_Manager_General_ExportRepository_Create) &&  productList.length > 0) &&
						<Button type='primary' onClick={() => {
							Object.entries(DetailProductExport.dictionary).length > 0 ?
								this.createExportRepository()
								:
								message.error("Cần phải chọn sản phẩm trước khi xuất kho !")
						}}>
							Nạp hàng
						</Button>
					}
				</Row>
				<Table
					className='centerTable customTable'
					rowKey={record => "product_index__" + record.pr_name + record.pr_slot_id}
					size={'small'}
					bordered={true}
					scroll={{ y: 300,x:1300 }}

					columns={columns}
					rowSelection={this.isGranted(AppConsts.Permission.Pages_Manager_General_ExportRepository_Create) ? rowSelection  : undefined}
					dataSource={productList || []}
					pagination={{
						position: ['topRight'],
						total: productList.length,
						showTotal: (tot) => ("Tổng: ") + tot + "",
						showSizeChanger: true,
						pageSizeOptions: pageSizeOptions
					}}
				/>
			</>
		)
	}
}
