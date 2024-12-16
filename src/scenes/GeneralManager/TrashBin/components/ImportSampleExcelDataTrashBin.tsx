import * as React from 'react';
import { Button, Col, Row, Table, Modal, message, Upload } from 'antd';
import { L } from '@src/lib/abpUtility';
import { CreateSupplierInput, CreateTrashBinInput, TrashBinDto } from '@src/services/services_autogen';
import readXlsxFile from 'read-excel-file';
import { PlusOutlined } from '@ant-design/icons';
import { stores } from '@src/stores/storeInitializer';
import moment from 'moment';
import { ColumnsType } from 'antd/lib/table';

export interface IProps {
    onRefreshData: () => void;
    onCancel: () => void;
}

const { confirm } = Modal;
export default class ImportSampleExcelDataTrashBin extends React.Component<IProps> {
    state = {
        isLoadDone: false,
        checkFile: false,
    }

    dataExcel: CreateTrashBinInput[] = [];
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
                    for (let i = 1; i < rows.length; i++) {
                        let itemCreate: CreateTrashBinInput = new CreateTrashBinInput();
                        let item = rows[i];
                        if (item.length === 4) {
                            if (item[1] && item[2] && item[3]) {
                                itemCreate.tr_name = item[1]?.toString();
                                itemCreate.deviceMAC = item[2]?.toString();
                                itemCreate.tr_tien_quy_doi_theo_rac = +item[3] || 0;
                                await this.dataExcel.push(itemCreate);
                            }
                            else {
                                await this.count.push(Number(rows.indexOf(item)))
                            }
                        }
                        else {
                            if (item.length > 4) {
                                message.error(L('File đẩy lên đang bị thừa trường hãy kiểm tra lại sao cho giống file mẫu!'));
                            }
                            else message.error(L('File đẩy lên đang bị thiếu trường hãy kiểm tra lại sao cho giống file mẫu!'))
                            await this.setState({ checkFile: false });
                            this.dataExcel = [];
                            return;
                        }
                    }
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
        this.setState({ isLoadDone: !this.state.isLoadDone });
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
                for (let i = 0; i < self.dataExcel.length; i++) {
                    await stores.trashBinStore.createTrashBin(self.dataExcel[i]);
                }
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
        const columns: ColumnsType<CreateTrashBinInput> = [
            { title: L('STT'), key: 'tr_id_index', render: (text: number, item: any, index: number) => <div>{index + 1}</div> },
            { title: "Tên trạm", dataIndex: "tr_name", key: "tr_name", render: (text: string) => <div> {text} </div> },
            { title: "Địa chỉ MAC", dataIndex: "deviceMAC", key: "deviceMAC", render: (text: string) => <div> {text} </div> },
            { title: "Số tiền quy đổi theo rác(VND/kg)", dataIndex: "tien_quy_doi_theo_rac", key: "tien_quy_doi_theo_rac", render: (text: string) => <div> {text} </div> },
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
                        <Button style={{ color: 'red', backgroundColor: 'floralwhite' }} title={'Dữ liệu mẫu'} target="_blank" href={process.env.PUBLIC_URL + "/sample_import/trashBin.xlsx"}>
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