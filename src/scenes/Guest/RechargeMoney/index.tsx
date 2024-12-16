import { Button, Input, Row, message } from 'antd';
import React from 'react';
import VisibleQRCode from './VisibleQRCode';
import './style.css';

export default class RechargeMoney extends React.Component {
    componentRef: any | null = null;
    state = {
        rfid: '',
        isDisable: false,
        selectedButton: undefined,
        price: undefined,
        isVisibleModalQR: false,
        isVisibleButtonPrice: false,
    }

    componentDidMount() {
        this.componentRef.focus();
    }
    setComponentRef = (ref) => {
        this.setState({ isLoadDone: false });
        this.componentRef = ref;
        this.setState({ isLoadDone: true });
    }
    handleDeposit = async () => {
        if (!this.state.rfid || !this.state.price) {
            message.error("Thông tin bị thiếu. Vui lòng kiểm tra lại!");
            return;
        }
        await this.setState({ isVisibleModalQR: true, isDisable: true })
    }
    handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            this.setState({ isVisibleButtonPrice: true });
        }
        else {
            let newChar = String.fromCharCode(e.keyCode);
            this.setState({ rfid: this.state.rfid + newChar });
        }
    };
    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }

    render() {
        return (
            this.state.isVisibleModalQR !== true ?
                <Row tabIndex={0} ref={this.setComponentRef} onKeyDown={this.state.isVisibleButtonPrice ? () => { } : this.handleKeyDown} className='div-container'>
                    <p style={{ fontSize: 20, fontWeight: 700, color: "#1a8765", marginTop: 150 }}>Nạp tiền cho thẻ RFID</p>
                    <Input value={this.state.rfid} readOnly className='input-deposit' placeholder='Quét mã thẻ RFID'></Input>
                    {this.state.isVisibleButtonPrice &&
                        <div>
                            <div className='div-price'>
                                <Button
                                    className={`btn-price btn-10000 ${this.state.selectedButton === 1 ? 'selected' : ''}`}
                                    value={10000}
                                    onClick={async () => await this.setState({ price: 10000, selectedButton: 1 })}
                                >
                                    10.000 Đ
                                </Button>
                                <Button
                                    className={`btn-price btn-20000 ${this.state.selectedButton === 2 ? 'selected' : ''}`}
                                    value={20000}
                                    onClick={async () => await this.setState({ price: 20000, selectedButton: 2 })}
                                >
                                    20.000 Đ
                                </Button>
                                <Button
                                    className={`btn-price btn-50000 ${this.state.selectedButton === 3 ? 'selected' : ''}`}
                                    value={50000}
                                    onClick={async () => await this.setState({ price: 50000, selectedButton: 3 })}
                                >
                                    50.000 Đ
                                </Button>
                                <Button
                                    className={`btn-price btn-100000 ${this.state.selectedButton === 4 ? 'selected' : ''}`}
                                    value={100000}
                                    onClick={async () => await this.setState({ price: 100000, selectedButton: 4 })}
                                >
                                    100.000 Đ
                                </Button>
                                <Button
                                    className={`btn-price btn-200000 ${this.state.selectedButton === 5 ? 'selected' : ''}`}
                                    value={200000}
                                    onClick={async () => await this.setState({ price: 200000, selectedButton: 5 })}
                                >
                                    200.000 Đ
                                </Button>
                            </div>
                        </div>
                    }
                    {!!this.state.price &&
                        <Button
                            type='primary'
                            className='btn-deposit'
                            onClick={this.handleDeposit}
                        >
                            Nạp tiền
                        </Button>}

                </Row>
                :
                <VisibleQRCode
                    rfid={this.state.rfid!}
                    price={this.state.price!}
                    isVisibleQR={this.state.isVisibleModalQR}
                    onCancel={async () => await this.setState({ isVisibleModalQR: false, isDisable: false })}
                />

        )
    }
}