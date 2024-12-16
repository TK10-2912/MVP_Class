import AppConsts, { FileUploadType } from "@src/lib/appconst";
import { Button, Card, Checkbox, Col, Form, Input, Row, Space, Tree, message } from "antd";
import React from "react";
import { AttachmentItem, MachineSoftDto, CreateMachineSoftInput, UpdateMachineSoftInput, FileMediaDto, RenameFileMediaInput } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import AppComponentBase from "@src/components/Manager/AppComponentBase";
import FileAttachments from "@src/components/FileAttachments";
import rules from "@src/scenes/Validation";

export interface IProps {
    onCancel?: () => void;
    onSuccess?: () => void;
    fileMediaSelected: FileMediaDto,
}
export default class RenameFileMedia extends AppComponentBase<IProps> {
    private formRef: any = React.createRef();
    state = {
        isLoadDone: false,
    }
    async componentDidMount() {
        await this.initData(this.props.fileMediaSelected);
    }
    initData = async (input: FileMediaDto) => {
        await this.setState({ isLoadDone: false });
        if (input.fi_me_id !== undefined) {
            this.formRef.current.setFieldsValue({ fi_me_name: input.fi_me_name?.split('.')[0] });
        }
        else {
            this.formRef.current.resetFields();
        }
        await this.setState({ isLoadDone: true })
    }
    onUpdate = async () => {
        const form = this.formRef.current;
        form!.validateFields().then(async (values: any) => {
            if(values.fi_me_name.trim() != this.props.fileMediaSelected.fi_me_name?.split('.')[0])
            {
                let x: RenameFileMediaInput = new RenameFileMediaInput();
                x.fi_me_id = this.props.fileMediaSelected.fi_me_id!;
                x.fi_me_name =(values.fi_me_name.trim() + "." + this.props.fileMediaSelected.fi_me_name?.split('.')[1]);
                await stores.fileMediaStore.renameFile(x);
                this.onSuccess();
                message.success("Thay đổi tên thành công!");
            }
            else{
                message.warning("Tên mới không được trùng với tên file cũ")
            }
        })
    }
    onCancel() {
        if (this.props.onCancel !== undefined) {
            this.props.onCancel();
        }
    }
    onSuccess() {
        if (this.props.onSuccess !== undefined) {
            this.props.onSuccess();
        }
    }
    render() {
        let self = this;
        return (
            <>
                <Row>
                    <Col span={16}>
                        <h2>{"Thay đổi tên quảng cáo"}</h2>
                    </Col>
                    <Col span={8} style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "right" }}>
                        <Space>
                            <Button type="primary" onClick={async () => await this.onUpdate()}>Lưu</Button>
                            <Button danger onClick={() => this.onCancel()}>Hủy</Button>
                        </Space>
                    </Col>
                </Row>
                <Form ref={this.formRef} style={{ width: "100%" }}>
                    <Form.Item
                        label="Tên quảng cáo"
                        {...AppConsts.formItemLayout}
                        name={"fi_me_name"}
                        rules={[
                            rules.required,
                            rules.noAllSpaces,
                            rules.mediaName,
                        ]}
                    >

                        <Input maxLength={20} onPressEnter={this.onUpdate}/>
                    </Form.Item>
                </Form>
            </>)
    }
}