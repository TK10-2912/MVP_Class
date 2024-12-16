import ActionExport from '@src/components/ActionExport';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { MachineOutOfStockQueryDto, MachineOutOfStockQueryDtoListResultDto, SearchDailyMonitoringAdminInput, SearchDailyMonitoringInput } from '@src/services/services_autogen';
import { Button, Col, Modal, Row, Space } from 'antd';
import moment from 'moment';
import * as React from 'react';
import TableMainMachineOutOfStock from './TableMainMachineOutOfStock';
import DetailProductOfMachine from './DetailProductOfMachine';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';
import AppConsts, { cssColResponsiveSpan } from '@src/lib/appconst';
import SelectedGroupMachine from '@src/components/Manager/SelectedGroupMachine';
import { stores } from '@src/stores/storeInitializer';
import { isGranted } from '@src/lib/abpUtility';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';

export interface IProps {
    machineOutOfStockQueryDto: MachineOutOfStockQueryDto[];
    onCancel?: () => void;
    getAll?: () => void;
    visible: boolean;
}

export default class ModalExportProductToImportInToMachine extends React.Component<IProps> {
    componentRef: any | null = null;
    state = {
        isLoadDone: true,
        ma_id_list: undefined,
        gr_ma_id: undefined,
    };
    machineOutOfStockQueryDto: MachineOutOfStockQueryDto[] = [];
    machineOutOfStockQueryDtoListResultDto: MachineOutOfStockQueryDtoListResultDto = new MachineOutOfStockQueryDtoListResultDto();
    searchDailyMonitoringInput: SearchDailyMonitoringInput = new SearchDailyMonitoringInput();
    searchDailyMonitoringAdminInput: SearchDailyMonitoringAdminInput = new SearchDailyMonitoringAdminInput();

    async componentDidMount() {
        await this.getAll();
    }

    getAllAdmin = async () => {
        this.setState({ isLoadDone: false });
        this.searchDailyMonitoringAdminInput.gr_ma_id = this.state.gr_ma_id;
        this.searchDailyMonitoringAdminInput.ma_id_list = this.state.ma_id_list;
        this.machineOutOfStockQueryDtoListResultDto = await stores.dailyMonitorStore.machineOutOfStockQueryAdmin(this.searchDailyMonitoringAdminInput);
        await stores.machineStore.getAllByAdmin(undefined, undefined, undefined, undefined, undefined, undefined, undefined);
        this.setState({ isLoadDone: true })
    }
    async getAllUser() {
        this.setState({ isLoadDone: false });
        this.searchDailyMonitoringInput.gr_ma_id = this.state.gr_ma_id;
        this.searchDailyMonitoringInput.ma_id_list = this.state.ma_id_list;
        this.machineOutOfStockQueryDtoListResultDto = await stores.dailyMonitorStore.machineOutOfStockQuery(this.searchDailyMonitoringInput);
        await stores.machineStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined);
        this.setState({ isLoadDone: true })
    }
    getAll = () => {
        isGranted(AppConsts.Permission.Pages_DailyMonitoring_Admin_OutOfStock) ? this.getAllAdmin() : this.getAllUser()
    }
    setComponentRef = (ref) => {
        this.setState({ isLoadDone: false });
        this.componentRef = ref;
        this.setState({ isLoadDone: true });
    }
    clearSearch = async () => {
        await this.setState({
            gr_ma_id: undefined,
            ma_id_list: undefined,
            us_id_list: undefined,
        })
        this.getAll();
    }
    render() {
        const { machineOutOfStockQueryDto } = this.props;
        return (
            <Modal
                visible={this.props.visible}
                title={
                    <Row >
                        <Col span={12}>
                            <h3>Xuất danh sách máy hết hàng</h3>
                        </Col>
                        <Col span={12} style={{ textAlign: 'end' }}>
                            <ActionExport
                                nameFileExport={'MachineOutOfStock' + '_' + moment().format('DD_MM_YYYY')}
                                idPrint="machine_print_id"
                                isExcel={true}
                                isWord={true}
                                componentRef={this.componentRef}
                                onCancel={this.props.onCancel}
                                isDestroy={true}
                            />
                        </Col>
                    </Row>
                }
                closable={false}
                cancelButtonProps={{ style: { display: "none" } }}
                onCancel={() => { this.props.onCancel!() }}
                footer={null}
                width='90vw'
                maskClosable={false}

            >
                <Row align='bottom' gutter={[8, 8]} className='alighItemFlexEnd-col-1600px'>
                    <Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)}>
                        <strong>Nhóm máy</strong>
                        <SelectedGroupMachine groupmachineId={this.state.gr_ma_id} onChangeGroupMachine={(value) => { this.setState({ gr_ma_id: value }); this.getAll() }}></SelectedGroupMachine>
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)}>
                        <strong>Máy bán nước</strong>
                        <SelectedMachineMultiple
                            onChangeMachine={(value) => { this.setState({ ma_id_list: value }); this.getAll() }} groupMachineId={this.state.gr_ma_id} listMachineId={this.state.ma_id_list}
                        ></SelectedMachineMultiple>
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)}>
                        <Space>
                            <Button placeholder='Tìm kiếm' type='primary' onClick={() => this.getAll()}><SearchOutlined />Tìm kiếm</Button>
                            {(this.state.gr_ma_id !== undefined || this.state.ma_id_list !== undefined) &&
                                <Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >{(window.innerWidth >= 576 && window.innerWidth <= 1393) ? 'Xóa' : 'Xóa tìm kiếm'}</Button>
                            }
                        </Space>
                    </Col>
                </Row>
                <Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id="machine_print_id">
                    {!!this.machineOutOfStockQueryDtoListResultDto.items && this.machineOutOfStockQueryDtoListResultDto.items.map(item =>

                        <>
                            <TitleTableModalExport title={item.ten_may! + " - " + item.ma_may}></TitleTableModalExport>
                            <DetailProductOfMachine
                                productList={[...item.vending_so_luong_sap_het_hang!, ...item.vending_so_luong_het_hang!]}
                                is_printed={true}
                            />
                        </>

                    )}
                </Col>
            </Modal>
        )
    }
}