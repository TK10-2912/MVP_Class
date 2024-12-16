import { action, observable } from 'mobx';
import http from '@services/httpService';
import { ChangeUserOwnerInput, CreateMachineLocationLogInput, MachineDto, MachineLocationLogDto, MachineNetworkStatus, MachineService, SORT } from '@src/services/services_autogen';
import { UpdateMachineInput } from '@src/services/services_autogen';
import { DataNode } from 'antd/lib/tree';
import { stores } from './storeInitializer';

class MachineStore {
	private machineService: MachineService;
	@observable machineListResult: MachineDto[] = [];
	@observable machineLogLocationListResult: MachineLocationLogDto[] = [];
	@observable totalCount: number;
	@observable treeMachine: DataNode[] = [];
	@observable treeMachineHandover: DataNode[] = [];

	constructor() {
		this.machineService = new MachineService("", http);
	}

	@action
	public getAll = async (ma_id_list: number[] | undefined, gr_ma_id: number | undefined, machineNetworkStatus: MachineNetworkStatus | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.machineListResult = [];
		let result = await this.machineService.getAll(ma_id_list, gr_ma_id, machineNetworkStatus, fieldSort, sort, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalCount = result.totalCount;
			this.machineListResult = result.items;
			this.treeMachine = [];
			this.treeMachineHandover = [];
			const uniqueVersions = Array.from(new Set(this.machineListResult.map(item => item.ma_hardware_version_name)));
			const treeMachine: DataNode[] = uniqueVersions.map(version => {
				const machinesWithVersion = this.machineListResult.filter(item => item.ma_hardware_version_name === version);
				const children = machinesWithVersion.map(machine => ({
					title: machine.ma_code + "-" + machine.ma_display_name,
					key: machine.ma_id.toString()
				}));
				return {
					title: (machinesWithVersion[0].ma_hardware_version_code != undefined && machinesWithVersion[0].ma_hardware_version_code > 0) ? machinesWithVersion[0].ma_hardware_version_name : "Không có phiên bản",
					key: `version${version}`,
					children: children
				};
			});

			this.treeMachine = treeMachine;

		}
	}
	@action
	public getAllByAdmin = async (us_id: number[] | undefined, ma_id_list: number[] | undefined, gr_ma_id: number | undefined, machineNetworkStatus: MachineNetworkStatus | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.machineListResult = [];
		let result = await this.machineService.getAllByAdmin(us_id, ma_id_list, gr_ma_id, machineNetworkStatus, fieldSort, sort, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalCount = result.totalCount;
			this.machineListResult = result.items;
			const uniqueVersions = Array.from(new Set(this.machineListResult.map(item => item.ma_hardware_version_name)));
			const treeMachine: DataNode[] = uniqueVersions.map(version => {
				const machinesWithVersion = this.machineListResult.filter(item => item.ma_hardware_version_name === version);
				const children = machinesWithVersion.map(machine => ({
					title: machine.ma_code + "-" + machine.ma_display_name,
					key: machine.ma_id.toString()
				}));
				return {
					title: (machinesWithVersion[0].ma_hardware_version_code != undefined && machinesWithVersion[0].ma_hardware_version_code > 0) ? machinesWithVersion[0].ma_hardware_version_name : "Không có phiên bản",
					key: `version${version}`,
					children: children
				};
			});
			this.treeMachine = treeMachine;
			const gr_ma_tree = Array.from(new Set(this.machineListResult.map(item => item.gr_ma_id)));
			const treeMachineHandover: DataNode[] = gr_ma_tree.map(item => {
				const groupMachine = this.machineListResult.filter(i => i.gr_ma_id === item);
				const children = groupMachine.map(machine => ({
					title: machine.ma_code + "-" + machine.ma_display_name + "-" + stores.sessionStore.getUserNameById(machine.us_id_operator),
					key: machine.ma_id.toString()
				}));
				return {
					title: stores.sessionStore.getNameGroupMachines(groupMachine[0].gr_ma_id),
					key: `gr_id_${groupMachine}`,
					children: children
				};
			});

			this.treeMachineHandover = treeMachineHandover;
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
	public getAllLocationLogs = async (ma_id: number, ma_lo_log_mapName: string | undefined, ma_lo_log_from: Date | undefined, ma_lo_log_to: Date | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined,) => {
		this.machineLogLocationListResult = [];
		let result = await this.machineService.getAllLocationLogs(ma_id, ma_lo_log_mapName, ma_lo_log_from, ma_lo_log_to, fieldSort, sort, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined) {
			this.machineLogLocationListResult = result.items;
			this.totalCount = result.totalCount;
		}
	}
	@action
	public createMachineLocationLogs = async (item: CreateMachineLocationLogInput) => {
		let result = await this.machineService.createMachineLocationLog(item);
		if (!!result) {
			return Promise.resolve<MachineDto>(<any>result);
		} else {
			return Promise.resolve<MachineDto>(<any>null);
		}
	}

}
export default MachineStore;