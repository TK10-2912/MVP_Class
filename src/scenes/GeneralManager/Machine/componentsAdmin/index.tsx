
import * as React from 'react';
import { Badge, Button, Card, Col, Modal, Popover, Row, Space, Tag, message } from 'antd';
import { AndroidOutlined, BarChartOutlined, CaretDownOutlined, DeleteOutlined, EditOutlined, EnvironmentOutlined, ExportOutlined, SearchOutlined, SendOutlined, UnorderedListOutlined, WarningOutlined } from '@ant-design/icons';
import { L } from '@src/lib/abpUtility';
import { MachineDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
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
import { eMachineNetworkStatus, eMachineStatusMonitor, eSort, valueOfeMachineStatusMonitor } from '@src/lib/enumconst';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';
import MapComponent from '@src/components/MapComponent';
import ThongKeDoanhThuTheoMayAdmin from '@src/scenes/StatisticalReport/StatisticalImporting/reports/ThongKeDoanhThuTheoMay/ThongKeDoanhThuTheoMayAdmin';
import SelectEnum from '@src/components/Manager/SelectEnum';
import confirm from 'antd/lib/modal/confirm';
import moment from 'moment';

export interface IProps {
    gr_ma_id: number;
    isModal?: boolean;
    isActive?: boolean;
}

export default class MachineForAdmin extends AppComponentBase<IProps> {
    state = {
        isLoadDone: false,
        visibleModalCreateUpdate: false,
        visibleModalStatusMachine: false,
        visibleModalStatisticsMachine: false,
        visibleExportMachine: false,
        visibleReportMachine: false,
        skipCount: 0,
        pageSize: AppConsts.PAGESIZE,
        currentPage: 1,
        us_id_list: undefined,
        clicked: false,
        isButtonMultiExportClick: false,
        select: false,
        gr_id: undefined,
        clickedAction: false,
        ma_id: undefined,
        ma_status: undefined,
        isPrintTag: false,
        sort: undefined,
        isClearMachine: false,
        visibleModalGoogleMap: false,
        ma_gps_lat: 0,
        ma_gps_lng: 0,
        ma_name: undefined,
        ma_id_hover: undefined
    }
    machineSelected: MachineDto = new MachineDto();
    listMachine: MachineDto[] = [];
    listNumber: number[] = [];
    listColumnDisplay: ColumnsDisplayType<any> = [];
    listColumnDisplaySelected: ColumnsDisplayType<any> = [];
    selectedField: string;
    TableDocumentColumns: ColumnsDisplayType<any> = [
        {
            title: 'Người vận hành', dataIndex: 'us_id_operator', key: 'us_id_operator', displayDefault: true, width: 100,
            render: (_: string, item: MachineDto) => {
                return <div>{stores.sessionStore.getUserNameById(item.us_id_operator)}</div>
            }
        },
        {
            title: 'Tình trạng máy', key: 'ma_is_active', displayDefault: true, width: "15%",
            sorter: (a: MachineDto, b: MachineDto) => Math.abs(moment(a.ma_lastOnline_at).diff(moment(), 'minutes')) - Math.abs(moment(b.ma_lastOnline_at).diff(moment(), 'minutes')),
            render: (_: string, item: MachineDto) => {
                const time = Math.abs(moment(item.ma_lastOnline_at).diff(moment(), 'minutes'));
                return (
                    <>{
                        this.state.isPrintTag == true ?
                            <>
                                {time <= 5 && `${time == 0 ? "Trực tuyến" : `${time} phút trước`}`}
                                {time > 5 && time <= 10 && `${this.customTimeToDateAndHour(time)} trước`}
                                {time > 10 && `${this.customTimeToDateAndHour(time)} trước`}
                            </>
                            :
                            <>
                                {time <= 5 && <Tag color="green" >{`${time == 0 ? "Trực tuyến" : `${time} phút trước`}`} </Tag>}
                                {time > 5 && time <= 10 && <Tag color="orange">{this.customTimeToDateAndHour(time)} trước</Tag>}
                                {time > 10 && <Tag color="red">{this.customTimeToDateAndHour(time)} trước</Tag>}
                            </>
                    }
                    </>
                )
            }
        },
        {
            title: 'Trạng thái', width: "10%", key: 'ma_targetTempRefrigeration', displayDefault: true,
            onCell: (item: MachineDto) => {
                return { onClick: () => this.actionTable(item, EventTable.History) }
            },
            render: (_: string, item: MachineDto) => {
                if (this.state.isPrintTag == true) {
                    return <div>{item.ma_status == eMachineStatusMonitor.NORMAL.num ? valueOfeMachineStatusMonitor(item.ma_status) : valueOfeMachineStatusMonitor(item.ma_status)}</div>
                } else {
                    return <div style={{ cursor: "pointer" }}>{item.ma_status == eMachineStatusMonitor.NORMAL.num ? <Tag color="success" >{valueOfeMachineStatusMonitor(item.ma_status)}</Tag> : <Tag color="error">{valueOfeMachineStatusMonitor(item.ma_status)}</Tag>}</div>
                }
            }
        },
        {
            title: 'Địa chỉ MAC', sorter: true, dataIndex: 'ma_mac', key: 'ma_mac', displayDefault: true, width: 100,
            render: (_: string, item: MachineDto) => <div>{item.ma_mac}</div>
        },
    ];
    action: any = {
        title: 'Chức năng', children: [], key: 'action_machine', className: "no-print center", width: 55,
        render: (_: string, item: MachineDto) => (
            <div >
                {this.isGranted(AppConsts.Permission.Pages_Manager_General_Machine_Update) &&
                    <Popover style={{ width: 200 }} visible={this.state.clickedAction && this.state.ma_id_hover == item.ma_id} onVisibleChange={(e) => this.handleVisibleChangeAction(e, item)} placement="right" content={
                        <Space direction='vertical'>
                            {(this.isGranted(AppConsts.Permission.Pages_Manager_General_Product_Update)) &&
                                <Space>
                                    <Button
                                        type="primary" icon={<EditOutlined />} title={"Chỉnh sửa"}
                                        size='small'
                                        onClick={() => this.createOrUpdateModalOpen(item)}
                                    ></Button>
                                    <a onClick={() => this.createOrUpdateModalOpen(item)}>{L('Chỉnh sửa')}</a>
                                </Space>
                            }
                            <Space>
                                <Button
                                    type="primary" icon={<AndroidOutlined />} title={"Tình trạng máy"}
                                    size='small'
                                    onClick={() => this.actionTable(item, EventTable.View)}
                                ></Button>
                                <a onClick={() => this.actionTable(item, EventTable.View)}>{L('Tình trạng máy')}</a>
                            </Space>
                            <Space>
                                <Button
                                    type="primary" icon={<BarChartOutlined />} title={"Thống kê doanh thu theo máy"}
                                    size='small'
                                    onClick={() => this.actionTable(item, EventTable.Statistics)}
                                ></Button>
                                <a onClick={() => this.actionTable(item, EventTable.Statistics)}>{L('Thống kê doanh thu')}</a>
                            </Space>
                            {AppConsts.isValidLocation(item.ma_gps_lat, item.ma_gps_lng) ?
                                <>
                                    <Space>
                                        <Button
                                            type="primary" icon={<EnvironmentOutlined />} title={"Vị trí máy"}
                                            size='small'
                                            onClick={() => this.isValidLocation(item)}
                                        ></Button>
                                        <a onClick={() => this.isValidLocation(item)}>{'Vị trí máy'}</a>
                                    </Space>
                                    <Space style={{ alignItems: "center" }}>
                                        <Button
                                            type="primary" icon={<SendOutlined />} title={"Chỉ đường"}
                                            size='small'
                                            onClick={() => AppConsts.actionDirection(item.ma_gps_lat!, item.ma_gps_lng!)}
                                        ></Button>
                                        <a onClick={() => AppConsts.actionDirection(item.ma_gps_lat!, item.ma_gps_lng!)}>{'Đường đi'}</a>
                                    </Space>
                                </>
                                : (item.ma_mapUrl ?
                                    <Space>
                                        <Button
                                            type="primary" icon={<EnvironmentOutlined />} title={"Vị trí máy"}
                                            size='small'
                                            onClick={() => this.isValidLocation(item)}
                                        ></Button>
                                        <a onClick={() => this.isValidLocation(item)}>{'Vị trí máy'}</a>
                                    </Space>
                                    : ""
                                )
                            }
                        </Space>
                    } trigger={['hover']}>
                        <Button size='small' icon={this.state.clickedAction && this.state.ma_id_hover == item.ma_id ? <CaretDownOutlined /> : <UnorderedListOutlined />}></Button>
                    </Popover>
                }
            </div >
        )
    }
    customTimeToDateAndHour = (time: number) => {
        if (time < 60) {
            return time + " phút";
        } else if (time < 1440) { // 1440 phút = 24 giờ
            return Math.floor(time / 60) + " giờ " + (time % 60) + " phút";
        } else {
            const days = Math.floor(time / 1440);
            const hours = Math.floor((time % 1440) / 60);
            return days + " ngày " + (hours ? hours + " giờ" : "");
        }
    };
    componentWillUnmount() {
        this.listColumnDisplaySelected.splice(-1);
        this.listColumnDisplay.splice(-1);
    }
    addColumn = () => {
        this.isGranted(AppConsts.Permission.Pages_Manager_General_Machine_Update) && this.props.isActive == true &&
            this.listColumnDisplaySelected.push(this.action);
    }
    handleVisibleChangeAction = (visible, item: MachineDto) => {
        this.setState({ clickedAction: visible, ma_id_hover: item.ma_id });
    }

    changeColumnsDisplay = async (values) => {

        this.setState({ isLoadDone: false });
        let machineColumns: any = [
            {

                title: 'Phiên bản ', sorter: (a: MachineDto, b: MachineDto) => {
                    const verA = a.ma_hardware_version_name ? a.ma_hardware_version_name : "";
                    const verB = b.ma_hardware_version_name ? b.ma_hardware_version_name : "";
                    return verA.localeCompare(verB);
                    //this.props.isModal ? false : true
                },
                dataIndex: 'ma_display_name', key: 'ma_name', displayDefault: true, width: 100,
                render: (_: string, item: MachineDto) => <div title={item.ma_hardware_version_name}>{item.ma_hardware_version_name}</div>
            },
            {
                title: 'Máy bán nước', sorter: this.props.isModal ? false : true,
                ellipsis: {
                    showTitle: false,
                },
                dataIndex: 'ma_display_name', key: 'ma_name1', displayDefault: true, width: 200,
                render: (_: string, item: MachineDto) => <div title={`${item.ma_display_name} - ${item.ma_code}`} style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    <p style={{ margin: 0 }}>{item.ma_code}</p>
                    <p style={{
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        margin: 0,
                        color: "gray",
                        fontSize: "11px",
                    }}>{item.ma_display_name}</p>
                </div>
            },
            {
                title: 'Nhóm máy', key: 'ma_name', displayDefault: true, width: 100,
                render: (_: string, item: MachineDto) => {
                    if (item.gr_ma_id == -1) {
                        return <div>Chưa có nhóm máy</div>
                    } else {
                        return <div>{stores.sessionStore.displayGroupMachineDisplayTable(item.gr_ma_id)}</div>
                    }
                }
            },
            {
                title: "STT", key: "stt_machine_index", width: 50, displayDefault: true, render: (_: string, __: MachineDto, index: number) => <div>{this.state.pageSize! * (this.state.currentPage! - 1) + (index + 1)}</div>,
            }
        ];
        this.listColumnDisplaySelected = values;
        machineColumns.map(item => this.listColumnDisplaySelected.unshift(item));
        if (this.isGranted(AppConsts.Permission.Pages_Manager_General_Machine_Update) && this.props.isActive != false) {
            this.listColumnDisplaySelected.push(this.action);
        }
        await this.getAll();
        this.setState({ isLoadDone: true });
    }
    addCamera = () => {
        let Camera: any =
        {
            title: 'Camera', key: 'Camera', className: "hoverCell", displayDefault: true, width: 100,
            render: (_: string, item: MachineDto) => <div><iframe src={item.ma_cameraUrl} width={"100%"} height={100} /></div>
        }
        this.listColumnDisplay.push(Camera);
        this.listColumnDisplaySelected.push(Camera);
    }

    isValidLocation = (item: MachineDto) => {
        this.machineSelected.init(item);
        this.setState({ visibleModalGoogleMap: true, })

    };

    getAll = async () => {
        await stores.machineStore.getAllByAdmin(this.state.us_id_list, this.state.ma_id, this.state.gr_id, this.state.ma_status, this.selectedField, this.state.sort, this.state.skipCount, this.state.pageSize);
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }

    async componentDidMount() {
        this.setState({ isLoadDone: false });
        const urlParams = new URLSearchParams(window.location.search);
        const machineCode = urlParams.get('machine');
        const us_id_list = Number(urlParams.get('us_id_list'));
        const gr_id = urlParams.get('gr_id');
        this.setState({ gr_id: this.props.gr_ma_id != undefined ? this.props.gr_ma_id : ((gr_id == null || gr_id == undefined || gr_id == "") ? undefined : Number(gr_id)) });
        if (!!machineCode) {
            await stores.machineStore.getAllByAdmin(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
            const { machineListResult } = stores.machineStore;
            const machineSelected = await machineListResult.map(value => value).find(item => item.ma_code === machineCode);
            this.createOrUpdateModalOpen(machineSelected!);
        }

        if (!!us_id_list) {
            await this.setState({ us_id_list: [us_id_list] });
        }
        await this.getAll();
        this.listColumnDisplay = this.TableDocumentColumns;
        this.addColumn();
        this.setState({ isLoadDone: true });
    }
    onChangePage = async (page: number, pagesize?: number) => {
        const { machineListResult } = stores.machineStore;
        if (pagesize === undefined || isNaN(pagesize)) {
            pagesize = machineListResult.length;
            page = 1;
        }
        await this.setState({ pageSize: pagesize! });
        await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            this.getAll();
        });
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
        if (this.isGranted(AppConsts.Permission.Pages_Manager_General_Product_Update) && event == EventTable.Edit || event == EventTable.RowDoubleClick) {
            this.createOrUpdateModalOpen(machine);
        }
        if (event == EventTable.View) {
            this.machineSelected.init(machine);
            this.setState({ visibleModalStatusMachine: true });
        }
        if (event == EventTable.Statistics) {
            this.machineSelected.init(machine);
            this.setState({ visibleModalStatisticsMachine: true });
        }
        if (event == EventTable.History) {
            this.machineSelected.init(machine);
            this.setState({ visibleReportMachine: true });
        }
    }

    createSuccess = () => {
        this.getAll();
        this.setState({ visibleModalCreateUpdate: false });
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
    deleteMulti = async () => {
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
            this.setState({ isLoadDone: !this.state.isLoadDone });
            this.listMachine = listItem;
            this.listNumber = this.listMachine.map(item => item.ma_id);
            this.setState({ isLoadDone: !this.state.isLoadDone });
        }
    }

    clearSearch = async () => {
        await this.setState({
            us_id_list: undefined,
            gr_id: undefined,
            ma_id: undefined,
            ma_status: undefined,
            isClearMachine: !this.state.isClearMachine,
        })
        await this.getAll();
    }
    onCancelModalExport = () => {
        this.setState({ visibleExportMachine: false, visibleModalStatusMachine: false, isPrintTag: false, });
    }
    onOpenModalExport = () => {
        this.setState({ visibleExportMachine: true, select: false, isPrintTag: true, });
    }
    onOpenModalExportMulti = () => {
        if (this.listNumber.length > 0) {
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
        const { machineSelected } = this;
        const left = this.state.visibleModalCreateUpdate ? cssCol(0) : cssCol(24);
        const right = this.state.visibleModalCreateUpdate ? cssCol(24) : cssCol(0);
        const { machineListResult, totalCount } = stores.machineStore;

        return (
            <Card>

                {this.state.visibleModalCreateUpdate == false &&
                    <Row align='bottom' gutter={[8, 8]}>
                        <Col {...!this.props.gr_ma_id ? cssColResponsiveSpan(24, 24, 24, 3, 3, 3) : cssColResponsiveSpan(24, 12, 12, 5, 5, 5)}>
                            <h2>Máy bán nước</h2>
                        </Col>
                        {!this.props.gr_ma_id &&
                            <Col {...cssColResponsiveSpan(24, 12, 12, 3, 3, 3)}>
                                <strong>Nhóm máy</strong>
                                <SelectedGroupMachine visibleMachine={false} groupmachineId={this.state.gr_id} onChangeGroupMachine={async (value) => { await this.setState({ gr_id: value }); await this.onChangePage(1, this.state.pageSize) }}></SelectedGroupMachine>
                            </Col>
                        }
                        <Col {...!this.props.gr_ma_id ? cssColResponsiveSpan(24, 12, 12, 3, 3, 3) : cssColResponsiveSpan(24, 12, 12, 7, 7, 7)}>
                            <strong>Mã, tên máy</strong>
                            <SelectedMachineMultiple groupMachineId={this.state.gr_id} isClear={this.state.isClearMachine} onChangeMachine={async (value) => { await this.setState({ ma_id: value }); this.onChangePage(1, this.state.pageSize) }} />
                        </Col>
                        {!this.props.gr_ma_id &&
                            <Col {...cssColResponsiveSpan(24, 12, 12, 3, 3, 3)}>
                                <strong>Người vận hành</strong>
                                <SelectUserMultiple
                                    onChangeUser={async (value) => { await this.setState({ us_id_list: value }); this.onChangePage(1, this.state.pageSize) }}
                                    us_id_list={this.state.us_id_list}
                                ></SelectUserMultiple>
                            </Col>
                        }
                        <Col {...cssColResponsiveSpan(24, 12, 12, 3, 3, 3)}>
                            <strong>Trạng thái máy</strong>
                            <SelectEnum
                                placeholder='Trạng thái'
                                eNum={eMachineNetworkStatus}
                                onChangeEnum={async (e) => { await this.setState({ ma_status: e }); this.handleSubmitSearch() }}
                                enum_value={this.state.ma_status}
                            ></SelectEnum>
                        </Col>
                        <Col {...!this.props.gr_ma_id ? cssColResponsiveSpan(24, 12, 12, 6, 6, 6) : cssColResponsiveSpan(24, 12, 12, 9, 9, 9)}>
                            <Space>
                                <Button placeholder='Tìm kiếm' type='primary' onClick={() => this.handleSubmitSearch()}><SearchOutlined />Tìm kiếm</Button>
                                {(((this.state.ma_id !== undefined || this.state.us_id_list != undefined || this.state.gr_id || this.state.ma_status) && this.state.clickedAction == false) && this.props.isModal != true) &&
                                    <Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >{(window.innerWidth >= 576 && window.innerWidth < 688) ? 'Xóa' : 'Xóa tìm kiếm'}</Button>
                                }
                            </Space>
                        </Col>
                        {this.state.visibleModalCreateUpdate == false &&
                            <Col xs={{ span: 12, order: 1 }} sm={{ span: 12, order: 1 }} md={{ span: 7, order: 1 }} lg={{ span: 5, order: 1 }} xl={{ span: 5, order: 1 }} xxl={{ span: 7, order: 1 }}>
                                {this.isGranted(AppConsts.Permission.Pages_Manager_General_Machine_BulkAction) && this.props.isActive != false &&
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
                                            <Button type='primary'>Thao tác hàng loạt</Button>
                                        </Popover >
                                    </Badge>
                                }
                            </Col>
                        }
                        <Col xs={{ span: 24, order: 3 }} sm={{ span: 24, order: 3 }} md={{ span: 10, order: 2 }} lg={{ span: 14, order: 2 }} xl={{ span: 14, order: 2 }} xxl={{ span: 10, order: 2 }} title='Tùy chọn hiển thị'>
                            <SelectedColumnDisplay listColumn={this.listColumnDisplay} onChangeColumn={this.changeColumnsDisplay} />
                        </Col>
                        {this.isGranted(AppConsts.Permission.Pages_Manager_General_Machine_Export) &&
                            <Col className='ant-col-xs-no-maxwidth' xs={{ span: 12, order: 2 }} sm={{ span: 12, order: 2 }} md={{ span: 7, order: 3 }} lg={{ span: 5, order: 3 }} xl={{ span: 5, order: 3 }} xxl={{ span: 7, order: 3 }} style={{ textAlign: "right" }}>
                                <Button type="primary" icon={<ExportOutlined />} onClick={this.onOpenModalExport}>Xuất dữ liệu</Button>
                            </Col>
                        }
                    </Row>}
                <Row>
                    <Col {...left}>
                        <TableMainMachineAdmin
                            is_printed={false}
                            machineListResult={machineListResult}
                            listColumnDisplay={this.listColumnDisplaySelected}
                            hasAction={this.listNumber.length > 0 ? false : true}
                            rowSelection={this.props.isActive != false ? this.rowSelection : undefined}
                            deleteMachine={this.deleteMachine}
                            editMachine={this.createOrUpdateModalOpen}
                            actionTable={this.actionTable}
                            changeColumnSort={this.changeColumnSort}
                            pagination={{
                                pageSize: this.state.pageSize,
                                total: totalCount,
                                position: ['topRight'],
                                current: this.state.currentPage,
                                showTotal: (tot) => ("Tổng: ") + tot + "",
                                showQuickJumper: true,
                                showSizeChanger: true,
                                pageSizeOptions: pageSizeOptions,
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
                        onCancel={() => { this.setState({ visibleModalStatusMachine: false }); this.onChangePage(1, this.state.pageSize) }}
                        closable={true}
                        maskClosable={false}
                        footer={false}
                        width={"80%"}
                    >
                        <ReportOfMachine ma_id={this.machineSelected.ma_id}></ReportOfMachine>
                    </Modal>
                    {this.state.visibleExportMachine &&
                        <ModalExportMachineAdmin listColumnDisplay={this.listColumnDisplaySelected} machineListResult={this.state.select ? this.listMachine : machineListResult.slice((this.state.currentPage - 1) * this.state.pageSize, (this.state.currentPage - 1) * this.state.pageSize + this.state.pageSize)} onCancel={this.onCancelModalExport} visible={this.state.visibleExportMachine} />
                    }
                    <Modal
                        centered
                        visible={this.state.visibleModalGoogleMap}
                        onCancel={() => this.setState({ visibleModalGoogleMap: false })}
                        title={<h3>{"Vị trí máy " + this.machineSelected.ma_display_name}</h3>}
                        width={'70vw'}
                        footer={null}
                    >
                        {AppConsts.isValidLocation(machineSelected.ma_gps_lat, machineSelected.ma_gps_lng) ?
                            <MapComponent
                                centerMap={{ lat: +machineSelected.ma_gps_lat!, lng: +machineSelected.ma_gps_lng! }}
                                zoom={15}
                                positionList={[{ lat: +machineSelected.ma_gps_lat!, lng: +machineSelected.ma_gps_lng!, title: "Vị trí máy" }]}
                            />
                            :
                            (machineSelected.ma_mapUrl) ?
                                <div dangerouslySetInnerHTML={{ __html: machineSelected.ma_mapUrl! }} />
                                : ""
                        }
                    </Modal>
                    <Modal
                        centered
                        visible={this.state.visibleModalStatisticsMachine}
                        onCancel={() => this.setState({ visibleModalStatisticsMachine: false })}
                        width={'90vw'}
                        footer={null}
                    >
                        <ThongKeDoanhThuTheoMayAdmin ma_id={this.machineSelected.ma_id!} />
                    </Modal>
                    <Modal
                        centered
                        visible={this.state.visibleReportMachine}
                        onCancel={() => this.setState({ visibleReportMachine: false })}
                        width={'90vw'}
                        footer={null}
                    >
                        <ReportOfMachine ma_id={this.machineSelected!.ma_id!} />
                    </Modal>
                </Row>
            </Card >
        )
    }
}
