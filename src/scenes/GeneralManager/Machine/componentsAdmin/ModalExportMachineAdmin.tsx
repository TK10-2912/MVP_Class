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
    listColum: ColumnsDisplayType<any> = [];
    listColum1: ColumnsDisplayType<any> = [];
    setComponentRef = (ref) => {
        this.setState({ isLoadDone: false });
        this.componentRef = ref;
        this.setState({ isLoadDone: true });
    }
    componentDidMount() {
        this.listColum = this.props.listColumnDisplay.slice();
        this.filterAndSliceList();
    }

    filterAndSliceList() {
        let listFiltered = this.listColum.filter(item => item.title === "Vị trí" || item.title === "Chức năng");
        this.listColum = this.listColum.slice(0, -(listFiltered.length === 2 ? 2 : 1));
        this.setState({ listColum: this.listColum });
    }
    render() {
        const { machineListResult } = this.props;
        return (
            <Modal
                centered
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
                        listColumnDisplay={this.listColum}
                        pagination={false}
                        machineListResult={machineListResult}
                        is_printed={true}
                    />

                </Col>
            </Modal>
        )
    }
}