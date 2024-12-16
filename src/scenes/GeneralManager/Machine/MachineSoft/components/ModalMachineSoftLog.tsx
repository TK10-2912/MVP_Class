import { DeleteOutlined } from "@ant-design/icons";
import SelectedGroupMachine from "@src/components/Manager/SelectedGroupMachine";
import SelectedMachineMultiple from "@src/components/Manager/SelectedMachineMultiple";
import { L } from "@src/lib/abpUtility";
import { cssColResponsiveSpan, pageSizeOptions } from "@src/lib/appconst";
import { MachineSoftLogs } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import { Button, Col, Modal, Row, Table } from "antd";
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
    listMachineId: number[] | undefined; // Or string[], depending on the type of IDs
}
export default class ModalMachineSoftLog extends React.Component<IProps, IState> {
    state: IState = {
        isLoadDone: false,
        pageSize: 10,
        currentPage: 1,
        groupMachineId: undefined,
        listMachineId: undefined,
    }
    componentDidMount() {
        this.handleSubmitSearch();
    }
    getAll = async () => {
        this.setState({ isLoadDone: false });
        // await stores.machineSoftStore.getAllMachineSoftLogs(this.state.listMachineId, undefined, undefined, undefined, undefined, undefined,undefined);
        this.setState({ isLoadDone: true });
    }
    handleSubmitSearch = async () => {
        this.onChangePage(1, this.state.pageSize);
    }
    onChangePage = async (page: number, pagesize?: number) => {
        if (pagesize !== undefined) {
            await this.setState({ pageSize: pagesize! });
        }
        // this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
        // })
        this.getAll();
    }
    clearSearch = async () => {
        await this.setState({
            groupMachineId: undefined,
            listMachineId: undefined,
        })
        this.handleSubmitSearch();
    }
    onCancel = () => {
        if (!!this.props.setModalClose) {
            this.props.setModalClose();
            this.setState({ groupMachineId: undefined, listMachineId: undefined });
        }
    }
    render() {
        const sessionStore = stores.sessionStore;
        const filteredData = this.props.machineSoftLogSelected?.filter((item: MachineSoftLogs) => {
            const isGroupMatch = this.state.groupMachineId
                ? sessionStore.getIDGroupUseMaId(item.ma_so_lo_ma_id) === this.state.groupMachineId
                : true;
            const isMachineMatch = this.state.listMachineId
                ? this.state.listMachineId.includes(item.ma_so_lo_ma_id)
                : true;
            return isGroupMatch && isMachineMatch;
        }) ?? [];
        const columns = [
            { title: L('STT'), key: 'no_fileDocument_index', render: (text: string, item: MachineSoftLogs, index: number) => <div>{((this.state.currentPage - 1) * this.state.pageSize) + index + 1}</div> },
            { title: L('Mã phiên bản cập nhật'), key: 'ma_so_lo_preversion_code', render: (text: string, item: MachineSoftLogs) => <div>{item.ma_so_lo_preversion_code}</div> },
            { title: L('Phiên bản cập nhật'), key: 'ma_so_lo_preversion_name', render: (text: string, item: MachineSoftLogs) => <div>{item.ma_so_lo_preversion_name}</div> },
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
                title: 'Máy bán nước', key: "ma_may", render: (text: string, item: MachineSoftLogs) => <div>
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
            {
                title: L('Thời gian cập nhật'),
                key: 'ma_so_lo_upgrade_at',
                sorter: (a: MachineSoftLogs, b: MachineSoftLogs) => {
                    const dateA = moment(a.ma_so_lo_upgrade_at).valueOf();
                    const dateB = moment(b.ma_so_lo_upgrade_at).valueOf();
                    return dateA - dateB;
                },
                render: (text: string, item: MachineSoftLogs) => (
                    <div>{moment(item.ma_so_lo_upgrade_at).format("DD/MM/YYYY HH:mm")}</div>
                )
            }

        ]
        return (
            <Modal
                title={<strong>{"Danh sách máy đã cập nhật phiên bản " + this.props.title}</strong>}
                visible={this.props.isVisibleModal}
                onCancel={() => this.onCancel()}
                footer={null}
                width={"50vw"}
            >
                <Row gutter={[8, 8]} align="bottom">
                    <Col {...cssColResponsiveSpan(24, 12, 8, 8, 8, 8)}>
                        <strong>Nhóm máy</strong>
                        <SelectedGroupMachine groupmachineId={this.state.groupMachineId} onChangeGroupMachine={async (value) => { await this.setState({ groupMachineId: value }); this.handleSubmitSearch() }} />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 8, 8, 8)}>
                        <strong>Máy bán nước</strong>
                        <SelectedMachineMultiple
                            onChangeMachine={async (value) => { await this.setState({ listMachineId: value }); await this.handleSubmitSearch() }} groupMachineId={this.state.groupMachineId} listMachineId={this.state.listMachineId} />
                    </Col>
                    {(!!this.state.groupMachineId || !!this.state.listMachineId) &&
                        <Col {...cssColResponsiveSpan(24, 12, 8, 8, 8, 8)}>
                            <Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >Xóa tìm kiếm</Button>
                        </Col>
                    }
                </Row>
                <Table
                    className='centerTable'
                    rowKey={record => "quanlyhocvien_index__" + JSON.stringify(record)}
                    size={'middle'}
                    bordered={true}
                    scroll={{ y: 500 }}
                    columns={columns}
                    dataSource={filteredData}
                    pagination={{
                        position: ['topRight'],
                        pageSize: this.state.pageSize,
                        total: filteredData.length,
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