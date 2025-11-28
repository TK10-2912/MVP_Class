import { action, observable } from 'mobx';
import http from '@services/httpService';
import { StatisticStorageMVPService, StatisticBillingOfMachineDto, StatisticImportOfMachineDto, StatisticBillingOfProductDto, StatisticBillingOfPaymentDto, StatisticBillingOfProductWithMachineDto, SORT, DrinkType, ThongKeTongQuanDoanhSoTheoMayDto } from '@services/services_autogen';

export class SearchInputUser {
	public start_date;
	public end_date;
	public gr_ma_id;
	public ma_id_list;
	public fieldSort;
	public sort;
	public skipCount;
	public maxResult;
	constructor(start_date, end_date, gr_ma_id, ma_id_list, fieldSort, sort, skipCount, maxResult) {
		this.fieldSort = fieldSort;
		this.sort = sort;
		this.start_date = start_date;
		this.end_date = end_date;
		this.gr_ma_id = gr_ma_id;
		this.ma_id_list = ma_id_list;
		this.skipCount = skipCount;
		this.maxResult = maxResult;
	}

}
export class SearchInputStaticBilling extends SearchInputUser {
	public dr_type;

	constructor(dr_type, start_date, end_date, gr_ma_id, ma_id_list, fieldSort, sort, skipCount, maxResult) {
		super(start_date, end_date, gr_ma_id, ma_id_list, fieldSort, sort, skipCount, maxResult);
		this.dr_type = dr_type;
	}
}

export class SearchInputAdmin extends SearchInputUser {
	public us_id;

	constructor(us_id, start_date, end_date, gr_ma_id, ma_id_list, fieldSort, sort, skipCount, maxResult) {
		super(start_date, end_date, gr_ma_id, ma_id_list, fieldSort, sort, skipCount, maxResult);
		this.us_id = us_id;
	}
}
export class SearchPriceUnitInput extends SearchInputUser {
	public low_price;
	public high_price;

	constructor(low_price, high_price, start_date, end_date, gr_ma_id, ma_id_list, fieldSort, sort, skipCount, maxResult) {
		super(start_date, end_date, gr_ma_id, ma_id_list, fieldSort, sort, skipCount, maxResult);

		this.low_price = low_price;
		this.high_price = high_price;
	}
}
export class SearchPriceUnitInputAdmin extends SearchPriceUnitInput {
	public us_id;
	constructor(us_id, low_price, high_price, start_date, end_date, gr_ma_id, ma_id_list, fieldSort, sort, skipCount, maxResult) {
		super(low_price, high_price, start_date, end_date, gr_ma_id, ma_id_list, fieldSort, sort, skipCount, maxResult);
		this.us_id = us_id;
	}
}
export class SearchBillingOfProductWithMachine extends SearchInputUser {
	public product_key;
	constructor(product_key, start_date, end_date, gr_ma_id, ma_id_list, fieldSort, sort, skipCount, maxResult) {
		super(start_date, end_date, gr_ma_id, ma_id_list, fieldSort, sort, skipCount, maxResult);
		this.product_key = product_key;
	}
}
export class SearchBillingOfProductWithMachineAdmin extends SearchBillingOfProductWithMachine {
	public us_id;
	constructor(us_id, product_key, start_date, end_date, gr_ma_id, ma_id_list, fieldSort, sort, skipCount, maxResult) {
		super(product_key, start_date, end_date, gr_ma_id, ma_id_list, fieldSort, sort, skipCount, maxResult);
		this.us_id = us_id;
	}
}
export class SearchStatisticImportSellRemainProductByAdmin extends SearchBillingOfProductWithMachine {
	public us_id;
	constructor(us_id, start_date, end_date, gr_ma_id, ma_id_list, fieldSort, sort, skipCount, maxResult) {
		super(us_id, start_date, end_date, gr_ma_id, ma_id_list, fieldSort, sort, skipCount, maxResult);
		this.us_id = us_id;
	}
}

export class StatisticStore {
	private statisticStorageMVPService: StatisticStorageMVPService;

	@observable billingStatisticListResult: StatisticBillingOfMachineDto[] = [];
	@observable importingStatisticListResult: StatisticImportOfMachineDto[] = [];
	@observable listBillingOfDrinkProduct: StatisticBillingOfProductDto[] = [];
	@observable listBillingOfFreshProduct: StatisticBillingOfProductDto[] = [];
	@observable listStatisticBillingOfPayment: StatisticBillingOfPaymentDto[] = [];
	@observable listBillingOfProductWithMachine: StatisticBillingOfProductWithMachineDto[] = [];
	@observable totalCountRemainProduct: number = 0;
	@observable totalBillingStatistic: number = 0;
	@observable totalBillingOf24h: number = 0;
	@observable totalBillingFreshDrinkStatistic: number = 0;
	//
	@observable thongkedoanhthutheomay: ThongKeTongQuanDoanhSoTheoMayDto[] = [];
	@observable totalThongkedoanhthutheomay: number = 0;
	constructor() {
		this.statisticStorageMVPService = new StatisticStorageMVPService("", http);
	}

	@action
	public statisticBillingOfMachine = async (dr_type: DrinkType | undefined, start_date: Date | undefined, end_date: Date | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.billingStatisticListResult = [];
		let result = await this.statisticStorageMVPService.statisticBillingOfMachine(dr_type, start_date, end_date, gr_ma_id, ma_id_list, fieldSort, sort, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.billingStatisticListResult = result.items;
			this.totalBillingStatistic = result.totalCount;
		}
	}
	@action
	public statisticBillingOfMachinebyAdmin = async (us_id: number[] | undefined, dr_type: DrinkType | undefined, start_date: Date | undefined, end_date: Date | undefined, gr_ma_id: number | undefined, ma_id_list: number[] | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined) => {
		this.billingStatisticListResult = [];
		let result = await this.statisticStorageMVPService.statisticBillingOfMachineByAdmin(us_id, dr_type, start_date, end_date, gr_ma_id, ma_id_list, fieldSort, sort, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.billingStatisticListResult = result.items;
			this.totalBillingStatistic = result.totalCount;
		}
	}

	@action
	public statisticImportingOfMachine = async (body: SearchInputUser) => {
		this.importingStatisticListResult = [];
		let result = await this.statisticStorageMVPService.statisticImportOfMachine(body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort, body.skipCount, body.maxResult);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.importingStatisticListResult = result.items;
		}
	}
	@action
	public statisticImportingOfMachinebyAdmin = async (body: SearchInputAdmin) => {
		this.importingStatisticListResult = [];
		let result = await this.statisticStorageMVPService.statisticImportOfMachineByAdmin(body.us_id, body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort, body.skipCount, body.maxResult);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.importingStatisticListResult = result.items;
		}
	}
	@action
	public thongKeTongQuanDoanhSoTheoMay = async (gr_ma_id: number | undefined, start_date: Date | undefined, end_date: Date | undefined, ma_id_list: number[] | undefined, fieldSort: string | undefined, sort: SORT | undefined) => {
		this.thongkedoanhthutheomay = [];
		let result = await this.statisticStorageMVPService.thongKeTongQuanDoanhSoTheoMay(gr_ma_id, start_date, end_date, ma_id_list, fieldSort, sort);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.thongkedoanhthutheomay = result.items;
			this.totalThongkedoanhthutheomay = result.totalCount;
		}
	}
}


export default StatisticStore;