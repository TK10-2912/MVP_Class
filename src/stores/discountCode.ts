import { action, observable } from 'mobx';
import http from '@services/httpService';
import { CreateDiscountCodeInput, DiscountCodeDto, DiscountCodeService, Int64EntityDto, SORT, UpdateDiscountCodeInput } from '@src/services/services_autogen';
class DiscountCodeStore {
	private discountCodeService: DiscountCodeService;
	@observable discountCodeListResult: DiscountCodeDto[] = [];
	@observable totalCount: number = 0;
	constructor() {
		this.discountCodeService = new DiscountCodeService("", http);
	}

	@action
	public getAll = async (di_code: string | undefined, di_quantity_max: number | undefined, di_start_at: Date | undefined, di_end_at: Date | undefined, di_price_down: number | undefined, di_price_up: number | undefined, ma_id: number | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined ) => {
		
			this.discountCodeListResult = [];
			let result = await this.discountCodeService.getAll(di_code, di_quantity_max, di_start_at, di_end_at, di_price_down, di_price_up, ma_id,fieldSort,sort, skipCount, maxResultCount);
			if (result != undefined && result.items != undefined) {
				this.discountCodeListResult = result.items;
				this.totalCount = result.totalCount;
			}
	}
	@action
	public getAllForAdmin = async (di_code: string | undefined, di_quantity_max: number | undefined, di_start_at: Date | undefined, di_end_at: Date | undefined, di_price_down: number | undefined, di_price_up: number | undefined, ma_id: number | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined ) => {
		
			this.discountCodeListResult = [];
			let result = await this.discountCodeService.getAllForAdmin(di_code, di_quantity_max, di_start_at, di_end_at, di_price_down, di_price_up, ma_id,fieldSort,sort, skipCount, maxResultCount);
			if (result != undefined && result.items != undefined) {
				this.discountCodeListResult = result.items;
				this.totalCount = result.totalCount;
			}
	}

	@action
	public createDiscountCode = async (item: CreateDiscountCodeInput) => {
		if (item == undefined || item == null) {
			return Promise.resolve<DiscountCodeDto>(<any>null);
		}
		let result = await this.discountCodeService.createDiscountCode(item);
		if (!!result) {
			this.discountCodeListResult.unshift(result);
			return Promise.resolve<DiscountCodeDto>(<any>result);
		}
		return Promise.resolve<DiscountCodeDto>(<any>null);
	}
	@action
	public createList = async (input : CreateDiscountCodeInput[] | undefined) => {
		this.discountCodeListResult = [];
		if(input != undefined)
		{
			await this.discountCodeService.createListDiscountCode(input);
		}
		return null;
	}

	@action
	public updateDiscount = async (item: UpdateDiscountCodeInput) => {

		let result = await this.discountCodeService.updateDiscountCode(item);
		if (!!result) {
			this.discountCodeListResult = this.discountCodeListResult.map((x: DiscountCodeDto) => {
				if (x.di_id === item.di_id) x = result;
				return x;
			});
			return Promise.resolve<DiscountCodeDto>(<any>result);
		}
		return Promise.resolve<DiscountCodeDto>(<any>null);
	}


	@action
	public delete = async (item: DiscountCodeDto) => {
		let data = await this.discountCodeService.delete(item.di_id);
		if (data.result == true) { return true; }
		else { return false; }
	}
	@action
	public deleteMulti = async (listNumber: number[]) => {
		let data = await this.discountCodeService.deleteMulti(listNumber);
		if (data.result == true) { return true; }
		else { return false; }
	}
	@action
	public deleteAll = async () => {
		let data = await this.discountCodeService.deleteAll();
		if (data== true) { return true; }
		else { return false; }
	}
	//chỉ kích hoạt khi có ngày bắt đầu và kết thúc
	@action
	activate = async (id: Int64EntityDto | undefined) => {
		if (id == undefined) {
			return false;
		}
		await this.discountCodeService.activate(id);
		this.discountCodeListResult = this.discountCodeListResult.map((x: DiscountCodeDto) => {
			if (x.di_id === id.id) x.di_active = true;
			return x;
		});
	}

	@action
	deActivate = async (id: Int64EntityDto | undefined) => {
		if (id == undefined) {
			return false;
		}
		await this.discountCodeService.deActivate(id);
		this.discountCodeListResult = this.discountCodeListResult.map((x: DiscountCodeDto) => {
			if (x.di_id === id.id) x.di_active = false;
			return x;
		});
	}
}

export default DiscountCodeStore;