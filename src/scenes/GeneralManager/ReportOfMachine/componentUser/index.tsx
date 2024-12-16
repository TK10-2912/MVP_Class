import AppConsts, { EventTable, cssColResponsiveSpan, pageSizeOptions } from "@src/lib/appconst";
import { MachineDto, ReportOfMachineDto } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import { Button, Card, Col, Input, Modal, Row, Space, message } from "antd";
import * as React from "react";
import SelectEnum from "@src/components/Manager/SelectEnum";
import { eReportStatus, eSort } from "@src/lib/enumconst";
import { DeleteOutlined, ExportOutlined, SearchOutlined } from "@ant-design/icons";
import { SorterResult } from "antd/lib/table/interface";
import SelectedGroupMachine from "@src/components/Manager/SelectedGroupMachine";
import SelectedMachineMultiple from "@src/components/Manager/SelectedMachineMultiple";
import { isGranted } from "@src/lib/abpUtility";
import ModalExportReportOfMachineUser from "./ModalExportReportOfMachineUser";
import TableReportOfMachineUser from "./TableReportOfMachineUser";
import MapComponent from "@src/components/MapComponent";
import CountdownTimer from "@src/components/CountDowntTimer";
export interface Iprops {
    ma_id: number;
}
export default class ReportOfMachineUser extends React.Component<Iprops> {
    state = {
        isLoadDone: true,
        re_status: undefined,
        re_level: undefined,
        skipCount: 0,
        maxResultCount: 10,
        visibleModalCreateUpdate: false,
        pageSize: 10,
        currentPage: 1,
        modalExportReportMachine: false,
        us_id_list: undefined,
        ma_id: undefined,
        fieldSort: undefined,
        sort: undefined,
        re_code: undefined,
        gr_ma_id: undefined,
        ma_id_list: undefined,
        visibleModalGoogleMap: false,
    }
    reportOfMachineSelected: ReportOfMachineDto = new ReportOfMachineDto();
    maSelected: MachineDto = new MachineDto();

    async componentDidMount() {
        const urlParams = new URLSearchParams(window.location.search);
        const re_code = urlParams.get('re_code');
        if (!!re_code) {
            await this.setState({ re_code: re_code });
        }
        if (!!this.props.ma_id) {
            await this.setState({ ma_id_list: [this.props.ma_id] })
        }
        await this.getAll();
    }

    async getAll() {
        this.setState({ isLoadDone: false });
        await stores.reportOfMachineStore.getAll(this.state.re_status, this.state.re_level, this.state.re_code, this.state.fieldSort, this.state.sort, this.state.pageSize, undefined, undefined, undefined, this.state.gr_ma_id, this.state.ma_id_list);
        await stores.machineStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined, undefined);
        this.setState({ isLoadDone: true });
    }

    createOrUpdateModalOpen = async (input: ReportOfMachineDto) => {
        if (input !== undefined && input !== null) {
            this.reportOfMachineSelected.init(input);
            await this.setState({ visibleModalCreateUpdate: true, isLoadDone: true });
        }
    }

    actionTable = async (reportMachine: ReportOfMachineDto, event: EventTable, hasUrlMap?: boolean) => {
        if (reportMachine == undefined || reportMachine.ma_id == undefined) {
            message.error("Không tìm thấy !");
            return;
        }
        if (event == EventTable.View || event == EventTable.RowDoubleClick) {
            this.createOrUpdateModalOpen(reportMachine);
        }
        if (event == EventTable.ViewMap || event == EventTable.RowDoubleClick) {
            this.maSelected = reportMachine.machine;
            await this.setState({ visibleModalGoogleMap: true, })
        }
        if (event == EventTable.MapDirection || event == EventTable.RowDoubleClick) {
            this.maSelected = reportMachine.machine;
            if (this.maSelected != undefined) {
                AppConsts.actionDirection(this.maSelected.ma_gps_lat!, this.maSelected.ma_gps_lng!);
            }

        }
        this.setState({ visibleModalCreateUpdate: true });
    }
    onCreateUpdateSuccess = () => {
        this.getAll();
        this.setState({ visibleModalCreateUpdate: false })
    }

    handleSubmitSearch = async () => {
        this.onChangePage(1, this.state.pageSize);
    }
    onChangePage = async (page: number, pagesize?: number) => {
        if (pagesize !== undefined) {
            await this.setState({ pageSize: pagesize! });
        }
        await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            this.getAll();
        })
    }
    clearSearch = async () => {
        await this.setState({
            isLoadDone: true,
            us_id_list: undefined,
            re_level: undefined,
            re_status: undefined,
            gr_ma_id: undefined,
            ma_id_list: !!this.props.ma_id ? [this.props.ma_id] : undefined,
            re_code: undefined
        })
        this.getAll();
    }
    changeColumnSort = async (sort: SorterResult<ReportOfMachineDto> | SorterResult<ReportOfMachineDto>[]) => {
        this.setState({ isLoadDone: false });
        await this.setState({ fieldSort: sort['field'] });
        await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
        await this.getAll();
        this.setState({ isLoadDone: true });
    }

    shouldChangeText = () => {
        const isChangeText = window.innerWidth >= 576 && window.innerWidth <= 1393;
        return !isChangeText;
    }

    render() {

        let self = this;
        const { reportOfMachineListResult, totalReportOfMachine } = stores.reportOfMachineStore;
        return (
            <Card>
                <Row align="bottom">
                    <h2 style={{ margin: 0 }}>Tình trạng máy hôm nay ({new Date().toLocaleDateString('vi-VN')})</h2> &nbsp;&nbsp;
                    <CountdownTimer handleSearch={this.handleSubmitSearch} />
                </Row>
                <Row gutter={[8, 8]} align="bottom" >
                    {!this.props.ma_id &&
                        <Col {...cssColResponsiveSpan(24, 12, 12, 8, 8, 3)}>
                            <strong>Nhóm máy</strong>
                            <SelectedGroupMachine groupmachineId={this.state.gr_ma_id} onChangeGroupMachine={async (value) => { await this.setState({ gr_ma_id: value }); this.onChangePage(1, this.state.pageSize) }}></SelectedGroupMachine>
                        </Col>
                    }
                    <Col {...cssColResponsiveSpan(24, 12, 12, 8, 8, 5)}>
                        <strong>Máy bán nước</strong>
                        {!!this.props.ma_id ? <Input value={stores.sessionStore.getNameMachines(this.props.ma_id)} readOnly></Input> :
                            <SelectedMachineMultiple onChangeMachine={async (value) => { await this.setState({ ma_id_list: value }); this.onChangePage(1, this.state.pageSize) }} groupMachineId={this.state.gr_ma_id} listMachineId={this.state.ma_id_list} />
                        }
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 12, 8, 8, 4)}>
                        <strong>Mã đơn hàng</strong>
                        <Input allowClear
                            onChange={async (e) => { await this.setState({ re_code: e.target.value }); this.handleSubmitSearch() }}
                            placeholder={"Nhập tìm kiếm..."}
                            onPressEnter={this.handleSubmitSearch}
                            value={this.state.re_code}
                        />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 12, 8, 8, 3)}>
                        <strong>Trạng thái</strong>
                        <SelectEnum
                            eNum={eReportStatus}
                            onChangeEnum={async (e) => { await this.setState({ re_status: e }); this.onChangePage(1, this.state.pageSize) }}
                            enum_value={this.state.re_status}
                        ></SelectEnum>
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 12, 8, 8, 6)} style={{ alignContent: 'bottom' }}>
                        <Space>
                            {(this.props.ma_id == undefined) &&
                                <Button type="primary" icon={<SearchOutlined />} title="Tìm kiếm" onClick={() => this.handleSubmitSearch()} >Tìm kiếm</Button>
                            }
                            {/* {(this.state.re_code != undefined || this.state.us_id_list != undefined || this.state.re_level != undefined || this.state.re_status != undefined || !!this.state.gr_ma_id || !this.props.ma_id ? this.state.ma_id_list != undefined : "") && */}
                            {
                                !!this.props.ma_id ? (
                                    (!!this.state.gr_ma_id ||
                                        !!this.state.re_code ||
                                        !!this.state.re_status ||
                                        this.state.re_status! > -1) && (
                                        <Button
                                            danger
                                            icon={<DeleteOutlined />}
                                            title="Xóa tìm kiếm"
                                            onClick={() => this.clearSearch()}
                                        >
                                            {this.shouldChangeText() ? 'Xoá tìm kiếm' : 'Xoá'}
                                        </Button>
                                    )
                                ) : (
                                    (!!this.state.gr_ma_id ||
                                        !!this.state.re_code ||
                                        !!this.state.re_status ||
                                        this.state.re_status! > -1 ||
                                        !!this.state.ma_id_list) && (
                                        <Button
                                            danger
                                            icon={<DeleteOutlined />}
                                            title="Xóa tìm kiếm"
                                            onClick={() => this.clearSearch()}
                                        >
                                            {this.shouldChangeText() ? 'Xóa tìm kiếm' : 'Xóa'}
                                        </Button>
                                    )
                                )
                            }

                        </Space>
                    </Col>
                    {(this.props.ma_id == undefined) &&
                        <Col {...cssColResponsiveSpan(6, 7, 12, 12, 12, 3)} style={{ textAlign: "right" }}>
                            {isGranted(AppConsts.Permission.Pages_Manager_General_ReportOfMachine_Export) &&
                                <Button type="primary" icon={<ExportOutlined />} title="Xuất dữ liệu" onClick={() => this.setState({ modalExportReportMachine: true })}>{(window.innerWidth > 688) && 'Xuất dữ liệu'}</Button>
                            }
                        </Col>
                    }
                </Row>

                <Row>
                    <Col
                        style={{ overflowY: "auto" }}>
                        <TableReportOfMachineUser
                            onCreateUpdateSuccess={() => this.onCreateUpdateSuccess()}
                            onCreateUpdate={() => this.setState({ isLoadDone: !this.state.isLoadDone })}
                            onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
                            checkExpand={false}
                            actionTable={this.actionTable}
                            changeColumnSort={this.changeColumnSort}
                            reportOfMachineListResult={reportOfMachineListResult}
                            is_Printed={false}
                            pagination={{
                                position: ['topRight'],
                                pageSize: this.state.pageSize,
                                total: totalReportOfMachine,
                                current: this.state.currentPage,
                                showTotal: (tot) => ("Tổng: ") + tot + "",
                                showQuickJumper: true,
                                showSizeChanger: true,
                                pageSizeOptions: pageSizeOptions,
                                onShowSizeChange(current: number, size: number) {
                                    self.onChangePage(current, size)
                                },
                                onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
                            }}
                        />
                    </Col>
                    <ModalExportReportOfMachineUser
                        reportOfMachineListResult={reportOfMachineListResult}
                        onCancel={() => this.setState({ modalExportReportMachine: false })}
                        visible={this.state.modalExportReportMachine}
                    />
                </Row>

                <Modal
                    centered
                    visible={this.state.visibleModalGoogleMap}
                    onCancel={() => this.setState({ visibleModalGoogleMap: false })}
                    title={<h3>{'Vị trí máy: ' + this.maSelected.ma_display_name}</h3>}
                    width={'70vw'}
                    footer={null}
                >

                    {(AppConsts.isValidLocation(this.maSelected.ma_gps_lat, this.maSelected.ma_gps_lng)) ?
                        <MapComponent
                            centerMap={{ lat: Number(this.maSelected.ma_gps_lat), lng: Number(this.maSelected.ma_gps_lng) }}
                            zoom={15}
                            positionList={[
                                { lat: Number(this.maSelected.ma_gps_lat), lng: Number(this.maSelected.ma_gps_lng), title: 'Vị trí máy' },
                            ]}
                        />
                        :
                        <div dangerouslySetInnerHTML={{ __html: this.maSelected.ma_mapUrl! }} />
                    }
                </Modal>

            </Card>
        )
    }
}