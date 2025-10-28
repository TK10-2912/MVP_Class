import http from '@services/httpService';
import { ChangeStatusTranferRepositoryInput, CreateTranferRepositoryInput, ETranferRepositoryStatus, ETranferStatus, SORT, TranferRepositoryDto, TranferRepositoryService, UpdateTranferRepositoryInput } from '@src/services/services_autogen';
import { action, observable } from 'mobx';

export class TransferRepositoryStore {
    private transferRepositoryService: TranferRepositoryService;

    @observable transferRepositoryResult: TranferRepositoryDto[] = [];
    @observable totalTransferRepository: number = 0;

    constructor() {
        this.transferRepositoryService = new TranferRepositoryService("", http);
    }

    @action
    public getAll = async (re_id: number | undefined, tr_re_code: string | undefined, tr_re_status: ETranferRepositoryStatus | undefined, re_id_transfer: number | undefined, re_id_receiver: number | undefined, tr_status: ETranferStatus | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
        this.transferRepositoryResult = [];
        let result = await this.transferRepositoryService.getAll(re_id, tr_re_code, tr_re_status, re_id_transfer, re_id_receiver, tr_status, fieldSort, sort, skipCount, maxResultCount);
        if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
            this.totalTransferRepository = result.totalCount;
            this.transferRepositoryResult = result.items;
        }
    }
    @action
    public getAllAdmin = async (re_id: number | undefined, tr_re_code: string | undefined, tr_re_status: ETranferRepositoryStatus | undefined, re_id_transfer: number | undefined, re_id_receiver: number | undefined, tr_status: ETranferStatus | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
        this.transferRepositoryResult = [];
        let result = await this.transferRepositoryService.getAllAdmin(re_id, tr_re_code, tr_re_status, re_id_transfer, re_id_receiver, tr_status, fieldSort, sort, skipCount, maxResultCount);
        if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
            this.totalTransferRepository = result.totalCount;
            this.transferRepositoryResult = result.items;
        }
    }
    @action
    public createTranferRepository = async (body: CreateTranferRepositoryInput) => {
        await this.transferRepositoryService.createTranferRepository(body);
    }
    @action
    public updateTranferRepository = async (body: UpdateTranferRepositoryInput) => {
        await this.transferRepositoryService.updateTranferRepository(body);
    }
    @action
    public changeStatus = async (body: ChangeStatusTranferRepositoryInput | undefined,) => {
        let result = await this.transferRepositoryService.changeStatus(body);
        if (result) {
            var transferRepository = this.transferRepositoryResult.find(a => a.tr_re_id == body?.tr_re_id);
            if (transferRepository) {
                transferRepository.tr_re_status = body?.tr_re_status!;
            }
        }
    }
    @action
    public delete = async (tr_re_id: number | undefined,) => {
        await this.transferRepositoryService.delete(tr_re_id);
    }
}


export default TransferRepositoryStore;