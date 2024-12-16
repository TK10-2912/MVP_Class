import { action, observable } from 'mobx';
import http from '@services/httpService';
import { ChangePasswordDto, ChangeUserLanguageDto, CreateUserDto, UserDtoPagedResultDto, ResetPasswordDto, RoleDto, UpdateAvataInput, UpdatePassword2Input, UserDto, UserService, UpdateUserInput, Int64EntityDto } from '@services/services_autogen';


class UserStore {
	private userService: UserService;

	@observable users!: UserDto[];
	@observable totalUser: number = 0;
	@observable editUser!: UserDto;
	@observable roles: RoleDto[] = [];
	constructor() {
		this.userService = new UserService("", http);
	}

	@action
	async getAll(keyword: string | undefined, isActive: boolean | undefined, skipCount: number | undefined, maxResultCount: number | undefined) {
		let result: UserDtoPagedResultDto = await this.userService.getAll(keyword, isActive, skipCount, maxResultCount);
		this.users = [];
		this.totalUser = 0;
		if (result != undefined && result.items != undefined) {
			this.users = result.items;
			this.totalUser = result.totalCount!;
		}
		return this.users;
	}

	@action
	async create(input: CreateUserDto | undefined) {
		let result = await this.userService.create(input);
		this.users.push(result);
	}

	@action
	async update_Loi(input: UserDto | undefined) {
		let result = await this.userService.update(input);
		this.users = this.users.map((x: UserDto) => {
			if (x.id === input!.id) x = result;
			return x;
		});
	}
	@action
	async updateUser(input: UpdateUserInput | undefined) {
		let result = await this.userService.updateUser(input);
		this.editUser = result;
	}
	@action
	async deleteUser(id: number | undefined) {
		await this.userService.delete(id);
		this.users = this.users.filter((x: UserDto) => x.id !== id);
	}

	@action
	async getRoles() {
		let result = await this.userService.getRoles();
		this.roles = result.items!;
	}

	@action
	async getUserById(id: number | undefined) {
		let result = await this.userService.get(id);
		this.editUser = result;
	}

	async changeLanguage(input: ChangeUserLanguageDto | undefined) {
		await this.userService.changeLanguage(input);
	}

	@action
	async updateAvataUser(input: UpdateAvataInput) {
		this.editUser = await this.userService.updateAvataUser(input);
	}

	@action
	async changePassword(input: ChangePasswordDto) {
		await this.userService.changePassword(input);
	}

	@action
	async resetPassword(input: ResetPasswordDto | null | undefined) {
	  let resultReset =await this.userService.resetPassword(input!);
	  return resultReset.result
	}

	@action
	changePassword2 = async (input: UpdatePassword2Input | null | undefined) => {
		if (input == undefined || input.id == undefined) {
			return;
		}
		let result = await this.userService.changePassword2(input);
	}
	@action
	checkPassword2 = async (input: UpdatePassword2Input | null | undefined) => {
		if (input == undefined || input.id == undefined) {
			return false;
		}
		let result = await this.userService.checkPassword2(input);
		return result;
	}
	@action
	checkPasswordUser = async (input: UpdatePassword2Input | null | undefined) => {
		if (input == undefined || input.id == undefined) {
			return false;
		}
		let result = await this.userService.checkPasswordUser(input);
		return result;
	}
	@action
	activate = async (id: Int64EntityDto |undefined) => {
		if (id == undefined) {
			return false;
		}
		await this.userService.activate(id);
	}
	
	@action
	deActivate = async (id: Int64EntityDto |undefined) => {
		if (id == undefined) {
			return false;
		}
		await this.userService.deActivate(id);
	}
}

export default UserStore;
