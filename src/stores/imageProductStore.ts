import { action, observable } from 'mobx';
import http from '@services/httpService';
import { FileParameter, ImageProductDto, ImageProductService, RenameFileInput } from '@src/services/services_autogen';

export class ImageProductStore {
	private imageProductService: ImageProductService;
	@observable imageProductSelect: ImageProductDto = new ImageProductDto();

	@observable totalImageProduct: number = 0;
	@observable imageProductListResult: ImageProductDto[] = [];

	constructor() {
		this.imageProductService = new ImageProductService("", http);
	}

	@action
	public createFile = async (fileName: string | undefined, filePayload: FileParameter | undefined) => {
		if (filePayload == undefined || filePayload == null) {
			return Promise.resolve<ImageProductDto>(<any>null);
		}
		let result: ImageProductDto = await this.imageProductService.createFiles(fileName, filePayload);
		if (!!result) {
			this.imageProductListResult.unshift(result);
			return Promise.resolve<ImageProductDto>(<any>result);
		}
		return Promise.resolve<ImageProductDto>(<any>null);
	}
	@action
	renameFile = async (body: RenameFileInput | undefined) => {
		let result = await this.imageProductService.renameFile(body);
		if (!!result) {
			return true
		}
		return false
	}
	@action
	public deleteImageProduct = async (fi_id: number | undefined) => {
		if (!!fi_id) {
			let result = await this.imageProductService.delete(fi_id!);
			if (!!result) {
				return true;
			}
			return false;
		}
		return false;
	}

	@action
	public getAll = async (im_pr_name: string | undefined, skipCount: number | undefined, maxResultCount: number | undefined,) => {
		this.imageProductListResult = [];
		let result = await this.imageProductService.getAll(im_pr_name, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalImageProduct = result.totalCount;
			this.imageProductListResult = result.items;
		}
	}
	@action
	public deleteMultiImageProduct = async (fi_id_list: number[] | undefined) => {
		if (!!fi_id_list) {
			let result = await this.imageProductService.deleteMulti(fi_id_list!);
			if (!!result) {
				return true;
			}
			return false;
		}
		return false;
	}
	@action
	public deleteAll = async () => {
		let result = await this.imageProductService.deleteAll();
		if (!!result) {
			return true;
		}
		return false;
	}
}
// @action
// public getAllByAdmin = async (us_id_list: number[] | undefined, im_pr_name: string | undefined, ma_id_list: number[] | undefined, skipCount: number | undefined, maxResultCount: number | undefined ,) => {
// 	this.imageProductListResult = [];
// 	let result = await this.imageProductService.getAllByAdmin(us_id_list,im_pr_name,ma_id_list, skipCount, maxResultCount);
// 	if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
// 		this.totalImageProduct = result.totalCount;
// 		this.imageProductListResult = result.items;
// 	}
// }



export default ImageProductStore;