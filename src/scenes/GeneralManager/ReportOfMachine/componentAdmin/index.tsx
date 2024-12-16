import AppConsts, { EventTable, cssCol, cssColResponsiveSpan } from "@src/lib/appconst";
import { ReportOfMachineDto } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import { Button, Card, Col, Input, Row, message } from "antd";
import * as React from "react";
import SelectEnum from "@src/components/Manager/SelectEnum";
import { eReportLevel, eReportStatus, eSort } from "@src/lib/enumconst";
import { DeleteOutlined, ExportOutlined, SearchOutlined } from "@ant-design/icons";
import TableReportOfMachineAdmin from "./TableReportOfMachineAdmin";
import UpdateReportOfMachineAdmin from "./UpdateReportOfMachineAdminAdmin";
import ModalExportReportOfMachineAdmin from "./ExportModalReportOfMachineAdmin";
import SelectUserMultiple from "@src/components/Manager/SelectUserMultiple";
import { SorterResult } from "antd/lib/table/interface";
import SelectedGroupMachine from "@src/components/Manager/SelectedGroupMachine";
import SelectedMachineMultiple from "@src/components/Manager/SelectedMachineMultiple";
import { isGranted } from "@src/lib/abpUtility";
export interface Iprops {
    ma_id: number;
}
export default class ReportOfMachineAdmin extends React.Component<Iprops> {
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
    }
    reportOfMachineSelected: ReportOfMachineDto = new ReportOfMachineDto();

    async componentDidMount() {
        const urlParams = new URLSearchParams(window.location.search);
        const re_code = urlParams.get('re_code');
        const gr_ma_id = Number(urlParams.get('gr_ma_id'));
        const ma_id_list = Number(urlParams.get('ma_id_list'));
        if (!!re_code) {
            await this.setState({ re_code: re_code });
        }
        await this.getAll();
    }

    async getAll() {

        this.setState({ isLoadDone: false });
        await stores.reportOfMachineStore.getAllByAdmin(this.state.us_id_list, this.state.re_status, this.state.re_level, this.state.re_code, this.state.fieldSort, this.state.sort, this.state.skipCount, this.state.pageSize, undefined, undefined, this.state.gr_ma_id, this.state.ma_id_list);
        await stores.machineStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined);
        this.setState({ isLoadDone: true });
    }

    createOrUpdateModalOpen = async (input: ReportOfMachineDto) => {
        if (input !== undefined && input !== null) {
            this.reportOfMachineSelected.init(input);
            await this.setState({ visibleModalCreateUpdate: true, isLoadDone: true });
        }
    }
    actionTable = (reportMachine: ReportOfMachineDto, event: EventTable) => {
        if (reportMachine == undefined || reportMachine.ma_id == undefined) {
            message.error("Không tìm thấy !");
            return;
        }
        if (event == EventTable.Edit || event == EventTable.RowDoubleClick) {
            this.createOrUpdateModalOpen(reportMachine);
        }
    }
    onCreateUpdateSuccess = () => {
        this.setState({ visibleModalCreateUpdate: false, })
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
            ma_id_list: undefined,
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
        const left = this.state.visibleModalCreateUpdate ? cssCol(14) : cssCol(24);
        const right = this.state.visibleModalCreateUpdate ? cssCol(10) : cssCol(0);
        return (
            <Card>
                <Row>

                    <Col {...cssColResponsiveSpan(18, 17, 12, 12, 12, 12)} >
                        <h2>Quản lý tình trạng máy bán nước</h2>
                    </Col>
                    {(this.props.ma_id == undefined) &&
                        <Col {...cssColResponsiveSpan(6, 7, 12, 12, 12, 12)} style={{ textAlign: "right" }}>
                            {isGranted(AppConsts.Permission.Pages_Manager_General_ReportOfMachine_Export) &&
                                <Button type="primary" icon={<ExportOutlined />} title="Xuất dữ liệu" onClick={() => this.setState({ modalExportReportMachine: true })}>{(window.innerWidth > 688) && 'Xuất dữ liệu'}</Button>
                            }
                        </Col>
                    }
                </Row>
                <Row gutter={[8, 8]} align="middle" >
                    {!!this.props.ma_id ?
                        ""
                        :
                        <Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 3)}>
                            <strong>Người dùng:</strong><br />
                            <SelectUserMultiple
                                us_id_list={this.state.us_id_list}
                                onChangeUser={async (value) => {
                                    await this.setState({ us_id_list: value }); this.getAll();
                                }}
                            ></SelectUserMultiple>
                        </Col>
                    }
                    <Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 3)}>
                        <strong>Mã báo cáo</strong>
                        <Input allowClear
                            onChange={(e) => this.setState({ re_code: e.target.value })} placeholder={"Nhập tìm kiếm..."}
                            onPressEnter={this.handleSubmitSearch}
                            value={this.state.re_code}
                        />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 4)}>
                        <strong>Nhóm máy</strong>
                        <SelectedGroupMachine groupmachineId={this.state.gr_ma_id} onChangeGroupMachine={(value) => { this.setState({ gr_ma_id: value }); this.getAll() }}></SelectedGroupMachine>
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 5, 5, 3)}>
                        <strong>Máy bán nước</strong>
                        <SelectedMachineMultiple onChangeMachine={(value) => { this.setState({ ma_id_list: value }); this.getAll() }} groupMachineId={this.state.gr_ma_id} listMachineId={this.state.ma_id_list} />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 3)}>
                        <strong>Trạng thái</strong>
                        <SelectEnum
                            eNum={eReportStatus}
                            onChangeEnum={async (e) => { await this.setState({ re_status: e }); this.getAll() }}
                            enum_value={this.state.re_status}
                        ></SelectEnum>
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 3)}>
                        <strong>Mức nghiêm trọng</strong>
                        <SelectEnum
                            eNum={eReportLevel}
                            onChangeEnum={async (e) => { await this.setState({ re_level: e }); this.getAll() }}
                            enum_value={this.state.re_level}
                        ></SelectEnum>
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 5)} style={{ display: "flex", gap: 8, marginTop: 20 }}>
                        {(this.props.ma_id == undefined) &&
                            <Button type="primary" icon={<SearchOutlined />} title="Tìm kiếm" onClick={() => this.handleSubmitSearch()} >Tìm kiếm</Button>
                        }
                        {(this.state.re_code != undefined || this.state.us_id_list != undefined || this.state.re_level != undefined || this.state.re_status != undefined || this.state.gr_ma_id != undefined || this.state.ma_id_list != undefined) &&
                            <Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >{this.shouldChangeText() ? 'Xóa tìm kiếm' : 'Xóa'}</Button>
                        }
                    </Col>
                </Row>

                <Row>
                    <Col {...left} style={{ overflowY: "auto" }}>
                        <TableReportOfMachineAdmin
                            actionTable={this.actionTable}
                            changeColumnSort={this.changeColumnSort}
                            reportOfMachineListResult={reportOfMachineListResult}
                            isLoadDone={this.state.isLoadDone}
                            is_Printed={false}
                            pagination={{
                                pageSize: this.state.pageSize,
                                total: totalReportOfMachine,
                                current: this.state.currentPage,
                                showTotal: (tot) => ("Tổng: ") + tot + "",
                                showQuickJumper: true,
                                showSizeChanger: true,
                                pageSizeOptions: ['10', '20', '50', '100'],
                                onShowSizeChange(current: number, size: number) {
                                    self.onChangePage(current, size)
                                },
                                onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
                            }}
                        />
                    </Col>
                    <Col  {...right}>
                        {this.state.visibleModalCreateUpdate &&
                            <UpdateReportOfMachineAdmin
                                reportOfMachineSelected={this.reportOfMachineSelected}
                                onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
                                onCreateUpdateSuccess={this.onCreateUpdateSuccess}
                            />
                        }
                    </Col>
                    <ModalExportReportOfMachineAdmin
                        reportOfMachineListResult={reportOfMachineListResult}
                        onCancel={() => this.setState({ modalExportReportMachine: false })}
                        visible={this.state.modalExportReportMachine}
                    />
                </Row>
            </Card>
        )
    }
}