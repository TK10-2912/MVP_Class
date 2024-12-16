import { DeleteFilled } from '@ant-design/icons';
import { L } from '@src/lib/abpUtility';
import { OrganizationUnitDto, OrganizationUnitUserListDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Col, Modal, Row, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react'
import FormFindUserOrganization from './FormFindUserOrganization';
import { pageSizeOptions } from '@src/lib/appconst';
const { confirm } = Modal;


export interface IProps {
    organizationUnitDto: OrganizationUnitDto,
    onCancel: () => void;
    organizationSuccess: () => void;
}


export default class TableOrganizationUser extends React.Component<IProps> {
    state = {
        isLoadDone: true,
        pageSize: 10,
        currentPage: 1,
        skipCount: 0,
        maxResult: 1000,
        visibleUserFormSelect: false,
        organizationIDSelected: undefined,
    };
    totalUser: number = 0;
    listUserInside: OrganizationUnitUserListDto[] = [];
    organizationUserSelected: OrganizationUnitUserListDto = new OrganizationUnitUserListDto();

    async componentDidMount() {
        await this.getAll();
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.organizationUnitDto.id !== prevState.organizationIDSelected) {
            return { organizationIDSelected: nextProps.organizationUnitDto.id };
        }
        return null;
    }

    async componentDidUpdate(prevProps, prevState) {
        if (this.state.organizationIDSelected !== prevState.organizationIDSelected) {
            this.getAll();
        }
    }

    onCancel = () => {
        if (!!this.props.onCancel) {
            this.props.onCancel();
        }
    }
    organizationSuccess = () => {
        if (!!this.props.organizationSuccess) {
            this.props.organizationSuccess();
        }
        this.getAll()
    }

    async getAll() {
        this.setState({ isLoadDone: false });
        await this.setState({ organizationIDSelected: this.props.organizationUnitDto.id })
        this.totalUser = 0;
        this.listUserInside = [];
        let result = await stores.organizationStore.getAllOrganizationUser(this.state.organizationIDSelected!, undefined, this.state.maxResult, this.state.skipCount);
        if (result !== undefined) {
            this.totalUser = result.totalCount;
            this.listUserInside = result.items!;
        }
        this.setState({ isLoadDone: true });

    }
    deleteUserOrganization = async (userId: number) => {
        let self = this;
        let organizationID = this.props.organizationUnitDto.id;
        confirm({
            title: L('ban_co_chac_muon_xoa') + "?",
            okText: L('xac_nhan'),
            cancelText: L('huy'),
            async onOk() {
                await stores.organizationStore.removeUserFromOrganizationUnit(userId, organizationID);
                await self.organizationSuccess();
            },
            onCancel() {
            },
        });
    }

    render() {
        const columns: ColumnsType<OrganizationUnitUserListDto> = [
            { title: L('stt'), key: 'or_index', width: 50, render: (text: string, item: OrganizationUnitUserListDto, index: number) => <div>{this.state.pageSize! * (this.state.currentPage! - 1) + (index + 1)}</div> },
            { title: L('ten_truy_cap'), key: 'or_name', width: 50, render: (text: string, item: OrganizationUnitUserListDto) => <div>{item.name}</div> },
            { title: L('ngay_them'), key: 'or_created', width: 50, render: (text: string, item: OrganizationUnitUserListDto) => <div>{moment(item.addedTime).format("DD/MM/YYYY")}</div> },
            {
                title: L('xoa_bo'), key: 'pu_name', width: 5, render: (text: string, item: OrganizationUnitUserListDto) => <div>
                    <Button
                        danger icon={<DeleteFilled />} title={L('xoa')}
                        style={{ marginLeft: '10px' }}
                        size='small'
                        onClick={() => this.deleteUserOrganization(item.id)}

                    ></Button>
                </div>
            },
        ];
        return (
            <Row style={{ marginRight: '10px' }}>
                <Col span={24} style={{ textAlign: "right", marginBottom: '15px' }}>
                    <Button danger onClick={() => this.onCancel()}>{L('huy')}</Button>
                    <Button type="primary" style={{ marginLeft: '10px' }} onClick={() => this.setState({ visibleUserFormSelect: true })}>{L('them_thanh_vien')}</Button>

                </Col>
                <Table
                    // sticky
                    style={{ width: '100%' }}
                    scroll={{ x: '100%' }}
                    loading={!this.state.isLoadDone}
                    rowKey={record => "OrganizationUser__" + JSON.stringify(record)}
                    size={'small'}
                    bordered={true}
                    
                    columns={columns}
                    dataSource={this.listUserInside}
                    pagination={{
                        position: ['topRight'],
                        pageSize: this.state.pageSize,
                        current: this.state.currentPage,
                        total: this.totalUser,
                        showTotal: (tot) => "Tổng: " + tot + "",
                        showQuickJumper: true,
                        showSizeChanger: true,
                        pageSizeOptions: pageSizeOptions,

                    }}
                />

                <Modal
                    visible={this.state.visibleUserFormSelect}
                    title={L('chon_nguoi_dung')}
                    onCancel={() => { this.setState({ visibleUserFormSelect: false }) }}
                    footer={null}
                    width='60vw'
                    maskClosable={false}
                >
                    <FormFindUserOrganization
                        onCancel={() => this.setState({ visibleUserFormSelect: false })}
                        organizationUnitDto={this.props.organizationUnitDto}
                        organizationSuccess={this.organizationSuccess}
                    />
                </Modal>

            </Row>
        )
    }
}
