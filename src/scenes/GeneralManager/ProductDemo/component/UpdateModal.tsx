import {
  ActiveOrDeactiveProductInput,
  AttachmentItem,
  UpdateProductInput,
  ProductDto,
} from '@src/services/services_autogen';
import * as React from 'react';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Form, Input, InputNumber, Row, Space, message } from 'antd';
import AppConsts from '@src/lib/appconst';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import SelectedUnit from '@src/components/Manager/SelectedUnit';
import TextArea from 'antd/lib/input/TextArea';
import FileAttachmentsProduct from '@src/components/FileAttachmentsProduct';
import rules from '@src/scenes/Validation';
import Image from 'antd/lib/image';

export interface IProps {
  productListResult?: ProductDto[];
  onCreateUpdateSuccess?: () => void;
  productSelected: ProductDto;
  layoutDetail?: boolean;
}

export default class UpdateModal extends AppComponentBase<IProps> {
  private formRef: any = React.createRef();
  state = {
    isLoadDone: false,
    isLoadFile: false,
    disableInput: true,
    pr_unit: undefined,
  };
  fileUpload: any;
  fileAttachmentItem: AttachmentItem[] = [];
  productSelected: ProductDto;

  async componentDidMount() {
    this.initData(this.props.productSelected);
  }

  async getImage() {
    this.setState({ isLoadDone: false });
    this.fileUpload = {
      uid: this.fileAttachmentItem[0].id + '',
      name: 'image.png',
      status: 'done',
      url: this.getFile(this.fileAttachmentItem[0].id),
    };
    this.setState({ isLoadDone: true });
  }

  initData = async (productInput: ProductDto) => {
    this.setState({ isLoadDone: false });
    console.log('productInput', productInput); // In ra toàn bộ dữ liệu
    if (productInput !== undefined && productInput.pr_id !== undefined) {
      this.productSelected = productInput!;
      this.setState({ isLoadDone: !this.state.isLoadDone });
      if (productInput.fi_id != undefined) {
        this.fileAttachmentItem[0] = productInput.fi_id;
        await this.getImage();
      }
      if (productInput.pr_unit != undefined) {
        this.setState({ pr_unit: productInput.pr_unit });
        this.formRef.current!.setFieldsValue({ pr_unit: productInput.pr_unit });
      }
      this.formRef.current!.setFieldsValue(productInput);
      this.setState({ isLoadDone: !this.state.isLoadDone });
    } else {
      this.setState({ pr_unit: undefined });
      this.fileAttachmentItem[0] = new AttachmentItem();
      await this.getImage();
      this.productSelected = new ProductDto();
      this.formRef.current!.resetFields();
    }
    this.setState({ isLoadFile: !this.state.isLoadFile, isLoadDone: true });
  };





  onCreateUpdateSuccess = () => {
    if (!!this.props.onCreateUpdateSuccess) {
      this.props.onCreateUpdateSuccess();
    }
    this.setState({ isLoadDone: true });
  };

  onUpdate = async () => {
    const { productSelected } = this.props;
    this.setState({ isLoadDone: false });
    const form = this.formRef.current;
    form!.validateFields().then(async (values: any) => {
      let unitData = new UpdateProductInput({ ...values });
      unitData.pr_id = productSelected.pr_id;
      unitData.fi_id = this.fileAttachmentItem[0];
      await stores.productStore.updateProduct(unitData);
      await this.onCreateUpdateSuccess();
      this.setState({ disableInput: true })
      message.success("Chỉnh sửa thành công!");
    }
    )
    this.setState({ isLoadFile: !this.state.isLoadFile, isLoadDone: true });
  };

  render() {

    console.log('pr_unit', this.props.productSelected.pr_unit);
    const { productSelected } = this.props;
    return (
      <Card>
        <Row style={{ marginBottom: 8 }}>
          <Col span={12}>
            <h3>Thông tin {productSelected.pr_name}</h3>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button type="primary" onClick={() => this.onUpdate()}>
                Cập nhật
              </Button>
            </Space>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Image
              style={{ width: 80, height: 80 }}
              src={
                this.fileAttachmentItem[0] != undefined &&
                  this.fileAttachmentItem[0].id != undefined
                  ? this.getImageProduct(
                    this.fileAttachmentItem[0].md5 != undefined
                      ? this.fileAttachmentItem[0].md5
                      : ''
                  )
                  : AppConsts.appBaseUrl + '/image/no_image.jpg'
              }
              alt="No image available"
            />
          </Col>
          <Col span={16}>
            <Form ref={this.formRef} style={{ width: '100%' }}>
              <FileAttachmentsProduct
                maxLength={1}
                files={this.fileAttachmentItem}
                onSubmitUpdate={async (itemFile: AttachmentItem[], file) => {
                  this.fileAttachmentItem = itemFile;
                  await this.formRef.current!.setFieldsValue({ fi_id: file });
                }}
              />
              <Form.Item {...AppConsts.formItemLayout} label="Mã sản phẩm" name={'pr_code'} rules={[rules.required]}>
                <h2>{productSelected.pr_code}</h2>
              </Form.Item>
              <Form.Item {...AppConsts.formItemLayout} label="Tên sản phẩm" name={'pr_name'} rules={[rules.required]}>
                <Input placeholder="Nhập tên sản phẩm..." allowClear />
              </Form.Item>
              <Form.Item {...AppConsts.formItemLayout} label={'Giá bán(VNĐ)'} name={'pr_price'} rules={[rules.messageForNumber]}>
                <InputNumber placeholder={'Nhập số tiền....'} min={0} max={999999999} step={1000} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item  {...AppConsts.formItemLayout} label="Đơn vị tính" name={'pr_unit'} rules={[rules.required]}>
                <SelectedUnit unitSelected={this.state.pr_unit} onChangeUnit={async (value) => await this.formRef.current!.setFieldsValue({ pr_unit: value ? value : undefined })}  ></SelectedUnit>
              </Form.Item>
              <Form.Item {...AppConsts.formItemLayout} label="Ghi chú" name={'pr_desc'}>
                <TextArea rows={4} maxLength={255} />
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Card>
    );
  }
}
