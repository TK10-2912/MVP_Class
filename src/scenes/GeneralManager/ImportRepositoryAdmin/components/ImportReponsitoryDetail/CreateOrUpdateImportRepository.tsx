import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { FileUploadType } from '@src/lib/appconst';
import { AttachmentItem, CreateImportRepositoryInput, ImportRepositoryDto, ProductImportDto, RepositoryDto, UpdateImportRepositoryInput } from '@src/services/services_autogen';
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
import rules from '@src/scenes/Validation';
import SelectRepositoryImport from '@src/components/Manager/SelectRepositoryImport';

export interface IProps {
    importRepostitorySelected?: ImportRepositoryDto,
    listProductImport?: ProductImportDto[];
    onCancel?: () => void;
    onSuccess?: () => void;
}
export default class CreateOrUpdateImportsitoryAdmin extends AppComponentBase<IProps> {
    formRef: React.RefObject<FormInstance> = React.createRef();
    state = {
        isLoadDone: true,
        im_re_id: undefined,
        su_id: undefined,
        saveType: 0,
        import: moment(),
        isLoadFile: false,
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
    onCreateUpdate = (status: number) => {
        const { importRepostitorySelected, listProductImport } = this.props;
        this.setState({ isLoadDone: false });
        const form = this.formRef.current;
        form!.validateFields().then(async (values: any) => {
            if (importRepostitorySelected?.im_re_id === undefined || importRepostitorySelected.im_re_id < 0) {
                let unitData = new CreateImportRepositoryInput({ ...values });
                unitData.fi_id_list = this.listAttachmentItem_file;
                unitData.im_re_total_money = listProductImport != undefined ? listProductImport.reduce((accumulator, currentValue) => accumulator + currentValue.pr_im_total_money, 0) : 0;
                unitData.im_re_debt = listProductImport != undefined ? listProductImport.reduce((accumulator, currentValue) => accumulator + currentValue.pr_im_total_money, 0) : 0;
                unitData.listProductImport = this.addProductImportNo();
                unitData.im_re_status = status;
                unitData.im_re_imported_at = moment(this.state.import).toDate();
                unitData.im_re_code = moment().format("YYMMDDHHmmss");
                await stores.importRepositoryStore.createImportRepository(unitData);
                await this.onSuccess();
                await this.onCancel();
                message.success("Thêm mới thành công!");
            }
            else {
                let unitData = new UpdateImportRepositoryInput({ ...values });
                unitData.im_re_id = importRepostitorySelected.im_re_id;
                unitData.fi_id_list = this.listAttachmentItem_file;
                unitData.im_re_total_money = listProductImport != undefined ? listProductImport.reduce((accumulator, currentValue) => accumulator + currentValue.pr_im_total_money, 0) : 0;
                unitData.im_re_debt = listProductImport != undefined ? listProductImport.reduce((accumulator, currentValue) => accumulator + currentValue.pr_im_total_money, 0) : 0;
                unitData.listProductImport = this.addProductImportNo();
                unitData.im_re_status = status;
                unitData.im_re_imported_at = this.state.import.toDate();
                await stores.importRepositoryStore.updateImportRepository(unitData);
                await this.onCancel();
                await this.onSuccess();
                message.success("Cập nhật thành công!");

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
                this.setState({ isLoadFile: !this.state.isLoadFile })
            }
            if (importRepository.su_id != undefined) {
                this.setState({ su_id: importRepository.su_id })
            }
            this.formRef.current!.setFieldsValue(importRepository);
            this.setState({ isLoadDone: !this.state.isLoadDone });
        } else {
            this.setState({ pr_unit: undefined, su_id: undefined })
            this.listAttachmentItem_file = [];
            this.formRef.current!.resetFields();
        }
        this.setState({ isLoadDone: true });
    }
    render() {
        const height = window.innerHeight;
        const totalMoney = this.props.listProductImport != undefined ? this.props.listProductImport.reduce((accumulator, currentValue) => accumulator + currentValue.pr_im_total_money, 0) : 0;
        return (

            <Card className='heightWindow' style={{ height: `${height} !important`, overflowY: "auto" }} >
                <>
                    <Row>
                        <Col span={16}>
                            <Paragraph><Space><UserOutlined />{stores.sessionStore.getNameUserLogin()}</Space></Paragraph>
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

                        >
                            {/* <Input placeholder='Mã phiếu nhập....' maxLength={30} /> */}
                            <span>{moment().format("YYMMDDHHmmss")}</span>
                        </Form.Item>
                        <Form.Item
                            {...AppConsts.formItemLayout}
                            label={'Nhà cung cấp'}
                            name={'su_id'}
                            rules={[rules.required]}
                        >
                            <SelectedSupplier supplierID={this.state.su_id} onChangeSupplier={(value) => this.formRef.current?.setFieldsValue({ su_id: value })} />
                        </Form.Item>
                        <Form.Item
                            label='Trạng thái'
                        >
                            <Paragraph strong>{this.props.importRepostitorySelected?.im_re_status ? <Tag color='success'>Đã nhập kho</Tag> : <Tag color='processing'>Phiếu tạm</Tag>}</Paragraph>
                        </Form.Item>
                        <Form.Item
                            label={"Tổng số lượng"}
                        >
                            <Tag><b>{AppConsts.formatNumber(this.props.listProductImport != undefined ? this.props.listProductImport.reduce((accumulator, currentValue) => accumulator + (currentValue.pr_im_quantity), 0) : 0)}</b></Tag>
                        </Form.Item>
                        <Form.Item
                            label={"Tổng số lượng quy đổi"}
                        >
                            <Tag><b>{AppConsts.formatNumber(this.props.listProductImport != undefined ? this.props.listProductImport.reduce((accumulator, currentValue) => accumulator + (currentValue.pr_im_quantity*currentValue.pr_im_quantity_quydoi), 0) : 0)}</b></Tag>
                        </Form.Item>
                        <Form.Item
                            name={'pr_im_total_money'}
                            label='Tổng tiền'
                        >
                            <Paragraph strong> {AppConsts.formatNumber(totalMoney)} VNĐ</Paragraph>
                        </Form.Item>
                        {totalMoney > 0 &&

                            <Form.Item
                                label='Cần trả nhà cung cấp: '
                            >
                                <Paragraph strong>{AppConsts.formatNumber(totalMoney)} VNĐ</Paragraph>
                            </Form.Item>
                        }
                        <Form.Item label="Ghi chú" {...AppConsts.formItemLayout} name={'im_re_note'} >
                            <TextArea placeholder="Ghi chú..." allowClear rows={4} maxLength={255}></TextArea>
                        </Form.Item>
                        <Form.Item label="Tệp đính kèm" name='fi_id_list' rules={[rules.required]}  >
                            <FileAttachmentsImages
                                isUpLoad={true}
                                maxLength={5}
                                files={this.listAttachmentItem_file}
                                isLoadFile={this.state.isLoadFile}
                                allowRemove={true}
                                isMultiple={true}
                                onSubmitUpdate={async (itemFile: AttachmentItem[]) => {
                                    this.listAttachmentItem_file = itemFile.slice(0, 5);
                                    await this.formRef.current!.setFieldsValue({ fi_id_list: itemFile });
                                    this.setState({ isLoadFile: !this.state.isLoadFile });
                                }}
                            />
                        </Form.Item>
                        {
                            this.props.importRepostitorySelected != undefined && this.props.importRepostitorySelected.im_re_status == 1 ?
                                <></>
                                :
                                <Space style={{ display: 'flex', justifyContent: 'center' }}>
                                    <Button icon={<ExclamationCircleOutlined />} onClick={() => this.onCreateUpdate(0)}>Lưu tạm</Button>
                                    {this.props.listProductImport != undefined && this.props.listProductImport?.length > 0 &&
                                        <Button type='primary' htmlType="submit" icon={<CheckCircleOutlined />} onClick={() => this.onCreateUpdate(1)}>Cập nhật</Button>
                                    }
                                </Space>
                        }
                    </Form>
                </>
            </Card>
        )
    }
}
