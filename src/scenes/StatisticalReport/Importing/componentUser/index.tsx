import { DeleteOutlined, ExportOutlined, SearchOutlined } from '@ant-design/icons';
import AppConsts, { EventTable, cssCol, cssColResponsiveSpan } from '@src/lib/appconst';
import { ImportingDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, DatePicker, Input, Modal, Row, Select, message } from 'antd';
import * as React from 'react';
import ModalExportImportingUser from './ModalExportImportingUser';
import TableImportingUser from './TableImportingUser';
import ViewImportingDetailsUser from './ViewImportingDetailsUser';
import moment from 'moment';
import { isGranted } from '@src/lib/abpUtility';
import SelectedMachineMultiple from '@src/components/Manager/SelectedMachineMultiple';
import { SorterResult } from 'antd/lib/table/interface';
import { eSort } from '@src/lib/enumconst';
import SelectedGroupMachine from '@src/components/Manager/SelectedGroupMachine';

const { confirm } = Modal;
const { RangePicker } = DatePicker;

export const eFormatPicker = {
    date: "date",
    month: "month",
    year: "year",
}
export default class ImportingUser extends React.Component {
    state = {
        isLoadDone: true,
        ma_id: undefined,
        im_create_at: undefined,
        skipCount: 0,
        maxResultCount: 10,
        viewDetail: false,
        visibleExportExcelImporting: false,
        pageSize: 10,
        currentPage: 1,
        im_person_charge: undefined,
        selectedOption: "date",
        rangeDatetime: undefined,
        im_start_date: undefined,
        im_end_date: undefined,
        sort: undefined,
        gr_ma_id: undefined,

    }

    importingSelected: ImportingDto = new ImportingDto();
    selectedField: string;
    async componentDidMount() {
        await this.getAll();
    }

    async getAll() {
        this.setState({ isLoadDone: false });
        await stores.importingStore.getAll(this.state.ma_id, this.state.im_person_charge, this.state.im_start_date, this.state.im_end_date,this.state.gr_ma_id,this.selectedField, this.state.sort, this.state.skipCount, this.state.pageSize)
        this.setState({ isLoadDone: true });
    }

    handleSubmitSearch = async () => {
        let start_date = !!this.state.rangeDatetime ? moment(this.state.rangeDatetime![0]).startOf(this.state.selectedOption as any).toDate() : undefined;
        let end_date = !!this.state.rangeDatetime?.[1] ?
            moment(this.state.rangeDatetime?.[1]).endOf(this.state.selectedOption as any).toDate() : undefined
        this.setState({ im_start_date: start_date, im_end_date: end_date })
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

    onSuccess = async () => {
        this.setState({ isLoadDone: false })
        await this.getAll();
        this.setState({ isLoadDone: true, viewDetail: false })
    }
    createOrUpdateModalOpen = async (input: ImportingDto) => {
        if (input !== undefined && input !== null) {
            this.importingSelected.init(input);
            await this.setState({ viewDetail: true, isLoadDone: true });
        }
    }

    actionTable = (importing: ImportingDto, event: EventTable) => {
        let self = this;
        if (importing == undefined || importing.us_id == undefined) {
            message.error("Không tìm thấy !");
            return;
        }
        if (event == EventTable.View || event == EventTable.RowDoubleClick) {
            this.createOrUpdateModalOpen(importing);

        }
    }
    onCreateUpdateSuccess = () => {
        this.setState({ isLoadDone: false });
        this.getAll();
        this.setState({ isLoadDone: true, visibleModalCreateUpdate: false, })
    }
    onChangeMachine = async (value: number) => {
        this.setState({ isLoadDone: false });
        await this.setState({ ma_id: value });
        this.setState({ isLoadDone: true });
    }
    async onChangeDateCreateAt(date: moment.Moment | null) {
        if (!date) {
            await this.setState({ im_create_at: undefined });
        }
        else {
            await this.setState({ im_create_at: date });
        }
    }
    clearSearch = async () => {
        await this.setState({
            ma_id: undefined,
            im_create_at: undefined,
            rangeDatetime: undefined,
            im_person_charge: undefined,

        });
        this.getAll()
    }
    changeColumnSort = async (sort: SorterResult<ImportingDto> | SorterResult<ImportingDto>[]) => {
		this.setState({ isLoadDone: false });
		this.selectedField = sort["field"];
		await this.setState({ sort: sort['order'] == undefined ? undefined : (sort['order'] == "descend" ? eSort.DES.num : eSort.ASC.num) });
		await this.getAll();
		this.setState({ isLoadDone: true });

	}
    render() {
        let self = this;
        const { importingListResult, totalImporting } = stores.importingStore;
        const left = this.state.viewDetail ? { ...cssColResponsiveSpan(24, 24, 24, 14, 14, 14) } : cssCol(24);
        const right = this.state.viewDetail ? { ...cssColResponsiveSpan(24, 24, 24, 10, 10, 10) } : cssCol(0);
        return (
            <Card>
                <Row align='bottom' gutter={[8, 8]} className='alighItemFlexEnd-col-1600px'>
                    <Col {...cssColResponsiveSpan(24, 12, 12, 12, 12, 12)}><h2>Lịch sử nhập sản phẩm vào máy</h2></Col>
                    {isGranted(AppConsts.Permission.Pages_History_LichSuNhapHang_Export) &&
                        <Col {...cssColResponsiveSpan(24, 12, 12, 12, 12, 12)} style={{ textAlign: "right" }}>
                            <Button type="primary" icon={<ExportOutlined />} onClick={() => this.setState({ visibleExportExcelImporting: true })}>{(window.innerWidth > 688) && 'Xuất dữ liệu'}</Button>
                        </Col>
                    }
                    <Col {...cssColResponsiveSpan(24, 12, 8, 4, 3, 2)}>
                        <strong>Loại</strong><br />
                        <Select
                            onChange={async (value) => await this.setState({ selectedOption: value })}
                            value={this.state.selectedOption}
                            style={{ width: '100%' }}
                        >
                            <Select.Option value={eFormatPicker.date}>Ngày</Select.Option>
                            <Select.Option value={eFormatPicker.month}>Tháng</Select.Option>
                            <Select.Option value={eFormatPicker.year}>Năm</Select.Option>
                        </Select>
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 8, 7, 4)}>
                        <strong>Khoảng thời gian</strong>
                        <RangePicker
                            style={{ width: "100%" }}
                            placeholder={this.state.selectedOption === "date" ? ['Từ ngày', 'Đến ngày'] : (this.state.selectedOption === "month" ? ['Từ tháng', 'Đến tháng'] : ['Từ năm', 'Đến năm'])}
                            onChange={async value => {
                                await this.setState({ rangeDatetime: value });
                            }}
                            picker={this.state.selectedOption as any}
                            format={this.state.selectedOption === "date" ? 'DD/MM/YYYY' : (this.state.selectedOption === "month" ? 'MM/YYYY' : 'YYYY')}
                            value={this.state.rangeDatetime as any}
                            allowEmpty={[false, true]}
                            disabledDate={current => current > moment()}
                        />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 6, 7, 4)}>
                        <strong>Nhóm máy</strong>
                        <SelectedGroupMachine groupmachineId={this.state.gr_ma_id} onChangeGroupMachine={async (value) => await this.setState({ gr_ma_id: value })} />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 6, 7, 4)}>
                        <strong>Máy bán nước</strong><br />
                        <SelectedMachineMultiple
                            onChangeMachine={async (value) => { await this.setState({ ma_id: value }); this.getAll() }} listMachineId={this.state.ma_id}
                        ></SelectedMachineMultiple>
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 12, 8, 6, 7, 4)}>
                        <strong>Người nhập</strong><br />
                        <Input
                            allowClear={true}
                            onChange={async (e) => { this.setState({ im_person_charge: e.target.value == "" ? undefined : e.target.value }) }} placeholder={("Nhập tìm kiếm")}
                            onPressEnter={this.handleSubmitSearch}
                            value={this.state.im_person_charge}
                        />
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 24, 10, 6, 6, 6)} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }}>
                        <Button type="primary" icon={<SearchOutlined />} title="Tìm kiếm" onClick={() => this.handleSubmitSearch()} >Tìm kiếm</Button>
                        {(this.state.ma_id != undefined || this.state.im_create_at != undefined || !!this.state.rangeDatetime || !!this.state.im_person_charge) &&
                            <Button danger icon={<DeleteOutlined />} title="Xóa tìm kiếm" onClick={() => this.clearSearch()} >{(window.innerWidth < 768 || window.innerWidth > 791) ? 'Xóa tìm kiếm' : 'Xóa'}</Button>
                        }
                    </Col>
                </Row>


                <Row>
                    <Col {...left} style={{ overflowY: "auto" }}>
                        <TableImportingUser
							changeColumnSort={this.changeColumnSort}
                            actionTable={this.actionTable}
                            importingListResult={importingListResult}
                            isLoadDone={this.state.isLoadDone}
                            pagination={{
                                pageSize: this.state.pageSize,
                                total: totalImporting,
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

                    <Col {...right}>
                        <ViewImportingDetailsUser
                            importingSelected={this.importingSelected}
                            importing_id={this.importingSelected.im_id}
                            onSuccess={this.onSuccess}
                            onCancel={() => this.setState({ viewDetail: false })}
                        />
                    </Col>
                </Row>
                <ModalExportImportingUser
                    importingListResult={importingListResult}
                    visible={this.state.visibleExportExcelImporting}
                    onCancel={() => this.setState({ visibleExportExcelImporting: false })}
                />
            </Card>
        )
    }
}