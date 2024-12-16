import * as React from 'react';
import { Button, Col, Row, Table, Modal, message, Upload } from 'antd';
import { L } from '@src/lib/abpUtility';
import readXlsxFile from 'read-excel-file';
import { CreateRfidInput } from '@src/services/services_autogen';
import { CheckCircleOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { stores } from '@src/stores/storeInitializer';
import AppConsts from '@src/lib/appconst';

export interface IProps {
    onRefreshData: () => void;
    onCancel: () => void;
}

const { confirm } = Modal;

export default class ImportLSCFromExcelRFIDAdmin extends React.Component<IProps> {
    state = {
        isLoadDone: false,
        checkFile: false,
    }
    fileInput: any = React.createRef();
    dataExcel: CreateRfidInput[] = [];

    onCancel = () => {
        if (this.props.onCancel !== undefined) {
            this.props.onCancel();
        }
    }

    readExcel = async (input) => {
        this.setState({ isLoadDone: false });
        if (!input.file.name.includes(".xlsx")) {
            this.setState({ checkFile: false });
            message.error('Chỉ được phép tải lên các file Excel');
        }
        else {
            this.setState({ checkFile: true });
        }
        let item = input.file;
        if (this.state.checkFile) {
            await readXlsxFile(item).then(async (rows) => {
                if (rows !== undefined && rows.length > 1) {
                    for (let i = 1; i < rows.length; i++) {
                        let itemCreate: CreateRfidInput = new CreateRfidInput();
                        let item = rows[i];
                        if (!item[1] || !item[2]) {
                            message.error(L('Dữ liệu bị thiếu vui lòng kiểm tra lại excel'));
                            this.dataExcel = [];
                            break;
                        }
                        else if (item[1].toString().length > AppConsts.maxLength.code) {
                            message.error(L('Mã không được quá 50 ký tự'));
                            this.dataExcel = [];
                            break;
                        }
                        else if (item[2].toString().length < AppConsts.maxLength.money) {
                            message.error("Tiền không được nhỏ hơn 1.000đ")
                            this.dataExcel = [];
                            break;
                        }
                        else if (rows[i].length > 4) {
                            message.error("Dữ liệu bị thừa. Vui lòng kiểm tra lại excel");
                            this.dataExcel = [];
                            break;
                        }
                        else {
                            itemCreate.rf_code = item[1].toString();
                            itemCreate.rf_money_current = Number(item[2].toString());
                            itemCreate.rf_is_active = item[3] != null && (item[3].toString()) === "kích hoạt" ? true : false;
                            this.dataExcel.push(itemCreate);
                        }
                    }
                }
                else {
                    message.error(L('File đẩy lên không giống với file mẫu hoặc bị sai. Vui lòng kiểm tra lại!'));
                    this.dataExcel = [];
                    return;
                }
            });
        }
        this.setState({ isLoadDone: true })
    }

    async createListLSC() {
        let self = this;
        confirm({
            title: L('Kiểm tra dữ liệu và nhập vào hệ thống'),
            okText: L('Nhập dữ liệu'),
            cancelText: L('Hủy'),
            async onOk() {
                if (self.dataExcel == null || self.dataExcel.length < 1) {
                    message.error(L('Không tìm thấy file!'));
                    return;
                }
                await stores.RFIDStore.createList(self.dataExcel);
                await stores.sessionStore.getCurrentLoginInformations();
                message.success(L('Nhập dữ liệu thành công') + " " + self.dataExcel.length + " " + L('Dữ liệu đã vào hệ thống'));
                if (!!self.props.onRefreshData) {
                    self.props.onRefreshData();
                }

            },
            onCancel() {

            },
        });
    }

    render() {
        const columns = [
            { title: L('N.O'), key: 'au_id_index', render: (text: number, item: any, index: number) => <div>{index + 1}</div>, },
            { title: "Mã RFID", dataIndex: 'rf_code', key: 'rf_code', render: (text: string) => <div>{text}</div> },
            { title: "Số tiền hiện tại", dataIndex: 'rf_money_current', key: 'rf_money_current', render: (text: number) => <div>{text}</div> },
            { title: "Kích hoạt", dataIndex: 'rf_is_active', key: 'rf_is_active', render: (text: string) => <div>{Number(text) == 1 ? <CheckCircleOutlined /> : <CloseOutlined />}</div> },
        ];
        return (
            <>
                <Row gutter={[8, 8]}>
                    <Col
                        xs={{ span: 24, order: 2 }}
                        sm={{ span: 24, order: 2 }}
                        md={{ span: 13, order: 1 }}
                        lg={{ span: 16, order: 1 }}
                        xl={{ span: 16, order: 1 }}
                        style={{ fontSize: '16px' }}
                    >
                        <strong> <i><span style={{ color: "red" }}>Lưu ý:</span> dữ liệu cập nhật cho hệ thống phải giống với tệp mẫu</i> </strong>
                        <Button style={{ color: 'red', backgroundColor: 'floralwhite' }} title={'Dữ liệu mẫu'} target="_blank" href={process.env.PUBLIC_URL + "/sample_import/rfid.xlsx"}>
                            File mẫu
                        </Button>
                    </Col>

                    <Col
                        style={{ display: "flex", flexWrap: "wrap", justifyContent: "end", gap: 8 }}
                        xs={{ span: 24, order: 1 }}
                        sm={{ span: 24, order: 1 }}
                        md={{ span: 11, order: 2 }}
                        lg={{ span: 8, order: 2 }}
                        xl={{ span: 8, order: 2 }}
                    >
                        <Button
                            type="primary" title={L('Nhập dữ liệu')}
                            onClick={() => this.createListLSC()}>
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
                <Row> <strong style={{ fontSize: '16px', marginBottom: 10 }}>Tổng: <span style={{ color: "red" }}>{this.dataExcel.length}</span> Hàng</strong></Row>
                <Row>
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
                <Row style={{ marginTop: 10, overflow: 'auto', height: "60vh" }}>
                    <Table
                        className='centerTable'
                        style={{ width: '100%' }}
                        rowKey={record => "importrfidfromexcel_index___" + JSON.stringify(record)}
                        size={'large'}
                        bordered={true}
                        columns={columns}
                        pagination={false}
                        locale={{ "emptyText": L('Không có dữ liệu') }}
                        dataSource={this.dataExcel == undefined || this.dataExcel.length == 0 ? [] : this.dataExcel}
                    />
                </Row>
            </>
        );
    }
}