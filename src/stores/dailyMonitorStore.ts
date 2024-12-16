import { action, observable } from 'mobx';
import http from '@services/httpService';
import { DailyMonitoringService, SearchDailyMonitoringInput, DailySaleMonitoringDto, MachineDtoListResultDto, MachineOutOfStockQueryDto, MachineDto, MachineNetworkStatus, SORT, MachineStatus } from '@services/services_autogen';
export class DailyMonitorStore {
	private dailyMonitoringService: DailyMonitoringService;
	@observable listMachineOutOfStockQueryDto: MachineOutOfStockQueryDto[] = [];
	@observable listMachineDto: MachineDto[] = [];
	@observable dailySaleMonitoringResult: DailySaleMonitoringDto = new DailySaleMonitoringDto();
	@observable total: number = 0;

	constructor() {
		this.dailyMonitoringService = new DailyMonitoringService("", http);
	}



	@action
	public dailySaleMonitoring = async (gr_ma_id: number | undefined, ma_id_list: number[] | undefined, skipCount: number | undefined, maxResultCount: number | undefined,) => {
		let result = await this.dailyMonitoringService.dailySaleMonitoring(gr_ma_id, ma_id_list, skipCount, maxResultCount);
		if (!!result && result.items != undefined) {
			this.total = result.totalCount;
			this.dailySaleMonitoringResult = result.items[0];
		}
	}
	@action
	public dailySaleMonitoringAdmin = async (us_id: number[] | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined, skipCount: number | undefined, maxResultCount: number | undefined,) => {
		let result = await this.dailyMonitoringService.dailySaleMonitoringAdmin(us_id, gr_ma_id, ma_id_list, skipCount, maxResultCount);
		if (!!result && result.items != undefined) {
			this.total = result.totalCount;
			this.dailySaleMonitoringResult = result.items[0];
		}
	}
	@action
	public machineOutOfStockQuery = async (gr_ma_id: number | undefined, ma_id_list: number[] | undefined, skipCount: number | undefined, maxResultCount: number | undefined,) => {
		this.listMachineOutOfStockQueryDto = [];
		let result = await this.dailyMonitoringService.machineOutOfStockQuery(gr_ma_id, ma_id_list, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined) {
			this.total = result.totalCount;
			this.listMachineOutOfStockQueryDto = result.items;
		}
	}
	@action
	public machineOutOfStockQueryAdmin = async (us_id: number[] | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined, skipCount: number | undefined, maxResultCount: number | undefined,) => {
		this.listMachineOutOfStockQueryDto = [];
		let result = await this.dailyMonitoringService.machineOutOfStockQueryAdmin(us_id, gr_ma_id, ma_id_list, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined) {
			this.total = result.totalCount;
			this.listMachineOutOfStockQueryDto = result.items;
		}
		
	}
	@action
	public replenishmentAdvice = async (body: SearchDailyMonitoringInput | undefined,) => {
		let result = await this.dailyMonitoringService.replenishmentAdvice(body);
		if (result != undefined && result.items != undefined) {
			this.listMachineDto = result.items;
		}

	}
	@action
	public statusMonitoring = async (ma_networkStatus: MachineNetworkStatus | undefined, ma_status: MachineStatus | undefined, fieldSort: string | undefined, sort: SORT | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined, skipCount: number | undefined, maxResultCount: number | undefined,) => {
		let result = await this.dailyMonitoringService.statusMonitoring(ma_networkStatus, ma_status, fieldSort, sort, gr_ma_id, ma_id_list, skipCount, maxResultCount);
		if (!!result) {
			this.total = result.totalCount;
			return Promise.resolve<MachineDtoListResultDto>(<any>result)
		}
		return Promise.resolve<MachineDtoListResultDto>(<any>null)
	}
	@action
	public statusMonitoringAdmin = async (us_id: number[] | undefined, ma_networkStatus: MachineNetworkStatus | undefined, ma_status: MachineStatus | undefined, fieldSort: string | undefined, sort: SORT | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined, skipCount: number | undefined, maxResultCount: number | undefined,) => {
		let result = await this.dailyMonitoringService.statusMonitoringAdmin(us_id, ma_networkStatus, ma_status, fieldSort, sort, gr_ma_id, ma_id_list, skipCount, maxResultCount);
		if (!!result) {
			this.total = result.totalCount;
			return Promise.resolve<MachineDtoListResultDto>(<any>result)
		}
		return Promise.resolve<MachineDtoListResultDto>(<any>null)
	}
}
export default DailyMonitorStore;