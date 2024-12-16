import ActionExport from '@src/components/ActionExport';
import { BillingDto } from '@src/services/services_autogen';
import { Col, Modal, Row } from 'antd';
import moment from 'moment';
import * as React from 'react';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import TableBillingCashViewAdmin from './TableBillingCashViewAdmin';

export interface IProps {
    billListResult: BillingDto[];
    onCancel?: () => void;
    visible: boolean;
    title?: string;
    listId: number [];
}

export default class ModalExportCashDetailListBill  extends React.Component<IProps> {
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
                            <h3>Xuất danh sách hóa đơn đối soát với hệ thống</h3>
                        </Col>
                        <Col span={12} style={{ textAlign: 'end' }}>
                            <ActionExport
                                nameFileExport={'bank_reconcile_user_detal' + ' ' + moment().format('DD_MM_YYYY')}
                                idPrint={"hoadondoisoathethong"}
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
                <Row ref={this.setComponentRef} id="hoadondoisoathethong">
                    <Col span={24}>

                        <TitleTableModalExport title={this.props.title!}></TitleTableModalExport>
                    </Col>
                    <Col span={ 24 } style={{ marginTop: '10px' }} >
                        < TableBillingCashViewAdmin
                            billListResult={this.props.billListResult}
                            pagination={false}
                            hasAction={false}
                            listIdBill={this.props.listId}
                        />
                    </Col>
                    
                </Row>
            </Modal>
        )
    }
}