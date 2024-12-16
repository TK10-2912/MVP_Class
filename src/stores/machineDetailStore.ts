import { action, observable } from 'mobx';
import http from '@services/httpService';
import { ImportMachineDetailInput, MachineDetailDto, MachineDetailDtoListResultDto, MachineDetailService, UpdateMachineDetailInput, } from '@src/services/services_autogen';
class MachineDetailStore {
	private machineDetailService: MachineDetailService;
	@observable machineDetailListResult: MachineDetailDto[] = [];
	@observable beforeUpdateMachineDetail: MachineDetailDtoListResultDto;
	@observable listDisplayDrink: MachineDetailDto[][] = [];
	@observable listDisplayFreshDrink: MachineDetailDto[][] = Array.from({ length: 1 }, () => new Array(0).fill(new MachineDetailDto()));
	constructor() {
		this.machineDetailService = new MachineDetailService("", http);
	}

	//lay danh sach machine detail
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
	public updateListMachineDetail = async (id: number | undefined, input: ImportMachineDetailInput[] | undefined) => {
		this.machineDetailListResult = [];
		if (input != undefined && id != undefined) {
			await this.machineDetailService.updateListMachineDetail(id, input);
			
		}
		return null;
	}
	@action
	public viewBeforeUpdateMachineDetail = async (id: number | undefined, input: ImportMachineDetailInput[] | undefined) => {
		if (input != undefined && id != undefined) {
			await this.machineDetailService.viewBeforeUpdateMachineDetail(id, input);
			this.beforeUpdateMachineDetail = await this.machineDetailService.viewBeforeUpdateMachineDetail(id, input);			
		}
		return null;
	}
}
export default MachineDetailStore;