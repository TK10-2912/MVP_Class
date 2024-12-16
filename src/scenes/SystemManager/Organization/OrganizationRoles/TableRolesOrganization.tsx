import { DeleteFilled } from '@ant-design/icons';
import { L } from '@src/lib/abpUtility';
import { OrganizationUnitDto, OrganizationUnitRoleListDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import * as React from 'react'
import { Button, Row, Modal, Col, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import FormFindRolesOrganization from './FormFindRolesOrganization';
import moment from 'moment';
const { confirm } = Modal;

export interface IProps {
    onCancel: () => void
    organizationUnitDto: OrganizationUnitDto;
    organizationSuccess: () => void
}

export default class TableOrganizationRoles extends React.Component<IProps> {
    state = {
        isLoadDone: false,
        pageSize: 10,
        currentPage: 1,
        skipCount: undefined,
        maxResult: undefined,
        visibleRolesFormSelect: false,
        totalMemberCount: undefined

    };

    totalRoles: number = 0;
    listRolesInside: OrganizationUnitRoleListDto[] = [];
    organizationrRolesSelected: OrganizationUnitRoleListDto = new OrganizationUnitRoleListDto();

    async componentDidMount() {
        await this.getAll();
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.organizationUnitDto.memberCount !== prevState.totalMemberCount) {
            return { totalMemberCount: nextProps.organizationUnitDto.memberCount };
        }
        return null;
    }

    async componentDidUpdate(prevProps, prevState) {
        if (this.state.totalMemberCount !== prevState.totalMemberCount) {
            this.getAll();
        }
    }

    async getAll() {
        this.setState({ isLoadDone: false });
        this.totalRoles = 0;
        this.listRolesInside = [];
        let result = await stores.organizationStore.getOrganizationUnitRoles(this.props.organizationUnitDto.id, undefined, this.state.maxResult, this.state.skipCount);
        if (result !== undefined) {
            this.totalRoles = result.totalCount;
            this.listRolesInside = result.items!;
        }
        this.setState({ isLoadDone: true });

    }
    deleteRolesOrganization = async (roleId: number) => {
        let self = this;
        let organizationID = this.props.organizationUnitDto.id;
        confirm({
            title: L('Bạn có chắc muốn xoá') + "?",
            okText: L('Xác nhập'),
            cancelText: L('Huỷ'),
            async onOk() {
                await stores.organizationStore.removeRoleFromOrganizationUnit(roleId, organizationID);
                await self.organizationSuccess();
            },

            onCancel() {
            },
        });
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

    render() {
        const columns: ColumnsType<OrganizationUnitRoleListDto> = [
            {
                title: L('Vai trò'), key: 'or_name', width: 5, render: (text: string, item: OrganizationUnitRoleListDto) => <div>{item.displayName}
                </div>
            },
            { title: L('Thời gian thêm mới '), key: 'or_time', width: 5, render: (text: string, item: OrganizationUnitRoleListDto) => <div>{moment(item.addedTime).format("DD/MM/YYYY")}</div> },
            {
                title: L('Xoá'), key: 'pu_name', width: 5, render: (text: string, item: OrganizationUnitRoleListDto) => <div>
                    <Button
                        danger icon={<DeleteFilled />} title={L('Xoá')}
                        style={{ marginLeft: '10px' }}
                        size='small'
                        onClick={() => this.deleteRolesOrganization(item.id)}
                    ></Button>
                </div>
            },
        ];
        return (
            
            <Row>
                <Col span={24} style={{ textAlign: "right", marginBottom: '15px' }}>
                    <Button danger onClick={() => this.onCancel()}>Hủy</Button>
                    <Button type="primary" style={{ marginLeft: '10px' }} onClick={() => this.setState({ visibleRolesFormSelect: true })}>{L('Thêm vai trò')}</Button>

                </Col>
                <Table
                    className='centerTable'
                    style={{ width: '100%' }}
                    scroll={{ x: '100%' }}
                    loading={!this.state.isLoadDone}
                    rowKey={record => "OrganizationRoles__" + JSON.stringify(record)}
                    size={'small'}
                    bordered={true}
                    locale={{ "emptyText": L('khong_co_du_lieu') }}
                    columns={columns}
                    dataSource={this.listRolesInside}
                    pagination={{
                        pageSize: this.state.pageSize,
                        current: this.state.currentPage,
                        showTotal: (tot) => (L("tong")) + tot + "",
                        showQuickJumper: true,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                />

                <Modal
                    visible={this.state.visibleRolesFormSelect}
                    title={L('Chọn vai trò')}
                    onCancel={() => { this.setState({ visibleRolesFormSelect: false }) }}
                    footer={null}
                    width='60vw'
                    maskClosable={false}
                >
                    <FormFindRolesOrganization
                        listRoleSelected={this.listRolesInside}
                        onCancel={() => this.setState({ visibleRolesFormSelect: false })}
                        organizationUnitDto={this.props.organizationUnitDto}
                        organizationSuccess={this.organizationSuccess}
                    >
                    </FormFindRolesOrganization>
                </Modal>


            </Row >
        )
    }
}
