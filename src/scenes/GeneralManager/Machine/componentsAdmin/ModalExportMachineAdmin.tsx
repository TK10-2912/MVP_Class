import ActionExport from '@src/components/ActionExport';
import { ColumnsDisplayType } from '@src/components/Manager/SelectedColumnDisplay/ColumnsDisplayType';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { MachineDto } from '@src/services/services_autogen';
import { Col, Modal, Row } from 'antd';
import moment from 'moment';
import * as React from 'react';
import TableMainMachineAdmin from './TableMainMachineAdmin';


export interface IProps {
    machineListResult: MachineDto[];
    listColumnDisplay: ColumnsDisplayType<any>;
    onCancel?: () => void;
    visible: boolean;
}

export default class ModalExportMachineAdmin extends React.Component<IProps> {
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
        const { machineListResult, listColumnDisplay } = this.props;
        return (
            <Modal
                visible={this.props.visible}
                title={
                    <Row >
                        <Col span={12}>
                            <h3>Xuất danh sách máy bán nước</h3>
                        </Col>
                        <Col span={12} style={{ textAlign: 'end' }}>
                            <ActionExport
                                nameFileExport={'Machine ' + moment().format('DD_MM_YYYY')}
                                idPrint="machine_print_id"
                                isExcel={true}
                                isWord={true}
                                isDestroy={true}
                                onCancel={() => this.props.onCancel!()}
                                componentRef={this.componentRef}
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
                    <TitleTableModalExport title='Danh sách máy bán nước'></TitleTableModalExport>
                    <TableMainMachineAdmin
                        listColumnDisplay={listColumnDisplay}
                        pagination={false}
                        machineListResult={machineListResult}
                        is_printed={true}
                    />

                </Col>
            </Modal>
        )
    }
}