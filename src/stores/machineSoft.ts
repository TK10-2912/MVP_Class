import http from '@services/httpService';
import { CreateMachineSoftInput, MachineSoftDto, MachineSoftLogsDto, MachineSoftLogsService, MachineSoftService, UpdateMachineSoftInput } from '@src/services/services_autogen';
import { action, observable } from 'mobx';
export class MachineSoftStore {
    private machineSoftService: MachineSoftService;
    private machineSoftLogsService: MachineSoftLogsService;
    @observable totalMachineSoft: number = 0;
    @observable totalMachineSoftLogs: number = 0;
    @observable machineSoftListResult: MachineSoftDto[] = [];
    @observable machineSoftLogsServiceListResult: MachineSoftLogsDto[] = [];

    constructor() {
        this.machineSoftService = new MachineSoftService("", http);
        this.machineSoftLogsService = new MachineSoftLogsService("", http);
    }
    @action
    public getAll = async (ma_so_version_name: string | undefined, ma_so_version_code: number | undefined, ma_id: number | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
        this.machineSoftListResult = [];
        let result = await this.machineSoftService.getAll(ma_so_version_name, ma_so_version_code, ma_id, skipCount, maxResultCount);
        if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
            this.totalMachineSoft = result.totalCount;
            this.machineSoftListResult = result.items;
        }
    }
    @action
    public getAllMachineSoftLogs = async (ma_id: number | undefined, ma_hardware_version_name: string | undefined, ma_hardware_version_code: number | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
        this.machineSoftLogsServiceListResult = [];
        let result = await this.machineSoftLogsService.getAll(ma_id,ma_hardware_version_name, ma_hardware_version_code, skipCount, maxResultCount);
        if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
            this.totalMachineSoftLogs = result.totalCount;
            this.machineSoftLogsServiceListResult = result.items;
        }
    }
    @action
    public createMachineSoft = async (input: CreateMachineSoftInput) => {
        if (input == undefined || input == null) {
            return Promise.resolve<MachineSoftDto>(<any>null);
        }
        let result: MachineSoftDto = await this.machineSoftService.createMachineSoft(input);
        if (!!result) {
            this.machineSoftListResult.unshift(result);
            return Promise.resolve<MachineSoftDto>(<any>result);
        }
        return Promise.resolve<MachineSoftDto>(<any>null);
    }
    @action
    public updateMachineSoft = async (item: UpdateMachineSoftInput) => {

        let result = await this.machineSoftService.updateMachineSoft(item);
        if (!!result) {
            this.machineSoftListResult = this.machineSoftListResult.map((x: MachineSoftDto) => {
                if (x.ma_so_id === item.ma_so_id) x = result;
                return x;
            });
            return Promise.resolve<MachineSoftDto>(<any>result);
        }
        return Promise.resolve<MachineSoftDto>(<any>null);
    }
}




export default MachineSoftStore;