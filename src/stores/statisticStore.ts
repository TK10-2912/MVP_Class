import { action, observable } from 'mobx';
import http from '@services/httpService';
import { StatisticStorageMVPService, StatisticBillingOfMachineDto, StatisticImportOfMachineDto, StatisticOfPriceUnitDto, StatisticBillingOfProductDto, StatisticBillingOf24hDto, StatisticBillingOfPaymentDto, StatisticOfDrinkTypeDto, StatisticBillingOfProductWithMachineDto, StatisticImportSellRemainProductDto } from '@services/services_autogen';

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
	@observable listBlillingOf24h: StatisticBillingOf24hDto[] = [];
	@observable listStatisticOfPriceUnit: StatisticOfPriceUnitDto[] = [];
	@observable listStatisticBillingOfPayment: StatisticBillingOfPaymentDto[] = [];
	@observable liststatisticOfDrinkType: StatisticOfDrinkTypeDto[] = [];
	@observable listBillingOfProductWithMachine: StatisticBillingOfProductWithMachineDto[] = [];
	@observable listImportSellRemainProductByAdmin: StatisticImportSellRemainProductDto[] = [];
	@observable totalCountRemainProduct: number = 0;
	@observable listImportSellRemainProduct: StatisticImportSellRemainProductDto[] = [];
	@observable totalBillingStatistic: number = 0;
	@observable totalBillingOf24h: number = 0;
	@observable totalBillingFreshDrinkStatistic: number = 0;

	constructor() {
		this.statisticStorageMVPService = new StatisticStorageMVPService("", http);
	}

	@action
	public statisticBillingOfMachine = async (body: SearchInputUser) => {
		this.billingStatisticListResult = [];
		let result = await this.statisticStorageMVPService.statisticBillingOfMachine(body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort, body.skipCount, body.maxResult);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.billingStatisticListResult = result.items;
			this.totalBillingStatistic = result.totalCount;
		}
	}
	@action
	public statisticBillingOfMachinebyAdmin = async (body: SearchInputAdmin) => {
		this.billingStatisticListResult = [];
		let result = await this.statisticStorageMVPService.statisticBillingOfMachineByAdmin(body.us_id, body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort, body.skipCount, body.maxResult);
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
	public statisticBillingOfPayment = async (body: SearchInputUser) => {
		this.listStatisticBillingOfPayment = [];
		let result = await this.statisticStorageMVPService.statisticBillingOfPayment(body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort, body.skipCount, body.maxResult);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.listStatisticBillingOfPayment = result.items;
		}
	}
	@action
	public statisticBillingOfPaymentbyAdmin = async (body: SearchInputAdmin) => {
		this.listStatisticBillingOfPayment = [];
		let result = await this.statisticStorageMVPService.statisticBillingOfPaymentByAdmin(body.us_id, body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort, body.skipCount, body.maxResult);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.listStatisticBillingOfPayment = result.items;
		}
	}
	@action
	public statisticBillingOf24h = async (body: SearchInputUser) => {
		this.listBlillingOf24h = [];
		let result = await this.statisticStorageMVPService.statisticBillingOf24h(body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort, body.skipCount, body.maxResult);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.listBlillingOf24h = result.items;
			this.totalBillingOf24h = result.totalCount;
		}
	}
	@action
	public statisticBillingOf24hByAdmin = async (body: SearchInputAdmin) => {
		this.listBlillingOf24h = [];
		let result = await this.statisticStorageMVPService.statisticBillingOf24hByAdmin(body.us_id, body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort, body.skipCount, body.maxResult);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.listBlillingOf24h = result.items;
			this.totalBillingOf24h = result.totalCount;
		}
	}
	//báo cáo sản phẩm không có bao bì người dùng
	@action
	public statisticBillingOfFreshDrinkProduct = async (body: SearchInputUser) => {
		this.listBillingOfFreshProduct = []
		let result = await this.statisticStorageMVPService.statisticBillingOfFreshDrinkProduct(body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort, body.skipCount, body.maxResult);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.listBillingOfFreshProduct = result.items;
			this.totalBillingFreshDrinkStatistic = result.totalCount;
		}
	}
	//báo cáo sản phẩm không có bao bì admin
	@action
	public statisticBillingOfFreshDrinkProductByAdmin = async (body: SearchInputAdmin) => {
		this.listBillingOfFreshProduct = [];
		let result = await this.statisticStorageMVPService.statisticBillingOfFreshDrinkProductByAdmin(body.us_id, body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort, body.skipCount, body.maxResult);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.listBillingOfFreshProduct = result.items;
			this.totalBillingFreshDrinkStatistic = result.totalCount;
		}
	}
	//báo cáo sản phẩm có bao bì người dùng
	@action
	public statisticBillingOfDrinkProduct = async (body: SearchInputUser) => {
		this.listBillingOfDrinkProduct = [];
		let result = await this.statisticStorageMVPService.statisticBillingOfDrinkProduct(body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort, body.skipCount, body.maxResult);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.listBillingOfDrinkProduct = result.items;
			this.totalBillingStatistic = result.totalCount;
		}
	}
	//báo cáo sản phẩm có bao bì admin
	@action
	public statisticBillingOfDrinkProductByAdmin = async (body: SearchInputAdmin) => {
		this.listBillingOfDrinkProduct = [];
		let result = await this.statisticStorageMVPService.statisticBillingOfDrinkProductByAdmin(body.us_id, body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort, body.skipCount, body.maxResult);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.listBillingOfDrinkProduct = result.items;
			this.totalBillingStatistic = result.totalCount;
		}
	}
	@action
	public statisticOfPriceUnit = async (body: SearchPriceUnitInput) => {
		this.listStatisticOfPriceUnit = [];
		let result = await this.statisticStorageMVPService.statisticOfPriceUnit(body.low_price, body.high_price, body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort, body.skipCount, body.maxResult);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.listStatisticOfPriceUnit = result.items;
		}
	}
	@action
	public statisticOfPriceUnitbyAdmin = async (body: SearchPriceUnitInputAdmin) => {
		this.listStatisticOfPriceUnit = [];
		let result = await this.statisticStorageMVPService.statisticOfPriceUnitByAdmin(body.us_id, body.low_price, body.high_price, body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort, body.skipCount, body.maxResult);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.listStatisticOfPriceUnit = result.items;
		}
	}
	@action
	public statisticOfDrinkType = async (body: SearchInputUser) => {
		this.liststatisticOfDrinkType = [];
		let result = await this.statisticStorageMVPService.statisticOfDrinkType(body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort, body.skipCount, body.maxResult);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.liststatisticOfDrinkType = result.items;
		}
	}
	@action
	public statisticOfDrinkTypebyAdmin = async (body: SearchInputAdmin) => {
		this.liststatisticOfDrinkType = [];
		let result = await this.statisticStorageMVPService.statisticOfDrinkTypeByAdmin(body.us_id, body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort, body.skipCount, body.maxResult);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.liststatisticOfDrinkType = result.items;
		}
	}
	@action
	public statisticBillingOfProductWithMachine = async (body: SearchBillingOfProductWithMachine) => {
		this.listBillingOfProductWithMachine = [];
		let result = await this.statisticStorageMVPService.statisticBillingOfProductWithMachine(body.product_key, body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort, body.skipCount, body.maxResult);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.listBillingOfProductWithMachine = result.items;
		}
	}
	@action
	public statisticBillingOfProductWithMachinebyAdmin = async (body: SearchBillingOfProductWithMachineAdmin) => {
		this.listBillingOfProductWithMachine = [];
		let result = await this.statisticStorageMVPService.statisticBillingOfProductWithMachineByAdmin(body.us_id, body.product_key, body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort, body.skipCount, body.maxResult);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.listBillingOfProductWithMachine = result.items;
			this.totalBillingStatistic = result.totalCount
		}
	}
	@action
	public statisticImportSellRemainProductByAdmin = async (body: SearchStatisticImportSellRemainProductByAdmin) => {
		this.listImportSellRemainProductByAdmin = [];
		let result = await this.statisticStorageMVPService.statisticImportSellRemainProductByAdmin(body.us_id, body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort, body.skipCount, body.maxResult);

		if (result != undefined && result.items != undefined && result.items != null) {
			this.listImportSellRemainProductByAdmin = result.items;
			this.totalCountRemainProduct = result.totalCount;
		}
	}
	@action
	public statisticImportSellRemainProduct = async (body: SearchInputUser) => {
		this.listImportSellRemainProductByAdmin = [];
		let result = await this.statisticStorageMVPService.statisticImportSellRemainProduct(body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort, body.skipCount, body.maxResult);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.listImportSellRemainProduct = result.items;
			this.totalCountRemainProduct = result.totalCount;
		}
	}
	@action
	public statisticBillingOfQuyTieuDungXanh = async () => {
		let result = await this.statisticStorageMVPService.statisticBillingOfQuyTieuDungXanh();
		return result['result'];
	}
}


export default StatisticStore;