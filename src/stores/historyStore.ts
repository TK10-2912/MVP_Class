import { action, observable } from 'mobx';
import http from '@services/httpService';
import { CancelToken } from 'axios';
import { BillingDto, BillingOfMachineDto, BillMethod, DailySaleMonitoringDto, EBillStatus, EPaidStatus, HistoryMVPService, MachineDtoListResultDto, ReportLevel, ReportOfMachineDto, ReportStatus, SORT, TransactionByMachineDto } from '@src/services/services_autogen';
import { SearchHistoryReportInputUser } from '@src/components/Manager/SearchHistoryReportUser';
export class HistoryStore {
    private historyService: HistoryMVPService;

    @observable listBillingOfMachine: BillingOfMachineDto[] = [];  // bán hàng
    @observable listTransactionByMachineDto: TransactionByMachineDto[] = [];// từng máy 
    @observable listReportOfMachine: ReportOfMachineDto[] = [];// cảnh báo
    @observable listThanhToanTungDot: ReportOfMachineDto[] = [];// cảnh báo
    @observable listBillingDto: BillingDto[] = [];// cảnh báo
    @observable total: number = 0;// cảnh báo
    @observable totalLog: number = 0;// cảnh báo
    @observable totalTransactionByMachine: number = 0;// từng máy 

    constructor() {
        this.historyService = new HistoryMVPService("", http);
    }

    @action
    public chiTietBanHang = async (start_date: Date | undefined, end_date: Date | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
        let result = await this.historyService.chiTietBanHang(start_date, end_date, gr_ma_id, ma_id_list, fieldSort, sort, skipCount, maxResultCount);
        if (!!result) {
            this.total = result.totalCount;
            return Promise.resolve<DailySaleMonitoringDto>(<any>result.items![0])
        }
        return Promise.resolve<DailySaleMonitoringDto>(<any>null)
    }
    @action
    public chiTietBanHangAdmin = async (us_id: number[] | undefined, start_date: Date | undefined, end_date: Date | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
        let result = await this.historyService.chiTietBanHangAdmin(us_id, start_date, end_date, gr_ma_id, ma_id_list, fieldSort, sort, skipCount, maxResultCount);
        if (!!result) {
            this.total = result.totalCount;
            return Promise.resolve<DailySaleMonitoringDto>(<any>result.items![0])
        }
        return Promise.resolve<DailySaleMonitoringDto>(<any>null)
    }
    @action
    public chiTietGiaoDichTheoTungMay = async (payment_type: BillMethod | undefined, bi_paid_status: EPaidStatus | undefined, bi_code: string | undefined, start_date: Date | undefined, end_date: Date | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined ) => {
        this.listTransactionByMachineDto = [];
        this.totalLog = 0;
        let result = await this.historyService.chiTietGiaoDichTheoTungMay(payment_type, bi_paid_status, bi_code, start_date, end_date, gr_ma_id, ma_id_list, fieldSort, sort, skipCount, maxResultCount);
        if (result != undefined && result.items != undefined && result.items != null) {
            this.listTransactionByMachineDto = result.items;
            this.totalLog = result.totalCount
        }
    }
    @action
    public chiTietGiaoDichTheoTungMayAdmin = async (us_id: number[] | undefined, payment_type: BillMethod | undefined, bi_paid_status: EPaidStatus | undefined, bi_code: string | undefined, start_date: Date | undefined, end_date: Date | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
        this.listTransactionByMachineDto = [];
        this.totalLog = 0;
        let result = await this.historyService.chiTietGiaoDichTheoTungMayAdmin(us_id, payment_type, bi_paid_status, bi_code, start_date, end_date, gr_ma_id, ma_id_list, fieldSort, sort, skipCount, maxResultCount);
        if (result != undefined && result.items != undefined && result.items != null) {
            this.listTransactionByMachineDto = result.items;
            this.totalLog = result.totalCount
        }
    }
    @action
    public lichSuCanhBao = async (body: SearchHistoryReportInputUser) => {
        this.listReportOfMachine = [];
        this.total = 0;
        let result = await this.historyService.lichSuCanhBao(body.re_status, body.re_level,body.bi_code, body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort, body.skipCount, body.maxResultCount);
        if (result != undefined && result.items != undefined) {
            this.listReportOfMachine = result.items;
            this.total = result.totalCount;
        }
    }
    @action
    public lichSuCanhBaoAdmin = async (us_id: number[] | undefined, re_status: ReportStatus | undefined, re_level: ReportLevel | undefined, bi_code: string | undefined, start_date: Date | undefined, end_date: Date | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount, maxResultCount) => {
        this.listReportOfMachine = [];
        this.total = 0;
        let result = await this.historyService.lichSuCanhBaoAdmin(us_id, re_status, re_level,bi_code, start_date, end_date, gr_ma_id, ma_id_list, fieldSort, sort, skipCount, maxResultCount);
        if (result != undefined && result.items != undefined) {
            this.listReportOfMachine = result.items;
            this.total = result.totalCount;
        }
    }
}


export default HistoryStore;