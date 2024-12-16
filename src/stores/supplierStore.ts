import { action, observable } from 'mobx';
import http from '@services/httpService';
import {
	SupplierDto, UpdateSupplierInput, CreateSupplierInput, SupplierService, SORT
} from '@services/services_autogen';
export class SupplierStore {
	private supplierService: SupplierService;

	@observable totalSupplier: number = 0;
	@observable supplierListResult: SupplierDto[] = [];

	constructor() {
		this.supplierService = new SupplierService("", http);
	}

	@action
	public createSupplier = async (input: CreateSupplierInput) => {
		if (input == undefined || input == null) {
			return Promise.resolve<SupplierDto>(<any>null);
		}
		let result: SupplierDto = await this.supplierService.createSupplier(input);
		if (!!result) {
			this.supplierListResult.unshift(result);
			return Promise.resolve<SupplierDto>(<any>result);
		}
		return Promise.resolve<SupplierDto>(<any>null);
	}
	@action
	public createListSupplier = async (input: CreateSupplierInput[]) => {
		if (input == undefined || input == null) {
			return Promise.resolve<SupplierDto>(<any>null);
		}
		let result = await this.supplierService.createListSupplier(input);
		if (result != undefined) {
			this.supplierListResult = result;
		}
		return null;
	}

	@action
	async updateSupplier(input: UpdateSupplierInput) {
		let result: SupplierDto = await this.supplierService.updateSupplier(input);
		if (!!result) {
			this.supplierListResult = this.supplierListResult.map((x: SupplierDto) => {
				if (x.su_id === input.su_id) x = result;
				return x;
			});
			return Promise.resolve<SupplierDto>(<any>result);
		}
		return Promise.resolve<SupplierDto>(<any>null);
	}

	@action
	public deleteSupplier = async (item: SupplierDto) => {
		if (!item || !item.su_id) {
			return false;
		}
		let result = await this.supplierService.delete(item.su_id);
		if (!!result) {
			let indexDelete = this.supplierListResult.findIndex(a => a.su_id == item.su_id);
			if (indexDelete >= 0) {
				this.supplierListResult.splice(indexDelete, 1);
			}
			return true;
		}
		return false;
	}

	@action
	public getAll = async (su_search: string | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.supplierListResult = [];
		let result = await this.supplierService.getAll(su_search, fieldSort, sort, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.supplierListResult = [];
			this.totalSupplier = result.totalCount;
			for (let item of result.items) {
				this.supplierListResult.push(item);
			}
		}
	}
	@action
	async deleteMulti(number: number[]) {
		let result = await this.supplierService.deleteMulti(number);
		if (result.result == true) {
			return true;
		}
		return false;
	}
	@action
	async deleteAll() {
		await this.supplierService.deleteAll();
	}

}


export default SupplierStore;