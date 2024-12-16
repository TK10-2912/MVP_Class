import { CreateGroupTrashbinInput, CreateTrashBinInput, ETrashType, GroupTrashbinDto, GroupTrashbinService, SORT, TrashBinDto, TrashBinLogsDto, UpdateGroupTrashbinInput, UpdateTrashBinInput } from '@services/services_autogen';
import { action, observable } from 'mobx';
import http from '@services/httpService';

export class GroupTrashBinStore {
	private groupTrashBinService: GroupTrashbinService;

	@observable totalGroupTrashBin: number = 0;
	@observable groupTrashBinListResult: GroupTrashbinDto[] = [];

	constructor() {
		this.groupTrashBinService = new GroupTrashbinService("", http);
	}

	@action
	public getAll = async (gr_tr_search: string | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.groupTrashBinListResult = [];
		let result = await this.groupTrashBinService.getAll(gr_tr_search, skipCount, maxResultCount);
		if (result != undefined) {
			this.totalGroupTrashBin = result.totalCount;
			this.groupTrashBinListResult = result.items!;
		}
	}
	@action
	public createGroupTrashbin = async (input: CreateGroupTrashbinInput) => {
		if (input == undefined || input == null) {
			return Promise.resolve<TrashBinDto>(<any>null);
		}
		let result: GroupTrashbinDto = await this.groupTrashBinService.createGroupTrashbin(input);
		if (!!result) {
			this.groupTrashBinListResult.unshift(result);
			return Promise.resolve<TrashBinDto>(<any>result);
		}
		return Promise.resolve<TrashBinDto>(<any>null);
	}

	@action
	public updateGroupTrashbin = async (input: UpdateGroupTrashbinInput) => {
		let result: GroupTrashbinDto = await this.groupTrashBinService.updateGroupTrashbin(input);
		if (!!result) {
			this.groupTrashBinListResult = this.groupTrashBinListResult.map((x: GroupTrashbinDto) => {
				if (x.gr_tr_id === result.gr_tr_id) x = result;
				return x;
			});
			return Promise.resolve<GroupTrashbinDto>(<any>result);
		}
		return Promise.resolve<GroupTrashbinDto>(<any>null);
	}

	@action
	public delete = async (item: GroupTrashbinDto) => {
		if (!item || !item.gr_tr_id) {
			return false;
		}
		let result = await this.groupTrashBinService.delete(item.gr_tr_id);
		if (!!result) {
			let indexDelete = this.groupTrashBinListResult.findIndex(a => a.gr_tr_id == item.gr_tr_id);
			if (indexDelete >= 0) {
				this.groupTrashBinListResult.splice(indexDelete, 1);
			}
			return true;
		}
		return false;
	}
	@action
	public deleteMulti = async (listNumber: number[]) => {
		let data = await this.groupTrashBinService.deleteMulti(listNumber);
		if (data.result == true) { return true; }
		else { return false; }
	}
	@action
	public deleteAll = async () => {
		let data = await this.groupTrashBinService.deleteAll();
		if (data == true) { return true; }
		else { return false; }
	}
}


export default GroupTrashBinStore;