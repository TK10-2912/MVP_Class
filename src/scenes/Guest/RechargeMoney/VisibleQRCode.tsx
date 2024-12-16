import { RollbackOutlined } from "@ant-design/icons";
import { Button, Col, Image, Result, Row } from "antd";
import React from "react";
interface VisibleQRCodeProps {
    isVisibleQR: boolean,
    onCancel: () => void,
    rfid: string,
    price: number,
}
class VisibleQRCode extends React.Component<VisibleQRCodeProps> {

    state = {
        qrCode: "",
        isSuccess: false,
        isVisibleQR: undefined,
        count: 10,
    }
    interval: any;
    timeout: any;

    // async componentDidMount() {
    //     const urlParams = new URLSearchParams(window.location.search);
    //     const enc_auth_token = urlParams.get('enc_auth_token');
    //     const deviceID = urlParams.get('deviceId');
    //     try {
    //         this.setState({ isVisibleQR: this.props.isVisibleQR })
    //         await this.renderQR(enc_auth_token, deviceID);
    //     }
    //     catch (err) {
    //         message.error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!")
    //         await this.setState({ isVisibleQR: false })
    //     }
    //     this.checkQRSuccess(enc_auth_token)
    // }

    // renderQR = async (enc_auth_token, deviceID) => {
    //     let input: RechargeMoneyInput = new RechargeMoneyInput();
    //     input.rf_code = this.props.rfid;
    //     input.rf_money = this.props.price;
    //     input.deviceID = deviceID!;
    //     let qrCode = await stores.RFIDStore.CreateQRCodeForReChargeRfidMoney(input);
    //     await this.setState({ isSuccess: false });
    //     this.setState({ qrCode: qrCode });
    // }

    // checkQRSuccess = async (enc_auth_token) => {
    //     this.interval = setInterval(async () => {
    //         let isQRSuccess = await stores.RFIDStore.CheckoutQRPayment(this.props.rfid, enc_auth_token);
    //         if (!!isQRSuccess['pa_ba_id']) {
    //             await this.setState({ isSuccess: true, isVisibleQR: false });
    //             await clearInterval(this.interval);
    //             this.backToRechargePage();
    //         }
    //     }, 5000);
    // }

    // backToRechargePage = () => {
    //     this.timeout = setInterval(async () => {
    //         await this.setState({ count: this.state.count - 1 })
    //         if (this.state.count == 0) {
    //             await window.location.reload();
    //             await clearInterval(this.interval);
    //         }
    //     }, 1000)
    // }

    // componentWillUnmount() {
    //     clearInterval(this.interval)
    //     clearInterval(this.timeout)
    // }

    render() {
        return (
            <>
                {/* {this.state.isVisibleQR &&
                    <div>
                        <Row style={{ height: 50, borderBottom: "solid lightgray 2px" }} align="middle">
                            <Col span={18} style={{ display: "flex", paddingLeft: 10 }}>
                                <h2 style={{ margin: 0 }}>Nạp tiền cho mã:</h2>
                                <h2 style={{ color: "#1da57a", margin: "0 0 0 10px" }}><strong>{this.props.rfid}</strong></h2>
                            </Col>
                            <Col span={6} style={{ textAlign: "right", marginLeft: -10 }}><Button type="primary" onClick={this.props.onCancel}><RollbackOutlined /> Trở về</Button></Col>
                        </Row>
                        <div style={{ position: "fixed", width: "100%", height: "100%", backgroundColor: '#F9F9F9', zIndex: 100, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                            <h2>Vui lòng quét mã QR để thanh toán</h2>
                            <Image
                                style={{ borderRadius: "15px", border: "solid #1a8765 3px", padding: 10, marginTop: 15, backgroundColor: "#ffffff" }}
                                width={200}
                                src={!!this.state.qrCode ? `data:image/jpeg;base64,${this.state.qrCode['result']}` : process.env.PUBLIC_URL + "/image/gifloading.gif"}
                            />
                            <img style={{ width: 50, margin: "12px 0 12px 0" }} src={process.env.PUBLIC_URL + "/logo_mig-1.png"} />
                            <div>
                                <p>Bước 1: Tải ứng dụng <strong>Ngân lượng</strong> trên CH Play hoặc App Store <br />
                                    Bước 2: Mở ứng dụng và đăng nhập (đăng kí nếu chưa có tài khoản) <br />
                                    Bước 3: Quét mã QR để thanh toán
                                </p>
                            </div>
                            <h2 style={{ margin: "70px 0 50px 0" }}>Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi</h2>
                        </div>
                    </div>
                }
                {this.state.isSuccess &&
                    <div style={{ position: "fixed", width: "100%", height: "100%", backgroundColor: '#ffffff', zIndex: 200, display: "flex", justifyContent: "center", alignItems: "center", paddingBottom: 100 }}>
                        <Result
                            status="success"
                            title="Thanh toán thành công!"
                            subTitle={"Trang sẽ tắt sau " + this.state.count.toString() + " giây."}
                        />
                    </div>
                } */}
            </>
        );
    }
}

export default VisibleQRCode;