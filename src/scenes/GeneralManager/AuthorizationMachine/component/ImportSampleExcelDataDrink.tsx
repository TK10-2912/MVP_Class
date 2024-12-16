import * as React from 'react';
import { Button, Col, Row, Table, Modal, message, Upload, Avatar, Tag } from 'antd';
import { L } from '@src/lib/abpUtility';
import { ImportDrinkInput } from '@src/services/services_autogen';
import readXlsxFile from 'read-excel-file';
import { UploadOutlined } from '@ant-design/icons';
import AppConsts, { cssColResponsiveSpan } from '@src/lib/appconst';
import { stores } from '@src/stores/storeInitializer';
import { RcFile } from 'antd/lib/upload';

export interface IProps {
    onRefreshData: () => void;
    onCancel: () => void;
}

const { confirm } = Modal;
export default class ImportSampleExcelDataDrink extends React.Component<IProps> {
    state = {
        isLoadDone: false,
        checkFile: false,
    }

    dataExcel: ImportDrinkInput[] = [];
    dicImage: {} = {};
    nameForder: string = "";
    nameFile: string = "";

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
                        let itemCreate: ImportDrinkInput = new ImportDrinkInput();
                        let item = rows[i];
                        if (!item[2] || !item[3] || !item[4] || isNaN(Number(item[4]))) {
                            message.error(L('Dữ liệu bị thiếu hoặc sai. Vui lòng kiểm tra lại excel'));
                            await this.setState({ checkFile: false });
                            this.dataExcel = [];
                            break;
                        }
                        else if (rows[i].length > 6) {
                            message.error("Dữ liệu bị thừa. Vui lòng kiểm tra lại excel");
                            await this.setState({ checkFile: false });
                            this.dataExcel = [];
                            break;
                        }
                        else {
                            itemCreate.dr_image = item[1] != null ? this.dicImage[item[1].toString()] : '';
                            itemCreate.dr_name = item[2] != null ? item[2].toString() : '';
                            itemCreate.su_name = item[3] != null ? item[3].toString() : '';
                            itemCreate.dr_price = item[4] != null ? Number(item[4]) : 0;
                            itemCreate.dr_desc = item[5] != null ? item[5].toString() : '';
                            await this.dataExcel.push(itemCreate);
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
        this.setState({ isLoadDone: true });
    }

    async createListLSC() {
        let self = this;
        confirm({
            title: Object.getOwnPropertyNames(this.dicImage).length <= 0 ? "Chưa có ảnh bạn vẫn muốn tải lên dữ liệu" : 'Kiểm tra dữ liệu và nhập vào hệ thống',
            okText: L('Nhập dữ liệu'),
            cancelText: L('Hủy'),
            async onOk() {
                if (self.dataExcel == null || self.dataExcel.length < 1) {
                    message.error(L('Không tìm thấy file!'));
                    return;
                }
                await stores.drinkStore.createListDrink(self.dataExcel);
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
    uploadImage = async (options) => {
        this.setState({ isLoadDone: false });
        const { onSuccess, file } = options;
        onSuccess("done");
        let src = await new Promise(resolve => {
            const reader = new FileReader();
            reader.readAsDataURL(file as RcFile);
            reader.onload = () => resolve(reader.result as string);
        });
        this.dicImage[file.name] = src;
        this.nameForder = options?.file?.webkitRelativePath;
        this.setState({ isLoadDone: true });
    }
    getBase64 = (file: RcFile): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });

    render() {
        const columns = [
            { title: L('N.o'), dataIndex: '', key: 'no_drink_index', render: (text: string, item: any, index: number) => <div>{index + 1}</div> },
            {
                title: "Ảnh minh họa", dataIndex: 'dr_name', key: "dr_name", render: (text: string, item: ImportDrinkInput) => <div>
                    {<Avatar src={item.dr_image === undefined ? "" : item.dr_image} />} </div>
            },
            { title: "Tên sản phẩm", dataIndex: 'dr_name', key: "dr_name", render: (text: string, item: ImportDrinkInput) => <div> {item.dr_name} </div> },
            { title: "Nhà cung cấp", dataIndex: 'su_name', key: "su_name", render: (text: string, item: ImportDrinkInput) => <div> {item.su_name} </div> },
            { title: "Giá thành (VNĐ)", dataIndex: 'dr_price', key: "dr_price", render: (text: string, item: ImportDrinkInput) => <div> {AppConsts.formatNumber(item.dr_price)}</div> },
            { title: "Thông tin sản phẩm", dataIndex: 'dr_desc', key: "dr_desc", render: (text: string, item: ImportDrinkInput) => <div style={{ marginTop: "14px" }} dangerouslySetInnerHTML={{ __html: item.dr_desc! }}></div> },
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
                        <Button style={{ color: 'red', backgroundColor: 'floralwhite' }} title={'Dữ liệu mẫu'} target="_blank" href={process.env.PUBLIC_URL + "/sample_import/che_pham_co_bao_bi_mau.xlsx"}>
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
                <Row gutter={[8, 8]}>
                    <Col {...cssColResponsiveSpan(24, 24, 12, 12, 12, 12)}>
                        <h3>{L('Thư mục ảnh')}</h3>
                        <Upload
                            directory
                            customRequest={this.uploadImage}
                            showUploadList={false}
                            style={{ width: '100%' }}
                        >
                            <Button style={{ width: '100%' }} icon={<UploadOutlined />}>{L('Tải lên thư mục ảnh')}</Button>
                        </Upload>
                        <br />
                        {Object.getOwnPropertyNames(this.dicImage).length > 0 ?
                            <Tag color="green" style={{ marginTop: 10 }}>
                                {"Tải lên forder " + this.nameForder.split("/")[0] + " thành công"}
                            </Tag>
                            :
                            <Tag color="error" style={{ marginTop: 10 }}>
                                Chưa tải lên folder
                            </Tag>
                        }
                    </Col>
                    <Col {...cssColResponsiveSpan(24, 24, 12, 12, 12, 12)}>
                        <h3>{L('Tệp excel')}</h3>
                        <Upload
                            multiple={false}
                            customRequest={async (input) => await this.readExcel(input)}
                            showUploadList={false}
                        >
                            <Button icon={<UploadOutlined />}>{L('Tải lên tệp excel')}</Button>
                        </Upload>
                        <br />
                        {this.state.checkFile ?
                            <Tag color="success" style={{ marginTop: 10 }} >Tải file {this.nameFile} thành công</Tag>
                            :
                            <Tag color="error" style={{ marginTop: 10 }}>Chưa tải lên file</Tag>
                        }
                    </Col>
                </Row>
                <Row style={{ marginTop: 10, overflow: 'auto', height: "60vh" }}>
                    <Table
                        // sticky
                        style={{ width: '100%' }}
                        rowKey={record => "importdatadrink" + JSON.stringify(record)}
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