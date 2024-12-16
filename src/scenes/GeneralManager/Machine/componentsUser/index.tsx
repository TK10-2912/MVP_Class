
import { AndroidOutlined, CaretDownOutlined, DeleteOutlined, EditOutlined, ExportOutlined, SearchOutlined, SwapOutlined, UnorderedListOutlined, WarningOutlined } from '@ant-design/icons';
import { L } from '@src/lib/abpUtility';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan } from '@src/lib/appconst';
import { ChangeUserOwnerInput, MachineDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Badge, Button, Card, Col, Input, Modal, Popover, Row, Space, Tag, message } from 'antd';
import confirm from 'antd/lib/modal/confirm';
import { SorterResult, TableRowSelection } from 'antd/lib/table/interface';
import * as React from 'react';
import ReportOfMachine from '../../ReportOfMachine';
import TabMachineDetail from '../TabMachineDetail';

import AppComponentBase from '@src/components/Manager/AppComponentBase';
import SelectUser from '@src/components/Manager/SelectUser';
import SelectedColumnDisplay from '@src/components/Manager/SelectedColumnDisplay';
import { ColumnsDisplayType } from '@src/components/Manager/SelectedColumnDisplay/ColumnsDisplayType';
import SelectedGroupMachine from '@src/components/Manager/SelectedGroupMachine';
import { eSort } from '@src/lib/enumconst';
import ModalExportMachineUser from './ModalExportMachineUser';
import TableMainMachineUser from './TableMainMachineUser';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';
import SelectedMachine from '@src/components/Manager/SelectedMachine';
export interface IProps {
    gr_ma_id: number;
}
const TableDocumentColumns: ColumnsDisplayType<any> = [


    {
        title: 'Số tiền SPCBB đã giao dịch (VNĐ)', sorter: true, dataIndex: 'ma_money', key: 'ma_money', displayDefault: true,
        render: (text: string, item: MachineDto) => <div>{AppConsts.formatNumber(item.ma_money_drink)} </div>
    },
    {
        title: 'Số tiền SPKCBB đã giao dịch (VNĐ)', sorter: true, dataIndex: 'ma_fr_money', key: 'ma_fr_money', displayDefault: true,
        render: (text: string, item: MachineDto) => <div>{AppConsts.formatNumber(item.ma_money_freshdrink)}</div>
    },
    {
        title: 'Số lượng SPCBB đã được mua (chai/lon)', sorter: true, dataIndex: 'ma_no_drink', key: 'ma_no_drink', displayDefault: true,
        render: (text: string, item: MachineDto) => <div>{AppConsts.formatNumber(item.ma_no_drink)}</div>
    },
    {
        title: 'Dung tích SPKCBB đã được mua (ml)', sorter: true, dataIndex: 'ma_no_fr_drink', key: 'ma_no_fr_drink', displayDefault: true,
        render: (text: string, item: MachineDto) => <div>{AppConsts.formatNumber(item.ma_no_fr_drink)}</div>
    },
    {
        title: 'Số lượng SPCBB được thêm vào (chai/lon)', sorter: true, dataIndex: 'ma_no_drink_change', key: 'ma_no_drink_change', displayDefault: true,
        render: (text: string, item: MachineDto) => <div>{AppConsts.formatNumber(item.ma_no_drink_change)}</div>
    },
    {
        title: 'Dung tích SPKCBB đã được thêm vào (ml)', sorter: true, dataIndex: 'ma_no_frdrink_change', key: 'ma_no_frdrink_change', displayDefault: true,
        render: (text: string, item: MachineDto) => <div>{AppConsts.formatNumber(item.ma_no_frdrink_change)}</div>
    },
];
export default class MachineForUser extends AppComponentBase<IProps> {
    state = {
        isLoadDone: false,
        visibleModalCreateUpdate: false,
        visibleModalStatusMachine: false,
        visibleExportMachine: false,
        ma_search: undefined,
        skipCount: 0,
        maxResultCount: 10,
        pageSize: 10,
        currentPage: 1,
        us_id_list: undefined,
        clicked: false,
        isButtonMultiExportClick: false,
        select: false,
        gr_id: undefined,
        clickedAction: false,
        ma_id: undefined,
        isPrintTag: false,
        us_id_owner: undefined,
        clickedActionChangeOwner: false,
        sort: undefined
    }
    machineSelected: MachineDto = new MachineDto();
    listMachine: MachineDto[] = [];
    listNumber: number[] = [];
    listColumnDisplay: ColumnsDisplayType<any> = [];
    listColumnDisplaySelected: ColumnsDisplayType<any> = [];
    selectedField: string;

    action: any = {
        title: '', children: [], key: 'action_machine', className: "no-print center", fixed: 'right', width: 50,
        render: (text: string, item: MachineDto) => (
            <div >
                {this.isGranted(AppConsts.Permission.Pages_Manager_General_Machine_Update) &&
                    <Popover style={{ width: "200px" }} visible={this.state.clickedAction && this.state.ma_id == item.ma_id} onVisibleChange={(e) => this.handleVisibleChangeAction(e, item)} placement="right" content={
                        <>
                            <Row style={{ alignItems: "center" }}>
                                <Button
                                    type="primary" icon={<EditOutlined />} title={"Chỉnh sửa"}
                                    size='small'
                                    style={{ marginLeft: '10px', marginTop: '5px' }}
                                    onClick={() => this.createOrUpdateModalOpen(item)}
                                ></Button>
                                <a style={{ paddingLeft: "10px" }} onClick={() => this.createOrUpdateModalOpen(item)}>{L('Chỉnh sửa')}</a>
                            </Row>
                            <Row style={{ alignItems: "center" }}>
                                <Button
                                    type="primary" icon={<AndroidOutlined />} title={"Tình trạng máy"}
                                    size='small'
                                    style={{ marginLeft: '10px', marginTop: '5px' }}
                                    onClick={() => this.actionTable(item, EventTable.View)}
                                ></Button>
                                <a style={{ paddingLeft: "10px" }} onClick={() => this.actionTable(item, EventTable.View)}>{L('Tình trạng máy')}</a>
                            </Row>
                            <Button
                                type="primary"
                                icon={<SwapOutlined />} title={"Chuyển nhượng"}
                                size='small'
                                style={{ marginLeft: '10px', marginTop: '5px' }}
                                onClick={async () => { await this.machineSelected.init(item); this.setState({ clickedActionChangeOwner: true }) }}
                            ></Button>
                            <a style={{ paddingLeft: "10px" }} onClick={async () => { await this.machineSelected.init(item); this.setState({ clickedActionChangeOwner: true }) }}>{L('Chuyển nhượng')}</a>
                        </>
                    } trigger={['click']} >
                        {this.state.clickedAction && this.state.ma_id == item.ma_id ? <CaretDownOutlined /> : <UnorderedListOutlined />}
                    </Popover >
                }
            </div >
        )
    }
    async componentDidMount() {
        this.setState({ isLoadDone: false });
        const urlParams = new URLSearchParams(window.location.search);
        const maCode = urlParams.get('ma_code');
        const gr_id = urlParams.get('gr_id');
        const machineCode = urlParams.get('machine');
        const maDisplayName = urlParams.get('ma_display_name');
        const maSearch = (maCode || '') + (maDisplayName || '');
        this.setState({ ma_search: maSearch || undefined, gr_id: this.props.gr_ma_id || Number(gr_id) || undefined });
        if (machineCode) {
            await stores.machineStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined);
            const { machineListResult } = stores.machineStore;
            const machineSelected = await machineListResult.map(value => value).find(item => item.ma_code === machineCode);
            this.createOrUpdateModalOpen(machineSelected!);
        }
        await this.getAll();
        this.listColumnDisplay = TableDocumentColumns;
        this.addStatus();
        this.setState({ isLoadDone: true });
    }
    addAction = () => {
        this.isGranted(AppConsts.Permission.Pages_Manager_General_Machine_Update) &&
            this.listColumnDisplaySelected.push(this.action);
    }
    handleVisibleChangeAction = (visible, item: MachineDto) => {
        this.setState({ clickedAction: visible, ma_id: item.ma_id });
    }
    handleVisibleChangeActionChangeOwner = (visible, item: MachineDto) => {
        this.setState({ clickedActionChangeOwner: visible, ma_id: item.ma_id });
    }
    changeColumnsDisplay = async (values) => {
        this.setState({ isLoadDone: false });
        let machineColumns: any = [
            {
                title: 'Tên máy', sorter: true, dataIndex: 'ma_display_name', key: 'ma_name', displayDefault: true,
                render: (text: string, item: MachineDto) => <div>{item.ma_display_name}</div>
            },
            {
                title: 'Mã máy', dataIndex: '', key: 'ma_code', displayDefault: true,
                render: (text: string, item: MachineDto, index: number) => <div>{item.ma_code}</div>
            },
            {
                title: 'Nhóm máy', key: 'ma_name', displayDefault: true,
                render: (text: string, item: MachineDto) => {
                    if (item.gr_ma_id == -1) {
                        return <div>Chưa có nhóm máy</div>
                    } else {
                        return <div>{stores.sessionStore.getNameGroupMachines(item.gr_ma_id)}</div>
                    }
                }
            },
            {
                title: "STT", key: "stt_machine_index", width: 50, displayDefault: true, fixed: "left",
                render: (text: string, item: MachineDto, index: number) => <div>{this.state.pageSize! * (this.state.currentPage! - 1) + (index + 1)}</div>,
            }
        ];
        this.listColumnDisplaySelected = values;
        machineColumns.map(item => this.listColumnDisplaySelected.unshift(item));
        {
            this.isGranted(AppConsts.Permission.Pages_Manager_General_Machine_Update) &&
                this.listColumnDisplaySelected.push(this.action);
        }
        await this.getAll();
        this.setState({ isLoadDone: true });
    }
    addStatus = () => {
        let action: any = {
            title: 'Máy được phép sử dụng', key: 'ma_is_active', displayDefault: true,
            render: (text: string, item: MachineDto) => {
                if (this.state.isPrintTag == true) {
                    return <div>{item.ma_is_active == true ? "Đang sử dụng" : "Không sử dụng"}</div>
                } else {
                    return <div>{item.ma_is_active == true ? <Tag color="success" >Đang sử dụng</Tag> : <Tag color="error">Không sử dụng</Tag>}</div>
                }
            }
        }
        this.listColumnDisplay.push(action);
        this.listColumnDisplaySelected.push(action);
    }
    async getAll() {
        await stores.machineStore.getAll(this.state.ma_search, this.state.gr_id, this.selectedField, this.state.sort, this.state.skipCount, this.state.pageSize);
        this.setState({ isLoadDone: !this.state.isLoadDone })
    }

    onChangePage = async (page: number, pagesize?: number) => {
        if (pagesize !== undefined) {
            await this.setState({ pageSize: pagesize! });
        }
        this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            this.getAll();
        })
    }

    handleSubmitSearch = async () => {
        this.onChangePage(1, this.state.pageSize);
    }
    createOrUpdateModalOpen = async (input: MachineDto) => {
        if (input !== undefined && input !== null) {
            this.machineSelected.init(input);
            await this.setState({ visibleModalCreateUpdate: true });
        }
    }
    deleteMachine = (machine: MachineDto) => {
        let self = this;
        confirm({
            title: "Bạn có muốn xóa máy bán nước " + machine.ma_display_name + "?",
            okText: L('Xác nhận'),
            cancelText: L('Hủy'),
            async onOk() {
                self.setState({ isLoadDone: false });
                await stores.machineStore.delete(machine);
                stores.sessionStore.getCurrentLoginInformations();
                message.success("Xóa thành công !")
                await self.getAll();
                self.setState({ isLoadDone: true });
            },
        });
    }

    actionTable = (machine: MachineDto, event: EventTable) => {
        if (event == EventTable.Edit || event == EventTable.RowDoubleClick) {
            this.createOrUpdateModalOpen(machine);
        }
        if (event == EventTable.View) {
            this.machineSelected.init(machine);
            this.setState({ visibleModalStatusMachine: true });
        }
    }

    createSuccess = () => {
        this.setState({ isLoadDone: false });
        this.getAll();
        this.setState({ isLoadDone: true, visibleModalCreateUpdate: false, clickedActionChangeOwner: false });
    }

    onCancel = () => {
        this.setState({ visibleModalCreateUpdate: false });
    }
    handleVisibleChange = (visible) => {
        this.setState({ clicked: visible });
    }
    hide = () => {
        this.setState({ clicked: false, clickedActionChangeOwner: false });
    }
    deleteAll() {
        let self = this;
        let titleConfirm = (
            <div>
                <div style={{ color: "orange", textAlign: "center", fontSize: "23px" }} ><WarningOutlined style={{}} /> Cảnh báo</div> <br />
                <span> Bạn có muốn <span style={{ color: "red" }}>xóa tất cả</span> dữ liệu ? Thao tác này khi xác nhận <span style={{ color: "red" }}>không thể hoàn tác</span>.</span>
            </div>
        )
        let cancelText = (
            <div style={{ color: "red" }}>Hủy</div>
        )
        this.setState({ isLoadDone: false });
        confirm({
            title: titleConfirm,
            okText: L("Delete"),
            cancelText: cancelText,
            async onOk() {
                await stores.machineStore.deleteAll();
                await self.getAll();
                message.success(L("Xóa thành công"));
            },
            onCancel() {

            },
        });
        this.setState({ isLoadDone: true });
    }
    deleteMulti = async (listIdDiscound: number[]) => {
        let self = this;
        let titleConfirm = (
            <span><WarningOutlined style={{ fontSize: "23px", color: "orange" }} /> Bạn có muốn <span style={{ color: "red" }}>xóa hàng loạt</span> {self.listNumber.length} dữ liệu ? Thao tác này khi xác nhận <span style={{ color: "red" }}>không thể hoàn tác</span>.</span>
        )
        let cancelText = (
            <div style={{ color: "red" }}>Hủy</div>
        )

        const { totalCount } = stores.machineStore;
        this.setState({ isLoadDone: false })
        if (this.listNumber.length < 1) {
            await message.error(L("Hãy chọn 1 hàng trước khi xóa"));
        }
        else {
            confirm({
                title: titleConfirm,
                okText: L('xac_nhan'),
                cancelText: cancelText,
                async onOk() {
                    if (self.state.currentPage > 1 && (totalCount - self.listNumber.length) % 10 == 0) self.onChangePage(self.state.currentPage - 1, self.state.pageSize)
                    await stores.machineStore.deleteMulti(self.listNumber);
                    await self.getAll();
                    self.listNumber = []
                    self.listMachine = []
                    self.setState({ isLoadDone: true });
                    message.success(L("Xóa thành công" + "!"))
                },
                onCancel() {
                },
            });
        }
    }
    rowSelection: TableRowSelection<MachineDto> = {
        onChange: (listIdMember: React.Key[], listItem: MachineDto[]) => {
            this.setState({ isLoadDone: false });
            this.listMachine = listItem;
            this.listNumber = this.listMachine.map(item => item.ma_id);
            this.setState({ isLoadDone: true });
        }
    }

    clearSearch = async () => {
        await this.setState({
            us_id_list: undefined,
            gr_id: undefined,
            ma_search: undefined,
        })
        this.getAll();
    }
    onCancelModalExport = () => {
        this.setState({ isLoadDone: false });
        this.addAction();
        this.setState({ isLoadDone: true, visibleExportMachine: false, isPrintTag: false, })
    }
    onOpenModalExport = () => {
        this.listColumnDisplaySelected.pop();
        this.setState({ visibleExportMachine: true, select: false, isPrintTag: true, });
    }
    onOpenModalExportMulti = () => {
        if (this.listNumber.length > 0) {
            this.listColumnDisplaySelected.pop();
            this.setState({ visibleExportMachine: true, isPrintTag: true, select: true, });
        }
        else { message.warning(L("Hãy chọn 1 hàng trước khi xuất dữ liệu")) }
    }
    componentWillUnmount() {
        this.listColumnDisplay.splice(-1);
    }
    changeUserOwner = async (us_id_owner, item: MachineDto) => {
        const { currentLogin } = stores.sessionStore;
        let self = this;
        let titleConfirm = (
            <span><WarningOutlined style={{ fontSize: "23px", color: "orange" }} /> Bạn có muốn <span style={{ color: "red" }}>chuyển nhượng</span> lại máy "{item!.ma_display_name}" cho <strong>{currentLogin.user.name}</strong>? Thao tác này khi xác nhận <span style={{ color: "red" }}>không thể hoàn tác</span>.</span>
        )
        let cancelText = (
            <div style={{ color: "red" }}>Hủy</div>
        )
        if (us_id_owner != undefined && us_id_owner !== currentLogin.user.id) {
            let input = new ChangeUserOwnerInput();
            input.ma_id = item.ma_id;
            input.us_id_owner = us_id_owner;
            confirm({
                title: titleConfirm,
                okText: 'Xác nhận',
                cancelText: cancelText,
                async onOk() {
                    await stores.machineStore.changeUserOwner(input);
                    message.success("Chuyển nhượng thành công");
                    await self.createSuccess();
                },
                onCancel() {
                },
            });

        } else {
            message.error("Vui lòng chọn người chuyển nhượng")
        }
    }
    changeColumnSort = async (sort: SorterResult<MachineDto> | SorterResult<MachineDto>[]) => {
        this.setState({ isLoadDone: false });
        this.selectedField = sort['field'];
        await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
        await this.getAll();
        this.setState({ isLoadDone: true });

    }

    isChangeText = () => {
        const isChangeText = window.innerWidth >= 768 && window.innerWidth <= 992;
        return !isChangeText;
    }

    render() {
        let self = this;
        const left = this.state.visibleModalCreateUpdate ? cssCol(0) : cssCol(24);
        const right = this.state.visibleModalCreateUpdate ? cssCol(24) : cssCol(0);
        const { machineListResult, totalCount } = stores.machineStore;
        return (
            <Card>
                {this.state.visibleModalCreateUpdate == false &&
                    <Row align='bottom' gutter={[8, 8]}>
                        <Col {...cssColResponsiveSpan(24, 24, 24, 5, 5, 5)}><h2>Máy bán nước</h2></Col>
                        {!!this.props.gr_ma_id ?
                            <Col {...cssColResponsiveSpan(24, 12, 12, 4, 4, 4)}>
                                <div><b>Nhóm máy:</b>{stores.sessionStore.getNameGroupMachines(this.props.gr_ma_id)}</div>
                            </Col>
                            :
                            <Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 5)}>
                                <strong>Nhóm máy</strong>
                                <SelectedGroupMachine groupmachineId={this.state.gr_id} onChangeGroupMachine={async (value) => { await this.setState({ gr_id: value }); await this.getAll() }}></SelectedGroupMachine>
                            </Col>
                        }
                        <Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 5)} >
                            <strong>Mã máy, Tên máy</strong>
                            <SelectedMachine groupMachineId={this.state.gr_id} onChangeMachine={(value) => { this.setState({ ma_search: value }) }}/>

                        </Col>

                        <Col {...cssColResponsiveSpan(24, 24, 8, 9, 9, 9)}>
                            <Space>
                                <Button placeholder='Tìm kiếm' type='primary' onClick={() => this.handleSubmitSearch()}><SearchOutlined />{this.isChangeText() ? "Tìm kiếm" : "Tìm"}</Button>
                                {(this.state.gr_id || !!this.state.ma_search) &&
                                    <Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >{this.isChangeText() ? "Xóa tìm kiếm" : "Xóa"}</Button>
                                }
                            </Space>
                        </Col>
                        {this.state.visibleModalCreateUpdate == false &&
                            <Col xs={{ span: 12, order: 1 }} sm={{ span: 12, order: 1 }} md={{ span: 7, order: 1 }} lg={{ span: 5, order: 1 }} xl={{ span: 5, order: 1 }} xxl={{ span: 7, order: 1 }}>
                                <Badge count={this.listNumber.length}>
                                    {this.isGranted(AppConsts.Permission.Pages_Manager_General_Machine_BulkAction) &&

                                        <Popover style={{ width: "200px" }} visible={this.state.clicked} onVisibleChange={(e) => this.handleVisibleChange(e)} placement="right" content={
                                            <>
                                                <Row style={{ alignItems: "center", marginTop: "10px" }}>
                                                    <Button
                                                        type='primary'
                                                        icon={<ExportOutlined />} title={'Xuất dữ liệu'}
                                                        style={{ marginLeft: '10px' }}
                                                        size='small'
                                                        onClick={this.onOpenModalExportMulti}
                                                    ></Button>
                                                    <a style={{ paddingLeft: "10px" }} onClick={this.onOpenModalExportMulti}>{"Xuất dữ liệu"}</a>
                                                </Row>
                                            </>
                                        } trigger={['hover']} >
                                            <Button type='primary'>{L("Thao tác hàng loạt")}</Button>
                                        </Popover >
                                    }
                                </Badge>
                            </Col>
                        }
                        <Col xs={{ span: 24, order: 3 }} sm={{ span: 24, order: 3 }} md={{ span: 10, order: 2 }} lg={{ span: 14, order: 2 }} xl={{ span: 14, order: 2 }} xxl={{ span: 10, order: 2 }} >
                            <SelectedColumnDisplay listColumn={this.listColumnDisplay} onChangeColumn={this.changeColumnsDisplay} />
                        </Col>
                        {this.isGranted(AppConsts.Permission.Pages_Manager_General_Machine_Export) &&
                            <Col className='ant-col-xs-no-maxwidth' xs={{ span: 12, order: 2 }} sm={{ span: 12, order: 2 }} md={{ span: 7, order: 3 }} lg={{ span: 5, order: 3 }} xl={{ span: 5, order: 3 }} xxl={{ span: 7, order: 3 }} style={{ textAlign: "right" }}>
                                <Button type="primary" icon={<ExportOutlined />} onClick={this.onOpenModalExport}>Xuất dữ liệu</Button>
                            </Col>
                        }
                    </Row>}
                <Row style={{ marginTop: 10 }}>
                    <Col {...left}>
                        <TableMainMachineUser
                            is_printed={this.listColumnDisplaySelected.length == 5}
                            machineListResult={machineListResult}
                            listColumnDisplay={this.listColumnDisplaySelected}
                            hasAction={this.listNumber.length > 0 ? false : true}
                            rowSelection={this.rowSelection}
                            deleteMachine={this.deleteMachine}
                            editMachine={this.createOrUpdateModalOpen}
                            changeColumnSort={this.changeColumnSort}
                            actionTable={this.actionTable}
                            pagination={{
                                pageSize: this.state.pageSize,
                                total: totalCount,
                                current: this.state.currentPage,
                                showTotal: (tot) => ("Tổng: ") + tot + "",
                                showQuickJumper: true,
                                showSizeChanger: true,
                                pageSizeOptions: ['10', '20', '50', '100'],
                                onShowSizeChange(current: number, size: number) {
                                    self.onChangePage(current, size)
                                },
                                onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
                            }} />
                    </Col>
                    {this.state.visibleModalCreateUpdate &&
                        <Col {...right}>
                            <TabMachineDetail
                                machineSelected={this.machineSelected}
                                onCreateUpdateSuccess={this.createSuccess}
                                onCancel={this.onCancel} />
                        </Col>
                    }
                    <Modal
                        visible={this.state.visibleModalStatusMachine}
                        onCancel={() => this.setState({ visibleModalStatusMachine: false })}
                        closable={true}
                        maskClosable={false}
                        footer={false}
                        width={"80%"}
                    >
                        <ReportOfMachine ma_id={this.machineSelected.ma_id}></ReportOfMachine>
                    </Modal>
                    {this.state.visibleExportMachine &&
                        <ModalExportMachineUser listColumnDisplay={this.listColumnDisplaySelected} machineListResult={this.state.select ? this.listMachine : machineListResult} onCancel={this.onCancelModalExport} visible={this.state.visibleExportMachine} />
                    }
                    <Modal
                        visible={this.state.clickedActionChangeOwner}
                        onCancel={() => this.setState({ clickedActionChangeOwner: false })}
                        closable={false}
                        maskClosable={false}
                        footer={false}
                        width={600}>
                        <Row style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h2>Chuyển nhượng máy bán nước</h2>
                            <Space>
                                <Button type="primary" onClick={() => { this.changeUserOwner(this.state.us_id_owner, this.machineSelected); stores.sessionStore.getCurrentLoginInformations(); }}>Lưu</Button>
                                <Button danger onClick={() => this.hide()}>Huỷ</Button>
                            </Space>
                        </Row>
                        <Row>
                            <Col {...cssColResponsiveSpan(24, 24, 10, 10, 10, 10)}>Chọn người chuyển nhượng</Col>
                            <Col {...cssColResponsiveSpan(24, 24, 14, 14, 14, 14)}>
                                <SelectUser
                                    onChangeUser={async (value) => {
                                        await this.setState({ us_id_owner: value });
                                    }}
                                ></SelectUser>
                            </Col>

                        </Row>
                    </Modal>
                </Row>
            </Card >
        )
    }
}
