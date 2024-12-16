import { action, observable } from 'mobx';
import http from '@services/httpService';
import { FreshDrinkDto, UpdateFreshDrinkInput, CreateFreshDrinkInput, FreshDrinkService, ImportFreshDrinkInput, SORT } from '@services/services_autogen';
export class FreshDrinkStore {
	private freshDrinkService: FreshDrinkService;

	@observable totalFreshDrink: number = 0;
	@observable freshDrinkListResult: FreshDrinkDto[] = [];

	constructor() {
		this.freshDrinkService = new FreshDrinkService("", http);
	}

	@action
	public createFreshDrink = async (input: CreateFreshDrinkInput) => {
		if (input == undefined || input == null) {
			return Promise.resolve<FreshDrinkDto>(<any>null);
		}
		let result: FreshDrinkDto = await this.freshDrinkService.createFreshDrink(input);
		if (!!result) {
			this.freshDrinkListResult.unshift(result);
			return Promise.resolve<FreshDrinkDto>(<any>result);
		}
		return Promise.resolve<FreshDrinkDto>(<any>null);
	}
	@action
	public createListFreshDrink = async (input: ImportFreshDrinkInput[]) => {
		if (input == undefined || input == null) {
			return Promise.resolve<FreshDrinkDto>(<any>null);
		}
		await this.freshDrinkService.createListFreshDrink(input);
	}
	@action
	async updateFreshDrink(input: UpdateFreshDrinkInput) {
		let result: FreshDrinkDto = await this.freshDrinkService.updateFreshDrink(input);
		if (!!result) {
			this.freshDrinkListResult = this.freshDrinkListResult.map((x: FreshDrinkDto) => {
				if (x.fr_dr_id === input.fr_dr_id) x = result;
				return x;
			});
			return Promise.resolve<FreshDrinkDto>(<any>result);
		}
		return Promise.resolve<FreshDrinkDto>(<any>null);
	}

	@action
	public deleteFreshDrink = async (item: FreshDrinkDto) => {
		if (!item || !item.fr_dr_id) {
			return false;
		}
		let result = await this.freshDrinkService.delete(item.fr_dr_id);
		if (!!result) {
			let indexDelete = this.freshDrinkListResult.findIndex(a => a.fr_dr_id == item.fr_dr_id);
			if (indexDelete >= 0) {
				this.freshDrinkListResult.splice(indexDelete, 1);
			}
			return true;
		}
		return false;
	}

	@action
	public getAll = async (fr_dr_search: string | undefined, su_id: number | undefined, fr_dr_price_down: number | undefined, fr_dr_price_up: number | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.freshDrinkListResult = [];
		let result = await this.freshDrinkService.getAll(fr_dr_search, su_id, fr_dr_price_down, fr_dr_price_up,fieldSort,sort, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalFreshDrink = result.totalCount;
			this.freshDrinkListResult = result.items;
		}
	}

	@action
	public deleteMulti = async (id: number[]) => {
		await this.freshDrinkService.deleteMulti(id);
	}

	@action
	public deleteAll = async () => {
		await this.freshDrinkService.deleteAll();
	}
}


export default FreshDrinkStore;