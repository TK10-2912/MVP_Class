import { CloseOutlined } from '@ant-design/icons';
import ActionExport from '@src/components/ActionExport';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { DailySaleMonitoringDto } from '@src/services/services_autogen';
import { Button, Checkbox, Col, Modal, Row } from 'antd';
import moment from 'moment';
import * as React from 'react';
import TablePaymentOfSaleMonitoring from './TablePaymentOfSaleMonitoring';
import TableSaleMonitoring from './TableSaleMonitoring';

export interface IProps {
    dailySaleMonitoringDto: DailySaleMonitoringDto;
    onCancel?: () => void;
    visible: boolean;
    pageSize:number;
    skipCount:number;
}

export default class ModalExportDailySaleMonitoring extends React.Component<IProps> {
    componentRef: any | null = null;
    state = {
        isLoadDone: true,
        isPrintTablePaymentOfSaleMonitoring: true,
        isPrintTableSaleMonitoring: true,
    };
    setComponentRef = (ref) => {
        this.setState({ isLoadDone: false });
        this.componentRef = ref;
        this.setState({ isLoadDone: true });
    }
    render() {
        const { dailySaleMonitoringDto } = this.props;
        return (
            <Modal
                visible={this.props.visible}
                title={
                    <Row >
                        <Col span={12}>
                            <h3>Xuất danh sách trạng thái bán hàng </h3>
                        </Col>
                        <Col span={12} style={{ textAlign: 'end' }}>
                            {this.state.isPrintTablePaymentOfSaleMonitoring === false && this.state.isPrintTableSaleMonitoring === false ?
                                <Button
                                    danger
                                    title='Hủy'
                                    icon={<CloseOutlined />}
                                    onClick={() => { this.props.onCancel!() }}
                                >
                                    {(window.innerWidth >= 768) && 'Hủy'}
                                </Button> :
                                <ActionExport
                                    nameFileExport={'DailySaleMonitoring ' + moment().format('DD_MM_YYYY')}
                                    idPrint={this.state.isPrintTablePaymentOfSaleMonitoring && this.state.isPrintTableSaleMonitoring ? "machine_print_id" : this.state.isPrintTablePaymentOfSaleMonitoring && this.state.isPrintTableSaleMonitoring === false ? "table_payment_of_sale_monitoring" : "table_sale_monitoring"}
                                    isExcel={true}
                                    isWord={true}
                                    componentRef={this.componentRef}
                                    onCancel={this.props.onCancel}
                                    isDestroy={true}
                                />}
                        </Col>
                    </Row>
                }
                closable={false}
                cancelButtonProps={{ style: { display: "none" } }}
                onCancel={() => { this.props.onCancel!() }}
                footer={null}
                width='90vw'
                maskClosable={false}

            >
                <Row style={{justifyContent:"center"}}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Checkbox
                            className='no-print'
                            style={{ marginRight: "10px" }}
                            defaultChecked
                            onChange={(e) => this.setState({ isPrintTablePaymentOfSaleMonitoring: e.target.checked })}
                        >
                            Danh sách trạng thái bán hàng loại thanh toán
                        </Checkbox>

                        <Checkbox
                            className='no-print'
                            defaultChecked
                            onChange={(e) => this.setState({ isPrintTableSaleMonitoring: e.target.checked })}
                        >
                            Danh sách trạng thái bán hàng theo máy
                        </Checkbox>
                    </div>
                </Row>

                <Row ref={this.setComponentRef} id="machine_print_id">
                    <Col id='table_payment_of_sale_monitoring' ref={this.setComponentRef} span={this.state.isPrintTablePaymentOfSaleMonitoring ? 24 : 0} style={{ marginTop: '10px' }} >
                        <TitleTableModalExport title='Trạng thái bán hàng theo loại thanh toán'></TitleTableModalExport>
                        <TablePaymentOfSaleMonitoring
                            dailySaleMonitoringDto={dailySaleMonitoringDto}
                            is_printed={true}

                        />
                    </Col>
                    <Col ref={this.setComponentRef} id='table_sale_monitoring' span={this.state.isPrintTableSaleMonitoring ? 24 : 0} style={{ marginTop: '10px' }} >
                        <TitleTableModalExport title='Trạng thái bán hàng theo máy'></TitleTableModalExport>
                        <TableSaleMonitoring
                            pagination={false}
                            billingOfMachine={dailySaleMonitoringDto.listBillingOfMachine?.slice((this.props.skipCount - 1) * this.props.pageSize, this.props.skipCount * this.props.pageSize)}
                            is_printed={true}
                        />
                    </Col>
                </Row>
            </Modal>
        )
    }
}