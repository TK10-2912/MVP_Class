import http from '@services/httpService';
import { CreateExportRepositoryInput, CreateImportRepositoryInput, RepositoryDto, ImportRepositoryDto, RepositoryService } from '@services/services_autogen';
import { action, observable } from 'mobx';
export class RepositoryStore {
	private repositoryService: RepositoryService;

	@observable totalReponsitory: number = 0;
	@observable repositoryListResult: RepositoryDto[] = [];

	constructor() {
		this.repositoryService = new RepositoryService("", http);
	}

	@action
	public getAll = async (pr_name: string | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.repositoryListResult = [];
		let result = await this.repositoryService.getAll(pr_name, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalReponsitory = result.totalCount;
			this.repositoryListResult = result.items;
		}
	}
	@action
	public getAllByAdmin = async (us_id_list: number[] | undefined, pr_name: string | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.repositoryListResult = [];
		let result = await this.repositoryService.getAllByAdmin(us_id_list, pr_name, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalReponsitory = result.totalCount;
			this.repositoryListResult = result.items;
		}
	}
}


export default RepositoryStore;