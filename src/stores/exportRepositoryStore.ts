import http from '@services/httpService';
import { CreateExportRepositoryInput, ExportRepositoryDto, ExportRepositoryService, SORT } from '@src/services/services_autogen';
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
	public getAll = async (gr_ma_id: number | undefined, ma_id_list: number[] | undefined, us_id_list: number[] | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined,) => {
		this.exportRepositoryListResult = [];
		let result = await this.exportRepositoryService.getAll(gr_ma_id,ma_id_list, us_id_list, fieldSort, sort, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalExportReponsitory = result.totalCount;
			this.exportRepositoryListResult = result.items;
		}
	}
	@action
	// public getAllByAdmin = async (us_id_list: number[] | undefined, ma_id_list: number[] | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
	// 	this.exportRepositoryListResult = [];
	// 	let result = await this.exportRepositoryService.getAllByAdmin(us_id_list, ma_id_list, skipCount, maxResultCount);
	// 	if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
	// 		this.totalExportReponsitory = result.totalCount;
	// 		this.exportRepositoryListResult = result.items;
	// 	}
	// }
	@action
	public createExportRepository = async (input: CreateExportRepositoryInput[]) => {
		await this.exportRepositoryService.createExportRepository(input);
	}

}


export default ExportRepositoryStore;