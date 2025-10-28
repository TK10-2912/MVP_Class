import { action, observable } from 'mobx';
import http from '@services/httpService';
import { DashboardCombinationDto, DashboardDto, DashboardService, ItemChartDashBoardCombination } from '@services/services_autogen';
export class DashboardStore {

	private dashboardService: DashboardService;
	@observable dashbroadListResult: DashboardCombinationDto;
	@observable dashbroad1: DashboardDto;
	@observable total_money: number
	@observable totalBilling: number
	@observable totalRefund: number

	constructor() {
		this.dashboardService = new DashboardService("", http);
	}

	@action
	public getAll = async () => {
		let result = await this.dashboardService.getDashboard();
		if (result != undefined) {
			this.dashbroad1 = result;
			return Promise.resolve<DashboardDto>(<any>result);
		}
		return Promise.resolve<DashboardDto>(<any>null);
	}
	@action
	public getAllDashboardChartProductMoneyAndQuantity = async (kindOfDay: number | undefined, numberOfMachine: number | undefined) => {

		let result = await this.dashboardService.getDashboardChartProductMoneyAndQuantity(kindOfDay, numberOfMachine);
		this.dashbroadListResult = result;
		if (!!result.topProductOfMoneyAndQuantity?.length) {
			this.total_money = 0;
			this.totalBilling = 0;
			this.totalRefund = 0;
			result.topProductOfMoneyAndQuantity.map(value => { this.total_money += value.valueColumn1; this.totalBilling += value.valueColumn2; this.totalRefund += value.valueColumn3 });
		}
		if (result != undefined) {
			return Promise.resolve<DashboardCombinationDto>(<any>result);
		}
		return Promise.resolve<DashboardCombinationDto>(<any>null);
	}
}

export default DashboardStore;