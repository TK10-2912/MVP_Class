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
    count: number[] = [];
    onCancel = () => {
        if (this.props.onCancel !== undefined) {
            this.props.onCancel();
        }
    }
    beforeUpload = () => {
        if (this.dataExcel.length <= 0) {
            return true;
        }
        return new Promise<void>((resolve, reject) => {
            confirm({
                title: L('Xác nhận ghi đè dữ liệu mới lên?'),
                okText: L('Xác nhận'),
                cancelText: L('Hủy'),
                async onOk() {
                    resolve();
                },
                onCancel() {
                    reject();
                },
            });
        });
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
        this.count = [];
        this.dataExcel = [];
        let item = input.file;
        if (this.state.checkFile) {
            await readXlsxFile(item).then(async (rows) => {
                if (rows !== undefined && rows.length > 1) {
                    for (let i = 1; i < rows.length; i++) {
                        let itemCreate: CreateRfidInput = new CreateRfidInput();
                        let item = rows[i];
                        if (typeof item[2] !== 'number') {
                            message.error(L('Dữ liệu bị thiếu hoặc không đúng định dạng, vui lòng kiểm tra lại excel'));
                            this.dataExcel = [];
                            break;
                        }
                        else if (typeof item[2] !== 'number') {
                            message.error(L('Dữ liệu bị thiếu hoặc không đúng định dạng, vui lòng kiểm tra lại excel'));
                            this.dataExcel = [];
                            break;
                        }
                        else
                            if (item.length === 4) {
                                if (!!item[1] && !!item[2]) {
                                    itemCreate.rf_code = item[1].toString();
                                    itemCreate.rf_money_current = Number(item[2].toString());
                                    itemCreate.rf_is_active = item[3] != null && item[3].toString().toLowerCase() === "kích hoạt" ? true : false;
                                    this.dataExcel.push(itemCreate);
                                }
                                else {
                                    await this.count.push(rows.indexOf(item))
                                }
                            }
                            else {
                                if (item.length > 4 || item.length < 4) {
                                    message.error(L('File đẩy lên đang bị thừa hoặc thiếu trường hãy kiểm tra lại sao cho giống file mẫu!'));
                                }
                                else message.error(L('File đẩy lên đang bị thiếu trường hãy kiểm tra lại sao cho giống file mẫu!'))
                                await this.setState({ checkFile: false });
                                this.dataExcel = [];
                                this.count = [];
                                return;
                            }
                    }
                }
                else {
                    message.error(L('File đẩy lên không giống với file mẫu hoặc bị sai. Vui lòng kiểm tra lại!'));
                    this.dataExcel = [];
                    this.count = [];
                    return;
                }
            });
        }
        if (this.count.length > 0) {
            message.error(L(`File đẩy lên sai dữ liệu ở hàng [${this.count.join(', ')}] vui lòng kiểm tra lại! `));
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
            { title: L('STT'), key: 'au_id_index', render: (text: number, item: any, index: number) => <div>{index + 1}</div>, },
            { title: "Mã RFID", dataIndex: 'rf_code', key: 'rf_code', render: (text: string) => <div>{text}</div> },
            { title: "Số tiền hiện tại", dataIndex: 'rf_money_current', key: 'rf_money_current', render: (text: number, item: CreateRfidInput) => <div>{AppConsts.formatNumber(item.rf_money_current)}</div> },
            { title: "Kích hoạt", dataIndex: 'rf_is_active', key: 'rf_is_active', render: (text: string, item: CreateRfidInput) => <div>{item.rf_is_active ? <CheckCircleOutlined /> : <CloseOutlined />}</div> },
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
                        <Button style={{ color: 'red', backgroundColor: 'floralwhite' }} title={'Dữ liệu mẫu'} target="_blank" href={process.env.PUBLIC_URL + "/sample_import/Mau_RFID.xlsx"}>
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
                            customRequest={async (input) => { await this.readExcel(input) }}
                            beforeUpload={() => this.beforeUpload()}
                            multiple={false}
                            showUploadList={false}
                        >
                            <Button title={L('Tải danh sách')} style={{ width: '100%', height: '50px' }} icon={<PlusOutlined />} type="dashed" ></Button>
                        </Upload>
                    </Col>
                </Row >
                <Row style={{ marginTop: 10, overflow: 'auto', height: "60vh" }}>
                    <Table
                        style={{ width: '100%' }}
                        className='centerTable'
                        rowKey={record => "importrfidfromexcel_index___" + JSON.stringify(record)}
                        size={'large'}
                        bordered={true}
                        columns={columns}
                        pagination={false}
                        
                        dataSource={this.dataExcel == undefined || this.dataExcel.length == 0 ? [] : this.dataExcel}
                    />
                </Row>
            </>
        );
    }
}