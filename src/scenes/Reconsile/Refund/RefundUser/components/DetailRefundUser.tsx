import * as React from 'react';
import { Col, Row, Card, Form, message, Modal, Carousel, Space, Button } from 'antd';
import {
    RefundDto,
    AttachmentItem,
    BillingDto,
} from '@services/services_autogen';
import { stores } from '@stores/storeInitializer';
import AppConsts, { } from '@src/lib/appconst';
import TextArea from 'antd/lib/input/TextArea';
import { eBillMethod, valueOfeRefundReasonType } from '@src/lib/enumconst';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import FileAttachmentsImages from '@src/components/FileAttachmentsImages';
import ModalTableBillingViewAdmin from '@src/scenes/StatisticalReport/TabPayment/BankingPayment/componentAdmin/ModalTableBillingViewAdmin';
import moment from 'moment';
const { confirm } = Modal;

export interface IProps {
    refundSelected: RefundDto;
}

export default class DetailRefundUser extends AppComponentBase<IProps> {
    private formRef: any = React.createRef();
    carouselRef: any = React.createRef();
    listAttachmentItem: AttachmentItem[] = [];
    billingSelected: BillingDto = new BillingDto();
    state = {
        isLoadDone: false,
        isActive: true,
        ref_id_selected: -1,
        us_id_owner: undefined,
        isLoadFile: false,
        visibleModalBillProduct: false,
    };
    listFileAttachment: AttachmentItem[] = [];
    async componentDidMount() {
        await this.setState({ isLoadDone: false });
        await this.initData(this.props.refundSelected);
        await stores.billingStore.getAll(this.props.refundSelected.bi_code, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
        const { billListResult } = stores.billingStore
        if (billListResult.length > 0) {
            this.billingSelected = billListResult[0];
        }

        await this.setState({ isLoadDone: true });
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
        }
        await this.setState({ isLoadDone: true, isLoadFile: !this.state.isLoadFile });
    };
    handlePrev = () => {
        this.carouselRef.current.prev();
    };

    handleNext = () => {
        this.carouselRef.current.next();
    };
    render() {
        const { refundSelected } = this.props;
        const self = this;
        return (
            <Card style={{ width: "100%" }}>
                <Row>
                    <Col span={14} style={{ textAlign: "start" }}>
                        <h3>
                            {'Chi tiết hoàn tiền đơn hàng '}
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
                            vào ngày {moment(refundSelected.ref_refund_at).format("DD/MM/YYYY - HH:mm:ss")}
                        </h3>
                    </Col>
                </Row>
                <Form style={{ width: "100%", marginTop: "10px" }}>

                    <Row gutter={10}>
                        <Col span={6}>
                            <Carousel autoplaySpeed={3000} autoplay ref={this.carouselRef} dots={false} >
                                {
                                    this.props.refundSelected?.fi_id_list!?.length > 0 &&
                                    this.props.refundSelected?.fi_id_list!.map((item, index) =>
                                        <div title={item.key} key={'image_' + index} style={{ display: "flex", justifyContent: 'center' }}>
                                            <FileAttachmentsImages
                                                maxLength={5}
                                                isUpLoad={false}
                                                files={[item]}
                                                isLoadFile={this.state.isLoadDone}
                                                allowRemove={false}
                                                isMultiple={false}
                                                isDownload={true}
                                                showRemoveIcon={false}
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
                        <Col span={9}>
                            <Form.Item label="Số tiền hoàn" {...AppConsts.formItemLayout} name={'ref_money'} style={{ borderBottom: "1px solid #cfd9d6" }}>
                                <strong>{AppConsts.formatNumber(this.props.refundSelected.ref_money)}</strong>
                            </Form.Item>
                            <Form.Item {...AppConsts.formItemLayout} style={{ borderBottom: "1px solid #cfd9d6" }} label="Số tiền đã nạp: " {...AppConsts.formItemLayoutTitleSmall} name={'ref_money'}>
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
                            <Form.Item {...AppConsts.formItemLayout} style={{ borderBottom: "1px solid #cfd9d6" }} label="Số tiền thanh toán" {...AppConsts.formItemLayout} name={'ref_money'}>
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
                            <Form.Item style={{ borderBottom: "1px solid #cfd9d6" }} label={"Lý do hoàn tiền"} {...AppConsts.formItemLayoutTitleSmall} name={'ref_reason_type'}>
                                <strong>
                                    {valueOfeRefundReasonType(this.props.refundSelected.ref_reason_type)}
                                </strong>
                            </Form.Item>
                        </Col>
                        <Col span={9}>
                            <Form.Item {...AppConsts.formItemLayout} style={{ borderBottom: "1px solid #cfd9d6" }} label={"Chủ tài khoản"} {...AppConsts.formItemLayoutTitleSmall} name={'ref_nameAccountBank'}>
                                <strong>{refundSelected.ref_nameAccountBank}</strong>
                            </Form.Item>

                            <Form.Item style={{ borderBottom: "1px solid #cfd9d6" }} label={"Số tài khoản"}  {...AppConsts.formItemLayoutTitleSmall} name={'ref_codebank'}>
                                <strong>{refundSelected.ref_codebank}</strong>
                            </Form.Item>
                            <Form.Item {...AppConsts.formItemLayout} style={{ borderBottom: "1px solid #cfd9d6" }} label={"Ngân hàng"} {...AppConsts.formItemLayoutTitleSmall} name={'ref_namebank'}>
                                <strong>{refundSelected.ref_namebank}</strong>
                            </Form.Item>

                            <Form.Item {...AppConsts.formItemLayout} label={"Lý do chi tiết"} {...AppConsts.formItemLayoutTitleSmall} name={'ref_reason'}>
                                <strong>
                                    {this.props.refundSelected.ref_reason ?? ""}
                                </strong>
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
