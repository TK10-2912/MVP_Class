import http from '@services/httpService';
import { CreateExportRepositoryInput, CreateImportRepositoryInput, RepositoryDto, ImportRepositoryDto, RepositoryService, CreateRepositoryInput, ERepositoryProductStatus, SORT, UpdateRepositoryInput } from '@services/services_autogen';
import { DataNode } from 'antd/lib/tree';
import { action, observable } from 'mobx';
export class TreeRepositoryDto extends RepositoryDto {
	key: number;
	title: string;
	value: number;
	children: TreeRepositoryDto[] = [];
	nrchildren = () => {
		let total = this.children.length;
		this.children.forEach(element => {
			total += element.nrchildren();
		});
		return total;
	}
	constructor(data?: RepositoryDto) {
		super(data);
		this.key = this.re_id;
		this.title = this.re_name!;
		this.value = this.key!;
	}

}
export class RepositoryStore {
	private repositoryService: RepositoryService;

	@observable totalReponsitory: number = 0;
	@observable repositoryListResult: RepositoryDto[] = [];
	@observable treeRepositoryDto: TreeRepositoryDto = new TreeRepositoryDto(new RepositoryDto());

	constructor() {
		this.repositoryService = new RepositoryService("", http);
	}

	@action
	public getAll = async (skipCount: number | undefined, maxResultCount: number | undefined,) => {
		this.repositoryListResult = [];
		let result = await this.repositoryService.getAll(skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalReponsitory = result.totalCount;
			this.repositoryListResult = result.items;
			this.treeRepositoryDto = this.makeTree(this.repositoryListResult);
		}
	}
	@action
	private makeTree(list: RepositoryDto[]) {
		let itemParent = list.find(item => item.re_parent_id == -1);
		let organizationParent = new TreeRepositoryDto(itemParent);
		this.createCatTree(organizationParent, list);
		return organizationParent;
	}

	private createCatTree(organizationParent: TreeRepositoryDto, list: RepositoryDto[]) {
		if (organizationParent === undefined) {
			return;
		}
		let listChild = list.filter(item => item.re_parent_id == organizationParent.re_id);
		let sortedListChild = listChild.sort((a, b) => a.re_id - b.re_id);
		for (let i = 0; i < sortedListChild.length; i += 1) {
			let item = listChild[i];
			let roots: TreeRepositoryDto = new TreeRepositoryDto(item);
			this.createCatTree(roots, list);
			organizationParent.children.push(roots);
		}
	}
	@action
	public createRepository = async (body: CreateRepositoryInput) => {
		let result = await this.repositoryService.createRepository(body);
		if (result == true) {
			return true;
		}
		else return false;
	}
	@action
	public deleteRepository = async (id: number) => {
		await this.repositoryService.delete(id);
	}
	@action
	public updateRepository = async (body: UpdateRepositoryInput) => {
		let result = await this.repositoryService.updateRepository(body);
		if (result == true) {
			return true;
		}
		else return false;
	}
	@action
	public getAllByAdmin = async (us_id_operator_list: number[] | undefined, fieldSort: string | undefined, sort: SORT | undefined, skipCount: number | undefined, maxResultCount: number | undefined,) => {
		this.repositoryListResult = [];
		let result = await this.repositoryService.getAllByAdmin(us_id_operator_list, fieldSort, sort, skipCount, maxResultCount);
		if (result != undefined && result.items != undefined && result.items != null && result.totalCount != undefined && result.totalCount != null) {
			this.totalReponsitory = result.totalCount;
			this.repositoryListResult = result.items;
			this.treeRepositoryDto = this.makeTree(this.repositoryListResult);
		}
	}
}


export default RepositoryStore;