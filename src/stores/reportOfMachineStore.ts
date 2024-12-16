import { action, observable } from 'mobx';
import http from '@services/httpService';
import { ReportLevel, ReportOfMachineDto, ReportOfMachineService, ReportStatus, SORT, UpdateReportOfMachineInput } from '@src/services/services_autogen';
class ReportOfMachineStore {
    private reportOfMachineService: ReportOfMachineService
    @observable reportOfMachineListResult: ReportOfMachineDto[] = [];
    @observable totalReportOfMachine: number = 0;

    constructor() {
        this.reportOfMachineService = new ReportOfMachineService("", http);
    }
    @action
    public getAll = async (re_status: ReportStatus | undefined, re_level: ReportLevel | undefined, re_code: string | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined, start_date: Date | undefined, end_date: Date | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined) => {
        this.reportOfMachineListResult = [];
        let result = await this.reportOfMachineService.getAll(re_status,re_level,re_code,fieldSort,sort,skipCount,maxResultCount,start_date,end_date,gr_ma_id,ma_id_list);
        if (result != undefined && result.items != undefined) {
            this.reportOfMachineListResult = result.items;
            this.totalReportOfMachine = result.totalCount;
        }
    }
    @action
    public getAllByAdmin = async (us_id: number[] | undefined, re_status: ReportStatus | undefined, re_level: ReportLevel | undefined, re_code: string | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined, start_date: Date | undefined, end_date: Date | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined) => {
        this.reportOfMachineListResult = [];
        let result = await this.reportOfMachineService.getAllByAdmin(us_id,re_status,re_level,re_code,fieldSort,sort,skipCount,maxResultCount,start_date,end_date,gr_ma_id,ma_id_list);
        if (result != undefined && result.items != undefined) {
            this.reportOfMachineListResult = result.items;
            this.totalReportOfMachine = result.totalCount
        }
    }
    @action
    public updateReportOfMachine = async (item: UpdateReportOfMachineInput) => {
     
		let result = await this.reportOfMachineService.updateReportOfMachine(item);
		this.reportOfMachineListResult = this.reportOfMachineListResult!.map((x: ReportOfMachineDto) =>
			x.re_id === result!.re_id ? result! : x
		);
    }
}

export default ReportOfMachineStore;