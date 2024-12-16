import ActionExport from '@src/components/ActionExport';
import { BillingDto, RfidLogDto } from '@src/services/services_autogen';
import { Col, Modal, Row } from 'antd';
import moment from 'moment';
import * as React from 'react';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import TableBillingRFIDSystemAdmin from './TableListBillRFIDSystemAdmin';

export interface IProps {
    onCancel?: () => void;
    visible: boolean;
    listRfidId: number[];
    title?: string;
}

export default class ModalExportRFIDReconcoleDetailAdmin extends React.Component<IProps> {
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
                            <h3>Xuất danh sách đối soát</h3>
                        </Col>
                        <Col span={12} style={{ textAlign: 'end' }}>
                            <ActionExport
                                nameFileExport={'rfidReconcileDetail' + ' ' + moment().format('DD_MM_YYYY')}
                                idPrint={ "rfid_reconcile_user_detail_print_id"}
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
                <Row ref={this.setComponentRef} id="rfid_reconcile_user_detail_print_id">
                    <Col  span={this.state.isPrintTableBillingViewUser ? 24 : 0} style={{ marginTop: '10px' }} >
                        <TitleTableModalExport title={this.props.title!}></TitleTableModalExport>
                        <TableBillingRFIDSystemAdmin
                            rfidLogListCode={this.props.listRfidId}
                            pagination={false}
                            hasAction={false}
                        />
                    </Col>
                </Row>
            </Modal>
        )
    }
}