import { action, observable } from 'mobx';
import http from '@services/httpService';
import {
	SORT, HandoverService, HandoverDto, CreateHandoverInput, UpdateHandoverInput, EHandoverStatus,
	EHandoverType
} from '@services/services_autogen';
export class HandoverStore {
	private handoverService: HandoverService;

	@observable totalCount: number = 0;
	@observable handoverListResult: HandoverDto[] = [];

	constructor() {
		this.handoverService = new HandoverService("", http);
	}

	@action
	public createHandover = async (input: CreateHandoverInput) => {
		if (input == undefined || input == null) {
			return Promise.resolve<HandoverDto>(<any>null);
		}
		let result: HandoverDto = await this.handoverService.createHandover(input);
		if (!!result) {
			this.handoverListResult.unshift(result);
			return Promise.resolve<HandoverDto>(<any>result);
		}
		return Promise.resolve<HandoverDto>(<any>null);
	}
	@action
	public createListHandover = async (input: CreateHandoverInput[]) => {
		if (input == undefined || input == null) {
			return Promise.resolve<HandoverDto>(<any>null);
		}
		let result = await this.handoverService.createListHandover(input);
		if (!!result) {
			return result
		}
	}

	@action
	async updateHandover(input: UpdateHandoverInput) {
		let result: HandoverDto = await this.handoverService.updateHandover(input);
		if (!!result) {
			this.handoverListResult = this.handoverListResult.map((x: HandoverDto) => {
				if (x.ha_id === input.ha_id) x = result;
				return x;
			});
			return Promise.resolve<HandoverDto>(<any>result);
		}
		return Promise.resolve<HandoverDto>(<any>null);
	}

	// @action
	// public deleteSupplier = async (item: HandoverDto) => {
	// 	if (!item || !item.ha_id) {
	// 		return false;
	// 	}
	// 	let result = await this.handoverService.(item.su_id);
	// 	if (!!result) {
	// 		let indexDelete = this.handoverListResult.findIndex(a => a.su_id == item.su_id);
	// 		if (indexDelete >= 0) {
	// 			this.handoverListResult.splice(indexDelete, 1);
	// 		}
	// 		return true;
	// 	}
	// 	return false;
	// }

	@action
	public getAll = async (start_date: Date | undefined, end_date: Date | undefined, handover_user: number[] | undefined, receive_user: number[] | undefined, ha_status: EHandoverStatus | undefined, ha_type: EHandoverType | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.handoverListResult = [];
		let result = await this.handoverService.getAll(start_date, end_date, handover_user, receive_user, ha_status, ha_type, fieldSort, sort, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.handoverListResult = [];
			this.totalCount = result.totalCount;
			for (let item of result.items) {
				this.handoverListResult.push(item);
			}
		}
	}

}


export default HandoverStore;