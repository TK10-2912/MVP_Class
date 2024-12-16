import { action, observable } from 'mobx';
import http from '@services/httpService';
import { StatisticStorageMVPService, StatisticBillingOfMachineDto, StatisticImportOfMachineDto, StatisticOfPriceUnitDtoListResultDto, StatisticOfPriceUnitDto, StatisticBillingOfProductDto, StatisticBillingOf24hDto, StatisticBillingOfPaymentDtoListResultDto, StatisticBillingOfPaymentDto, StatisticOfDrinkTypeDto, StatisticBillingOfProductWithMachineDto, SORT, } from '@services/services_autogen';
import { CancelToken } from 'axios';
import { eDrinkType } from '@src/lib/enumconst';
export class SearchInputUser{
	public start_date;
	public end_date;
	public gr_ma_id;
	public ma_id_list;
	public fieldSort;
	public sort;
	constructor(start_date, end_date, gr_ma_id, ma_id_list,fieldSort,sort) {
		this.fieldSort = fieldSort;
		this.sort = sort;
		this.start_date = start_date;
		this.end_date = end_date;
		this.gr_ma_id = gr_ma_id;
		this.ma_id_list = ma_id_list;
	}

}

export class SearchInputAdmin extends  SearchInputUser{
    public us_id;
	
	constructor(us_id,start_date, end_date, gr_ma_id, ma_id_list,fieldSort,sort) {
		super(start_date, end_date, gr_ma_id, ma_id_list,fieldSort,sort);

		this.us_id = us_id;
	}
}
export class SearchPriceUnitInput extends  SearchInputUser{
    public low_price;
	public high_price;
	
	constructor(low_price,high_price,start_date, end_date, gr_ma_id, ma_id_list,fieldSort,sort) {
		super(start_date, end_date, gr_ma_id, ma_id_list,fieldSort,sort);

		this.low_price = low_price;
		this.high_price = high_price;
	}
}
export class SearchPriceUnitInputAdmin extends  SearchPriceUnitInput{
    public us_id;
	constructor(us_id,low_price,high_price,start_date, end_date, gr_ma_id, ma_id_list,fieldSort,sort) {
		super(low_price,high_price,start_date, end_date, gr_ma_id, ma_id_list,fieldSort,sort);
		this.us_id = us_id;
	}
}
export class SearchBillingOfProductWithMachine extends  SearchInputUser{
    public product_key;
	constructor(product_key,start_date, end_date, gr_ma_id, ma_id_list,fieldSort,sort) {
		super(start_date, end_date, gr_ma_id, ma_id_list,fieldSort,sort);
		this.product_key = product_key;
	}
}
export class SearchBillingOfProductWithMachineAdmin extends  SearchBillingOfProductWithMachine{
    public us_id;
	constructor(us_id,product_key,start_date, end_date, gr_ma_id, ma_id_list,fieldSort,sort) {
		super(product_key,start_date, end_date, gr_ma_id, ma_id_list,fieldSort,sort);
		this.us_id = us_id;
	}
}
export class StatisticStore  {
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


	constructor() {
		this.statisticStorageMVPService = new StatisticStorageMVPService("", http);
	}

	@action
	public statisticBillingOfMachine = async (body:SearchInputUser) => {
		this.billingStatisticListResult = [];
		let result = await this.statisticStorageMVPService.statisticBillingOfMachine(body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.billingStatisticListResult = result.items;
		}
	}
	@action
	public statisticBillingOfMachinebyAdmin = async (body: SearchInputAdmin) => {
		this.billingStatisticListResult = [];
		let result = await this.statisticStorageMVPService.statisticBillingOfMachineByAdmin(body.us_id, body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.billingStatisticListResult = result.items;
		}
	}

	@action
	public statisticImportingOfMachine = async (body:SearchInputUser) => {
		this.importingStatisticListResult = [];
		let result = await this.statisticStorageMVPService.statisticImportOfMachine(body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.importingStatisticListResult = result.items;
		}
	}
	@action
	public statisticImportingOfMachinebyAdmin = async (body: SearchInputAdmin) => {
		this.importingStatisticListResult = [];
		let result = await this.statisticStorageMVPService.statisticImportOfMachineByAdmin(body.us_id, body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.importingStatisticListResult = result.items;
		}
	}
	@action
	public statisticBillingOfPayment = async (body:SearchInputUser) => {
		this.listStatisticBillingOfPayment = [];
		let result = await this.statisticStorageMVPService.statisticBillingOfPayment(body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.listStatisticBillingOfPayment = result.items;
		}
	}
	@action
	public statisticBillingOfPaymentbyAdmin = async (body: SearchInputAdmin) => {
		this.listStatisticBillingOfPayment = [];
		let result = await this.statisticStorageMVPService.statisticBillingOfPaymentByAdmin(body.us_id, body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.listStatisticBillingOfPayment = result.items;
		}
	}
	@action
	public statisticBillingOf24h = async (body:SearchInputUser) => {
		this.listBlillingOf24h = [];
		let result = await this.statisticStorageMVPService.statisticBillingOf24h(body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.listBlillingOf24h = result.items;
		}
	}
	@action
	public statisticBillingOf24hByAdmin = async (body: SearchInputAdmin) => {
		this.listBlillingOf24h = [];
		let result = await this.statisticStorageMVPService.statisticBillingOf24hByAdmin(body.us_id, body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.listBlillingOf24h = result.items;
		}
	}
	@action
	public statisticBillingOfProduct = async (body:SearchInputUser) => {
		this.listBillingOfDrinkProduct = [];
		this.listBillingOfFreshProduct = [];
		let result = await this.statisticStorageMVPService.statisticBillingOfProduct(body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort);
		if (result != undefined && result.items != undefined && result.items != null) {
			result.items.map(item => {
				if (item.key?.includes("Do_dong_chai")) {
					this.listBillingOfDrinkProduct.push(item);
				}
				if (item.key?.includes("Do_tuoi")) {
					this.listBillingOfFreshProduct.push(item);
				}
			})
		}
	}
	@action
	public statisticBillingOfProductbyAdmin = async (body: SearchInputAdmin) => {
		this.listBillingOfDrinkProduct = [];
		this.listBillingOfFreshProduct = [];
		let result = await this.statisticStorageMVPService.statisticBillingOfProductByAdmin(body.us_id, body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort);
		if (result != undefined && result.items != undefined && result.items != null) {
			result.items.map(item => {
				if (item.key?.includes("Do_dong_chai")) {
					this.listBillingOfDrinkProduct.push(item);
				}
				if (item.key?.includes("Do_tuoi")) {
					this.listBillingOfFreshProduct.push(item);
				}
			})
		}
	}
	@action
	public statisticOfPriceUnit = async (body: SearchPriceUnitInput ) => {
		this.listStatisticOfPriceUnit = [];
		let result = await this.statisticStorageMVPService.statisticOfPriceUnit(body.low_price,body.high_price,body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.listStatisticOfPriceUnit = result.items;
		}
	}
	@action
	public statisticOfPriceUnitbyAdmin = async (body: SearchPriceUnitInputAdmin) => {
		this.listStatisticOfPriceUnit = [];
		let result = await this.statisticStorageMVPService.statisticOfPriceUnitByAdmin(body.us_id,body.low_price,body.high_price,body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.listStatisticOfPriceUnit = result.items;
		}
	}
	@action
	public statisticOfDrinkType = async (body:SearchInputUser) => {
		this.liststatisticOfDrinkType = [];
		let result = await this.statisticStorageMVPService.statisticOfDrinkType(body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.liststatisticOfDrinkType = result.items;
		}
	}
	@action
	public statisticOfDrinkTypebyAdmin = async (body: SearchInputAdmin) => {
		this.liststatisticOfDrinkType = [];
		let result = await this.statisticStorageMVPService.statisticOfDrinkTypeByAdmin(body.us_id, body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.liststatisticOfDrinkType = result.items;
		}
	}
	@action
	public statisticBillingOfProductWithMachine = async (body: SearchBillingOfProductWithMachine) => {
		this.listBillingOfProductWithMachine = [];
		let result = await this.statisticStorageMVPService.statisticBillingOfProductWithMachine(body.product_key,body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.listBillingOfProductWithMachine = result.items;
		}
	}
	@action
	public statisticBillingOfProductWithMachinebyAdmin = async (body: SearchBillingOfProductWithMachineAdmin) => {
		this.listBillingOfProductWithMachine = [];
		let result = await this.statisticStorageMVPService.statisticBillingOfProductWithMachineByAdmin(body.us_id,body.product_key,body.start_date, body.end_date, body.gr_ma_id, body.ma_id_list, body.fieldSort, body.sort);
		if (result != undefined && result.items != undefined && result.items != null) {
			this.listBillingOfProductWithMachine = result.items;
		}
	}

	@action
	public statisticBillingOfQuyTieuDungXanh = async () => {
		let result = await this.statisticStorageMVPService.statisticBillingOfQuyTieuDungXanh();
		return result['result'];
	}
}


export default StatisticStore;