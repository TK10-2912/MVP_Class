import React from "react";
import { FormInstance } from "antd/lib/form";
import {
  Button,
  Card,
  Col,
  Divider,
  Input,
  message,
  Row,
  Select,
  Spin,
  Form,
  Descriptions,
  Tag,
  Alert,
  Typography,
  Space
} from "antd";
import {
  ApiOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
  BarcodeOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  DisconnectOutlined,
  SaveOutlined,
  ExperimentOutlined
} from "@ant-design/icons";
import { ConnectInvoiceDto, CreateConnectInvoiceDto } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";

const { Option } = Select;
const { Title, Text } = Typography;

type Config = {
  provider: string;
  taxCode: string;
  password: string;
  invoiceSymbol: string;
  invoiceTemplate: string;
  connectedAt?: string;
};

type State = {
  connected: boolean;
  loading: boolean;
  testing: boolean;
  config?: ConnectInvoiceDto | null;
};

export default class ConnectInvoice extends React.Component<{}, State> {
  formRef: React.RefObject<FormInstance>;

  constructor(props: {}) {
    super(props);
    this.state = {
      connected: false,
      loading: true,
      testing: false,
      config: null,
    };
    this.formRef = React.createRef<FormInstance>();
  }

  componentDidMount() {
    this.loadConfig();
  }

  async loadConfig() {
    try {
      const cfg = await stores.connectInvoiceStore.getConncet();
      if (cfg && cfg.taxcode != undefined) {
        this.setState({ config: cfg, connected: true, loading: false });
      } else {
        this.setState({ connected: false, loading: false, config: null });
      }
    } catch (e) {
      console.error(e);
      this.setState({ connected: false, loading: false, config: null });
    }
  }

  handleTestConnection = async () => {
    const form = this.formRef.current;
    if (!form) return;
    const values = await form.validateFields();
    this.setState({ testing: true });
    const payload = new CreateConnectInvoiceDto();
    payload.supplier = values.supplier;
    payload.taxcode = values.taxcode;
    payload.password = values.password;
    payload.invoiceType = values.invoiceType;
    payload.templateCode = values.templateCode;
    payload.invoiceSeries = values.invoiceSeries;
    const result = await stores.connectInvoiceStore.testConnect(payload);
    if (result && result.status === true) {
      message.success("Kết nối thành công với nhà cung cấp hoá đơn.");
    } else {
      message.error(`Kết nối thất bại: ${result?.message || "Lỗi không xác định"}`);
    }
    this.setState({ testing: false });
  };

  handleSave = async () => {
    const form = this.formRef.current;
    if (!form) return;
    const values = await form.validateFields();
    // Chuẩn bị payload từ các tên field có thể khác nhau giữa form và state/save
    const payload = new CreateConnectInvoiceDto();
    payload.supplier = values.supplier;
    payload.taxcode = values.taxcode;
    payload.password = values.password;
    payload.invoiceType = values.invoiceType;
    payload.templateCode = values.templateCode;
    payload.invoiceSeries = values.invoiceSeries;
    const result = await stores.connectInvoiceStore.connectInvoice(payload);
    if (result && result.taxcode != null) {
      message.success("Lưu cấu hình thành công.");
    } else {
      message.error(`Kết nối thất bại"}`);
    }
    this.setState({ config: result, connected: true });
  };

  handleDisconnect = async () => {
    await stores.connectInvoiceStore.deleteConnect();
    this.setState({ config: null, connected: false });
    message.info("Đã ngắt kết nối hoá đơn điện tử.");
  };
  renderNotConnected() {
    const { testing } = this.state;
    return (
      <Card
        bordered={false}
        style={{ maxWidth: 800, margin: "0 auto", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <ApiOutlined style={{ fontSize: 48, color: "#1890ff" }} />
          <Title level={3} style={{ marginTop: 16 }}>Thiết lập kết nối Hoá đơn điện tử</Title>
          <Text type="secondary">Vui lòng nhập thông tin tài khoản từ nhà cung cấp dịch vụ hoá đơn.</Text>
        </div>

        <Alert
          message="Chưa kết nối"
          description="Hệ thống hiện chưa được liên kết với đơn vị phát hành hoá đơn nào."
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form layout="vertical" ref={this.formRef} size="large">
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="supplier"
                label="Nhà cung cấp"
                initialValue={this.state.config?.supplier || undefined}
                rules={[{ required: true, message: "Vui lòng chọn nhà cung cấp" }]}
              >
                <Select placeholder="Chọn nhà cung cấp">
                  <Option value="MISA">MISA (MeInvoice)</Option>
                  <Option value="Viettel">Viettel (S-Invoice)</Option>
                  <Option value="VNPT">VNPT (Invoice)</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="taxcode"
                label="Mã số thuế"
                initialValue={this.state.config?.taxcode || undefined}
                rules={[
                  { required: true, message: "Vui lòng nhập mã số thuế" },
                  { min: 3, message: "Mã số thuế ít nhất 3 ký tự" },
                ]}
              >
                <Input prefix={<SafetyCertificateOutlined className="site-form-item-icon" />} placeholder="VD: 0102030405" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="password"
                label="Mật khẩu Webservice"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu kết nối" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="invoiceSeries"
                label="Ký hiệu hoá đơn (Serial)"
                initialValue={this.state.config?.invoiceSeries || undefined}
                rules={[{ required: true, message: "Vui lòng nhập ký hiệu" }]}
              >
                <Input prefix={<BarcodeOutlined />} placeholder="VD: C23TAA" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="templateCode"
                label="Ký hiệu mẫu hoá đơn"
                initialValue={this.state.config?.templateCode || undefined}
                rules={[{ required: true, message: "Vui lòng nhập ký hiệu mẫu hoá đơn" }]}
              >
                <Input prefix={<FileTextOutlined />} placeholder="VD: 01GTKT0/001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="invoiceType"
                label="Mẫu số hoá đơn"
                initialValue={this.state.config?.invoiceType || undefined}
                rules={[{ required: true, message: "Vui lòng chọn mẫu hoá đơn" }]}
              >
                <Select placeholder="Chọn mẫu số">
                  <Option value="01GTGT">Mẫu 1/001 (GTGT)</Option>
                  <Option value="2/001">Mẫu 2/001 (Bán hàng)</Option>
                  <Option value="03GTGT">Mẫu 3/001 (Dịch vụ)</Option>
                  <Option value="04GTGT">Mẫu 4/001 (Xuất khẩu)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Divider />

          <Row justify="end">
            <Space>
              <Button
                icon={<ExperimentOutlined />}
                onClick={this.handleTestConnection}
                loading={testing}
              >
                Test kết nối
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={this.handleSave}
              >
                Lưu cấu hình
              </Button>
            </Space>
          </Row>
        </Form>
      </Card>
    );
  }

  renderConnected(cfg: ConnectInvoiceDto) {
    return (
      <Card
        bordered={false}
        style={{ maxWidth: 800, margin: "0 auto", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <CheckCircleOutlined style={{ fontSize: 48, color: "#52c41a" }} />
          <Title level={3} style={{ marginTop: 16 }}>Đã kết nối thành công</Title>
          <Tag color="success" style={{ fontSize: 14, padding: "4px 10px" }}>TRẠNG THÁI: ONLINE</Tag>
        </div>

        <Descriptions
          title="Thông tin cấu hình"
          bordered
          column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
        >
          <Descriptions.Item label="Nhà cung cấp">
            <b>{cfg.supplier}</b>
          </Descriptions.Item>
          <Descriptions.Item label="Mã số thuế">
            {cfg.taxcode}
          </Descriptions.Item>
          <Descriptions.Item label="Ký hiệu hoá đơn">
            <Tag color="blue">{cfg.invoiceSeries}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Mẫu hoá đơn">
            <FileTextOutlined /> {cfg.templateCode}
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian kết nối" span={2}>
            {cfg.ci_created_at ? new Date(cfg.ci_created_at).toLocaleString('vi-VN') : "-"}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Row justify="end">
          <Space>
            <Button onClick={() => {
              if (this.formRef.current) {
                this.formRef.current.setFieldsValue(cfg);
              }
              this.setState({ connected: false });
            }}>
              Chỉnh sửa
            </Button>
            <Button danger icon={<DisconnectOutlined />} onClick={this.handleDisconnect}>
              Ngắt kết nối
            </Button>
          </Space>
        </Row>
      </Card>
    );
  }

  render() {
    const { loading, connected, config } = this.state;
    if (loading) {
      return (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <Spin size="large" tip="Đang tải cấu hình..." />
        </div>
      );
    }

    return (
      <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
        {connected && config ? this.renderConnected(config) : this.renderNotConnected()}
      </div>
    );
  }
}