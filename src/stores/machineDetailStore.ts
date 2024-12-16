import { action, observable } from 'mobx';
import http from '@services/httpService';
import {MachineDetailDto, MachineDetailDtoListResultDto, MachineDetailService, UpdateListMachineDetailInput, UpdateMachineDetailInput} from '@src/services/services_autogen';
class MachineDetailStore {
	private machineDetailService: MachineDetailService;
	@observable machineDetailListResult: MachineDetailDto[] = [];
	@observable beforeUpdateMachineDetail: MachineDetailDtoListResultDto;
	@observable listDisplayDrink: MachineDetailDto[][] = [];
	@observable listDisplayFreshDrink: MachineDetailDto[][] = Array.from({ length: 1 }, () => new Array(0).fill(new MachineDetailDto()));
	constructor() {
		this.machineDetailService = new MachineDetailService("", http);
	}

	@action
	public getAll = async (ma_id: number | undefined) => {
		this.machineDetailListResult = [];
		let result = await this.machineDetailService.getAll(ma_id);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.machineDetailListResult = result.items;
		}
	}

	@action
	public updateMachineDetail = async (item: UpdateMachineDetailInput) => {

		let result = await this.machineDetailService.updateMachineDetail(item);
		if (!!result) {
			return Promise.resolve<MachineDetailDto>(<any>result);
		}
		return Promise.resolve<MachineDetailDto>(<any>null);
	}
	@action
	public updateListMachineDetail = async (input: UpdateListMachineDetailInput) => {
		this.machineDetailListResult = [];
		if (input != undefined && input.ma_id != undefined) {
			let result = await this.machineDetailService.updateListMachineDetail(input);
			if (!!result) {
				return result
			}
		}
	}
}
export default MachineDetailStore;