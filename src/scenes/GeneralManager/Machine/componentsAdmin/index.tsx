
import { AndroidOutlined, CaretDownOutlined, DeleteOutlined, EditOutlined, ExportOutlined, SearchOutlined, UnorderedListOutlined, WarningOutlined } from '@ant-design/icons';
import { L } from '@src/lib/abpUtility';
import { MachineDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Badge, Button, Card, Col, Input, Modal, Popover, Row, Space, Tag, message } from 'antd';
import confirm from 'antd/lib/modal/confirm';
import * as React from 'react';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan } from '@src/lib/appconst';
import TableMainMachineAdmin from './TableMainMachineAdmin';
import TabMachineDetail from '../TabMachineDetail';
import SelectUserMultiple from '@src/components/Manager/SelectUserMultiple';
import ReportOfMachine from '../../ReportOfMachine';
import { SorterResult, TableRowSelection } from 'antd/lib/table/interface';
import ModalExportMachineAdmin from './ModalExportMachineAdmin';
import SelectedGroupMachine from '@src/components/Manager/SelectedGroupMachine';
import { ColumnsDisplayType } from '@src/components/Manager/SelectedColumnDisplay/ColumnsDisplayType';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import SelectedColumnDisplay from '@src/components/Manager/SelectedColumnDisplay';
import { eSort } from '@src/lib/enumconst';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';

export interface IProps {
    gr_ma_id: number;
}
const TableDocumentColumns: ColumnsDisplayType<any> = [

    {
        title: 'Người sở hữu', sorter: true, dataIndex: 'us_id_owner', key: 'us_id_owner', displayDefault: true, width: 150,
        render: (text: string, item: MachineDto) => {
            if (item.us_id_owner == -1) {
                return <div>Chưa có người sở hữu</div>
            } else {
                return <div>{stores.sessionStore.getUserNameById(item.us_id_owner)}</div>
            }
        }
    },
    {
        title: 'Số tiền SPCBB đã giao dịch (VNĐ)', sorter: true, dataIndex: 'ma_money', key: 'ma_money', displayDefault: true, width: 150,
        render: (text: string, item: MachineDto) => <div>{AppConsts.formatNumber(item.ma_money_drink)} </div>
    },
    {
        title: 'Số tiền SPKCBB đã giao dịch (VNĐ)', sorter: true, dataIndex: 'ma_fr_money', key: 'ma_fr_money', displayDefault: true, width: 150,
        render: (text: string, item: MachineDto) => <div>{AppConsts.formatNumber(item.ma_money_freshdrink)}</div>
    },
    {
        title: 'Số lượng SPCBB đã được mua (chai/lon)', sorter: true, dataIndex: 'ma_no_drink', key: 'ma_no_drink', displayDefault: true, width: 150,
        render: (text: string, item: MachineDto) => <div>{AppConsts.formatNumber(item.ma_no_drink)}</div>
    },
    {
        title: 'Dung tích SPKCBB đã được mua (ml)', sorter: true, dataIndex: 'ma_no_fr_drink', key: 'ma_no_fr_drink', displayDefault: true, width: 150,
        render: (text: string, item: MachineDto) => <div>{AppConsts.formatNumber(item.ma_no_fr_drink)}</div>
    },
    {
        title: 'Số lượng SPCBB đã được thêm vào (chai/lon)', sorter: true, dataIndex: 'ma_no_drink_change', key: 'ma_no_drink_change', displayDefault: true, width: 150,
        render: (text: string, item: MachineDto) => <div>{AppConsts.formatNumber(item.ma_no_drink_change)}</div>
    },
    {
        title: 'Dung tích SPKCBB đã được thêm vào (ml)', sorter: true, dataIndex: 'ma_no_frdrink_change', key: 'ma_no_frdrink_change', displayDefault: true, width: 150,
        render: (text: string, item: MachineDto) => <div>{AppConsts.formatNumber(item.ma_no_frdrink_change)}</div>
    },
];
export default class MachineForAdmin extends AppComponentBase<IProps> {
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
        sort: undefined,
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
                            <Row style={{ alignItems: "center", marginTop: "10px" }}>
                                <Button
                                    type="primary" icon={<AndroidOutlined />} title={"Tình trạng máy"}
                                    size='small'
                                    style={{ marginLeft: '10px', marginTop: '5px' }}
                                    onClick={() => this.actionTable(item, EventTable.View)}
                                ></Button>
                                <a style={{ paddingLeft: "10px" }} onClick={() => this.actionTable(item, EventTable.View)}>{L('Tình trạng máy')}</a>
                            </Row>
                        </>
                    } trigger={['hover']} >
                        {this.state.clickedAction && this.state.ma_id == item.ma_id ? <CaretDownOutlined /> : <UnorderedListOutlined />}
                    </Popover >
                }
            </div >
        )
    }
    componentWillUnmount() {
        this.listColumnDisplay.splice(-1);
    }
    addAction = () => {
        {
            this.isGranted(AppConsts.Permission.Pages_Manager_General_Machine_Update) &&
                this.listColumnDisplaySelected.push(this.action);
        }

    }
    handleVisibleChangeAction = (visible, item: MachineDto) => {
        this.setState({ clickedAction: visible, ma_id: item.ma_id });
    }
    changeColumnsDisplay = async (values) => {
        this.setState({ isLoadDone: false });
        let machineColumns: any = [
            {
                title: 'Tên máy', sorter: true, dataIndex: 'ma_display_name', key: 'ma_name', displayDefault: true, width: 150,
                render: (text: string, item: MachineDto) => <div>{item.ma_display_name}</div>
            },
            {
                title: 'Mã máy', dataIndex: '', key: 'ma_code', displayDefault: true, width: 150,
                render: (text: string, item: MachineDto, index: number) => <div>{item.ma_code}</div>
            },
            {
                title: 'Nhóm máy', key: 'ma_name', displayDefault: true, width: 150,
                render: (text: string, item: MachineDto) => {
                    if (item.gr_ma_id == -1) {
                        return <div>Chưa có nhóm máy</div>
                    } else {
                        return <div>{stores.sessionStore.getNameGroupMachines(item.gr_ma_id)}</div>
                    }
                }
            },
            {
                title: "STT", key: "stt_machine_index", width: 50, displayDefault: true, fixed: "left", render: (text: string, item: MachineDto, index: number) => <div>{this.state.pageSize! * (this.state.currentPage! - 1) + (index + 1)}</div>,
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
            title: 'Máy được phép sử dụng', key: 'ma_is_active', displayDefault: true, width: 150,
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

    getAll = async () => {
        this.setState({ isLoadDone: false });
        await stores.machineStore.getAllByAdmin(this.state.us_id_list, this.state.ma_search, this.state.gr_id, this.selectedField, this.state.sort, this.state.skipCount, this.state.pageSize);
        this.setState({ isLoadDone: true })
    }

    async componentDidMount() {
        this.setState({ isLoadDone: false });
        const urlParams = new URLSearchParams(window.location.search);
        const machineCode = urlParams.get('machine');
        const maDisplayName = urlParams.get('ma_display_name');
        const us_id_list = Number(urlParams.get('us_id_list'));
        const gr_id = urlParams.get('gr_id');
        const maCode = urlParams.get('ma_code');
        this.setState({ gr_id: this.props.gr_ma_id != undefined ? this.props.gr_ma_id : ((gr_id == null || gr_id == undefined || gr_id == "") ? undefined : Number(gr_id)) });

        if (!!maCode || !!maDisplayName) {
            const maSearch = (maCode || '') + (maDisplayName || '');
            this.setState({ ma_search: maSearch });
        }
        if (!!machineCode) {
            await stores.machineStore.getAllByAdmin(undefined, undefined, undefined, undefined, undefined, undefined, undefined);
            const { machineListResult } = stores.machineStore;
            const machineSelected = await machineListResult.map(value => value).find(item => item.ma_code === machineCode);
            this.createOrUpdateModalOpen(machineSelected!);
        }

        if (!!us_id_list) {
            await this.setState({ us_id_list: [us_id_list] });
        }

        if (!!this.props.gr_ma_id) {
            this.setState({ gr_id: this.props.gr_ma_id });
        }
        await this.getAll();
        this.listColumnDisplay = TableDocumentColumns;
        this.addStatus();
        this.setState({ isLoadDone: true });
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
                message.success("Xóa thành công !")
                stores.sessionStore.getCurrentLoginInformations();
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
        this.setState({ isLoadDone: true, visibleModalCreateUpdate: false });
    }

    onCancel = () => {
        this.setState({ visibleModalCreateUpdate: false });
    }
    handleVisibleChange = (visible) => {
        this.setState({ clicked: visible });
    }
    hide = () => {
        this.setState({ clicked: false });
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
        this.setState({ isLoadDone: true, visibleExportMachine: false, visibleModalStatusMachine: false, isPrintTag: false, });

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
    changeColumnSort = async (sort: SorterResult<MachineDto> | SorterResult<MachineDto>[]) => {
        this.setState({ isLoadDone: false });
        this.selectedField = sort['field'];
        await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
        await this.getAll();
        this.setState({ isLoadDone: true });
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
                        <Col {...cssColResponsiveSpan(24, 24, 24, 4, 4, 4)}><h2>Máy bán nước</h2></Col>
                        {!!this.props.gr_ma_id ?
                            ""
                            :
                            <Col {...cssColResponsiveSpan(24, 12, 12, 4, 4, 4)}>
                                <strong>Người sở hữu</strong>
                                <SelectUserMultiple
                                    onChangeUser={async (value) => { await this.setState({ us_id_list: value }); this.getAll() }}
                                    us_id_list={this.state.us_id_list}
                                ></SelectUserMultiple>
                            </Col>
                        }
                        {!!this.props.gr_ma_id ?
                            <Col {...cssColResponsiveSpan(24, 12, 12, 4, 4, 4)}>
                                <div><b>Nhóm máy: </b>{stores.sessionStore.getNameGroupMachines(this.props.gr_ma_id)}</div>
                            </Col>
                            :
                            <Col {...cssColResponsiveSpan(24, 12, 12, 4, 4, 4)}>
                                <strong>Nhóm máy</strong>
                                <SelectedGroupMachine groupmachineId={this.state.gr_id} onChangeGroupMachine={(value) => { this.setState({ gr_id: value }); this.getAll() }}></SelectedGroupMachine>
                            </Col>
                        }
                        <Col {...cssColResponsiveSpan(24, 12, 12, 4, 4, 4)}>
                            <strong>Mã máy, Tên máy</strong>
                            <SelectedMachineMultiple groupMachineId={this.state.gr_id} onChangeMachine={(value) => { this.setState({ ma_search: value }) }}/>
                            {/* <Input onPressEnter={this.getAll} value={this.state.ma_search} placeholder={"Nhập mã máy, tên máy..."} allowClear onChange={(e) => { this.setState({ ma_search: e.target.value }) }}></Input> */}
                        </Col>
                        <Col {...cssColResponsiveSpan(24, 12, 12, 8, 8, 8)} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            <Button placeholder='Tìm kiếm' type='primary' onClick={() => this.handleSubmitSearch()}><SearchOutlined />Tìm kiếm</Button>
                            {(this.state.us_id_list != undefined || typeof this.state.us_id_list != 'object' || this.state.gr_id || this.state.ma_search) &&
                                <Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >{(window.innerWidth >= 576 && window.innerWidth < 688) ? 'Xóa' : 'Xóa tìm kiếm'}</Button>
                            }
                        </Col>
                        {this.state.visibleModalCreateUpdate == false &&
                            <Col xs={{ span: 12, order: 1 }} sm={{ span: 12, order: 1 }} md={{ span: 7, order: 1 }} lg={{ span: 5, order: 1 }} xl={{ span: 5, order: 1 }} xxl={{ span: 7, order: 1 }}>
                                {this.isGranted(AppConsts.Permission.Pages_Manager_General_Machine_BulkAction) &&
                                    <Badge count={this.listNumber.length}>
                                        <Popover style={{ width: "200px" }} visible={this.state.clicked} onVisibleChange={(e) => this.handleVisibleChange(e)} placement="right" content={
                                            <Space>
                                                    <Button
                                                        type='primary'
                                                        icon={<ExportOutlined />} title={"Xuất dữ liệu"}
                                                        size='small'
                                                        onClick={this.onOpenModalExportMulti}
                                                    ></Button>
                                                    <a onClick={this.onOpenModalExportMulti}>{"Xuất dữ liệu"}</a>
                                            </Space>
                                        } trigger={['hover']} >
                                            <Button type='primary'>{L("Thao tác hàng loạt")}</Button>
                                        </Popover >
                                    </Badge>
                                }
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
                        <TableMainMachineAdmin
                            is_printed={this.listColumnDisplaySelected.length == 5}
                            machineListResult={machineListResult}
                            listColumnDisplay={this.listColumnDisplaySelected}
                            hasAction={this.listNumber.length > 0 ? false : true}
                            rowSelection={this.rowSelection}
                            deleteMachine={this.deleteMachine}
                            editMachine={this.createOrUpdateModalOpen}
                            actionTable={this.actionTable}
                            changeColumnSort={this.changeColumnSort}
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
                                ma_id={this.machineSelected.ma_id}
                                machineSelected={this.machineSelected}
                                onCreateUpdateSuccess={this.createSuccess}
                                onCancel={this.onCancel} />
                        </Col>
                    }
                    <Modal
                        visible={this.state.visibleModalStatusMachine}
                        onCancel={() => { this.setState({ visibleModalStatusMachine: false }) }}
                        closable={true}
                        maskClosable={false}
                        footer={false}
                        width={"80%"}
                    >
                        <ReportOfMachine ma_id={this.machineSelected.ma_id}></ReportOfMachine>
                    </Modal>
                    {this.state.visibleExportMachine &&
                        <ModalExportMachineAdmin listColumnDisplay={this.listColumnDisplaySelected} machineListResult={this.state.select ? this.listMachine : machineListResult} onCancel={this.onCancelModalExport} visible={this.state.visibleExportMachine} />
                    }
                </Row>
            </Card >
        )
    }
}
