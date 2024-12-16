import ActionExport from '@src/components/ActionExport';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import { ExportRepositoryDto, MachineOutOfStockQueryDto } from '@src/services/services_autogen';
import { Col, Modal, Row } from 'antd';
import moment from 'moment';
import * as React from 'react';
import ExportRepositoryTable from './ExportRepositoryTableAdmin';

export interface IProps {
    repository: ExportRepositoryDto[];
    onCancel?: () => void;
    visible: boolean;
    currentPage: number;
    pageSize: number;
}

export default class ModalExportRepository extends React.Component<IProps> {
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
        const { repository } = this.props;
        return (
            <Modal
                visible={this.props.visible}
                title={
                    <Row >
                        <Col span={12}>
                            <h3>Danh sách xuất kho</h3>
                        </Col>
                        <Col span={12} style={{ textAlign: 'end' }}>
                            <ActionExport
                                nameFileExport={'export_repository' + '_' + moment().format('DD_MM_YYYY')}
                                idPrint="export_repository_id"
                                isExcel={true}
                                isWord={true}
                                componentRef={this.componentRef}
                                onCancel={this.props.onCancel}
                                isDestroy={true}
                                idFooter='exportRepositoryTableAdmin'
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
                <Col ref={this.setComponentRef} span={24} style={{ marginTop: '10px' }} id="export_repository_id">
                    <TitleTableModalExport title='Danh sách xuất kho lưu trữ'></TitleTableModalExport>
                    <ExportRepositoryTable
                        pageSize={this.props.pageSize}
                        currentPage={this.props.currentPage}
                        isPrint
                        pagination={false}
                        repository={repository}
                    />

                </Col>
            </Modal>
        )
    }
}