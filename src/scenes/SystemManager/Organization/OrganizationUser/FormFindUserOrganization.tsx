import { Button, Card, Checkbox, Col, Input, Row, message } from 'antd'
import * as React from 'react'
import { SaveOutlined, SearchOutlined, } from "@ant-design/icons";
import { stores } from '@src/stores/storeInitializer';
import { FindOrganizationUnitUsersInput, NameValueDto, OrganizationUnitDto, OrganizationUnitUserListDto, UsersToOrganizationUnitInput } from '@src/services/services_autogen';
import { L } from '@src/lib/abpUtility';

export interface IProps {
    organizationUnitDto: OrganizationUnitDto;
    organizationSuccess: () => void;
    onCancel: () => void;
    listUserSelected: OrganizationUnitUserListDto[];
}

export default class FormFindUserOrganization extends React.Component<IProps>{
    state = {
        isLoadDone: false,
        filter: '',
        checkedList: [],
        indeterminate: false,
        checkAll: false,
    }
    checkBoxUser: number[] = [];
    totalUserFound: number = 0;
    listUserFound: NameValueDto[] = [];
    componentDidMount(): void {
        this.findUserOrganizationUnit("");
    }

    async findUserOrganizationUnit(filter: string) {
        let itemData = new FindOrganizationUnitUsersInput();
        itemData.skipCount = 0;
        itemData.maxResultCount = 1000;
        itemData.organizationUnitId = this.props.organizationUnitDto.id;
        itemData.filter = filter;
        let result = await stores.organizationStore.findUserOrganizationUnit(itemData)
        if (result !== undefined) {
            this.totalUserFound = result.totalCount;
            this.listUserFound = result.items!;
        }
        this.setState({ isLoadDone: true })
    }

    addUserToOrganizationUnit = async () => {
        let value: UsersToOrganizationUnitInput = new UsersToOrganizationUnitInput();
        value.userIds = this.state.checkedList;
        value.organizationUnitId = this.props.organizationUnitDto.id;
        await stores.organizationStore.addUsersToOrganizationUnitInput(value);
        if (Array.isArray(value.userIds) && value.userIds.length > 0) {
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
            if (this.checkBoxUser.includes(newValue)) {
                this.checkBoxUser.splice(this.checkBoxUser.indexOf(newValue), 1);
            } else {
                this.checkBoxUser.push(newValue);
            }
        }
    }

    onChangeColumn = async (checkedList) => {
        await this.setState({
            checkedList: checkedList,
            indeterminate: !!checkedList.length && checkedList.length < this.listUserFound.length,
            checkAll: checkedList.length === this.listUserFound.length,
        });
    };
    onCheckAllChange = e => {

        this.setState({
            checkedList: e.target.checked == true ? this.listUserFound.map(a => a.value) : [],
            indeterminate: false,
            checkAll: e.target.checked,
        });
    };
    onCancel = () => {
        if (!!this.props.onCancel) {
            this.props.onCancel();
        }
    }

    render() {
        const { listUserSelected } = this.props;
        
        return (
            <Card>
                <Col>
                    <Input onChange={async (e) => { await this.setState({ filter: e.target.value }); this.findUserOrganizationUnit(this.state.filter) }} placeholder={L("Nhập tìm kiếm")} style={{ width: '92%' }} /><Button onClick={() =>
                        this.findUserOrganizationUnit(this.state.filter)
                    } type='primary'><SearchOutlined /></Button>
                    {(!this.state.filter || this.state.filter.length == 0) && this.listUserFound.length > 0 &&
                        <Checkbox key={"checkalluser"} indeterminate={this.state.indeterminate} checked={this.state.checkAll} onChange={this.onCheckAllChange}>
                            {L("Chọn tất cả")}
                        </Checkbox>}
                    {(!!listUserSelected && listUserSelected.length > 0) && listUserSelected.map((item, index) =>
                        <Row key={'row_user_selected_' + index}>
                            <Checkbox key={'user_key_selected_' + index} checked disabled
                                value={item.id}
                            >
                                {item.name}
                            </Checkbox>
                        </Row>
                    )}
                    <Row>
                        {this.state.isLoadDone == true && <Checkbox.Group value={this.state.checkedList} onChange={this.onChangeColumn}>

                            {this.listUserFound.map((item, index) =>
                            (
                                <Row key={"row_user_"+ index}>
                                    <Checkbox key={'user_key_' + index} onChange={(x) => this.handleCheck(x.target.value)}
                                        value={item.value}
                                    >
                                        {item.name}
                                    </Checkbox>
                                </Row>
                            ))}
                        </Checkbox.Group>
                        }
                    </Row>
                    <Row style={{ display: 'flex', justifyContent: 'flex-end', margin: '15px 0' }}>
                        <Button type='primary' onClick={() => this.addUserToOrganizationUnit()} style={{ marginLeft: '15px' }}><SaveOutlined style={{ color: 'blue' }} />{L("Lưu thông tin")} </Button>
                    </Row>
                </Col >
            </Card>
        )
    }
}