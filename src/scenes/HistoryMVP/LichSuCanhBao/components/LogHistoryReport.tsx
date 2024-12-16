import { BillingDto, ReportOfMachineDto } from '@src/services/services_autogen';
import { TablePaginationConfig, ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import * as React from 'react';
import { Button, Card, Col, Row, Table, Tag } from 'antd';
import { stores } from '@src/stores/storeInitializer';
import { eReportLevel, eReportStatus, valueOfeReportLevel, valueOfeReportStatus } from '@src/lib/enumconst';
import { CheckCircleOutlined, CloseCircleOutlined, CloseOutlined, ExclamationCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { EventTable } from '@src/lib/appconst';
import { Link } from 'react-router-dom';
import ModalTableBillingViewAdmin from '@src/scenes/StatisticalReport/TabPayment/BankingPayment/componentAdmin/ModalTableBillingViewAdmin';
import { SorterResult } from 'antd/lib/table/interface';

export interface IProps {
    pagination: TablePaginationConfig | false;
    isLoadDone: boolean;
    onCancel?: () => void;
    reportOfMachineDto: ReportOfMachineDto;
}

export default class LogHistoryReport extends React.Component<IProps> {
    state = {
        isLoadDone: true,
        bi_id_selected: undefined,
        visibleModalBillProduct: false,
        visibleLog: false,
    }

    onCancel = () => {
        if (!!this.props.onCancel) {
            this.props.onCancel();
        }
    }

    render() {
        const { reportOfMachineDto } = this.props;
        return (
            <Card>
                <Row>
                    <Col span={20}>
                        {reportOfMachineDto != undefined && reportOfMachineDto.reportOfMachineLogs != undefined && reportOfMachineDto.reportOfMachineLogs!.length > 0 ? reportOfMachineDto.reportOfMachineLogs?.map(item => (
                            <div style={{ width: "100%", textAlign:"start" }}>
                                <label style={{ marginBottom: "10px", }}>Mã báo cáo: <b>{(reportOfMachineDto.re_code)}</b></label><br />
                                <label style={{ marginBottom: "10px", }}>Mã hóa đơn: <b>{(reportOfMachineDto.billing.bi_code)}</b></label><br />
                                {/* <br /> */}
                                <label style={{ marginBottom: "10px", }}>Trạng thái: <b>  
                                    {item.re_status == eReportStatus.DA_HOAN_THANH.num ? <Tag icon={<CheckCircleOutlined />} color="green">Hoàn thành</Tag> : ""}
                                    {item.re_status == eReportStatus.KHOI_TAO.num ? <Tag color="yellow">Khởi tạo</Tag> : ""}</b></label><br />
                                <label style={{ marginBottom: "10px", }}>Ngày tạo: <b>{moment(item.re_ma_lo_created_at).format("DD/MM/YYYY hh:mm:ss A")}  </b></label><br />
                                <label style={{ marginBottom: "10px", }}>Thời gian cập nhật:<b> {moment(reportOfMachineDto.re_updated_at).format("DD/MM/YYYY hh:mm:ss A")}  </b></label><br />
                                <label style={{ marginBottom: "10px", }}>Ghi chú: <b dangerouslySetInnerHTML={{ __html: item.re_ma_lo_desc! }}></b></label><br />
                                {/* <p style={{ borderTop: "1px solid #000", margin: "20px 0" }}></p> */}
                            </div>
                        ))
                            :
                            <h2 style={{ textAlign: "center" }}>Không có thông tin</h2>
                        }
                    </Col>
                    <Col span={4}>
                        <Button
                            danger
                            title='Hủy'
                            icon={<CloseOutlined />}
                            onClick={() => { this.props.onCancel!() }}
                        >
                            Huỷ
                        </Button>
                    </Col>
                </Row>
            </Card>

        )
    }

}