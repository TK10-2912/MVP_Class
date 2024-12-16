import { CreateTrashBinInput, ETrashType, SORT, TrashBinDto, TrashBinLogsDto, UpdateTrashBinInput } from '@services/services_autogen';
import { action, observable } from 'mobx';
import http from '@services/httpService';
import { TrashBinService } from '@src/services/services_autogen';

export class TrashBinStore {
	private trashBinService: TrashBinService;

	@observable totalTrashBin: number = 0;
	@observable totalTrashBinLogs: number = 0;
	@observable trashBinListResult: TrashBinDto[] = [];
	@observable trashBinLogListResult: TrashBinLogsDto[] = [];

	constructor() {
		this.trashBinService = new TrashBinService("", http);
	}

	@action
	public getAll = async (tr_name: string | undefined, gr_tr_id: number | undefined, deviceMAC: string | undefined, start_date: Date | undefined, end_date: Date | undefined, tr_type: ETrashType[] | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.trashBinListResult = [];
		let result = await this.trashBinService.getAll(tr_name, gr_tr_id, deviceMAC, start_date, end_date, tr_type, skipCount, maxResultCount);
		if (result != undefined) {
			this.totalTrashBin = result.totalCount;
			this.trashBinListResult = result.items!;
		}
	}
	@action
	public getAllTrashBinLog = async (tr_id: number, gr_tr_id: number | undefined, start_date: Date | undefined, end_date: Date | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.trashBinLogListResult = [];
		let result = await this.trashBinService.getAllTrashBinLogs(tr_id, gr_tr_id, start_date, end_date, fieldSort, sort, skipCount, maxResultCount);
		if (result != undefined) {
			this.totalTrashBinLogs = result.totalCount;
			this.trashBinLogListResult = result.items!;
		}
	}

	@action
	public createTrashBin = async (input: CreateTrashBinInput) => {
		if (input == undefined || input == null) {
			return Promise.resolve<TrashBinDto>(<any>null);
		}
		let result: TrashBinDto = await this.trashBinService.createTrashBin(input);
		if (!!result) {
			this.trashBinListResult.unshift(result);
			return Promise.resolve<TrashBinDto>(<any>result);
		}
		return Promise.resolve<TrashBinDto>(<any>null);
	}

	@action
	public updateTrashBin = async (input: UpdateTrashBinInput) => {
		if (input == undefined || input == null) {
			return Promise.resolve<TrashBinDto>(<any>null);
		}
		let result = await this.trashBinService.updateTrashBin(input);
		if (!!result) {
			return result;
		}
	}

	@action
	public delete = async (item: TrashBinDto) => {
		if (!item || !item.tr_id) {
			return false;
		}
		let result = await this.trashBinService.delete(item.tr_id);
		if (!!result) {
			let indexDelete = this.trashBinListResult.findIndex(a => a.tr_id == item.tr_id);
			if (indexDelete >= 0) {
				this.trashBinListResult.splice(indexDelete, 1);
			}
			return true;
		}
		return false;
	}

}


export default TrashBinStore;