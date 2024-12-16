import { DeleteOutlined } from "@ant-design/icons";
import SelectEnum from "@src/components/Manager/SelectEnum";
import SelectedGroupMachine from "@src/components/Manager/SelectedGroupMachine";
import SelectedGroupMachineOutOfStock from "@src/components/Manager/SelectedGroupMachineOutOfStock";
import SelectedGroupMachineSoftDetail from "@src/components/Manager/SelectedGroupMachineSoftDetail";
import SelectedMachineMultiple from "@src/components/Manager/SelectedMachineMultiple";
import SelectedMachineMultipleOutOfStock from "@src/components/Manager/SelectedMachineMultipleOutOfStock";
import { L } from "@src/lib/abpUtility";
import { cssColResponsiveSpan, pageSizeOptions } from "@src/lib/appconst";
import { eMachineSoftLogsStatus, valueOfeMachineSoftLogsStatus } from "@src/lib/enumconst";
import { MachineSoftLogs } from "@src/services/services_autogen";
import { stores, } from "@src/stores/storeInitializer";
import { Button, Col, Modal, Row, Table, Tag } from "antd";
import moment from "moment";
import React from "react";
import { Link } from "react-router-dom";

interface IProps {
    isVisibleModal: boolean;
    setModalClose: () => void;
    machineSoftLogSelected: MachineSoftLogs[] | undefined;
    title: string;
}
interface IState {
    isLoadDone: boolean;
    pageSize: number;
    currentPage: number;
    groupMachineId: number | undefined;
    listMachineId: number[] | undefined;
    status: number | undefined;
}
export default class ModalMachineSoftLogNotUpdate extends React.Component<IProps, IState> {
    state: IState = {
        isLoadDone: false,
        pageSize: 10,
        currentPage: 1,
        groupMachineId: undefined,
        listMachineId: undefined,
        status: undefined,
    };
    listFillter: MachineSoftLogs[] = [];
    listMaID: number[] = [];
    listGrID: number[] = [];
    componentDidMount() {
        this.setState({ isLoadDone: false });
        this.listFillter = this.props.machineSoftLogSelected != undefined ? this.props.machineSoftLogSelected : [];
        this.listMaID = this.listFillter.map(item => item.ma_so_lo_ma_id);
        this.listGrID = this.listFillter.map(item => stores.sessionStore.getIDGroupUseMaId(item.ma_so_lo_ma_id)!);
        this.listGrID = this.listGrID.filter((value, index, self) => self.indexOf(value) === index);
        this.setState({ isLoadDone: true });
    }
    handleSubmitSearch = () => {
        this.setState({ isLoadDone: false });
        this.listFillter = this.props.machineSoftLogSelected != undefined ? this.props.machineSoftLogSelected : [];
        if (this.state.listMachineId != undefined) {
            this.listFillter = this.listFillter.filter(item => this.state.listMachineId!.includes(item.ma_so_lo_ma_id));
        }
        if (this.state.groupMachineId != undefined) {
            this.listFillter = this.listFillter.filter(item => stores.sessionStore.getIDGroupUseMaId(item.ma_so_lo_ma_id) == this.state.groupMachineId);
        }
        if (this.state.status != undefined) {
            this.listFillter = this.listFillter.filter(item => item.ma_so_lo_status == this.state.status);
        }
        this.setState({ isLoadDone: true });
    }
    onCancel = () => {
        if (!!this.props.setModalClose) {
            this.props.setModalClose();
            this.setState({ groupMachineId: undefined, listMachineId: undefined });
        }
    }
    clearSearch = async () => {
        await this.setState({
            groupMachineId: undefined,
            listMachineId: undefined,
            status: undefined,
        })
        this.handleSubmitSearch();
    }
    render() {
        const columns = [
            { title: L('STT'), key: 'no_fileDocument_index', render: (text: string, item: MachineSoftLogs, index: number) => <div>{((this.state.currentPage - 1) * this.state.pageSize) + index + 1}</div> },
            {
                title: 'Nhóm máy', key: 'ma_name',
                render: (text: string, item: MachineSoftLogs) => <div>
                    <div title={`Xem chi tiết nhóm máy ${stores.sessionStore.getIDGroupUseMaId(item.ma_so_lo_ma_id)}`}>
                        <Link target="_blank" to={"/general/machine/?gr_id=" + stores.sessionStore.getIDGroupUseMaId(item.ma_so_lo_ma_id)} onClick={e => { e.stopPropagation() }} >
                            {stores.sessionStore.getNameGroupUseMaId(item.ma_so_lo_ma_id)}
                        </Link>
                    </div>
                </div>
            },
            {
                title: 'Máy bán nước', width: 150, key: "ma_may", render: (text: string, item: MachineSoftLogs) => <div>
                    {


                        <div title="Thông tin máy">
                            <Link to={"/general/machine/?machine=" + stores.sessionStore.getCodeMachines(item.ma_so_lo_ma_id)} target="_blank">
                                <p style={{ margin: 0 }}>{stores.sessionStore.getMachineCode(item.ma_so_lo_ma_id)}</p>
                                <p style={{
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    margin: 0,
                                    color: "gray",
                                    fontSize: "11px",
                                }}>{stores.sessionStore.getNameMachines(item.ma_so_lo_ma_id)}</p>
                            </Link>
                        </div>
                    }
                </div>
            },
            // { title: L('Mã phiên bản trước'), key: 'ma_so_lo_preversion_code', render: (text: string, item: MachineSoftLogs) => <div>{item.ma_so_lo_preversion_name}</div> },
            {
                title: L('Trạng thái'), key: 'EMachineSoftLogsStatus', render: (text: string, item: MachineSoftLogs) => <div>
                    {item.ma_so_lo_status == eMachineSoftLogsStatus.NOT_UPDATED.num && <Tag color="volcano">{valueOfeMachineSoftLogsStatus(item.ma_so_lo_status)}</Tag>}
                    {
                        item.ma_so_lo_status == eMachineSoftLogsStatus.UPDATED.num && <Tag color="success">{valueOfeMachineSoftLogsStatus(item.ma_so_lo_status)}</Tag>
                    }
                </div>
            },
            {
                title: L('Thời gian cập nhật'),
                key: 'ma_so_lo_upgrade_at',
                sorter: (a: MachineSoftLogs, b: MachineSoftLogs) => {
                    const dateA = moment(a.ma_so_lo_upgrade_at).valueOf();
                    const dateB = moment(b.ma_so_lo_upgrade_at).valueOf();
                    return dateA - dateB;
                },
                render: (text: string, item: MachineSoftLogs) => (
                    <div>{item.ma_so_lo_upgrade_at ? moment(item.ma_so_lo_upgrade_at).format("DD/MM/YYYY HH:mm:ss") : "Máy chưa được cập nhật phiên bản này!"}</div>
                )
            }
        ]
        return (
            <Modal
                title={<strong>{"Danh sách máy được tạo cập nhật phiên bản " + this.props.title}</strong>}
                visible={this.props.isVisibleModal}
                onCancel={this.props.setModalClose}
                footer={null}
                width={"50vw"}>
                <Row gutter={[8, 8]} align="bottom">
                    <Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)}>
                        <strong>Nhóm máy</strong>
                        <SelectedGroupMachineSoftDetail
                            listGrIdDisplay={this.listGrID}
                            groupmachineId={this.state.groupMachineId}
                            onChangeGroupMachine={async (value) => { await this.setState({ groupMachineId: value }); this.handleSubmitSearch() }} />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)}>
                        <strong>Máy bán nước</strong>
                        <SelectedMachineMultipleOutOfStock
                            listIdDisplay={this.listMaID}
                            onChangeMachine={async (value) => {
                                await this.setState({ listMachineId: value });
                                await this.handleSubmitSearch()
                            }}
                            groupMachineId={this.state.groupMachineId} listMachineId={this.state.listMachineId} />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)}>
                        <strong>Trạng thái</strong>
                        <SelectEnum eNum={eMachineSoftLogsStatus} onChangeEnum={async e => { await this.setState({ status: e }); await this.handleSubmitSearch() }}
                            enum_value={this.state.status}
                        />
                    </Col>
                    {(!!this.state.groupMachineId || !!this.state.listMachineId || !!this.state.status) &&
                        <Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)}>
                            <Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >Xóa tìm kiếm</Button>
                        </Col>
                    }

                </Row>
                <Table
                    className="centerTable"
                    rowKey={record => "quanlyhocvien_index__" + JSON.stringify(record)}
                    size="middle"
                    bordered={true}
                    scroll={{ y: 500 }}
                    columns={columns}
                    dataSource={this.listFillter}
                    pagination={{
                        position: ['topRight'],
                        pageSize: this.state.pageSize,
                        total: this.listFillter.length,
                        current: this.state.currentPage,
                        showTotal: (tot) => <>Tổng: <b>{tot}</b></>,
                        showQuickJumper: true,
                        showSizeChanger: true,
                        pageSizeOptions: pageSizeOptions,
                        onChange: (page: number, pagesize?: number) => this.setState({ currentPage: page, pageSize: pagesize! }),
                    }}
                />

            </Modal>
        )
    }
}