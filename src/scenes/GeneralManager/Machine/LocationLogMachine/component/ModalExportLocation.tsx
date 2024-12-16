import ActionExport from '@src/components/ActionExport';
import { ColumnsDisplayType } from '@src/components/Manager/SelectedColumnDisplay/ColumnsDisplayType';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import {  MachineLocationLogDto } from '@src/services/services_autogen';
import { Col, Modal, Row } from 'antd';
import moment from 'moment';
import * as React from 'react';
import TableLocationLogMachine from './TableLocationLogMachine';

export interface IProps {
    listResult: MachineLocationLogDto[];
    onCancel?: () => void;
    visible: boolean;
}

export default class ModalExportLocation extends React.Component<IProps> {
    componentRef: any | null = null;
    state = {
        isLoadDone: true,
    };
    listColum: ColumnsDisplayType<any> = [];
    listColum1: ColumnsDisplayType<any> = [];
    setComponentRef = (ref) => {
        this.setState({ isLoadDone: false });
        this.componentRef = ref;
        this.setState({ isLoadDone: true });
    }
    render() {
        const { listResult } = this.props;
        return (
            <Modal
                centered
                visible={this.props.visible}
                title={
                    <Row >
                        <Col span={12}>
                            <h3>Xuất danh sách lịch sử đặt máy</h3>
                        </Col>
                        <Col span={12} style={{ textAlign: 'end' }}>
                            <ActionExport
                                nameFileExport={'machine_location ' + moment().format('DD_MM_YYYY')}
                                idPrint="machine_location"
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
                    <TitleTableModalExport title='Danh sách lịch sử đặt máy'></TitleTableModalExport>
                    <TableLocationLogMachine
                        listResult={listResult}
                        pagination={false}
                    />
                </Col>
            </Modal>
        )
    }
}