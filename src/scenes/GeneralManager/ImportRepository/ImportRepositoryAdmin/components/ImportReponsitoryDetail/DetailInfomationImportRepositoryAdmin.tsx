import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { FileUploadType } from '@src/lib/appconst';
import { AttachmentItem, CreateImportRepositoryInput, ImportRepositoryDto, ProductImportDto, UpdateImportRepositoryInput } from '@src/services/services_autogen';
import { Button, Card, Carousel, Col, DatePicker, Form, Image, Input, Row, Space, Tag, message } from 'antd';
import * as React from 'react';
import { CheckCircleOutlined, ExclamationCircleOutlined, UserOutlined } from '@ant-design/icons';
import moment, { Moment } from 'moment';
import SelectedSupplier from '@src/components/Manager/SelectedSupplier';
import Paragraph from 'antd/lib/typography/Paragraph';
import { FormInstance } from 'antd/lib/form';
import FileAttachmentsImages from '@src/components/FileAttachmentsImages';
import { stores } from '@src/stores/storeInitializer';
import TableImportRepositoryDetailAdmin from './TableImportRepositoryDetail';
import TextArea from 'antd/lib/input/TextArea';

export interface IProps {
    importRepostitorySelected?: ImportRepositoryDto,
    listProductImport?: ProductImportDto[];
    onSuccess?: () => void;
}
export default class DetailInfomationImportRepositoryAdmin extends AppComponentBase<IProps> {
    formRef: React.RefObject<FormInstance> = React.createRef();
    state = {
        isLoadDone: true,
        im_re_id: undefined,
        su_id: undefined,
        saveType: 0,
        import_at: moment(),


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
                unitData.fi_id_list = this.listAttachmentItem_file;
                unitData.im_re_total_money = listProductImport != undefined ? listProductImport.reduce((accumulator, currentValue) => accumulator + currentValue.pr_im_unit_price, 0) : 0;
                unitData.im_re_debt = listProductImport != undefined ? listProductImport.reduce((accumulator, currentValue) => accumulator + currentValue.pr_im_unit_price, 0) : 0;
                unitData.listProductImport = this.addProductImportNo();
                unitData.im_re_status = 0;
                unitData.im_re_imported_at = this.state.import_at.toDate();
                await stores.importRepositoryStore.updateImportRepository(unitData);
                message.success("Thêm mới thành công!");
            }
            await this.onSuccess();

            await stores.sessionStore.getCurrentLoginInformations();
            this.setState({ isLoadDone: true });
        })
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

    render() {
        const height = window.innerHeight;
        const totalMoney = this.props.listProductImport != undefined ? this.props.listProductImport.reduce((accumulator, currentValue) => accumulator + currentValue.pr_im_total_money, 0) : 0;
        const { importRepostitorySelected } = this.props
        return (

            <Card>
                <Form
                    ref={this.formRef}
                    labelCol={{ span: 8 }}
                    style={{ width: '100%' }}>
                    <Row gutter={30} style={{marginBottom:10}}>
                        <Col span={8}>
                            <p style={{ width: '100%', textAlign: 'center', fontWeight: 'bold', margin: 0 }}>Ảnh</p>

                            <Carousel autoplaySpeed={3000} autoplay ref={this.carouselRef} dots={false} >
                                {
                                    this.listAttachmentItem_file.length > 0 &&
                                    this.listAttachmentItem_file.map((item, index) =>
                                        <div key={'image_' + index} style={{ display: "flex", justifyContent: 'center' }}>
                                            <img style={{ width: "35%", margin: '0 auto' }} src={item.id != undefined ? this.getFile(item.id) : AppConsts.appBaseUrl + "/image/no_image.jpg"} alt='No image available' />
                                        </div>
                                    )
                                }
                            </Carousel>
                            <Space>
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
                                label={'Mã phiếu nhập'}
                                style={{ textDecoration: 'underline', borderBottom: "1px solid #cfd9d6" }}
                            >
                                <b>{this.importRepositorySelected.im_re_code}</b>
                            </Form.Item>
                            <Form.Item
                                style={{ borderBottom: "1px solid #cfd9d6" }}
                                label={'Thời gian'}
                                name={'im_re_created_at'}
                            >
                                <label >{importRepostitorySelected != undefined && moment(importRepostitorySelected.im_re_created_at).format("DD/MM/YYYY HH:mm")}</label>
                            </Form.Item>
                            <Form.Item
                                label={'Nhà cung cấp'}
                                name={'su_id'}
                                rules={[{ required: true, message: 'Không được để trống!' }]}>
                                <SelectedSupplier disable={importRepostitorySelected != undefined && importRepostitorySelected.im_re_status == 0 ? false : true} supplierID={this.state.su_id} onChangeSupplier={(value) => this.formRef.current?.setFieldsValue({ su_id: value })} />
                            </Form.Item>
                        </Col>
                        <Col span={5}>
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
                        <Col span={5}>
                            <Form.Item label="Ghi chú" {...AppConsts.formItemLayout} name={'im_re_note'} >
                                <TextArea placeholder="Ghi chú..." allowClear readOnly rows={4}></TextArea>
                            </Form.Item>
                        </Col>

                    </Row>

                    <TableImportRepositoryDetailAdmin
                        listProductResult={this.importRepositorySelected.listProductImport}
                        pagination={false}
                        hasAction={false}
                        checkChangeQuantity={false}
                    />

                    <Row justify='end'>
                        <Col span={6}>
                            <Form.Item
                                label='Tổng số lượng'
                                style={{ marginBottom: 10 }}
                            >
                                <Paragraph strong>{AppConsts.formatNumber(this.props.listProductImport != undefined ? this.props.listProductImport.reduce((accumulator, currentValue) =>
                                    accumulator + currentValue.pr_im_quantity, 0) : 0)}</Paragraph>
                            </Form.Item>
                            <Form.Item
                                label='Tổng số mặt hàng'
                                style={{ marginBottom: 10 }}
                            >
                                <label>{this.props.listProductImport?.length}</label>
                            </Form.Item>
                            <Form.Item
                                label='Tổng tiền hàng'
                            >
                                <Paragraph strong> {AppConsts.formatNumber(totalMoney)} VNĐ</Paragraph>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row justify='end'>
                        <Space>
                            {
                                importRepostitorySelected != undefined && importRepostitorySelected.im_re_status == 0 &&
                                <Button icon={<ExclamationCircleOutlined />} onClick={() => this.onCreateUpdate()}>Lưu </Button>
                            }
                            <Button danger type='primary' htmlType="submit" icon={<CheckCircleOutlined />} onClick={() => this.onCreateUpdate()}>Xóa</Button>
                        </Space>
                    </Row>
                </Form>
            </Card>
        )
    }
}
