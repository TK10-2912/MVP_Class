import { action, observable } from 'mobx';
import http from '@services/httpService';
import { ChangeReasonAndStatusReconcileInput, EReconcileStatus, EReconcileType, ERefundReasonType, ReconcileBankDto, ReconcileBankInput, ReconcileCashDto, ReconcileCashInput, ReconcileDto, ReconcileRFIDDto, ReconcileRFIDInput, ReconcileService, ReconcileSupplierDebtDto, ReconcileSupplierDebtInput, RefundDto, SORT, UpdateRefundInput } from '@src/services/services_autogen';

export class ReconcileStore {
	private reconcileService: ReconcileService;

	@observable total: number = 0;
	@observable totalReconcileDebt: number = 0;
	@observable totalReconcileDebtHistory: number = 0;
	@observable reconcileBankDto: ReconcileBankDto[] = [];
	@observable reconcileRFIDListDto: ReconcileRFIDDto[] = [];
	@observable reconcileCashListDto: ReconcileCashDto[] = [];
	@observable reconcileDebtSupplierDto: ReconcileSupplierDebtDto[] = [];
	@observable reconcileDebtSupplierHistoryDto: ReconcileSupplierDebtDto[] = [];
	@observable su_id_list: number[] = [];


	constructor() {
		this.reconcileService = new ReconcileService("", http);
	}


	@action
	public getAllBankReconcileByAdmin = async (us_id_list: number[] | undefined,rec_month: string | undefined,  start_date: Date | undefined, end_date: Date | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined, rec_status: EReconcileStatus | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.reconcileBankDto = [];
		this.total = 0;
		let result = await this.reconcileService.getAllBankReconcileByAdmin(us_id_list,rec_month, start_date, end_date, gr_ma_id, ma_id_list, rec_status, fieldSort, sort, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.total = result.totalCount;
			this.reconcileBankDto = result.items;
		}
	}
	@action
	public getAllReconcileCash = async (gr_ma_id: number | undefined, ma_id_list: number[] | undefined, rec_month: string | undefined, rec_status: EReconcileStatus | undefined, us_is_list: number[] | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined,) => {
		this.reconcileCashListDto = [];
		this.total = 0;
		let result = await this.reconcileService.getAllReconcileCash(gr_ma_id, ma_id_list, rec_month, rec_status, us_is_list, fieldSort, skipCount, sort, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.reconcileCashListDto = result.items;
			this.total = result.totalCount;
		}
	}
	@action
	public getAllReconcileCashByAdmin = async (gr_ma_id: number | undefined, ma_id_list: number[] | undefined, rec_month: string | undefined, rec_status: EReconcileStatus | undefined, us_is_list: number[] | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined,) => {
		this.reconcileCashListDto = [];
		this.total = 0;
		let result = await this.reconcileService.getAllReconcileCashByAdmin(gr_ma_id, ma_id_list, rec_month, rec_status, us_is_list, fieldSort, sort, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.reconcileCashListDto = result.items;
			this.total = result.totalCount;
		}
	}
	@action
	public getAllRFIDReconcile = async (start_date: Date | undefined, end_date: Date | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined, rec_status: EReconcileStatus | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.reconcileRFIDListDto = [];
		this.total = 0;
		let result = await this.reconcileService.getAllRFIDReconcile(start_date, end_date, gr_ma_id, ma_id_list, rec_status, fieldSort, sort, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			// this.reconcileRFIDListDto = result.items;
			this.total = result.totalCount;
		}
	}
	@action
	public getAllRFIDReconcileByAdmin = async (us_id_list: number[] | undefined, rec_month: string | undefined, start_date: Date | undefined, end_date: Date | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined, rec_status: EReconcileStatus | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.reconcileRFIDListDto = [];
		this.total = 0;
		let result = await this.reconcileService.getAllRFIDReconcileByAdmin(us_id_list,rec_month, start_date, end_date, gr_ma_id, ma_id_list, rec_status, fieldSort, sort, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.reconcileRFIDListDto = result.items;
			this.total = result.totalCount;
		}
	}
	@action
	public getAllSupplierDebtReconcile = async (su_id_list: number[] | undefined, rec_month: string | undefined, rec_status: EReconcileStatus | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.reconcileDebtSupplierDto = [];
		this.reconcileDebtSupplierHistoryDto = [];
		this.total = 0;
		let result = await this.reconcileService.getAllSupplierDebtReconcile(su_id_list, rec_month, rec_status, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.su_id_list= result.items.map(item=> item.su_id);
			this.reconcileDebtSupplierHistoryDto = result.items.filter(item => item.rec_is_deleted == true);
			this.reconcileDebtSupplierDto = result.items.filter(item => item.rec_is_deleted == false);
			this.totalReconcileDebt = this.reconcileDebtSupplierDto.length;
			this.totalReconcileDebtHistory = this.reconcileDebtSupplierHistoryDto.length;
		}
	}
	@action
	public reconcileSupplierDebt = async (body: ReconcileSupplierDebtInput | undefined) => {
		await this.reconcileService.reconcileSupplierDebt(body);
	}
	@action
	async reconcileBank(input: ReconcileBankInput) {
		let result: boolean = await this.reconcileService.reconcileBank(input);
		if (!!result) {
			return Promise.resolve<RefundDto>(<any>result);
		}
		return Promise.resolve<RefundDto>(<any>null);
	}
	@action
	async reconcileRFID(input: ReconcileRFIDInput) {
		let result: boolean = await this.reconcileService.reconcileRFID(input);
		if (!!result) {
			return Promise.resolve<RefundDto>(<any>result);
		}
		return Promise.resolve<RefundDto>(<any>null);
	}
	@action
	async changeReasonAndStatusReconcile(input: ChangeReasonAndStatusReconcileInput) {
		let result: boolean = await this.reconcileService.changeReasonAndStatusReconcile(input);
		return result;
	}
	@action
	async ChangeReasonAndStatusReconcileOfExcel(input: ChangeReasonAndStatusReconcileInput) {
		let result: boolean = await this.reconcileService.changeReasonAndStatusReconcileOfExcel(input);
		return result;
	}
	@action
	async changeReasonAndStatusReconcileOfSupplierDebtExcel(input: ChangeReasonAndStatusReconcileInput) {
		let result: boolean = await this.reconcileService.changeReasonAndStatusReconcileOfSupplierDebtExcel(input);
		return result;
	}

	@action
	async confirmReconcile(rec_id: number | undefined) {
		let result: boolean = await this.reconcileService.confirmReconcile(rec_id);
		return result;
	}
	@action
	async confirmMultiReconcile(rec_id: number[] | undefined) {
		let result: boolean = await this.reconcileService.confirmMultiReconcile(rec_id);
		return result;
	}
	@action
	async deleteReconcileSupplierDebt(ids: number[] | undefined) {
		let result: boolean = await this.reconcileService.deleteReconcileSupplierDebt(ids);
		return result;
	}

}


export default ReconcileStore;