import { action, observable } from 'mobx';
import http from '@services/httpService';
import { ChangeUserOwnerInput, MachineDto, MachineService, SORT } from '@src/services/services_autogen';
import { UpdateMachineInput } from '@src/services/services_autogen';
import { DataNode } from 'antd/lib/tree';

class MachineStore {
	private machineService: MachineService;
	@observable machineListResult: MachineDto[] = [];
	@observable totalCount: number;
	@observable treeMachine: DataNode[] = [];

	constructor() {
		this.machineService = new MachineService("", http);
	}

	//lay danh sach machine
	@action
	public getAll = async (ma_search: string | undefined, gr_ma_id: number | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.machineListResult = [];
		let result = await this.machineService.getAll(ma_search, gr_ma_id, fieldSort, sort, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalCount = result.totalCount;
			this.machineListResult = result.items;
			this.treeMachine = [];
			const uniqueVersions = Array.from(new Set(this.machineListResult.map(item => item.ma_hardware_version_name)));
			const treeMachine: DataNode[] = uniqueVersions.map(version => {
				const machinesWithVersion = this.machineListResult.filter(item => item.ma_hardware_version_name === version);
				const children = machinesWithVersion.map(machine => ({
					title: machine.ma_display_name + "-" + machine.ma_code,
					key: machine.ma_id.toString()
				}));
				return {
					title: machinesWithVersion[0].ma_hardware_version_name,
					key: `version${version}`,
					children: children
				};
			});

			this.treeMachine = treeMachine;
		}
	}
	@action
	public getAllByAdmin = async (us_id: number[] | undefined, ma_search: string | undefined, gr_ma_id: number | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.machineListResult = [];
		let result = await this.machineService.getAllByAdmin(us_id, ma_search, gr_ma_id, fieldSort, sort, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalCount = result.totalCount;
			this.machineListResult = result.items;
			const uniqueVersions = Array.from(new Set(this.machineListResult.map(item => item.ma_hardware_version_name)));
			const treeMachine: DataNode[] = uniqueVersions.map(version => {
				const machinesWithVersion = this.machineListResult.filter(item => item.ma_hardware_version_name === version);
				const children = machinesWithVersion.map(machine => ({
					title: machine.ma_display_name + "-" + machine.ma_code,
					key: machine.ma_id.toString()
				}));
				return {
					title: machinesWithVersion[0].ma_hardware_version_name,
					key: `version${version}`,
					children: children
				};
			});

			this.treeMachine = treeMachine;
		}
	}

	// cap nhat machine
	@action
	public updateMachine = async (item: UpdateMachineInput) => {

		let result = await this.machineService.updateMachine(item);
		if (!!result) {
			this.machineListResult = this.machineListResult.map((x: MachineDto) => {
				if (x.ma_id === item.ma_id) x = result;
				return x;
			});
			return Promise.resolve<MachineDto>(<any>result);
		}
		return Promise.resolve<MachineDto>(<any>null);
	}

	// delete machine
	@action
	public delete = async (item: MachineDto) => {
		let data = await this.machineService.delete(item.ma_id);
		if (data.result == true) { return true; }
		else { return false; }
	}
	@action
	public deleteMulti = async (listNumber: number[]) => {
		let data = await this.machineService.deleteMulti(listNumber);
		if (data.result == true) { return true; }
		else { return false; }
	}
	@action
	public deleteAll = async () => {
		let data = await this.machineService.deleteAll();
		if (data == true) { return true; }
		else { return false; }
	}
	@action
	public changeUserOwner = async (input: ChangeUserOwnerInput) => {
		if (!input || !input.ma_id || !input.us_id_owner) {
			return false;
		}
		let result = await this.machineService.changeUserOwer(input);
		if (!!result) {
			this.machineListResult = this.machineListResult.map((x: MachineDto) => {
				if (x.ma_id === input.ma_id) x = result;
				return x;
			});
			return Promise.resolve<MachineDto>(<any>result);
		}
		return Promise.resolve<MachineDto>(<any>null);
	}
	


}
export default MachineStore;