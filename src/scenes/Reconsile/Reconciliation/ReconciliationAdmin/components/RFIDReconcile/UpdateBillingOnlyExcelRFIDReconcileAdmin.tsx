import AppConsts from '@src/lib/appconst';
import { AttachmentItem, ChangeReasonAndStatusReconcileInput, ExcelReconcileDto, ReconcileDto, ReconcileLogsDto } from '@src/services/services_autogen';
import * as React from 'react';
import { Button, Card, Col, Form, Row, message } from 'antd';
import { eBillReconcileStatus } from '@src/lib/enumconst';
import SelectEnum from '@src/components/Manager/SelectEnum';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { stores } from '@src/stores/storeInitializer';
import rules from '@src/scenes/Validation';
import FileAttachmentsImages from '@src/components/FileAttachmentsImages';
export interface IProps {
    onlyExcelReconcile: ExcelReconcileDto;
    reconcileSelect: ReconcileDto;
    onSuccess: () => void;
    logReconcile: ReconcileLogsDto;
    onCancel: () => void;
}

export default class UpdateBillingOnlyExcelRFIDReconcileAdmin extends React.Component<IProps> {
    state = {
        isLoadDone: true,
        ex_reconcile_status: undefined,
        bi_id_selected: undefined,
        isLoadFile: false,
    }
    private formRef: any = React.createRef();
    listAttachmentItem: AttachmentItem[] = [];
    attachmentItem: AttachmentItem = new AttachmentItem();
    reconcileLogsListDto: ReconcileLogsDto[] = [];
    async componentDidMount() {
        this.setState({ isLoadDone: false });
        this.setState({ bi_id_selected: this.props.onlyExcelReconcile.ex_code })
        await this.getAllLog();
        this.initData(this.props.onlyExcelReconcile);
        this.setState({ isLoadDone: true });
    }
    async getAllLog() {
        await stores.reconcileLogsStore.getAll(this.props.onlyExcelReconcile.ex_code, undefined, undefined);
        const { reconcileLogsListDto } = stores.reconcileLogsStore;
        this.reconcileLogsListDto = reconcileLogsListDto;
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.onlyExcelReconcile.ex_code !== prevState.bi_id_selected) {
            return ({ bi_id_selected: nextProps.onlyExcelReconcile.ex_code });
        }
        return null;
    }

    async componentDidUpdate(prevProps, prevState) {
        if (this.state.bi_id_selected !== prevState.bi_id_selected) {
            await this.getAllLog();
            this.initData(this.props.onlyExcelReconcile);
        }
    }

    initData = async (input: ExcelReconcileDto) => {
        this.setState({ isLoadDone: false });
        if (input !== undefined && input.ex_code !== undefined) {
            this.setState({ ex_reconcile_status: input.ex_reconcile_status });
            if (this.reconcileLogsListDto.length > 0 && this.reconcileLogsListDto[0].fi_id_list != undefined) {
                this.listAttachmentItem = this.reconcileLogsListDto[0].fi_id_list!;
                this.setState({ isLoadFile: !this.state.isLoadFile });
            }
            if (input.ex_reconcile_reason == undefined || input.ex_reconcile_reason == null) {
                input.ex_reconcile_reason = "";
            }
            this.formRef.current!.setFieldsValue({ ...input, fi_id_list: this.listAttachmentItem, reconcile_reason: input.ex_reconcile_reason });
        }
        else {
            this.formRef.current!.setFieldsValue();
        }
        this.setState({ isLoadDone: true });
    }
    onUpdate = async () => {
        const { onlyExcelReconcile, reconcileSelect } = this.props;
        const form = this.formRef.current;
        await this.setState({ isLoadDone: false })
        form!.validateFields().then(async (values: any) => {
            if (onlyExcelReconcile.ex_code != undefined) {
                this.setState({ isDownload: false, showRemoveIcon: true })
                let unitData = new ChangeReasonAndStatusReconcileInput({ ...values });
                unitData.rec_id = reconcileSelect.rec_id;
                unitData.code = onlyExcelReconcile.ex_code;
                unitData.fi_id_list = this.listAttachmentItem;
                unitData.reconcile_status = this.state.ex_reconcile_status!;
                await stores.reconcileStore.ChangeReasonAndStatusReconcileOfExcel(unitData)
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
                        <h2 style={{ margin: 0 }}>{` Cập nhật trạng thái đối soát đơn hàng "${this.props.onlyExcelReconcile.ex_code}"`}</h2>
                    </Col>
                </Row>
                <Row style={{ marginTop: 10 }}>
                    <Form ref={this.formRef} style={{ width: "100%" }}>
                        <Form.Item label="Trạng thái đơn hàng" {...AppConsts.formItemLayoutTitleSmall} name={'ex_reconcile_status'}  >
                            <Row>
                                <SelectEnum eNum={eBillReconcileStatus} onChangeEnum={value => this.setState({ ex_reconcile_status: value })} enum_value={this.state.ex_reconcile_status} />
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
                                }} />
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