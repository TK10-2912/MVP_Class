import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';
// import FileAttachmentsImages from "@src/components/FileAttachments";
import FileAttachmentsImages from '@src/components/FileAttachmentsImages';
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { L } from "@src/lib/abpUtility";
import AppConsts, { FileUploadType, cssColResponsiveSpan } from "@src/lib/appconst";
import { eReconsile, valueOfeReconsile } from "@src/lib/enumconst";
import { AttachmentItem, CreateWithdrawBankInput, CreateWithdrawCashInput, WithdrawDto } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import { Button, Card, Col, Form, Row, message } from "antd";
import moment from "moment";
import React from "react";
import confirm from 'antd/lib/modal/confirm';


export interface IProps {
    onCancel?: () => void;
    onSuccess?: () => void;
    withdrawSelected: WithdrawDto,
    record?: any;
}
const today = new Date();

export default class CreateOrUpdateWithDrawAdmin extends AppComponentBase<IProps> {
    private formRef: any = React.createRef();

    state = {
        isLoadDone: false,
        isLoadFile: false,
        idSelected: -1,
        us_id_withdraw: undefined,
        wi_ma_id: undefined,
        wi_payment_type: undefined,
        wi_status: undefined,
        wi_note: undefined,
        viewDetail: false,
        totalMoney: 0,
        isDownload: undefined,
        showRemoveIcon: undefined,
    }
    wi_start_at = new Date(today.getFullYear(), today.getMonth() - 1, 22, 7, 0, 0);
    wi_end_at = new Date(today.getFullYear(), today.getMonth(), 22, 6, 59, 59);
    withdrawSelected: WithdrawDto;
    listAttachmentItem_file: AttachmentItem[] = [];

    async componentDidMount() {
        await this.initData(this.props.withdrawSelected);
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.withdrawSelected != undefined && nextProps.withdrawSelected.wi_id !== prevState.idSelected) {
            return ({ idSelected: nextProps.withdrawSelected.wi_id });
        }
        return null;
    }
    async componentDidUpdate(prevProps, prevState) {
        if (this.state.idSelected !== prevState.idSelected) {
            this.initData(this.props.withdrawSelected);
        }
    }
    onCancel() {
        const { onCancel } = this.props;
        if (onCancel !== undefined) {
            onCancel();
        }
    }


    initData = async (input: WithdrawDto) => {
        this.listAttachmentItem_file = (input.fi_id_list === undefined) ? [] : input.fi_id_list.filter(item => item.isdelete === false);
        if (input.wi_note == undefined) {
            input.wi_note = "";
        }
    }
    onCreateUpdate = async () => {
        const { withdrawSelected, record } = this.props;
        const form = this.formRef.current;
        this.setState({ isLoadDone: false });
      
        if (this.listAttachmentItem_file.length == 0) {
          message.error("Thiếu file đính kèm");
          return;
        }
      
        form!.validateFields().then(async (values: any) => {
		const self = this;
          confirm({
            title: "Bạn có chắc chắn muốn tạo yêu cầu rút tiền?",
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            async onOk() {
              if (!!record.rec_id) {
                self.setState({ isDownload: false, showRemoveIcon: true });
                let unitData = new CreateWithdrawBankInput({ ...values });
                unitData.fi_id_list = self.listAttachmentItem_file;
                unitData.ma_id = record.ma_id;
                unitData.wi_total_money_reality = record.rec_total_money_reality;
                unitData.rec_id = record.rec_id;
                unitData.wi_start_date = self.wi_start_at;
                unitData.wi_end_date = self.wi_end_at;
                unitData.wi_payment_type = record.rec_type;
                await stores.withDrawStore.createWithdrawBank(unitData);
                await self.onSuccess();
                message.success("Tạo yêu cầu rút tiền thành công!");
              } else {
                self.setState({ isDownload: false, showRemoveIcon: true });
                let unitData = new CreateWithdrawCashInput({ ...values });
                unitData.fi_id_list = self.listAttachmentItem_file;
                unitData.ma_id = record.ma_id;
                unitData.wi_total_money_reality = record.rec_total_money_reality;
                unitData.rec_id = record.listReconcile.map(item => item.rec_id);
                unitData.wi_start_date = self.wi_start_at;
                unitData.wi_end_date = self.wi_end_at;
                unitData.wi_payment_type = eReconsile.CASH.num;
                await stores.withDrawStore.createWithdrawCash(unitData);
                await self.onSuccess();
                message.success("Tạo yêu cầu rút tiền thành công!");
              }
      
              await stores.sessionStore.getCurrentLoginInformations();
              await self.setState({ isLoadDone: true, isLoadFile: !self.state.isLoadFile });
            },
            onCancel() {
              self.setState({ isLoadDone: true });
            },
          });
        });
      };

    onSuccess = () => {
        if (!!this.props.onSuccess) {
            this.props.onSuccess();
        }
    }

    componentWillUnmount() {
        this.setState = (_state, _callback) => {
            return;
        };
    }

    render() {
        const { withdrawSelected, record } = this.props;
        let self = this;
        return (
            <Card>
                <Row>
                    <Col span={16}>
                        <h2>{this.state.idSelected === undefined ? `Rút tiền tháng ${moment(withdrawSelected.wi_end_date).format("MM/YYYY")}` : ''}</h2>
                    </Col>
                    <Col span={8} style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "right" }}>
                        <Button type="primary" onClick={() => this.onCreateUpdate()}>Lưu</Button>
                        <Button danger onClick={() => this.onCancel()}>Hủy</Button>
                    </Col>
                </Row>


                <Row>
                    <Form ref={this.formRef} style={{ width: "100%" }}>
                        <Row>
                            <Col {...cssColResponsiveSpan(24, 24, 24, 24, 24, 24)}>
                                {!!record && <>
                                    <Form.Item label="Nhóm máy" {...AppConsts.formItemLayout} >
                                        <b>{stores.sessionStore.getNameGroupUseMaId(record.ma_id)}</b>
                                    </Form.Item>
                                    <Form.Item label="Máy" {...AppConsts.formItemLayout} >
                                        <b>{stores.sessionStore.getNameMachines(record.ma_id)}</b>
                                    </Form.Item>
                                </>
                                }
                                <Form.Item label="Ngày bắt đầu" {...AppConsts.formItemLayout}>
                                    <b>{moment().subtract(1, 'month').format('22/MM/YYYY 00:00:00')}</b>
                                </Form.Item>
                                <Form.Item label="Ngày kết thúc" {...AppConsts.formItemLayout}>
                                    <b>{moment().format('21/MM/YYYY 23:59:59')}</b>
                                </Form.Item>
                                <Form.Item label="Phương thức" {...AppConsts.formItemLayout} name={"wi_payment_type"}>
                                    <b>{record != undefined && !!record.rec_type ? valueOfeReconsile(record.rec_type) : "Tiền mặt"}</b>
                                </Form.Item>
                                <Form.Item label="Tổng tiền thực nhận" {...AppConsts.formItemLayout} name={"wi_total_money"}>
                                    <b>{!!record ? AppConsts.formatNumber(record.rec_total_money_reality) : 0} VND</b>
                                </Form.Item>
                                <Form.Item label="Ghi chú" {...AppConsts.formItemLayout} name={'wi_note'} valuePropName='data' initialValue={this.props.withdrawSelected.wi_note}
                                    getValueFromEvent={(event, editor) => {
                                        const data = editor.getData();
                                        return data;
                                    }}>
                                    <CKEditor editor={ClassicEditor} />
                                </Form.Item>
                                <Form.Item label="Tệp đính kèm"  {...AppConsts.formItemLayout}>
                                    <FileAttachmentsImages
                                    isUpLoad={true}
                                        maxLength={5}
                                        files={self.listAttachmentItem_file}
                                        isLoadFile={this.state.isLoadFile}
                                        allowRemove={true}
                                        isMultiple={true}
                                        componentUpload={FileUploadType.Contracts}
                                        onSubmitUpdate={async (itemFile: AttachmentItem[]) => {
                                            self.listAttachmentItem_file = itemFile;
                                        }}
                                        isDownload={this.state.isDownload}
                                        showRemoveIcon={this.state.showRemoveIcon}
                                    />

                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Row>
            </Card>
        )
    }
}