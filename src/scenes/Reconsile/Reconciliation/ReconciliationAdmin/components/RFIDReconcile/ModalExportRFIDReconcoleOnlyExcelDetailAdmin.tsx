import ActionExport from '@src/components/ActionExport';
import { BillingDto, ExcelReconcileDto } from '@src/services/services_autogen';
import {  Col, Modal, Row } from 'antd';
import moment from 'moment';
import * as React from 'react';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import TableListRFIDBillingOnlyInExcelAdmin from './TableListRFIDBillingOnlyInExcelAdmin';

export interface IProps {
    onCancel?: () => void;
    visible: boolean;
    billListResultExcel?: ExcelReconcileDto[];
    title?: string;
}

export default class ModalExportRFIDReconcoleOnlyExcelDetailAdmin extends React.Component<IProps> {
    componentRef: any | null = null;
    state = {
        isLoadDone: true,
        isPrintTableBillingViewUser: true,
        isPrintTableListBillingOnlyInExcelUser: true,
    };
    setComponentRef = (ref) => {
        this.setState({ isLoadDone: false });
        this.componentRef = ref;
        this.setState({ isLoadDone: true });
    }
    render() {
        return (
            <Modal
                visible={this.props.visible}
                title={
                    <Row >
                        <Col span={12}>
                            <h4>Xuất danh sách hóa đơn đối soát chỉ có ở excel</h4>
                        </Col>
                        <Col span={12} style={{ textAlign: 'end' }}>
                            <ActionExport
                                nameFileExport={'rfid_reconcile_onlyExcel_detail' + ' ' + moment().format('DD_MM_YYYY')}
                                idPrint={"rfid_reconcile_onlyExcel_detail"}
                                isExcel={true}
                                isWord={true}
                                componentRef={this.componentRef}
                                onCancel={this.props.onCancel}
                                isDestroy={true}
                            />
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
                <Row ref={this.setComponentRef}>
                    <Col span={24}>
                        <TableListRFIDBillingOnlyInExcelAdmin
                            billListResult={this.props.billListResultExcel}
                            pagination={false}
                            hasAction={false}
                        />
                    </Col>
                </Row>
            </Modal>
        )
    }
}