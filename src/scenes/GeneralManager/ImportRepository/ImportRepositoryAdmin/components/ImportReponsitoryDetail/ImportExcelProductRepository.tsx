import * as React from 'react';
import { Button, Col, Row, Table, Modal, message, Upload, Avatar, Tag } from 'antd';
import { L } from '@src/lib/abpUtility';
import { AttachmentItem, ProductImportDto } from '@src/services/services_autogen';
import readXlsxFile from 'read-excel-file';
import { UploadOutlined } from '@ant-design/icons';
import AppConsts, { cssColResponsiveSpan } from '@src/lib/appconst';
import { stores } from '@src/stores/storeInitializer';
import { ColumnsType } from 'antd/lib/table';

export interface IProps {
    isVisible: boolean;
    onCancel: () => void;
    onSuccessImport: (data: ProductImportDto[]) => void;
}

const { confirm } = Modal;
export default class ImportProductRepository extends React.Component<IProps> {
    state = {
        isLoadDone: false,
        checkFile: false,
    }

    dataExcel: ProductImportDto[] = [];
    dicImage: {} = {};
    nameForder: string = "";
    nameFile: string = "";

    async componentDidMount() {
        await stores.productStore.getAll(undefined, undefined, undefined);
        this.setState({ isLoadDone: !this.state.isLoadDone })
    }
    onCancel = () => {
        if (this.props.onCancel !== undefined) {
            this.props.onCancel();
        }
    }

    onSuccessImport= (input: ProductImportDto[])=>{
        if(!!this.props.onSuccessImport)
        {
            this.props.onSuccessImport(input)
        }
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
        let item = input.file;
        if (this.state.checkFile) {
            await readXlsxFile(item).then(async (rows) => {
                if (rows !== undefined && rows.length > 1) {

                    for (let i = 1; i < rows.length; i++) {
                        let itemCreate: ProductImportDto = new ProductImportDto();
                        let item = rows[i];
                        if (!item[1]) {
                            message.error(L('Thiếu mã sản phẩm. Vui lòng kiểm tra lại excel'));
                            await this.setState({ checkFile: false });
                            this.dataExcel = [];
                            return;
                        }
                        else if (!item[2]) {
                            message.error(L('Thiếu tên sản phẩm. Vui lòng kiểm tra lại excel'));
                            await this.setState({ checkFile: false });
                            this.dataExcel = [];
                            return;
                        }
                        else if (!item[3]) {
                            message.error(L('Thiếu đơn vị tính. Vui lòng kiểm tra lại excel'));
                            await this.setState({ checkFile: false });
                            this.dataExcel = [];
                            return;
                        }
                        else if (!item[4]) {
                            message.error(L('Thiếu đơn giá. Vui lòng kiểm tra lại excel'));
                            await this.setState({ checkFile: false });
                            this.dataExcel = [];
                            return;
                        }
                        else if (!item[5]) {
                            message.error(L('Thiếu số lượng. Vui lòng kiểm tra lại excel'));
                            await this.setState({ checkFile: false });
                            this.dataExcel = [];
                            return;
                        }
                        else if (!item[6]) {
                            message.error(L('Thiếu tổng tiền. Vui lòng kiểm tra lại excel'));
                            await this.setState({ checkFile: false });
                            this.dataExcel = [];
                            return;
                        }
                        else if (rows[i].length > 7) {
                            message.error("Dữ liệu bị thừa. Vui lòng kiểm tra lại excel");
                            await this.setState({ checkFile: false });
                            this.dataExcel = [];
                            return;
                        }
                        else {
                            if (productListResult.map(record => record.pr_code).includes(item[1].toString())) {
                                itemCreate.fi_id = item[1] != null ? stores.sessionStore.getImageProduct(item[1].toString()) : new AttachmentItem();
                                itemCreate.pr_im_name = item[2] != null ? item[2].toString() : '';
                                itemCreate.pr_im_unit = item[3] != null ? item[3].toString() : '';
                                itemCreate.pr_im_unit_price = item[4] != null ? Number(item[5]) : 0;
                                itemCreate.pr_im_quantity = item[5] != null ? Number(item[4]) : 0;
                                itemCreate.pr_im_total_money = item[6] != null ? Number(item[6]) : 0;
                                if(item[1] == stores.sessionStore.getCodeProductUseName(itemCreate.pr_im_name))
                                {
                                    await this.dataExcel.push(itemCreate);
                                }
                                else{
                                    message.error('Có sản phẩm không trùng với hệ thống, đã lọc và vui lòng kiểm tra lại file!');
                                }
                            }
                            else {
                                message.error('Có sản phẩm không trùng với hệ thống, đã lọc và vui lòng kiểm tra lại file!');
                                return;
                            }
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

    render() {
        const columns: ColumnsType<ProductImportDto> = [
            { title: "STT", key: "stt_fresh_drink_index", dataIndex: 'stt_fresh_drink_index', width: 50, render: (text: string, item: ProductImportDto, index: number) => <div>{(index + 1)}</div> },
            { title: "Tên sản phẩm", key: "pr_im_name", dataIndex: "pr_im_name", render: (text: string, item: ProductImportDto) => <div> {item.pr_im_name} </div> },
            { title: "Đơn vị ", key: "pr_im_unit", dataIndex: "pr_im_unit", render: (text: number, item: ProductImportDto) => <div> {item.pr_im_unit} </div> },
            { title: "Số lượng", key: "pr_im_quantity", dataIndex: "pr_im_quantity", render: (text: string, item: ProductImportDto) => <div> {item.pr_im_quantity} </div> },
            { title: "Đơn giá", key: "pr_im_unit_price", dataIndex: "pr_im_unit_price", render: (text: number, item: ProductImportDto) => <div> {AppConsts.formatNumber(item.pr_im_unit_price) + " đ"} </div> },
            { title: "Thành tiền", key: "pr_im_total_money", dataIndex: "pr_im_total_money", render: (text: number, item: ProductImportDto) => <div> {AppConsts.formatNumber(item.pr_im_quantity * item.pr_im_unit_price) + " đ"} </div> },
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
                        locale={{ "emptyText": L('Không có dữ liệu') }}
                        dataSource={this.dataExcel == undefined || this.dataExcel.length == 0 ? [] : this.dataExcel}
                    />
                </Row>
            </Modal>
        );
    }
}