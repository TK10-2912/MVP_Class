import http from '@services/httpService';
import { CreateImportRepositoryInput, EImportRepositoryStatus, ImportRepositoryDto, ImportRepositoryService, SORT, UpdateImportRepositoryInput } from '@services/services_autogen';
import { action, observable } from 'mobx';
export class ImportRepositoryStore {
	private importRepositoryService: ImportRepositoryService;

	@observable totalImportReponsitory: number = 0;
	@observable importRepositoryListResult: ImportRepositoryDto[] = [];

	constructor() {
		this.importRepositoryService = new ImportRepositoryService("", http);
	}

	@action
	public getAll = async (im_re_code: string | undefined, im_re_status: EImportRepositoryStatus | undefined, su_id_list: number[] | undefined, us_id_import_list: number[] | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.importRepositoryListResult = [];
		let result = await this.importRepositoryService.getAll(im_re_code, im_re_status, su_id_list, us_id_import_list, fieldSort, sort, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalImportReponsitory = result.totalCount;
			this.importRepositoryListResult = result.items;
		}
	}
	@action
	public updateImportRepository = async (input: UpdateImportRepositoryInput | undefined) => {
		let result = await this.importRepositoryService.updateImportRepository(input);
		this.importRepositoryListResult = this.importRepositoryListResult!.map((x: ImportRepositoryDto) =>
			x.im_re_id === result!.im_re_id ? result! : x
		);
	}
	@action
	public delete = async (im_re_id: number | undefined) => {
		await this.importRepositoryService.delete(im_re_id);
	}
	@action
	public deleteMulti = async (im_re_id: number[] | undefined) => {
		await this.importRepositoryService.deleteMulti(im_re_id);
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