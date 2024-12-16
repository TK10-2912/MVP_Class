import ActionExport from '@src/components/ActionExport';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { ReconcileCashDto, ReconcileDto, TransactionByMachineDto } from '@src/services/services_autogen';
import { Col, Modal, Row, Table } from 'antd';
import moment from 'moment';
import * as React from 'react';
import TableReconcileCashUser from './TableReconcileCashUser';
import TableReconcileDetailCashUser from './TableReconcileDetailCashUser';

export interface IProps {
    listReconsile: ReconcileDto[];
    onCancel?: () => void;
    visible: boolean;
    title?: string;
    reconcileCashSelect: ReconcileCashDto ;
}

export default class ModalExportCashDetailReconcileUser extends React.Component<IProps> {
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
        const { listReconsile,reconcileCashSelect } = this.props;
        return (
            <Modal
                visible={this.props.visible}
                title={
                    <Row >
                        <Col span={12}>
                        <h3>{`Xuất danh sách đối soát tiền mặt theo máy "${this.props.title}"  của tháng ${reconcileCashSelect.rec_month}`}  </h3>
                        </Col>
                        <Col span={12} style={{ textAlign: 'end' }}>
                            <ActionExport
                                nameFileExport={'cash_reconcile_detail_user' + ' ' + moment().format('DD_MM_YYYY')}
                                idPrint="cash_reconcile_detail_user"
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
                <Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id="cash_reconcile_detail_user">
                    <TitleTableModalExport title={`Danh sách đối soát tiền mặt theo máy ${this.props.title} của tháng ${reconcileCashSelect.rec_month}`}></TitleTableModalExport>
                    <TableReconcileDetailCashUser
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