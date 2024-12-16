import AppConsts from '@src/lib/appconst';
import { AttachmentItem, ChangeReasonAndStatusReconcileInput, ReconcileProductSupplierDebtDto, ReconcileDto, ReconcileLogsDto, ReconcileSupplierDebtDetailDto } from '@src/services/services_autogen';
import * as React from 'react';
import { Button, Card, Col, Form, Row, message } from 'antd';
import { eBillReconcileStatus, eReconcileDebtStatus } from '@src/lib/enumconst';
import SelectEnum from '@src/components/Manager/SelectEnum';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import FileAttachments from '@src/components/FileAttachments';
import { stores } from '@src/stores/storeInitializer';
import rules from '@src/scenes/Validation';
import FileAttachmentsImages from '@src/components/FileAttachmentsImages';
import { Cell } from 'recharts';
export interface IProps {
    onlyExcelReconcile: ReconcileSupplierDebtDetailDto;
    reconcileProductSelect: ReconcileProductSupplierDebtDto;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default class UpdateReconcilDebtOnlyExcel extends React.Component<IProps> {
    state = {
        isLoadDone: true,
        pr_reconcile_status: undefined,
        pr_code: undefined,
        isLoadFile: false,
    }
    private formRef: any = React.createRef();
    listAttachmentItem: AttachmentItem[] = [];
    attachmentItem: AttachmentItem = new AttachmentItem();
    reconcileLogsListDto: ReconcileLogsDto[] = [];
    async componentDidMount() {
        this.setState({ isLoadDone: false });
        this.setState({ pr_code: this.props.reconcileProductSelect.pr_code });
        await this.getAllLog();
        this.initData(this.props.reconcileProductSelect);
        this.setState({ isLoadDone: true });
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.reconcileProductSelect.pr_code !== prevState.pr_code) {
            return ({ pr_code: nextProps.reconcileProductSelect.pr_code });
        }
        return null;
    }

    async componentDidUpdate(prevProps, prevState) {
        if (this.state.pr_code !== prevState.pr_code) {
            this.getAllLog();
            this.initData(this.props.reconcileProductSelect);
        }
    }
    async getAllLog() {
        await stores.reconcileLogsStore.getAll(this.props.reconcileProductSelect.pr_code, undefined, undefined);
        const { reconcileLogsListDto } = stores.reconcileLogsStore;
        this.reconcileLogsListDto = reconcileLogsListDto;
    }
    initData = async (input: ReconcileProductSupplierDebtDto) => {
        this.setState({ isLoadDone: false });
        if (input !== undefined && input.pr_code !== undefined) {
            this.setState({ pr_reconcile_status: input.pr_im_reconcile_status });
            if (this.reconcileLogsListDto.length > 0 && this.reconcileLogsListDto[0].fi_id_list != undefined) {
                this.listAttachmentItem = this.reconcileLogsListDto[0].fi_id_list!;
                this.setState({ isLoadFile: !this.state.isLoadFile });
            }
            if (input.pr_im_reconcile_reason == undefined || input.pr_im_reconcile_reason == null) {
                input.pr_im_reconcile_reason = "";
            }
            this.formRef.current!.setFieldsValue({ ...input,reconcile_reason:input.pr_im_reconcile_reason,fi_id_list:this.listAttachmentItem!  });
        }
        else {
            this.formRef.current!.setFieldsValue();
        }
        this.setState({ isLoadDone: true });
    }
    onUpdate = async () => {
        const { onlyExcelReconcile, reconcileProductSelect } = this.props;
        const form = this.formRef.current;
        await this.setState({ isLoadDone: false })
        form!.validateFields().then(async (values: any) => {
            if (onlyExcelReconcile.rec_id != undefined) {
                this.setState({ isDownload: false, showRemoveIcon: true })
                let unitData = new ChangeReasonAndStatusReconcileInput({ ...values });
                unitData.rec_id = onlyExcelReconcile.rec_id;
                unitData.code = reconcileProductSelect.pr_code;
                unitData.fi_id_list = this.listAttachmentItem;
                unitData.reconcile_status = this.state.pr_reconcile_status!;
                await stores.reconcileStore.changeReasonAndStatusReconcileOfSupplierDebtExcel(unitData)
                await this.onSuccess();
                message.success("Cập nhật thành công!")
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
                        <h2>Cập nhật trạng thái đối soát đơn hàng</h2>
                    </Col>
                    <Col>
                        <Button type='primary' onClick={() => this.onUpdate()} >Lưu</Button> &nbsp;
                        <Button danger onClick={() => this.onCancel()}>Hủy</Button>
                    </Col>
                </Row>
                <Row style={{ marginTop: 10, textAlign: "center" }}>
                    <Form ref={this.formRef} style={{ width: "100%" }}>
                        <Form.Item label="Trạng thái đơn hàng" {...AppConsts.formItemLayout} name={'reconcile_status'}  >
                            <Row>
                                <SelectEnum eNum={eBillReconcileStatus} onChangeEnum={value => this.setState({ pr_reconcile_status: value })} enum_value={this.state.pr_reconcile_status} />
                            </Row>
                        </Form.Item>
                        <Form.Item label={('Lý do')} {...AppConsts.formItemLayout} name={'reconcile_reason'}  rules={[rules.noAllSpaces, rules.gioi_han_ten]} valuePropName='data'
                            getValueFromEvent={(event, editor) => {
                                const data = editor.getData();
                                return data;
                            }}>
                            <CKEditor editor={ClassicEditor} />
                        </Form.Item>
                        <Form.Item label="File" {...AppConsts.formItemLayout} rules={[rules.required]} name={'fi_id_list'}>
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
                            
                        </Form.Item>
                    </Form>
                </Row>
            </Card>
        )
    }

}