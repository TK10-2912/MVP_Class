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
  config?: Config | null;
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

  loadConfig() {
    try {
      const raw = localStorage.getItem("eInvoiceConfig");
      if (raw) {
        const cfg: Config = JSON.parse(raw);
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
    try {
      const values = await form.validateFields();
      this.setState({ testing: true });
      // Giả lập call API test kết nối
      await new Promise((res) => setTimeout(res, 1200));
      
      if (values.taxCode && values.taxCode.startsWith("0")) {
        message.error("Test kết nối thất bại: Mã số thuế không hợp lệ.");
      } else {
        message.success("Kết nối thử nghiệm thành công!");
      }
    } catch (err) {
      // validation error
    } finally {
      this.setState({ testing: false });
    }
  };

  handleSave = async () => {
    const form = this.formRef.current;
    if (!form) return;
    try {
      const values = await form.validateFields();
      const cfg: Config = {
        provider: values.provider,
        taxCode: values.taxCode,
        password: values.password,
        invoiceSymbol: values.invoiceSymbol,
        invoiceTemplate: values.invoiceTemplate,
        connectedAt: new Date().toISOString(),
      };
      localStorage.setItem("eInvoiceConfig", JSON.stringify(cfg));
      this.setState({ config: cfg, connected: true });
      message.success("Lưu cấu hình thành công.");
    } catch (err) {
      // validation error
    }
  };

  handleDisconnect = () => {
    localStorage.removeItem("eInvoiceConfig");
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
                name="provider"
                label="Nhà cung cấp"
                initialValue="NCC_A"
                rules={[{ required: true, message: "Vui lòng chọn nhà cung cấp" }]}
              >
                <Select placeholder="Chọn nhà cung cấp">
                  <Option value="NCC_A">MISA (MeInvoice)</Option>
                  <Option value="NCC_B">Viettel (S-Invoice)</Option>
                  <Option value="NCC_C">VNPT (Invoice)</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="taxCode"
                label="Mã số thuế"
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
                name="invoiceSymbol"
                label="Ký hiệu hoá đơn (Serial)"
                rules={[{ required: true, message: "Vui lòng nhập ký hiệu" }]}
              >
                <Input prefix={<BarcodeOutlined />} placeholder="VD: C23TAA" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="invoiceTemplate"
            label="Mẫu số hoá đơn"
            initialValue="Mẫu A5"
            rules={[{ required: true, message: "Vui lòng chọn mẫu hoá đơn" }]}
          >
             <Select placeholder="Chọn mẫu số">
                <Option value="1/001">Mẫu 1/001 (GTGT)</Option>
                <Option value="2/001">Mẫu 2/001 (Bán hàng)</Option>
            </Select>
          </Form.Item>

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

  renderConnected(cfg: Config) {
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
                <b>{cfg.provider}</b>
            </Descriptions.Item>
            <Descriptions.Item label="Mã số thuế">
                {cfg.taxCode}
            </Descriptions.Item>
            <Descriptions.Item label="Ký hiệu hoá đơn">
                <Tag color="blue">{cfg.invoiceSymbol}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Mẫu hoá đơn">
                <FileTextOutlined /> {cfg.invoiceTemplate}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian kết nối" span={2}>
                {cfg.connectedAt ? new Date(cfg.connectedAt).toLocaleString('vi-VN') : "-"}
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