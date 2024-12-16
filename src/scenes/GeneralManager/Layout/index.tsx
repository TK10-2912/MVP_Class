import * as React from 'react';
import { Col, Row, Card, Modal, Button, Input, message, Space, Badge, Popover } from 'antd';
import { stores } from '@stores/storeInitializer';
import { LayoutDto, } from '@services/services_autogen';
import { isGranted, L } from '@lib/abpUtility';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { DeleteOutlined, ExportOutlined, PlusOutlined, SearchOutlined, WarningOutlined } from '@ant-design/icons';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan, pageSizeOptions } from '@src/lib/appconst';
import TableLayout from './component/TableLayout';
import ModalExportLayout from './component/ModalExportLayout';
import { TableRowSelection } from 'antd/lib/table/interface';
import LayoutManager from './component/LayoutManager';
const { confirm } = Modal;

export const eFormatPicker = {
    date: "date",
    month: "month",
    year: "year",
}

export interface IProps {
    status?: number;
    tab?: string;
}
export default class Layout extends AppComponentBase<IProps> {
    state = {
        isLoadDone: true,
        visibleModalExport: false,
        skipCount: 0,
        pageSize: 10,
        currentPage: 1,
        us_id_list: undefined,
        la_name: undefined,
        la_type: undefined,
        visibleModalCreateUpdate: false,
        isExportAll: true,
        count: 0,
    };
    layoutSelected: LayoutDto = new LayoutDto();
    keySelected: number[] = [];
    listItemSelected: LayoutDto[] = [];

    async getAll() {
        this.setState({ isLoadDone: false });
        await Promise.all([
            stores.layoutStore.getAll(this.state.la_name, this.state.la_type, this.state.skipCount, this.state.pageSize),
            stores.productStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined, undefined),
        ])
        this.setState({ isLoadDone: true, visibleModalCreateUpdate: false, visibleModalExport: false });
    }
    async componentDidMount() {
        await this.getAll();
    }
    createOrUpdateModalOpen = async (item: LayoutDto) => {
        this.layoutSelected = item;
        await this.setState({ visibleModalCreateUpdate: true, isLoadDone: true });
    }
    onChangePage = async (page: number, pagesize?: number) => {
        if (pagesize !== undefined) {
            await this.setState({ pageSize: pagesize! });
        }
        await this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            await this.getAll();
        })
    }
    actionTable = (item: LayoutDto, event: EventTable) => {
        let self = this;
        if (event === EventTable.Edit || event === EventTable.RowDoubleClick) {
            this.createOrUpdateModalOpen(item);
        }
        if (event === EventTable.Delete) {
            confirm({
                title: "Bạn có muốn xóa bố cục " + item.la_type + "?",
                okText: L('Xác nhận'),
                cancelText: L('Hủy'),
                async onOk() {
                    self.setState({ isLoadDone: false });
                    await stores.layoutStore.delete(item);
                    message.success("Xóa thành công !")
                    await self.getAll();
                    self.setState({ isLoadDone: true });
                },
            });
        }
    }

    handleSearch = () => {
        this.onChangePage(1, this.state.pageSize);
    }

    handleClearSearch = () => {
        this.setState({
            la_name: undefined,
            la_type: undefined,
        });
        this.handleSearch();
    }

    rowSelection: TableRowSelection<LayoutDto> = {
        onChange: (_selectedRowKeys: React.Key[], selectedRows: LayoutDto[]) => {
            this.setState({ isLoadDone: false });
            this.listItemSelected = selectedRows;
            this.keySelected = this.listItemSelected.map(item => item.la_id);
            this.setState({ count: this.keySelected!.length });
            if (this.state.count! > 0) {
                this.setState({ visibleModalCreateUpdate: false });
            }
            this.setState({ isLoadDone: true });
        }
    }

    deleteMulti = async (ids: number[]) => {
        if (ids.length < 1) {
            await message.warning(L("Hãy chọn 1 hàng trước khi xoá"));
        }
        else {
            const self = this;
            const { totalSupplier } = stores.supplierStore;
            confirm({
                icon: false,
                title: <span><WarningOutlined style={{ fontSize: "23px", color: "orange" }} /> Bạn có muốn <span style={{ color: "red" }}>xóa hàng loạt</span> {ids.length} dữ liệu ? Thao tác này khi xác nhận <span style={{ color: "red" }}>không thể hoàn tác</span>.</span>,
                okText: ('Xác nhận'),
                cancelText: <div style={{ color: "red" }}>Hủy</div>,
                async onOk() {
                    if (self.state.currentPage > 1 && (totalSupplier - self.keySelected.length) % 10 === 0) self.onChangePage(self.state.currentPage - 1, self.state.pageSize)
                    await stores.layoutStore.deleteMulti(ids);
                    await self.getAll();
                    self.keySelected = [];
                    self.setState({ isLoadDone: true, count: 0 });
                    message.success(L("Xoá thành công") + "!")
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
                <div style={{ color: "orange", textAlign: "center", fontSize: "23px" }} ><WarningOutlined style={{}} />Cảnh báo</div> <br />
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
                await stores.layoutStore.deleteAll();
                await self.getAll();
                self.keySelected = [];
                self.setState({ count: 0 });
                message.success(L("Xoá thành công"));
            },
            onCancel() {

            },
        });
        this.setState({ isLoadDone: true });
    }

    render() {
        const self = this;
        const left = this.state.visibleModalCreateUpdate ? cssCol(0) : cssColResponsiveSpan(24, 24, 24, 24, 24, 24);
        const right = this.state.visibleModalCreateUpdate ? cssColResponsiveSpan(24, 24, 24, 24, 24, 24) : cssCol(0);
        const { layoutListResult, totalCount } = stores.layoutStore;
        const { productDetailListResult } = stores.productStore;
        const shouldHideText = window.innerWidth < 768;
        return (
            <Card>
                {this.state.visibleModalCreateUpdate || <>
                    <Row gutter={[8, 8]} align='bottom'>
                        <Col
                            xs={{ span: 12, order: 1 }}
                            sm={{ span: 12, order: 1 }}
                            md={{ span: 6, order: 1 }}
                            lg={{ span: 3, order: 1 }}
                            xl={{ span: 3, order: 1 }}
                            xxl={{ span: 3, order: 1 }}
                        >
                            <h2 style={{ margin: 0 }}>Bố cục mẫu</h2>
                        </Col>
                        <Col
                            xs={{ span: 24, order: 3 }}
                            sm={{ span: 24, order: 3 }}
                            md={{ span: 24, order: 3 }}
                            lg={{ span: 13, order: 2 }}
                            xl={{ span: 13, order: 2 }}
                            xxl={{ span: 13, order: 2 }}
                        >
                            <Row gutter={8} align='bottom'>
                                <Col {...cssColResponsiveSpan(24, 12, 6, 6, 6, 6)}>
                                    <strong>Tên bố cục</strong>
                                    <Input
                                        allowClear
                                        onChange={e => {
                                            this.setState({ la_name: e.target.value });
                                            this.handleSearch();
                                        }}
                                        onPressEnter={this.handleSearch}
                                        placeholder='Tên bố cục...'
                                        value={this.state.la_name}
                                    />
                                </Col>
                                <Col {...cssColResponsiveSpan(24, 12, 6, 6, 6, 6)}>
                                    <strong>Kiểu bố cục</strong>
                                    <Input
                                        allowClear
                                        onChange={e => {
                                            this.setState({ la_type: e.target.value });
                                            this.handleSearch();
                                        }}
                                        onPressEnter={this.handleSearch}
                                        placeholder='Kiểu bố cục...'
                                        value={this.state.la_type}
                                    />
                                </Col>
                                <Col {...cssColResponsiveSpan(24, 24, 12, 12, 12, 12)}>
                                    <Space>
                                        <Button type="primary" icon={<SearchOutlined />} title="Tìm kiếm" onClick={this.handleSearch}>{shouldHideText || 'Tìm kiếm'}</Button>
                                        {
                                            (this.state.la_name || this.state.la_type) &&
                                            <Button
                                                danger
                                                title="Xoá tìm kiếm"
                                                icon={<DeleteOutlined />}
                                                onClick={this.handleClearSearch}
                                            >
                                                {shouldHideText || 'Xoá tìm kiếm'}
                                            </Button>
                                        }
                                    </Space>
                                </Col>
                            </Row>
                        </Col>
                        <Col
                            xs={{ span: 12, order: 2 }}
                            sm={{ span: 12, order: 2 }}
                            md={{ span: 18, order: 2 }}
                            lg={{ span: 8, order: 3 }}
                            xl={{ span: 8, order: 3 }}
                            xxl={{ span: 8, order: 3 }}
                            style={{ textAlign: 'right' }}
                        >
                            <Space>
                                {isGranted(AppConsts.Permission.Pages_Manager_General_Layout_Create) &&
                                    <Button title='Thêm mới' type="primary" icon={<PlusOutlined />} onClick={() => this.createOrUpdateModalOpen(new LayoutDto())}>{shouldHideText || 'Thêm mới'}</Button>
                                }
                                {isGranted(AppConsts.Permission.Pages_Manager_General_Layout_Export) &&
                                    <Button title='Xuất dữ liệu' type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ isExportAll: true, visibleModalExport: true })} >{shouldHideText || 'Xuất dữ liệu'}</Button>
                                }
                            </Space>
                        </Col>
                    </Row>
                    <Row gutter={[8, 4]}>
                        <Col span={12} >
                            <Badge count={this.state.count!}>
                                <Popover
                                    placement="right"
                                    trigger={['hover']}
                                    content={
                                        <Space direction='vertical'>
                                            {this.state.count! > 0 ?
                                                <Button
                                                    type='text'
                                                    size='small'
                                                    title={"Xóa hàng loạt"}
                                                    onClick={() => this.deleteMulti(this.keySelected)}
                                                >
                                                    <Space style={{ color: 'red' }}>
                                                        <Button size='small' danger type='primary' icon={<DeleteOutlined />}></Button>
                                                        <span>Xóa hàng loạt</span>
                                                    </Space>
                                                </Button>
                                                :
                                                <Button
                                                    type='text'
                                                    size='small'
                                                    title={"Xóa tất cả"}
                                                    onClick={() => { this.deleteAll(); }}
                                                >
                                                    <Space style={{ color: 'red' }}>
                                                        <Button size='small' danger type='primary' icon={<DeleteOutlined />}></Button>
                                                        <span>Xóa tất cả</span>
                                                    </Space>
                                                </Button>
                                            }
                                            <Button
                                                type='text'
                                                size='small'
                                                title={"Xuất dữ liệu"}
                                                onClick={async () => {
                                                    if (this.state.count! < 1) {
                                                        await message.warning(L("Hãy chọn một hàng muốn xuất dữ liệu"));
                                                    }
                                                    else {
                                                        this.setState({ isExportAll: false, visibleModalExport: true })
                                                    }
                                                }}
                                            >
                                                <Space style={{ color: '#1DA57A' }}>
                                                    <Button size='small' type='primary' icon={<ExportOutlined />}></Button>
                                                    <span>Xuất dữ liệu</span>
                                                </Space>
                                            </Button>
                                        </Space>
                                    }
                                >
                                    <Button type='primary'>Thao tác hàng loạt</Button>
                                </Popover >
                            </Badge>
                        </Col>
                    </Row>
                    <Row>
                        <Col {...left} >
                            <TableLayout
                                hasAction={true}
                                rowSelection={this.rowSelection}
                                actionTable={this.actionTable}
                                layoutListResult={layoutListResult}
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
                                }}
                                noScroll={false}
                            />
                        </Col>
                        <ModalExportLayout
                            layoutListResult={this.state.count > 0 ? this.listItemSelected! : layoutListResult}
                            onCancel={() => this.setState({ visibleModalExport: false })}
                            visible={this.state.visibleModalExport}
                        />
                    </Row>
                </>}
                {this.state.visibleModalCreateUpdate &&
                    <LayoutManager
                        onSuccess={() => this.onChangePage(1, this.state.pageSize)}
                        onCancel={() => {
                            this.keySelected = [];
                            this.setState({ visibleModalCreateUpdate: false, count: 0 });

                        }}
                        listProduct={productDetailListResult}
                        layoutSelected={this.layoutSelected}
                    />
                }
            </Card>
        )
    }
}