import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { CreateExportRepositoryInput, MachineOutOfStockQueryDto, ProductDailyMonitoringDto, ProductExportDto, SearchDailyMonitoringInput } from '@src/services/services_autogen';
import { Button, Col, Modal, Row, Space, Tabs, message } from 'antd';
import * as React from 'react';
import DetailProductOfMachine from './DetailProductOfMachine';
import { stores } from '@src/stores/storeInitializer';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import SelectedMachineMultipleOutOfStock from '@src/components/Manager/SelectedMachineMultipleOutOfStock';
import SelectedGroupMachineOutOfStock from '@src/components/Manager/SelectedGroupMachineOutOfStock';
import ActionExport from '@src/components/ActionExport';
import moment from 'moment';
import { cssColResponsiveSpan } from '@src/lib/appconst';
import confirm from 'antd/lib/modal/confirm';

export interface IProps {
    machineOutOfStockQueryDto: MachineOutOfStockQueryDto[];
    onCancel?: () => void;
    getAll?: () => void;
    onSuccess?: () => void;
    visible: boolean;

}

export default class ModalExportProductToImportInToMachine extends React.Component<IProps> {
    componentRef: any | null = null;
    state = {
        isLoadDone: true,
        us_id: undefined,
        ma_id_list: undefined,
        gr_ma_id: undefined,
        noScroll: false,
        activeTabKey: "allTab"
    };
    machineOutOfStockQueryDto: MachineOutOfStockQueryDto[] = [];
    searchDailyMonitoringInput: SearchDailyMonitoringInput = new SearchDailyMonitoringInput();
    listProductDailyExportRepository: { [key: number]: ProductDailyMonitoringDto[] }[];
    listDataExportRepository: { key: number; listProduct: ProductExportDto[] }[] = [];;
    listCreateExportRepositoryInput: CreateExportRepositoryInput[] = [];
    listNameProductNotEnough: string[] = [];
    listMaId: number[] = [];
    listGrMaId: number[] = [];
    maSearch: number[] = [];
    groupMa: number;

    async componentDidMount() {
        this.setState({ isLoadDone: false });
        const { listMachineOutOfStockQueryDto } = stores.dailyMonitorStore;
        this.machineOutOfStockQueryDto = listMachineOutOfStockQueryDto.filter(item => item.us_id_operator == stores.sessionStore.getUserLogin().id);
        if (this.machineOutOfStockQueryDto.length > 0) {
            this.listGrMaId = this.machineOutOfStockQueryDto.map(item => stores.sessionStore.getIDGroupUseName(item.ten_nhom!));
            this.listGrMaId = this.machineOutOfStockQueryDto.map(item => stores.sessionStore.getIDGroupUseName(item.ten_nhom!)).filter((value, index, self) => self.indexOf(value) === index);
            this.listMaId = this.machineOutOfStockQueryDto.map(item => item.ma_id);
        }
        await this.handleSubmitSearch()       
        this.setState({ isLoadDone: true });
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
            activeTabKey: "allTab"
        })
        this.maSearch = this.state.ma_id_list!
        this.groupMa = this.state.gr_ma_id!
        await this.handleSubmitSearch()
    }
    onSuccess = () => {
        if (!!this.props.onSuccess) { this.props.onSuccess(); }
    }
    createDicList = async () => {
        this.setState({ isLoadDone: false });
        if (Object.entries(DetailProductOfMachine.dictionary).length > 0) {
            for (const [keyStr, value] of Object.entries(DetailProductOfMachine.dictionary)) {
                const key = Number(Object.keys(value)[0]);
                const productList = Object.values(value)[0];
                const listProduct: ProductExportDto[] = [];
                productList.forEach(item => {
                    const data: ProductExportDto = new ProductExportDto();
                    data.pr_ex_quantityBeforeExport = item.ma_de_max - item.pr_quantityInMachine;
                    data.pr_ex_no = item.pr_slot_id;
                    data.pr_ex_quantity = item.ma_de_max - item.pr_quantityInMachine >= item.pr_quantityInRepository ? item.pr_quantityInRepository : item.ma_de_max - item.pr_quantityInMachine;
                    data.pr_id = stores.sessionStore.getIdProductUseName(item.pr_name!);
                    listProduct.push(data);
                })
                const existingEntry = this.listDataExportRepository.find(entry => entry.key === key);
                if (existingEntry) {
                    existingEntry.listProduct = listProduct;
                } else {
                    this.listDataExportRepository.push({ key, listProduct });
                }
            }
        }
        this.setState({ isLoadDone: true });
    }
    handleSubmitSearch = async () => {
        this.machineOutOfStockQueryDto = this.props.machineOutOfStockQueryDto != undefined ? this.props.machineOutOfStockQueryDto.filter(item => item.us_id_operator == stores.sessionStore.getUserLogin().id) : [];
        if (this.maSearch != undefined && this.maSearch.length > 0) {
            this.machineOutOfStockQueryDto = await this.machineOutOfStockQueryDto.filter(item => this.maSearch.includes(item.ma_id));
        }
        if (this.groupMa != undefined) {
            this.machineOutOfStockQueryDto = await this.machineOutOfStockQueryDto.filter(item => this.groupMa == stores.sessionStore.getIDGroupUseName(item.ten_nhom!));
        }
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }
    confirmExport = async () => {
        const self = this;
        if (this.listNameProductNotEnough.length > 0) {
            confirm({
                icon: false,
                title: "Thông báo",
                content: (
                    <span> Các mặt hàng <b>{this.listNameProductNotEnough.join(", ")}</b> hiện tại đang hết trong kho, vui lòng nhập kho, tiếp tục xuất kho những mặt hàng còn lại?</span>
                ),
                okText: ("Xác nhận"),
                cancelText: 'Hủy',
                async onOk() {
                    await self.createExportRepository();
                },
            });
        }
        else {
            await this.createExportRepository();
        }
    }
    createExportRepository = async () => {
        this.createDicList();
        if (Object.entries(this.listDataExportRepository).length > 0) {
            for (const [keyStr, value] of Object.entries(this.listDataExportRepository)) {
                const data: CreateExportRepositoryInput = new CreateExportRepositoryInput();
                data.ma_id = value.key;
                data.us_id_operator = stores.sessionStore.getMachineUseMaId(value.key).us_id_operator;
                data.listProductExport = value.listProduct;
                this.listCreateExportRepositoryInput.push(data);
            }

            await stores.exportRepositoryStore.createExportRepository(this.listCreateExportRepositoryInput);
            this.onSuccess();
            message.success("Xuất kho thành công");
            DetailProductOfMachine.dictionary = [];
        }
        else {
            message.warning("Phải chọn sản phẩm nếu muốn xuất kho!")
        }
    }
    getNameProductNotEnough = (nameList: string[]) => {
        this.listNameProductNotEnough = nameList;
    }
    render() {
        const { machineOutOfStockQueryDto } = this;
        return (
            <Modal
                visible={this.props.visible}
                title={
                    <Row>
                        <Col span={12}>
                            <h3>Danh sách xuất kho {`${machineOutOfStockQueryDto.length > 0 ? "của " + stores.sessionStore.getUserNameById(machineOutOfStockQueryDto[0].us_id_operator) : ""}`}</h3>
                        </Col>
                        <Col span={12} style={{ display: 'flex', justifyContent: "end" }}>
                            <Space>
                                <Button type='primary' onClick={() => this.confirmExport()}> Xuất kho</Button>
                                <Button danger onClick={this.props.onCancel}> Hủy</Button>
                            </Space>
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
                        <SelectedGroupMachineOutOfStock listGrIdDisplay={this.listGrMaId} groupmachineId={this.groupMa} onChangeGroupMachine={(value) => { this.groupMa = value; this.setState({ gr_ma_id: value! }); this.handleSubmitSearch() }}></SelectedGroupMachineOutOfStock>
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)}>
                        <strong>Máy bán nước</strong>
                        <SelectedMachineMultipleOutOfStock listIdDisplay={this.listMaId}
                            onChangeMachine={(value, key) => { this.maSearch = value!; this.setState({ ma_id_list: value!, activeTabKey: key }); this.handleSubmitSearch() }} groupMachineId={this.groupMa} listMachineId={this.state.ma_id_list}
                        ></SelectedMachineMultipleOutOfStock>
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)}>
                        <Space>
                            <Button placeholder='Tìm kiếm' type='primary' onClick={() => {this.handleSubmitSearch()}}><SearchOutlined />Tìm kiếm</Button>
                            {(this.state.gr_ma_id !== undefined || this.state.ma_id_list !== undefined) &&
                                <Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >{(window.innerWidth >= 576 && window.innerWidth <= 1393) ? 'Xóa' : 'Xóa tìm kiếm'}</Button>
                            }
                        </Space>
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 12, 6, 6, 6)} style={{ textAlign: "end" }}>
                        <ActionExport
                            noScrollReport={async () => { await this.setState({ noScroll: true }) }}
                            isScrollReport={async () => { await this.setState({ noScroll: false }) }}
                            nameFileExport={'Danh_sach_nhap_kho' + ' ' + moment().format('DD_MM_YYYY')}
                            idPrint={this.maSearch !== undefined && this.maSearch.length > 0 ? "machine_print_id" : "all_machine_print_id"}
                            isExcel={true}
                            isWord={true}
                            isDestroy={false}
                            onCancel={this.props.onCancel}
                            componentRef={this.componentRef}
                        />
                    </Col>
                </Row>
                <Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }}>
                    <Tabs
                        defaultActiveKey="allTab"
                        onChange={(key) => this.setState({ activeTabKey: key })}
                        activeKey={this.state.activeTabKey}
                    >
                        {this.maSearch !== undefined && this.maSearch.length > 0 ||
                            <Tabs.TabPane tab={'Tất cả'} key={'allTab'} >
                                <div id="all_machine_print_id">
                                    {machineOutOfStockQueryDto?.map(item =>
                                        <div key={item.key}>
                                            <TitleTableModalExport title={item.ten_may! + " - " + item.ma_may}></TitleTableModalExport>
                                            <DetailProductOfMachine
                                                is_printed={this.state.noScroll}
                                                getNameProductNotEnough={this.getNameProductNotEnough}
                                                productList={[...item.vending_so_luong_het_hang!, ...item.vending_so_luong_sap_het_hang!]}
                                                us_id={item.us_id_operator}
                                                ma_id={item.ma_id}
                                                export={true}
                                            />
                                        </div>
                                    )}
                                </div>
                            </Tabs.TabPane>
                        }
                        {machineOutOfStockQueryDto?.map(item =>
                            <Tabs.TabPane tab={item.ten_may} key={item.ma_id.toString()}>
                                <div id="machine_print_id" key={item.key}>
                                    <TitleTableModalExport title={item.ten_may! + " - " + item.ma_may}></TitleTableModalExport>
                                    <DetailProductOfMachine
                                        is_printed={this.state.noScroll}
                                        getNameProductNotEnough={this.getNameProductNotEnough}
                                        productList={[...item.vending_so_luong_het_hang!, ...item.vending_so_luong_sap_het_hang!]}
                                        us_id={item.us_id_operator}
                                        ma_id={item.ma_id}
                                        export={true}
                                    />
                                </div>
                            </Tabs.TabPane>
                        )}
                    </Tabs>
                </Col>
            </Modal>
        )
    }
}