import { action, observable } from 'mobx';
import http from '@services/httpService';
import {HardwareService,CreateRefundInput} from '@services/services_autogen';
export class HardwareStore {
	private handoverService: HardwareService;

	@observable totalCount: number = 0;

	constructor() {
		this.handoverService = new HardwareService("", http);
	}


	@action
	async createRefund(body: CreateRefundInput) {
		await this.handoverService.createRefund(body);
	}

}


export default HardwareStore;