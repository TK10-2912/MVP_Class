import { action, observable } from 'mobx';
import http from '@services/httpService';
import { DrinkDto, UpdateDrinkInput, CreateDrinkInput, DrinkService, ImportDrinkInput, SORT } from '@services/services_autogen';
export class DrinkStore {
	private drinkService: DrinkService;

	@observable totalDrink: number = 0;
	@observable drinkListResult: DrinkDto[] = [];

	constructor() {
		this.drinkService = new DrinkService("", http);
	}

	@action
	public createDrink = async (input: CreateDrinkInput) => {
		if (input == undefined || input == null) {
			return Promise.resolve<DrinkDto>(<any>null);
		}
		let result: DrinkDto = await this.drinkService.createDrink(input);
		if (!!result) {
			this.drinkListResult.unshift(result);
			return Promise.resolve<DrinkDto>(<any>result);
		}
		return Promise.resolve<DrinkDto>(<any>null);
	}

	@action
	public createListDrink = async (input: ImportDrinkInput[]) => {
		if (input == undefined || input == null) {
			return Promise.resolve<DrinkDto>(<any>null);
		}
		await this.drinkService.createListDrink(input);
	}

	@action
	async updateDrink(input: UpdateDrinkInput) {
		let result: DrinkDto = await this.drinkService.updateDrink(input);
		if (!!result) {
			this.drinkListResult = this.drinkListResult.map((x: DrinkDto) => {
				if (x.dr_id === input.dr_id) x = result;
				return x;
			});
			return Promise.resolve<DrinkDto>(<any>result);
		}
		return Promise.resolve<DrinkDto>(<any>null);
	}

	@action
	public deleteDrink = async (item: DrinkDto) => {
		if (!item || !item.dr_id) {
			return false;
		}
		let result = await this.drinkService.delete(item.dr_id);
		if (!!result) {
			let indexDelete = this.drinkListResult.findIndex(a => a.dr_id == item.dr_id);
			if (indexDelete >= 0) {
				this.drinkListResult.splice(indexDelete, 1);
			}
			return true;
		}
		return false;
	}

	@action
	public getAll = async (dr_search: string | undefined, su_id: number | undefined, dr_price_down: number | undefined, dr_price_up: number | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.drinkListResult = [];
		let result = await this.drinkService.getAll(dr_search,su_id,dr_price_down,dr_price_up,fieldSort,sort, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalDrink = result.totalCount;
			this.drinkListResult = result.items;
		}
	}

	@action
	public deleteMulti = async (id: number[]) => {
		await this.drinkService.deleteMulti(id);
	}

	@action
	public deleteAll = async () => {
		await this.drinkService.deleteAll();
	}
}


export default DrinkStore;