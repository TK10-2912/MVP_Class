import * as React from 'react';
import { Button, Col, Row, Table, Modal, message, Upload, Avatar, Tag, Image } from 'antd';
import { L } from '@src/lib/abpUtility';
import { AttachmentItem, ProductTranferDto } from '@src/services/services_autogen';
import readXlsxFile from 'read-excel-file';
import { UploadOutlined } from '@ant-design/icons';
import AppConsts, { cssColResponsiveSpan } from '@src/lib/appconst';
import { stores } from '@src/stores/storeInitializer';
import { ColumnsType } from 'antd/lib/table';
import AppComponentBase from '@src/components/Manager/AppComponentBase';

export interface IProps {
    isVisible: boolean;
    onCancel: () => void;
    onSuccessImport: (data: ProductTranferDto[]) => void;
}

const { confirm } = Modal;
export default class ImportListTransferRepositoryDetail extends React.Component<IProps> {
    state = {
        isLoadDone: false,
        checkFile: false,
    }

    dataExcel: ProductTranferDto[] = [];
    dicImage: {} = {};
    nameForder: string = "";
    nameFile: string = "";
    count: number[] = [];
    async componentDidMount() {
        await stores.productStore.getAll(undefined, undefined, undefined, undefined, undefined, undefined, undefined);
        this.setState({ isLoadDone: !this.state.isLoadDone })
    }
    onCancel = () => {
        if (this.props.onCancel !== undefined) {
            this.props.onCancel();
            this.dataExcel = [];
            this.setState({ checkFile: false })
            this.nameForder = "";
            this.nameFile = "";
            this.setState({ checkFile: false, isLoadDone: false });
        }
    }

    onSuccessImport = (input: ProductTranferDto[]) => {
        if (!!this.props.onSuccessImport) {
            if (this.dataExcel.length > 0) {
                message.success("Nhập dữ liệu thành công!")
                this.props.onSuccessImport(input);
                this.onCancel();

            }
            else {
                message.error("Phải có ít nhất 1 trường dữ liệu!")
            }
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
        const { productListResult } = stores.productStore;
        if (!input.file.name.includes(".xlsx")) {
            this.setState({ checkFile: false });
            message.error('Chỉ được phép tải lên các file Excel');
        }
        else {
            this.setState({ checkFile: true });
        }
        this.dataExcel = []
        let item = input.file;
        this.count = [];
        if (this.state.checkFile) {
            await readXlsxFile(item).then(async (rows) => {
                if (rows !== undefined && rows.length > 1) {

                    for (let i = 1; i < rows.length; i++) {
                        let itemCreate: ProductTranferDto = new ProductTranferDto();
                        let item = rows[i];
                        if (!!item[1] && !!item[2] && !!item[3] && !!item[4] && item[5] && !!item[6] && !!item[7]) {
                            const price = item[4] != null ? Number(item[4].toString()) : 0;
                            const quantity = item[3] != null ? Number(item[3].toString()) : 0;
                            const totalMoney = item[7] != null ? Number(item[7].toString()) : 0;
                            if (totalMoney !== (price * quantity)) {
                                message.error("Dữ liệu nhập vào không khớp với thành tiền ở dòng " + i + ". Vui lòng kiểm tra lại dữ liệu!");
                                this.dataExcel = [];
                                break;

                            }
                            const product = productListResult.find(record => record.pr_name == item[1].toString())
                            if (product != undefined) {
                                itemCreate.pr_tr_name = product.pr_name;
                                itemCreate.pr_tr_quantity = item[3] != null ? Number(item[3].toString()) : 0;
                                itemCreate.pr_tr_unit_price = item[4] != null ? Number(item[4].toString()) : 0;
                                // itemCreate.pr_tr_unit_quydoi = product.pr_unit;
                                // itemCreate.pr_tr_quantity_quydoi = item[6] != null ? Number(item[6].toString()) : 0;
                                //itemCreate.pr_tr_total_money = itemCreate.pr_tr_total_money;
                                itemCreate.pr_tr_total_money = totalMoney;
                                await this.dataExcel.push(itemCreate);
                            }
                            else {
                                message.error("Sản phẩm " + item[1].toString() + " không có trong hệ thống. Vui lòng kiểm tra lại dữ liệu!");
                                this.dataExcel = [];
                                break;
                            }
                            // else {
                            //     this.count.push(Number(item[0]));
                            // }
                        }
                        else {
                            if (item.length > 7) {
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
        // if (this.count.length > 0) {
        //     message.error(L(`File đẩy lên có các sản phẩm ở hàng [${this.count.join(', ')}] chưa đúng vui lòng kiểm tra lại! `));
        // }
        this.setState({ isLoadDone: true });
    }
    getImageProduct(md5: string) {
        let fi_md5_modified = encodeURI(md5);
        return AppConsts.remoteServiceBaseUrl + "download/imageProduct?path=" + fi_md5_modified;
    }
    render() {
        const columns: ColumnsType<ProductTranferDto> = [
            { title: "STT", key: "stt_fresh_drink_index", dataIndex: 'stt_fresh_drink_index', width: 50, render: (text: string, item: ProductTranferDto, index: number) => <div>{(index + 1)}</div> },
            {
                title: "Lần nhập kho", key: "image", dataIndex: "pr_im_name", width: 100, render: (text: string, item: ProductTranferDto) => <div style={{ textAlign: "center" }}>{item.pr_tr_no}</div>

            },
            {
                title: "Tên", key: "pr_im_name", dataIndex: "pr_im_name", render: (text: string, item: ProductTranferDto) => <div>{item.pr_tr_name}</div>
            },
            { title: "Mã", key: "pr_im_name", ellipsis: true, dataIndex: "pr_im_name", render: (text: string, item: ProductTranferDto) => <div>{item.pr_tr_code} </div> },
            {
                title: "Số lượng", width: 100, key: "pr_im_unit", dataIndex: "pr_im_unit", render: (text: number, item: ProductTranferDto) =>
                    <div>{AppConsts.formatNumber(item.pr_tr_quantity)}</div>
            },
            {
                title: "Đơn giá", width: 150, key: "pr_im_unit_price", dataIndex: "pr_im_unit_price", render: (text: number, item: ProductTranferDto) =>
                    <div>
                        {AppConsts.formatNumber(item.pr_tr_unit_price)}
                    </div>
            },
            // { title: <span title={"Đơn vị quy đổi: Là đơn vị dùng để chuyển đổi từ đơn vị gốc sang đơn vị khác"}>ĐV quy đổi</span>, key: "pr_im_unit_quydoi", dataIndex: "pr_im_unit_quydoi", render: (text: number, item: ProductTranferDto) => <div> {item.pr_tr_unit_quydoi} </div> },
            // {
            //     title: <span title={"Số lượng quy đổi: Là số lượng tương ứng giữa hai đơn vị khi chuyển đổi"}>SL quy đổi</span>, width: 100, key: "pr_tr_quantity_quydoi", dataIndex: "pr_tr_quantity_quydoi", render: (text: string, item: ProductTranferDto) => {
            //         return (
            //             <div>
            //                 {AppConsts.formatNumber(item.pr_tr_quantity_quydoi)}
            //             </div >
            //         )
            //     }
            // },
            {
                title: "Thành tiền", width: 150, key: "pr_im_total_money", dataIndex: "pr_im_total_money", render: (text: number, item: ProductTranferDto) =>
                    <div>
                        {AppConsts.formatNumber(item.pr_tr_total_money) + " VND"}
                    </div>
            },
        ];
        return (
            <Modal
                title={<strong>Nhập sản phẩm</strong>}
                visible={this.props.isVisible}
                closable={false}
                footer={null}
                centered
                width={1000}
            >
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
                        <Button style={{ color: 'red', backgroundColor: 'floralwhite' }} title={'Dữ liệu mẫu'} target="_blank" href={process.env.PUBLIC_URL + "/sample_import/MauNhapHang.xlsx"}>
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
                            onClick={() => this.onSuccessImport(this.dataExcel)}>
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
                        <h3>{L('Tệp excel')}</h3>
                        <Upload
                            multiple={false}
                            customRequest={async (input) => await this.readExcel(input)}
                            showUploadList={false}
                            beforeUpload={this.beforeUpload}
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
                        style={{ width: '100%' }}
                        rowKey={record => "importdatadrink" + JSON.stringify(record)}
                        size={'small'}
                        bordered={true}
                        columns={columns}
                        pagination={false}
                        
                        dataSource={this.dataExcel == undefined || this.dataExcel.length == 0 ? [] : this.dataExcel}
                    />
                </Row>
            </Modal>
        );
    }
}