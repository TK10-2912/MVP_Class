import { action, observable } from 'mobx';
import http from '@services/httpService';
import { ActiveOrDeactiveProductInput, CreateProductInput, MachineDetailDto, ProductDto, ProductService, SORT, UpdateProductInput } from '@src/services/services_autogen';

export class ProductDetailDto extends ProductDto {
	public gia_ban_san_pham;
	public so_luong_con;
	public so_luong_toi_da;
	constructor(product: ProductDto, machineDetail: MachineDetailDto) {
		super(product);
        this.gia_ban_san_pham = product != undefined ? product.pr_price : 0;
		this.so_luong_con = machineDetail.ma_de_cur || 0;
		this.so_luong_toi_da = machineDetail.ma_de_max || 0;
	}
}
export class ProductStore {
	private productService: ProductService;

	@observable totalProduct: number = 0;
	@observable productListResult: ProductDto[] = [];
	@observable productDetailListResult: ProductDetailDto[] = [];
	constructor() {
		this.productService = new ProductService("", http);
	}

	@action
	public createProduct = async (input: CreateProductInput) => {
		if (input == undefined || input == null) {
			return Promise.resolve<ProductDto>(<any>null);
		}
		let result: ProductDto = await this.productService.createProduct(input);
		if (!!result) {
			this.productListResult.unshift(result);
			return Promise.resolve<ProductDto>(<any>result);
		}
		return Promise.resolve<ProductDto>(<any>null);
	}
	@action
	public delete = async (item: ProductDto) => {
		if (!item || !item.pr_id) {
			return false;
		}
		let result = await this.productService.delete(item.pr_id);
		if (!!result) {
			let indexDelete = this.productListResult.findIndex(a => a.pr_id == item.pr_id);
			if (indexDelete >= 0) {
				this.productListResult.splice(indexDelete, 1);
			}
			return true;
		}
		return false;
	}

	@action
	public getAll = async (pr_name: string | undefined, pr_is_active: number | undefined, su_id_list: number[] | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.productListResult = [];
		let result = await this.productService.getAll(pr_name, pr_is_active, su_id_list, fieldSort, sort, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalProduct = result.totalCount;
			this.productListResult = result.items;
			this.productDetailListResult = result.items.map(value => new ProductDetailDto(value, new MachineDetailDto));
		}
	}
	@action
	public updateProduct = async (input: UpdateProductInput) => {
		let result = await this.productService.updateProduct(input);
		this.productListResult = this.productListResult!.map((x: ProductDto) =>
			x.pr_id === result!.pr_id ? result! : x
		);
	}
	@action
	public createListProduct = async (input: CreateProductInput[]) => {
		await this.productService.createListProduct(input);
	}
	@action
	public deleteMulti = async (id: number[]) => {
		await this.productService.deleteMulti(id);
	}
	@action
	public activeOrDeactive = async (input: ActiveOrDeactiveProductInput) => {
		await this.productService.activeOrDeactive(input);
	}

	@action
	public deleteAll = async () => {
		await this.productService.deleteAll();
	}
}


export default ProductStore;