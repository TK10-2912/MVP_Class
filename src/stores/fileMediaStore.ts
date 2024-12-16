import http from '@services/httpService';
import { FileMediaDto, WithdrawDto, FileMediaService, FileParameter, RenameFileMediaInput } from '@services/services_autogen';
import { action, observable } from 'mobx';
export class FileMediaStore {
    private fileMediaService: FileMediaService;

    @observable totalFileMedia: number = 0;
    @observable fileMediaListResult: FileMediaDto[] = [];

    constructor() {
        this.fileMediaService = new FileMediaService("", http);
    }

    @action
    public createFile = async (ma_id: number, filePayload: FileParameter | undefined) => {
        if (filePayload == undefined || filePayload == null || ma_id == undefined || ma_id < 1) {
            return Promise.resolve<FileMediaDto>(<any>null);
        }
        let result: FileMediaDto = await this.fileMediaService.createFile(ma_id, filePayload);
        if (!!result) {
            this.fileMediaListResult.unshift(result);
            return Promise.resolve<FileMediaDto>(<any>result);
        }
        return Promise.resolve<FileMediaDto>(<any>null);
    }
    @action
    public renameFile = async (input: RenameFileMediaInput) => {
        if (input == undefined || input == null) {
            return Promise.resolve<FileMediaDto>(<any>null);
        }
        let result: boolean = await this.fileMediaService.renameFile(input);
        if (!!result) {
            return Promise.resolve<FileMediaDto>(<any>result);
        }
        return Promise.resolve<FileMediaDto>(<any>null);
    }
    @action
    public getAll = async (fi_me_name: string | undefined, ma_id: number | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
        this.fileMediaListResult = [];
        let result = await this.fileMediaService.getAll(fi_me_name, ma_id, skipCount, maxResultCount);
        if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
            this.totalFileMedia = result.totalCount;
            this.fileMediaListResult = result.items;
        }
    }
    @action
    public delete = async (item: number) => {
        if (item == undefined || item == null || item > 0) {
            let result = await this.fileMediaService.delete(item);
            if (!!result) {
                let indexDelete = this.fileMediaListResult.findIndex(a => a.fi_me_id == item);
                if (indexDelete >= 0) {
                    this.fileMediaListResult.splice(indexDelete, 1);
                }
                return true;
            }
        }
        return false;
    }

}
export default FileMediaStore;