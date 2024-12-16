import * as React from 'react';
import { DeleteFilled, DeleteOutlined, ExportOutlined, ImportOutlined, PlusOutlined, SearchOutlined, WarningOutlined } from '@ant-design/icons';
import { EventTable, cssCol, cssColResponsiveSpan } from '@src/lib/appconst';
import { FreshDrinkDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Badge, Button, Card, Col, Input, Modal, Popover, Row, message } from 'antd';
import FreshDrinkTable from './component/FreshDrinkTable';
import CreateOrUpdateFreshDrink from './component/CreateOrUpdateFreshDrink';
import ModalExportFreshDrink from './component/ModalExportFreshDrink';
import SelectEnum from '@src/components/Manager/SelectEnum';
import SelectedSupplier from '@src/components/Manager/SelectedSupplier';
import { eMoney, eSort } from '@src/lib/enumconst';
import { L } from '@src/lib/abpUtility';
import { SorterResult, TableRowSelection } from 'antd/lib/table/interface';
import ImportSampleExcelDataFreshDrink from './component/ImportSampleExcelDataFreshDrink';

const { confirm } = Modal;

export default class FreshDrink extends React.Component {
    state = {
        isLoadDone: false,
        visibleModalCreateUpdate: false,
        visibleExportExcelFreshDrink: false,
        visibleModalImport: false,
        fr_dr_name: undefined,
        fr_dr_price_down: undefined,
        fr_dr_price_up: undefined,
        su_id: undefined,
        skipCount: 0,
        maxResultCount: 10,
        onChangePage: 1,
        currentPage: 1,
        pageSize: 10,
        clicked: false,
        numberSelected: 0,
        select: false,
        sort: undefined,

    };

    freshDrinkSelected: FreshDrinkDto = new FreshDrinkDto();
    listItemFreshDrink: FreshDrinkDto[] = [];
    keySelected: number[] = [];
    selectedField: string;

    async componentDidMount() {
        await this.getAll();
    }

    async getAll() {
        this.setState({ isLoadDone: false });
        await stores.freshDrinkStore.getAll(this.state.fr_dr_name, this.state.su_id, this.state.fr_dr_price_down, this.state.fr_dr_price_up, this.selectedField, this.state.sort, this.state.skipCount, undefined);
        this.setState({ isLoadDone: true, visibleModalCreateUpdate: false, visibleExportExcelAuthor: false });
    }

    handleSubmitSearch = async () => {
        this.onChangePage(1, this.state.pageSize);
    }
    handleVisibleChange = (visible) => {
        this.setState({ clicked: visible });
    }
    onChangePage = async (page: number, pagesize?: number) => {
        if (pagesize !== undefined) {
            await this.setState({ pageSize: pagesize! });
        }
        await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            this.getAll();
        })
    }

    createOrUpdateModalOpen = async (input: FreshDrinkDto) => {
        if (input !== undefined && input !== null) {
            this.freshDrinkSelected.init(input);
            await this.setState({ visibleModalCreateUpdate: true, isLoadDone: true });
        }
    }
    actionTable = (drink: FreshDrinkDto, event: EventTable) => {
        let self = this;
        if (drink === undefined || drink.fr_dr_id === undefined) {
            message.error("Không tìm thấy !");
            return;
        }
        if (event === EventTable.Edit || event === EventTable.RowDoubleClick) {
            this.createOrUpdateModalOpen(drink);
        }
        else if (event === EventTable.Delete) {
            confirm({
                title: 'Bạn có chắc muốn xóa sản phẩm: ' + drink.fr_dr_name + "?",
                okText: "Xác nhận",
                cancelText: "Hủy",
                async onOk() {
                    await stores.freshDrinkStore.deleteFreshDrink(drink);
                    await self.getAll();
                    message.success("Xóa thành công !")
                    self.setState({ isLoadDone: true });
                },
                onCancel() {
                },
            });
        }
    };
    onCreateUpdateSuccess = () => {
        this.setState({ isLoadDone: false });
        this.getAll();
        this.setState({ isLoadDone: true, visibleModalCreateUpdate: false, })
    }
    clearSearch = async () => {
        await this.setState({
            fr_dr_name: undefined,
            su_id: undefined,
            fr_dr_price_down: undefined,
            fr_dr_price_up: undefined,
        })
        this.getAll();
    }
    onChange = (listItemDrink: FreshDrinkDto[], listIdFreshDrink: number[]) => {
        this.setState({ isLoadDone: false });
        if (listItemDrink.length > 0) {
            this.listItemFreshDrink = listItemDrink;
            this.keySelected = listIdFreshDrink;
            if (listIdFreshDrink.length > 0) {
                this.setState({ visibleModalCreateUpdate: false })
            }
        }
        this.setState({ isLoadDone: true, numberSelected: listItemDrink.length });
    }

    deleteMulti = async (listIdFreshDrink: number[]) => {
        if (listIdFreshDrink.length < 1) {
            await message.error(L("Hãy chọn 1 hàng trước khi xóa"));
        }
        else {
            let self = this;
            const { totalDrink } = stores.drinkStore;
            confirm({
                icon: false,
                title: <span><WarningOutlined style={{ fontSize: "23px", color: "orange" }} /> Bạn có muốn <span style={{ color: "red" }}>xóa hàng loạt</span> {listIdFreshDrink.length} dữ liệu ? Thao tác này khi xác nhận <span style={{ color: "red" }}>không thể hoàn tác</span>.</span>,
                okText: L('Xác nhận'),
                cancelText: L('Hủy'),
                async onOk() {
                    if (self.state.currentPage > 1 && (totalDrink - self.keySelected.length) % 10 == 0) self.onChangePage(self.state.currentPage - 1, self.state.pageSize)
                    await stores.freshDrinkStore.deleteMulti(listIdFreshDrink);
                    await self.getAll();
                    message.success(L("Xóa thành công" + "!"))
                    self.setState({ isLoadDone: true, numberSelected: 0 });
                },
                onCancel() {
                },
            });
        }
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
            icon: false,
            title: titleConfirm,
            okText: L("Delete"),
            cancelText: cancelText,
            async onOk() {
                await stores.freshDrinkStore.deleteAll();
                await self.getAll();
                message.success(L("Xóa thành công"));
            },
            onCancel() {

            },
        });
        this.setState({ isLoadDone: true });
    }
    rowSelection: TableRowSelection<FreshDrinkDto> = {
        onChange: (listItemFreshDrink: React.Key[], listItem: FreshDrinkDto[]) => {
            this.setState({ isLoadDone: false })
            this.listItemFreshDrink = listItem;
            this.keySelected = listItem.map(item => item.fr_dr_id);
            this.setState({ isLoadDone: true, numberSelected: listItem.length })
        }
    }
    onRefreshData = () => {
        this.setState({ visibleModalImport: false });
        this.getAll();
    }

    shouldChangeText = () => {
        const isChangeText = window.innerWidth <= 768;
        return !isChangeText;
    }
    hide = () => {
        this.setState({ clicked: false });
    }
    changeColumnSort = async (sort: SorterResult<FreshDrinkDto> | SorterResult<FreshDrinkDto>[]) => {
        this.setState({ isLoadDone: false });
        this.selectedField = sort['field'];
        await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
        await this.getAll();
        this.setState({ isLoadDone: true });

    }
    render() {
        let self = this;
        const { freshDrinkListResult, totalFreshDrink } = stores.freshDrinkStore;
        const left = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 12, 14, 14, 14) : cssCol(24);
        const right = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 12, 10, 10, 10) : cssCol(0);
        return (
            <Card>
                <Row gutter={[8, 8]}>
                    <Col {...cssColResponsiveSpan(15, 12, 8, 8, 8, 8)}>
                        <h2>Sản phẩm không có bao bì</h2>
                    </Col>
                    <Col {...cssColResponsiveSpan(9, 12, 16, 16, 16, 16)} style={{ display: "flex", flexWrap: "wrap", justifyContent: "end", gap: 8 }}>
                        <Button title='Thêm mới' type="primary" icon={<PlusOutlined />} onClick={() => this.createOrUpdateModalOpen(new FreshDrinkDto())}>{this.shouldChangeText() && 'Thêm mới'}</Button>
                        <Button title='Xuất dữ liệu' type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcelFreshDrink: true, select: false })}>{this.shouldChangeText() && 'Xuất dữ liệu'}</Button>
                        <Button title='Nhập dữ liệu' type="primary" icon={<ImportOutlined />} onClick={() => this.setState({ visibleModalImport: true })}>{this.shouldChangeText() && 'Nhập dữ liệu'}</Button>

                    </Col>
                </Row>
                <Row gutter={[8, 8]} align='bottom'>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 4)}>
                        <strong>Tên sản phẩm</strong>
                        <Input allowClear
                            onChange={(e) => this.setState({ fr_dr_name: e.target.value })} placeholder={"Nhập tìm kiếm..."}
                            onPressEnter={this.handleSubmitSearch}
                            value={this.state.fr_dr_name}
                        />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 4)}>
                        <strong>Nhà cung cấp</strong>
                        <SelectedSupplier
                            onChangeSupplier={(e) => {
                                this.setState({ su_id: e });
                            }}
                            supplierID={this.state.su_id}
                        ></SelectedSupplier>
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 4)}>
                        <strong>Giá từ</strong>
                        <SelectEnum
                            eNum={eMoney}
                            onChangeEnum={(e) => this.setState({ fr_dr_price_down: e })}
                            enum_value={this.state.fr_dr_price_down}
                            disableHighPrice={this.state.fr_dr_price_up}
                        ></SelectEnum>
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 4, 4, 4)}>
                        <strong>Đến</strong>
                        <SelectEnum
                            eNum={eMoney}
                            disableLowPrice={this.state.fr_dr_price_down}
                            onChangeEnum={(e) => this.setState({ fr_dr_price_up: e })}
                            enum_value={this.state.fr_dr_price_up}
                        ></SelectEnum>
                    </Col>
                    <Col className='textAlignCenter-col-992' {...cssColResponsiveSpan(24, 24, 12, 8, 8, 8)} style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "start" }} >
                        <Button type="primary" icon={<SearchOutlined />} title="Tìm kiếm" onClick={() => this.handleSubmitSearch()} >Tìm kiếm</Button>
                        {(this.state.fr_dr_name != undefined || this.state.su_id != undefined || this.state.fr_dr_price_down != undefined || this.state.fr_dr_price_up != undefined) &&
                            <Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >Xóa tìm kiếm</Button>
                        }
                    </Col>
                    {this.state.visibleModalCreateUpdate == false &&
                        <Col span={24} >
                            <Badge count={this.state.numberSelected}>
                                <Popover style={{ width: "200px" }} visible={this.state.clicked} onVisibleChange={(e) => this.handleVisibleChange(e)} placement="right" content={
                                    <>
                                        {this.keySelected.length > 0 ?
                                            <>
                                                <Row style={{ alignItems: "center", marginTop: "10px" }}>
                                                    <Button
                                                        danger icon={<DeleteFilled />} title={L("Delete")}
                                                        style={{ marginLeft: '10px' }}
                                                        size='small'
                                                        onClick={() => { this.deleteMulti(this.keySelected); this.hide() }}
                                                    ></Button>
                                                    <a style={{ paddingLeft: "10px", color: "red" }} onClick={() => { this.deleteMulti(this.keySelected); this.hide() }}>{L('Xóa hàng loạt')}</a>
                                                </Row>
                                            </>
                                            :
                                            <>
                                                <Row style={{ alignItems: "center" }}>
                                                    <Button
                                                        danger icon={<DeleteOutlined />} title={L("xoa_tat_ca")}
                                                        style={{ marginLeft: '10px' }}
                                                        size='small'
                                                        type='primary'
                                                        onClick={() => { this.deleteAll(); this.hide() }}
                                                    ></Button>
                                                    <a style={{ paddingLeft: "10px", color: "red" }} onClick={() => { this.deleteAll(); this.hide() }}>{L('xoa_tat_ca')}</a>
                                                </Row>
                                            </>
                                        }
                                        <Row style={{ alignItems: "center", marginTop: "10px" }}>
                                            <Button
                                                type='primary'
                                                icon={<ExportOutlined />} title={"Xuất dữ liệu"}
                                                style={{ marginLeft: '10px' }}
                                                size='small'
                                                onClick={async () => {
                                                    if (this.keySelected.length < 1) {
                                                        await message.warning(L("Hãy chọn một hàng muốn xuất dữ liệu"));
                                                    }
                                                    else {
                                                        this.setState({ visibleExportExcelFreshDrink: true, select: true })
                                                    }
                                                }}
                                            ></Button>
                                            <a style={{ paddingLeft: "10px" }} onClick={async () => {
                                                if (this.keySelected.length < 1) {
                                                    await message.warning(L("Hãy chọn một hàng muốn xuất dữ liệu"));
                                                }
                                                else {
                                                    this.setState({ visibleExportExcelFreshDrink: true, select: true })
                                                };
                                            }}>{"Xuất dữ liệu"}</a>

                                        </Row>
                                    </>
                                } trigger={['hover']} >
                                    <Button type='primary'>{L("Thao tác hàng loạt")}</Button>
                                </Popover >
                            </Badge>
                        </Col>
                    }
                </Row>
                <Row>
                    <Col {...left} style={{ overflowY: "auto" }}>
                        <FreshDrinkTable
                            rowSelection={this.rowSelection}
                            actionTable={this.actionTable}
                            hasAction={this.keySelected.length > 0 ? false : true}
                            freshDrinkListResult={freshDrinkListResult}
                            isLoadDone={this.state.isLoadDone}
                            changeColumnSort={this.changeColumnSort}
                            // pagination={{
                            //     pageSize: this.state.pageSize,
                            //     total: totalFreshDrink,
                            //     current: this.state.currentPage,
                            //     showTotal: (tot) => ("Tổng: ") + tot + "",
                            //     showQuickJumper: true,
                            //     showSizeChanger: true,
                            //     pageSizeOptions: ['10', '20', '50', '100'],
                            //     onShowSizeChange(current: number, size: number) {
                            //         self.onChangePage(current, size)
                            //     },
                            //     onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
                            // }}
                            pagination={false}
                        />
                    </Col>
                    {this.state.visibleModalCreateUpdate &&
                        <Col  {...right}>
                            <CreateOrUpdateFreshDrink
                                freshDrinkSelected={this.freshDrinkSelected}
                                onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
                                onCreateUpdateSuccess={this.onCreateUpdateSuccess}
                            />
                        </Col>
                    }
                </Row>
                <ModalExportFreshDrink
                    freshDrinkListResult={this.state.select ? this.listItemFreshDrink : freshDrinkListResult}
                    visible={this.state.visibleExportExcelFreshDrink}
                    onCancel={() => this.setState({ visibleExportExcelFreshDrink: false })}
                />
                <Modal
                    visible={this.state.visibleModalImport}
                    closable={false}
                    maskClosable={false}
                    onCancel={() => { this.setState({ visibleModalImport: false }); }}
                    footer={null}
                    width={"60vw"}
                    title="NHẬP DỮ LIỆU SẢN PHẨM KHÔNG BAO BÌ"
                >
                    <ImportSampleExcelDataFreshDrink
                        onRefreshData={this.onRefreshData}
                        onCancel={() => this.setState({ visibleModalImport: false })}
                    />
                </Modal>
            </Card>
        )
    }
}