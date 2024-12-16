import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts from '@src/lib/appconst';
import { AttachmentItem, ImportRepositoryDto, ProductImportDto, UpdateImportRepositoryInput } from '@src/services/services_autogen';
import { Button, Card, Carousel, Col, Form, Row, Space, Tag, message, Image, Modal } from 'antd';
import * as React from 'react';
import { CheckCircleOutlined, DeleteOutlined, DeliveredProcedureOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import SelectedSupplier from '@src/components/Manager/SelectedSupplier';
import Paragraph from 'antd/lib/typography/Paragraph';
import { FormInstance } from 'antd/lib/form';
import { stores } from '@src/stores/storeInitializer';
import TableImportRepositoryDetailAdmin from './TableImportRepositoryDetail';
import TextArea from 'antd/lib/input/TextArea';
import confirm from 'antd/lib/modal/confirm';
import ImportRepositoryDetail from './ImportRepositoryDetail';
import FileAttachmentsImages from '@src/components/FileAttachmentsImages';

export interface IProps {
    importRepostitorySelected?: ImportRepositoryDto,
    listProductImport?: ProductImportDto[];
    onSuccess?: () => void;
    onUpdate?: () => void;
    openBillImportRepository?: () => void;
    isOpen?: boolean,
}
export default class DetailInfomationImportRepositoryAdmin extends AppComponentBase<IProps> {
    formRef: React.RefObject<FormInstance> = React.createRef();
    state = {
        isLoadDone: true,
        im_re_id: undefined,
        su_id: undefined,
        saveType: 0,
        import_at: moment(),
        visibleModalCreateUpdate: false,

    }
    carouselRef: any = React.createRef();
    listAttachmentItem_file: AttachmentItem[] = [];
    importRepositorySelected: ImportRepositoryDto = new ImportRepositoryDto;
    componentDidMount() {
        this.initData(this.props.importRepostitorySelected)
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
        const { listProductImport } = this.props;
        if (listProductImport) {
            const updatedProducts = listProductImport.map((product, index) => {
                const updatedProduct = new ProductImportDto(product);
                updatedProduct.pr_im_no = index + 1;
                return updatedProduct;
            });
            return updatedProducts;
        }
        return [];
    }
    onCreateUpdate = () => {
        const { importRepostitorySelected, listProductImport } = this.props;
        this.setState({ isLoadDone: false });
        const form = this.formRef.current;
        form!.validateFields().then(async (values: any) => {
            if (importRepostitorySelected != undefined && importRepostitorySelected?.im_re_id !== undefined && importRepostitorySelected!.im_re_id > 0) {
                let unitData = new UpdateImportRepositoryInput({ ...values });
                unitData.im_re_id = importRepostitorySelected!.im_re_id;
                unitData.im_re_code = importRepostitorySelected!.im_re_code
                unitData.fi_id_list = this.listAttachmentItem_file;
                unitData.im_re_total_money = listProductImport != undefined ? listProductImport.reduce((accumulator, currentValue) => accumulator + currentValue.pr_im_total_money, 0) : 0;
                unitData.im_re_debt = listProductImport != undefined ? listProductImport.reduce((accumulator, currentValue) => accumulator + currentValue.pr_im_total_money, 0) : 0;
                unitData.listProductImport = this.addProductImportNo();
                unitData.im_re_status = 0;
                unitData.im_re_imported_at = this.state.import_at.toDate();
                await stores.importRepositoryStore.updateImportRepository(unitData);
                this.onUpdate();
                message.success("Cập nhật thành công!");
            }
            await stores.sessionStore.getCurrentLoginInformations();
            this.setState({ isLoadDone: true });
        })
    };
    deleteFileItem = async (input: ImportRepositoryDto) => {
        let self = this;
        confirm({
            title: 'Bạn có muốn xóa nhập kho này ?',
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            async onOk() {
                self.setState({ isLoadDone: true });
                await stores.importRepositoryStore.delete(input.im_re_id);
                await self.onSuccess();
                message.success("Xóa thành công!");
                self.setState({ isLoadDone: false });
            },
            onCancel() {

            },
        });

    };

    initData = async (importRepository: ImportRepositoryDto | undefined) => {
        this.setState({ isLoadDone: false });
        if (importRepository !== undefined && importRepository.im_re_id !== undefined) {
            this.importRepositorySelected = importRepository!;
            this.setState({ isLoadDone: !this.state.isLoadDone });

            if (importRepository.fi_id_list != undefined) {
                this.listAttachmentItem_file = importRepository.fi_id_list;

            }
            if (importRepository.su_id != undefined) {
                this.setState({ su_id: importRepository.su_id })
            }
            if (importRepository.im_re_id != undefined) {
                this.setState({ su_id: importRepository.su_id })
            }
            this.formRef.current!.setFieldsValue(importRepository);
            this.setState({ isLoadDone: !this.state.isLoadDone });
        } else {
            this.setState({ pr_unit: undefined })
            this.listAttachmentItem_file = [];
            this.formRef.current!.resetFields();
        }
        this.setState({ isLoadDone: true });
    }
    handlePrev = () => {
        this.carouselRef.current.prev();
    };

    handleNext = () => {
        this.carouselRef.current.next();
    };

    openBillImportRepository = () => {
        if (!!this.props.openBillImportRepository) {
            this.props.openBillImportRepository()
        } else {
            this.setState({ visibleModalCreateUpdate: true });
        }
    }
    render() {
        const height = window.innerHeight;
        const totalMoney = this.props.listProductImport != undefined ? this.props.listProductImport.reduce((accumulator, currentValue) => accumulator + currentValue.pr_im_total_money, 0) : 0;
        const { importRepostitorySelected } = this.props;
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
                                label={'Mã phiếu nhập'}
                                style={{ borderBottom: "1px solid #cfd9d6" }}
                            >
                                <b>{this.importRepositorySelected.im_re_code}</b>
                            </Form.Item>
                            <Form.Item
                                style={{ borderBottom: "1px solid #cfd9d6" }}
                                label={'Thời gian'}
                                name={'im_re_created_at'}
                            >
                                <b >{importRepostitorySelected != undefined && moment(importRepostitorySelected.im_re_created_at).format("DD/MM/YYYY HH:mm")}</b>
                            </Form.Item>
                            <Form.Item
                                label={'Nhà cung cấp'}
                                name={'su_id'}
                                style={{ borderBottom: "1px solid #cfd9d6" }}>
                                <b>{stores.sessionStore.getNameSupplier(this.importRepositorySelected.su_id)}</b>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                label='Trạng thái'
                                style={{ borderBottom: "1px solid #cfd9d6" }}

                            >
                                <Paragraph strong>{this.props.importRepostitorySelected?.im_re_status ? <Tag color='success'>Đã nhập kho</Tag> : <Tag color='processing'>Phiếu tạm</Tag>}</Paragraph>
                            </Form.Item>
                            <Form.Item
                                label='Người nhập'
                                style={{ borderBottom: "1px solid #cfd9d6" }}
                            >
                                <b>{stores.sessionStore.getUserNameById(this.importRepositorySelected.us_id_import)}</b>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                label='Ghi chú'
                            >
                                <span>{this.props.importRepostitorySelected?.im_re_note!}</span>
                            </Form.Item>
                        </Col>

                    </Row>

                    <TableImportRepositoryDetailAdmin
                        listProductResult={this.importRepositorySelected.listProductImport}
                        pagination={false}
                        hasAction={false}
                        edit={false}
                        checkChangeQuantity={false}
                        status={this.importRepositorySelected.im_re_status}
                    />
                    {importRepostitorySelected?.im_re_status === 0 &&
                        <Row justify='end'>
                            <Space>
                                <Button
                                    icon={<DeliveredProcedureOutlined />}
                                    type='primary'
                                    onClick={() => this.openBillImportRepository()}
                                >
                                    Mở phiếu
                                </Button>
                                {
                                    (this.isGranted(AppConsts.Permission.Pages_Manager_General_ImportRepository_Delete) && this.props.importRepostitorySelected != undefined && this.props.importRepostitorySelected?.im_re_status == 0) && (importRepostitorySelected.us_id_import === stores.sessionStore.getUserLogin().id!) &&
                                    <Button danger type='primary' htmlType="submit" icon={<DeleteOutlined />} onClick={() => this.deleteFileItem(this.props.importRepostitorySelected!)}>Xóa</Button>
                                }
                            </Space>
                        </Row>
                    }
                </Form>
                <Modal
                    width={"80vw"}
                    visible={this.state.visibleModalCreateUpdate}
                    title={<strong>Phiếu nhập kho</strong>}
                    onCancel={() => {
                        this.setState({ visibleModalCreateUpdate: false });
                    }}
                    footer={null}
                    maskClosable={false}>
                    <ImportRepositoryDetail
                        isVisible={this.state.visibleModalCreateUpdate}
                        onCancel={() => this.setState({ visibleModalCreateUpdate: false })}
                        onSuccess={() => { this.onSuccess() }}
                        importRepostitorySelected={this.importRepositorySelected}
                    />
                </Modal>
            </Card>
        )
    }
}
