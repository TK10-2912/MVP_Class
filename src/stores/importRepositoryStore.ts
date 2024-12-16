import http from '@services/httpService';
import { CreateImportRepositoryInput, ImportRepositoryDto, ImportRepositoryService, UpdateImportRepositoryInput } from '@services/services_autogen';
import { action, observable } from 'mobx';
export class ImportRepositoryStore {
	private importRepositoryService: ImportRepositoryService;

	@observable totalImportReponsitory: number = 0;
	@observable importRepositoryListResult: ImportRepositoryDto[] = [];

	constructor() {
		this.importRepositoryService = new ImportRepositoryService("", http);
	}

	@action
	public getAll = async (im_re_code: string | undefined, su_id_list: number[] | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.importRepositoryListResult = [];
		let result = await this.importRepositoryService.getAll(im_re_code, su_id_list, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalImportReponsitory = result.totalCount;
			this.importRepositoryListResult = result.items;
		}
	}
	@action
	public getAllByAdmin = async (us_id_list: number[] | undefined, im_re_code: string | undefined, su_id_list: number[] | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.importRepositoryListResult = [];
		let result = await this.importRepositoryService.getAllByAdmin(us_id_list, im_re_code, su_id_list, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalImportReponsitory = result.totalCount;
			this.importRepositoryListResult = result.items;
		}
	}
	@action
	public updateImportRepository = async (input :UpdateImportRepositoryInput | undefined) => {
		this.importRepositoryListResult = [];
		let result = await this.importRepositoryService.updateImportRepository(input);
		if (result != undefined ) {
			return true;
		}
		else return false;
	}
	@action
	public createImportRepository = async (input: CreateImportRepositoryInput) => {		
		if (input == undefined || input == null) {
			return Promise.resolve<ImportRepositoryDto>(<any>null);
		}
		let result: ImportRepositoryDto = await this.importRepositoryService.createImportRepository(input);
		if (!!result) {
			return true
		}
		else return false
	}
}


export default ImportRepositoryStore;