import { RechargeMoneyInput } from './../services/services_autogen';
import { action, observable } from 'mobx';
import http from '@services/httpService';
import { ChangeMoneyRfidInput, CreateRfidInput, RfidDto, RfidService, SORT, UpdateStatusRfidInput } from '@src/services/services_autogen';
export class RFIDStore {
	private RfidService: RfidService;

	@observable totalRFID: number = 0;
	@observable RFIDListResult: RfidDto[] = [];

	constructor() {
		this.RfidService = new RfidService("", http);
	}


	@action
	public create = async (input: CreateRfidInput) => {
		if (input == undefined || input == null) {
			return Promise.resolve<RfidDto>(<any>null);
		}
		let result: RfidDto = await this.RfidService.create(input);
		if (!!result) {
			this.RFIDListResult.push(result);
			return Promise.resolve<RfidDto>(<any>result);
		}
		return Promise.resolve<RfidDto>(<any>null);
	}


	@action
	public delete = async (item: RfidDto) => {
		if (!item || !item.rf_id) {
			return false;
		}
		let result = await this.RfidService.delete(item.rf_id);
		if (!!result) {
			let indexDelete = this.RFIDListResult.findIndex(a => a.rf_id == item.rf_id);
			if (indexDelete >= 0) {
				this.RFIDListResult.splice(indexDelete, 1);
			}
			return true;
		}
		return false;
	}
	@action
	public changeMoney = async (body: ChangeMoneyRfidInput | undefined,) => {
		if (!body || !body.rf_id) {
			return Promise.resolve<RfidDto>(<any>null);
		}
		let result = await this.RfidService.changeMoney(body);
		if (!!result) {
			this.RFIDListResult = this.RFIDListResult.map((x: RfidDto) => {
				if (x.rf_id === body.rf_id) x = result;
				return x;
			});
			return Promise.resolve<RfidDto>(<any>result);
		}
		return Promise.resolve<RfidDto>(<any>null);
	}
	@action
	public changeStatus = async (body: UpdateStatusRfidInput | undefined,) => {
		if (!body || !body.rf_id) {
			return Promise.resolve<RfidDto>(<any>null);
		}
		let result = await this.RfidService.changeStatus(body);
		if (!!result) {
			this.RFIDListResult = this.RFIDListResult.map((x: RfidDto) => {
				if (x.rf_id === body.rf_id) x = result;
				return x;
			});
			return Promise.resolve<RfidDto>(<any>result);
		}
		return Promise.resolve<RfidDto>(<any>null);
	}


	@action
	public getAll = async (rf_code: string | undefined, rf_is_active: boolean | undefined, rf_created_at: Date | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined,) => {
		this.RFIDListResult = [];
		let result = await this.RfidService.getAll(rf_code, rf_is_active, rf_created_at, fieldSort, sort, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.RFIDListResult = [];
			this.totalRFID = result.totalCount;
			this.RFIDListResult = result.items!;
		}
	}
	@action
	public createList = async (input: CreateRfidInput[] | undefined) => {
		this.RFIDListResult = [];
		if (input != undefined) {
			await this.RfidService.createList(input);
		}
		return null;
	}
	@action
	public getAllByAdmin = async (us_id: number[] | undefined, rf_code: string | undefined, rf_is_active: boolean | undefined, rf_created_at: Date | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.RFIDListResult = [];
		let result = await this.RfidService.getAllForAdmin(us_id, rf_code, rf_is_active, rf_created_at, fieldSort, sort, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.RFIDListResult = [];
			this.totalRFID = result.totalCount;
			this.RFIDListResult = result.items!;
		}
	}
	@action
	async deleteMulti(number: number[]) {
		let result = await this.RfidService.deleteMulti(number);
		if (result.result == true) {
			return true;
		}
		return false;
	}
	@action
	async deleteAllForAdmin() {
		await this.RfidService.deleteAllForAdmin();
	}
	@action
	async deleteAllForUser() {
		await this.RfidService.deleteAllForUser();
	}
	// @action
	// async CreateQRCodeForReChargeRfidMoney(body: RechargeMoneyInput | undefined) {
	// 	if (body != undefined) {
	// 		let result = await this.RfidService.createQrCodeForReChargeRfidMoney(body);
	// 		if (!!result) {
	// 			return result;
	// 		}
	// 	}
	// 	return "";
	// }
	// @action
	// async CheckoutQRPayment(rfcode: string | undefined, macAddress: string | undefined) {
	// 	if (rfcode != undefined && macAddress != undefined) {
	// 		let result = await this.RfidService.checkoutQRPayment(rfcode, macAddress);
	// 		if (!!result) {
	// 			return result;
	// 		}
	// 	}
	// 	return "";
	// }
}

export default RFIDStore;