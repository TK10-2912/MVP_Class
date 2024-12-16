import * as React from 'react';
import { MachineDto } from '@src/services/services_autogen';
import { Button, Col, Modal, Row } from 'antd';
import ActionExport from '@src/components/ActionExport';
import moment from 'moment';
import { ColumnsDisplayType } from '@src/components/Manager/SelectedColumnDisplay/ColumnsDisplayType';
import TableMainMachineUser from './TableMainMachineUser';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';


export interface IProps {
    machineListResult: MachineDto[];
    listColumnDisplay: ColumnsDisplayType<any>;
    onCancel?: () => void;
    visible: boolean;
}

export default class ModalExportMachineUser extends React.Component<IProps> {
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
        let a = this.listColum.filter(item => item.title === "Vị trí" || item.title === "Chức năng");
        
        let sliceAmount;
        if (a.length === 2) {
          sliceAmount = 2;
        } else if (a.length === 1) {
          sliceAmount = 1;
        } else {
          sliceAmount = 1;
        }
        
        this.listColum = this.listColum.slice(0, -sliceAmount);
        
        // Nếu bạn cần cập nhật state để trigger re-render
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
                                nameFileExport={'Machine' + ' ' + moment().format('DD_MM_YYYY')}
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
                    <TableMainMachineUser
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