import ActionExport from '@src/components/ActionExport';
import { BillingDto, ExcelReconcileDto } from '@src/services/services_autogen';
import { Checkbox, Col, Modal, Row } from 'antd';
import moment from 'moment';
import * as React from 'react';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { stores } from '@src/stores/storeInitializer';
import TableBillingDetailRFIDAdmin from './TableBillingDetailRFIDAdmin';

export interface IProps {
    onCancel?: () => void;
    visible: boolean;
    rfid_id_list?: number[];
    billing: BillingDto[];
    title?: string;
    ma_id : number;
}

export default class ModalExportRFIDReconcileUserDetailAdmin extends React.Component<IProps> {
    componentRef: any | null = null;
    state = {
        isLoadDone: true,
        isPrintTableBillingViewAdmin: true,
        isPrintTableListBillingDetailAdmin: true,
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
                            <h2>Xuất danh sách đối soát của máy  {stores.sessionStore.getNameMachines(this.props.ma_id != undefined ? this.props.ma_id : -1)}</h2>
                        </Col>
                        <Col span={12} style={{ textAlign: 'end' }}>
                            <ActionExport
                                nameFileExport={'bank_reconcile_admin_detal' + ' ' + moment().format('DD_MM_YYYY')}
                                idPrint={(this.state.isPrintTableBillingViewAdmin && this.state.isPrintTableListBillingDetailAdmin) ? "bank_reconcile_admin_detail_print_id" : (this.state.isPrintTableBillingViewAdmin && this.state.isPrintTableListBillingDetailAdmin === false) ? "bank_reconcile_1" : (this.state.isPrintTableBillingViewAdmin === false && this.state.isPrintTableListBillingDetailAdmin) ? "bank_reconcile_2" : "bank_reconcile_user_detail_print_id"}
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
                <Row ref={this.setComponentRef} id="bank_reconcile_admin_detail_print_id">
                    <Col span={(this.state.isPrintTableBillingViewAdmin && this.state.isPrintTableListBillingDetailAdmin) ? 24 : 0}>

                        <TitleTableModalExport title={this.props.title!}></TitleTableModalExport>
                    </Col>
                    <Col id='bank_reconcile_2' span={this.state.isPrintTableListBillingDetailAdmin ? 24 : 0} style={{ marginTop: '10px' }} >
                        {(this.state.isPrintTableBillingViewAdmin == false && this.state.isPrintTableListBillingDetailAdmin) && <TitleTableModalExport title={this.props.title!}></TitleTableModalExport>}
                       <TableBillingDetailRFIDAdmin rfid_id_list={this.props.rfid_id_list} billing={this.props.billing} />
                    </Col>
                </Row>
            </Modal>
        )
    }
}