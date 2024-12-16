import * as React from 'react';
import { Button, Col, Row, Table, Modal, message, Upload } from 'antd';
import { L } from '@src/lib/abpUtility';
import { CreateSupplierInput } from '@src/services/services_autogen';
import readXlsxFile from 'read-excel-file';
import { PlusOutlined } from '@ant-design/icons';
import { stores } from '@src/stores/storeInitializer';
import moment from 'moment';
import AppConsts from '@src/lib/appconst';

export interface IProps {
    onRefreshData: () => void;
    onCancel: () => void;
}

const { confirm } = Modal;
export default class ImportSampleExcelDataSupplier extends React.Component<IProps> {
    state = {
        isLoadDone: false,
        checkFile: false,
    }

    dataExcel: CreateSupplierInput[] = [];
    count: number[] = [];
    onCancel = () => {
        if (this.props.onCancel != undefined) {
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
        let item = input.file;
        this.dataExcel = [];
        this.count = [];
        if (this.state.checkFile) {
            await readXlsxFile(item).then(async (rows) => {
                if (rows != undefined && rows.length > 1) {
                    this.setState({ isLoadDone: !this.state.isLoadDone });
                    for (let i = 1; i < rows.length; i++) {
                        let itemCreate: CreateSupplierInput = new CreateSupplierInput();
                        let item = rows[i];
                        if (item.length === 7) {
                            if (!!item[1] && !!item[2] && !!item[3] && !!item[4] && !!item[5]) {
                                if (!AppConsts.testPhoneNumber(item[2]?.toString())) {                                    
                                    message.error(`Dữ liệu số điện thoại ở dòng ${i + 1} bị thiếu hoặc không đúng định dạng. Vui lòng kiểm tra lại dữ liệu`);
                                    return;
                                }
                                if (!AppConsts.testEmail(item[4]?.toString())) {                                    
                                    message.error(`Dữ liệu Email ở dòng ${i + 1} bị thiếu hoặc không đúng định dạng. Vui lòng kiểm tra lại dữ liệu`);
                                    return;
                                }
                                else {
                                    itemCreate.su_name = item[1]?.toString();
                                    itemCreate.su_phone = item[2]?.toString();
                                    itemCreate.su_address = item[3]?.toString();
                                    itemCreate.su_email = item[4]?.toString();
                                    itemCreate.su_contact_person = item[5]?.toString();
                                    itemCreate.su_note = item[6]?.toString();
                                    await this.dataExcel.push(itemCreate);
                                }
                            }
                            else {
                                await this.count.push(Number(rows.indexOf(item)))
                            }
                        }
                        else {
                            message.error(L(`File đẩy lên đang bị ${item.length > 7 ? 'thừa' : 'thiếu'} trường. Vui lòng kiểm tra lại file mẫu!`));
                            await this.setState({ checkFile: false });
                            this.dataExcel = [];
                            return;
                        }
                    }
                    this.setState({ isLoadDone: !this.state.isLoadDone });
                }
                else {
                    message.error(L('File đẩy lên không giống với file mẫu hoặc bị sai. Vui lòng kiểm tra lại!'));
                    await this.setState({ checkFile: false });
                    this.dataExcel = [];
                    return;
                }
            });
        }
        if (this.count.length > 0) {
            message.error(L(`File đẩy lên sai dữ liệu ở hàng [${this.count.join(', ')}] vui lòng kiểm tra lại! `));
        }
        this.setState({ isLoadDone: true });
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
                await stores.supplierStore.createListSupplier(self.dataExcel);
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
            { title: L('STT'), dataIndex: '', key: 'no_Supplier_index', render: (text: string, item: any, index: number) => <div>{index + 1}</div> },
            { title: L('Tên nhà cung cấp'), dataIndex: "su_name", key: 'su_name', render: (text: string) => <div>{text}</div> },
            { title: L('Số điện thoại'), dataIndex: 'su_phone', key: 'su_phone', render: (text: string) => <div>{text}</div> },
            { title: L('Địa chỉ'), dataIndex: 'su_address', key: 'su_address', render: (text: string) => <div>{text}</div> },
            { title: L('Email'), dataIndex: 'su_email', key: 'su_email', render: (text: string) => <div>{text}</div> },
            { title: L('Người liên hệ'), dataIndex: 'su_contact_person', key: 'su_contact_person', render: (text: string) => <div>{text}</div> },
            { title: L('Ghi chú'), dataIndex: "su_note", key: 'su_note', render: (text: string) => <div>{text}</div> },
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
                        <Button style={{ color: 'red', backgroundColor: 'floralwhite' }} title={'Dữ liệu mẫu'} target="_blank" href={process.env.PUBLIC_URL + "/sample_import/supplier.xlsx"}>
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
                <Row> <strong style={{ fontSize: '16px', marginBottom: 15 }}>Tổng: <span style={{ color: "red" }}>{this.dataExcel.length}</span> Hàng</strong></Row>
                <Row>
                    <Col span={24}>
                        <h3>{L('Tải danh sách')}:</h3>
                        <Upload
                            className='uploadExcel'
                            beforeUpload={this.beforeUpload}
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
                        rowKey={record => "importdatasupplier" + JSON.stringify(record)}
                        size={'middle'}
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