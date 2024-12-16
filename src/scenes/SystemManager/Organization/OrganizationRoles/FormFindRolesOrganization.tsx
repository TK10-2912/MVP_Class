import * as React from 'react';
import { Button, Card, Checkbox, Col, Input, Row, message } from 'antd';
import { SaveOutlined, SearchOutlined, } from "@ant-design/icons";
import { stores } from '@src/stores/storeInitializer';
import { FindOrganizationUnitRolesInput, NameValueDto, OrganizationUnitDto, RolesToOrganizationUnitInput } from '@src/services/services_autogen';
import { L } from '@src/lib/abpUtility';

export interface IProps {
    organizationUnitDto: OrganizationUnitDto,
    organizationSuccess: () => void;
    onCancel: () => void
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
            message.success(L("ban_da_them_vai_tro"))
            if (!!this.props.organizationSuccess) {
                this.props.organizationSuccess();
            }
            this.props.onCancel()

        }
        else {
            message.warning(L("ban_hay_chon_truoc_khi_luu"))
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
        return (
            <>
                <Card>
                    <Col>
                        <Input onChange={(e) => this.setState({ filter: e.target.value })} placeholder={L("nhap_tim_kiem" )} style={{ width: '92%' }} />
                        <Button onClick={() => this.findRolesOrganizationUnit(this.state.filter)} type='primary'><SearchOutlined /></Button>
                        <Checkbox indeterminate={this.state.indeterminate} checked={this.state.checkAll} onChange={this.onCheckAllChange}>
                            {L("chon_tat_ca" )} 
                        </Checkbox>
                        <Row>
                            {this.state.isLoadDone == true &&
                                <Checkbox.Group value={this.state.checkedList} onChange={this.onChangeColumn}>
                                    {this.listRoles.map((item, index) =>
                                        <Row key={"itemRole_key_" + index}>

                                            <Checkbox key={'key_' + index} onChange={(x) => this.handleCheck(x.target.value)}
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
                            <Button type='primary' onClick={() => this.addRolesToOrganizationUnit()} style={{ marginLeft: '15px' }}><SaveOutlined style={{ color: 'blue' }} />{L("luu_thong_tin" )} </Button>
                        </Row>
                    </Col>

                </Card>
            </>
        )
    }
}								