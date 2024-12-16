import http from '@services/httpService';
import { CreateRoleInput, GetRoleForEditOutput, PermissionDto, RoleDto, RoleDtoPagedResultDto, RoleService } from '@services/services_autogen';
import { action, observable } from 'mobx';

class RoleStore {
	private roleService:RoleService;

	@observable roles!: RoleDtoPagedResultDto;
	@observable roleEdit: GetRoleForEditOutput = new GetRoleForEditOutput();
	@observable allPermissions: PermissionDto[] = [];
	constructor() {
		this.roleService = new RoleService("",http);
	}
	@action
	async create(input: CreateRoleInput| undefined) {
		await this.roleService.create(input);
	}
	@action
	async getRolesAsync(permission: string | undefined) {
		await this.roleService.getRoles(permission);
	}

	@action
	async update(body: RoleDto | undefined) {
		await this.roleService.update(body);
		this.roles.items!
			.filter((x: RoleDto) => x.id === body!.id)
			.map((x: RoleDto) => {
				return (x = body!);
			});
	}

	@action
	async delete(id: number | undefined) {
		await this.roleService.delete(id);
		this.roles.items = this.roles.items!.filter((x: RoleDto) => x.id !== id);
	}

	@action
	async getAllPermissions() {
		var result = await this.roleService.getAllPermissions();
		this.allPermissions = result.items!;
	}

	@action
	async getRoleForEdit(id: number | undefined) {
		if (id === undefined) {
			this.roleEdit = new GetRoleForEditOutput();
		} else {
			let result = await this.roleService.getRoleForEdit(id);
			this.roleEdit = result;
		}
	}

	// @action
	// async get(id: number | undefined) {
	// 	var result = await this.roleService.get(id);
	// 	//this.roles = result.data.result;
	// }

	@action
	async getAll(keyword: string | undefined, skipCount: number | undefined, maxResultCount: number | undefined ) {
		let result = await this.roleService.getAll(keyword,skipCount,maxResultCount);
		this.roles = result;
	}
}

export default RoleStore;
