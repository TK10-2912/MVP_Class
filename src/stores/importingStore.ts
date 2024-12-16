import http from '@services/httpService';
import { ImportingDto, ImportingService, SORT } from '@services/services_autogen';
import { action, observable } from 'mobx';
export class ImportingStore {
	private importingService: ImportingService;

	@observable totalImporting: number = 0;
	@observable importingListResult: ImportingDto[] = [];

	constructor() {
		this.importingService = new ImportingService("", http);
	}

	@action
	public getAll = async (ma_id_list: number[] | undefined, im_person_charge: string | undefined, im_start_date: Date | undefined, im_end_date: Date | undefined, gr_ma_id: number | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined,) => {
		this.importingListResult = [];
		let result = await this.importingService.getAll(ma_id_list, im_person_charge, im_start_date, im_end_date, gr_ma_id, fieldSort, sort, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalImporting = result.totalCount;
			this.importingListResult = result.items;
		}
	}
	@action
	public getAllByAdmin = async (us_id: number[] | undefined, ma_id_list: number[] | undefined, im_person_charge: string | undefined, im_start_date: Date | undefined, im_end_date: Date | undefined, gr_ma_id: number | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined,) => {
		this.importingListResult = [];
		let result = await this.importingService.getAllForAdmin(us_id, ma_id_list, im_person_charge, im_start_date, im_end_date, gr_ma_id, fieldSort, sort, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalImporting = result.totalCount;
			this.importingListResult = result.items;
		}
	}
}


export default ImportingStore;