import http from '@services/httpService';
import { BillMethod, CreateWithdrawBankInput, CreateWithdrawCashInput, SORT, WithdrawDto, WithdrawService } from '@services/services_autogen';
import { action, observable } from 'mobx';
export class WithdrawStore {
    private withdrawService: WithdrawService;

    @observable totalWithdraw: number = 0;
    @observable withdrawListResult: WithdrawDto[] = [];

    constructor() {
        this.withdrawService = new WithdrawService("", http);
    }

    @action
    public createWithdrawCash = async (input: CreateWithdrawCashInput) => {
        if (input == undefined || input == null) {
            return Promise.resolve<WithdrawDto>(<any>null);
        }
        let result: boolean = await this.withdrawService.createWithdrawCash(input);
        if (!!result) {
            return Promise.resolve<WithdrawDto>(<any>result);
        }
        return Promise.resolve<WithdrawDto>(<any>null);
    }
    @action
    public createWithdrawBank = async (input: CreateWithdrawBankInput) => {
        if (input == undefined || input == null) {
            return Promise.resolve<WithdrawDto>(<any>null);
        }
        let result: WithdrawDto = await this.withdrawService.createWithdrawBank(input);
        this.withdrawListResult.unshift(result);
        if (!!result) {
            return Promise.resolve<WithdrawDto>(<any>result);
        }
        return Promise.resolve<WithdrawDto>(<any>null);
    }
    @action
    public getAll = async (ma_id_list: number[] | undefined, gr_ma_id: number | undefined, wi_payment_type: BillMethod | undefined, wi_start_date: Date | undefined, wi_end_date: Date | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
        this.withdrawListResult = [];
        let result = await this.withdrawService.getAll(ma_id_list,gr_ma_id, wi_payment_type, wi_start_date, wi_end_date, fieldSort, sort, skipCount, maxResultCount);
        if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
            this.totalWithdraw = result.totalCount;
            this.withdrawListResult = result.items;
        }
    }
    @action
    public getAllByAdmin = async (us_id_list: number[] | undefined, ma_id_list: number[] | undefined, gr_ma_id: number | undefined, wi_payment_type: BillMethod | undefined, wi_start_date: Date | undefined, wi_end_date: Date | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
        this.withdrawListResult = [];
        let result = await this.withdrawService.getAllByAdmin(us_id_list, ma_id_list,gr_ma_id, wi_payment_type, wi_start_date, wi_end_date, fieldSort, sort, skipCount, maxResultCount);
        if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
            this.totalWithdraw = result.totalCount;
            this.withdrawListResult = result.items;
        }
    }
}
export default WithdrawStore;