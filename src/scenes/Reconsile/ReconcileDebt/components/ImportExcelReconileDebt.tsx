import * as React from 'react';
import { Button, Col, Row, Table, Modal, message, Upload, DatePicker, Tabs } from 'antd';
import { L } from '@src/lib/abpUtility';
import readXlsxFile from 'read-excel-file';
import { CheckCircleOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { stores } from '@src/stores/storeInitializer';
import { AttachmentItem, ExcelReconcileSupplierDebtInput, FileDto, FileParameter, ReconcileInput, ReconcileProductSupplierDebtInput, ReconcileSupplierDebtInput } from '@src/services/services_autogen';
import moment from 'moment';
import AppConsts, { pageSizeOptions } from '@src/lib/appconst';
import TableProductDetailImport from './TableProductDetailImport';

const { confirm } = Modal;
export class ProductDetail {
    public code;
    public productSupplierDebtInputs: ReconcileProductSupplierDebtInput;
}

export interface IProps {
    onCancel: () => void;
    onSuccess: () => void;
}
export const tabManager = {
    tab_1: "Thông tin chi tiết sản phẩm",
}
const { RangePicker } = DatePicker;
export default class ImportLSCFromReconcileDebt extends React.Component<IProps> {
    static dictionary: { [key: string]: ReconcileProductSupplierDebtInput[] }[] = [];

    state = {
        isLoadDone: false,
        checkFile: false,
        month_select: undefined,
        rec_from: moment(),
        rec_to: moment(),
        rangerpicker: undefined,
        dataExcel: [] as any[][],
        expandedRowKey: [],
        currentPage: 1,
        pageSize: 10,
    }
    beforeOrderArray: any = [];
    ordersArray: any = [];
    currentOrder: any = [];
    fileInput: any = React.createRef();
    listProduct: ProductDetail[] = [];
    listExcelReconcileInput: ExcelReconcileSupplierDebtInput[] = [];
    su_id: number;
    dataExcel: ReconcileSupplierDebtInput = new ReconcileSupplierDebtInput();
    attachmentItem: AttachmentItem = new AttachmentItem();
    file: any;

    handleExpand = (expanded, record) => {
        if (expanded) {
            this.setState({ expandedRowKey: [record.ma_phieu_nhap] });
        } else {
            this.setState({ expandedRowKey: undefined });
        }
    };
    onCancel = () => {
        if (!!this.props.onCancel) { this.props.onCancel(); }
    }
    onSuccess = () => {
        if (!!this.props.onSuccess) { this.props.onSuccess(); }
    }
    convertListToDictionary() {
        this.setState({ isLoadDone: false });
        ImportLSCFromReconcileDebt.dictionary = [];
        this.listProduct.forEach(productDetail => {
            const { code, productSupplierDebtInputs } = productDetail;
            let existingItem = ImportLSCFromReconcileDebt.dictionary.find(item => item.hasOwnProperty(code));

            if (existingItem) {
                existingItem[code].push(productSupplierDebtInputs);
            } else {
                const newItem = { [code]: [productSupplierDebtInputs] };
                ImportLSCFromReconcileDebt.dictionary.push(newItem);
            }
        });
        this.setState({ isLoadDone: true });

    }
    uploadImage = async (options) => {
        this.setState({ isLoadDone: false });
        const { onSuccess, file } = options;
        const { attachmentItem } = this;
        let fileUp: any = ({ "data": file, "fileName": file.name });
        let fileToUpload: FileParameter = fileUp;
        if (!!fileToUpload.data['size']) {
            let result: FileDto = await stores.fileStore.createFile(undefined, fileToUpload);
            if (!!result && result.fi_id != undefined) {
                onSuccess("Thành công");
                this.setState({ isLoadDone: false });
                attachmentItem.id = result.fi_id;
                attachmentItem.key = result.fi_name;
                attachmentItem.ext = result.fi_extension;
                attachmentItem.isdelete = false;
            }
            this.setState({ isLoadDone: true });
        }
        else {
            message.error("File tải lên không hợp lệ!");
        }
        this.setState({ isLoadDone: true });

    }
    createReconcileDebt = async () => {
        this.listExcelReconcileInput = [];
        for (const item of ImportLSCFromReconcileDebt.dictionary) {
            for (const [key, value] of Object.entries(item)) {
                let data: ExcelReconcileSupplierDebtInput = new ExcelReconcileSupplierDebtInput();
                data.ma_phieu_nhap = key;
                data.productSupplierDebtInputs = value;
                data.su_id = this.su_id;
                data.pr_total_money = value.reduce((total, a) => {
                    return total + a.pr_total_money;
                }, 0)
                this.listExcelReconcileInput.push(data)
            }
        }
        await this.uploadImage(this.file);
        let dataType: ReconcileInput = new ReconcileInput();
        dataType.fi_id = this.attachmentItem;
        dataType.rec_from = this.state.rec_from!.add(7, "hours").toDate();
        dataType.rec_to = this.state.rec_to!.add(7, "hours").toDate();
        this.dataExcel.reconcileInput = dataType;
        this.dataExcel.excelReconcileInput = this.listExcelReconcileInput;
    }
    readExcel = async (input) => {
        this.setState({ isLoadDone: false });
        if (this.state.month_select == undefined) {
            message.error('Hãy chọn tháng trước khi nhập file');
        }
        else {
            this.file = input
            this.listProduct = [];
            ImportLSCFromReconcileDebt.dictionary = [];
            if (!/\.xlsx$|\.xls$/.test(input.file.name)) {
                this.setState({ checkFile: false });
                message.error('Chỉ được phép tải lên các file Excel');
                return;
            } else {
                this.setState({ checkFile: true });
            }
            let item = input.file;
            if (this.state.checkFile) {
                await readXlsxFile(item).then(async (rows: any[][]) => {
                    this.setState({ dataExcel: rows });
                    this.su_id = stores.sessionStore.getIDSupplierUseName(rows[0][0]);
                    this.splitArray(this.state.dataExcel);
                });
                if (this.su_id == -1) {
                    message.error("Nhà cung cấp không có trong hệ thống vui lòng kiểm tra lại!");
                    this.dataExcel.excelReconcileInput = [];
                }                
                for (let i = 0; i < this.ordersArray.length; i++) {
                    let dataType: ProductDetail = new ProductDetail();
                    let product: ReconcileProductSupplierDebtInput = new ReconcileProductSupplierDebtInput();

                    product.pr_code = this.ordersArray[i][1] != undefined ? this.ordersArray[i][1]! : "";
                    product.pr_name = this.ordersArray[i][2] != undefined ? this.ordersArray[i][2] : "";
                    product.pr_quantity = this.ordersArray[i][4] != undefined ? this.ordersArray[i][4] : 0;
                    product.pr_unit = this.ordersArray[i][3] != undefined ? this.ordersArray[i][3] : "";
                    product.pr_total_money = this.ordersArray[i][8] != undefined ? this.ordersArray[i][8] : 0;
                    const dateCheck = this.compareDates(this.ordersArray[i][9]).toDate()
                    if (dateCheck >= this.state.rec_from.toDate() && dateCheck < this.state.rec_to.toDate()) {
                        dataType.productSupplierDebtInputs = product;
                        dataType.code = this.ordersArray[i][0];
                        this.listProduct.push(dataType);
                    }
                }
                await this.convertListToDictionary();
                await this.createReconcileDebt();
            }
        }
        if (this.listProduct.length <= 0) {
            message.warn(`Không có dữ liệu trong khoảng thời gian từ ${moment(this.state.rec_from).format("DD-MM-YYYY")} đến ${moment(this.state.rec_to).format("DD-MM-YYYY")}`)
            this.listProduct = [];
        }
        this.setState({ isLoadDone: true });
    }
    compareDates = (dateString) => {
        const parsedDate = new Date(dateString);
        return moment(parsedDate)
    }
    splitArray = (arr: any) => {
        arr.forEach(row => {
            if (row[0] === 'Mã đơn hàng') {
                if (this.currentOrder.length > 0) {
                    this.ordersArray.push(this.currentOrder);
                    this.currentOrder = [];
                }
            }

            if (row[0] === 'Mã đơn hàng' || this.currentOrder.length > 0) {
                this.currentOrder.push(row);
            } else {
                this.beforeOrderArray.push(row);
            }
        });
        if (this.currentOrder.length > 0) {
            this.currentOrder.shift();
            this.ordersArray = this.currentOrder;
        }
    }

    async createListLSC() {
        let self = this;
        confirm({
            title: L('Kiểm tra dữ liệu và nhập vào hệ thống'),
            okText: L('Nhập dữ liệu'),
            cancelText: L('Hủy'),
            async onOk() {
                const { dataExcel } = self.state;

                if (!dataExcel || dataExcel.length < 2) {
                    message.error(L('Không tìm thấy file!'));
                    return;
                }

                await stores.reconcileStore.reconcileSupplierDebt(self.dataExcel);
                self.onSuccess();
                message.success(`${L('Nhập dữ liệu thành công')}`);
            },
            onCancel() { },
        });
    }
    handleSubmitSearch = async (e: any) => {
        let start_date = !!this.state.month_select
            ? moment(this.state.month_select).subtract(1, 'month').date(22).startOf('day')
            : undefined;
        let end_date = !!this.state.month_select
            ? moment(this.state.month_select).date(21).endOf('day')
            : undefined;
        this.setState({ rec_from: start_date, rec_to: end_date });
        this.setState({
            rangerpicker: [start_date, end_date]
        });
    }
    render() {
        const self = this;
        const columns = [
            { title: L('STT'), key: 'au_id_index', render: (text: number, item: ExcelReconcileSupplierDebtInput, index: number) => <div>{this.state.pageSize! * (this.state.currentPage! - 1) + (index + 1)}</div>, },
            { title: "Mã phiếu nhập", dataIndex: 0, key: 'ma_phieu_nhap', render: (text: string, item: ExcelReconcileSupplierDebtInput) => <div>{item.ma_phieu_nhap}</div> },
            { title: "Nhà cung cấp", dataIndex: 1, key: 'rf_money_current', render: (text: number, item: ExcelReconcileSupplierDebtInput) => <div>{stores.sessionStore.getNameSupplier(item.su_id)}</div> },
            { title: "Tổng tiền ", dataIndex: 2, key: 'rf_is_active', render: (text: string, item: ExcelReconcileSupplierDebtInput) => <div>{AppConsts.formatNumber(item.pr_total_money)}</div> },
        ];

        return (
            <>
                <Row gutter={[8, 8]}>
                    <Col span={16}>
                        <strong> <i><span style={{ color: "red" }}>Lưu ý:</span> dữ liệu cập nhật cho hệ thống phải giống với tệp mẫu</i> </strong>
                        <Button style={{ color: 'red', backgroundColor: 'floralwhite' }} title={'Dữ liệu mẫu'} target="_blank" href={process.env.PUBLIC_URL + "/sample_import/MauDoiSoatCongNo.xlsx"}>
                            File mẫu
                        </Button>
                    </Col>
                    <Col span={8} style={{ display: "flex", justifyContent: "end", gap: 8 }}>
                        <Button type="primary" title={L('Nhập dữ liệu')} onClick={() => this.createListLSC()}>
                            {L('Nhập dữ liệu')}
                        </Button>
                        <Button onClick={() => this.onCancel()} danger type="ghost" title='Hủy'>Hủy</Button>
                    </Col>
                </Row>
                <Row> <strong style={{ fontSize: '16px', marginBottom: 10 }}>Tổng: <span style={{ color: "red" }}>{this.dataExcel.excelReconcileInput?.length}</span> Hàng</strong></Row>
                <Row>
                    <DatePicker
                        style={{ width: "20%" }}
                        placeholder={'Chọn tháng'}
                        onChange={async value => {
                            await this.setState({ month_select: value });
                            this.handleSubmitSearch(value);
                        }}
                        picker="month"
                        format={"MM/YYYY"}
                        value={this.state.month_select as any}
                        disabledDate={current => current > moment()}
                    />
                    {this.state.month_select &&
                        <>
                            <RangePicker
                                value={this.state.rangerpicker}
                                format={"DD/MM/YYYY"}
                                disabled />
                        </>
                    }
                    <Col span={24}>
                        <h3>{L('Tải danh sách')}:</h3>
                        <Upload
                            className='uploadExcel'
                            customRequest={this.readExcel}
                            multiple={false}
                            showUploadList={false}
                        >
                            <Button title={L('Tải danh sách')} style={{ width: '100%', height: '50px' }} icon={<PlusOutlined />} type="dashed" ></Button>
                        </Upload>
                    </Col>
                </Row>
                <Row style={{ marginTop: 10, overflow: 'auto', height: "60vh" }}>
                    <Table
                        style={{ width: '100%' }}
                        rowKey={(record, index) => record.ma_phieu_nhap!}
                        rowClassName={"pointHover"}
                        expandable={
                            {
                                expandedRowRender: (record) => (
                                    <>
                                        {/* {this.props.onCancel != undefined && this.props.onCancel()} */}
                                        <Tabs defaultActiveKey={tabManager.tab_1}>
                                            <Tabs.TabPane tab={tabManager.tab_1} key={tabManager.tab_1}>
                                                <TableProductDetailImport productDetail={record.productSupplierDebtInputs} />
                                            </Tabs.TabPane>
                                        </Tabs>
                                    </>
                                ),
                                expandRowByClick: true,
                                expandIconColumnIndex: -1,
                                expandedRowKeys: this.state.expandedRowKey,
                                onExpand: this.handleExpand,
                            }
                        }
                        size={'large'}
                        bordered={true}
                        columns={columns}
                        pagination={{
                            position: ['topRight'],
                            total: this.dataExcel.excelReconcileInput?.length,
                            showTotal: (tot) => 'Tổng: ' + tot,
                            showQuickJumper: true,
                            showSizeChanger: true,
                            pageSizeOptions: pageSizeOptions,
                            onChange(page: number, pageSize?: number) {
                                self.setState({ pageSize: pageSize, currentPage: page })
                            }
                        }}
                        
                        dataSource={this.dataExcel.excelReconcileInput} // Bỏ hàng đầu (tiêu đề)
                    />
                </Row>
            </>
        );
    }
}
