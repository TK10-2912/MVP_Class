import * as React from 'react';
import { Button, Col, Row, Table, Modal, message, Upload, DatePicker, Select } from 'antd';
import { L } from '@src/lib/abpUtility';
import readXlsxFile, { readSheetNames } from 'read-excel-file';
import { AttachmentItem, BillingDto, ExcelReconcileRFIDInput, FileDto, FileParameter, ReconcileInput, ReconcileRFIDInput } from '@src/services/services_autogen';
import { PlusOutlined } from '@ant-design/icons';
import { stores } from '@src/stores/storeInitializer';
import moment from 'moment';

const dayjs = require('dayjs')
export interface IProps {
    onSucces: () => void;
    onCancel: () => void;
    billingListResult: BillingDto[];
}
export class ListExcel {
    [key: string]: any;

    constructor(listHeader: string[]) {
        listHeader.forEach(item => {
            this[item] = null;
        });
    }
}
const { RangePicker } = DatePicker;
const { confirm } = Modal;
const { Option } = Select;
export default class ModalImportRFIDReconciliationAdmin extends React.Component<IProps> {
    state = {
        isLoadDone: false,
        checkFile: false,
        month_select: undefined,
        rec_from: moment(),
        rec_to: moment(),
        rangerpicker: undefined,
        listHeader: [],
        listDataExcel: [],
        selectedFields: [],
        listReconsile: [],
        indexT: -1,
    }
    fileInput: any = React.createRef();
    dataExcel: ReconcileRFIDInput = new ReconcileRFIDInput();
    listData: ExcelReconcileRFIDInput[] = [];
    listExcelBillCode: string[] = [];
    attachmentItem: AttachmentItem = new AttachmentItem();
    listWebBillCode: string[] = [];
    listHeader: string[] = [];
    file: any;
    onCancel = () => {
        if (this.props.onCancel !== undefined) {
            this.props.onCancel();
        }
    }

    onSucces = () => {
        if (!!this.props.onSucces) {
            this.props.onSucces();
        }
    }

    uploadImage = async (options) => {
        const { onSuccess, file } = options;
        const { attachmentItem } = this;
        let fileUp: any = ({ "data": file, "fileName": file.name });
        let fileToUpload: FileParameter = fileUp;
        if (!!fileToUpload.data['size']) {
            let result: FileDto = await stores.fileStore.createFile(undefined, fileToUpload);
            if (!!result && result.fi_id != undefined) {
                onSuccess("done");
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
    }
    readExcel = async (input) => {
        this.setState({ isLoadDone: false,selectedFields:[] });
        this.listData = [];
        if (this.state.month_select == undefined) {
            message.error('Hãy chọn tháng trước khi nhập file');
        }
        else {
            this.file = input;
            if (!/\.xlsx$|\.xls$/.test(input.file.name)) {
                this.setState({ checkFile: false });
                message.error('Chỉ được phép tải lên các file Excel');
            }
            else {
                this.setState({ checkFile: true });
            }
            await readSheetNames(input.file).then(async (sheets) => {
                if (sheets.length < 3) {
                    message.error('File Excel phải có ít nhất 3 sheet, vui lòng kiểm tra lại!');
                    this.dataExcel.excelReconcileInput = [];
                    return;
                }
                else {
                    let item = input.file;
                    let duplicateHeaderIndex;
                    if (this.state.checkFile) {
                        this.listData = [];

                        await readXlsxFile(item, { sheet: 2 }).then(async (rows) => {
                            if (rows !== undefined && rows.length > 1) {
                                let header = rows[0].map(item => item.toString())
                                header.filter((item, index) => {
                                    if (header.indexOf(item) !== index) {
                                        duplicateHeaderIndex = index;
                                    }
                                })
                                header.splice(duplicateHeaderIndex, 1)
                                await this.setState({ listHeader: header });

                                let listDataExcel: ListExcel[] = [];
                                for (let i = 1; i < rows.length; i++) {
                                    let row = rows[i];
                                    row.splice(duplicateHeaderIndex, 1);
                                    let listExcel: ListExcel = new ListExcel(this.listHeader);
                                    for (let j = 0; j < this.state.listHeader.length; j++) {
                                        listExcel[this.state.listHeader[j]] = row[j]?.toString();
                                    }
                                    listDataExcel.push(listExcel);
                                }

                                await this.setState({ listDataExcel: listDataExcel });
                                this.filterData(this.state.selectedFields)
                            }
                            else {
                                this.dataExcel.excelReconcileInput = [];
                                return;
                            }
                        });
                    }
                }
            })

        }
        this.setState({ isLoadDone: true })
    }
    filterData = async (selectedFields: string[]) => {
        const filteredData = this.state.listDataExcel.map(item => {
            const filteredItem: { [key: string]: any } = {};
            selectedFields.forEach(field => {
                if (item[field] !== undefined) {
                    filteredItem[field] = item[field];
                }
            });
            return filteredItem;
        });
        await this.setState({ listReconsile: filteredData });
    };

    getDate = (dateTimeString) => {
        const [datePart, timePart] = dateTimeString.split(' ');
        const [day, month, year] = datePart.split('/').map(Number);
        const [hour, minute] = timePart.split(':').map(Number);
        const fullYear = year < 50 ? 2000 + year : 1900 + year;
        const formatNumber = (num) => (num < 10 ? `0${num}` : num);

        return `${formatNumber(day)}/${formatNumber(month)}/${fullYear} ${formatNumber(hour)}:${formatNumber(minute)}`;
    }
    checkRfCodeBank = (code: string) => {

        if (code !== null || code !== "") {
            const arrStr = code.split("-");
            if (arrStr[arrStr.length - 1] == "rf") {
                return code;
            }
        }

    }
    async createListLSC() {
        let self = this;
        confirm({
            title: L('Kiểm tra dữ liệu và nhập vào hệ thống'),
            okText: L('Nhập dữ liệu'),
            cancelText: L('Hủy'),
            async onOk() {
                if (self.state.listReconsile.length <= 0) {
                    message.error(L('Không tìm thấy file!'));
                    return;
                }
                else {
                    for (let i = 0; i < self.state.listReconsile.length; i++) {
                        let item = self.state.listReconsile[i];
                        if (item[self.state.selectedFields[0]] == "") {
                            message.error('Dữ liệu mã đơn hàng ở dòng ' + i + 1 + ' bị thiếu hoặc không đúng định dạng. Vui lòng kiểm tra lại dữ liệu');
                            self.listData = [];
                            return;
                        }
                        else if (isNaN(Number(item[self.state.selectedFields[1]]))) {
                            message.error('Dữ liệu tiền đơn hàng ở dòng ' + i + 1 + ' bị thiếu hoặc không đúng định dạng. Vui lòng kiểm tra lại dữ liệu');
                            self.listData = [];
                            return;
                        }
                        else if (item[self.state.selectedFields[2]] == "") {
                            message.error('Dữ liệu trạng thái ở dòng ' + i + 1 + ' bị thiếu hoặc không đúng định dạng. Vui lòng kiểm tra lại dữ liệu');
                            self.listData = [];
                            return;
                        }
                        else if (moment(self.getDate(item[self.state.selectedFields[3]]), "DD/MM/YYYY HH:mm", true).isValid() == false) {
                            message.error('Dữ liệu ngày thanh toán ở dòng ' + i + 1 + ' bị thiếu hoặc không đúng định dạng. Vui lòng kiểm tra lại dữ liệu');
                            self.listData = [];
                            return;
                        }
                        else {
                            let dateTimeString = self.getDate(item[self.state.selectedFields[3]]);
                            if (self.state.rec_from !== undefined && self.state.rec_to !== undefined) {
                                const recFromMoment = moment(self.state.rec_from);
                                const recToMoment = moment(self.state.rec_to);
                                const itemCreateMoment = moment(moment(dateTimeString, "DD/MM/YYYY HH:mm").toDate());
                                if (recFromMoment.isSameOrBefore(itemCreateMoment) && itemCreateMoment.isSameOrBefore(recToMoment) && self.checkRfCodeBank(item[self.state.selectedFields[0]]) != undefined) {
                                    let data: ExcelReconcileRFIDInput = new ExcelReconcileRFIDInput();
                                    data.rf_code = item[self.state.selectedFields[0]];
                                    data.rf_money = item[self.state.selectedFields[1]];
                                    data.rf_create = moment(dateTimeString, "DD/MM/YYYY HH:mm").toDate();
                                    const status = item[self.state.selectedFields[2]] == "Đã hoàn thành" ? 1 : 0;
                                    if (status === 1) {
                                        await self.listData.push(data);
                                    }
                                }
                            }
                        }
                    }
                    self.dataExcel.excelReconcileInput = self.listData;

                    if (self.dataExcel.excelReconcileInput.length == 0) {
                        message.error(L('File đẩy lên không có dữ liệu trùng với thông tin trên hệ thống hoặc không có dữ liệu !'));
                        return;
                    }
                    await self.uploadImage(self.file);
                    let dateData: ReconcileInput = new ReconcileInput();
                    dateData.fi_id = self.attachmentItem;
                    dateData.rec_from = self.state.rec_from!.add(7, "hours").toDate();
                    dateData.rec_to = self.state.rec_to!.add(7, "hours").toDate();
                    self.dataExcel.reconcileInput = dateData;
                    await stores.reconcileStore.reconcileRFID(self.dataExcel);
                    message.success("Tạo đối soát thành công !")
                    await self.onSucces();
                }
            },
            onCancel() {

            },
        });
    }
    handleFieldChange = (selectedFields: string[]) => {
        if (selectedFields.length > 4) {
            message.warning('Bạn chỉ có thể chọn tối đa 4 trường.');
            return;
        }
        this.setState({ selectedFields });
        this.filterData(selectedFields);
    };
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
        const columns1 = this.state.selectedFields.map(field => ({
            title: field,
            dataIndex: field,
            key: field,
        }));

        return (
            <>
                <Row gutter={[8, 8]}>
                    <Col span={12}>
                        <strong> <i><span style={{ color: "red" }}>Lưu ý:</span> dữ liệu cập nhật cho hệ thống phải giống với file mẫu </i> </strong>
                        <Button style={{ color: 'red', backgroundColor: 'floralwhite' }} title={'Dữ liệu mẫu'} target="_blank" href={process.env.PUBLIC_URL + "/sample_import/doi_soat_ngan_hang_mau_t7.xlsx"}>
                            File mẫu
                        </Button>
                    </Col>
                    <Col span={12}
                        style={{ display: "flex", flexWrap: "wrap", justifyContent: "end", gap: 8 }}>
                        <Button
                            type="primary" title={L('Tạo đối soát')}
                            onClick={() => { this.createListLSC() }}>
                            {L('Nhập dữ liệu')}
                        </Button>
                        <Button
                            danger
                            type="ghost" title='Hủy'
                            onClick={() => this.onCancel()}
                        >
                            Hủy
                        </Button>
                    </Col>

                </Row>
                <Row> <strong style={{ fontSize: '16px', marginBottom: 10 }}>Tổng: <span style={{ color: "red" }}>{this.state.selectedFields!.length > 0 ? this.state.listDataExcel!.length : 0}</span> Hàng</strong></Row>
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
                        // disabledDate={current => current > moment()}
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
                            customRequest={async (input) => await this.readExcel(input)}
                            multiple={false}
                            showUploadList={false}
                        >
                            <Button title={L('Tải danh sách')} style={{ width: '100%', height: '50px' }} icon={<PlusOutlined />} type="dashed" ></Button>
                        </Upload>
                    </Col>
                </Row>
                {this.state.listDataExcel.length > 0 &&
                    <Row style={{ marginTop: 10, width: "100%" }}>
                        <>
                            <Col span={24}>
                                <h2>Chọn trường đối soát</h2>
                            </Col>
                            <Col span={24}>
                                <strong> <i><span style={{ color: "red" }}>Lưu ý:</span> Các trường cần có để đối soát: Mã đơn hàng, Số tiền thanh toán, Trạng thái đơn hàng, Ngày thanh toán </i> </strong>
                            </Col>
                            <Col span={this.state.selectedFields.length > 0 ? 23 : 24}>
                                <Select
                                    mode="multiple"
                                    allowClear
                                    style={{ width: '100%' }}
                                    placeholder="Please select"
                                    value={this.state.selectedFields}
                                    onChange={this.handleFieldChange}
                                    maxTagCount={4}
                                >
                                    {this.state.listHeader.map(field => (
                                        <Option key={field} value={field}>
                                            {field}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col span={this.state.selectedFields.length > 0 ? 1 : 0}>
                                <Button danger onClick={() => this.setState({ selectedFields: [] })} >Xóa</Button>
                            </Col>

                        </>
                        <Col span={24}>
                            <Table
                                scroll={{y:window.innerHeight/2}}
                                style={{ width: '100%' }}
                                rowKey={record => "importreconciliationfromexcel_index___" + JSON.stringify(record)}
                                size={'large'}
                                bordered={true}
                                columns={columns1}
                                pagination={false}
                                
                                dataSource={this.state.selectedFields.length > 0 ? this.state.listDataExcel : []}
                            />
                        </Col>
                    </Row>
                }
            </>
        );
    }
}