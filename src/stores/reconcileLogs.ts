import { action, observable } from 'mobx';
import http from '@services/httpService';
import { ReconcileLogsDto, ReconcileLogsService } from '@src/services/services_autogen';

export class ReconcileLogsStore {
	private reconcileLogsService: ReconcileLogsService;

	@observable totalLogReconcile: number = 0;
	@observable reconcileLogsListDto: ReconcileLogsDto[] = [];

	constructor() {
		this.reconcileLogsService = new ReconcileLogsService("", http);
	}

	@action
	public getAll = async (rec_lo_code: string | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.reconcileLogsListDto = [];
		let result = await this.reconcileLogsService.getAllLogs(rec_lo_code, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalLogReconcile = result.totalCount;
			this.reconcileLogsListDto = result.items;
		}
	}
}

export default ReconcileLogsStore;