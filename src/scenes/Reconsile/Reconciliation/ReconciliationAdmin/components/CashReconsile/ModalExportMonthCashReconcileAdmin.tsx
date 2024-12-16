import ActionExport from '@src/components/ActionExport';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import {  ReconcileCashDto } from '@src/services/services_autogen';
import { Col, Modal, Row } from 'antd';
import moment from 'moment';
import * as React from 'react';
import TableMainReconcileCashAdmin from './TableMainReconcileBankAdmin';
import { ReconcileMonthCashDisplay } from './CashMoneyReconciliationAdmin';
import TableMonthReconcileCashAdmin from './TableMonthReconcileBankAdmin';
export interface IProps {
    listData: ReconcileMonthCashDisplay[];
    onCancel?: () => void;
    visible: boolean;
    title?: string;
}

export default class ModalExportMonthCashReconcileAdmin extends React.Component<IProps> {
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
        const { listData } = this.props;
        return (
            <Modal
                visible={this.props.visible}
                title={
                    <Row >
                        <Col span={12}>
                        <h3>{`Xuất danh sách chi tiết đối soát các máy `}  </h3>
                        </Col>
                        <Col span={12} style={{ textAlign: 'end' }}>
                            <ActionExport
                                nameFileExport={'cash_month_reconcile_detail' + ' ' + moment().format('DD_MM_YYYY')}
                                idPrint="cash_month_reconcile_detail"
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
                <Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id="cash_month_reconcile_detail">
                    <TitleTableModalExport title={`Danh sách đối soát tiền mặt`}></TitleTableModalExport>
                    <TableMonthReconcileCashAdmin
                        listReconsile={listData}
                        pagination={false}
                        hasAction={false}
                        is_printed={true}
                    />
                </Col>
            </Modal>
        )
    }
}