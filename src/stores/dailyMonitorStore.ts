import { action, observable } from 'mobx';
import http from '@services/httpService';
import { DailyMonitoringService, SearchDailyMonitoringInput, DailySaleMonitoringDto, MachineDtoListResultDto, MachineOutOfStockQueryDtoListResultDto, Machine, SearchDailyMonitoringAdminInput, MachineOutOfStockQueryDto, MachineDto, SearchStatusMonitorInput, SearchStatusMonitorAdminInput, } from '@services/services_autogen';
export class DailyMonitorStore {
	private dailyMonitoringService: DailyMonitoringService;

	@observable listMachineOutOfStockQueryDto: MachineOutOfStockQueryDto[] = [];
	@observable listMachineDto: MachineDto[] = [];
	constructor() {
		this.dailyMonitoringService = new DailyMonitoringService("", http);
	}


	
	@action
	public dailySaleMonitoring = async (body: SearchDailyMonitoringInput | undefined,) => {
		let result = await this.dailyMonitoringService.dailySaleMonitoring(body);
		if (!!result) {
			return Promise.resolve<DailySaleMonitoringDto>(<any>result)
		}
		return Promise.resolve<DailySaleMonitoringDto>(<any>null)
	}
	@action
	public dailySaleMonitoringAdmin = async (body: SearchDailyMonitoringAdminInput | undefined,) => {
		let result = await this.dailyMonitoringService.dailySaleMonitoringAdmin(body);
		if (!!result) {
			return Promise.resolve<DailySaleMonitoringDto>(<any>result)
		}
		return Promise.resolve<DailySaleMonitoringDto>(<any>null)
	}
	@action
	public machineOutOfStockQuery = async (body: SearchDailyMonitoringInput | undefined,) => {
		let result = await this.dailyMonitoringService.machineOutOfStockQuery(body);
		if (!!result) {
			return Promise.resolve<MachineOutOfStockQueryDtoListResultDto>(<any>result)
		}
		return Promise.resolve<MachineOutOfStockQueryDtoListResultDto>(<any>null)
	}
	@action
	public machineOutOfStockQueryAdmin = async (body:  SearchDailyMonitoringAdminInput | undefined,) => {
		let result = await this.dailyMonitoringService.machineOutOfStockQueryAdmin(body);
		if (!!result) {
			return Promise.resolve<MachineOutOfStockQueryDtoListResultDto>(<any>result)
		}
		return Promise.resolve<MachineOutOfStockQueryDtoListResultDto>(<any>null)
	}
	@action
	public replenishmentAdvice = async (body: SearchDailyMonitoringInput | undefined,) => {
		let result = await this.dailyMonitoringService.replenishmentAdvice(body);
		if (result != undefined && result.items !=undefined ) {
			this.listMachineDto = result.items;
		}
		
	}
	@action
	public statusMonitoring = async (body: SearchStatusMonitorInput | undefined,) => {
		let result = await this.dailyMonitoringService.statusMonitoring(body);
		if (!!result) {
			return Promise.resolve<MachineDtoListResultDto>(<any>result)
		}
		return Promise.resolve<MachineDtoListResultDto>(<any>null)
	}
	@action
	public statusMonitoringAdmin = async (body: SearchStatusMonitorAdminInput | undefined,) => {
		let result = await this.dailyMonitoringService.statusMonitoringAdmin(body);
		if (!!result) {
			return Promise.resolve<MachineDtoListResultDto>(<any>result)
		}
		return Promise.resolve<MachineDtoListResultDto>(<any>null)
	}
}
export default DailyMonitorStore;