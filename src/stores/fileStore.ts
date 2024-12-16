import { action, observable } from 'mobx';
import http from '@services/httpService';
import { EComponentUpload, FileDto, FileParameter, FileService, RenameFileInput } from '@services/services_autogen';

export class FileStore {
	private fileService: FileService;
	@observable fileSelect: FileDto = new FileDto();

	@observable totalFile: number = 0;
	@observable fileListResult: FileDto[] = [];

	constructor() {
		this.fileService = new FileService("", http);
	}

	@action
	public createFile = async (fileType: number | undefined, filePayload: FileParameter | undefined,) => {
		if (filePayload == undefined || filePayload == null) {
			return Promise.resolve<FileDto>(<any>null);
		}
		let result: FileDto = await this.fileService.createFiles(fileType, filePayload);
		if (!!result) {
			return Promise.resolve<FileDto>(<any>result);
		}
		return Promise.resolve<FileDto>(<any>null);
	}
	renameFile = async (input: RenameFileInput) => {
		let result = await this.fileService.renameFile(input);
		if (!!result) {
			// this.fileListResult = this.fileListResult.map((x: FileDto) => {
			// 	if (x.fi_id === input.fi_id) x = result;
			// 	return x;
			// });
			return true
		}
		return false
	}
	@action
	public deleteFile = async (item: FileDto) => {
		let result = await this.fileService.delete(item.fi_id);
		if (!!result) {
			return true;
		}
		return false;
	}

	@action
	public getAll = async (fi_name: string | undefined, fi_type: EComponentUpload | undefined, skipCount: number | undefined, maxResultCount: number | undefined,) => {
		this.fileListResult = [];
		let result = await this.fileService.getAll(fi_name, fi_type, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalFile = result.totalCount;
			this.fileListResult = result.items;
		}
	}
}


export default FileStore;