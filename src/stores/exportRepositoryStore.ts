import http from '@services/httpService';
import { CreateExportRepositoryInput, CreateImportRepositoryInput, ExportRepositoryDto, ExportRepositoryService, ImportRepositoryDto } from '@services/services_autogen';
import { action, observable } from 'mobx';
export class ExportRepositoryStore {
	private exportRepositoryService: ExportRepositoryService;

	@observable totalExportReponsitory: number = 0;
	@observable exportRepositoryListResult: ExportRepositoryDto[] = [];

	constructor() {
		this.exportRepositoryService = new ExportRepositoryService("", http);
	}

	@action
	public getAll = async (ma_id_list: number[] | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.exportRepositoryListResult = [];
		let result = await this.exportRepositoryService.getAll(ma_id_list, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalExportReponsitory = result.totalCount;
			this.exportRepositoryListResult = result.items;
		}
	}
	@action
	public getAllByAdmin = async (us_id_list: number[] | undefined, ma_id_list: number[] | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.exportRepositoryListResult = [];
		let result = await this.exportRepositoryService.getAllByAdmin(us_id_list, ma_id_list, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalExportReponsitory = result.totalCount;
			this.exportRepositoryListResult = result.items;
		}
	}
	@action
	public createExportRepository = async (input: CreateExportRepositoryInput) => {
		if (input == undefined || input == null) {
			return Promise.resolve<ExportRepositoryDto>(<any>null);
		}
		let result: ExportRepositoryDto = await this.exportRepositoryService.createExportRepository(input);
		if (!!result) {
			this.exportRepositoryListResult.unshift(result);
			return Promise.resolve<ExportRepositoryDto>(<any>result);
		}
		return Promise.resolve<ExportRepositoryDto>(<any>null);
	}
}


export default ExportRepositoryStore;