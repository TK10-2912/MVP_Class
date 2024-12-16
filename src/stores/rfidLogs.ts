import { action, observable } from 'mobx';
import http from '@services/httpService';
import { ERIFDAction, RfidLogDto, RfidLogsService, SORT, } from '@src/services/services_autogen';
export class RFIDLogs {
	private rfidLogs: RfidLogsService;

	@observable totalLogRFID: number = 0;
	@observable logRFIDListResult: RfidLogDto[] = [];

	constructor() {
		this.rfidLogs = new RfidLogsService("", http);
	}


	@action
	public getAllLogs = async (rf_lo_action: ERIFDAction[] | undefined, rf_code: string | undefined,gr_ma_id: number | undefined, ma_id_list: number[] | undefined, rf_lo_created_from: Date | undefined, rf_lo_created_to: Date | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.logRFIDListResult = [];
		let result = await this.rfidLogs.getAllLogs(rf_lo_action, rf_code,gr_ma_id, ma_id_list, rf_lo_created_from, rf_lo_created_to, fieldSort, sort, skipCount, maxResultCount)
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalLogRFID = result.totalCount;
			this.logRFIDListResult = result.items;
		}
	}
	@action
	public getAllLogsByAdmin = async (us_id: number[] | undefined, rf_lo_action: ERIFDAction[] | undefined, rf_code: string | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined,  rf_lo_created_from: Date | undefined, rf_lo_created_to: Date | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.logRFIDListResult = [];
		let result = await this.rfidLogs.getAllLogsByAdmin(us_id, rf_lo_action, rf_code,gr_ma_id, ma_id_list, rf_lo_created_from, rf_lo_created_to, fieldSort, sort, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalLogRFID = result.totalCount;
			this.logRFIDListResult = result.items;
		}
	}
}
export default RFIDLogs;