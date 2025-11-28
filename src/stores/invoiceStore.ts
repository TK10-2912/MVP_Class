import { action, observable } from 'mobx';
import http from '@services/httpService';
import { FilePDFInvoice, InvoiceDto, InvoiceService } from '@src/services/services_autogen';
class InvoiceStore {
    private invoiceService: InvoiceService;
    @observable invoiceDto: InvoiceDto;
    @observable listInvoice: InvoiceDto[] = [];
    @observable totalCount: number = 0;
    constructor() {
        this.invoiceService = new InvoiceService("", http);
    }

    // @action
    // public connectInvoice = async (input: CreateConnectInvoiceDto) => {
    //     if (input == undefined || input == null) {
    //         return Promise.resolve<ConnectInvoiceDto>(<any>null);
    //     }
    //     let result: ConnectInvoiceDto = await this.invoiceService.connectInvoiceWithSInvoice(input);
    //     if (!!result) {
    //         return Promise.resolve<ConnectInvoiceDto>(<any>result);
    //     }
    //     return Promise.resolve<ConnectInvoiceDto>(<any>null);
    // }
    // @action
    // public testConnect = async (input: CreateConnectInvoiceDto) => {
    //     if (input == undefined || input == null) {
    //         return Promise.resolve<StatusConnectResponse>(<any>null);
    //     }
    //     let result: StatusConnectResponse = await this.invoiceService.checkConnectInvoice(input);
    //     if (!!result) {
    //         return Promise.resolve<StatusConnectResponse>(<any>result);
    //     }
    //     return Promise.resolve<StatusConnectResponse>(<any>null);
    // }
    // public getConncet = async () => {
    //     let result: ConnectInvoiceDto = await this.invoiceService.getConnectInvoice();
    //     if (!!result) {
    //         this.connectInvoiceDto = result;
    //     }
    //     return Promise.resolve<ConnectInvoiceDto>(<any>result || null);
    // }
    // public deleteConnect = async () =>{
    //     let result:Boolean =  await this.invoiceService.deleteConnectInvoice();
    //     return Promise.resolve<Boolean>(result);
    // }
    public getAll = async (skipCount: number | undefined, maxResultCount: number | undefined) => {
        this.listInvoice = [];
        this.totalCount = 0;
        let result = await this.invoiceService.getAll(skipCount, maxResultCount);
        if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
            this.listInvoice = result.items!;
            this.totalCount = result.totalCount!;
        }
    }
    public getInvoiceByBillingId = async (bi_id: number | undefined) => {
        if (bi_id != undefined) {
            let result = await this.invoiceService.getInvoiceByBilingId(bi_id);
            this.invoiceDto = result;
            return Promise.resolve<InvoiceDto>(result);
        }
        else return Promise.resolve<InvoiceDto | null>(null);
    }
    public getFilePDF = async (input: InvoiceDto) => {
        let result: FilePDFInvoice = await this.invoiceService.getFilePDFInvoice(input.transactionUiid, input.invoiceNo)
        return result;
    }
}
export default InvoiceStore;