import * as React from 'react';
import { Button, Col, Row, Table, Modal, message, Upload } from 'antd';
import { L } from '@src/lib/abpUtility';
import { CreateSupplierInput } from '@src/services/services_autogen';
import readXlsxFile from 'read-excel-file';
import { PlusOutlined } from '@ant-design/icons';
import { stores } from '@src/stores/storeInitializer';

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

    onCancel = () => {
        if (this.props.onCancel != undefined) {
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
            readXlsxFile(item).then(async (rows) => {
                console.log(rows != undefined && rows.length >= 1);
                
                if (rows != undefined && rows.length > 1) {
                    for (let i = 1; i < rows.length; i++) {
                        let itemCreate: CreateSupplierInput = new CreateSupplierInput();
                        let item = rows[i];
                        if (!item[1]) {
                            message.error(L('Dữ liệu bị thiếu vui lòng kiểm tra lại excel'));
                            await this.setState({ checkFile: false });
                            this.dataExcel = [];
                            break;
                        }
                        else if (rows[i].length > 7) {
                            message.error("Dữ liệu bị thừa. Vui lòng kiểm tra lại excel");
                            await this.setState({ checkFile: false });
                            this.dataExcel = [];
                            break;
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
                    this.setState({ isLoadDone: true });
                }
                else {
                    message.error(L('File đẩy lên không giống với file mẫu hoặc bị sai. Vui lòng kiểm tra lại!'));
                    await this.setState({ checkFile: false });
                    this.dataExcel = [];
                    return;
                }
            });
        }
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
                            customRequest={(input) => this.readExcel(input)}
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
                        locale={{ "emptyText": L('Không có dữ liệu') }}
                        dataSource={this.dataExcel == undefined || this.dataExcel.length == 0 ? [] : this.dataExcel}
                    />
                </Row>
            </>
        );
    }
}