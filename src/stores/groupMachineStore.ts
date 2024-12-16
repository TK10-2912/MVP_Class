import { action, observable } from 'mobx';
import http from '@services/httpService';
import { CreateGroupMachineInput, GroupMachineDto, GroupMachineService, UpdateGroupMachineInput, } from '@src/services/services_autogen';
import { DataNode } from 'antd/lib/tree';
class GroupMachineStore {
	private groupMachineService: GroupMachineService;
	@observable groupMachineListResult: GroupMachineDto[] = [];
	@observable treeGroupMachineAdmin: DataNode[] = [];
	@observable treeGroupMachineUser: DataNode[] = [];
	@observable totalMachine: number;
	constructor() {
		this.groupMachineService = new GroupMachineService("", http);
	}

	//lay danh sach machine
	@action
	public getAll = async (gr_ma_search: string | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.groupMachineListResult = [];
		let result = await this.groupMachineService.getAll(gr_ma_search, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalMachine = result.totalCount;
			this.groupMachineListResult = result.items;
			this.treeGroupMachineUser = [];
			this.groupMachineListResult.map((item, index) => {
				let treeGroupMachineUser: DataNode = { title: item.gr_ma_area, key: "group_" + index, children: [] };
				if (item.machines != undefined && item.machines.length > 0) {
					item.machines.map(itemChild => {
						let treeMachine: DataNode = { title: itemChild.ma_display_name, key: itemChild.ma_id, children: undefined };
						treeGroupMachineUser.children?.push(treeMachine);
					})
				}
				this.treeGroupMachineUser.push(treeGroupMachineUser);
			})
		}
	}
	@action
	public getAllByAdmin = async (gr_ma_search: string | undefined, us_id: number[] | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.groupMachineListResult = [];
		let result = await this.groupMachineService.getAllByAdmin(gr_ma_search, us_id, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalMachine = result.totalCount;
			this.groupMachineListResult = result.items;
			this.treeGroupMachineAdmin = [];
			this.groupMachineListResult.map((item, index) => {
				let treeGroupMachineAdmin: DataNode = { title: item.gr_ma_area, key: "group_" + index, children: [] };
				if (item.machines != undefined && item.machines.length > 0) {
					item.machines.map(itemChild => {
						let treeMachine: DataNode = { title: itemChild.ma_display_name, key: itemChild.ma_id, children: undefined };
						treeGroupMachineAdmin.children?.push(treeMachine);
					})
				}
				this.treeGroupMachineAdmin.push(treeGroupMachineAdmin);
			})
		}
	}
	// tao moi machine
	@action
	public createGroupMachine = async (item: CreateGroupMachineInput) => {
		if (item == undefined || item == null) {
			return Promise.resolve<GroupMachineDto>(<any>null);
		}
		let result = await this.groupMachineService.createGroupMachine(item);
		if (!!result) {
			this.groupMachineListResult.unshift(result);
			return Promise.resolve<GroupMachineDto>(<any>result);
		}
		return Promise.resolve<GroupMachineDto>(<any>null);
	}

	// cap nhat machine
	@action
	public updateGroupMachine = async (item: UpdateGroupMachineInput) => {

		let result = await this.groupMachineService.updateGroupMachine(item);
		if (!!result) {
			this.groupMachineListResult = this.groupMachineListResult.map((x: GroupMachineDto) => {
				if (x.gr_ma_id === item.gr_ma_id) x = result;
				return x;
			});
			return Promise.resolve<GroupMachineDto>(<any>result);
		}
		return Promise.resolve<GroupMachineDto>(<any>null);
	}

	// delete machine
	@action
	public delete = async (item: GroupMachineDto) => {
		let data = await this.groupMachineService.delete(item.gr_ma_id);
		if (data.result == true) { return true; }
		else { return false; }
	}

}
export default GroupMachineStore;