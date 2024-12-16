import { action, observable } from 'mobx';
import http from '@services/httpService';
import { CreateProductInput, ProductDto, ProductService } from '@src/services/services_autogen';
export class ProductStore {
	private productService: ProductService;

	@observable totalProduct: number = 0;
	@observable productListResult: ProductDto[] = [];

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
	// @action
	// public createListProduct = async (input: CreateProductInput[]) => {
	// 	if (input == undefined || input == null) {
	// 		return Promise.resolve<ProductDto>(<any>null);
	// 	}
	// 	let result = await this.productService.createListProduct(input);
	// 	if (!!result) {
	// 		return true;
	// 	}
	// 	return Promise.resolve<ProductDto>(<any>null);
	// }
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
	public getAll = async (pr_name: string | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.productListResult = [];
		let result = await this.productService.getAll(pr_name, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalProduct = result.totalCount;
			this.productListResult = result.items;
		}
	}
	@action
	public getAllByAdmin = async (us_id_list: number[] | undefined, pr_name: string | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.productListResult = [];
		let result = await this.productService.getAllByAdmin(us_id_list, pr_name, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalProduct = result.totalCount;
			this.productListResult = result.items;
		}
	}

	@action
	public deleteMulti = async (id: number[]) => {
		await this.productService.deleteMulti(id);
	}

	@action
	public deleteAll = async () => {
		await this.productService.deleteAll();
	}
}


export default ProductStore;