import { CloseOutlined } from '@ant-design/icons';
import ActionExport from '@src/components/ActionExport';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { DailySaleMonitoringDto } from '@src/services/services_autogen';
import { Button, Checkbox, Col, Modal, Row } from 'antd';
import moment from 'moment';
import * as React from 'react';
import { useRef, useState, useEffect } from 'react';
import TablePaymentOfSaleMonitoring from './TablePaymentOfSaleMonitoring';
import TableSaleMonitoring from './TableSaleMonitoring';

export interface IProps {
    dailySaleMonitoringDto: DailySaleMonitoringDto;
    onCancel?: () => void;
    visible: boolean;
    pageSize:number;
    skipCount:number;
}

const ModalExportDailySaleMonitoring = (props:IProps) => {
    
    const [isLoadDone, setIsLoadDone] = useState(true);
    const [isPrintTablePaymentOfSaleMonitoring, setIsPrintTablePaymentOfSaleMonitoring] = useState(true);
    const [isPrintTableSaleMonitoring, setIsPrintTableSaleMonitoring] = useState(true);
    const [componentRef, setComponentRef] = useState<any | null>(null);

    useEffect(() => {
        if (componentRef) {
            setIsLoadDone(false);
            setIsLoadDone(true);
        }
    }, [componentRef]);

    const {dailySaleMonitoringDto} = props;
    return (
        <Modal
            visible={props.visible}
            title={
                <Row >
                    <Col span={12}>
                        <h3>Xuất danh sách trạng thái bán hàng </h3>
                    </Col>
                    <Col span={12} style={{ textAlign: 'end' }}>
                        {isPrintTablePaymentOfSaleMonitoring === false && isPrintTableSaleMonitoring === false ?
                            <Button
                                danger
                                title='Hủy'
                                icon={<CloseOutlined />}
                                onClick={() => { props.onCancel!() }}
                            >
                                {(window.innerWidth >= 768) && 'Hủy'}
                            </Button> :
                            <ActionExport
                                nameFileExport={'DailySaleMonitoring ' + moment().format('DD_MM_YYYY')}
                                idPrint={isPrintTablePaymentOfSaleMonitoring && isPrintTableSaleMonitoring ? "machine_print_id" : isPrintTablePaymentOfSaleMonitoring && isPrintTableSaleMonitoring === false ? "table_payment_of_sale_monitoring" : "table_sale_monitoring"}
                                isExcel={true}
                                isWord={true}
                                componentRef={componentRef}
                                onCancel={props.onCancel}
                                isDestroy={true}
                            />}
                    </Col>
                </Row>
            }
            closable={false}
            cancelButtonProps={{ style: { display: "none" } }}
            onCancel={() => { props.onCancel!() }}
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
                        onChange={(e) => setIsPrintTablePaymentOfSaleMonitoring(e.target.checked)}
                    >
                        Danh sách trạng thái bán hàng loại thanh toán
                    </Checkbox>

                    <Checkbox
                        className='no-print'
                        defaultChecked
                        onChange={(e) => setIsPrintTableSaleMonitoring(e.target.checked)}
                    >
                        Danh sách trạng thái bán hàng theo máy
                    </Checkbox>
                </div>
            </Row>

            <Row ref={setComponentRef} id="machine_print_id">
                <Col id='table_payment_of_sale_monitoring' ref={setComponentRef} span={isPrintTablePaymentOfSaleMonitoring ? 24 : 0} style={{ marginTop: '10px' }} >
                    <TitleTableModalExport title='Trạng thái bán hàng theo loại thanh toán'></TitleTableModalExport>
                    <TablePaymentOfSaleMonitoring
                        dailySaleMonitoringDto={dailySaleMonitoringDto}
                        is_printed={true}

                    />
                </Col>
                <Col ref={setComponentRef} id='table_sale_monitoring' span={isPrintTableSaleMonitoring ? 24 : 0} style={{ marginTop: '10px' }} >
                    <TitleTableModalExport title='Trạng thái bán hàng theo máy'></TitleTableModalExport>
                    <TableSaleMonitoring
                        pagination={false}
                        billingOfMachine={dailySaleMonitoringDto.listBillingOfMachine?.slice((props.skipCount - 1) * props.pageSize, props.skipCount * props.pageSize)}
                        is_printed={true}
                    />
                </Col>
            </Row>
        </Modal>
    )
}

export default ModalExportDailySaleMonitoring
