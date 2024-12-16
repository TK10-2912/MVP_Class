import * as React from 'react';
import { Col, Row, Button, Card, Form, Input, message, Modal, Space } from 'antd';
import { L } from '@lib/abpUtility';
import {
    RefundDto,
    AttachmentItem,
    UpdateRefundInput,
    BillingDto,
} from '@services/services_autogen';
import { stores } from '@stores/storeInitializer';
import AppConsts, { } from '@src/lib/appconst';
import rules from '@src/scenes/Validation';
import TextArea from 'antd/lib/input/TextArea';
import SelectEnum from '@src/components/Manager/SelectEnum';
import { eBillMethod, eRefundReasonType, eRefundStatus } from '@src/lib/enumconst';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import SelectedBank from '@src/components/Manager/SelectedBank';
import FileAttachmentsImages from '@src/components/FileAttachmentsImages';
import ModalTableBillingViewAdmin from '@src/scenes/StatisticalReport/TabPayment/BankingPayment/componentAdmin/ModalTableBillingViewAdmin';
const { confirm } = Modal;

export interface IProps {
    onCreateUpdateSuccess?: (borrowReDto: RefundDto) => void;
    refundSelected: RefundDto;
    billingSelected: BillingDto;
    onCancelExpand: () => void;
}

export default class UpdateRefundAdmin extends AppComponentBase<IProps> {
    private formRef: any = React.createRef();
    listAttachmentItem: AttachmentItem[] = [];
    billingSelected: BillingDto = new BillingDto();
    state = {
        isLoadDone: false,
        ref_id_selected: -1,
        isLoadFile: false,
        visibleModalBillProduct: false,
        ref_status: undefined,
    };
    listFileAttachment: AttachmentItem[] = [];
    async componentDidMount() {
        await this.initData(this.props.refundSelected);
        this.billingSelected = this.props.billingSelected;
        this.setState({ isLoadDone: !this.state.isLoadDone });
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
            this.setState({ ref_status: input.ref_status });
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
                        unitData.ref_status = eRefundStatus.REFUNDED.num;
                        await stores.refundStore.updateRefund(unitData);
                        message.success('Hoàn tiền đơn hàng thành công!');
                        await stores.sessionStore.getCurrentLoginInformations();
                        await self.onCreateUpdateSuccess();
                    },
                });
            }
            this.setState({ isLoadDone: true });
        });
    };
    onCreateUpdateSuccess = () => {
        if (!!this.props.onCreateUpdateSuccess) {
            this.props.onCreateUpdateSuccess(this.props.refundSelected);
        }
    };

    render() {
        const { refundSelected } = this.props;
        const self = this;
        return (
            <Card style={{ width: "100%" }}>
                <Row>
                    <>
                        <Col span={14} style={{ textAlign: "start" }}>
                            <h3>
                                {'Cập nhật hoàn tiền đơn hàng '}
                                <b
                                    style={{ cursor: "pointer" }}
                                    onClick={async () => {
                                        if (this.billingSelected != undefined) {
                                            this.setState({
                                                visibleModalBillProduct: true,
                                            });
                                        } else {
                                            message.error("Không tìm thấy mã đơn hàng");
                                        }
                                    }}
                                >
                                    {refundSelected.bi_code + " "}
                                </b>
                            </h3>
                        </Col>
                        <Col span={10} style={{ textAlign: 'right' }}>
                            <Space>
                                <Button type='ghost' danger onClick={this.props.onCancelExpand} >Huỷ</Button>
                                <Button type="primary" onClick={() => this.onUpdate()}>{L('Cập nhật')}</Button>
                            </Space>
                        </Col>
                    </>
                </Row>
                <Form labelAlign={refundSelected.ref_refund_at != null || refundSelected.ref_status === 1 ? 'left' : undefined} ref={this.formRef} style={{ width: "100%", marginTop: "10px" }}>
                    <Row>
                        <Col span={8}>
                            <Form.Item
                                style={{ width: "100%" }}
                                label="Số tiền đã nạp"
                                {...AppConsts.formItemLayoutTitleLarge}
                                rules={[rules.required]}
                                name={'ref_money'}>
                                <strong>
                                    {AppConsts.formatNumber(
                                        (this.billingSelected.bi_method_payment == eBillMethod.MA_QR.num
                                            ? this.billingSelected.bi_qr_received
                                            : this.billingSelected.bi_method_payment == eBillMethod.TIEN_MAT.num
                                                ? this.billingSelected.bi_cash_received
                                                : this.billingSelected.bi_rifd_received) +
                                        this.billingSelected.bi_remain_money
                                    )}
                                </strong>

                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                style={{ width: "100%" }}
                                label="Số tiền thanh toán"
                                {...AppConsts.formItemLayoutTitleLarge}
                                rules={[rules.required]}
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
                        <Col span={8}>
                            <Form.Item label="Số tiền hoàn" {...AppConsts.formItemLayoutTitleLarge} name={'ref_money'} style={{ width: "100%" }}>
                                <strong>{AppConsts.formatNumber(this.props.refundSelected.ref_money)}</strong>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12} style={{ justifyContent: "start" }}>
                            <Form.Item label={"Ngân hàng"} {...AppConsts.formItemLayoutTitleSmall} name={'ref_namebank'}
                                rules={refundSelected.ref_refund_at != null ? undefined : [rules.required, rules.maxNameBank, rules.noAllSpaces]}>
                                <SelectedBank mode={undefined} onChangeBank={(value: string) => { this.formRef.current!.setFieldsValue({ ref_namebank: value }) }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={"Lý do hoàn tiền"} {...AppConsts.formItemLayoutTitleSmall} rules={[rules.required]} name={'ref_reason_type'}>
                                <SelectEnum
                                    enum_value={refundSelected.ref_reason_type}
                                    onChangeEnum={async (value) => {
                                        await this.formRef.current!.setFieldsValue({ ref_reason_type: value });
                                    }}
                                    eNum={eRefundReasonType}
                                ></SelectEnum>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={"Chủ tài khoản"}
                                {...AppConsts.formItemLayoutTitleSmall}
                                rules={[rules.required, rules.gioi_han_ten, rules.noAllSpaces]}
                                name={'ref_nameAccountBank'}
                            >
                                <Input maxLength={255} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={"Số tài khoản"}  {...AppConsts.formItemLayoutTitleSmall} name={'ref_codebank'}
                                rules={[rules.required, rules.maxCodeBank, rules.noAllSpaces, rules.numberOnly]}
                            >
                                <Input maxLength={20} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={"Lý do chi tiết"}
                                {...AppConsts.formItemLayoutTitleSmall}
                                rules={[rules.description, rules.noAllSpaces]}
                                name={'ref_reason'}
                            >
                                <TextArea maxLength={255} placeholder="Nhập lý do" autoSize={{ minRows: 3, maxRows: 5 }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Tệp đính kèm"
                                {...AppConsts.formItemLayout} rules={[rules.required]} name={"fi_id_list"}>
                                {
                                    <FileAttachmentsImages
                                        isUpLoad={true}
                                        maxLength={5}
                                        files={self.listAttachmentItem}
                                        isLoadFile={this.state.isLoadFile}
                                        allowRemove={true}
                                        isMultiple={true}
                                        onSubmitUpdate={async (itemFile: AttachmentItem[]) => {
                                            self.listAttachmentItem = itemFile.slice(0, 5);
                                            await this.formRef.current!.setFieldsValue({ fi_id_list: itemFile });
                                            this.setState({ isLoadFile: !this.state.isLoadFile });
                                        }}
                                    />
                                }
                            </Form.Item>
                        </Col>
                    </Row>
                </Form >
                <ModalTableBillingViewAdmin
                    billSelected={this.billingSelected}
                    visibleModalBillProduct={this.state.visibleModalBillProduct}
                    onCancel={() => this.setState({ visibleModalBillProduct: false, })}
                    listItem={this.billingSelected.entities_id_arr} />
            </Card >
        );
    }
}
