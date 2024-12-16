import { action, observable } from 'mobx';
import http from '@services/httpService';
import { EBank, EPaymentStatus, PaymentBankDto, PaymentBankService, PaymentService, SORT } from '@services/services_autogen';
export class PaymentBankStore {
	private paymentBankService: PaymentBankService;

	@observable totalPaymentBank: number = 0;
	@observable paymentBankListResult: PaymentBankDto[] = [];

	constructor() {
		this.paymentBankService = new PaymentBankService("", http);
	}


	@action
	public getAll = async (bi_code: string | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined, pa_ba_status: EPaymentStatus | undefined, pa_ba_bankId: EBank | undefined, pa_ba_created_at: Date | undefined, pa_ba_created_from: Date | undefined, pa_ba_created_to: Date | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined,) => {
		this.paymentBankListResult = [];
		let result = await this.paymentBankService.getAll(bi_code, gr_ma_id, ma_id_list, pa_ba_status, pa_ba_bankId, pa_ba_created_at, pa_ba_created_from, pa_ba_created_to, fieldSort, sort, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalPaymentBank = result.totalCount;
			this.paymentBankListResult = result.items;
		}
	}
	@action
	public getAllByAdmin = async (
		us_id: number[] | undefined, bi_code: string | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined, pa_ba_status: EPaymentStatus | undefined, pa_ba_bankId: EBank | undefined, pa_ba_created_at: Date | undefined, pa_ba_created_from: Date | undefined, pa_ba_created_to: Date | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined,
	) => {
		this.paymentBankListResult = [];
		let result = await this.paymentBankService.getAllByAdmin(us_id, bi_code, gr_ma_id, ma_id_list, pa_ba_status, pa_ba_bankId, pa_ba_created_at, pa_ba_created_from, pa_ba_created_to, fieldSort, sort, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalPaymentBank = result.totalCount;
			this.paymentBankListResult = result.items;
		}
	}
}


export default PaymentBankStore;