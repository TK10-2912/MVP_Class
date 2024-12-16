import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts from '@src/lib/appconst';
import { AttachmentItem, TranferRepositoryDto, ProductTranferDto, UpdateTranferRepositoryInput } from '@src/services/services_autogen';
import { Button, Card, Carousel, Col, Form, Row, Space, Tag, message, Image, Modal } from 'antd';
import * as React from 'react';
import { CheckCircleOutlined, DeleteOutlined, DeliveredProcedureOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import Paragraph from 'antd/lib/typography/Paragraph';
import { FormInstance } from 'antd/lib/form';
import { stores } from '@src/stores/storeInitializer';
import confirm from 'antd/lib/modal/confirm';
import FileAttachmentsImages from '@src/components/FileAttachmentsImages';
import TableTranferRepositoryDetailAdmin from './TableTranferRepositoryDetailAdmin';
import TransferRepositoryDetail from '../../../TransferRepositoryDetailUser';
import TranferRepositoryDetailAdmin from './TranferRepositoryDetail';
import { eTranferRepositoryStatus } from '@src/lib/enumconst';

export interface IProps {
    transferRepostitorySelected?: TranferRepositoryDto,
    listProductTranfer?: ProductTranferDto[];
    onSuccess?: () => void;
    onUpdate?: () => void;
    openBillTranferRepository?: () => void;
    isOpen?: boolean,
}
export default class DetailInfomationTranferRepositoryAdmin extends AppComponentBase<IProps> {
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
    TranferRepositorySelected: TranferRepositoryDto = new TranferRepositoryDto;
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
    onCreateUpdate = () => {
        const { transferRepostitorySelected, listProductTranfer } = this.props;
        this.setState({ isLoadDone: false });
        const form = this.formRef.current;
        form!.validateFields().then(async (values: any) => {
            if (transferRepostitorySelected != undefined && transferRepostitorySelected?.tr_re_id !== undefined && transferRepostitorySelected!.tr_re_id > 0) {
                let unitData = new UpdateTranferRepositoryInput({ ...values });
                unitData.tr_re_id = transferRepostitorySelected!.tr_re_id;

                unitData.fi_id_list = this.listAttachmentItem_file;
                //unitData.tr_re_total_money = listProductTranfer != undefined ? listProductTranfer.reduce((accumulator, currentValue) => accumulator + currentValue.pr_tr_total_money, 0) : 0;
                unitData.listProductTranfer = this.addProductImportNo();
                unitData.tr_re_status = 0;
                await stores.transferRepositoryStore.updateTranferRepository(unitData);
                this.onUpdate();
                message.success("Cập nhật thành công!");
            }
            await stores.sessionStore.getCurrentLoginInformations();
            this.setState({ isLoadDone: true });
        })
    };
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

    initData = async (TranferRepository: TranferRepositoryDto | undefined) => {
        await this.setState({ isLoadDone: false });
        if (TranferRepository !== undefined && TranferRepository.tr_re_id !== undefined) {
            this.TranferRepositorySelected = TranferRepository!;
            this.setState({ isLoadDone: !this.state.isLoadDone });

            if (TranferRepository.fi_id_list != undefined) {
                this.listAttachmentItem_file = TranferRepository.fi_id_list;

            }

            this.formRef.current!.setFieldsValue(TranferRepository);
            this.setState({ isLoadDone: !this.state.isLoadDone });
        } else {
            this.setState({ pr_unit: undefined })
            this.listAttachmentItem_file = [];
            this.formRef.current!.resetFields();
        }
        await this.setState({ isLoadDone: true });
    }
    handlePrev = () => {
        this.carouselRef.current.prev();
    };

    handleNext = () => {
        this.carouselRef.current.next();
    };

    openBillTranferRepository = () => {
        if (!!this.props.openBillTranferRepository) {
            this.props.openBillTranferRepository()
        } else {
            this.setState({ visibleModalCreateUpdate: true });
        }
    }
    render() {
        const height = window.innerHeight;
        const totalMoney = this.props.listProductTranfer != undefined ? this.props.listProductTranfer.reduce((accumulator, currentValue) => accumulator + currentValue.pr_tr_total_money, 0) : 0;
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

                        <Col span={6}>
                            <Form.Item
                                label='Trạng thái'
                                style={{ borderBottom: "1px solid #cfd9d6" }}

                            >
                                <Paragraph strong>
                                    {this.props.transferRepostitorySelected?.tr_re_status === eTranferRepositoryStatus.TEMPORARY.num && (
                                        <Tag color="magenta">Phiếu tạm</Tag>
                                    )}
                                    {this.props.transferRepostitorySelected?.tr_re_status === eTranferRepositoryStatus.REQUEST.num && (
                                        <Tag color="processing">Yêu cầu nhập hàng</Tag>
                                    )}
                                    {this.props.transferRepostitorySelected?.tr_re_status === eTranferRepositoryStatus.RECEIVED.num && (
                                        <Tag color="gold">Đã nhận hàng</Tag>
                                    )}
                                    {this.props.transferRepostitorySelected?.tr_re_status === eTranferRepositoryStatus.CONFIRM.num && (
                                        <Tag color="geekblue">Đã xác nhận</Tag>
                                    )}
                                    {this.props.transferRepostitorySelected?.tr_re_status === eTranferRepositoryStatus.IMPORTED.num && (
                                        <Tag color="success">Đã nhập kho</Tag>
                                    )}
                                </Paragraph>
                            </Form.Item>
                            <Form.Item
                                label='Người tạo yêu cầu'
                                style={{ borderBottom: "1px solid #cfd9d6" }}
                            >
                                <b>{stores.sessionStore.getUserNameById(this.TranferRepositorySelected.us_id_receiver)}</b>
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

                    <TableTranferRepositoryDetailAdmin
                        listProductResult={this.TranferRepositorySelected.listProductTranfer}
                        pagination={false}
                        hasAction={false}
                        edit={false}
                        checkChangeQuantity={false}
                        status={this.TranferRepositorySelected.tr_re_status}
                    />
                    <Row justify='end'>
                        <Space>
                            {transferRepostitorySelected?.tr_re_status === eTranferRepositoryStatus.REQUEST.num &&
                                <Button
                                    icon={<DeliveredProcedureOutlined />}
                                    type='primary'
                                    onClick={() => this.openBillTranferRepository()}
                                >
                                    Mở phiếu
                                </Button>
                            }
                            {
                                (this.isGranted(AppConsts.Permission.Pages_Manager_General_TransferRepository_Delete) && this.props.transferRepostitorySelected != undefined && this.props.transferRepostitorySelected?.tr_re_status == 0) && (transferRepostitorySelected!.us_id_receiver === stores.sessionStore.getUserLogin().id!) &&
                                <Button danger type='primary' htmlType="submit" icon={<DeleteOutlined />} onClick={() => this.deleteFileItem(this.props.transferRepostitorySelected!)}>Xóa</Button>
                            }
                        </Space>
                    </Row>
                </Form>
                <Modal
                    width={"80vw"}
                    visible={this.state.visibleModalCreateUpdate}
                    title={<strong>Phiếu cấp phát kho</strong>}
                    onCancel={() => {
                        this.setState({ visibleModalCreateUpdate: false });
                    }}
                    footer={null}
                    maskClosable={false}>
                    <TranferRepositoryDetailAdmin
                        isVisible={this.state.visibleModalCreateUpdate}
                        onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
                        onSuccess={() => { this.onSuccess() }}
                        tranferRepositorySelected={this.TranferRepositorySelected}
                    />
                </Modal>
            </Card>
        )
    }
}
