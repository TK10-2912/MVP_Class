import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { FileUploadType } from '@src/lib/appconst';
import { AttachmentItem, CreateTranferRepositoryInput, TranferRepositoryDto, ProductTranferDto, RepositoryDto, UpdateTranferRepositoryInput } from '@src/services/services_autogen';
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
import { eTranferRepositoryStatus } from '@src/lib/enumconst';

export interface IProps {
    transferRepositorySelected?: TranferRepositoryDto,
    listProductTranfer?: ProductTranferDto[];
    onCancel?: () => void;
    onSuccess?: () => void;
}
export default class CreateOrUpdateTranferRepositoryAdmin extends AppComponentBase<IProps> {
    formRef: React.RefObject<FormInstance> = React.createRef();
    state = {
        isLoadDone: true,
        tr_re_id: undefined,
        su_id: undefined,
        saveType: 0,
        import: moment(),
        isLoadFile: false,
    }
    listAttachmentItem_file: AttachmentItem[] = [];
    tranferRepositorySelected: TranferRepositoryDto = new TranferRepositoryDto;
    componentDidMount() {
        this.initData(this.props.transferRepositorySelected)
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
        const { transferRepositorySelected, listProductTranfer } = this.props;
        this.setState({ isLoadDone: false });
        const form = this.formRef.current;
        form!.validateFields().then(async (values: any) => {
            if (transferRepositorySelected?.tr_re_id === undefined || transferRepositorySelected.tr_re_id < 0) {
                let unitData = new CreateTranferRepositoryInput({ ...values });
                unitData.fi_id_list = this.listAttachmentItem_file;
                unitData.tr_re_total_money = listProductTranfer != undefined ? listProductTranfer.reduce((accumulator, currentValue) => accumulator + currentValue.pr_tr_total_money, 0) : 0;
                unitData.listProductTranfer = this.addProductImportNo();
                await stores.transferRepositoryStore.createTranferRepository(unitData);
                await this.onSuccess();
                await this.onCancel();
                message.success("Thêm mới thành công!");
            }
            else {
                let unitData = new UpdateTranferRepositoryInput({ ...values });
                unitData.tr_re_id = transferRepositorySelected.tr_re_id;
                unitData.fi_id_list = this.listAttachmentItem_file;
                unitData.tr_re_total_money = listProductTranfer != undefined ? listProductTranfer.reduce((accumulator, currentValue) => accumulator + currentValue.pr_tr_total_money, 0) : 0;
                unitData.listProductTranfer = this.addProductImportNo();
                await stores.transferRepositoryStore.updateTranferRepository(unitData);
                await this.onSuccess();
                await this.onCancel();
                message.success("Cập nhật thành công!");

            }
            await stores.sessionStore.getCurrentLoginInformations();
            this.setState({ isLoadDone: true });
        })
    };

    initData = async (tranferRepository: TranferRepositoryDto | undefined) => {
        this.setState({ isLoadDone: false });
        if (tranferRepository !== undefined && tranferRepository.tr_re_id !== undefined) {
            this.tranferRepositorySelected = tranferRepository!;
            this.setState({ isLoadDone: !this.state.isLoadDone });

            if (tranferRepository.fi_id_list != undefined) {
                this.listAttachmentItem_file = tranferRepository.fi_id_list;
                this.setState({ isLoadFile: !this.state.isLoadFile })
            }

            this.formRef.current!.setFieldsValue(tranferRepository);
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
        const totalMoney = this.props.listProductTranfer != undefined ? this.props.listProductTranfer.reduce((accumulator, currentValue) => accumulator + currentValue.pr_tr_total_money, 0) : 0;
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
                            label='Trạng thái'
                        >
                            <Paragraph strong>
                                {this.props.transferRepositorySelected?.tr_re_status === eTranferRepositoryStatus.TEMPORARY.num && (
                                    <Tag color="magenta">Phiếu tạm</Tag>
                                )}
                                {this.props.transferRepositorySelected?.tr_re_status === eTranferRepositoryStatus.REQUEST.num && (
                                    <Tag color="processing">Yêu cầu nhập hàng</Tag>
                                )}
                                {this.props.transferRepositorySelected?.tr_re_status === eTranferRepositoryStatus.RECEIVED.num && (
                                    <Tag color="gold">Đã nhận hàng</Tag>
                                )}
                                {this.props.transferRepositorySelected?.tr_re_status === eTranferRepositoryStatus.CONFIRM.num && (
                                    <Tag color="geekblue">Đã xác nhận</Tag>
                                )}
                                {this.props.transferRepositorySelected?.tr_re_status === eTranferRepositoryStatus.IMPORTED.num && (
                                    <Tag color="success">Đã nhập kho</Tag>
                                )}
                            </Paragraph>
                        </Form.Item>
                        <Form.Item
                            label={"Tổng số lượng"}
                        >
                            <Tag><b>{AppConsts.formatNumber(this.props.listProductTranfer != undefined ? this.props.listProductTranfer.reduce((accumulator, currentValue) =>
                                accumulator + currentValue.pr_tr_quantity, 0) : 0)}</b></Tag>
                        </Form.Item>
                        <Form.Item
                            name={'pr_tr_total_money'}
                            label='Tổng tiền'
                        >
                            <Paragraph strong> {AppConsts.formatNumber(totalMoney)} VNĐ</Paragraph>
                        </Form.Item>

                        <Form.Item label="Ghi chú" {...AppConsts.formItemLayout} name={'tr_re_note'} >
                            <TextArea placeholder="Ghi chú..." allowClear rows={4} maxLength={255}></TextArea>
                        </Form.Item>
                        {/* <Form.Item label="Tệp đính kèm" name='fi_id_list' rules={[rules.required]}  >
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
                        </Form.Item> */}
                        {/* {
                            this.props.transferRepositorySelected != undefined && this.props.transferRepositorySelected.tr_re_status == 1 ?
                                <></>
                                : */}
                        <Space style={{ display: 'flex', justifyContent: 'center' }}>
                            {/* <Button icon={<ExclamationCircleOutlined />} onClick={() => this.onCreateUpdate(0)}>Lưu tạm</Button> */}
                            {this.props.listProductTranfer != undefined && this.props.listProductTranfer?.length > 0 &&
                                <Button type='primary' htmlType="submit" icon={<CheckCircleOutlined />} onClick={() => this.onCreateUpdate()}>Cập nhật</Button>
                            }
                        </Space>
                        {/* } */}
                    </Form>
                </>
            </Card>
        )
    }
}
