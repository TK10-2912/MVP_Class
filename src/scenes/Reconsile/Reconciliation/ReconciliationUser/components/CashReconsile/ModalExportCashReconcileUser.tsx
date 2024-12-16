import ActionExport from '@src/components/ActionExport';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { ReconcileCashDto, ReconcileDto, TransactionByMachineDto } from '@src/services/services_autogen';
import { Col, Modal, Row, Table } from 'antd';
import moment from 'moment';
import * as React from 'react';
import TableReconcileCashUser from './TableReconcileCashUser';

export interface IProps {
    listReconsile: ReconcileCashDto[];
    onCancel?: () => void;
    visible: boolean;
}

export default class ModalExportCashReconcileUser extends React.Component<IProps> {
    componentRef: any | null = null;
    state = {
        isLoadDone: true,
    };
    setComponentRef = (ref) => {
        this.setState({ isLoadDone: false });
        this.componentRef = ref;
        this.setState({ isLoadDone: true });
    }
    render() {
        const { listReconsile } = this.props;
        return (
            <Modal
                visible={this.props.visible}
                title={
                    <Row >
                        <Col span={12}>
                            <h3>Xuất danh sách đối soát tiền mặt</h3>
                        </Col>
                        <Col span={12} style={{ textAlign: 'end' }}>
                            <ActionExport
                                nameFileExport={'cash_reconcile_user' + ' ' + moment().format('DD_MM_YYYY')}
                                idPrint="cash_reconcile_user_print_id"
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
                <Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id="cash_reconcile_user_print_id">
                    <TitleTableModalExport title='Danh sách đối soát tiền mặt'></TitleTableModalExport>
                    <TableReconcileCashUser
                        pagination={false}
                        listReconciliationResult={listReconsile}
                        has_action={false}
                        is_printed={true}
                    />
                </Col>
            </Modal>
        )
    }
}