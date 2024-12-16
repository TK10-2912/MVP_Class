import ActionExport from '@src/components/ActionExport';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { MachineOutOfStockQueryDto } from '@src/services/services_autogen';
import { Col, Modal, Row } from 'antd';
import moment from 'moment';
import * as React from 'react';
import TableMainMachineOutOfStock from './TableMainMachineOutOfStock';
import { stores } from '@src/stores/storeInitializer';

export interface IProps {
    machineOutOfStockQueryDto: MachineOutOfStockQueryDto[];
    onCancel?: () => void;
    visible: boolean;
}

export default class ModalExportMachineOutOfStock extends React.Component<IProps> {
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
        const { machineOutOfStockQueryDto } = this.props;
        return (
            <Modal
                visible={this.props.visible}
                title={
                    <Row >
                        <Col span={12}>
                            <h3>Danh sách xuất kho {`${machineOutOfStockQueryDto.length > 0 ? "của " + stores.sessionStore.getUserNameById(machineOutOfStockQueryDto[0].us_id_operator) : ""}`}</h3>
                        </Col>
                        <Col span={12} style={{ textAlign: 'end' }}>
                            <ActionExport
                                nameFileExport={'MachineOutOfStock' + '_' + moment().format('DD_MM_YYYY')}
                                idPrint="machine_print_id"
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
                <Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id="machine_print_id">
                    <TitleTableModalExport title='Danh sách máy hết hàng'></TitleTableModalExport>
                    <TableMainMachineOutOfStock
                        pagination={false}
                        machineOutOfStockQueryDto={machineOutOfStockQueryDto}
                        is_printed={true}
                    />

                </Col>
            </Modal>
        )
    }
}