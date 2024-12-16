import * as React from 'react';
import { Card, Col, Modal, Row, message } from 'antd';
import { stores } from '@src/stores/storeInitializer';
import TableReconcilelLogs from './components/TableReconcileLogsBank';
import { AttachmentItem, ReconcileLogsDto } from '@src/services/services_autogen';
import { EventTable, FileUploadType } from '@src/lib/appconst';
import FileAttachments from '@src/components/FileAttachments';
export interface Iprops {
    bi_code?: string;
}
const { confirm } = Modal;
export default class ReconcileLogs extends React.Component<Iprops> {
    state = {
        visibleExportExcel: false,
        skipCount: 0,
        visibleFile: false,
        currentPage: 1,
        pageSize: 10,
        isLoadFile:false,

    }
    reconcileLog: ReconcileLogsDto = new ReconcileLogsDto();

    async componentDidMount() {
        this.getAll();
    }
    handleSubmitSearch = async () => {
        this.onChangePage(1, 10);
    }
    onChangePage = async (page: number, pagesize?: number) => {
        if (pagesize !== undefined) {
            await this.setState({ pageSize: pagesize! });
        }
        this.setState({ skipCount: (page - 1) * this.state.pageSize, currentPage: page }, async () => {
            this.getAll();
        })
    }
    getAll = async () => {
        this.setState({ isLoadDone: false });
        await stores.reconcileLogsStore.getAll(this.props.bi_code, this.state.skipCount, this.state.pageSize);
        this.setState({ isLoadDone: true });

    }
    getSuccess = async () => {
        await this.getAll();
    }
    actionTableBilling = async (input: ReconcileLogsDto, event: EventTable) => {
        if (event == EventTable.View) {
            this.reconcileLog.init(input)
            await this.setState({isLoadFile: !this.state.isLoadFile});
            if(input!= undefined && input.fi_id_list != undefined &&input.fi_id_list.length <= 0)
            {   
                message.warning("Không có file thông tin !")
            }
            else  this.setState({  visibleFile: true,});
           this.setState({isLoadFile: !this.state.isLoadFile})
          
        }
    }
    render() {
        const { reconcileLogsListDto, totalLogReconcile } = stores.reconcileLogsStore;
        const self = this;
        return (
            <Card>
                <Row >
                    <Col span={12}>
                        <h2>Lịch sử đối soát của mã hóa đơn : {this.props.bi_code}</h2>
                    </Col>
                </Row>
                <TableReconcilelLogs
                    reconcileLogsList={reconcileLogsListDto}
                    hasAction={true}
                    actionTable={this.actionTableBilling}
                    bi_code={this.props.bi_code!=undefined ? this.props.bi_code:""}
                    pagination={{
                        pageSize: this.state.pageSize,
                        total: totalLogReconcile,
                        current: this.state.currentPage,
                        showTotal: (tot) => ("Tổng: ") + tot + "",
                        showQuickJumper: true,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        onShowSizeChange(current: number, size: number) {
                            self.onChangePage(current, size)
                        },
                        onChange: (page: number, pagesize?: number) => self.onChangePage(page, pagesize)
                    }}
                />
                <Modal
                    visible={this.state.visibleFile}
                    onCancel={()=> this.setState({visibleFile:false})}
                    closable={true}
                    footer={false}
                    title={"Danh sách file dữ liệu"}
                    maskClosable={false}
                    >
                <FileAttachments
                        files={self.reconcileLog.fi_id_list}
                        isLoadFile={this.state.isLoadFile}
                        allowRemove={false}
                        isMultiple={true}
                        componentUpload={FileUploadType.Avatar}
                        onSubmitUpdate={async (itemFile: AttachmentItem[]) => {
                            self.reconcileLog.fi_id_list = itemFile;
                        }}
                        isUpLoad={false}
                        isDownload={false}
                        showRemoveIcon={false}/>
                </Modal>
            </Card>
        )
    }
}