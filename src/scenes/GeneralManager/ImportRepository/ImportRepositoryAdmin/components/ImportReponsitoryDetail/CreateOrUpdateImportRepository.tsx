import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { FileUploadType } from '@src/lib/appconst';
import { AttachmentItem,  CreateImportRepositoryInput,  ImportRepositoryDto, ProductImportDto, UpdateImportRepositoryInput } from '@src/services/services_autogen';
import { Button, Card, Col, Form, Input, Row, Space, Tag, message } from 'antd';
import * as React from 'react';
import { CheckCircleOutlined, ExclamationCircleOutlined, UserOutlined } from '@ant-design/icons';
import moment from 'moment';
import SelectedSupplier from '@src/components/Manager/SelectedSupplier';
import Paragraph from 'antd/lib/typography/Paragraph';
import { FormInstance } from 'antd/lib/form';
import FileAttachmentsImages from '@src/components/FileAttachmentsImages';
import { stores } from '@src/stores/storeInitializer';
import TextArea from 'antd/lib/input/TextArea';

export interface IProps {
    importRepostitorySelected?: ImportRepositoryDto,
    listProductImport?: ProductImportDto[];
    onCancel?: () => void;
    detailImportRepository: boolean;
}
export default class CreateOrUpdateImportsitoryAdmin extends AppComponentBase<IProps> {
    formRef: React.RefObject<FormInstance> = React.createRef();
    state = {
        isLoadDone: true,
        im_re_id: undefined,
        su_id: undefined,
        saveType: 0,
        import: moment(),

    }
    listAttachmentItem_file: AttachmentItem[] = [];
    importRepositorySelected: ImportRepositoryDto = new ImportRepositoryDto;
    componentDidMount() {
        this.initData(this.props.importRepostitorySelected)
    }

    onCancel = () => {
        if (!!this.props.onCancel) {
            this.props.onCancel();
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
    onCreateUpdate = (status: number) => {
        const { importRepostitorySelected, listProductImport } = this.props;
        this.setState({ isLoadDone: false });

        const form = this.formRef.current;
        form!.validateFields().then(async (values: any) => {
            if (importRepostitorySelected?.im_re_id === undefined || importRepostitorySelected.im_re_id < 0) {
                let unitData = new CreateImportRepositoryInput({ ...values });
                unitData.fi_id_list = this.listAttachmentItem_file;
                unitData.im_re_total_money = listProductImport != undefined ? listProductImport.reduce((accumulator, currentValue) => accumulator + currentValue.pr_im_unit_price, 0) : 0;
                unitData.im_re_debt = listProductImport != undefined ? listProductImport.reduce((accumulator, currentValue) => accumulator + currentValue.pr_im_unit_price, 0) : 0;
                unitData.listProductImport = this.addProductImportNo();
                unitData.im_re_status = status;
                unitData.im_re_imported_at = moment(this.state.import).toDate();
                await stores.importRepositoryStore.createImportRepository(unitData);
                await this.onCancel();
                message.success("Thêm mới thành công!");
            }
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
    render() {
        const { detailImportRepository } = this.props
        const height = window.innerHeight;
        const totalMoney = this.props.listProductImport != undefined ? this.props.listProductImport.reduce((accumulator, currentValue) => accumulator + currentValue.pr_im_total_money, 0) : 0;
        return (

            <Card className='heightWindow' style={{ height: `${height} !important` }}>
                {detailImportRepository == false ?
                    <>
                        <Row>
                            <Col span={16}>
                                <Paragraph><Space><UserOutlined />Máy Khoa liên ngành SIS</Space></Paragraph>
                            </Col>
                            <Col span={8} style={{ textAlign: 'right' }}>
                                <p>{moment().format('DD/MM/YYYY HH:mm')}</p>
                            </Col>
                        </Row>
                        <Form
                            ref={this.formRef}
                            labelCol={{ span: 8 }}
                            style={{ width: '100%' }}>

                            <Form.Item
                                label={'Mã phiếu nhập'}
                                name={'im_re_code'}
                                rules={[{ required: true, message: 'Không được để trống!' }]}
                            >
                                <Input placeholder='Mã phiếu nhập....' />
                            </Form.Item>
                            <Form.Item
                                label={'Nhà cung cấp'}
                                name={'su_id'}
                                rules={[{ required: true, message: 'Không được để trống!' }]}
                            >
                                <SelectedSupplier supplierID={this.state.su_id} onChangeSupplier={(value) => this.formRef.current?.setFieldsValue({ su_id: value })} />
                            </Form.Item>
                            <Form.Item
                                label='Trạng thái'
                            >
                                <Paragraph strong>{this.props.importRepostitorySelected?.im_re_status ? <Tag color='success'>Đã nhập kho</Tag> : <Tag color='processing'>Phiếu tạm</Tag>}</Paragraph>
                            </Form.Item>
                            <Form.Item
                                label='Tổng số lượng'
                            >
                                <Tag>{AppConsts.formatNumber(this.props.listProductImport != undefined ? this.props.listProductImport.reduce((accumulator, currentValue) =>
                                    accumulator + currentValue.pr_im_quantity, 0) : 0)}</Tag>
                            </Form.Item>
                            <Form.Item
                                name={'pr_im_total_money'}
                                label='Tổng tiền'
                            >
                                <Paragraph strong> {AppConsts.formatNumber(totalMoney)} VNĐ</Paragraph>
                            </Form.Item>
                            {totalMoney > 0 &&

                                <Form.Item
                                    label='Cần trả nhà cung cấp'
                                >
                                    <Paragraph >{AppConsts.formatNumber(totalMoney)} VNĐ</Paragraph>
                                </Form.Item>
                            }
                            <Form.Item label="Ghi chú" {...AppConsts.formItemLayout} name={'im_re_note'} >
                                <TextArea placeholder="Ghi chú..." allowClear  rows={4}></TextArea>
                            </Form.Item>
                            <Form.Item label="Ảnh">
                                <FileAttachmentsImages
                                    files={this.listAttachmentItem_file}
                                    isLoadFile={this.state.isLoadDone}
                                    allowRemove={true}
                                    componentUpload={FileUploadType.Avatar}
                                    onSubmitUpdate={async (itemFile: AttachmentItem[]) => {
                                        this.listAttachmentItem_file = itemFile;
                                    }}
                                />
                            </Form.Item>
                            {
                                !this.props.importRepostitorySelected?.im_re_status &&

                                <Space style={{ display: 'flex', justifyContent: 'center' }}>
                                    <Button icon={<ExclamationCircleOutlined />} onClick={() => this.onCreateUpdate(0)}>Lưu tạm</Button>
                                    <Button type='primary' htmlType="submit" icon={<CheckCircleOutlined />} onClick={() => this.onCreateUpdate(1)}>Hoàn thành</Button>
                                </Space>
                            }
                        </Form>
                    </>
                    :
                    <>

                    </>
                }
            </Card>
        )
    }
}
