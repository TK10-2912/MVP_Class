import AppConsts, { FileUploadType } from '@src/lib/appconst';
import { AttachmentItem, RfidLogDto, ChangeReasonAndStatusReconcileInput,  ReconcileLogsDto } from '@src/services/services_autogen';
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
    rfid_logs_select: RfidLogDto;
    reconcileSelect: number;
    onSuccess?: () => void;
    logReconcile?: ReconcileLogsDto;
    onCancel?: () => void;
}

export default class UpdateBillingRFIDReconcileAdmin extends React.Component<IProps> {
    state = {
        isLoadDone: true,
        rfid_reconcile_status: undefined,
        rfid_code_selected: undefined,
        isLoadFile: false,
    }
    private formRef: any = React.createRef();
    listAttachmentItem: AttachmentItem[] = [];
    attachmentItem: AttachmentItem = new AttachmentItem();
    reconcileLogsListDto: ReconcileLogsDto[] = [];
    async componentDidMount() {
        this.setState({ isLoadDone: false });
        this.setState({ rfid_code_selected: this.props.rfid_logs_select.rf_code })
        await this.getAllLog();
        this.initData(this.props.rfid_logs_select);
        this.setState({ isLoadDone: true });
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.rfid_logs_select.bi_id !== prevState.rfid_code_selected) {
            return ({ rfid_code_selected: nextProps.rfid_logs_select.bi_id });
        }
        return null;
    }
    async getAllLog() {
        await stores.reconcileLogsStore.getAll(this.props.rfid_logs_select.rf_code, undefined, undefined);
        const { reconcileLogsListDto } = stores.reconcileLogsStore;
        this.reconcileLogsListDto = reconcileLogsListDto;
    }
    async componentDidUpdate(prevProps, prevState) {
        if (this.state.rfid_code_selected !== prevState.rfid_code_selected) {
            await this.getAllLog();
            this.initData(this.props.rfid_logs_select);
        }
    }

    initData = async (input: RfidLogDto) => {
        this.setState({ isLoadDone: false });
        if (input !== undefined && input.rf_code !== undefined) {
            this.setState({ rfid_reconcile_status: input.rf_reconcile_status });
            if (this.reconcileLogsListDto.length > 0 && this.reconcileLogsListDto[0].fi_id_list != undefined) {
                this.listAttachmentItem = this.reconcileLogsListDto[0].fi_id_list!;
                this.setState({ isLoadFile: !this.state.isLoadFile });
            }
            if (input.rf_reconcile_reason == undefined || input.rf_reconcile_reason == null) {
                input.rf_reconcile_reason = "";
            }
            this.formRef.current!.setFieldsValue({ ...input, fi_id_list: this.listAttachmentItem, reconcile_reason: input.rf_reconcile_reason });
        }
        else {
            this.formRef.current!.setFieldsValue();
        }
        this.setState({ isLoadDone: true });
    }
    onUpdate = async () => {
        const { rfid_logs_select, reconcileSelect } = this.props;
        const form = this.formRef.current;
        await this.setState({ isLoadDone: false });
        form!.validateFields().then(async (values: any) => {
            if (rfid_logs_select.rf_code != undefined) {
                this.setState({ isDownload: false, showRemoveIcon: true })
                console.log('12312312',values);
                
                let unitData = new ChangeReasonAndStatusReconcileInput({ ...values });
                unitData.rec_id = reconcileSelect;
                unitData.code = rfid_logs_select.rf_code;
                unitData.fi_id_list = this.listAttachmentItem;
                unitData.reconcile_status = this.state.rfid_reconcile_status!;
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
                    <h2  style={{margin:0}}>{` Cập nhật trạng thái đối soát đơn hàng "${this.props.rfid_logs_select.rf_code}"`}</h2>
                    </Col>
                   
                </Row>
                <Row style={{ marginTop: 10 }}>
                    <Form ref={this.formRef} style={{ width: "100%" }}>

                        <Form.Item label="Trạng thái đơn hàng" {...AppConsts.formItemLayoutTitleSmall} name={'rfid_reconcile_status'}  >
                            <Row>
                                <SelectEnum eNum={eBillReconcileStatus} onChangeEnum={value => this.setState({ rfid_reconcile_status: value })} enum_value={this.state.rfid_reconcile_status} />
                            </Row>
                        </Form.Item>
                            <Form.Item label={('Lý do')} {...AppConsts.formItemLayoutTitleSmall} rules={[rules.description]} name={'reconcile_reason'} valuePropName='data'
                                getValueFromEvent={(event, editor) => {
                                    const data = editor.getData();
                                    return data;
                                }}>
                                <CKEditor editor={ClassicEditor} />
                            </Form.Item>
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
                                    await this.formRef.current!.setFieldsValue({ fi_id_list: itemFile });
                                    this.setState({ isLoadFile: !this.state.isLoadFile });
                                }}/>
                        </Form.Item>
                    </Form>
                </Row>
                    <Row justify='end'>
                        <Button type='primary' onClick={() => this.onUpdate()} >Lưu</Button> &nbsp;
                        <Button danger onClick={() => this.onCancel()}>Hủy</Button>
                    </Row>
            </Card>
        )
    }

}