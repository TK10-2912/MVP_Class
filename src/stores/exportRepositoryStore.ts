import http from '@services/httpService';
import { ExportRepositoryDto, ExportRepositoryService, Importing, SORT } from '@src/services/services_autogen';
// import { CreateExportRepositoryInput, CreateImportRepositoryInput, ExportRepositoryDto, ExportRepositoryService, ImportRepositoryDto } from '@services/services_autogen';
import { action, observable } from 'mobx';
export class ExportRepositoryStore {
	private exportRepositoryService: ExportRepositoryService;

	@observable totalExportReponsitory: number = 0;
	@observable exportRepositoryListResult: ExportRepositoryDto[] = [];

	constructor() {
		this.exportRepositoryService = new ExportRepositoryService("", http);
	}

	@action
	public getAll = async (re_id: number | undefined, ma_id: number | undefined, ex_re_code: string | undefined, start_date: Date | undefined, end_date: Date | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.exportRepositoryListResult = [];
		let result = await this.exportRepositoryService.getAll(re_id, ma_id, ex_re_code, start_date, end_date, fieldSort, sort, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalExportReponsitory = result.totalCount;
			this.exportRepositoryListResult = result.items;
		}
	}
	@action
	public createExportRepository = async (body: Importing | undefined) => {
		let result =  await this.exportRepositoryService.createOrUpdateExportProduct(body);
		if (result != undefined) {
			return Promise.resolve<ExportRepositoryDto>(<any>result);
		}
		return Promise.resolve<ExportRepositoryDto>(<any>null);
	}

}


export default ExportRepositoryStore;