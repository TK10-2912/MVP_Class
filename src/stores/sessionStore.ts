
import http from '@services/httpService';
import {
	AttachmentItem,
	GetCurrentLoginInformationsOutput,
	GroupMachineAbstractDto, GroupTrashbinAbstractDto, LayoutDto, MachineAbstractDto, ProductAbstractDto, ProductInRepositoryAbtractDto, SessionService, SupplierAbstractDto, UserDto, UserLoginInfoDto
} from '@src/services/services_autogen';
import { action, observable } from 'mobx';
import { stores } from './storeInitializer';
import { DataNode } from 'antd/lib/tree';
import { ListProductHandOver } from '@src/scenes/GeneralManager/Handover/ReceiveMachine/components/HandoverDetail/CreateHandover';

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
	getTenant(): boolean {
		if (this.currentLogin?.tenant) {
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
	getNameUserLogin = () => {
		if (this.isUserLogin()) {
			return this.currentLogin.user!.name;
		}
		else return "Người dùng không tồn tại"
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
	getAllProductInRepository = (us_id: number | undefined, re_id?: number | undefined): ListProductHandOver[] => {
		if (this.currentLogin !== undefined && this.currentLogin.productInRepositorys !== undefined && us_id != undefined && us_id > 0 && re_id) {
			let listProductHandOver: ListProductHandOver[] = [];
			let list = this.currentLogin.productInRepositorys.filter(item => item.us_id == us_id && item.re_id == re_id);
			list.map(item => {
				let x = new ListProductHandOver(item.pr_id, item.pr_name, item.pr_quantity, item.fi_id, item.pr_quantity, item.pr_unit);
				listProductHandOver.push(x);
			})
			return listProductHandOver;
		}
		else if (us_id! < -1) {
			let listProductHandOver: ListProductHandOver[] = [];
			let list = this.currentLogin.productInRepositorys!;
			list.map(item => {
				let x = new ListProductHandOver(item.pr_id, item.pr_name, item.pr_quantity, item.fi_id, item.pr_quantity, item.pr_unit);
				listProductHandOver.push(x);
			})
			return listProductHandOver;
		}
		return [];
	}


	getAllMachines = (): MachineAbstractDto[] => {
		if (this.currentLogin !== undefined && this.currentLogin.machines !== undefined) {
			return this.currentLogin.machines.filter(item => item.ma_is_deleted == false);
		}
		return [];
	}

	getAllGroupTrashBin = (): GroupTrashbinAbstractDto[] => {
		if (this.currentLogin !== undefined && this.currentLogin.groupTrashbins !== undefined) {
			return this.currentLogin.groupTrashbins.filter(item => item.gr_tr_is_deleted == false);
		}
		return [];
	}
	getMachineUseMaId = (id: number): MachineAbstractDto => {
		if (this.currentLogin !== undefined && this.currentLogin.machines !== undefined) {
			const maSelected = this.currentLogin.machines.find(item => item.ma_id == id);
			if (maSelected != undefined && maSelected.ma_is_deleted == false) {
				return maSelected;
			}
		}
		return new MachineAbstractDto;
	}
	getMainVendingMachineUseMaId = (id: number) => {
		if (this.currentLogin !== undefined && this.currentLogin.machines !== undefined) {
			const maSelected = this.currentLogin.machines.find(item => item.ma_id == id);
			if (maSelected != undefined && maSelected.ma_is_deleted == false) {
				return maSelected.ma_commandVending;
			}
		}
		return -1;
	}
	getMainRefillMachineUseMaId = (id: number) => {
		if (this.currentLogin !== undefined && this.currentLogin.machines !== undefined) {
			const maSelected = this.currentLogin.machines.find(item => item.ma_id == id);
			if (maSelected != undefined && maSelected.ma_is_deleted == false) {
				return maSelected.ma_commandRefill;
			}
		}
		return -1;
	}
	getAllMachinesHasListID = (listMaId: number[]): MachineAbstractDto[] => {
		if (this.currentLogin !== undefined && this.currentLogin.machines !== undefined) {
			return this.currentLogin.machines.filter(item => listMaId.includes(item.ma_id));
		}
		return [];
	}

	getAllTreeMachinesWithGroupMachine = (id: number | undefined): DataNode[] => {
		if (this.currentLogin !== undefined && this.currentLogin.machines !== undefined && id != undefined) {
			let machineListResult = this.currentLogin.machines.filter(item => item.us_id_operator === id && item.ma_is_deleted === false);
			const gr_ma_tree = Array.from(new Set(machineListResult.map(item => item.gr_ma_id)));
			const treeMachineHandover: DataNode[] = gr_ma_tree.map(item => {
				const groupMachine = machineListResult.filter(i => i.gr_ma_id === item);
				const children = groupMachine.map(machine => ({
					title: machine.ma_code + "-" + machine.ma_display_name,
					key: machine.ma_id.toString()
				}));
				return {
					title: stores.sessionStore.getNameGroupMachines(groupMachine[0].gr_ma_id),
					key: `gr_id_${groupMachine[0].gr_ma_id}`,
					children: children
				};
			});
			return treeMachineHandover;
		}
		return [];
	}
	getAllTreeMachinesWithGroupMachineDetail = (id: number | undefined, ma_id_list: number[] | undefined): DataNode[] => {
		if (this.currentLogin !== undefined && this.currentLogin.machines !== undefined && id != undefined && ma_id_list) {
			let machineListResult = this.currentLogin.machines.filter(item => item.us_id_operator == id && ma_id_list.includes(item.ma_id));
			const gr_ma_tree = Array.from(new Set(machineListResult.map(item => item.gr_ma_id)));
			const treeMachineHandover: DataNode[] = gr_ma_tree.map(item => {
				const groupMachine = machineListResult.filter(i => i.gr_ma_id === item);
				const children = groupMachine.map(machine => ({
					title: machine.ma_display_name + "-" + machine.ma_code,
					key: machine.ma_id.toString()
				}));
				return {
					title: stores.sessionStore.getNameGroupMachines(groupMachine[0].gr_ma_id),

					key: `gr_id_${groupMachine[0].gr_ma_id}`,
					children: children
				};
			});
			return treeMachineHandover;
		}
		return [];
	}

	getAllTreeMachinesWithGroupMachinebyUser = (ma_id_list: number[]): DataNode[] => {
		if (this.currentLogin !== undefined && this.currentLogin.machines !== undefined) {
			let machineListResult = this.currentLogin.machines.filter(item => !item.ma_is_deleted);

			const gr_ma_tree = Array.from(new Set(machineListResult.map(item => item.gr_ma_id)));
			if (gr_ma_tree.length === 0) {
				return [];
			}
			const treeMachineHandover: DataNode[] = gr_ma_tree.reduce((acc, item) => {
				const groupMachine = machineListResult.filter(i => i.gr_ma_id === item);
				const children = groupMachine.map(machine => ({
					title: machine.ma_code + "-" + machine.ma_display_name + "-" + this.getUserNameById(machine.us_id_operator),
					key: machine.ma_id.toString()
				}));
				if (children.length > 0) {
					acc.push({
						title: stores.sessionStore.getNameGroupMachines(groupMachine[0].gr_ma_id),
						key: `gr_id_${groupMachine[0].gr_ma_id}`,
						children: children
					});
				}
				return acc;
			}, [] as DataNode[]);
			return treeMachineHandover;
		}
		return [];
	}
	getAllLayout = (): LayoutDto[] => {
		if (this.currentLogin !== undefined && this.currentLogin.layouts !== undefined) {
			return this.currentLogin.layouts.filter(item => item.la_is_deleted == false);
		}
		return [];
	}
	getAllGroupMachines = (): GroupMachineAbstractDto[] => {
		if (this.currentLogin !== undefined && this.currentLogin.groupMachines !== undefined) {
			return this.currentLogin.groupMachines;
		}
		return [];
	}
	getAllGroupMachinesHasId = (listGrId: number[]): GroupMachineAbstractDto[] => {
		if (this.currentLogin !== undefined && this.currentLogin.groupMachines !== undefined) {
			return this.currentLogin.groupMachines.filter(item => listGrId.includes(item.gr_ma_id));
		}
		return [];
	}
	getNameGroupMachines = (id: number) => {
		const groupMachineListResult = this.getAllGroupMachines();
		let selected_item = groupMachineListResult.find((item: GroupMachineAbstractDto) => item.gr_ma_id == id);
		if (selected_item === undefined || selected_item.gr_ma_area === undefined) {
			return "";
		} else {
			if (selected_item.gr_ma_is_deleted == true) {
				return "";
			}
			return selected_item.gr_ma_area;
		}
	}
	displayGroupMachineDisplayTable = (id: number) => {
		const groupMachineListResult = this.getAllGroupMachines();
		let selected_item = groupMachineListResult.find((item: GroupMachineAbstractDto) => item.gr_ma_id == id);
		if (selected_item === undefined || selected_item.gr_ma_area === undefined) {
			return "";
		} else {
			if (selected_item.gr_ma_is_deleted == true) {
				return "";
			}
			return selected_item.gr_ma_area;
		}
	}
	getBiCodeMachine = (bi_code: string) => {
		const { billListResult } = stores.billingStore;
		const billSelect = billListResult.find(item => item.bi_code == bi_code)
		let selected_item = billSelect != undefined ? this.currentLogin.machines!.find((item: MachineAbstractDto) => item.ma_id == billSelect.ma_id) : undefined;
		if (selected_item === undefined) {
			return "";
		} else {
			if (selected_item.ma_is_deleted == true) {
				return "";
			}
			return selected_item.ma_code;
		}
	}
	getIdMachine = (ma_code: string) => {
		let selected_item = ma_code != undefined ? this.currentLogin.machines!.find((item: MachineAbstractDto) => item.ma_code == ma_code) : undefined;
		if (selected_item === undefined) {
			return "";
		} else {
			if (selected_item.ma_is_deleted == true) {
				return "";
			}
			return selected_item.ma_id;
		}
	}

	getIdGroupUseName = (ma_gr_name: string) => {
		let selected_item = ma_gr_name != undefined ? this.currentLogin.groupMachines!.find((item: GroupMachineAbstractDto) => item.gr_ma_area == ma_gr_name) : undefined;
		if (selected_item === undefined) {
			return "";
		} else {
			if (selected_item.gr_ma_is_deleted == true) {
				return "";
			}
			return selected_item.gr_ma_id;
		}
	}
	getNameGroupUseMaId = (id: number) => {
		const machineListResult = this.getAllMachines();
		const groupMachineListResult = this.getAllGroupMachines();
		if (id != undefined && id > 0) {
			let machine_select = machineListResult.find((item: MachineAbstractDto) => item.ma_id == id);
			if (machine_select != undefined && machine_select) {
				let gr_machine = groupMachineListResult.find(item => item.gr_ma_id == machine_select?.gr_ma_id)
				if (gr_machine === undefined || gr_machine.gr_ma_area === undefined || gr_machine.gr_ma_area === "") {
					return "";
				} else {
					if (gr_machine.gr_ma_is_deleted == true) {
						return "";
					}
					return gr_machine.gr_ma_area;
				}
			}
		} else {
			return ""
		}

	}
	displayGroupMachineUseMaIdTable = (idMachine: number) => {
		const machineListResult = this.getAllMachines();
		const groupMachineListResult = this.getAllGroupMachines();
		if (idMachine != undefined && idMachine > 0) {
			let machine_select = machineListResult.find((item: MachineAbstractDto) => item.ma_id == idMachine);
			if (machine_select != undefined && machine_select) {
				let gr_machine = groupMachineListResult.find(item => item.gr_ma_id == machine_select?.gr_ma_id)
				if (gr_machine === undefined || gr_machine.gr_ma_area === undefined || gr_machine.gr_ma_area === "") {
					return "";
				} else {
					if (gr_machine.gr_ma_is_deleted == true) {
						return "";
					}
					return gr_machine.gr_ma_area;
				}
			}
		} else {
			return ""
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
		else return "";
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
				return "";
			} else {
				if (selected_item.gr_ma_is_deleted == true) {
					return "";
				}
				return selected_item.gr_ma_area
			}
		}
		return -1;
	}
	getNameGroupMachinesbyName = (name: string | undefined) => {
		const groupMachineListResult = this.getAllGroupMachines();
		let selected_item = groupMachineListResult.find((item: GroupMachineAbstractDto) => item.gr_ma_area == name);
		if (selected_item === undefined || selected_item.gr_ma_area === undefined) {
			return "";
		} else {
			if (selected_item.gr_ma_is_deleted == true) {
				return "";
			}
			return selected_item.gr_ma_area;
		}
	}
	getNameGroupMachinesbyNameDisplayTable = (name: string | undefined) => {
		const groupMachineListResult = this.getAllGroupMachines();
		let selected_item = groupMachineListResult.find((item: GroupMachineAbstractDto) => item.gr_ma_area == name);
		if (selected_item === undefined || selected_item.gr_ma_area === undefined) {
			return "";
		} else {
			if (selected_item.gr_ma_is_deleted == true) {
				return "";
			}
			return selected_item.gr_ma_area;
		}
	}
	getNameGroupMachinesReportStatistic = (name: string | undefined) => {
		const groupMachineListResult = this.getAllGroupMachines();
		if (!!name) {
			let selected_item = groupMachineListResult.find((item: GroupMachineAbstractDto) => item.gr_ma_area == name);
			if (selected_item === undefined || selected_item.gr_ma_area === undefined) {
				return "";
			} else {
				if (selected_item.gr_ma_is_deleted == true) {
					return "";
				}
				return selected_item.gr_ma_area
			}
		}
		return "";
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
			return "";
		} else {
			if (selected_item.ma_is_deleted == true) {
				return "";
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
		return "";
	}
	getIdByUserName = (id: string): number => {
		const users = this.getAllUsers();
		let selected_item = users.find((item: UserDto) => item.name == id);
		if (selected_item !== undefined) {
			return selected_item.id;
		}
		return -1;
	}
	getImageProduct = (pr_code: string) => {
		const products = this.getAllProduct();
		let selected_item = products.find((item: ProductAbstractDto) => item.pr_name == pr_code);
		if (selected_item === undefined || selected_item.pr_name === undefined) {
			return new AttachmentItem()
		}
		else {
			return selected_item.fi_id;
		}
	}
	getIdProductUseName = (pr_name: string) => {
		const products = this.getAllProduct();
		let selected_item = products.find((item: ProductAbstractDto) => item.pr_name == pr_name);
		if (selected_item === undefined || selected_item.pr_name === undefined) {
			return -1;
		}
		else {
			return selected_item.pr_id;
		}
	}
	getMD5ProductUseName = (pr_name: string) => {
		const products = this.getAllProduct();
		let selected_item = products.find((item: ProductAbstractDto) => item.pr_name == pr_name);
		if (selected_item === undefined || selected_item.pr_name === undefined) {
			return "";
		}
		else {
			return selected_item.fi_id.md5!;
		}
	}
	getImageProductByID = (id: number) => {
		const users = this.getAllProduct();
		let selected_item = users.find((item: ProductAbstractDto) => item.pr_id == id);
		if (selected_item === undefined || selected_item.fi_id === undefined) {
			return new AttachmentItem();
		}
		else {
			return selected_item.fi_id;
		}
	}
	getUnitProductByID = (id: number) => {
		const users = this.getAllProduct();
		let selected_item = users.find((item: ProductAbstractDto) => item.pr_id == id);
		if (selected_item === undefined || selected_item.fi_id === undefined) {
			return "";
		}
		else {
			return selected_item.pr_unit;
		}
	}
	//*Product
	getCodeProductUseName = (pr_name: string) => {
		const products = this.getAllProduct();
		let selected_item = products.find((item: ProductAbstractDto) => item.pr_name == pr_name);
		if (selected_item === undefined || selected_item.pr_name === undefined) {
			return "";
		}
		else {
			return selected_item.pr_code;
		}
	}
	getNameProduct = (id: number): string => {
		const products = this.getAllProduct();
		let selected_item = products.find((item: ProductAbstractDto) => item.pr_id == id);
		if (selected_item !== undefined && selected_item.pr_name !== undefined && selected_item.pr_is_deleted == false) {
			return selected_item.pr_name;
		}
		else {
			return "";

		}
	}
	getNameProductInRepository = (id: number): string => {
		const users = this.getAllRepository();
		let selected_item = users.find((item: ProductInRepositoryAbtractDto) => item.re_de_id == id);
		if (selected_item === undefined || selected_item.pr_name === undefined) {
			return "";
		}
		else {
			return selected_item.pr_name;
		}
	}

	getNameSupplier = (id: number) => {
		if (id < 0) {
			return "";
		}
		else if (id == 0) {
			return ""
		}
		let selected_item = this.currentLogin.suppliers!.filter(item => item.su_is_deleted == false).find((item: SupplierAbstractDto) => item.su_id == id);
		if (selected_item === undefined || selected_item.su_name === undefined) {
			return "";
		} else {
			if (selected_item.su_is_active == true) {
				return selected_item.su_name;
			}
			else return ""
		}
	}
	getIDSupplierUseName = (name: string) => {
		let selected_item = this.currentLogin.suppliers!.filter(item => item.su_is_deleted == false && item.su_is_active == true).find((item: SupplierAbstractDto) => item.su_name?.toLowerCase() == name.toString().toLowerCase());

		if (selected_item === undefined || selected_item.su_name === undefined) {
			return -1;
		} else {
			return selected_item.su_id;
		}
	}
	getMachineCode = (id: number) => {
		const machineListResult = this.getAllMachines();
		let selected_item = machineListResult.filter(item => item.ma_is_deleted == false).find((item: MachineAbstractDto) => item.ma_id == id);
		if (selected_item === undefined || selected_item.ma_display_name === undefined) {
			return "";
		} else {
			return selected_item.ma_code;
		}
	}
	getCodeProductByID = (id: number) => {
		const products = this.getAllProduct();
		let selected_item = products.filter(item => item.pr_is_deleted == false).find((item: ProductAbstractDto) => item.pr_id == id);
		if (selected_item === undefined) {
			return "";
		} else {
			return selected_item.pr_code;
		}
	}
	getNameGroupTrashBin = (id: number) => {
		const trashBinListReslt = this.getAllGroupTrashBin();
		let selected_item = trashBinListReslt.filter(item => item.gr_tr_is_deleted == false).find((item: GroupTrashbinAbstractDto) => item.gr_tr_id == id);
		if (selected_item === undefined || selected_item.gr_tr_name === undefined) {
			return "";
		} else {
			return selected_item.gr_tr_name;
		}
	}
	getAllMachineIdByGroupMachineId = (id: number): number[] => {
		const machines = this.getAllMachines();
		let selected_item = machines.filter(item => item.gr_ma_id == id).map(a => a.ma_id);
		if (selected_item === undefined) {
			return [];
		} else {
			return selected_item;
		}
	}
}

export default SessionStore;
