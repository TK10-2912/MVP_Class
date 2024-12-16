
import http from '@services/httpService';
import {
	AttachmentItem,
	GetCurrentLoginInformationsOutput,
	GroupMachineAbstractDto, MachineAbstractDto, ProductAbstractDto, ProductInRepositoryAbtractDto, SessionService, SupplierAbstractDto, UserDto, UserLoginInfoDto
} from '@src/services/services_autogen';
import { action, observable } from 'mobx';
import { stores } from './storeInitializer';

class SessionStore {
	private sessionService: SessionService;
	@observable currentLogin: GetCurrentLoginInformationsOutput = new GetCurrentLoginInformationsOutput();

	constructor() {
		this.sessionService = new SessionService("", http);
	}
	@action
	async getCurrentLoginInformations() {
		let result = await this.sessionService.getCurrentLoginInformations();
		this.currentLogin = result;
	}

	isUserLogin(): boolean {
		if (this.currentLogin !== undefined && this.currentLogin.user !== undefined) {
			return true;
		}
		return false;
	}
	getUserLogin(): UserLoginInfoDto {
		if (this.isUserLogin()) {
			return this.currentLogin.user!;
		}
		return <any>undefined;
	}

	getAllUsers = (): UserDto[] => {
		if (this.currentLogin !== undefined && this.currentLogin.users !== undefined) {
			return this.currentLogin.users!;
		}
		return [];
	}
	getAllRepository = (): ProductInRepositoryAbtractDto[] => {
		if (this.currentLogin !== undefined && this.currentLogin.productInRepositorys !== undefined) {
			return this.currentLogin.productInRepositorys!;
		}
		return [];
	}
	getAllProduct = (): ProductAbstractDto[] => {
		if (this.currentLogin !== undefined && this.currentLogin.products !== undefined) {
			return this.currentLogin.products.filter(item => item.pr_is_deleted == false);
		}
		return [];
	}

	getAllMachines = (): MachineAbstractDto[] => {
		if (this.currentLogin !== undefined && this.currentLogin.machines !== undefined) {
			return this.currentLogin.machines.filter(item => item.ma_is_deleted == false);
		}
		return [];
	}
	getAllGroupMachines = (): GroupMachineAbstractDto[] => {
		if (this.currentLogin !== undefined && this.currentLogin.groupMachines !== undefined) {
			return this.currentLogin.groupMachines;
		}
		return [];
	}
	getNameGroupMachines = (id: number) => {
		const groupMachineListResult = this.getAllGroupMachines();
		let selected_item = groupMachineListResult.find((item: GroupMachineAbstractDto) => item.gr_ma_id == id);
		if (selected_item === undefined || selected_item.gr_ma_area === undefined) {
			return "Không có nhóm máy";
		} else {
			if (selected_item.gr_ma_is_deleted == true) {
				return "Nhóm máy đã bị xóa";
			}
			return selected_item.gr_ma_area;
		}
	}
	getGroupMachineByMaId = (ma_id: number) => {
		let selected_item = ma_id != undefined ? this.currentLogin.machines!.find((item: MachineAbstractDto) => item.ma_id == ma_id) : undefined;
		if (selected_item === undefined) {
			return "Không có máy";
		} else {
			if (selected_item.ma_is_deleted == true) {
				return "Máy đã bị xóa";
			}
			else {
				this.getNameGroupMachines(selected_item.gr_ma_id);
			}
		}
	}
	getBiCodeMachine = (bi_code: string) => {
		const { billListResult } = stores.billingStore;
		const billSelect = billListResult.find(item => item.bi_code == bi_code)
		let selected_item = billSelect != undefined ? this.currentLogin.machines!.find((item: MachineAbstractDto) => item.ma_id == billSelect.ma_id) : undefined;
		if (selected_item === undefined) {
			return "Không có máy";
		} else {
			if (selected_item.ma_is_deleted == true) {
				return "Nhóm máy đã bị xóa";
			}
			return selected_item.ma_code;
		}
	}
	getIdMachine = (ma_code: string) => {
		let selected_item = ma_code != undefined ? this.currentLogin.machines!.find((item: MachineAbstractDto) => item.ma_code == ma_code) : undefined;
		if (selected_item === undefined) {
			return "Không có máy";
		} else {
			if (selected_item.ma_is_deleted == true) {
				return "Máy đã bị xóa";
			}
			return selected_item.ma_id;
		}
	}

	getIdGroupUseName = (ma_gr_name: string) => {
		let selected_item = ma_gr_name != undefined ? this.currentLogin.groupMachines!.find((item: GroupMachineAbstractDto) => item.gr_ma_area == ma_gr_name) : undefined;
		if (selected_item === undefined) {
			return "Không có máy";
		} else {
			if (selected_item.gr_ma_is_deleted == true) {
				return "Máy đã bị xóa";
			}
			return selected_item.gr_ma_id;
		}
	}
	getNameGroupUseMaId = (id: number) => {
		const machineListResult = this.getAllMachines();
		const groupMachineListResult = this.getAllGroupMachines();
		let machine_select = machineListResult.find((item: MachineAbstractDto) => item.ma_id == id);
		if (machine_select != undefined) {
			let gr_machine = groupMachineListResult.find(item => item.gr_ma_id == machine_select?.gr_ma_id)
			if (gr_machine === undefined || gr_machine.gr_ma_area === undefined) {
				return "Không có nhóm máy";
			} else {
				if (gr_machine.gr_ma_is_deleted == true) {
					return "Nhóm máy đã bị xóa";
				}
				return gr_machine.gr_ma_area;
			}
		}
	}
	getIDGroupUseName = (name: string) => {
		// const machineListResult = this.getAllMachines();
		const groupMachineListResult = this.getAllGroupMachines();
		let machine_select = groupMachineListResult.find((item: GroupMachineAbstractDto) => item.gr_ma_area == name);
		if (machine_select != undefined) {
			return machine_select.gr_ma_id
		}
		else return -1;
	}
	getMachineUseCode = (code: string) => {
		let machine_select = this.currentLogin.machines!.find((item: MachineAbstractDto) => item.ma_code == code);
		if (machine_select != undefined) {
			return machine_select.ma_display_name
		}
		else return "Không có thông tin máy";
	}
	getIDMachineUseName = (name: string) => {
		const machineListResult = this.getAllMachines();
		// const groupMachineListResult = this.getAllGroupMachines();
		let machine_select = machineListResult.find((item: MachineAbstractDto) => item.ma_code == name);
		if (machine_select != undefined) {
			return machine_select.ma_id
		}
		else return -1;
	}
	getIDGroupUseMaId = (id: number) => {
		const machineListResult = this.getAllMachines();
		const groupMachineListResult = this.getAllGroupMachines();
		let machine_select = machineListResult.find((item: MachineAbstractDto) => item.ma_id == id);
		if (machine_select != undefined) {
			let gr_machine = groupMachineListResult.find(item => item.gr_ma_id == machine_select?.gr_ma_id)
			if (gr_machine === undefined || gr_machine.gr_ma_area === undefined) {
				return -1;
			} else {
				if (gr_machine.gr_ma_is_deleted == true) {
					return -1;
				}
				return gr_machine.gr_ma_id;
			}
		}
	}
	getNameGroupMachinesStatistic = (name: string | undefined) => {
		const groupMachineListResult = this.getAllGroupMachines();
		if (!!name) {

			let selected_item = groupMachineListResult.find((item: GroupMachineAbstractDto) => item.gr_ma_area == name);
			if (selected_item === undefined || selected_item.gr_ma_area === undefined) {
				return "Không có nhóm máy";
			} else {
				if (selected_item.gr_ma_is_deleted == true) {
					return "Nhóm máy đã bị xóa";
				}
				return selected_item.gr_ma_area
			}
		}
		return "Không có nhóm máy";
	}
	getIdGroupMachinesStatistic = (name: string | undefined) => {
		const groupMachineListResult = this.getAllGroupMachines();
		if (!!name) {

			let selected_item = groupMachineListResult.find((item: GroupMachineAbstractDto) => item.gr_ma_area == name);
			if (selected_item === undefined || selected_item.gr_ma_area === undefined) {
				return -1;
			} else {
				if (selected_item.gr_ma_is_deleted == true) {
					return -1;
				}
				return selected_item.gr_ma_id
			}
		}
		return -1;
	}
	getNameMachines = (id: number) => {
		const machineListResult = this.getAllMachines();
		let selected_item = machineListResult.filter(item => item.ma_is_deleted == false).find((item: MachineAbstractDto) => item.ma_id == id);
		if (selected_item === undefined || selected_item.ma_display_name === undefined) {
			return "Máy bán nước đã bị di dời";
		} else {
			if (selected_item.ma_is_deleted == true) {
				return "Máy bán nước đã bị xóa";
			}
			return selected_item.ma_display_name;
		}
	}
	getNameMachinesMulti = (withdraw: number[]) => {
		const machineListResult = withdraw.filter(item => item != -1).map(item => this.getNameMachines(item));
		return machineListResult.join(", ");
	}
	//Getname nhiều phần tử
	getCodeMachines = (id: number) => {
		const machineListResult = this.getAllMachines();
		let selected_item = machineListResult.filter(item => item.ma_is_deleted == false).find((item: MachineAbstractDto) => item.ma_id == id);
		if (selected_item === undefined || selected_item.ma_code === undefined) {
			return "";
		} else {
			return selected_item.ma_code;
		}
	}

	getUserNameById = (id: number): string => {
		const users = this.getAllUsers();
		let selected_item = users.find((item: UserDto) => item.id == id);
		if (selected_item !== undefined) {
			return selected_item.name;
		}
		return "Không có người sở hữu";
	}
	getImageProduct = (pr_code : string)=>{
		const products = this.getAllProduct();
		let selected_item = products.find((item: ProductAbstractDto) => item.pr_code == pr_code);
		if (selected_item === undefined || selected_item.pr_name === undefined) {
			return new AttachmentItem()
		}
		else {
			return selected_item.fi_id;
		}
	}
	getCodeProductUseName = (pr_name: string)=>
	{
		const products = this.getAllProduct();
		let selected_item = products.find((item: ProductAbstractDto) => item.pr_name == pr_name);
		if (selected_item === undefined || selected_item.pr_name === undefined) {
			return "Không có mã sản phẩm";
		}
		else {
			return selected_item.pr_code;
		}
	}
	getNameProduct = (id: number): string => {
		const products = this.getAllProduct();
		let selected_item = products.find((item: ProductAbstractDto) => item.pr_id == id);
		if (selected_item === undefined || selected_item.pr_name === undefined) {
			return "";
		}
		else {
			return selected_item.pr_name;
		}
	}
	getNameProductInRepository = (id: number): string => {
		const users = this.getAllRepository();
		let selected_item = users.find((item: ProductInRepositoryAbtractDto) => item.re_id == id);
		if (selected_item === undefined || selected_item.pr_name === undefined) {
			return "";
		}
		else {
			return selected_item.pr_name;
		}
	}

	getNameSupplier = (id: number) => {
		if (id < 0) {
			return "Không có nhà cung cấp";
		}
		else if (id == 0) {
			return ""
		}
		let selected_item = this.currentLogin.suppliers!.filter(item => item.su_is_deleted == false).find((item: SupplierAbstractDto) => item.su_id == id);
		if (selected_item === undefined || selected_item.su_name === undefined) {
			return "Nhà cung cấp này đã bị xóa";
		} else {
			return selected_item.su_name;
		}
	}
	getMachineCode = (id: number) => {
		const machineListResult = this.getAllMachines();
		let selected_item = machineListResult.filter(item => item.ma_is_deleted == false).find((item: MachineAbstractDto) => item.ma_id == id);
		if (selected_item === undefined || selected_item.ma_display_name === undefined) {
			return "Máy bán nước đã bị di dời";
		} else {
			return selected_item.ma_code;
		}
	}
}

export default SessionStore;
