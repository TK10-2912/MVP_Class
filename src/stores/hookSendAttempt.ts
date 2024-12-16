import { action, observable } from 'mobx';
import http from '@services/httpService';
import { GetAllSendAttemptsOutput, GetAllSendAttemptsOutputPagedResultDto, WebhookSendAttemptService } from '@src/services/services_autogen';
class HookSendAttempt{
	private hookSendAttemptService: WebhookSendAttemptService;
	@observable hookSendAttemptListDto: GetAllSendAttemptsOutput[] = []; 
	@observable totalCount: number = 0;
	constructor() {
		this.hookSendAttemptService = new WebhookSendAttemptService("",http);
    }

	@action
	public getAllSendAttempts = async(subscriptionId : string, maxResultCount: number, skipCount: number)=>{
		this.hookSendAttemptListDto =[];
		let result = await this.hookSendAttemptService.getAllSendAttempts(subscriptionId,maxResultCount,skipCount);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.hookSendAttemptListDto = result.items;
			this.totalCount= result.totalCount;
		}
	}
	@action 
	public getAllSendAttemptsOfWebhookEvent =async(id : string | undefined) =>{
		if (id === undefined) {
			return Promise.resolve<GetAllSendAttemptsOutput >(<any>null);
		}
		let result = await this.hookSendAttemptService.getAllSendAttemptsOfWebhookEvent(id);
		if (!!result) {
			return Promise.resolve<GetAllSendAttemptsOutput >(<any> result);
		}
		return Promise.resolve<GetAllSendAttemptsOutput >(<any>null);
	}
	@action 
	public resend =async(sendAttemptId : string | undefined) =>{
		if(sendAttemptId !=undefined ){
			await this.hookSendAttemptService.resend(sendAttemptId);
		}
	}
}
export default HookSendAttempt;