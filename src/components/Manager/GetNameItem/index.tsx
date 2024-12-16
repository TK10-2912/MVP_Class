import { stores } from '@src/stores/storeInitializer';
import { DiscountCodeDto } from '@src/services/services_autogen';

export default class GetNameItem {
	static getNameDiscountCode = (id: number) => {
		const { discountCodeListResult } = stores.discountCodeStore;
		let selected_item = discountCodeListResult.find((item: DiscountCodeDto) => item.di_id == id);
		if (selected_item === undefined || selected_item.di_code === undefined) {
			return "";
		}
		else {
			return selected_item.di_code;
		}
	}
}





