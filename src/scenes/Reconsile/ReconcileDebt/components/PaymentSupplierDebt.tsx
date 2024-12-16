import AppConsts from '@src/lib/appconst';
import { PaySupplierInput } from '@src/services/services_autogen';
import * as React from 'react';
import { Button, Col, Form, InputNumber, Row, Space, message } from 'antd';
import { ePaymentDebt } from '@src/lib/enumconst';
import SelectEnum from '@src/components/Manager/SelectEnum';
import { stores } from '@src/stores/storeInitializer';
import TextArea from 'antd/lib/input/TextArea';
import moment from 'moment';
import confirm from 'antd/lib/modal/confirm';
import rules from '@src/scenes/Validation';
import FileAttachmentsImages from '@src/components/FileAttachmentsImages';
export interface IProps {
    su_id: number;
    debt_money: number;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default class PaymentSupplierDebt extends React.Component<IProps> {
    state = {
        isLoadDone: true,
        isLoadFile: false,
        money: 0,
        payment_type: undefined,
        datePayment: moment(),
    }
    private formRef: any = React.createRef();
    onUpdate = async () => {
        const self = this;
        const { su_id } = this.props;
        const form = this.formRef.current;
        await this.setState({ isLoadDone: false });
        confirm({
            title: `Bạn muốn thanh toán với số tiền ${this.state.money} chứ?`,
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            async onOk() {
                self.setState({ isLoadDone: true });
                form!.validateFields().then(async (values: any) => {
                    if (su_id != undefined) {
                        let unitData = new PaySupplierInput({ ...values });
                        unitData.su_id = su_id;
                        unitData.money = self.state.money;
                        unitData.paymentMethod = self.state.payment_type!;
                        await stores.supplierStore.paySupplierDebt(unitData)
                        await self.onSuccess();
                        message.success("Thêm mới bản cập nhật thành công!")
                    }
                })
                self.setState({ isLoadDone: false });
            },
            onCancel() {

            },
        });

        await this.setState({ isLoadDone: true, isLoadFile: !this.state.isLoadFile });
    };

    onSuccess = () => {
        if (!!this.props.onSuccess) {
            this.props.onSuccess();
        }
    }
    onCancel = () => {
        if (!!this.props.onCancel) {
            this.props.onCancel();
        }
    }
    render() {
        const self = this;
        return (
            <>
                <Row style={{ marginTop: 10 }}>
                    <Form ref={this.formRef} style={{ width: "100%" }}>
                        <Row>
                            <Col span={8}>
                                <Form.Item label="Nợ hiện tại" {...AppConsts.formItemLayout} >
                                    <b>{AppConsts.formatNumber(this.props.debt_money)}</b>
                                </Form.Item>
                                <Form.Item label="Tiền cần trả" name={"money"} rules={[rules.required]}  {...AppConsts.formItemLayout} >
                                    <InputNumber value={this.state.money} autoFocus maxLength={this.props.debt_money.toString().length + 1} max={Number(this.props.debt_money)} onChange={async (e) => { this.setState({ money: Number(e) > this.props.debt_money ? this.props.debt_money : Number(e) }) }} min={1}
                                        formatter={value => AppConsts.numberWithCommas(value)}
                                        parser={value => value!.replace(/\D/g, '')}
                                        onKeyPress={(e) => {
                                            if (!/[\d,.]/.test(e.key) && e.key !== 'Backspace') {
                                                e.preventDefault();
                                            }
                                        }}
                                        step={1000} />
                                </Form.Item>
                                <Form.Item label="Phương thức thanh toán" {...AppConsts.formItem} name={'paymentMethod'} rules={[rules.required]} required={true} >
                                    <Row>
                                        <SelectEnum width='50%' eNum={ePaymentDebt} onChangeEnum={value => { this.setState({ payment_type: value }); this.formRef.current.setFieldsValue({ paymentMethod: value }) }} enum_value={this.state.payment_type} />
                                    </Row>
                                </Form.Item>
                                <Form.Item label="Nợ còn lại"  {...AppConsts.formItemLayout} >
                                    <b >{AppConsts.formatNumber(this.props.debt_money - this.state.money)}</b>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="Nhà cung cấp"  {...AppConsts.formItemLayout} >
                                    <b >{stores.sessionStore.getNameSupplier(this.props.su_id)}</b>
                                </Form.Item>
                                <Form.Item label="Nợ hiện tại" {...AppConsts.formItemLayout} >
                                    <b>{AppConsts.formatNumber(this.props.debt_money)}</b>
                                </Form.Item>
                                <Form.Item label="Nợ hiện tại" {...AppConsts.formItemLayout} >
                                    <FileAttachmentsImages
                                        isUpLoad={true}
                                        maxLength={5}
                                        // files={self.listAttachmentItem}
                                        // isLoadFile={this.state.isLoadFile}
                                        // allowRemove={true}
                                        // isMultiple={true}
                                        // onSubmitUpdate={async (itemFile: AttachmentItem[]) => {
                                        //     self.listAttachmentItem = itemFile.slice(0, 5);
                                        //     await this.formRef.current!.setFieldsValue({ fi_id_list: itemFile });
                                        //     this.setState({ isLoadFile: !this.state.isLoadFile });
                                        // }}
                                    />

                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="Thời gian"  {...AppConsts.formItemLayout} >
                                    <label>{moment(this.state.datePayment).format("DD/MM/YYYY")}</label>
                                </Form.Item>
                                <Form.Item label="Số tiền cần thanh toán"  {...AppConsts.formItemLayout} >
                                    <label>chua co api</label>
                                </Form.Item>
                                <Form.Item label="Người thanh toán"  {...AppConsts.formItemLayout} >
                                    <label>chua co api</label>
                                </Form.Item>
                                <Form.Item label={('Chú thích')} {...AppConsts.formItemLayout} name={'note'}>
                                    <TextArea rows={4}></TextArea>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row justify='end'>
                            <Space>
                                <Button type='primary' onClick={() => this.onUpdate()}>Lưu</Button>
                                <Button danger onClick={() => this.onCancel()}>Hủy</Button>
                            </Space>
                        </Row>
                    </Form>
                </Row>
            </>
        )
    }

}