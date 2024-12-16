import ActionExport from '@src/components/ActionExport';
import { ExcelReconcileDto } from '@src/services/services_autogen';
import { Col, Modal, Row } from 'antd';
import moment from 'moment';
import * as React from 'react';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import TableListBillingOnlyInExcelAdmin from './TableListBillingOnlyInExcelAdmin';

export interface IProps {
    exBillListResult: ExcelReconcileDto[];
    onCancel?: () => void;
    visible: boolean;
    title?: string;
}

export default class ModalExportBankReconcoleOnlyExcelUserDetailAdmin extends React.Component<IProps> {
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
                            <h2 style={{ fontSize: 20 }}>Xuất danh sách hóa đơn đối soát chỉ có ở excel</h2>
                        </Col>
                        <Col span={12} style={{ textAlign: 'end' }}>
                            <ActionExport
                                nameFileExport={'bank_reconcile_user_detal' + ' ' + moment().format('DD_MM_YYYY')}
                                idPrint={"hoadonchicoExcel"}
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
                <Row ref={this.setComponentRef} id="hoadonchicoExcel">
                    <Col span={24}  >
                        <TableListBillingOnlyInExcelAdmin
                            billListResult={this.props.exBillListResult}
                            pagination={false}
                            hasAction={false}
                        />
                    </Col>
                </Row>
            </Modal>
        )
    }
}