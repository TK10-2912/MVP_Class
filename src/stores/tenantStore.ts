import { action, observable } from 'mobx';
import http from '@services/httpService';
import { CreateTenantDto, TenantDto, TenantDtoPagedResultDto, TenantService } from '@services/services_autogen';


class TenantStore {
	private tenantService:TenantService;

	@observable tenants!: TenantDtoPagedResultDto;
	@observable tenantModel: TenantDto = new TenantDto();
	constructor() {
		this.tenantService = new TenantService("",http);
	}
	@action
	async create(input: CreateTenantDto | undefined) {
		await this.tenantService.create(input);
	}

	@action
	async createTenant() {
		this.tenantModel =new TenantDto();
		this.tenantModel.id=0;
		this.tenantModel.isActive= true;
		this.tenantModel.name= '';
		this.tenantModel.tenancyName= '';
	}

	@action
	async update(input: TenantDto | undefined ) {
		let result = await this.tenantService.update(input);

		this.tenants.items = this.tenants!.items!.map((x: TenantDto) => {
			if (x.id === input!.id) x = result;
			return x;
		});
	}

	@action
	async delete(id: number | undefined) {
		await this.tenantService.delete(id);
		this.tenants.items = this.tenants.items!.filter((x: TenantDto) => x.id !== id);
	}

	@action
	async get(id: number | undefined) {
		let result = await this.tenantService.get(id);
		this.tenantModel = result;
	}

	@action
	async getAll(keyword: string | undefined, isActive: boolean | undefined, skipCount: number | undefined, maxResultCount: number | undefined) {
		let result = await this.tenantService.getAll(keyword, isActive, skipCount, maxResultCount);
		this.tenants = result;
	}
}

export default TenantStore;
