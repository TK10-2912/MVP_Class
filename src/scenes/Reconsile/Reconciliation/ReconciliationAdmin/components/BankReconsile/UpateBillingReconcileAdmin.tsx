import AppConsts, { FileUploadType } from '@src/lib/appconst';
import { AttachmentItem, BillingDto, ChangeReasonAndStatusReconcileInput, ReconcileDto, ReconcileLogsDto } from '@src/services/services_autogen';
import * as React from 'react';
import { Button, Card, Col, Form, Row, message } from 'antd';
import { eBillReconcileStatus } from '@src/lib/enumconst';
import SelectEnum from '@src/components/Manager/SelectEnum';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import FileAttachments from '@src/components/FileAttachments';
import { stores } from '@src/stores/storeInitializer';
import rules from '@src/scenes/Validation';
import FileAttachmentsImages from '@src/components/FileAttachmentsImages';
export interface IProps {
    bill_select: BillingDto;
    reconcileSelect: number;
    onSuccess?: () => void;
    logReconcile?: ReconcileLogsDto;
    onCancel?: () => void;
}

export default class UpdateBillingReconcileAdmin extends React.Component<IProps> {
    state = {
        isLoadDone: true,
        bi_reconcile_status: undefined,
        bi_id_selected: undefined,
        isLoadFile: false,
        rec_id:undefined,
    }
    private formRef: any = React.createRef();
    listAttachmentItem: AttachmentItem[] = [];
    attachmentItem: AttachmentItem = new AttachmentItem();
    reconcileLogsListDto: ReconcileLogsDto[] = [];
    async componentDidMount() {
        this.setState({ isLoadDone: false });
        this.setState({ bi_id_selected: this.props.bill_select.bi_id });

        await this.getAllLog();
        this.initData(this.props.bill_select);
        this.setState({ isLoadDone: true });
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.bill_select.bi_id !== prevState.bi_id_selected) {
            return ({ bi_id_selected: nextProps.bill_select.bi_id });
        }
        return null;
    }
    async getAllLog() {
        await stores.reconcileLogsStore.getAll(this.props.bill_select.bi_code, undefined, undefined);
        const { reconcileLogsListDto } = stores.reconcileLogsStore;
        this.reconcileLogsListDto = reconcileLogsListDto;
    }
    async componentDidUpdate(prevProps, prevState) {
        if (this.state.bi_id_selected !== prevState.bi_id_selected) {
            await this.getAllLog();
            this.initData(this.props.bill_select);
        }
    }

    initData = async (input: BillingDto) => {
        this.setState({ isLoadDone: false });
        if (input !== undefined && input.bi_id !== undefined) {
            this.setState({ bi_reconcile_status: input.bi_reconcile_status });
            if (this.reconcileLogsListDto.length > 0 && this.reconcileLogsListDto[0].fi_id_list != undefined) {
                this.listAttachmentItem = this.reconcileLogsListDto[0].fi_id_list!;
                this.setState({ isLoadFile: !this.state.isLoadFile });
            }
            if (input.bi_reconcile_reason == undefined || input.bi_reconcile_reason == null) {
                input.bi_reconcile_reason = "";
            }
            this.formRef.current!.setFieldsValue({ ...input,reconcile_reason:input.bi_reconcile_reason,fi_id_list:this.listAttachmentItem  });
        }
        else {
            this.formRef.current!.setFieldsValue();
        }
        this.setState({ isLoadDone: true });
    }
    onUpdate = async () => {
        const { bill_select, reconcileSelect } = this.props;
        const form = this.formRef.current;
        await this.setState({ isLoadDone: false });
        form!.validateFields().then(async (values: any) => {
            if (bill_select.bi_id != undefined) {
                this.setState({ isDownload: false, showRemoveIcon: true })
                let unitData = new ChangeReasonAndStatusReconcileInput({ ...values });
                unitData.rec_id = this.reconcileLogsListDto[0].rec_id;
                unitData.code = bill_select.bi_code;
                unitData.fi_id_list = this.listAttachmentItem;
                unitData.reconcile_status = this.state.bi_reconcile_status!;
                await stores.reconcileStore.changeReasonAndStatusReconcile(unitData)
                await this.onSuccess();
                message.success("Thêm mới bản cập nhật thành công!")
            }
        })
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
            <Card>
                <Row justify='space-between'>
                    <Col >
                        <h2  style={{margin:0}}>{` Cập nhật trạng thái đối soát đơn hàng "${this.props.bill_select.bi_code}"`}</h2>
                    </Col>
                    <Col>
                        <Button type='primary' onClick={() => this.onUpdate()} >Lưu</Button> &nbsp;
                        <Button danger onClick={() => this.onCancel()}>Hủy</Button>
                    </Col>
                </Row>
                <Row style={{ marginTop: 10 }}>
                    <Form ref={this.formRef} style={{ width: "100%" }}>

                        <Form.Item label="Trạng thái đối soát" {...AppConsts.formItemLayoutTitleSmall} name={'bi_reconcile_status'}  >
                            <Row>
                                <SelectEnum eNum={eBillReconcileStatus} onChangeEnum={value => this.setState({ bi_reconcile_status: value })} enum_value={this.state.bi_reconcile_status} />
                            </Row>
                        </Form.Item>
                        <Form.Item label={('Lý do')} {...AppConsts.formItemLayoutTitleSmall} rules={[rules.description]} name={'reconcile_reason'} valuePropName='data'
                            getValueFromEvent={(event, editor) => {
                                const data = editor.getData();
                                return data;
                            }}>
                            <CKEditor editor={ClassicEditor} />
                        </Form.Item>
                        {/* <Form.Item label="File" {...AppConsts.formItemLayoutTitleSmall} name={'fi_id_list'} rules={[rules.required]} > */}
                        <Form.Item label="File" {...AppConsts.formItemLayoutTitleSmall} rules={[rules.required]} name={'fi_id_list'}>
                            <FileAttachmentsImages
                                isUpLoad={true}
                                maxLength={5}
                                files={self.listAttachmentItem}
                                isLoadFile={this.state.isLoadFile}
                                allowRemove={true}
                                isMultiple={true}
                                onSubmitUpdate={async (itemFile: AttachmentItem[]) => {
                                    self.listAttachmentItem = itemFile.slice(0, 5);
                                    await this.formRef.current!.setFieldsValue({ fi_id_list: self.listAttachmentItem });
                                    this.setState({ isLoadFile: !this.state.isLoadFile });
                                }}/>
                        </Form.Item>
                    </Form>
                </Row>
            </Card>
        )
    }

}