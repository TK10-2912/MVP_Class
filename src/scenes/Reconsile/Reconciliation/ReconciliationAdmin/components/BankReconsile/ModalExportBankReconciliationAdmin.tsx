import ActionExport from '@src/components/ActionExport';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { ReconcileDto } from '@src/services/services_autogen';
import { Col, Modal, Row } from 'antd';
import moment from 'moment';
import * as React from 'react';
import TableReconcileBankAdmin from './TableReconcileBankAdmin';


export interface IProps {
    listReconsile: ReconcileDto[];
    onCancel?: () => void;
    visible: boolean;
}

export default class ModalExportBankReconciliationAdmin extends React.Component<IProps> {
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
                            <h3>Xuất danh sách đối soát ngân hàng</h3>
                        </Col>
                        <Col span={12} style={{ textAlign: 'end' }}>
                            <ActionExport
                                nameFileExport={'bank_reconcile' + ' ' + moment().format('DD_MM_YYYY')}
                                idPrint="bank_reconcile_print_id"
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
                <Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id="bank_reconcile_print_id">
                    <TitleTableModalExport title='Danh sách đối soát ngân hàng'></TitleTableModalExport>
                    <TableReconcileBankAdmin
                        pagination={false}
                        listReconsile={listReconsile}
                        is_printed={true}
                        hasAction={false}
                    />

                </Col>
            </Modal>
        )
    }
}