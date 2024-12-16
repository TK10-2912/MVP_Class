
import { AndroidOutlined, BarChartOutlined, CaretDownOutlined, DeleteOutlined, EditOutlined, EnvironmentOutlined, ExportOutlined, RollbackOutlined, SearchOutlined, SendOutlined, SwapOutlined, UnorderedListOutlined, WarningOutlined } from '@ant-design/icons';
import { L } from '@src/lib/abpUtility';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import { ChangeUserOwnerInput, MachineDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Badge, Button, Card, Col, Modal, Popover, Row, Select, Space, Tag, message } from 'antd';
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
import { eMachineNetworkStatus, eMachineStatusMonitor, eSort, valueOfeMachineStatusMonitor } from '@src/lib/enumconst';
import ModalExportMachineUser from './ModalExportMachineUser';
import TableMainMachineUser from './TableMainMachineUser';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';
import ThongKeDoanhThuTheoMayUser from '@src/scenes/StatisticalReport/StatisticalImporting/reports/ThongKeDoanhThuTheoMay/ThongKeDoanhThuTheoMay';
import ReportOfMachineUser from '../../ReportOfMachine/componentUser';
import moment from 'moment';
import MapComponent from '@src/components/MapComponent';
import SelectEnum from '@src/components/Manager/SelectEnum';
export interface IProps {
    gr_ma_id: number;
    isModal?: boolean
    isActive?: boolean;
}
// const TableDocumentColumns: ColumnsDisplayType<any> = [
//     {
//         title: 'Số tiền SPCBB đã giao dịch (VNĐ)', sorter: true, dataIndex: 'ma_money', key: 'ma_money', displayDefault: true,
//         render: (text: string, item: MachineDto) => <div>{AppConsts.formatNumber(item.ma_money_drink)} </div>
//     },
//     {
//         title: 'Số tiền SPKCBB đã giao dịch (VNĐ)', sorter: true, dataIndex: 'ma_fr_money', key: 'ma_fr_money', displayDefault: true,
//         render: (text: string, item: MachineDto) => <div>{AppConsts.formatNumber(item.ma_money_freshdrink)}</div>
//     },
//     {
//         title: 'Số lượng SPCBB đã được mua (chai/lon)', sorter: true, dataIndex: 'ma_no_drink', key: 'ma_no_drink', displayDefault: true,
//         render: (text: string, item: MachineDto) => <div>{AppConsts.formatNumber(item.ma_no_drink)}</div>
//     },
//     {
//         title: 'Dung tích SPKCBB đã được mua (ml)', sorter: true, dataIndex: 'ma_no_fr_drink', key: 'ma_no_fr_drink', displayDefault: true,
//         render: (text: string, item: MachineDto) => <div>{AppConsts.formatNumber(item.ma_no_fr_drink)}</div>
//     },
//     {
//         title: 'Số lượng SPCBB được thêm vào (chai/lon)', sorter: true, dataIndex: 'ma_no_drink_change', key: 'ma_no_drink_change', displayDefault: true,
//         render: (text: string, item: MachineDto) => <div>{AppConsts.formatNumber(item.ma_no_drink_change)}</div>
//     },
//     {
//         title: 'Dung tích SPKCBB đã được thêm vào (ml)', sorter: true, dataIndex: 'ma_no_frdrink_change', key: 'ma_no_frdrink_change', displayDefault: true,
//         render: (text: string, item: MachineDto) => <div>{AppConsts.formatNumber(item.ma_no_frdrink_change)}</div>
//     },
// ];
export default class MachineForUser extends AppComponentBase<IProps> {
    state = {
        isLoadDone: false,
        visibleModalCreateUpdate: false,
        visibleModalStatusMachine: false,
        visibleModalStatictisMachine: false,
        visibleExportMachine: false,
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
        us_id_owner: undefined,
        clickedActionChangeOwner: false,
        sort: undefined,
        ma_id_hover: undefined,
        visibleModalGoogleMap: false,
        ma_name: undefined,
        ma_gps_lat: 0,
        ma_gps_lng: 0,
        visibleReportMachine: false,
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
                {/* {this.isGranted(AppConsts.Permission.Pages_Manager_General_Machine_Update) && */}
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
                {/* } */}
            </div >
        )
    }
    async componentDidMount() {
        this.setState({ isLoadDone: false });
        const urlParams = new URLSearchParams(window.location.search);
        const gr_id = urlParams.get('gr_id');
        const machineCode = urlParams.get('machine');
        this.setState({ gr_id: this.props.gr_ma_id || Number(gr_id) || undefined });
        if (machineCode) {
            await stores.machineStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined, undefined);
            const { machineListResult } = stores.machineStore;
            const machineSelected = await machineListResult.map(value => value).find(item => item.ma_code === machineCode);
            this.createOrUpdateModalOpen(machineSelected!);
        }
        await this.getAll();
        this.listColumnDisplay = this.TableDocumentColumns;
        // this.addStatus();
        // this.addColumn();
        this.setState({ isLoadDone: true });
    }
    addColumn = () => {
        this.listColumnDisplaySelected.push(this.action);
    }
    isValidLocation = (item: MachineDto) => {
        this.machineSelected.init(item);
        this.setState({ visibleModalGoogleMap: true, })
    };
    addCamera = () => {
        let Camera: any =
        {
            title: 'Camera', key: 'Camera', className: "hoverCell", displayDefault: true, width: 100,
            render: (text: string, item: MachineDto) => <div><iframe src={item.ma_cameraUrl} width={"100%"} height={100} /></div>
        }
        this.listColumnDisplay.push(Camera);
        this.listColumnDisplaySelected.push(Camera);
    }
    handleVisibleChangeAction = (visible, item: MachineDto) => {
        this.setState({ clickedAction: visible, ma_id_hover: item.ma_id });
    }
    handleVisibleChangeActionChangeOwner = (visible, item: MachineDto) => {
        this.setState({ clickedActionChangeOwner: visible, ma_id_hover: item.ma_id });
    }
    changeColumnsDisplay = async (values) => {
        this.setState({ isLoadDone: false });
        let machineColumns: any = [
            {
                title: 'Phiên bản ', sorter: this.props.isModal ? false : true,
                dataIndex: 'ma_display_name', key: 'ma_name', displayDefault: true, width: 100,
                render: (_: string, item: MachineDto) => <div title={item.ma_hardware_version_name}>{item.ma_hardware_version_name}</div>
            },
            {
                title: 'Máy bán nước', sorter: this.props.isModal ? false : true,
                ellipsis: {
                    showTitle: false,
                },
                dataIndex: 'ma_display_name', key: 'ma_name', displayDefault: true, width: 200,
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
        if (this.props.isActive != false) {
            this.listColumnDisplaySelected.push(this.action);
        }
        await this.getAll();
        this.setState({ isLoadDone: true });
    }
    // addStatus = () => {
    //     let action: any = {
    //         title: 'Máy được phép sử dụng', key: 'ma_is_active', displayDefault: true,
    //         render: (text: string, item: MachineDto) => {
    //             if (this.state.isPrintTag == true) {
    //                 return <div>{item.ma_networkStatus == eMachineNetworkStatus.ONLINE.num ? "Trực tuyến" : "Ngoại tuyến"}</div>
    //             } else {
    //                 return <div>{item.ma_networkStatus == eMachineNetworkStatus.ONLINE.num ? <Tag color="success" >Trực tuyến</Tag> : <Tag color="error">Ngoại tuyến</Tag>}</div>

    //             }
    //         }
    //     }
    //     this.listColumnDisplay.push(action);
    //     this.listColumnDisplaySelected.push(action);
    // }
    async getAll() {
        await stores.machineStore.getAll(this.state.ma_id, this.state.gr_id, this.state.ma_status, this.selectedField, this.state.sort, this.state.skipCount, this.state.pageSize);
        this.setState({ isLoadDone: !this.state.isLoadDone })
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
        if (event == EventTable.Statistics) {
            this.machineSelected.init(machine);
            this.setState({ visibleModalStatictisMachine: true });
        }
        if (event == EventTable.History) {
            this.machineSelected.init(machine);
            this.setState({ visibleReportMachine: true });
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
            ma_status: undefined,
        })
        this.getAll();
    }
    onCancelModalExport = () => {
        this.setState({ isLoadDone: false });
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
        this.listColumnDisplaySelected.splice(this.props.isModal ? -2 : -4);
        this.listColumnDisplay.splice(this.props.isModal ? -2 : -4);
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
        const {machineSelected}= this;
        const left = this.state.visibleModalCreateUpdate ? cssCol(0) : cssCol(24);
        const right = this.state.visibleModalCreateUpdate ? cssCol(24) : cssCol(0);
        const { machineListResult, totalCount } = stores.machineStore;
        return (
            <Card>
                {this.state.visibleModalCreateUpdate == false &&
                    <Row align='bottom' gutter={[8, 8]}>
                        <Col {...!this.props.gr_ma_id ? cssColResponsiveSpan(24, 12, 12, 4, 4, 4) : cssColResponsiveSpan(24, 12, 12, 5, 5, 5)}>
                            <h2>Máy bán nước</h2>
                        </Col>
                        {!this.props.gr_ma_id &&
                            <Col {...!this.props.gr_ma_id ? cssColResponsiveSpan(24, 12, 12, 4, 4, 4) : cssColResponsiveSpan(24, 12, 12, 5, 5, 5)}>
                                <strong>Nhóm máy</strong>
                                <SelectedGroupMachine visibleMachine={false} groupmachineId={this.state.gr_id} onChangeGroupMachine={async (value) => { await this.setState({ gr_id: value }); await this.onChangePage(1, this.state.pageSize) }}></SelectedGroupMachine>
                            </Col>
                        }
                        <Col {...!this.props.gr_ma_id ? cssColResponsiveSpan(24, 12, 12, 4, 4, 4) : cssColResponsiveSpan(24, 12, 12, 7, 7, 7)}>
                            <strong>Mã máy, Tên máy</strong>
                            <SelectedMachineMultiple groupMachineId={this.state.gr_id} onChangeMachine={(value) => { this.setState({ ma_id: value }) }} />
                        </Col>
                        <Col {...cssColResponsiveSpan(24, 12, 12, 4, 4, 4)}>
                            <strong>Trạng thái máy</strong>
                            <SelectEnum
                                placeholder='Trạng thái'
                                eNum={eMachineNetworkStatus}
                                onChangeEnum={async (e) => { await this.setState({ ma_status: e }); this.handleSubmitSearch() }}
                                enum_value={this.state.ma_status}
                            ></SelectEnum>
                        </Col>
                        <Col {...!this.props.gr_ma_id ? cssColResponsiveSpan(24, 12, 12, 8, 8, 8) : cssColResponsiveSpan(24, 12, 12, 12, 12, 12)}>
                            <Space>
                                <Button placeholder='Tìm kiếm' type='primary' onClick={() => this.handleSubmitSearch()}><SearchOutlined />{this.isChangeText() ? "Tìm kiếm" : "Tìm"}</Button>
                                {((this.state.gr_id || this.state.ma_status) && this.props.isModal != true) &&
                                    <Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >{this.isChangeText() ? "Xóa tìm kiếm" : "Xóa"}</Button>
                                }
                            </Space>
                        </Col>
                        {this.state.visibleModalCreateUpdate == false &&
                            <Col xs={{ span: 12, order: 1 }} sm={{ span: 12, order: 1 }} md={{ span: 7, order: 1 }} lg={{ span: 5, order: 1 }} xl={{ span: 5, order: 1 }} xxl={{ span: 7, order: 1 }}>
                                <Badge count={this.listNumber.length}>
                                    {this.isGranted(AppConsts.Permission.Pages_Manager_General_Machine_BulkAction) && this.props.isActive !== false &&

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
                                            <Button type='primary'>Thao tác hàng loạt</Button>
                                        </Popover >
                                    }
                                </Badge>
                            </Col>
                        }
                        <Col xs={{ span: 24, order: 3 }} sm={{ span: 24, order: 3 }} md={{ span: 10, order: 2 }} lg={{ span: 14, order: 2 }} xl={{ span: 14, order: 2 }} xxl={{ span: 10, order: 2 }} title="Tùy chọn hiển thị">
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
                            is_printed={false}
                            machineListResult={machineListResult}
                            listColumnDisplay={this.listColumnDisplaySelected}
                            hasAction={this.listNumber.length > 0 ? false : true}
                            rowSelection={this.props.isActive !== false ? this.rowSelection : undefined}
                            deleteMachine={this.deleteMachine}
                            editMachine={this.createOrUpdateModalOpen}
                            changeColumnSort={this.changeColumnSort}
                            actionTable={this.actionTable}
                            pagination={{
                                position: ['topRight'],
                                pageSize: this.state.pageSize,
                                total: totalCount,
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
                                machineSelected={this.machineSelected}
                                onCreateUpdateSuccess={this.createSuccess}
                                onCancel={this.onCancel}
                            />
                        </Col>
                    }
                    <Modal
                        visible={this.state.visibleModalStatusMachine}
                        onCancel={async () => { this.setState({ visibleModalStatusMachine: false }); await this.getAll(); }}
                        closable={true}
                        maskClosable={false}
                        footer={false}
                        width={"80%"}
                    >
                        <ReportOfMachineUser ma_id={this.machineSelected.ma_id}></ReportOfMachineUser>
                    </Modal>
                    {this.state.visibleExportMachine &&
                        <ModalExportMachineUser listColumnDisplay={this.listColumnDisplaySelected} machineListResult={this.state.select ? this.listMachine : machineListResult} onCancel={this.onCancelModalExport} visible={this.state.visibleExportMachine} />
                    }
                    <Modal
                        centered
                        visible={this.state.visibleModalStatictisMachine}
                        onCancel={() => this.setState({ visibleModalStatictisMachine: false })}
                        width={'90vw'}
                        footer={null}
                    >
                        <ThongKeDoanhThuTheoMayUser ma_id={this.machineSelected.ma_id!} />
                    </Modal>

                    {/* Vị trí của máy bán nước */}
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
