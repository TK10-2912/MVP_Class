import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts, { FileUploadType } from '@src/lib/appconst';
import { AttachmentItem, TranferRepositoryDto, ProductTranferDto, RepositoryDto, CreateTranferRepositoryInput, UpdateTranferRepositoryInput } from '@src/services/services_autogen';
import { Button, Card, Col, Form, Input, Row, Space, Tag, TreeSelect, message } from 'antd';
import * as React from 'react';
import { CheckCircleOutlined, ExclamationCircleOutlined, UserOutlined } from '@ant-design/icons';
import moment from 'moment';
import Paragraph from 'antd/lib/typography/Paragraph';
import { FormInstance } from 'antd/lib/form';
import { stores } from '@src/stores/storeInitializer';
import TextArea from 'antd/lib/input/TextArea';
import { eTranferRepositoryStatus } from '@src/lib/enumconst';
import FileAttachmentsImages from '@src/components/FileAttachmentsImages';
import rules from '@src/scenes/Validation';

export interface IProps {
    transferRepositoryDetailSelected?: TranferRepositoryDto,
    listProductTransfer?: ProductTranferDto[];
    onCancel?: () => void;
    onSuccess?: () => void;
    onChangeRepository?: (re_id: number) => void;
}
export default class CreateTransferRepositoryDetail extends AppComponentBase<IProps> {
    formRef: React.RefObject<FormInstance> = React.createRef();
    state = {
        isLoadDone: true,
        im_re_id: undefined,
        su_id: undefined,
        saveType: 0,
        import: moment(),
        isLoadFile: false,
        re_id: undefined,

    }
    listAttachmentItem_file: AttachmentItem[] = [];
    transferRepositorySelected: TranferRepositoryDto = new TranferRepositoryDto;
    treeSelect: RepositoryDto = new RepositoryDto();

    componentDidMount() {
        this.initData(this.props.transferRepositoryDetailSelected)
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
        const { listProductTransfer } = this.props;
        if (listProductTransfer) {
            const updatedProducts = listProductTransfer.map((product, index) => {
                const updatedProduct = new ProductTranferDto(product);
                updatedProduct.pr_tr_no = index + 1;
                return updatedProduct;
            });
            return updatedProducts;
        }
        return [];
    }
    // onCreateUpdate = (status: number) => {

    //     this.setState({ isLoadDone: false });

    //     const form = this.formRef.current;
    //     form!.validateFields().then(async (values: any) => {
    //         let unitData = new CreateTranferRepositoryInput(values);
    //         // if (unitData.re_id === -1) {
    //         //     message.error("Không được thay đổi kho")
    //         // }
    //         unitData.fi_id_list = this.listAttachmentItem_file;
    //         unitData.tr_re_status = status;
    //         unitData.us_id_receiver = stores.sessionStore.getUserLogin().id;
    //         unitData.listProductTransfer = this.addProductImportNo();
    //         await stores.transferRepositoryStore.createTranferRepository(unitData);
    //         await this.onSuccess();
    //         await this.onCancel();
    //         message.success("Thêm mới thành công!");
    //         await stores.sessionStore.getCurrentLoginInformations();
    //         this.setState({ isLoadDone: true });
    //     })
    // };

    onCreateUpdate = (status?: number) => {
        const { transferRepositoryDetailSelected, listProductTransfer } = this.props;
        this.setState({ isLoadDone: false });
        const form = this.formRef.current;
        form!.validateFields().then(async (values: any) => {
            if (transferRepositoryDetailSelected?.tr_re_id === undefined || transferRepositoryDetailSelected.tr_re_id < 0) {
                let unitData = new CreateTranferRepositoryInput({ ...values });
                unitData.fi_id_list = this.listAttachmentItem_file;
                // unitData.tr_re_total_money = listProductTransfer != undefined ? listProductTransfer.reduce((accumulator, currentValue) => accumulator + currentValue.pr_tr_total_money, 0) : 0;
                unitData.listProductTranfer = this.addProductImportNo();
                if (status) {
                    unitData.tr_re_status = status;
                }
                unitData.us_id_receiver = stores.sessionStore.getUserLogin().id;
                await stores.transferRepositoryStore.createTranferRepository(unitData);
                await this.onSuccess();
                await this.onCancel();
                message.success("Thêm mới thành công!");
            }
            else {
                let unitData = new UpdateTranferRepositoryInput({ ...values });
                unitData.tr_re_id = transferRepositoryDetailSelected.tr_re_id;
                unitData.fi_id_list = this.listAttachmentItem_file;
                //unitData.tr_re_total_money = listProductTransfer != undefined ? listProductTransfer.reduce((accumulator, currentValue) => accumulator + currentValue.pr_tr_total_money, 0) : 0;
                unitData.listProductTranfer = this.addProductImportNo();
                if (status) {
                    unitData.tr_re_status = status;
                }
                await stores.transferRepositoryStore.updateTranferRepository(unitData);
                await this.onCancel();
                await this.onSuccess();
                message.success("Cập nhật thành công!");

            }
            await stores.sessionStore.getCurrentLoginInformations();
            this.setState({ isLoadDone: true });
        })
    };

    initData = async (transferRepository: TranferRepositoryDto | undefined) => {
        this.setState({ isLoadDone: false });
        if (transferRepository !== undefined && transferRepository.tr_re_id !== undefined) {
            this.transferRepositorySelected = transferRepository!;
            this.setState({ isLoadDone: !this.state.isLoadDone });

            if (transferRepository.fi_id_list != undefined) {
                this.listAttachmentItem_file = transferRepository.fi_id_list;
                this.setState({ isLoadFile: !this.state.isLoadFile })
            }
            this.formRef.current!.setFieldsValue(transferRepository);
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
        let self = this;
        // const totalMoney = this.props.listProductTransfer != undefined ? this.props.listProductTransfer.reduce((accumulator, currentValue) => accumulator + currentValue.pr_tr_total_money, 0) : 0;
        // const { repositoryListResult } = stores.repositoryStore;
        //const listRepositoryAdmin = repositoryListResult.filter(item=> item.us_id_operator == stores.sessionStore.getUserLogin().id!);

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
                            label={"Tổng số lượng"}
                        >
                            <Tag><b>{AppConsts.formatNumber(this.props.listProductTransfer != undefined ? this.props.listProductTransfer.reduce((accumulator, currentValue) =>
                                accumulator + currentValue.pr_tr_quantity, 0) : 0)}</b></Tag>
                        </Form.Item>
                        {/* <Form.Item
                            name={'pr_im_total_money'}
                            label='Tổng tiền'
                        >
                            <Paragraph strong> {AppConsts.formatNumber(totalMoney)} VNĐ</Paragraph>
                        </Form.Item> */}

                        <Form.Item label="Ghi chú" {...AppConsts.formItemLayout} name={'tr_re_note'} >
                            <TextArea placeholder="Ghi chú..." allowClear rows={4} maxLength={255}></TextArea>
                        </Form.Item>
                        {
                            this.transferRepositorySelected.tr_re_status === eTranferRepositoryStatus.RECEIVED.num &&
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
                        }
                        {this.transferRepositorySelected.tr_re_status !== eTranferRepositoryStatus.RECEIVED.num ?
                            <Space style={{ display: 'flex', justifyContent: 'center' }}>
                                <Button icon={<ExclamationCircleOutlined />} onClick={() => this.onCreateUpdate(eTranferRepositoryStatus.TEMPORARY.num)}>Lưu tạm</Button>
                                <Button type='primary' htmlType="submit" icon={<CheckCircleOutlined />} onClick={() => this.onCreateUpdate(eTranferRepositoryStatus.REQUEST.num)}>Tạo yêu cầu</Button>
                            </Space>
                            :
                            <Space style={{ display: 'flex', justifyContent: 'center' }}>
                                <Button danger icon={<ExclamationCircleOutlined />} onClick={this.onCancel}>Hủy</Button>
                                <Button type='primary' htmlType="submit" icon={<CheckCircleOutlined />} onClick={() => this.onCreateUpdate(eTranferRepositoryStatus.IMPORTED.num)}>Cập nhật</Button>
                            </Space>
                        }
                    </Form>
                </>
            </Card>
        )
    }
}
