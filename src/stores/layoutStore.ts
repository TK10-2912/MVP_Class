import { action, observable } from 'mobx';
import http from '@services/httpService';
import { CreateLayoutInput, LayoutDto, LayoutService, UpdateLayoutInput } from '@src/services/services_autogen';
export class LayoutStore {
	private layoutService: LayoutService;

	@observable totalCount: number = 0;
	@observable layoutListResult: LayoutDto[] = [];

	constructor() {
		this.layoutService = new LayoutService("", http);
	}

	@action
	public createLayout = async (input: CreateLayoutInput) => {
		if (input == undefined || input == null) {
			return Promise.resolve<LayoutDto>(<any>null);
		}
		let result: boolean = await this.layoutService.createLayout(input);
		if (!!result) {
			return result;
		}
	}
	@action
	public updateLayout = async (input: UpdateLayoutInput) => {
		if (input == undefined || input == null) {
			return Promise.resolve<LayoutDto>(<any>null);
		}
		let result: boolean = await this.layoutService.updateLayout(input);
		if (!!result) {
			return result;
		}
	}
	@action
	public getAll = async (la_name: string | undefined, la_type: string | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.layoutListResult = [];
		let result = await this.layoutService.getAll(la_name, la_type, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalCount = result.totalCount;
			
				this.layoutListResult=result.items
			
		}
	}
	@action
	public delete = async (item: LayoutDto) => {
		if (!item || !item.la_id) {
			return false;
		}
		let result = await this.layoutService.delete(item.la_id);
		if (!!result) {
			let indexDelete = this.layoutListResult.findIndex(a => a.la_id == item.la_id);
			if (indexDelete >= 0) {
				this.layoutListResult.splice(indexDelete, 1);
			}
			return true;
		}
		return false;
	}

	@action
	async deleteMulti(ids: number[]) {
		let result = await this.layoutService.deleteMulti(ids);
		return result;
	}

	async deleteAll() {
		let result = await this.layoutService.deleteAll();
		return result;
	}
}

export default LayoutStore;