import { action, observable } from 'mobx';
import http from '@services/httpService';
import { ConnectInvoiceDto, ConnectInvoiceService, CreateConnectInvoiceDto, StatusConnectResponse } from '@src/services/services_autogen';
class ConnectInvoiceStore {
    private connectInvoiceService: ConnectInvoiceService;
    @observable connectInvoiceDto: ConnectInvoiceDto;
    constructor() {
        this.connectInvoiceService = new ConnectInvoiceService("", http);
    }

    @action
    public connectInvoice = async (input: CreateConnectInvoiceDto) => {
        if (input == undefined || input == null) {
            return Promise.resolve<ConnectInvoiceDto>(<any>null);
        }
        let result: ConnectInvoiceDto = await this.connectInvoiceService.connectInvoiceWithSInvoice(input);
        if (!!result) {
            return Promise.resolve<ConnectInvoiceDto>(<any>result);
        }
        return Promise.resolve<ConnectInvoiceDto>(<any>null);
    }
    @action
    public testConnect = async (input: CreateConnectInvoiceDto) => {
        if (input == undefined || input == null) {
            return Promise.resolve<StatusConnectResponse>(<any>null);
        }
        let result: StatusConnectResponse = await this.connectInvoiceService.checkConnectInvoice(input);
        if (!!result) {
            return Promise.resolve<StatusConnectResponse>(<any>result);
        }
        return Promise.resolve<StatusConnectResponse>(<any>null);
    }
    public getConncet = async () => {
        let result: ConnectInvoiceDto = await this.connectInvoiceService.getConnectInvoice();
        if (!!result) {
            this.connectInvoiceDto = result;
        }
        return Promise.resolve<ConnectInvoiceDto>(<any>result || null);
    }
    public deleteConnect = async () =>{
        let result:Boolean =  await this.connectInvoiceService.deleteConnectInvoice();
        return Promise.resolve<Boolean>(result);
    }
}
export default ConnectInvoiceStore;