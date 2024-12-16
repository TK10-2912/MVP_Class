import * as React from 'react';
import { Col, Modal, Row } from 'antd';
import { SupplierDto, TrashBinDto, } from '@services/services_autogen';
import { L } from '@src/lib/abpUtility';
import ActionExport from '@src/components/ActionExport';
import moment from 'moment';
import TitleTableModalExport from '@src/components/Manager/TitleTableModalExport';
import TableTrashBin from './TableTrashBin';

export interface IProps {
  trashBinListResult?: TrashBinDto[],
  onCancel?: () => void;
  visible: boolean;
}
export default class ModalExportTrashBin extends React.Component<IProps> {
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
    const { trashBinListResult } = this.props;
    return (
      <Modal
        visible={this.props.visible}
        title={
          <Row>
            <Col span={12}>
              <h2>{L('Xuất dữ liệu') + L(' thùng rác')}</h2>
            </Col>
            <Col span={12} style={{ textAlign: 'end' }}>
              <ActionExport
                nameFileExport={'TrashBin ' + moment().format('DD_MM_YYYY HH:mm')}
                idPrint="TrashBin_print_id"
                isExcel={true}
                isWord={true}
                isDestroy={true}
                onCancel={this.props.onCancel}
                componentRef={this.componentRef}
              />
            </Col>
          </Row>
        }
        closable={false}
        footer={null}
        width='80vw'
        onCancel={this.props.onCancel}
        maskClosable={false}
      >

        <Col ref={this.setComponentRef} id='TrashBin_print_id' span={24} style={{ marginTop: '10px' }} >
          <TitleTableModalExport title='Danh sách thùng rác'></TitleTableModalExport>
          <TableTrashBin
            trashListResult={trashBinListResult!}
            pagination={false}
            isPrint
            checkExpand={false}
          />

        </Col>
      </Modal>
    )
  }
}