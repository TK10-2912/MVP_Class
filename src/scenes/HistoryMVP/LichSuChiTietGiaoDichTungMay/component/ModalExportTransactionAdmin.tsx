import ActionExport from '@src/components/ActionExport';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { TransactionByMachineDto } from '@src/services/services_autogen';
import { Col, Modal, Row } from 'antd';
import moment from 'moment';
import * as React from 'react';
import TableTransactionDetail from './TableTransactionDetail';

export interface IProps {
    listTransactionDetailDto: TransactionByMachineDto[];
    onCancel?: () => void;
    visible: boolean;
    parent?:string;
}
export default class ModalExportTransactionAdmin extends React.Component<IProps> {
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
        const { listTransactionDetailDto } = this.props;        
        return (
            <Modal
                visible={this.props.visible}
                title={
                    <Row >
                        <Col span={12}>
                            <h3>Xuất danh sách chi tiết giao dịch theo từng máy</h3>
                        </Col>
                        <Col span={12} style={{ textAlign: 'end' }}>
                            <ActionExport
                                nameFileExport={'Transaction' + ' ' + moment().format('DD_MM_YYYY')}
                                idPrint="transaction_print_id"
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
                maskClosable={true}

            >
                <Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id="transaction_print_id">
                    <TitleTableModalExport title='Danh sách chi tiết giao dịch theo từng máy'></TitleTableModalExport>
                    <TableTransactionDetail
                        pagination={false}
                        listTransactionByMachine={listTransactionDetailDto}
                        is_printed={true}
                        parent={this.props.parent}
                    />

                </Col>
            </Modal>
        )
    }
}