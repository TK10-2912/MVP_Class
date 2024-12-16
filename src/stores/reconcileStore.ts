import { action, observable } from 'mobx';
import http from '@services/httpService';
import { ChangeReasonAndStatusReconcileInput, EReconcileType, ERefundReasonType, ReconcileBankInput, ReconcileCashDto, ReconcileCashInput, ReconcileDto, ReconcileRFIDInput, ReconcileService, RefundDto, UpdateRefundInput } from '@src/services/services_autogen';

export class ReconcileStore {
	private reconcileService: ReconcileService;

	@observable total: number = 0;
	@observable reconcileListDto: ReconcileDto[] = [];
	@observable reconcileRFIDListDto: ReconcileDto[] = [];
	@observable reconcileCashListDto: ReconcileCashDto[] = [];

	constructor() {
		this.reconcileService = new ReconcileService("", http);
	}

	@action
	public getAllBankReconcile = async (start_date: Date | undefined, end_date: Date | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.reconcileListDto = [];
		this.total = 0;
		let result = await this.reconcileService.getAllBankReconcile(start_date, end_date, gr_ma_id, ma_id_list, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.total = result.totalCount;
			this.reconcileListDto = result.items;
		}
	}
	@action
	public getAllBankReconcileByAdmin = async (us_id_list: number[] | undefined, start_date: Date | undefined, end_date: Date | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.reconcileListDto = [];
		this.total = 0;
		let result = await this.reconcileService.getAllBankReconcileByAdmin(us_id_list, start_date, end_date, gr_ma_id, ma_id_list, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.total = result.totalCount;
			this.reconcileListDto = result.items;
		}
	}
	@action
	public getAllReconcileCash = async (gr_ma_id: number | undefined, ma_id_list: number[] | undefined, rec_month: string | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.reconcileCashListDto = [];
		this.total = 0;
		let result = await this.reconcileService.getAllReconcileCash(gr_ma_id, ma_id_list, rec_month, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.reconcileCashListDto = result.items;
			this.total = result.totalCount;
		}
	}
	@action
	public getAllReconcileCashByAdmin = async (gr_ma_id: number | undefined, ma_id_list: number[] | undefined, rec_month: string | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.reconcileCashListDto = [];
		this.total = 0;
		let result = await this.reconcileService.getAllReconcileCashByAdmin(gr_ma_id, ma_id_list, rec_month, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.reconcileCashListDto = result.items;
			this.total = result.totalCount;
		}
	}
	@action
	public getAllRFIDReconcile = async (start_date: Date | undefined, end_date: Date | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.reconcileRFIDListDto = [];
		this.total = 0;
		let result = await this.reconcileService.getAllRFIDReconcile(start_date, end_date, gr_ma_id, ma_id_list, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.reconcileRFIDListDto = result.items;
			this.total = result.totalCount;
		}
	}
	@action
	public getAllRFIDReconcileByAdmin = async (us_id_list: number[] | undefined, start_date: Date | undefined, end_date: Date | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.reconcileRFIDListDto = [];
		this.total = 0;
		let result = await this.reconcileService.getAllRFIDReconcileByAdmin(us_id_list, start_date, end_date, gr_ma_id, ma_id_list, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.reconcileRFIDListDto = result.items;
			this.total = result.totalCount;
		}
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
	async confirmReconcile(rec_id: number | undefined) {
		let result: boolean = await this.reconcileService.confirmReconcile(rec_id);
		return result;
	}

}


export default ReconcileStore;