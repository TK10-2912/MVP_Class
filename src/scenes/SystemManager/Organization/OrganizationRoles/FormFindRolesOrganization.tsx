import * as React from 'react';
import { Button, Card, Checkbox, Col, Input, Row, message } from 'antd';
import { SaveOutlined, SearchOutlined, } from "@ant-design/icons";
import { stores } from '@src/stores/storeInitializer';
import { FindOrganizationUnitRolesInput, NameValueDto, OrganizationUnitDto, OrganizationUnitRoleListDto, RolesToOrganizationUnitInput } from '@src/services/services_autogen';
import { L } from '@src/lib/abpUtility';

export interface IProps {
    organizationUnitDto: OrganizationUnitDto,
    organizationSuccess: () => void;
    onCancel: () => void
    listRoleSelected: OrganizationUnitRoleListDto[];
}


export default class FormFindRolesOrganization extends React.Component<IProps>{
    state = {
        isLoadDone: false,
        filter: '',
        indeterminate: false,
        checkAll: false,
        checkedList: [],
        checkItem: undefined,
        totalMemberCount: undefined
    }
    totalRoles: number = 0;
    listRoles: NameValueDto[] = [];
    checkBoxRoles: number[] = [];
    componentDidMount(): void {
        this.findRolesOrganizationUnit("");
    }



    async findRolesOrganizationUnit(filter: string) {
        let itemData = new FindOrganizationUnitRolesInput();
        itemData.skipCount = 0;
        itemData.maxResultCount = 1000;
        itemData.organizationUnitId = this.props.organizationUnitDto.id;
        itemData.filter = filter;
        let result = await stores.organizationStore.findRolesOrganizationUnit(itemData)
        if (result !== undefined) {
            this.totalRoles = result.totalCount;
            this.listRoles = result.items!;
        }
        this.setState({ isLoadDone: true })
    }
    onCheckAllChange = e => {
        this.setState({
            checkedList: e.target.checked == true ? this.listRoles.map(a => a.value) : [],
            indeterminate: false,
            checkAll: e.target.checked,
        });
    }

    addRolesToOrganizationUnit = async () => {
        let value: RolesToOrganizationUnitInput = new RolesToOrganizationUnitInput();
        value.roleIds = this.state.checkedList;
        value.organizationUnitId = this.props.organizationUnitDto.id;
        await stores.organizationStore.addRolesToOrganizationUnitInput(value);
        if (Array.isArray(value.roleIds) && value.roleIds.length > 0) {
            message.success(L("Bạn đã thêm vai trò"))
            if (!!this.props.organizationSuccess) {
                this.props.organizationSuccess();
            }
            this.props.onCancel()

        }
        else {
            message.warning(L("Bạn hãy chọn trước khi lưu"))
        }

    }
    handleCheck = (value: string) => {
        if (value !== undefined) {
            const newValue = Number(value);
            if (this.checkBoxRoles.includes(newValue)) {
                this.checkBoxRoles.splice(this.checkBoxRoles.indexOf(newValue), 1);
            } else {
                this.checkBoxRoles.push(newValue);
            }
        }
    }
    onCancel = () => {
        if (!!this.props.onCancel) {
            this.props.onCancel();
        }
    }
    onChangeColumn = async (checkedList) => {
        await this.setState({
            checkedList: checkedList,
            indeterminate: !!checkedList.length && checkedList.length < this.listRoles.length,
            checkAll: checkedList.length === this.listRoles.length,
        });
    };

    render() {
        const { listRoleSelected } = this.props;
        return (
            <>
                <Card>
                    <Col>
                        <Input onChange={async (e) => { this.setState({ filter: e.target.value }); this.findRolesOrganizationUnit(this.state.filter) }} onPressEnter={() => this.findRolesOrganizationUnit(this.state.filter)} placeholder={L("Nhập tìm kiếm")} style={{ width: '92%' }} />
                        <Button onClick={() => this.findRolesOrganizationUnit(this.state.filter)} type='primary'><SearchOutlined /></Button>
                        {(!this.state.filter || this.state.filter.length == 0) && this.listRoles.length > 0 &&
                            <Checkbox key={"checkall_roles"} indeterminate={this.state.indeterminate} checked={this.state.checkAll} onChange={this.onCheckAllChange}>
                                {L("Chọn tất cả")}
                            </Checkbox>
                        }
                        {(!!listRoleSelected && listRoleSelected.length > 0) && listRoleSelected.map((item, index) =>
                            <Row key={'role_key_row_' + index}>
                                <Checkbox key={'role_key_selected_' + index} checked disabled
                                    value={item.id}
                                >
                                    {item.displayName}
                                </Checkbox>
                            </Row>
                        )}
                        <Row>

                            {this.state.isLoadDone == true &&
                                <Checkbox.Group value={this.state.checkedList} onChange={this.onChangeColumn}>
                                    {this.listRoles.map((item, index) =>
                                        <Row key={"row_key_" + index}>

                                            <Checkbox key={'role_key_' + index} onChange={(x) => this.handleCheck(x.target.value)} checked
                                                value={item.value}
                                            >
                                                {item.name}
                                            </Checkbox>
                                        </Row>
                                    )}
                                </Checkbox.Group>
                            }
                        </Row>
                        <Row style={{ display: 'flex', justifyContent: 'flex-end', margin: '15px 0' }}>
                            <Button type='primary' onClick={() => this.addRolesToOrganizationUnit()} style={{ marginLeft: '15px' }}><SaveOutlined style={{ color: 'blue' }} />{L("Lưu thông tin")} </Button>
                        </Row>
                    </Col>

                </Card >
            </>
        )
    }
}								