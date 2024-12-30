import { ActiveOrDeactiveProductInput, AttachmentItem, CreateProductInput, FileParameter, ImageProductDto, ProductDto } from '@src/services/services_autogen';
import * as React from 'react';
import { stores } from "@src/stores/storeInitializer";
import { Button, Card, Col, Form, Input, InputNumber, Row, Space, message } from 'antd';
import AppConsts, { FileUploadType } from '@src/lib/appconst';
import rules from '@src/scenes/Validation';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import SelectedUnit from '@src/components/Manager/SelectedUnit';
import TextArea from 'antd/lib/input/TextArea';
import FileAttachmentsProduct from '@src/components/FileAttachmentsProduct';
import SelectTenant from '@src/components/Manager/SelectTenant';

export interface IProps {
    onCreateUpdateSuccess?: () => void;
    onCancel?: () => void;
    productSelected?: ProductDto;
    layoutDetail?: boolean;
    productListResult?: ProductDto[];
}

export default class CreateModal extends AppComponentBase<IProps> {
    private formRef: any = React.createRef();
    state = {
        isLoadDone: false,
        isLoadFile: false,
        pr_id: -1,
        pr_unit: undefined,
        disableInput: true,
        fileUpload: undefined,
    }
    fileAttachmentItem: AttachmentItem[] = [];
    fileParameter: FileParameter | undefined;

    async componentDidMount() {
        this.setState({ isLoadDone: true });
    }
    onCreateUpdateSuccess = () => {
        if (!!this.props.onCreateUpdateSuccess) {
            this.props.onCreateUpdateSuccess();
        }
        this.setState({ isLoadDone: true });
    };
    initData = async () => {
        this.setState({ isLoadDone: false });
        this.formRef.current!.resetFields();
        this.setState({ isLoadDone: true });
    };

    onCreate = async () => {
        const { productSelected } = this.props;
        this.setState({ isLoadDone: false });
        const form = this.formRef.current;
        form!.validateFields().then(async (values: any) => {
            let unitData = new CreateProductInput({ ...values });
            if (this.fileAttachmentItem.length > 0) {
                unitData.fi_id = this.fileAttachmentItem[0];
            }
            console.log("Dữ liệu sản phẩm:", unitData);
            await stores.productStore.createProduct(unitData);
            await this.onCreateUpdateSuccess();
            message.success("Thêm mới thành công!");
            this.formRef.current?.resetFields();
        }).catch(error => {
            console.error("Lỗi xác thực:", error);
        });
    };

    render() {
        const { productSelected, productListResult } = this.props;
        const productList = productListResult!.filter(item => item.pr_id !== productSelected!.pr_id!);
        return (
            <Card>
                <Row style={{ marginBottom: 8 }}>
                    <Col span={12}>
                        <h3>Thêm mới sản phẩm</h3>
                    </Col>
                    <Col span={12} style={{ textAlign: "right" }}>
                        <Space>
                            <Button danger onClick={this.props.onCancel}>Huỷ</Button>
                            <Button type="primary" onClick={this.onCreate}>Lưu</Button>
                        </Space>
                    </Col>
                </Row>
                <Form ref={this.formRef} style={{ width: '100%' }}>

                    <Form.Item label="Tên sản phẩm" {...AppConsts.formItemLayout} name={"pr_name"} rules={[rules.required, rules.noAllSpaces, rules.maxName,
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value) {
                                return Promise.resolve();
                            }
                            const isMachineSoft = productList?.some(
                                (item) =>
                                    item?.pr_name?.trim().toLowerCase() === value.trim().toLowerCase()
                            );
                            if (!isMachineSoft) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Sản phẩm đã tồn tại!'));
                        },
                    }),
                    ]}>

                        <Input placeholder='Nhập tên sản phẩm...' allowClear />
                    </Form.Item>
                    <Form.Item label={'Giá bán(VNĐ)'} {...AppConsts.formItemLayout} name={'pr_price'} rules={[rules.messageForNumber]}>
                        <InputNumber
                            placeholder={'Nhập số tiền....'}
                            min={0}
                            style={{ width: "100%" }}
                            max={999999999999}
                            step={1000}
                        />
                    </Form.Item>
                    <Form.Item label="Đơn vị tính" {...AppConsts.formItemLayout} name={"pr_unit"} rules={[rules.required]}>
                        <SelectedUnit onChangeUnit={async (value) => await this.formRef.current!.setFieldsValue({ pr_unit: value })} />
                    </Form.Item>
                    <Form.Item label="Ghi chú" {...AppConsts.formItemLayout} name={'pr_desc'}>
                        <TextArea rows={4} maxLength={255} />
                    </Form.Item>
                    <Form.Item label="Ảnh sản phẩm" {...AppConsts.formItemLayout} name={"fi_id"} rules={[rules.required]}>
                        <FileAttachmentsProduct
                            maxLength={1}
                            files={this.fileAttachmentItem}
                            isLoadFile={this.state.isLoadFile}
                            allowRemove={true}
                            isUpLoad={this.fileAttachmentItem.some(file => file.id !== undefined) ? false : true}
                            isMultiple={false}
                            componentUpload={FileUploadType.Avatar}
                            onSubmitUpdate={async (itemFile: AttachmentItem[], file) => {
                                this.fileAttachmentItem = itemFile;
                                this.fileParameter = file;
                                await this.formRef.current!.setFieldsValue({ fi_id: file });
                            }}
                        />
                    </Form.Item>
                </Form>
            </Card>
        );
    }
}
