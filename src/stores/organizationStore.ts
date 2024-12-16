import { action, observable } from 'mobx';
import http from '@services/httpService';

import {
    OrganizationUnitDto, 
    OrganizationUnitService, 
    CreateOrganizationUnitInput, 
    UpdateOrganizationUnitInput, 
    IOrganizationUnitDto,
    FindOrganizationUnitUsersInput,
    UsersToOrganizationUnitInput,
    RolesToOrganizationUnitInput,
    MoveOrganizationUnitInput
} from '@services/services_autogen';
import { FindOrganizationUnitRolesInput } from '@services/services_autogen';
export class TreeOrganizationDto extends OrganizationUnitDto {
    key: number;
    title: string;

    value: number;
    children: TreeOrganizationDto[] = [];
    nrchildren = () => {
        let total = this.children.length;
        this.children.forEach(element => {
            total += element.nrchildren();
        });
        return total;
    }
    constructor(data?: IOrganizationUnitDto) {
        super(data);
        this.key = this.id;
        this.title = this.displayName!;
        this.value = this.key!;
    }

}
class OrganizationStore {

    private organizationUnitService: OrganizationUnitService
    @observable totalOrganization: number = 0;
    @observable organizationListResult: OrganizationUnitDto[] = [];

    @observable treeOrganizationDto: TreeOrganizationDto = new TreeOrganizationDto(new OrganizationUnitDto());
    constructor() {
        this.organizationUnitService = new OrganizationUnitService("", http);
    }

    // ----------------------------------------------Organization------------------------------------------------------
    @action
    public createOragnizationUnit = async (input: CreateOrganizationUnitInput) => {
        if (!input) {
            return Promise.resolve<OrganizationUnitDto>(<any>null);
        }
        let res = await this.organizationUnitService.createOrganizationUnit(input);
        if (res && res.parentId) {
            this.organizationListResult.push(res);

            return res;
        }
        return Promise.resolve<OrganizationUnitDto>(<any>null);
    }

    @action
    async updateOrganizationUnit(input: UpdateOrganizationUnitInput) {
        if (!input || !input.id) {
            return Promise.resolve<OrganizationUnitDto>(<any>null);
        }
        let res = await this.organizationUnitService.updateOrganizationUnit(input);
        if (!!res) {
            this.organizationListResult = this.organizationListResult.map((item) => {
                if (item.id == res.id) {
                    item = res;
                }
                return item;
            });
            this.treeOrganizationDto = this.makeTree(this.organizationListResult);

            return res;
        }
        return Promise.resolve<OrganizationUnitDto>(<any>null);
    }


    @action
    private makeTree(list: OrganizationUnitDto[]) {
        let itemParent = list.find(item => item.parentId == null);
        let organizationParent = new TreeOrganizationDto(itemParent);
        this.createCatTree(organizationParent, list);
        return organizationParent;
    }

    private createCatTree(organizationParent: TreeOrganizationDto, list: OrganizationUnitDto[]) {

        if (organizationParent === undefined) {
            return;
        }
        let listChild = list.filter(item => item.parentId == organizationParent.id);
        let sortedListChild = listChild.sort((a, b) => a.id - b.id);
        for (let i = 0; i < sortedListChild.length; i += 1) {
            let item = listChild[i];
            let roots: TreeOrganizationDto = new TreeOrganizationDto(item);
            this.createCatTree(roots, list);
            organizationParent.children.push(roots);
        }

    }
    @action
    public getAllOrganization = async () => {
        this.organizationListResult = []
        let result = await this.organizationUnitService.getOrganizationUnits();
        if (result != undefined && result.items != undefined && result.items != null && result.items.length > 0) {
            this.organizationListResult = [];
            for (let item of result.items) {
                this.organizationListResult.push(item);
            }
            this.treeOrganizationDto = this.makeTree(this.organizationListResult);
        }
    }
    @action
    public deleteOrganization = async (item: OrganizationUnitDto) => {
        await this.organizationUnitService.deleteOrganizationUnit(item.id);
    }
    @action
    public moveOrganizationUnit = async (item: MoveOrganizationUnitInput | undefined) => {

        await this.organizationListResult.splice(item!.id, 1);
        let result = await this.organizationUnitService.moveOrganizationUnit(item);
        if (result != undefined) {
            this.organizationListResult.push(result);
            this.treeOrganizationDto = this.makeTree(this.organizationListResult);
        }
    }
    // -------------------------------------User-------------------------------------------------------------------
    @action
    public addUsersToOrganizationUnitInput = async (input: UsersToOrganizationUnitInput) => {
        await this.organizationUnitService.addUsersToOrganizationUnit(input);
    }

    @action
    public getAllOrganizationUser = async (id: number, sorting: string | undefined, maxResultCount: number | undefined, skipCount: number | undefined) => {
        let result = await this.organizationUnitService.getOrganizationUnitUsers(id, sorting, maxResultCount, skipCount);

        return result;
    }
    @action
    public findUserOrganizationUnit = async (item: FindOrganizationUnitUsersInput) => {

        let result = await this.organizationUnitService.findUsers(item);

        return result;
    }
    @action
    public removeUserFromOrganizationUnit = async (userId: number | undefined, organizationUnitId: number | undefined) => {
        await this.organizationUnitService.removeUserFromOrganizationUnit(userId, organizationUnitId);
    }

    // ---------------------------------------Role-------------------------------------------
    @action
    @action
    public addRolesToOrganizationUnitInput = async (input: RolesToOrganizationUnitInput) => {
        await this.organizationUnitService.addRolesToOrganizationUnit(input);
    }
    @action
    public getOrganizationUnitRoles = async (id: number, sorting: string | undefined, maxResultCount: number | undefined, skipCount: number | undefined) => {
        let result = await this.organizationUnitService.getOrganizationUnitRoles(id, sorting, maxResultCount, skipCount);
        return result;
    }
    @action
    public findRolesOrganizationUnit = async (item: FindOrganizationUnitRolesInput) => {
        let result = await this.organizationUnitService.findRoles(item);
        return result;
    }
    @action
    public removeRoleFromOrganizationUnit = async (roleId: number | undefined, organizationUnitId: number | undefined) => {
        await this.organizationUnitService.removeRoleFromOrganizationUnit(roleId, organizationUnitId);
    }





}
export default OrganizationStore;