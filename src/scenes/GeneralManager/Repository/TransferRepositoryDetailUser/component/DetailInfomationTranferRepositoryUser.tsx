import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { AttachmentItem, TranferRepositoryDto, ProductTranferDto, } from '@src/services/services_autogen';
import { Button, Card, Carousel, Col, Form, Row, Space, Tag, message, Image, Modal } from 'antd';
import * as React from 'react';
import moment from 'moment';
import { FormInstance } from 'antd/lib/form';
import FileAttachmentsImages from '@src/components/FileAttachmentsImages';
import TableImportTranferRepositoryUser from './TableImportTranferRepositoryDetail';
import { stores } from '@src/stores/storeInitializer';
import { DeleteOutlined, DeliveredProcedureOutlined } from '@ant-design/icons';
import AppConsts from '@src/lib/appconst';
import { eTranferRepositoryStatus } from '@src/lib/enumconst';

const { confirm } = Modal;
export interface IProps {
    transferRepostitorySelected?: TranferRepositoryDto,
    listProductTranfer?: ProductTranferDto[];
    onSuccess?: () => void;
    onUpdate?: () => void;
    openBillTransferRepostitory?: () => void;
    isOpen?: boolean,
}
export default class DetailInfomationTranferRepositoryUser extends AppComponentBase<IProps> {
    formRef: React.RefObject<FormInstance> = React.createRef();
    state = {
        isLoadDone: true,
        tr_re_id: undefined,
        su_id: undefined,
        saveType: 0,
        import_at: moment(),
        visibleModalCreateUpdate: false,

    }
    carouselRef: any = React.createRef();
    listAttachmentItem_file: AttachmentItem[] = [];
    tranferRepositorySelected: TranferRepositoryDto = new TranferRepositoryDto;
    componentDidMount() {
        this.initData(this.props.transferRepostitorySelected)
    }

    onSuccess = () => {
        if (!!this.props.onSuccess) {
            this.props.onSuccess();
        }
    }
    onUpdate = () => {
        if (!!this.props.onUpdate) {
            this.props.onUpdate();
        }
    }
    addProductImportNo = () => {
        const { listProductTranfer } = this.props;
        if (listProductTranfer) {
            const updatedProducts = listProductTranfer.map((product, index) => {
                const updatedProduct = new ProductTranferDto(product);
                updatedProduct.pr_tr_no = index + 1;
                return updatedProduct;
            });
            return updatedProducts;
        }
        return [];
    }


    initData = async (TransferRepostitory: TranferRepositoryDto | undefined) => {
        if (TransferRepostitory !== undefined && TransferRepostitory.tr_re_id !== undefined) {
            this.tranferRepositorySelected = TransferRepostitory!;
            this.setState({ isLoadDone: !this.state.isLoadDone });

            if (TransferRepostitory.fi_id_list != undefined) {
                this.listAttachmentItem_file = TransferRepostitory.fi_id_list;

            }

            this.formRef.current!.setFieldsValue(TransferRepostitory);
            this.setState({ isLoadDone: !this.state.isLoadDone });
        } else {
            this.setState({ pr_unit: undefined })
            this.listAttachmentItem_file = [];
            this.formRef.current!.resetFields();
        }
        this.setState({ isLoadDone: !this.state.isLoadDone });
    }
    handlePrev = () => {
        this.carouselRef.current.prev();
    };

    handleNext = () => {
        this.carouselRef.current.next();
    };

    openBillTransferRepostitory = () => {
        if (!!this.props.openBillTransferRepostitory) {
            this.props.openBillTransferRepostitory()
        } else {
            this.setState({ visibleModalCreateUpdate: true });
        }
    }

    deleteFileItem = async (input: TranferRepositoryDto) => {
        let self = this;
        confirm({
            title: 'Bạn có muốn xóa nhập kho này ?',
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            async onOk() {
                self.setState({ isLoadDone: true });
                await stores.transferRepositoryStore.delete(input.tr_re_id);
                await self.onSuccess();
                message.success("Xóa thành công!");
                self.setState({ isLoadDone: false });
            },
            onCancel() {

            },
        });

    };
    render() {
        const { transferRepostitorySelected } = this.props;
        return (

            <Card >
                <Form
                    ref={this.formRef}
                    // labelCol={{ span: 8 }}
                    style={{ width: '100%' }}>
                    <Row gutter={8}>
                        <Col span={4}>
                            <p style={{ width: '100%', textAlign: 'center', fontWeight: 'bold', margin: 0 }}>Tệp đính kèm</p>
                            <Carousel style={{ display: "flex", justifyContent: "center" }} autoplaySpeed={3000} autoplay ref={this.carouselRef} dots={false} >
                                {
                                    this.listAttachmentItem_file.length > 0 &&
                                    this.listAttachmentItem_file.map((item, index) =>
                                        <div
                                            key={'image_' + index}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                height: '200px',
                                            }}
                                        >
                                            <div className='detail_import' title={item.key} key={'image_' + index} style={{ display: "flex", justifyContent: 'center' }}>
                                                <FileAttachmentsImages
                                                    showRemoveIcon={false}
                                                    maxLength={5}
                                                    files={[item]}
                                                    isLoadFile={this.state.isLoadDone}
                                                    allowRemove={false}
                                                    isMultiple={false}
                                                    isDownload={true}
                                                />
                                            </div>
                                        </div>
                                    )
                                }
                            </Carousel>
                            <Space style={{ display: "flex", justifyContent: "center" }}>
                                <Button
                                    onClick={this.handlePrev}>
                                    &lt;
                                </Button>
                                <Button
                                    onClick={this.handleNext}
                                >
                                    &gt;
                                </Button>
                            </Space>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label={'Mã chuyển kho'}
                                style={{ borderBottom: "1px solid #cfd9d6" }}
                            >
                                <b>{this.tranferRepositorySelected.tr_re_code}</b>
                            </Form.Item>
                            <Form.Item
                                style={{ borderBottom: "1px solid #cfd9d6" }}
                                label={'Thời gian tạo'}
                                name={'tr_re_created_at'}
                            >
                                <b >{transferRepostitorySelected != undefined && moment(transferRepostitorySelected.tr_re_created_at).format("DD/MM/YYYY HH:mm")}</b>
                            </Form.Item>

                        </Col>

                        <Col span={6}>
                            <Form.Item
                                label='Ghi chú'
                            >
                                <span>{this.props.transferRepostitorySelected?.tr_re_note!}</span>
                            </Form.Item>
                        </Col>

                    </Row>
                    <TableImportTranferRepositoryUser
                        listProductResult={this.tranferRepositorySelected.listProductTranfer}
                        pagination={false}
                        hasAction={false}
                        edit={false}
                        checkChangeQuantity={false}
                    />
                    {(transferRepostitorySelected?.tr_re_status === eTranferRepositoryStatus.TEMPORARY.num || transferRepostitorySelected?.tr_re_status === eTranferRepositoryStatus.RECEIVED.num) &&
                        <Row justify='end'>
                            <Space>
                                {(transferRepostitorySelected.us_id_receiver === stores.sessionStore.getUserLogin().id!) &&
                                    <Button
                                        icon={<DeliveredProcedureOutlined />}
                                        type='primary'
                                        onClick={() => this.openBillTransferRepostitory()}
                                    >
                                        Mở phiếu
                                    </Button>
                                }
                                {
                                    (this.isGranted(AppConsts.Permission.Pages_Manager_General_ImportRepository_Delete) && transferRepostitorySelected != undefined && transferRepostitorySelected?.tr_re_status == eTranferRepositoryStatus.TEMPORARY.num ) && (transferRepostitorySelected.us_id_receiver === stores.sessionStore.getUserLogin().id!) &&
                                    <Button danger type='primary' htmlType="submit" icon={<DeleteOutlined />} onClick={() => this.deleteFileItem(transferRepostitorySelected!)}>Xóa</Button>
                                }
                            </Space>
                        </Row>
                    }
                </Form>

            </Card>
        )
    }
}
