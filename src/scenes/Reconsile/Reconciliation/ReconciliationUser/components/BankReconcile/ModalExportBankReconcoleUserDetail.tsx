import ActionExport from '@src/components/ActionExport';
import { BillingDto, ExcelReconcileDto } from '@src/services/services_autogen';
import { Checkbox, Col, Modal, Row } from 'antd';
import moment from 'moment';
import * as React from 'react';
import TableBillingViewUser from './TableBillingViewUser';
import TableListBillingOnlyInExcelUser from './TableListBillingOnlyInExcelUser';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';

export interface IProps {
    billListResult: BillingDto[];
    onCancel?: () => void;
    visible: boolean;
    listBillId: number[];
    billListResultExcel?: ExcelReconcileDto[];
    title?: string;
}

export default class ModalExportBankReconcoleUserDetail extends React.Component<IProps> {
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
                                nameFileExport={'bank_reconcile_user_detal' + ' ' + moment().format('DD_MM_YYYY')}
                                idPrint={(this.state.isPrintTableBillingViewUser && this.state.isPrintTableListBillingOnlyInExcelUser) ? "bank_reconcile_user_detail_print_id" : (this.state.isPrintTableBillingViewUser && this.state.isPrintTableListBillingOnlyInExcelUser === false) ? "bank_reconcile_1" : (this.state.isPrintTableBillingViewUser === false && this.state.isPrintTableListBillingOnlyInExcelUser) ? "bank_reconcile_2" : "bank_reconcile_user_detail_print_id"}
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
                <Row>
                    <Checkbox className='no-print' style={{ marginBottom: "10px" }} defaultChecked onChange={(e) => this.setState({ isPrintTableBillingViewUser: e.target.checked })}>Danh sách đơn hàng đối soát với hệ thống</Checkbox>
                    <Checkbox className='no-print' style={{ marginBottom: "10px" }} defaultChecked onChange={(e) => this.setState({ isPrintTableListBillingOnlyInExcelUser: e.target.checked })}>Danh sách đơn hàng chỉ có trong Excel</Checkbox><br />
                </Row>
                <Row ref={this.setComponentRef} id="bank_reconcile_user_detail_print_id">
                    <Col span={(this.state.isPrintTableBillingViewUser && this.state.isPrintTableListBillingOnlyInExcelUser) ? 24 : 0}>

                        <TitleTableModalExport title={this.props.title!}></TitleTableModalExport>
                    </Col>
                    <Col id='bank_reconcile_1' span={this.state.isPrintTableBillingViewUser ? 24 : 0} style={{ marginTop: '10px' }} >
                        {(this.state.isPrintTableBillingViewUser && this.state.isPrintTableListBillingOnlyInExcelUser == false) && <TitleTableModalExport title={this.props.title!}></TitleTableModalExport>}
                        < TableBillingViewUser
                            listBillId={this.props.listBillId}
                            billListResult={this.props.billListResult}
                            pagination={false}
                            hasAction={false}
                        />
                    </Col>
                    <Col id='bank_reconcile_2' span={this.state.isPrintTableListBillingOnlyInExcelUser ? 24 : 0} style={{ marginTop: '10px' }} >
                        {(this.state.isPrintTableBillingViewUser == false && this.state.isPrintTableListBillingOnlyInExcelUser) && <TitleTableModalExport title={this.props.title!}></TitleTableModalExport>}
                        <TableListBillingOnlyInExcelUser
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