import { action, observable } from 'mobx';
import http from '@services/httpService';
import { CreateTenantDto, TenantDto, TenantDtoPagedResultDto, TenantService } from '@services/services_autogen';


class TenantStore {
	private tenantService: TenantService;

	@observable tenants: TenantDto[] = [];
	@observable tenantModel: TenantDto = new TenantDto();
	@observable totalCount: number = 0;
	constructor() {
		this.tenantService = new TenantService("", http);
	}
	@action
	public create = async (input: CreateTenantDto) => {
		if (input == undefined || input == null) {
			return Promise.resolve<TenantDto>(<any>null);
		}
		let result: TenantDto = await this.tenantService.create(input);
		if (!!result) {
			this.tenants.unshift(result);
			return Promise.resolve<TenantDto>(<any>result);
		}
		return Promise.resolve<TenantDto>(<any>null);
	}
	// @action
	// async createTenant() {
	// 	this.tenantModel =new TenantDto();
	// 	this.tenantModel.id=0;
	// 	this.tenantModel.isActive= true;
	// 	this.tenantModel.name= '';
	// 	this.tenantModel.tenancyName= '';
	// }

	// @action
	// async update(input: TenantDto | undefined) {
	// 	let result = await this.tenantService.update(input);

	// 	this.tenants.items = this.tenants!.items!.map((x: TenantDto) => {
	// 		if (x.id === input!.id) x = result;
	// 		return x;
	// 	});
	// }
	@action
	async update(input: TenantDto) {
		let result: TenantDto = await this.tenantService.update(input);
		if (!!result) {
			this.tenants = this.tenants.map((x: TenantDto) => {
				if (x.id === input.id) x = result;
				return x;
			});
			return Promise.resolve<TenantDto>(<any>result);
		}
		return Promise.resolve<TenantDto>(<any>null);
	}
	@action
	public delete = async (id: number) => {
		await this.tenantService.delete(id);
	}

	@action
	async get(id: number | undefined) {
		let result = await this.tenantService.get(id);
		this.tenantModel = result;
	}

	@action
	async getAll(keyword: string | undefined, isActive: boolean | undefined, skipCount: number | undefined, maxResultCount: number | undefined) {
		this.tenants = [];
		let result = await this.tenantService.getAll(keyword, isActive, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalCount = result.totalCount;
			for (let item of result.items) {
				this.tenants.push(item);
			}
		}
	}
}

export default TenantStore;
