import { action, observable } from 'mobx';
import http from '@services/httpService';
import { AuthorizationMachineDto, AuthorizationMachineService, ChangeUserOwnerInput, CreateAuthorizationMachineInput, MachineDto, SORT, UpdateAuthorizationMachineInput } from '@src/services/services_autogen';
import { UpdateMachineInput } from '@src/services/services_autogen';
import { DataNode } from 'antd/lib/tree';

class AuthorizationMachineStore {
	private authorizationMachineService: AuthorizationMachineService;
	@observable authorizationMachineListResult: AuthorizationMachineDto[] = [];
	@observable totalCount: number;
	constructor() {
		this.authorizationMachineService = new AuthorizationMachineService("", http);
	}
	@action
	public getAll = async (ma_id_list: number[] | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.authorizationMachineListResult = [];
		let result = await this.authorizationMachineService.getAll(ma_id_list, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalCount = result.totalCount;
			this.authorizationMachineListResult = result.items;
		}
	}
	@action
	public getAllByAdmin = async (us_id_list: number[] | undefined, ma_id_list: number[] | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.authorizationMachineListResult = [];
		let result = await this.authorizationMachineService.getAllByAdmin(us_id_list, ma_id_list, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalCount = result.totalCount;
			this.authorizationMachineListResult = result.items;
		}
	}

	@action
	public updateAuthorizationMachine = async (item: UpdateAuthorizationMachineInput) => {

		let result = await this.authorizationMachineService.updateAuthorizationMachine(item);
		if (!!result) {
			this.authorizationMachineListResult = this.authorizationMachineListResult.map((x: AuthorizationMachineDto) => {
				if (x.au_ma_id === item?.au_ma_id) x = result;
				return x;
			});
			return Promise.resolve<AuthorizationMachineDto>(<any>result);
		}
		return Promise.resolve<AuthorizationMachineDto>(<any>null);
	}
	@action
	public createAuthorizationMachine = async (input: CreateAuthorizationMachineInput) => {
		if (input == undefined || input == null) {
			return Promise.resolve<AuthorizationMachineDto>(<any>null);
		}
		let result: AuthorizationMachineDto = await this.authorizationMachineService.createAuthorizationMachine(input);
		if (!!result) {
			this.authorizationMachineListResult.unshift(result);
			return Promise.resolve<AuthorizationMachineDto>(<any>result);
		}
		return Promise.resolve<AuthorizationMachineDto>(<any>null);
	}
	@action
	public delete = async (au_ma_id: number) => {
		let data = await this.authorizationMachineService.delete(au_ma_id);
		if (data == true) { return true; }
		else { return false; }
	}
}
export default AuthorizationMachineStore;