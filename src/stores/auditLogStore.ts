import { action, observable } from 'mobx';
import http from '@services/httpService';
import { 
	AuditLogService
} from '@services/services_autogen';
export class AuditLogStore {
	
	private auditLogService:AuditLogService;
	@observable totalCount:number = 0;
	constructor() {
		 this.auditLogService = new AuditLogService("",http);
    }
	
	@action
	public getAll = async (impersonatorUserId: number | undefined, exception: string | undefined, browserInfo: string | undefined, clientName: string | undefined, clientIpAddress: string | undefined, userId: number | undefined, methodName: string | undefined, serviceName: string | undefined, skipCount: number | undefined, maxValue: number | undefined )=>{
		let result = await this.auditLogService.getAll(impersonatorUserId, exception, browserInfo, clientName, clientIpAddress, userId, methodName, serviceName, skipCount, maxValue); 
		if(result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null){
			this.totalCount = result.totalCount;
			return result.items;
		} 
		return [];
	} 
	
	@action
	public deleteAuditLog = async ( au_lo_id: number[] | null | undefined)=>{
		if(au_lo_id == undefined || au_lo_id == null || au_lo_id.length == 0){
			return;
		}
		let result= await this.auditLogService.deleteAuditLog(au_lo_id); 
		
	}
	@action
	public deleteAllAuditLog = async ()=>{
		let result= await this.auditLogService.deleteAllAuditLog(); 
		
	}
	

}


export default AuditLogStore;
