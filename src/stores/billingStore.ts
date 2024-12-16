import { action, observable } from 'mobx';
import http from '@services/httpService';
import { BillingDto, BillingService, EBillReconcileStatus, EBillRequiredFund, EBillStatus } from '@src/services/services_autogen';

export class BillingStore {
	private billingService: BillingService;

	@observable totalBill: number = 0;
	@observable billListResult: BillingDto[] = [];

	constructor() {
		this.billingService = new BillingService("", http);
	}
	@action
	public getAll = async (bi_code: string | undefined, ma_id: number | undefined, di_id: number | undefined, bi_status: EBillStatus | undefined, bi_reconcile_status: EBillReconcileStatus[] | undefined, bi_required_refund: EBillRequiredFund[] | undefined, start_date: Date | undefined, end_date: Date | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.billListResult = [];
		let result = await this.billingService.getAll(bi_code, ma_id, di_id, bi_status, bi_reconcile_status,bi_required_refund,start_date,end_date, skipCount, maxResultCount);
		if (result !== undefined && result.items !== undefined && result.items !== null && result.totalCount !== undefined && result.totalCount !== null) {
			this.totalBill = result.totalCount;
			this.billListResult = result.items;
		}
	}
	@action
	public getAllByAdmin = async (us_id: number[] | undefined, bi_code: string | undefined, ma_id: number | undefined, di_id: number | undefined, bi_status: EBillStatus | undefined, bi_reconcile_status: EBillReconcileStatus[] | undefined, bi_required_refund: EBillRequiredFund[] | undefined, start_date: Date | undefined, end_date: Date | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.billListResult = [];
		let result = await this.billingService.getAllByAdmin(us_id, bi_code, ma_id, di_id, bi_status, bi_reconcile_status,bi_required_refund,start_date,end_date, skipCount, maxResultCount);
		if (result !== undefined && result.items !== undefined && result.items !== null && result.totalCount !== undefined && result.totalCount !== null) {
			this.totalBill = result.totalCount;
			this.billListResult = result.items;
		}
	}
}