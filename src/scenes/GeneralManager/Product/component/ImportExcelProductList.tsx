import * as React from 'react';
import { Button, Col, Row, Table, Modal, message, Upload, Steps, Image, Space } from 'antd';
import { L } from '@src/lib/abpUtility';
import readXlsxFile from 'read-excel-file';
import { AttachmentItem, CreateProductInput } from '@src/services/services_autogen';
import { ArrowLeftOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { stores } from '@src/stores/storeInitializer';
import AppConsts from '@src/lib/appconst';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
const { Step } = Steps;
export interface IProps {
    onRefreshData: () => void;
    onCancel: () => void;
}

const { confirm } = Modal;

export default class ImportExcelProductList extends AppComponentBase<IProps> {

    state = {
        isLoadDone: false,
        checkFile: false,
        current: 0,
        step1: false,
        step2: false,
        step3: false,
        image: [],
        uploadSuccess: false,
    }
    listFileAttachmentResult: AttachmentItem[] = [];
    fileInput: any = React.createRef();
    dataExcel: CreateProductInput[] = [];
    listImageView: any;
    listFileTemp: any = [];
    listFile: any[] = [];
    errorDisplayed: boolean = false;
    countErrorImage: number = 0;
    onCancel = () => {
        if (this.props.onCancel != undefined) {
            this.props.onCancel();
        }
    }
    readExcel = async (input) => {
        const newFileName = input.file.name;

        if (this.state.checkFile && this.dataExcel.length > 0) {
            confirm({
                title: 'File Excel đã tồn tại',
                content: 'Bạn có muốn ghi đè tệp Excel hiện tại không?',
                okText: 'Ghi đè',
                cancelText: 'Hủy bỏ',
                onOk: async () => {
                    await this.processExcelFile(input);
                },
                onCancel() {
                    message.info('Tải tệp Excel mới bị hủy.');
                }
            });
        } else {
            await this.processExcelFile(input);
        }
    }

    processExcelFile = async (input) => {
        this.setState({ isLoadDone: false });
        if (!input.file.name.includes(".xlsx")) {
            this.setState({ checkFile: false });
            message.error('Chỉ được phép tải lên các file Excel');
        } else {
            this.setState({ checkFile: true });
        }
        let item = input.file;
        this.dataExcel = [];
        if (this.state.checkFile) {
            await readXlsxFile(item).then(async (rows) => {
                if (rows && rows.length > 1) {
                    for (let i = 1; i < rows.length; i++) {
                        let itemCreate = new CreateProductInput();
                        let item = rows[i];
                        if (!item[1] || !item[2] || !item[3] || !item[4]) {
                            message.error(L('Dữ liệu bị thiếu, vui lòng kiểm tra lại excel'));
                            this.dataExcel = [];
                            return;
                        } else if (item[2].toString().length > AppConsts.maxLength.name) {
                            message.error("Tên không được lớn hơn 500 ký tự");
                            this.dataExcel = [];
                            return;
                        } else if (item[4].toString().length < 3) {
                            message.error("Tiền không được nhỏ hơn 1.000đ");
                            this.dataExcel = [];
                            return;
                        } else if (rows[i].length > 7) {
                            message.error("Dữ liệu bị thừa. Vui lòng kiểm tra lại excel");
                            this.dataExcel = [];
                            return;
                        } else {
                            itemCreate.fi_id = this.listFileAttachmentResult.find(image => image.key == item[1])!;
                            itemCreate.pr_name = item[2].toString();
                            itemCreate.pr_unit = item[3].toString();
                            itemCreate.pr_price = Number(item[4].toString());
                            itemCreate.pr_desc = item[5] != null ? item[5].toString() : "";
                            this.dataExcel.push(itemCreate);
                        }
                    }
                    this.setState({ uploadSuccess: true });
                } else {
                    message.error(L('File đẩy lên không giống với file mẫu hoặc bị sai. Vui lòng kiểm tra lại!'));
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
            title: L('Kiểm tra dữ liệu và nhập vào hệ thống'),
            okText: L('Nhập dữ liệu'),
            cancelText: L('Hủy'),
            async onOk() {
                if (self.dataExcel == null || self.dataExcel.length < 1) {
                    message.error(L('Không tìm thấy file!'));
                    return;
                }
                await stores.productStore.createListProduct(self.dataExcel);
                await stores.sessionStore.getCurrentLoginInformations();
                self.onCancel();
                message.success(L('Nhập dữ liệu thành công') + " " + self.dataExcel.length + " " + L('Dữ liệu đã vào hệ thống'));
                if (!!self.props.onRefreshData) {
                    self.props.onRefreshData();
                }

            },
            onCancel() {

            },
        });
    }
    handleBeforeUpload = (file) => {
        const isImage = ['image/png', 'image/jpg', 'image/jpeg'].includes(file.type);
        let limitSize = file.size / 1024 / 1024 < 0.5;
        const checkUpLoad = this.listFileAttachmentResult!.some(item => item.key === file.name);
        if (!isImage) {
            this.countErrorImage++;
            if (!this.errorDisplayed) {
                message.error(L('Chỉ cho phép tải lên các tệp PNG, JPG, JPEG!'));
                this.errorDisplayed = true;
            }
            return Promise.reject(false);
        }

        if (!limitSize || checkUpLoad) {
            this.countErrorImage++;
            if (!this.errorDisplayed) {
                if (!limitSize) {
                    message.error(L('Ảnh phải nhỏ hơn 0.5MB!'));
                } else if (checkUpLoad) {
                    message.error(L('File đẩy lên bị trùng ảnh !'));
                }
                this.errorDisplayed = true;
            }
            return Promise.reject(false);
        }
        return true;
    };

    handleChange = (info) => {

        const { file, fileList } = info;
        if (file.originFileObj) {
            const imageUrl = URL.createObjectURL(file.originFileObj);
            this.setState({ image: [...this.state.image, imageUrl] })
        }
        this.listFile = fileList;
    };

    uploadImage = async (options) => {
        this.setState({ isLoadDone: false });
        const { onSuccess, onError, file } = options;
        let fileUp = { data: file, fileName: file.name };
        let fileToUpload = fileUp;
        let result = await stores.imageProductStore.createFile(file.name, fileToUpload);
        if (!!result && result.im_pr_id != undefined) {
            onSuccess("done");
            let attachmentItem = new AttachmentItem();
            attachmentItem.id = result.im_pr_id;
            attachmentItem.key = result.im_pr_name;
            attachmentItem.md5 = result.im_pr_md5;
            attachmentItem.ext = result.im_pr_extension;
            attachmentItem.isdelete = false;
            this.listFileAttachmentResult.push(attachmentItem);

        } else {
            message.error("Đẩy file không thành công");
        }
        this.setState({ isLoadDone: true });

    }
    onRemoveImage = (info) => {
        this.setState({ isLoadDone: false });
        const indexImage = this.listFile.indexOf(info);
        this.listFile.splice(indexImage, 1);
        const arrayName = this.listFileAttachmentResult.map(item => item.key);
        const index = arrayName.indexOf(info.name);
        if (index > -1) {
            this.listFileAttachmentResult.splice(index, 1);
        }
        this.setState({ isLoadDone: true });

    };
    render() {
        const columns = [
            {
                title: L('STT'), width: 50, key: 'au_id_index', render: (text: number, item: any, index: number) =>
                    <div>{index + 1}</div>,
            },
            {
                title: "Ảnh", dataIndex: 'fi_id', key: 'fi_id', render: (text: string, item: CreateProductInput) => <div style={{ textAlign: "center" }}>
                    <img className={'imageDetailProductExportExcel'} src={(item.fi_id != undefined && item.fi_id.id != undefined) ? this.getImageProduct(item.fi_id.md5 != undefined ? item.fi_id.md5 : "") : AppConsts.appBaseUrl + "/image/no_image.jpg"} style={{ height: "70px", width: "70px ", maxHeight: "100px !important", maxWidth: "100px !important" }}
                        alt='No image available' />
                </div>
            },
            { title: "Tên sản phẩm", dataIndex: 'pr_name', key: 'pr_name', render: (text: number) => <div>{text}</div> },
            // { title: "Nhà cung cấp", dataIndex: 'su_id', key: 'su_id', render: (text: string, item: CreateProductInput) => <div>{stores.sessionStore.getNameSupplier(item.su_id)}</div> },
            { title: "Đơn vị tính", width: 70, dataIndex: 'pr_unit', key: 'pr_unit', render: (text: string) => <div>{text}</div> },
            { title: "Giá tiền", width: 70, dataIndex: 'pr_price', key: 'pr_price', render: (text: number, item: CreateProductInput) => <div>{AppConsts.formatNumber(item.pr_price)}</div> },
            { title: "Mô tả", dataIndex: 'pr_desc', key: 'pr_desc', render: (text: string) => <div>{ }</div> },
        ];
        return (
            <>
                <Row gutter={[8, 8]}>
                    <Col>
                        <strong> <i><span style={{ color: "red" }}>Lưu ý:</span> dữ liệu cập nhật cho hệ thống phải giống với tệp mẫu <br />
                            Tên ảnh sản phẩm trong file  phải trùng với tên ảnh ở folder đẩy lên
                        </i></strong>
                        <Button style={{ color: 'red', backgroundColor: 'floralwhite' }} title={'Dữ liệu mẫu'} target="_blank" href={process.env.PUBLIC_URL + "/sample_import/product.xlsx"}>
                            File mẫu
                        </Button>
                        <br />
                        <strong><i> Ảnh sẽ chỉ nhận ảnh tối đa 0.5MB
                        </i></strong>
                    </Col>

                </Row>
                <Row> <strong style={{ fontSize: '16px', marginBottom: 15 }}>Tổng: <span style={{ color: "red" }}>{this.dataExcel.length}</span> Hàng</strong></Row>
                <Row>
                    <Col span={24}>
                        <Steps
                            type="navigation"
                            size="small"
                            current={this.state.current}
                            className="site-navigation-steps"
                        >
                            <Step onClick={undefined} status={this.state.current > 0 ? "finish" : (this.state.step1 == true ? "wait" : "process")} title="Tải lên folder ảnh"></Step>
                            <Step onClick={undefined} status={this.state.current > 1 ? "finish" : (this.state.step2 == true ? "wait" : "process")} title="Tải lên file sản phẩm" ></Step>

                        </Steps>
                        <div style={{ marginTop: 24 }}>
                        {this.state.current === 0 && (
                                <div className='cssImportProduct' style={{ justifyContent: "center" }}>
                                    <Upload
                                        listType='picture'
                                        directory={true}
                                        customRequest={this.uploadImage}
                                        beforeUpload={this.handleBeforeUpload}
                                        onChange={this.handleChange}

                                        multiple={true}
                                        onRemove={this.onRemoveImage}
                                        fileList={this.listFile}
                                    >
                                        <Space>
                                            <b>Số lượng ảnh hợp lệ: {this.listFileAttachmentResult.length}</b>
                                            <b>Số lượng ảnh lỗi: {this.countErrorImage}</b>
                                            <Button icon={<UploadOutlined />}>Đẩy lên folder ảnh sản phẩm</Button>
                                            {this.listFileAttachmentResult.length > 0 &&
                                                <Button type='primary'
                                                    onClick={(e) => { e.stopPropagation(); this.setState({ current: 1, step1: true }); this.dataExcel = [] }}>Bước tiếp theo</Button>
                                            }
                                        </Space>

                                    </Upload>
                                </div>
                            )}

                            {this.state.current === 1 && <div>
                                <Row style={{ marginTop: 10 }}>
                                    <Col span={24}>
                                        <Row justify='space-between' style={{ marginBottom: 10 }}>
                                            <Button type="dashed" icon={<ArrowLeftOutlined />} danger
                                                onClick={(e) => { e.stopPropagation(); this.setState({ current: 0, step1: false }) }}>Quay lại bước 1</Button>
                                            {this.state.uploadSuccess == true &&
                                                <Button
                                                    type="primary" title={L('Nhập dữ liệu')}
                                                    onClick={() => this.createListLSC()}>
                                                    {L('Nhập dữ liệu')}
                                                </Button>
                                            }
                                        </Row>
                                        <Upload
                                            className='uploadExcel'
                                            customRequest={(input) => this.readExcel(input)}
                                            multiple={false}
                                            showUploadList={false}
                                        >
                                            <Button title={L('Tải danh sách')} style={{ width: '100%', height: '50px' }} icon={<PlusOutlined />} type="dashed" ></Button>
                                        </Upload>
                                    </Col>
                                    <Table
                                        className='centerTable'
                                        style={{ width: '100%' }}
                                        scroll={{ x: undefined, y: 450 }}
                                        rowKey={record => "importrfidfromexcel_index___" + JSON.stringify(record)}
                                        size={'small'}
                                        bordered={true}
                                        columns={columns}
                                        pagination={false}
                                        dataSource={this.dataExcel == undefined || this.dataExcel.length == 0 ? [] : this.dataExcel}
                                    />
                                </Row>
                            </div>}
                            {this.state.current === 2 && <div>Bước 3: Xử lý tiếp theo</div>}
                        </div>
                    </Col>
                </Row>

            </>
        );
    }
}