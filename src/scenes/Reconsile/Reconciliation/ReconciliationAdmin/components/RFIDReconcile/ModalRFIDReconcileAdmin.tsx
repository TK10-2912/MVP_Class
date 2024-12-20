import { BillingDto, ReconcileDto, ReconcileLogsDto, RfidLogDto } from '@src/services/services_autogen';
import { Button, Col, Modal, Row } from 'antd';
import * as React from 'react';
import { EventTable, cssCol } from '@src/lib/appconst';
import { TablePaginationConfig } from 'antd/lib/table';
import UpdateBillingRFIDReconcileAdmin from './UpateBillingRFIDReconcileAdmin';
import RFIDLogs from '@src/stores/rfidLogs';
export interface IProps {
    onCancel?: () => void;
    visible?: boolean;
    isLoadDone?: boolean;
    rfidSelected?: RfidLogDto;
    rec_id: number;
}

export default class ModalRFIDReconcileAdmin extends React.Component<IProps> {
    componentRef: any | null = null;
    state = {
        isLoadDone: true,
        visibleUpdateStatusReconcile: false,
        visibleUpdateStatusReconcileOnlyExcel: false,
    };
    setComponentRef = (ref) => {
        this.setState({ isLoadDone: false });
        this.componentRef = ref;
        this.setState({ isLoadDone: true });
    }
    render() {
        const left = this.state.visibleUpdateStatusReconcile ? cssCol(15) : cssCol(24);
        const right = this.state.visibleUpdateStatusReconcile ? cssCol(9) : cssCol(0);
        return (
            <Modal
                visible={this.props.visible}
                onCancel={this.props.onCancel}
                closable={false}
                maskClosable={true}
                footer={false}
                width={"85%"}>
                <Row gutter={8}>
                    <Col span={12}><h2>Danh sách đơn hàng đối soát</h2></Col>
                    <Col span={12} style={{ display: "flex", justifyContent: "end" }}>
                        <Button style={{ marginRight: "10px" }} type="primary" onClick={() => this.setState({ visibleExportExcelDetail: true })}>Xuất dữ liệu</Button>
                        <Button
                            danger
                            type="ghost" title='Hủy'
                            onClick={this.props.onCancel}
                        >
                            Hủy
                        </Button>
                    </Col>
                </Row>
                <>
                    <Row gutter={10}>
                        <Col {...right} style={{ marginTop: 105 }}>
                            {this.state.visibleUpdateStatusReconcile &&
                                <UpdateBillingRFIDReconcileAdmin
                                    rfid_logs_select={this.props.rfidSelected!}
                                    reconcileSelect={this.props.rec_id!}
                                />
                            }
                        </Col>
                    </Row>
                </>
            </Modal>
        )
    }
}