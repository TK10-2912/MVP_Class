import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts from '@src/lib/appconst';
import { AttachmentItem, ImportRepositoryDto, ProductImportDto } from '@src/services/services_autogen';
import { Button, Card, Carousel, Col, Form, Row, Space, Tag } from 'antd';
import * as React from 'react';
import { DeliveredProcedureOutlined } from '@ant-design/icons';
import moment from 'moment';
import SelectedSupplier from '@src/components/Manager/SelectedSupplier';
import Paragraph from 'antd/lib/typography/Paragraph';
import { FormInstance } from 'antd/lib/form';
import FileAttachmentsImages from '@src/components/FileAttachmentsImages';
import { stores } from '@src/stores/storeInitializer';
import TableImportRepositoryDetail from './TableImportRepositoryDetail';

export interface IProps {
    importRepostitorySelected?: ImportRepositoryDto,
    listProductImport?: ProductImportDto[];
}
export default class DetailInfomationImportRepositorySupplier extends AppComponentBase<IProps> {
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
    onChangePage = () => {
        const url = `/general/repository?im_re_id=${this.props.importRepostitorySelected!.im_re_id} &tab=2&modalImport=true`;
        window.open(url, '_blank');
    }
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
                    <Row gutter={30} style={{ marginBottom: 10 }}>
                        <Col span={8} style={{ textAlign: "center" }}>
                            <p style={{ width: '100%', textAlign: 'center', fontWeight: 'bold', margin: 0 }}>Tệp đính kèm</p>
                            <Carousel autoplaySpeed={3000} autoplay ref={this.carouselRef} dots={false} >
                                {
                                    this.listAttachmentItem_file.length > 0 &&
                                    this.listAttachmentItem_file.map((item, index) =>
                                        <div key={'image_' + index} style={{ display: "flex", justifyContent: 'center' }}>
                                            <FileAttachmentsImages
                                                showRemoveIcon={false}
                                                maxLength={5}
                                                files={[item]}
                                                isLoadFile={this.state.isLoadDone}
                                                allowRemove={false}
                                                isMultiple={false}
                                                isDownload={true}
                                                isUpLoad={false}
                                            />
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
                                style={{ borderBottom: "1px solid #cfd9d6" }}
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
                                <b>{this.importRepositorySelected.im_re_note!}</b>
                            </Form.Item>
                        </Col>

                    </Row>

                    <TableImportRepositoryDetail
                        listProductResult={this.importRepositorySelected.listProductImport}
                        pagination={false}
                        hasAction={false}
                        checkChangeQuantity={false}
                        status={this.importRepositorySelected.im_re_status}
                    />

                    <Row justify='end'>
                        <Col span={7}>
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
                                <Paragraph strong>{this.props.listProductImport?.length}</Paragraph>
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
                                (importRepostitorySelected != undefined && importRepostitorySelected.im_re_status == 0 && this.isGranted(AppConsts.Permission.Pages_Manager_General_ImportRepository_Update)) &&
                                // <>
                                <Button icon={<DeliveredProcedureOutlined />} onClick={this.onChangePage} type='primary' >Mở phiếu </Button>
                                // </>
                            }
                        </Space>
                    </Row>
                </Form>
            </Card>
        )
    }
}
