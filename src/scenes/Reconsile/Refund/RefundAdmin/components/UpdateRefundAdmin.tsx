import * as React from 'react';
import { Col, Row, Button, Card, Form, Input, message, Modal, Image, Space } from 'antd';
import { L } from '@lib/abpUtility';
import {
    RefundDto,
    AttachmentItem,
    UpdateRefundInput,
    BillingDto,
} from '@services/services_autogen';
import { stores } from '@stores/storeInitializer';
import AppConsts, { FileUploadType } from '@src/lib/appconst';
import rules from '@src/scenes/Validation';
import TextArea from 'antd/lib/input/TextArea';
import FileAttachments from '@src/components/FileAttachments';
import SelectEnum from '@src/components/Manager/SelectEnum';
import { ePaymentMethod, eRefundReasonType, valueOfeRefundReasonType } from '@src/lib/enumconst';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import SelectedBank from '@src/components/Manager/SelectedBank';
const { confirm } = Modal;

export interface IProps {
    onCreateUpdateSuccess?: (borrowReDto: RefundDto) => void;
    onCancel: () => void;
    refundSelected: RefundDto;
}

export default class UpdateRefundAdmin extends AppComponentBase<IProps> {
    private formRef: any = React.createRef();
    listAttachmentItem: AttachmentItem[] = [];
    billingSelected: BillingDto = new BillingDto();
    state = {
        isLoadDone: false,
        isActive: true,
        ref_id_selected: -1,
        us_id_owner: undefined,
        urlImage: 0,
        isLoadFile: false,

    };

    async componentDidMount() {
        await this.setState({ isLoadDone: false });
        await this.initData(this.props.refundSelected);
        await stores.billingStore.getAllByAdmin(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined
        );
        const { billListResult } = stores.billingStore;
        if (billListResult) {
            this.billingSelected =
                billListResult.find((a) => this.props.refundSelected.bi_code === a.bi_code) ||
                this.billingSelected;
        }

        if (this.listAttachmentItem[0] != undefined) {
            this.setState({ urlImage: this.listAttachmentItem[0]!.id });
        }
        await this.setState({ isLoadDone: true });
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.refundSelected.rf_id !== prevState.ref_id_selected) {
            return { ref_id_selected: nextProps.refundSelected.rf_id };
        }
        return null;
    }

    async componentDidUpdate(prevProps, prevState) {
        if (this.state.ref_id_selected !== prevState.ref_id_selected) {
            this.initData(this.props.refundSelected);
        }
    }

    initData = async (input: RefundDto) => {
        this.setState({ isLoadDone: false, isLoadFile: !this.state.isLoadFile });
        if (input !== undefined && input.ref_id) {
            this.listAttachmentItem = input.fi_id_list === undefined ? [] : input.fi_id_list.filter((item) => item.isdelete === false);
            if (!input.ref_reason) {
                input.ref_reason = '';
            }
            const { billListResult } = stores.billingStore;
            if (billListResult) {
                this.billingSelected = billListResult.find((a) => this.props.refundSelected.bi_code === a.bi_code) || this.billingSelected;
            }
            this.formRef.current.setFieldsValue({ ...input });
        }
        await this.setState({ isLoadDone: true, isLoadFile: !this.state.isLoadFile });
    };

    onUpdate = () => {
        const { refundSelected } = this.props;
        let self = this;
        if (this.listAttachmentItem.length < 1) {
            message.error('Thiếu ảnh');
            return;
        }
        const form = this.formRef.current;
        form!.validateFields().then(async (values: any) => {
            this.setState({ isLoadDone: false });
            if (refundSelected.ref_id != undefined || refundSelected.ref_id > 0) {
                confirm({
                    title: (
                        <span>
                            {'Bạn đã kiểm tra kỹ và muốn hoàn thành hoàn tiền đơn '}
                            <b>{refundSelected.bi_code}</b>
                            {'?'}
                        </span>
                    ),
                    okText: L('Xác nhận'),
                    cancelText: L('Hủy'),
                    async onOk() {
                        let unitData = new UpdateRefundInput({ ref_id: refundSelected.ref_id, ...values });
                        unitData.fi_id_list = self.listAttachmentItem;
                        await stores.refundStore.updateRefund(unitData);
                        message.success('Hoàn tiền đơn hàng thành công!');
                        await stores.sessionStore.getCurrentLoginInformations();
                        await self.onCreateUpdateSuccess();
                        self.formRef.current.resetFields();
                    },
                });
            }
            this.setState({ isLoadDone: true });
        });
    };

    onCancel = () => {
        if (!!this.props.onCancel) {
            this.props.onCancel();
        }
        this.formRef.current.resetFields();
    };
    onCreateUpdateSuccess = () => {
        if (!!this.props.onCreateUpdateSuccess) {
            this.props.onCreateUpdateSuccess(this.props.refundSelected);
        }
    };

    render() {
        const { refundSelected } = this.props;
        const self = this;
        const style = refundSelected.ref_refund_at ? { height: 40 } : undefined;
        return (
            <Card>
                <Row>
                    {refundSelected.ref_refund_at ? (
                        <>
                            <Col span={14}>
                                <h3>
                                    {'Chi tiết hoàn tiền đơn hàng '}
                                    <b>{refundSelected.bi_code}</b>
                                </h3>
                            </Col>
                            <Col span={10} style={{ textAlign: 'right' }}>
                                <Button
                                    danger
                                    onClick={() => this.onCancel()}
                                >
                                    {L('Huỷ')}
                                </Button>
                            </Col>
                        </>
                    ) : (
                        <>
                            <Col span={14}>
                                <h3>
                                    {'Cập nhật hoàn tiền đơn hàng '}
                                    <b>{refundSelected.bi_code}</b>
                                </h3>
                            </Col>
                            <Col span={10} style={{ textAlign: 'right' }}>
                                <Space>
                                    <Button
                                        danger
                                        onClick={() => this.onCancel()}
                                    >
                                        {L('Huỷ')}
                                    </Button>
                                    <Button
                                        type="primary"
                                        onClick={() => this.onUpdate()}
                                    >
                                        {L('Cập nhật')}
                                    </Button>
                                </Space>
                            </Col>
                        </>
                    )}
                </Row>
                <Form labelAlign={refundSelected.ref_refund_at != null ? 'left' : undefined} ref={this.formRef} style={{ width: '100%' }}>
                    <Row>
                        <Col span={8}>
                            <Form.Item
                                label="Số tiền đã nạp"
                                {...AppConsts.formItemLayoutTitleSmall}
                                rules={refundSelected.ref_refund_at != null ? undefined : [rules.required]}
                                name={'ref_money'}
                            >
                                <strong>
                                    {AppConsts.formatNumber(
                                        (this.billingSelected.bi_method_payment == ePaymentMethod.MA_QR.num
                                            ? this.billingSelected.bi_qr_received
                                            : this.billingSelected.bi_method_payment == ePaymentMethod.TIEN_MAT.num
                                                ? this.billingSelected.bi_cash_received
                                                : this.billingSelected.bi_rifd_received) +
                                        this.billingSelected.bi_remain_money
                                    )}
                                </strong>
                            </Form.Item>
                        </Col>
                        <Col span={9}>
                            <Form.Item
                                label="Số tiền thanh toán"
                                {...AppConsts.formItemLayoutTitleLarge}
                                rules={refundSelected.ref_refund_at != null ? undefined : [rules.required]}
                                name={'ref_money'}
                            >
                                <strong>
                                    {AppConsts.formatNumber(
                                        !!this.billingSelected && this.billingSelected.entities_id_arr
                                            ? this.billingSelected.entities_id_arr.reduce(
                                                (sum, product) =>
                                                    sum +
                                                    (!!product.statusPaidProduct
                                                        ? product.statusPaidProduct!.filter((a) => a.status == 'Success')
                                                            .length * product.product_money
                                                        : 0
                                                    ),
                                                0
                                            )
                                            : 0
                                    )}
                                </strong>
                            </Form.Item>
                        </Col>
                        <Col span={7}>
                            <Form.Item
                                label="Số tiền hoàn"
                                {...AppConsts.formItemLayoutTitleLarge}
                                name={'ref_money'}
                            >
                                <strong>{AppConsts.formatNumber(this.props.refundSelected.ref_money)}</strong>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>

                            <Form.Item
                                label="Ngân hàng"
                                {...AppConsts.formItemLayoutTitleSmall}
                                rules={refundSelected.ref_refund_at != null ? undefined : [rules.required, rules.maxNameBank, rules.noAllSpaces]}
                                name={'ref_namebank'}
                            >
                                {refundSelected.ref_refund_at != null ? (
                                    <strong>{refundSelected.ref_namebank}</strong>
                                ) :
                                    <SelectedBank mode={undefined} onChangeBank={(value: string) => { this.formRef.current!.setFieldsValue({ ref_namebank: value }) }} />}
                            </Form.Item>

                            <Row>
                                <Col span={12}>
                                    <Form.Item
                                        label="Chủ tài khoản"
                                        {...AppConsts.formItemLayoutTitleLarge}
                                        rules={refundSelected.ref_refund_at != null ? undefined : [rules.required, rules.gioi_han_ten, rules.noAllSpaces]}
                                        name={'ref_nameAccountBank'}
                                    >
                                        {refundSelected.ref_refund_at != null ? (
                                            <strong>{refundSelected.ref_nameAccountBank}</strong>
                                        ) : (
                                            <Input />
                                        )}
                                    </Form.Item>

                                </Col>
                                <Col span={12}>

                                    <Form.Item
                                        label="Số tài khoản"
                                        {...AppConsts.formItemLayoutTitleLarge}

                                        rules={refundSelected.ref_refund_at != null ? undefined : [rules.required, rules.maxCodeBank, rules.noAllSpaces, rules.numberOnly]}
                                        name={'ref_codebank'}
                                    >
                                        {refundSelected.ref_refund_at != null ? (
                                            <strong>{refundSelected.ref_codebank}</strong>
                                        ) : (
                                            <Input />
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                label="Lý do hoàn tiền"
                                {...AppConsts.formItemLayoutTitleSmall}
                                rules={refundSelected.ref_refund_at != null ? undefined : [rules.required]}
                                name={'ref_reason_type'}
                            >
                                {refundSelected.ref_refund_at != null ? (
                                    <strong>
                                        {valueOfeRefundReasonType(this.props.refundSelected.ref_reason_type)}
                                    </strong>
                                ) : (
                                    <SelectEnum
                                        enum_value={refundSelected.ref_reason_type}
                                        onChangeEnum={async (value) => {
                                            await this.formRef.current!.setFieldsValue({ ref_reason_type: value });
                                        }}
                                        eNum={eRefundReasonType}
                                    ></SelectEnum>
                                )}
                            </Form.Item>


                            <Form.Item
                                label="Lý do chi tiết"
                                {...AppConsts.formItemLayoutTitleSmall}
                                rules={refundSelected.ref_refund_at != null ? undefined : [rules.description, rules.noAllSpaces]}
                                name={'ref_reason'}
                            >
                                {refundSelected.ref_refund_at != null ? (
                                    <strong>{refundSelected.ref_reason}</strong>
                                ) : (
                                    <TextArea placeholder="Nhập lý do" autoSize={{ minRows: 3, maxRows: 5 }} />
                                )}
                            </Form.Item>



                            <Form.Item
                                label="Ảnh"
                                {...AppConsts.formItemLayoutTitleSmall}
                            >
                                {
                                    refundSelected.ref_refund_at ?
                                        (
                                            this.listAttachmentItem?.map((item, index) => (
                                                <React.Fragment key={index}>
                                                    <Image src={this.getFile(item.id)} width={300}></Image>
                                                    <FileAttachments
                                                        files={[item]}
                                                        isLoadFile={this.state.isLoadFile}
                                                        allowRemove={false}
                                                        isDownload={true}
                                                        isViewFile={false}
                                                        isShowListUploadOnly={true}
                                                        showRemoveIcon={refundSelected.ref_refund_at != null ? false : true}
                                                        isUpLoad={refundSelected.ref_refund_at != null ? false : true}
                                                    />
                                                </React.Fragment>
                                            ))
                                        )
                                        :
                                        <FileAttachments
                                            files={self.listAttachmentItem}
                                            isLoadFile={this.state.isLoadDone}
                                            allowRemove={true}
                                            numberOfUpload={3}
                                            isMultiple={true}
                                            componentUpload={FileUploadType.Avatar}
                                            onSubmitUpdate={async (itemFile: AttachmentItem[]) => {
                                                this.setState({ isLoadDone: false })
                                                self.listAttachmentItem = itemFile;
                                                this.setState({ isLoadDone: true })

                                            }}
                                            isDownload={true}
                                            showRemoveIcon={refundSelected.ref_refund_at != null ? false : true}
                                            isUpLoad={refundSelected.ref_refund_at != null ? false : true}
                                        />
                                }
                            </Form.Item>
                        </Col>

                    </Row>

                </Form>
            </Card >
        );
    }
}
