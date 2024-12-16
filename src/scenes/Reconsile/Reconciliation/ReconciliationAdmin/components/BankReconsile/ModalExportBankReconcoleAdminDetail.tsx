import ActionExport from '@src/components/ActionExport';
import { BillingDto, ExcelReconcileDto,} from '@src/services/services_autogen';
import { Checkbox, Col, Modal, Row } from 'antd';
import moment from 'moment';
import * as React from 'react';
import TableBillingViewAdmin from './TableBillingViewAdmin';
import TableListBillingOnlyInExcelAdmin from './TableListBillingOnlyInExcelAdmin';

export interface IProps {
    billListResult: BillingDto[];
    onCancel?: () => void;
    visible: boolean;
    listBillId: number[];
    billListResultExcel?: ExcelReconcileDto[];
}

export default class ModalExportBankReconcoleAdminDetail extends React.Component<IProps> {
    componentRef: any | null = null;
    state = {
        isLoadDone: true,
        isPrintTableBillingViewUser:true,
        isPrintTableListBillingOnlyInExcelUser:true,
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
                                idPrint="bank_reconcile_admin_detail_print_id"
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
                    <Checkbox className='no-print' style={{ marginBottom: "10px" }} defaultChecked onChange={(e) => this.setState({ isPrintTableListBillingOnlyInExcelUser: e.target.checked })}>Danh sách trạng thái bán hàng loại thanh toán</Checkbox><br />
                </Row>
                <Row ref={this.setComponentRef} id="bank_reconcile_admin_detail_print_id">
                    <Col span={this.state.isPrintTableBillingViewUser?24:0} style={{ marginTop: '10px' }}  >
                        <TableBillingViewAdmin
                            listBillId={this.props.listBillId}
                            billListResult={this.props.billListResult}
                            isPrint={true}
                        />
                    </Col>
                    <Col span={this.state.isPrintTableListBillingOnlyInExcelUser?24:0} style={{ marginTop: '10px' }} >
                        <TableListBillingOnlyInExcelAdmin
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