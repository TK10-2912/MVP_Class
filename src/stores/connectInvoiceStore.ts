import { action, observable } from 'mobx';
import http from '@services/httpService';
import { ConnectInvocieDto, ConnectInvoiceService } from '@src/services/services_autogen';
class ConnectInvoiceStore {
    private connectInvoiceService: ConnectInvoiceService;
    constructor() {
        this.connectInvoiceService = new ConnectInvoiceService("", http);
    }

    @action
    public connectInvoice = async (input: ConnectInvocieDto) => {
        return await this.connectInvoiceService.connectInvoiceWithSInvoice(input);
    }
    @action
    public testConnect = async (input: ConnectInvocieDto) => {
        return await this.connectInvoiceService.checkConnectInvoice();
    }
}
export default ConnectInvoiceStore;