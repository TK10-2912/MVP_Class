import { action, observable } from 'mobx';
import http from '@services/httpService';
import { DailyMonitoringService, MachineOutOfStockQueryDto, MachineDto, ProductDailyMonitoringDto, SORT, Machine, MachineNetworkStatus, MachineStatus } from '@services/services_autogen';
export class DailyMonitorStore {
	private dailyMonitoringService: DailyMonitoringService;
	@observable listProductDailyMonitoringDto: ProductDailyMonitoringDto[] = [];
	@observable listMachineDto: MachineDto[] = [];
	@observable listMachineOutOfStockQueryDto: MachineOutOfStockQueryDto[] = [];
	@observable totalListMachineOutOfStockQueryDto: number = 0;
	@observable totalListProductDailyMonitoringDto: number = 0;
	@observable totalListMachineDto: number = 0;

	constructor() {
		this.dailyMonitoringService = new DailyMonitoringService("", http);
	}



	@action
	public dailySaleMonitoring = async (ma_id: number | undefined, listIdMachineDetail: number[] | undefined) => {
		let result = await this.dailyMonitoringService.getAllMachineDetailOfListID(ma_id, listIdMachineDetail);
		if (!!result && result.items != undefined) {
			this.totalListProductDailyMonitoringDto = result.totalCount;
			this.listProductDailyMonitoringDto = result.items;
		}
	}
	@action
	public machineOutOfStockQuery = async (gr_ma_id: number | undefined, ma_id_list: number[] | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		let result = await this.dailyMonitoringService.machineOutOfStockQuery(gr_ma_id, ma_id_list, fieldSort, sort, skipCount, maxResultCount);
		if (!!result && result.items != undefined) {
			this.totalListMachineOutOfStockQueryDto = result.totalCount;
			this.listMachineOutOfStockQueryDto = result.items;
		}
	}
	@action
	public machineOutOfStockQueryAdmin = async (gus_id: number[] | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		let result = await this.dailyMonitoringService.machineOutOfStockQueryAdmin(gus_id, gr_ma_id, ma_id_list, fieldSort, sort, skipCount, maxResultCount);
		if (!!result && result.items != undefined) {
			this.listMachineOutOfStockQueryDto = result.items;
			this.totalListMachineOutOfStockQueryDto = result.totalCount;
		}
	}
	@action
	public onQueryMachineOutOfStockQuery = async (body: Machine[] | undefined) => {
		let result = await this.dailyMonitoringService.onQueryMachineOutOfStockQuery(body);
		if (!!result && result.items != undefined) {
			this.listMachineOutOfStockQueryDto = result.items;
			this.totalListMachineOutOfStockQueryDto = result.totalCount;
		}
	}
	@action
	public onQueryStatusMonitoring = async (body: Machine[] | undefined) => {
		let result = await this.dailyMonitoringService.onQueryStatusMonitoring(body);
		if (!!result && result.items != undefined) {
			this.listMachineDto = result.items;
			this.totalListMachineDto = result.totalCount;
		}
	}
	@action
	public statusMonitoringAdmin = async (us_id: number[] | undefined, ma_networkStatus: MachineNetworkStatus | undefined, ma_status: MachineStatus | undefined, fieldSort: string | undefined, sort: SORT | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		let result = await this.dailyMonitoringService.statusMonitoringAdmin(us_id, ma_networkStatus, ma_status, fieldSort, sort, gr_ma_id, ma_id_list, skipCount, maxResultCount);
		if (!!result && result.items != undefined) {
			this.listMachineDto = result.items;
			this.totalListMachineDto = result.totalCount;
		}
	}
	action
	public statusMonitoring = async ( ma_networkStatus: MachineNetworkStatus | undefined, ma_status: MachineStatus | undefined, fieldSort: string | undefined, sort: SORT | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		let result = await this.dailyMonitoringService.statusMonitoring(ma_networkStatus, ma_status, fieldSort, sort, gr_ma_id, ma_id_list, skipCount, maxResultCount);
		if (!!result && result.items != undefined) {
			this.listMachineDto = result.items;
			this.totalListMachineDto = result.totalCount;
		}
	}
}
export default DailyMonitorStore;