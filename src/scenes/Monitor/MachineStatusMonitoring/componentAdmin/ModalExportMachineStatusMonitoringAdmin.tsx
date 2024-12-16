import * as React from 'react';
import { MachineDto } from '@src/services/services_autogen';
import { Col, Modal, Row } from 'antd';
import TableMainMachineAdmin from './TableMainMachineAdmin';
import ActionExport from '@src/components/ActionExport';
import moment from 'moment';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';

export interface IProps {
    machineListResult: MachineDto[];
    onCancel?: () => void;
    visible: boolean;
    pageSize: number;
    skipCount: number;
}

export default class ModalExportMachineStatusMonitoring extends React.Component<IProps> {
    componentRef: any | null = null;
    state = {
        isLoadDone: true
    };
    setComponentRef = (ref) => {
        this.setState({ isLoadDone: false });
        this.componentRef = ref;
        this.setState({ isLoadDone: true });
    }
    render() {
        const { machineListResult } = this.props;
        return (
            <Modal
                visible={this.props.visible}
                title={
                    <Row>
                        <Col span={12}>
                            <h3>Xuất danh sách trạng thái máy bán nước</h3>
                        </Col>
                        <Col span={12} style={{ textAlign: 'end' }}>
                            <ActionExport
                                nameFileExport={'Machine ' + moment().format('DD_MM_YYYY')}
                                idPrint="machine_print_id"
                                idFooter="machine_footer_print_id"
                                isExcel={true}
                                isWord={true}
                                componentRef={this.componentRef}
                                onCancel={this.props.onCancel}
                                isDestroy={true}
                            />
                        </Col>
                    </Row>
                }
                centered
                closable={false}
                cancelButtonProps={{ style: { display: "none" } }}
                onCancel={() => { this.props.onCancel!() }}
                footer={null}
                width='90vw'
                maskClosable={false}
            >
                <Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id="machine_print_id">
                    <TitleTableModalExport title='Danh sách máy bán nước'></TitleTableModalExport>
                    <TableMainMachineAdmin
                        pagination={false}
                        machineListResult={machineListResult}
                        is_printed={true}
                    />
                </Col>
            </Modal>
        )
    }
}