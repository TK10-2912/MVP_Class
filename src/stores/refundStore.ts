import { action, observable } from 'mobx';
import http from '@services/httpService';
import { BillMethod, ERefundReasonType, RefundDto, RefundService, UpdateRefundInput } from '@src/services/services_autogen';

export class RefundStore {
	private refundService: RefundService;

	@observable totalRefund: number = 0;
	@observable refundListDto: RefundDto[] = [];

	constructor() {
		this.refundService = new RefundService("", http);
	}

	@action
	async updateRefund(input: UpdateRefundInput) {
		let result: RefundDto = await this.refundService.updateRefund(input);
		if (!!result) {
			this.refundListDto = this.refundListDto.map((x: RefundDto) => {
				if (x.ref_id === input.ref_id) x = result;
				return x;
			});
			return Promise.resolve<RefundDto>(<any>result);
		}
		return Promise.resolve<RefundDto>(<any>null);
	}
	@action
	public getAll = async (ref_reason_type: ERefundReasonType | undefined, ref_refund_type: BillMethod | undefined, ref_status: number | undefined, bi_code: string | undefined, ref_namebank: string | undefined, ref_from: Date | undefined, ref_to: Date | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined, skipCount: number | undefined, maxResultCount: number | undefined,) => {
		this.refundListDto = [];
		let result = await this.refundService.getAll(ref_reason_type, ref_refund_type, ref_status, bi_code, ref_namebank, ref_from, ref_to, gr_ma_id, ma_id_list, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalRefund = result.totalCount;
			this.refundListDto = result.items;
		}
	}
	@action
	public getAllByAdmin = async (us_id_list: number[] | undefined, ref_reason_type: ERefundReasonType | undefined, ref_refund_type: BillMethod | undefined, ref_status: number | undefined, bi_code: string | undefined, ref_namebank: string | undefined, ref_from: Date | undefined, ref_to: Date | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined, skipCount: number | undefined, maxResultCount: number | undefined,) => {
		this.refundListDto = [];
		let result = await this.refundService.getAllByAdmin(us_id_list, ref_reason_type, ref_refund_type, ref_status, bi_code, ref_namebank, ref_from, ref_to, gr_ma_id, ma_id_list, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalRefund = result.totalCount;
			this.refundListDto = result.items;
		}
	}

}


export default RefundStore;