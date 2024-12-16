import { action, observable } from 'mobx';
import http from '@services/httpService';

import {
    ApplicationExtDto,
    ApplicationExtService, 
	CreateApplicationExtInput, 
	UpdateApplicationExtInput,
} from '@services/services_autogen';

class ApplicationStore {
	private applicationExtService: ApplicationExtService;

    @observable totalApplication: number = 0;
    @observable applicationListResult: ApplicationExtDto[] = [];
	constructor() {
		this.applicationExtService = new ApplicationExtService("", http);
	}
    @action
	public createApplication = async (input: CreateApplicationExtInput) => {
		if (input == undefined || input == null) {
			return Promise.resolve<ApplicationExtDto>(<any>null);
		}
		let result: ApplicationExtDto = await this.applicationExtService.create(input);
		if (!!result) {
			this.applicationListResult.unshift(result);
			return Promise.resolve<ApplicationExtDto>(<any>result);
		}
		return Promise.resolve<ApplicationExtDto>(<any>null);
	}
	@action
	async updateApplication(input: UpdateApplicationExtInput) {
		let result: ApplicationExtDto = await this.applicationExtService.update(input);
		if (!!result) {
			this.applicationListResult = this.applicationListResult.map((x: ApplicationExtDto) => {
				if (x.ap_id === input.ap_id) x = result;
				return x;
			});
			return Promise.resolve<ApplicationExtDto>(<any>result);
		}
		return Promise.resolve<ApplicationExtDto>(<any>null);
	}

	@action
	public deleteApplication = async (item: ApplicationExtDto) => {
		if (!item || !item.ap_id) {
			return false;
		}
		let result = await this.applicationExtService.delete(item.ap_id);
		if (!!result) {
			let indexDelete = this.applicationListResult.findIndex(a => a.ap_id == item.ap_id);
			if (indexDelete >= 0) {
				this.applicationListResult.splice(indexDelete, 1);
			}
			return true;
		}
		return false;
	}


	@action
	public getAll = async (app_search: string | undefined) => {
		this.applicationListResult = [];
		this.totalApplication = 0;
		let result = await this.applicationExtService.getAll(app_search);
		if (result != undefined && result.items != undefined && result.items != null && result.items.length != undefined && result.items.length != null) {
			this.applicationListResult = result.items!;
			this.totalApplication = result.items.length;
		}
	}
}
export default ApplicationStore;